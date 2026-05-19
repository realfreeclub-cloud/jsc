import { Request, Response } from 'express';
import Exam from '../models/Exam';
import Question from '../models/Question';

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

// Create exam
export const createExam = async (req: Request, res: Response) => {
  try {
    const newExam = await Exam.create(req.body);
    res.status(201).json({ status: 'success', data: { exam: newExam } });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Update exam
export const updateExam = async (req: Request, res: Response) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!exam) return res.status(404).json({ status: 'fail', message: 'Exam not found' });
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
