import express from 'express';
import {
  getAvailableExams,
  startExam,
  getQuestionsForAttempt,
  submitExam,
  getAttemptResult
} from '../controllers/studentExamsController';
import { studentAuth } from '../middleware/studentAuthMiddleware';

const router = express.Router();

router.use(studentAuth);

router.get('/available', getAvailableExams);
router.post('/start', startExam);
router.get('/attempt/:attemptId/questions', getQuestionsForAttempt);
router.post('/attempt/:attemptId/submit', submitExam);
router.get('/attempt/:attemptId/result', getAttemptResult);

export default router;
