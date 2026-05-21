import express from 'express';
import * as controller from '../controllers/testEnrollmentController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/enroll', controller.requestEnrollment);
router.get('/my-enrollments', controller.getMyTestEnrollments);

// Admin Only Routes
router.use(restrictTo('admin'));
router.get('/', controller.getAllEnrollments);
router.patch('/:id/status', controller.updateEnrollmentStatus);

export default router;
