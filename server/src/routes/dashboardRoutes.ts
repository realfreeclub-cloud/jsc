import express from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', dashboardController.getDashboardStats);

export default router;
