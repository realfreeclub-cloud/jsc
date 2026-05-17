import express from 'express';
import * as controller from '../controllers/whatsappLeadController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.post('/', controller.createOne); // Public route for lead capturing

// Protected Admin Routes
router.use(protect);
router.use(restrictTo('admin'));

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.patch('/:id', controller.updateOne);
router.delete('/:id', controller.deleteOne);

export default router;
