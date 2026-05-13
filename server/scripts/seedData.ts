import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import Models
import CourseCategory from '../src/models/CourseCategory';
import Course from '../src/models/Course';
import User from '../src/models/User';
import Blog from '../src/models/Blog';
import Notification from '../src/models/Notification';
import StudyMaterial from '../src/models/StudyMaterial';
import Event from '../src/models/Event';
import Testimonial from '../src/models/Testimonial';

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/judicial-study';
    console.log(`Connecting to MongoDB... (${mongoUri})`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected!');

    console.log('Clearing existing demo data...');
    // Clear specific collections
    await CourseCategory.deleteMany({});
    await Course.deleteMany({});
    await Blog.deleteMany({});
    await Notification.deleteMany({});
    await StudyMaterial.deleteMany({});
    await Event.deleteMany({});
    await Testimonial.deleteMany({});

    // 1. Create a Category
    const category = await CourseCategory.create({
      name: 'Judiciary Target Batch',
      slug: 'judiciary-target-batch',
      description: 'Comprehensive target batches for upcoming state judiciary exams.',
      isActive: true
    });

    // 2. Create an Admin User (for Blog author)
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@judicialstudycentre.com',
        password: 'password123',
        role: 'admin'
      });
    }

    // 3. Create Courses
    const courses = await Course.insertMany([
      {
        title: 'UP PCS (J) Target Batch 2026',
        slug: 'up-pcs-j-target-batch-2026',
        category: category._id,
        mode: 'Hybrid',
        duration: '12 Months',
        language: 'Hindi/English',
        studentsEnrolled: 145,
        about: 'A complete foundational target batch focusing on UP State Judiciary syllabus including local laws.',
        isActive: true,
        thumbnail: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'Delhi Judiciary Foundation',
        slug: 'delhi-judiciary-foundation',
        category: category._id,
        mode: 'Online',
        duration: '6 Months',
        language: 'English',
        studentsEnrolled: 89,
        about: 'Master the Delhi Judiciary exam with in-depth analysis of major laws and recent judgments.',
        isActive: true,
        thumbnail: 'https://images.unsplash.com/photo-1505664177941-ac4666fc7cb9?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'MP Civil Judge Crash Course',
        slug: 'mp-civil-judge-crash-course',
        category: category._id,
        mode: 'Online',
        duration: '3 Months',
        language: 'Hindi',
        studentsEnrolled: 210,
        about: 'Fast-track your preparation for the MP Civil Judge preliminary examination.',
        isActive: true,
        thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=600'
      }
    ]);

    // 4. Create Blogs
    await Blog.insertMany([
      {
        title: 'How to Prepare for UP PCS (J) Interview',
        slug: 'how-to-prepare-for-up-pcs-j-interview',
        content: '<p>The interview is the final hurdle in your judiciary preparation journey. Here are 5 tips...</p>',
        excerpt: 'Mastering the interview phase requires confidence and clarity on current legal affairs.',
        author: adminUser._id,
        category: 'Exam Strategy',
        tags: ['Interview', 'UP PCS (J)'],
        isPublished: true,
        publishedAt: new Date()
      },
      {
        title: 'Important Judgments of 2025: A Recap',
        slug: 'important-judgments-2025-recap',
        content: '<p>Last year saw several landmark judgments by the Supreme Court...</p>',
        excerpt: 'A comprehensive review of the most critical Supreme Court rulings from last year.',
        author: adminUser._id,
        category: 'Legal Updates',
        tags: ['Supreme Court', 'Landmark Cases'],
        isPublished: true,
        publishedAt: new Date()
      }
    ]);

    // 5. Create Notifications
    await Notification.insertMany([
      {
        title: 'MP Civil Judge Notification Released!',
        content: 'The official notification for MP Civil Judge 2026 has been published. Last date to apply is 30th May.',
        type: 'alert',
        isPinned: true
      },
      {
        title: 'New Mock Test Available',
        content: 'Constitutional Law Mock Test #4 is now live on the student portal.',
        type: 'success',
        isPinned: false
      },
      {
        title: 'Scheduled System Maintenance',
        content: 'The portal will be down for maintenance this Sunday from 2 AM to 4 AM.',
        type: 'warning',
        isPinned: false
      }
    ]);

    // 6. Create Study Materials
    await StudyMaterial.insertMany([
      {
        title: 'Indian Penal Code - Quick Revision Notes',
        description: 'Complete mind-maps and revision notes for IPC.',
        fileUrl: 'https://example.com/ipc-notes.pdf',
        fileType: 'pdf',
        course: courses[0]._id,
        category: 'Criminal Law',
        isFree: true,
        downloads: 1204
      },
      {
        title: 'Constitution of India - Landmark Cases Compendium',
        description: 'Top 100 cases asked in judiciary exams.',
        fileUrl: 'https://example.com/const-cases.pdf',
        fileType: 'pdf',
        category: 'Constitutional Law',
        isFree: true,
        downloads: 856
      }
    ]);

    // 7. Create Events
    await Event.insertMany([
      {
        title: 'Mega Scholarship Test 2026',
        slug: 'mega-scholarship-test-2026',
        description: 'Compete with thousands of aspirants and win up to 100% scholarship on our target batches.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        location: 'Online',
        isActive: true
      },
      {
        title: 'Toppers Talk: Cracking Delhi Judiciary',
        slug: 'toppers-talk-cracking-delhi-judiciary',
        description: 'Live interactive session with last year\'s top rankers.',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        location: 'Zoom Webinar',
        isActive: true
      }
    ]);

    // 8. Create Testimonials
    await Testimonial.insertMany([
      {
        studentName: 'Priya Sharma',
        courseName: 'UP PCS (J) Foundation',
        content: 'The faculty here is phenomenal. The way they break down complex Bare Act provisions is unmatched.',
        rating: 5,
        isApproved: true
      },
      {
        studentName: 'Rahul Verma',
        courseName: 'Delhi Judiciary Target Batch',
        content: 'The mock interview sessions gave me the exact confidence I needed. Thank you JSC!',
        rating: 5,
        isApproved: true
      }
    ]);

    console.log('✅ Success: Demo Seed Data has been injected into the database!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedDatabase();
