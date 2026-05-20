import { Request, Response, NextFunction } from 'express';
import Enrollment from '../models/Enrollment';
import CourseAccess from '../models/CourseAccess';
import Course from '../models/Course';
import User from '../models/User';
import APIFeatures from '../utils/apiFeatures';

// POST /api/v1/enrollments/enroll
export const enroll = async (req: Request, res: Response): Promise<any> => {
  try {
    const { courseId } = req.body;
    const userId = (req as any).user._id;

    if (!courseId) {
      return res.status(400).json({ status: 'fail', message: 'Course ID is required.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Course not found.' });
    }

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (existingEnrollment) {
      if (existingEnrollment.status === 'active') {
        return res.status(400).json({
          status: 'fail',
          message: 'You are already enrolled in this course with active access.'
        });
      } else if (existingEnrollment.status === 'pending') {
        // Return WhatsApp redirect info again
        const msg = `Hi Judicial Study Centre, I want to enroll in the ${course.title} program. My registered email is ${(req as any).user.email}.`;
        const whatsappUrl = `https://wa.me/919450614241?text=${encodeURIComponent(msg)}`;
        return res.status(200).json({
          status: 'success',
          message: 'Your enrollment request is pending admin manual activation.',
          data: existingEnrollment,
          whatsappUrl
        });
      }
    }

    // If course is Free, auto-activate
    if (course.accessType === 'Free') {
      const enrollment = await Enrollment.create({
        user: userId,
        course: courseId,
        status: 'active',
        activatedAt: new Date()
      });

      // Upsert CourseAccess
      await CourseAccess.findOneAndUpdate(
        { user: userId, course: courseId },
        { status: 'active', isLifetime: true },
        { upsert: true, new: true }
      );

      // Also add course to enrolledCourses list in User document for backward-compatibility
      await User.findByIdAndUpdate(userId, {
        $addToSet: { enrolledCourses: courseId }
      });

      return res.status(201).json({
        status: 'success',
        message: 'Enrolled successfully! Active access granted.',
        data: enrollment
      });
    } else {
      // Paid course: status is pending
      const enrollment = await Enrollment.create({
        user: userId,
        course: courseId,
        status: 'pending'
      });

      const msg = `Hi Judicial Study Centre, I want to enroll in the ${course.title} program. My registered email is ${(req as any).user.email}.`;
      const whatsappUrl = `https://wa.me/919450614241?text=${encodeURIComponent(msg)}`;

      return res.status(201).json({
        status: 'success',
        message: 'Enrollment initiated. Please complete validation via WhatsApp.',
        data: enrollment,
        whatsappUrl
      });
    }
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: (err as any).message });
  }
};

// GET /api/v1/enrollments/my-enrollments
export const getMyEnrollments = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user._id;

    const enrollments = await Enrollment.find({ user: userId })
      .populate({
        path: 'course',
        populate: { path: 'category' }
      })
      .lean();

    // Attach active access info
    const enrollmentsWithAccess = await Promise.all(
      enrollments.map(async (enrollment: any) => {
        if (!enrollment.course) return enrollment;
        const access = await CourseAccess.findOne({ user: userId, course: enrollment.course._id }).lean();
        return {
          ...enrollment,
          access: access || null
        };
      })
    );

    return res.status(200).json({
      status: 'success',
      results: enrollmentsWithAccess.length,
      data: enrollmentsWithAccess
    });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: (err as any).message });
  }
};

// GET /api/v1/enrollments (Admin only)
export const getAllEnrollments = async (req: Request, res: Response): Promise<any> => {
  try {
    // Populate user and course
    const features = new APIFeatures(Enrollment.find(), req.query)
      .filter()
      .sort()
      .paginate();

    const enrollments = await features.query
      .populate('user', 'name email phone role')
      .populate('course', 'title category accessType deliveryType mode')
      .lean();

    const totalFeatures = new APIFeatures(Enrollment.find(), req.query).filter();
    const totalCount = await totalFeatures.query.countDocuments();

    // Attach active access info for each enrollment
    const enrollmentsWithAccess = await Promise.all(
      enrollments.map(async (enrollment: any) => {
        if (!enrollment.user || !enrollment.course) return enrollment;
        const access = await CourseAccess.findOne({
          user: enrollment.user._id,
          course: enrollment.course._id
        }).lean();
        return {
          ...enrollment,
          access: access || null
        };
      })
    );

    return res.status(200).json({
      status: 'success',
      results: enrollmentsWithAccess.length,
      totalCount,
      data: enrollmentsWithAccess
    });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: (err as any).message });
  }
};

// PATCH /api/v1/enrollments/:id/status (Admin only)
export const updateEnrollmentStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status, isLifetime, expiryDate } = req.body; // status: 'active' | 'rejected' | 'pending' | 'expired'

    if (!['active', 'rejected', 'pending', 'expired'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid status parameter.' });
    }

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({ status: 'fail', message: 'Enrollment not found.' });
    }

    enrollment.status = status;
    if (status === 'active') {
      enrollment.activatedAt = new Date();
    }
    await enrollment.save();

    // Create/update course access
    if (status === 'active') {
      await CourseAccess.findOneAndUpdate(
        { user: enrollment.user, course: enrollment.course },
        {
          status: 'active',
          isLifetime: !!isLifetime,
          expiryDate: isLifetime ? undefined : expiryDate
        },
        { upsert: true, new: true }
      );

      // Add course to user enrolledCourses
      await User.findByIdAndUpdate(enrollment.user, {
        $addToSet: { enrolledCourses: enrollment.course }
      });
    } else {
      // Deactivate course access
      await CourseAccess.findOneAndUpdate(
        { user: enrollment.user, course: enrollment.course },
        { status: 'inactive' }
      );

      // Optionally pull course from user enrolledCourses
      await User.findByIdAndUpdate(enrollment.user, {
        $pull: { enrolledCourses: enrollment.course }
      });
    }

    return res.status(200).json({
      status: 'success',
      message: `Enrollment status updated to ${status}.`,
      data: enrollment
    });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: (err as any).message });
  }
};
