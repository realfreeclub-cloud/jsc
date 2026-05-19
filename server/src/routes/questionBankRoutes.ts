import express from 'express';
import { protect } from '../middleware/auth';
import * as controller from '../controllers/questionBankController';

const router = express.Router();

router.use(protect);

router.post('/bulk', controller.bulkCreate);
router.route('/')
  .get(controller.getAll)
  .post(controller.createOne);

router.route('/:id')
  .patch(controller.updateOne)
  .delete(controller.deleteOne);

export default router;
