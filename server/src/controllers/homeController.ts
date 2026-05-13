import { Request, Response, NextFunction } from 'express';
import HeroSlider from '../models/HeroSlider';
import Notification from '../models/Notification';
import Course from '../models/Course';
import Event from '../models/Event';
import LatestUpdate from '../models/LatestUpdate';
import Faculty from '../models/Faculty';

export const getHomeData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [sliders, notifications, courses, events, updates, faculties] = await Promise.all([
      HeroSlider.find({ isActive: true }).sort('order'),
      Notification.find({ isPinned: true }).limit(5).sort('-createdAt'),
      Course.find({ isActive: true }).limit(3).sort('-createdAt'),
      Event.find({ isActive: true, date: { $gte: new Date() } }).limit(3).sort('date'),
      LatestUpdate.find({ isActive: true }).limit(10).sort('-createdAt'),
      Faculty.find({ isActive: true }).limit(4).sort('order')
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        sliders,
        notifications,
        courses,
        events,
        updates,
        faculties
      }
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};
