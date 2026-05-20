import { Request, Response, NextFunction } from 'express';
import Lesson from '../models/Lesson';
import Module from '../models/Module';
import CourseAccess from '../models/CourseAccess';
import Course from '../models/Course';
import * as factory from './factory';

export const getAll = factory.getAll(Lesson, ['title', 'description']);
export const getOne = factory.getOne(Lesson);
export const createOne = factory.createOne(Lesson);
export const updateOne = factory.updateOne(Lesson);
export const deleteOne = factory.deleteOne(Lesson);

// GET /api/v1/lessons/course/:courseId/syllabus
export const getCourseSyllabus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { courseId } = req.params;
    const reqUser = (req as any).user;
    const userId = reqUser?._id;
    const userRole = reqUser?.role;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Course not found.' });
    }

    // Verify access
    let hasAccess = false;

    if (!reqUser) {
      // Guest visitor: check if course is Free
      hasAccess = (course as any).accessType === 'Free';
    } else if (userRole === 'admin' || userRole === 'superadmin') {
      hasAccess = true;
    } else {
      // Check active enrollment access
      const access = await CourseAccess.findOne({
        user: userId,
        course: courseId,
        status: 'active'
      });

      // Verify expiration if not lifetime
      if (access) {
        if (access.isLifetime) {
          hasAccess = true;
        } else if (access.expiryDate && new Date(access.expiryDate) > new Date()) {
          hasAccess = true;
        }
      }

      // Free courses are always accessible to logged-in users too
      if (!hasAccess && (course as any).accessType === 'Free') {
        hasAccess = true;
      }
    }

    // Fetch modules and lessons
    const modules = await Module.find({ course: courseId, isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
    const lessons = await Lesson.find({ course: courseId, isActive: true }).sort({ order: 1, createdAt: 1 }).lean();

    // Map lessons into modules
    const syllabus = modules.map((mod: any) => {
      const moduleLessons = lessons
        .filter((lesson: any) => lesson.module.toString() === mod._id.toString())
        .map((lesson: any) => {
          // If no access and not a preview lesson, redact the links
          if (!hasAccess && !lesson.isPreview) {
            return {
              ...lesson,
              videoUrl: undefined,
              pdfUrl: undefined,
              isLocked: true
            };
          }
          return {
            ...lesson,
            isLocked: false
          };
        });

      return {
        ...mod,
        lessons: moduleLessons
      };
    });

    return res.status(200).json({
      status: 'success',
      hasAccess,
      data: syllabus
    });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: (err as any).message });
  }
};
