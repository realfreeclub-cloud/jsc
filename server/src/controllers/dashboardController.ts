import { Request, Response, NextFunction } from 'express';
import Student from '../models/Student';
import Faculty from '../models/Faculty';
import Course from '../models/Course';
import Blog from '../models/Blog';
import Gallery from '../models/Gallery';
import Event from '../models/Event';
import DemoClass from '../models/DemoClass';
import WhatsAppLead from '../models/WhatsAppLead';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalCourses,
      totalBlogs,
      totalGalleryImages,
      totalEvents,
      totalDemoClasses,
      totalWhatsAppLeads
    ] = await Promise.all([
      Student.countDocuments(),
      Faculty.countDocuments(),
      Course.countDocuments(),
      Blog.countDocuments(),
      Gallery.countDocuments(),
      Event.countDocuments(),
      DemoClass.countDocuments(),
      WhatsAppLead.countDocuments()
    ]);

    // Fetch some recent activity (combining latest students and leads)
    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(3).lean();
    const recentLeads = await WhatsAppLead.find().sort({ createdAt: -1 }).limit(2).lean();

    const activity = [
      ...recentStudents.map((s: any) => ({
        id: s._id,
        student: s.name,
        action: `Registered for ${s.course || 'Course'}`,
        date: s.createdAt,
        status: s.status || 'Active',
        type: 'student'
      })),
      ...recentLeads.map((l: any) => ({
        id: l._id,
        student: l.name || 'Unknown Lead',
        action: 'WhatsApp Inquiry Generated',
        date: l.createdAt,
        status: l.status || 'New Lead',
        type: 'lead'
      }))
    ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalStudents,
          totalFaculty,
          totalCourses,
          totalBlogs,
          totalGalleryImages,
          totalEvents,
          totalDemoClasses,
          totalWhatsAppLeads
        },
        recentActivity: activity
      }
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};
