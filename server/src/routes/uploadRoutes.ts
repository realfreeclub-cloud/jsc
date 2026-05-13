import express from 'express';
import { upload } from '../utils/upload';
import ProtectedRoute from '../middleware/authMiddleware';

const router = express.Router();

// @ts-ignore
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'Please upload a file' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(200).json({
      status: 'success',
      url: fileUrl
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
