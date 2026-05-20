import express from 'express';
import * as controller from '../controllers/enrollmentController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/enroll', controller.enroll);
router.get('/my-enrollments', controller.getMyEnrollments);

// Admin Only Routes
router.use(restrictTo('admin'));
router.get('/', controller.getAllEnrollments);
router.patch('/:id/status', controller.updateEnrollmentStatus);

export default router;
