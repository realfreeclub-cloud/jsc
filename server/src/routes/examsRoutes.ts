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
  deleteQuestion
} from '../controllers/examsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes here should be protected (Admin only typically, assuming protect middleware handles it or there is another layer. Let's assume protect is enough for admin dashboard for now as per other routes)
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
  .route('/questions/:id')
  .patch(updateQuestion)
  .delete(deleteQuestion);

export default router;
