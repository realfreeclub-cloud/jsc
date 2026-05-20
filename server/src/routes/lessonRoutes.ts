import express from 'express';
import * as controller from '../controllers/lessonController';
import { protect, restrictTo, optionalProtect } from '../middleware/auth';

const router = express.Router();

// Public syllabus route — works for guests AND logged-in users
router.get('/course/:courseId/syllabus', optionalProtect, controller.getCourseSyllabus);

// All other lesson routes require login
router.use(protect);
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);

// Admin write routes
router.use(restrictTo('admin'));
router.post('/', controller.createOne);
router.patch('/:id', controller.updateOne);
router.delete('/:id', controller.deleteOne);

export default router;
