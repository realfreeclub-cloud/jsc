import { Request, Response } from 'express';
import LessonProgress from '../models/LessonProgress';
import Lesson from '../models/Lesson';

// POST /api/v1/lesson-progress/track
export const trackProgress = async (req: Request, res: Response): Promise<any> => {
  try {
    const { courseId, lessonId, completed, watchProgress } = req.body;
    const userId = (req as any).user._id;

    if (!courseId || !lessonId) {
      return res.status(400).json({ status: 'fail', message: 'Course ID and Lesson ID are required.' });
    }

    const progress = await LessonProgress.findOneAndUpdate(
      { user: userId, lesson: lessonId },
      {
        course: courseId,
        completed: !!completed,
        watchProgress: Number(watchProgress) || 0,
        lastWatchedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      status: 'success',
      data: progress
    });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: (err as any).message });
  }
};

// GET /api/v1/lesson-progress/course/:courseId
export const getCourseProgress = async (req: Request, res: Response): Promise<any> => {
  try {
    const { courseId } = req.params;
    const userId = (req as any).user._id;

    // Fetch all active lessons in the course
    const totalLessonsCount = await Lesson.countDocuments({ course: courseId, isActive: true });

    // Fetch completed progress for this user
    const completedProgressCount = await LessonProgress.countDocuments({
      user: userId,
      course: courseId,
      completed: true
    });

    // Fetch all progress records for individual lessons to return state
    const progressList = await LessonProgress.find({
      user: userId,
      course: courseId
    }).lean();

    const percentage = totalLessonsCount > 0 
      ? Math.round((completedProgressCount / totalLessonsCount) * 100) 
      : 0;

    return res.status(200).json({
      status: 'success',
      data: {
        totalLessons: totalLessonsCount,
        completedLessons: completedProgressCount,
        percentage,
        progressList
      }
    });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: (err as any).message });
  }
};
