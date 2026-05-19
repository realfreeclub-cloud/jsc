import { Request, Response } from 'express';
import QuestionBank from '../models/QuestionBank';

export const getAll = async (req: Request, res: Response) => {
  try {
    const questions = await QuestionBank.find().sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: { questions } });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const createOne = async (req: Request, res: Response) => {
  try {
    const question = await QuestionBank.create(req.body);
    res.status(201).json({ status: 'success', data: { question } });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const updateOne = async (req: Request, res: Response) => {
  try {
    const question = await QuestionBank.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!question) return res.status(404).json({ status: 'fail', message: 'Not found' });
    res.status(200).json({ status: 'success', data: { question } });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const question = await QuestionBank.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ status: 'fail', message: 'Not found' });
    res.status(204).json({ status: 'success', data: null });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const bulkCreate = async (req: Request, res: Response) => {
  try {
    const questions = req.body.questions;
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ status: 'fail', message: 'Expected an array of questions' });
    }
    const createdQuestions = await QuestionBank.insertMany(questions);
    res.status(201).json({ status: 'success', data: { questions: createdQuestions } });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
