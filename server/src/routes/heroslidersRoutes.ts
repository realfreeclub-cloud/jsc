import express from 'express';
import * as controller from '../controllers/herosliderController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);

// Protected Admin Routes
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', controller.createOne);
router.patch('/:id', controller.updateOne);
router.delete('/:id', controller.deleteOne);

export default router;
