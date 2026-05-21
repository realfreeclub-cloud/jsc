import { Request, Response } from 'express';
import TestEnrollment from '../models/TestEnrollment';
import Exam from '../models/Exam';
import User from '../models/User';
import APIFeatures from '../utils/apiFeatures';

// POST /api/v1/test-enrollments/enroll
export const requestEnrollment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { examId } = req.body;
    const userId = (req as any).user._id;

    if (!examId) {
      return res.status(400).json({ status: 'fail', message: 'Exam ID is required.' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ status: 'fail', message: 'Exam not found.' });
    }

    // Check if enrollment already exists
    const existingEnrollment = await TestEnrollment.findOne({ user: userId, exam: examId });
    if (existingEnrollment) {
      if (existingEnrollment.status === 'active') {
        return res.status(400).json({
          status: 'fail',
          message: 'You are already enrolled in this test series with active access.'
        });
      } else if (existingEnrollment.status === 'pending') {
        const whatsappNumber = exam.whatsappNumber || '919450614241';
        const defaultMsg = `Hi Judicial Study Centre, I want to enroll in the "${exam.title}" test series. My registered email is ${(req as any).user.email}.`;
        const customMsg = exam.whatsappEnrollmentMessage ? exam.whatsappEnrollmentMessage.replace('[email]', (req as any).user.email).replace('[phone]', (req as any).user.phone || '') : defaultMsg;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(customMsg)}`;
        return res.status(200).json({
          status: 'success',
          message: 'Your enrollment request is pending admin manual activation.',
          data: existingEnrollment,
          whatsappUrl
        });
      }
    }

    // If exam is Free, auto-activate
    if (exam.accessType === 'free') {
      const enrollment = await TestEnrollment.create({
        user: userId,
        exam: examId,
        status: 'active',
        activatedAt: new Date(),
        isLifetime: true
      });

      return res.status(201).json({
        status: 'success',
        message: 'Enrolled successfully! Active access granted.',
        data: enrollment
      });
    } else {
      // Paid test series: status is pending
      const enrollment = await TestEnrollment.create({
        user: userId,
        exam: examId,
        status: 'pending'
      });

      const whatsappNumber = exam.whatsappNumber || '919450614241';
      const defaultMsg = `Hi Judicial Study Centre, I want to enroll in the "${exam.title}" test series. My registered email is ${(req as any).user.email}.`;
      const customMsg = exam.whatsappEnrollmentMessage ? exam.whatsappEnrollmentMessage.replace('[email]', (req as any).user.email).replace('[phone]', (req as any).user.phone || '') : defaultMsg;
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(customMsg)}`;

      return res.status(201).json({
        status: 'success',
        message: 'Enrollment initiated. Please complete payment via WhatsApp.',
        data: enrollment,
        whatsappUrl
      });
    }
  } catch (err: any) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

// GET /api/v1/test-enrollments/my-enrollments
export const getMyTestEnrollments = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user._id;

    const enrollments = await TestEnrollment.find({ user: userId })
      .populate('exam')
      .lean();

    return res.status(200).json({
      status: 'success',
      results: enrollments.length,
      data: enrollments
    });
  } catch (err: any) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

// GET /api/v1/test-enrollments (Admin only)
export const getAllEnrollments = async (req: Request, res: Response): Promise<any> => {
  try {
    const features = new APIFeatures(TestEnrollment.find(), req.query)
      .filter()
      .sort()
      .paginate();

    const enrollments = await features.query
      .populate('user', 'name email phone role')
      .populate('exam', 'title accessType pricing discountedPrice durationMinutes totalMarks')
      .lean();

    const totalFeatures = new APIFeatures(TestEnrollment.find(), req.query).filter();
    const totalCount = await totalFeatures.query.countDocuments();

    return res.status(200).json({
      status: 'success',
      results: enrollments.length,
      totalCount,
      data: enrollments
    });
  } catch (err: any) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

// PATCH /api/v1/test-enrollments/:id/status (Admin only)
export const updateEnrollmentStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status, isLifetime, expiryDate, paymentNotes } = req.body; // status: 'active' | 'rejected' | 'pending' | 'expired'

    if (!['active', 'rejected', 'pending', 'expired'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid status parameter.' });
    }

    const enrollment = await TestEnrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({ status: 'fail', message: 'Enrollment not found.' });
    }

    enrollment.status = status;
    if (paymentNotes !== undefined) {
      enrollment.paymentNotes = paymentNotes;
    }

    if (status === 'active') {
      enrollment.activatedAt = new Date();
      enrollment.isLifetime = !!isLifetime;
      
      if (isLifetime) {
        enrollment.expiryDate = undefined;
      } else if (expiryDate) {
        enrollment.expiryDate = new Date(expiryDate);
      } else {
        // Compute from exam duration
        const exam = await Exam.findById(enrollment.exam);
        if (exam && exam.accessDuration) {
          const exp = new Date();
          exp.setDate(exp.getDate() + exam.accessDuration);
          enrollment.expiryDate = exp;
        } else {
          // Default to lifetime if exam doesn't have accessDuration
          enrollment.isLifetime = true;
          enrollment.expiryDate = undefined;
        }
      }
    }
    
    await enrollment.save();

    return res.status(200).json({
      status: 'success',
      message: `Test enrollment status updated to ${status}.`,
      data: enrollment
    });
  } catch (err: any) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};
