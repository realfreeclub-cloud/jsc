import express from 'express';
import * as controller from '../controllers/galleryController';
import { protect, restrictTo, optionalProtect } from '../middleware/auth';

const router = express.Router();

router.get('/', optionalProtect, controller.getAll);
router.get('/:id', optionalProtect, controller.getOne);

// Protected Admin Routes
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', controller.createOne);
router.patch('/:id', controller.updateOne);
router.delete('/:id', controller.deleteOne);

export default router;
