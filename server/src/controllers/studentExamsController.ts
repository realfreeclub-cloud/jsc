import { Request, Response } from 'express';
import Exam from '../models/Exam';
import Question from '../models/Question';
import ExamAttempt from '../models/ExamAttempt';
import Student from '../models/Student';
import Course from '../models/Course';
import TestEnrollment from '../models/TestEnrollment';

export const getAvailableExams = async (req: Request, res: Response): Promise<any> => {
  try {
    // @ts-ignore
    const studentEmail = req.user.email;
    const student = await Student.findOne({ email: studentEmail });
    
    if (!student) {
      return res.status(404).json({ status: 'fail', message: 'Student profile not found' });
    }

    const course = await Course.findOne({ title: student.course });

    let query: any = { isActive: true };
    if (course) {
      query.$or = [
        { course: course._id },
        { course: { $exists: false } },
        { course: null }
      ];
    } else {
      query.$or = [
        { course: { $exists: false } },
        { course: null }
      ];
    }

    const exams = await Exam.find(query).sort({ createdAt: -1 });

    // Find previous attempts
    const attempts = await ExamAttempt.find({ student: student._id });
    
    // Find active/pending test series enrollments
    const userId = (req as any).user._id;
    const testEnrollments = await TestEnrollment.find({ user: userId });

    // Map exams to include attempt info and enrollment/access status
    const examsWithAttempts = exams.map(exam => {
        const examAttempts = attempts.filter(a => a.exam._id.toString() === exam._id.toString());
        
        // Find if student has registered/paid for this exam
        const enrollment = testEnrollments.find(
          e => e.exam.toString() === exam._id.toString() || 
               (e.exam as any)._id?.toString() === exam._id.toString()
        );

        const hasActiveAccess = exam.accessType === 'free' || 
          (enrollment && enrollment.status === 'active' && 
           (enrollment.isLifetime || !enrollment.expiryDate || new Date(enrollment.expiryDate) > new Date()));

        return {
            ...exam.toObject(),
            attemptsCount: examAttempts.length,
            bestScore: examAttempts.length > 0 ? Math.max(...examAttempts.map(a => a.score)) : null,
            lastAttemptStatus: examAttempts.length > 0 ? examAttempts[examAttempts.length - 1].status : null,
            lastAttemptId: examAttempts.length > 0 ? examAttempts[examAttempts.length - 1]._id : null,
            accessStatus: enrollment ? enrollment.status : 'unsubscribed',
            isLocked: exam.accessType === 'paid' && !hasActiveAccess,
            enrollmentExpiryDate: enrollment?.expiryDate || null,
            isLifetimeAccess: enrollment?.isLifetime || false
        }
    });

    res.status(200).json({ status: 'success', data: { exams: examsWithAttempts } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const startExam = async (req: Request, res: Response): Promise<any> => {
  try {
    const { examId } = req.body;
    const userId = (req as any).user._id;
    // @ts-ignore
    const studentEmail = req.user.email;
    const student = await Student.findOne({ email: studentEmail });

    if (!student) return res.status(404).json({ status: 'fail', message: 'Student profile not found' });

    const exam = await Exam.findById(examId);
    if (!exam || !exam.isActive) return res.status(404).json({ status: 'fail', message: 'Exam not found or inactive' });

    // Access control validation for Paid exams
    if (exam.accessType === 'paid') {
      const enrollment = await TestEnrollment.findOne({ user: userId, exam: examId });
      const hasAccess = enrollment && enrollment.status === 'active' && 
        (enrollment.isLifetime || !enrollment.expiryDate || new Date(enrollment.expiryDate) > new Date());
      
      if (!hasAccess) {
        const whatsappNumber = exam.whatsappNumber || '919450614241';
        const defaultMsg = `Hi Judicial Study Centre, I want to enroll in the "${exam.title}" test series. My registered email is ${studentEmail}.`;
        const customMsg = exam.whatsappEnrollmentMessage ? exam.whatsappEnrollmentMessage.replace('[email]', studentEmail).replace('[phone]', student.phone || '') : defaultMsg;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(customMsg)}`;
        
        return res.status(403).json({ 
          status: 'fail', 
          message: 'Access Denied. This is a paid Test Series. Please complete payment and wait for admin approval.',
          whatsappUrl,
          isLocked: true
        });
      }
    }

    // Check if there is already an in-progress attempt
    let attempt = await ExamAttempt.findOne({ student: student._id, exam: examId, status: 'in-progress' });
    
    if (!attempt) {
        // Verify attempts limit
        const completedAttemptsCount = await ExamAttempt.countDocuments({
            student: student._id,
            exam: examId,
            status: 'completed'
        });

        if (exam.attemptsAllowed > 0 && completedAttemptsCount >= exam.attemptsAllowed) {
            return res.status(400).json({ 
                status: 'fail', 
                message: `You have reached the maximum number of attempts allowed for this exam (${exam.attemptsAllowed}).` 
            });
        }

        attempt = await ExamAttempt.create({
            student: student._id,
            exam: examId,
            answers: []
        });
    }

    res.status(201).json({ status: 'success', data: { attempt } });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const getQuestionsForAttempt = async (req: Request, res: Response): Promise<any> => {
    try {
        const attempt = await ExamAttempt.findById(req.params.attemptId);
        if(!attempt) return res.status(404).json({ status: 'fail', message: 'Attempt not found' });
        
        const exam = await Exam.findById(attempt.exam);
        if(!exam) return res.status(404).json({ status: 'fail', message: 'Exam details not found' });

        // Fetch questions but exclude correctOptionIndex and correctOptionIndices
        let questions = await Question.find({ exam: attempt.exam })
          .select('-correctOptionIndex -correctOptionIndices')
          .lean();
        
        if (exam.shuffleQuestions) {
            // Fisher-Yates Shuffle
            for (let i = questions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [questions[i], questions[j]] = [questions[j], questions[i]];
            }
        }
        
        res.status(200).json({ status: 'success', data: { questions, attempt } });
    } catch(error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

export const submitExam = async (req: Request, res: Response): Promise<any> => {
  try {
    const { attemptId } = req.params;
    const { answers, antiCheatViolations, timeSpentSeconds } = req.body; 

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ status: 'fail', message: 'Attempt not found' });
    
    if (attempt.status === 'completed') {
        return res.status(400).json({ status: 'fail', message: 'Attempt already completed' });
    }

    const exam = await Exam.findById(attempt.exam);
    if (!exam) return res.status(404).json({ status: 'fail', message: 'Exam details not found' });

    const questions = await Question.find({ exam: attempt.exam });
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    const processedAnswers = [];

    for (const q of questions) {
        const studentAnswer = answers.find((a: any) => a.questionId === q._id.toString());
        const selectedIndex = studentAnswer ? studentAnswer.selectedOptionIndex : -1;
        const selectedIndices = studentAnswer && studentAnswer.selectedOptionIndices ? studentAnswer.selectedOptionIndices : [];

        let isCorrect = false;
        let isSkipped = false;

        if (q.questionType === 'multiple-correct') {
          isSkipped = selectedIndices.length === 0;
          const correctIndices = q.correctOptionIndices || [q.correctOptionIndex];
          const hasSameLength = selectedIndices.length === correctIndices.length;
          const allMatch = selectedIndices.every((val: number) => correctIndices.includes(val));
          isCorrect = hasSameLength && allMatch;
        } else {
          isSkipped = selectedIndex === -1;
          isCorrect = selectedIndex === q.correctOptionIndex;
        }
        
        if (isSkipped) {
            skippedCount++;
        } else if (isCorrect) {
            score += q.marks;
            correctCount++;
        } else {
            score -= (exam.negativeMarking || 0);
            incorrectCount++;
        }

        processedAnswers.push({
            question: q._id,
            selectedOptionIndex: selectedIndex,
            selectedOptionIndices: selectedIndices
        });
    }

    attempt.answers = processedAnswers as any;
    attempt.score = Math.max(0, score); // Clamp score to 0 as minimum
    attempt.correctAnswers = correctCount;
    attempt.incorrectAnswers = incorrectCount;
    attempt.skippedAnswers = skippedCount;
    attempt.timeSpentSeconds = Number(timeSpentSeconds) || 0;
    attempt.antiCheatViolations = Number(antiCheatViolations) || 0;
    attempt.isPassed = attempt.score >= exam.passingMarks;
    attempt.status = 'completed';
    attempt.submittedAt = new Date();
    
    await attempt.save();

    res.status(200).json({ status: 'success', data: { attempt } });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const getAttemptResult = async (req: Request, res: Response): Promise<any> => {
    try {
        const attempt = await ExamAttempt.findById(req.params.attemptId).populate('exam');
        if(!attempt) return res.status(404).json({ status: 'fail', message: 'Attempt not found' });

        const questions = await Question.find({ exam: attempt.exam._id });

        // Rank Calculation
        const allAttempts = await ExamAttempt.find({ exam: attempt.exam._id, status: 'completed' })
          .sort({ score: -1, timeSpentSeconds: 1 });
        
        const rank = allAttempts.findIndex(a => a._id.toString() === attempt._id.toString()) + 1;
        const totalCandidates = allAttempts.length;

        // Perform subject, topic, and section analysis
        const subjectsAnalysis: Record<string, { total: number, correct: number, incorrect: number, skipped: number, marks: number, score: number }> = {};
        const topicsAnalysis: Record<string, { subject: string, total: number, correct: number, incorrect: number, skipped: number, marks: number, score: number }> = {};
        const sectionsAnalysis: Record<string, { total: number, correct: number, incorrect: number, skipped: number, marks: number, score: number }> = {};

        for (const q of questions) {
          const studentAns = attempt.answers.find((a: any) => a.question.toString() === q._id.toString());
          const selectedIdx = studentAns ? studentAns.selectedOptionIndex : -1;
          const selectedIndices = studentAns && studentAns.selectedOptionIndices ? studentAns.selectedOptionIndices : [];
          
          let isCorrect = false;
          let isIncorrect = false;
          let isSkipped = false;

          if (q.questionType === 'multiple-correct') {
            isSkipped = selectedIndices.length === 0;
            const correctIndices = q.correctOptionIndices || [q.correctOptionIndex];
            const hasSameLength = selectedIndices.length === correctIndices.length;
            const allMatch = selectedIndices.every((val: number) => correctIndices.includes(val));
            isCorrect = hasSameLength && allMatch;
            isIncorrect = !isSkipped && !isCorrect;
          } else {
            isSkipped = selectedIdx === -1;
            isCorrect = selectedIdx === q.correctOptionIndex;
            isIncorrect = !isSkipped && !isCorrect;
          }
          
          const qScore = isCorrect ? q.marks : (isIncorrect ? -((attempt.exam as any).negativeMarking || 0) : 0);

          // Subject Analysis
          const sub = q.subject || 'General';
          if (!subjectsAnalysis[sub]) {
            subjectsAnalysis[sub] = { total: 0, correct: 0, incorrect: 0, skipped: 0, marks: 0, score: 0 };
          }
          subjectsAnalysis[sub].total += 1;
          subjectsAnalysis[sub].marks += q.marks;
          subjectsAnalysis[sub].score += qScore;
          if (isCorrect) subjectsAnalysis[sub].correct += 1;
          if (isIncorrect) subjectsAnalysis[sub].incorrect += 1;
          if (isSkipped) subjectsAnalysis[sub].skipped += 1;

          // Topic Analysis
          if (q.topic) {
            const topKey = `${sub} - ${q.topic}`;
            if (!topicsAnalysis[topKey]) {
              topicsAnalysis[topKey] = { subject: sub, total: 0, correct: 0, incorrect: 0, skipped: 0, marks: 0, score: 0 };
            }
            topicsAnalysis[topKey].total += 1;
            topicsAnalysis[topKey].marks += q.marks;
            topicsAnalysis[topKey].score += qScore;
            if (isCorrect) topicsAnalysis[topKey].correct += 1;
            if (isIncorrect) topicsAnalysis[topKey].incorrect += 1;
            if (isSkipped) topicsAnalysis[topKey].skipped += 1;
          }

          // Section Analysis
          const sec = q.section || 'General';
          if (!sectionsAnalysis[sec]) {
            sectionsAnalysis[sec] = { total: 0, correct: 0, incorrect: 0, skipped: 0, marks: 0, score: 0 };
          }
          sectionsAnalysis[sec].total += 1;
          sectionsAnalysis[sec].marks += q.marks;
          sectionsAnalysis[sec].score += qScore;
          if (isCorrect) sectionsAnalysis[sec].correct += 1;
          if (isIncorrect) sectionsAnalysis[sec].incorrect += 1;
          if (isSkipped) sectionsAnalysis[sec].skipped += 1;
        }

        // Format analysis structures
        const formattedSubjects = Object.keys(subjectsAnalysis).map(subName => {
          const stats = subjectsAnalysis[subName];
          const totalAnswered = stats.correct + stats.incorrect;
          const accuracy = totalAnswered > 0 ? Math.round((stats.correct / totalAnswered) * 100) : 0;
          return {
            subject: subName,
            ...stats,
            accuracy
          };
        });

        const formattedTopics = Object.keys(topicsAnalysis).map(topName => {
          const stats = topicsAnalysis[topName];
          const totalAnswered = stats.correct + stats.incorrect;
          const accuracy = totalAnswered > 0 ? Math.round((stats.correct / totalAnswered) * 100) : 0;
          return {
            topic: topName.substring(stats.subject.length + 3),
            ...stats,
            accuracy
          };
        });

        const formattedSections = Object.keys(sectionsAnalysis).map(secName => {
          const stats = sectionsAnalysis[secName];
          return {
            sectionName: secName,
            ...stats
          };
        });

        res.status(200).json({ 
            status: 'success', 
            data: { 
                attempt, 
                questions,
                analytics: {
                    rankInfo: { rank, totalCandidates },
                    subjectsAnalysis: formattedSubjects,
                    topicsAnalysis: formattedTopics,
                    sectionsAnalysis: formattedSections,
                    timeAnalysis: {
                        averageTimePerQuestionSeconds: questions.length > 0 ? Math.round(attempt.timeSpentSeconds / questions.length) : 0
                    }
                }
            } 
        });
    } catch(error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}
