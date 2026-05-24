import express from 'express';
import { protect } from '../middleware/auth';
import * as controller from '../controllers/paperSetsController';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(controller.getAll)
  .post(controller.createOne);

router.route('/:id')
  .get(controller.getOne)
  .patch(controller.updateOne)
  .delete(controller.deleteOne);

export default router;
