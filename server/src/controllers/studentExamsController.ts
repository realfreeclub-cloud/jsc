import { Request, Response } from 'express';
import Exam from '../models/Exam';
import Question from '../models/Question';
import ExamAttempt from '../models/ExamAttempt';
import Student from '../models/Student';
import Course from '../models/Course';

export const getAvailableExams = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const studentEmail = req.user.email;
    const student = await Student.findOne({ email: studentEmail });
    
    if (!student) {
      return res.status(404).json({ status: 'fail', message: 'Student profile not found' });
    }

    // Assuming student.course is the course name. Let's find the Course by title first if needed, 
    // or we can fetch exams where the course matches the student's enrolled course.
    // If student.course is just a string, we need to match it with Course title.
    const course = await Course.findOne({ title: student.course });

    let query: any = { isActive: true };
    if (course) {
      query.course = course._id;
    }

    const exams = await Exam.find(query).sort({ createdAt: -1 });

    // Find previous attempts
    const attempts = await ExamAttempt.find({ student: student._id });
    
    // Map exams to include attempt info
    const examsWithAttempts = exams.map(exam => {
        const examAttempts = attempts.filter(a => a.exam._id.toString() === exam._id.toString());
        return {
            ...exam.toObject(),
            attemptsCount: examAttempts.length,
            bestScore: examAttempts.length > 0 ? Math.max(...examAttempts.map(a => a.score)) : null,
            lastAttemptStatus: examAttempts.length > 0 ? examAttempts[examAttempts.length - 1].status : null,
            lastAttemptId: examAttempts.length > 0 ? examAttempts[examAttempts.length - 1]._id : null
        }
    });

    res.status(200).json({ status: 'success', data: { exams: examsWithAttempts } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const startExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.body;
    // @ts-ignore
    const studentEmail = req.user.email;
    const student = await Student.findOne({ email: studentEmail });

    if (!student) return res.status(404).json({ status: 'fail', message: 'Student profile not found' });

    const exam = await Exam.findById(examId);
    if (!exam || !exam.isActive) return res.status(404).json({ status: 'fail', message: 'Exam not found or inactive' });

    // Check if there is already an in-progress attempt
    let attempt = await ExamAttempt.findOne({ student: student._id, exam: examId, status: 'in-progress' });
    
    if (!attempt) {
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

export const getQuestionsForAttempt = async (req: Request, res: Response) => {
    try {
        const attempt = await ExamAttempt.findById(req.params.attemptId);
        if(!attempt) return res.status(404).json({ status: 'fail', message: 'Attempt not found' });
        
        // Fetch questions but exclude correctOptionIndex
        const questions = await Question.find({ exam: attempt.exam }).select('-correctOptionIndex');
        
        res.status(200).json({ status: 'success', data: { questions, attempt } });
    } catch(error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

export const submitExam = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body; // Array of { questionId, selectedOptionIndex }

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ status: 'fail', message: 'Attempt not found' });
    
    if (attempt.status === 'completed') {
        return res.status(400).json({ status: 'fail', message: 'Attempt already completed' });
    }

    const questions = await Question.find({ exam: attempt.exam });
    let score = 0;
    const processedAnswers = [];

    for (const q of questions) {
        const studentAnswer = answers.find((a: any) => a.questionId === q._id.toString());
        const selectedIndex = studentAnswer ? studentAnswer.selectedOptionIndex : -1;
        
        if (selectedIndex === q.correctOptionIndex) {
            score += q.marks;
        }

        processedAnswers.push({
            question: q._id,
            selectedOptionIndex: selectedIndex
        });
    }

    attempt.answers = processedAnswers as any;
    attempt.score = score;
    attempt.status = 'completed';
    attempt.submittedAt = new Date();
    
    await attempt.save();

    res.status(200).json({ status: 'success', data: { attempt } });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const getAttemptResult = async (req: Request, res: Response) => {
    try {
        const attempt = await ExamAttempt.findById(req.params.attemptId).populate('exam');
        if(!attempt) return res.status(404).json({ status: 'fail', message: 'Attempt not found' });

        const questions = await Question.find({ exam: attempt.exam._id });

        res.status(200).json({ status: 'success', data: { attempt, questions } });
    } catch(error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}
