import { Request, Response } from 'express';
import PaperSet from '../models/PaperSet';

export const getAll = async (req: Request, res: Response) => {
  try {
    const paperSets = await PaperSet.find().sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: { paperSets } });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const paperSet = await PaperSet.findById(req.params.id);
    if (!paperSet) return res.status(404).json({ status: 'fail', message: 'Paper Set not found' });
    res.status(200).json({ status: 'success', data: { paperSet } });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const createOne = async (req: Request, res: Response) => {
  try {
    const paperSet = await PaperSet.create(req.body);
    res.status(201).json({ status: 'success', data: { paperSet } });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const updateOne = async (req: Request, res: Response) => {
  try {
    const paperSet = await PaperSet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!paperSet) return res.status(404).json({ status: 'fail', message: 'Paper Set not found' });
    res.status(200).json({ status: 'success', data: { paperSet } });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const paperSet = await PaperSet.findByIdAndDelete(req.params.id);
    if (!paperSet) return res.status(404).json({ status: 'fail', message: 'Paper Set not found' });
    res.status(204).json({ status: 'success', data: null });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
