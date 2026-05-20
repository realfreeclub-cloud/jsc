import express from 'express';
import * as controller from '../controllers/moduleController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);

// Admin write routes
router.use(restrictTo('admin'));
router.post('/', controller.createOne);
router.patch('/:id', controller.updateOne);
router.delete('/:id', controller.deleteOne);

export default router;
