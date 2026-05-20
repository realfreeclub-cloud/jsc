import express from 'express';
import * as controller from '../controllers/lessonProgressController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/track', controller.trackProgress);
router.get('/course/:courseId', controller.getCourseProgress);

export default router;
