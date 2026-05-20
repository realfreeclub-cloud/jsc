import express from 'express';
import * as controller from '../controllers/demoSessionController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

// Public route - anyone can browse published sessions
router.get('/public', controller.getPublicSessions);

// Protected Admin Routes
router.use(protect);
router.use(restrictTo('admin'));

router.get('/', controller.getAllSessions);
router.get('/:id', controller.getSession);
router.post('/', controller.createSession);
router.patch('/:id', controller.updateSession);
router.delete('/:id', controller.deleteSession);

export default router;
