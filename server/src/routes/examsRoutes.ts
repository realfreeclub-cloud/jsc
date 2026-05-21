import express from 'express';
import {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  getExamQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  importQuestions,
  autoGenerateExamQuestions
} from '../controllers/examsController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes here should be protected
router.use(protect);

router
  .route('/')
  .get(getExams)
  .post(createExam);

router
  .route('/:id')
  .get(getExam)
  .patch(updateExam)
  .delete(deleteExam);

// Question routes nested under exams
router
  .route('/:examId/questions')
  .get(getExamQuestions)
  .post(addQuestion);

router
  .route('/:examId/questions/import')
  .post(importQuestions);

router
  .route('/:examId/auto-generate')
  .post(autoGenerateExamQuestions);

router
  .route('/questions/:id')
  .patch(updateQuestion)
  .delete(deleteQuestion);

export default router;
