import { Request, Response } from 'express';
import Exam from '../models/Exam';
import Question from '../models/Question';
import QuestionBank from '../models/QuestionBank';
import PaperSet from '../models/PaperSet';

// Get all exams
export const getExams = async (req: Request, res: Response) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: exams.length, data: { exams } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get single exam
export const getExam = async (req: Request, res: Response) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ status: 'fail', message: 'Exam not found' });
    res.status(200).json({ status: 'success', data: { exam } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const syncPaperSetQuestions = async (examId: string, paperSetId: string): Promise<number> => {
  const paperSet = await PaperSet.findById(paperSetId).populate('questions');
  if (!paperSet) return 0;

  // Delete existing questions of the exam
  await Question.deleteMany({ exam: examId });

  // Clone paper set questions into Question collection (filter out any null/undefined questions)
  const validQuestions = (paperSet.questions || []).filter((q: any) => q && q.text);
  const newQuestions = validQuestions.map((q: any) => ({
    exam: examId,
    section: '',
    subject: q.subject,
    topic: q.topic,
    chapter: q.chapter,
    text: q.text,
    textHindi: q.textHindi,
    options: q.options || [],
    optionsHindi: q.optionsHindi || [],
    correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
    correctOptionIndices: q.correctOptionIndices || [],
    marks: q.marks || 1,
    negativeMarks: q.negativeMarks || 0,
    explanation: q.explanation,
    explanationImage: q.explanationImage,
    explanationVideoUrl: q.explanationVideoUrl,
    difficultyLevel: q.difficultyLevel || 'medium',
    imageUrl: q.imageUrl,
    questionType: q.questionType || 'single-correct',
    estimatedSolveTime: q.estimatedSolveTime,
    tags: q.tags,
    faculty: q.faculty,
    course: q.course,
    paragraphText: q.paragraphText,
    matchPairs: q.matchPairs,
    assertion: q.assertion,
    reason: q.reason
  }));

  if (newQuestions.length > 0) {
    await Question.insertMany(newQuestions);
  }

  const totalMarks = newQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
  return totalMarks;
};

const sanitizeExamData = (body: Record<string, any>) => {
  const data = { ...body };
  if (!data.accessType || data.accessType === '') data.accessType = 'free';
  if (data.pricing === '' || data.pricing === null || data.pricing === undefined) data.pricing = 0;
  if (data.discountedPrice === '' || data.discountedPrice === null || data.discountedPrice === undefined) data.discountedPrice = 0;
  if (data.negativeMarks === '' || data.negativeMarks === null || data.negativeMarks === undefined) data.negativeMarks = 0;
  if (data.negativeMarking === '' || data.negativeMarking === null || data.negativeMarking === undefined) data.negativeMarking = 0;
  if (data.attemptsAllowed === '' || data.attemptsAllowed === null || data.attemptsAllowed === undefined) data.attemptsAllowed = 1;
  if (data.durationMinutes === '' || data.durationMinutes === null || data.durationMinutes === undefined) data.durationMinutes = 60;
  if (data.passingMarks === '' || data.passingMarks === null || data.passingMarks === undefined) data.passingMarks = 0;
  if (data.course === '' || data.course === undefined) data.course = null;
  if (data.paperSet === '' || data.paperSet === undefined) data.paperSet = null;
  return data;
};

// Create exam
export const createExam = async (req: Request, res: Response) => {
  try {
    const payload = sanitizeExamData(req.body);
    const newExam = await Exam.create(payload);
    
    if (payload.paperSet) {
      const totalMarks = await syncPaperSetQuestions(newExam._id.toString(), payload.paperSet);
      newExam.totalMarks = totalMarks;
      await newExam.save();
    }

    res.status(201).json({ status: 'success', data: { exam: newExam } });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Update exam
export const updateExam = async (req: Request, res: Response) => {
  try {
    const payload = sanitizeExamData(req.body);
    const exam = await Exam.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });
    if (!exam) return res.status(404).json({ status: 'fail', message: 'Exam not found' });
    
    if (payload.paperSet) {
      const totalMarks = await syncPaperSetQuestions(exam._id.toString(), payload.paperSet);
      exam.totalMarks = totalMarks;
      await exam.save();
    }

    res.status(200).json({ status: 'success', data: { exam } });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Delete exam
export const deleteExam = async (req: Request, res: Response) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ status: 'fail', message: 'Exam not found' });
    
    // Also delete associated questions
    await Question.deleteMany({ exam: req.params.id });
    
    res.status(204).json({ status: 'success', data: null });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- Question Controllers ---

// Get questions for an exam
export const getExamQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await Question.find({ exam: req.params.examId });
    res.status(200).json({ status: 'success', results: questions.length, data: { questions } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Add question to exam
export const addQuestion = async (req: Request, res: Response) => {
  try {
    req.body.exam = req.params.examId;
    const newQuestion = await Question.create(req.body);
    
    // Update total marks of exam
    const exam = await Exam.findById(req.params.examId);
    if(exam) {
        exam.totalMarks += newQuestion.marks;
        await exam.save();
    }

    res.status(201).json({ status: 'success', data: { question: newQuestion } });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Update question
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const oldQuestion = await Question.findById(req.params.id);
    if (!oldQuestion) return res.status(404).json({ status: 'fail', message: 'Question not found' });
    
    const marksDifference = (req.body.marks || oldQuestion.marks) - oldQuestion.marks;
    
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (marksDifference !== 0) {
        const exam = await Exam.findById(oldQuestion.exam);
        if(exam) {
            exam.totalMarks += marksDifference;
            await exam.save();
        }
    }

    res.status(200).json({ status: 'success', data: { question } });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Delete question
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ status: 'fail', message: 'Question not found' });
    
    const exam = await Exam.findById(question.exam);
    if(exam) {
        exam.totalMarks -= question.marks;
        await exam.save();
    }

    res.status(204).json({ status: 'success', data: null });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Import questions in bulk
export const importQuestions = async (req: Request, res: Response) => {
  try {
    const examId = req.params.examId;
    const questionsToImport = req.body.questions;

    if (!questionsToImport || !Array.isArray(questionsToImport)) {
      return res.status(400).json({ status: 'fail', message: 'Expected an array of questions' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ status: 'fail', message: 'Exam not found' });

    let totalMarksAdded = 0;
    const newQuestions = questionsToImport.map((q: any) => {
      totalMarksAdded += q.marks || 1;
      return {
        exam: examId,
        section: q.section || '',
        subject: q.subject,
        topic: q.topic,
        chapter: q.chapter,
        text: q.text,
        textHindi: q.textHindi,
        options: q.options,
        optionsHindi: q.optionsHindi,
        correctOptionIndex: q.correctOptionIndex,
        correctOptionIndices: q.correctOptionIndices,
        marks: q.marks || 1,
        negativeMarks: q.negativeMarks || 0,
        explanation: q.explanation,
        explanationImage: q.explanationImage,
        explanationVideoUrl: q.explanationVideoUrl,
        difficultyLevel: q.difficultyLevel || 'medium',
        imageUrl: q.imageUrl,
        questionType: q.questionType || 'single-correct',
        estimatedSolveTime: q.estimatedSolveTime,
        tags: q.tags,
        faculty: q.faculty,
        course: q.course,
        paragraphText: q.paragraphText,
        matchPairs: q.matchPairs,
        assertion: q.assertion,
        reason: q.reason
      };
    });

    const createdQuestions = await Question.insertMany(newQuestions);

    exam.totalMarks += totalMarksAdded;
    await exam.save();

    res.status(201).json({ status: 'success', data: { questions: createdQuestions } });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Auto-generate random questions from question bank
export const autoGenerateExamQuestions = async (req: Request, res: Response): Promise<any> => {
  try {
    const examId = req.params.examId;
    const { subject, topic, difficultyLevel, count, section } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ status: 'fail', message: 'Exam not found' });

    const matchStage: any = { status: 'active' };
    if (subject) matchStage.subject = subject;
    if (topic) matchStage.topic = topic;
    if (difficultyLevel) matchStage.difficultyLevel = difficultyLevel;

    // Use aggregate with sample to fetch random questions
    const sampleQuestions = await QuestionBank.aggregate([
      { $match: matchStage },
      { $sample: { size: Number(count) || 10 } }
    ]);

    if (sampleQuestions.length === 0) {
      return res.status(400).json({ 
        status: 'fail', 
        message: 'No questions matching these filters were found in the Question Bank.' 
      });
    }

    let totalMarksAdded = 0;
    const newQuestions = sampleQuestions.map((q: any) => {
      totalMarksAdded += q.marks || 1;
      return {
        exam: examId,
        section: section || '',
        subject: q.subject,
        topic: q.topic,
        chapter: q.chapter,
        text: q.text,
        textHindi: q.textHindi,
        options: q.options,
        optionsHindi: q.optionsHindi,
        correctOptionIndex: q.correctOptionIndex,
        correctOptionIndices: q.correctOptionIndices,
        marks: q.marks || 1,
        negativeMarks: q.negativeMarks || 0,
        explanation: q.explanation,
        explanationImage: q.explanationImage,
        explanationVideoUrl: q.explanationVideoUrl,
        difficultyLevel: q.difficultyLevel,
        imageUrl: q.imageUrl,
        questionType: q.questionType,
        estimatedSolveTime: q.estimatedSolveTime,
        tags: q.tags,
        faculty: q.faculty,
        course: q.course,
        paragraphText: q.paragraphText,
        matchPairs: q.matchPairs,
        assertion: q.assertion,
        reason: q.reason
      };
    });

    const createdQuestions = await Question.insertMany(newQuestions);

    exam.totalMarks += totalMarksAdded;
    await exam.save();

    return res.status(201).json({
      status: 'success',
      count: createdQuestions.length,
      data: { questions: createdQuestions }
    });
  } catch (error: any) {
    return res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Get public exams (active metadata only)
export const getPublicExams = async (req: Request, res: Response) => {
  try {
    const exams = await Exam.find({ isActive: true })
      .select('title description durationMinutes totalMarks accessType pricing discountedPrice course paperSet')
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: exams.length, data: { exams } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
