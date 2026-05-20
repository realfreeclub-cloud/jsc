import { Request, Response } from 'express';
import DemoSession from '../models/DemoSession';

// ─── Public Endpoints ──────────────────────────────────────────────────────

// Get all published sessions (public)
export const getPublicSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await DemoSession.find({ isPublished: true }).sort({ scheduleDate: 1, createdAt: -1 });
    res.status(200).json({ status: 'success', results: sessions.length, data: { sessions } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─── Admin Endpoints ───────────────────────────────────────────────────────

// Get all sessions
export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await DemoSession.find().sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: sessions.length, data: { sessions } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get single session
export const getSession = async (req: Request, res: Response) => {
  try {
    const session = await DemoSession.findById(req.params.id);
    if (!session) return res.status(404).json({ status: 'fail', message: 'Session not found' });
    res.status(200).json({ status: 'success', data: { session } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create session
export const createSession = async (req: Request, res: Response) => {
  try {
    const newSession = await DemoSession.create(req.body);
    res.status(201).json({ status: 'success', data: { session: newSession } });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Update session
export const updateSession = async (req: Request, res: Response) => {
  try {
    const session = await DemoSession.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!session) return res.status(404).json({ status: 'fail', message: 'Session not found' });
    res.status(200).json({ status: 'success', data: { session } });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Delete session
export const deleteSession = async (req: Request, res: Response) => {
  try {
    const session = await DemoSession.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ status: 'fail', message: 'Session not found' });
    res.status(204).json({ status: 'success', data: null });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
