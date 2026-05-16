import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

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

    // 1. Create Categories
    const categoriesData = [
      { name: 'Foundation', slug: 'foundation' },
      { name: 'APO Foundation', slug: 'apo-foundation' },
      { name: 'Special Module', slug: 'special-module' },
      { name: 'Special Batch', slug: 'special-batch' },
      { name: 'Recorded', slug: 'recorded' },
      { name: 'Recorded Combo', slug: 'recorded-combo' },
    ];
    const createdCategories = await CourseCategory.insertMany(categoriesData);
    
    const getCatId = (name: string) => createdCategories.find(c => c.name === name)?._id;

    // 2. Create an Admin User (for Blog author)
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@judicialstudycentre.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created!');
    } else {
      // Update password just in case it was plain text
      const hashedPassword = await bcrypt.hash('password123', 12);
      adminUser.password = hashedPassword;
      await adminUser.save();
      console.log('Admin user password updated to hashed version.');
    }

    // 3. Create Courses
    const courses = await Course.insertMany([
      {
        slug: 'pcs-j-foundation',
        title: 'Judiciary Foundation Course for PCS (J)',
        subtitle: 'Build a Strong Foundation for Judicial Services',
        category: getCatId('Foundation'),
        mode: 'Hybrid',
        imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800',
        faculty: 'R. N. Rai (Rai Sir) & Team',
        duration: '20-22 Months',
        language: 'Hindi & English',
        studentsEnrolled: '2.5k+',
        about: 'The PCS-J Foundation Program is a comprehensive and long-term preparation course designed for judiciary aspirants who aim to develop strong conceptual understanding and systematic preparation from the very beginning.',
        highlights: [
          'Comprehensive Coverage of Major & Minor Laws',
          'Preliminary + Mains Integrated Preparation',
          'General Studies, English & Hindi Support',
          'Answer Writing Practice & Evaluation',
          'Regular Mock Tests & Performance Analysis',
          'Personalized Mentorship & Doubt Sessions',
          'Updated Study Material & Notes'
        ],
        states: ['Uttar Pradesh', 'Bihar', 'Uttarakhand', 'Jharkhand', 'Madhya Pradesh', 'Chhattisgarh'],
        fees: { online: '51,500', offline: '72,500', hybrid: '82,500' },
        suitableFor: ['LL.B. Students', 'Final Year Law Students', 'Judiciary Aspirants Beginning Their Preparation'],
        note: 'Extra charges applicable for Test series + Mock'
      },
      {
        slug: 'apo-foundation',
        title: 'Judiciary Foundation Course for APO',
        subtitle: 'Strategic Preparation for APO Examinations',
        category: getCatId('APO Foundation'),
        mode: 'Hybrid',
        imageUrl: 'https://images.unsplash.com/photo-1505664177941-ac4666fc7cb9?auto=format&fit=crop&q=80&w=800',
        faculty: 'R. N. Rai (Rai Sir)',
        duration: '9 Months',
        language: 'Hindi & English',
        studentsEnrolled: '1.2k+',
        about: 'The APO Foundation Program is specially designed for aspirants preparing for Assistant Prosecution Officer examinations. The course combines law subjects with objective practice, General Studies, and English.',
        highlights: [
          'Objective & Conceptual Law Preparation',
          'Comprehensive GS & English/Hindi Coverage',
          'State-Specific Exam Orientation',
          'Mock Tests & Revision Modules',
          'Mentorship'
        ],
        states: ['Uttar Pradesh', 'Bihar', 'Uttarakhand', 'Jharkhand', 'Madhya Pradesh', 'Chhattisgarh'],
        fees: { online: '22,500', offline: '32,500', hybrid: '35,500' },
        suitableFor: ['APO Aspirants', 'Law Graduates', 'Students Preparing for Prosecutorial Services'],
        note: 'Extra charges applicable for Test series + Mock'
      },
      {
        slug: 'new-criminal-law-module',
        title: 'New Criminal Law Module',
        subtitle: 'Master India’s New Criminal Law Framework (BNS + BNSS + BSA)',
        category: getCatId('Special Module'),
        mode: 'Online',
        imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
        faculty: 'R. N. Rai (Rai Sir)',
        duration: '3 Months',
        language: 'Hindi & English',
        studentsEnrolled: '1.8k+',
        about: 'Exclusively designed to provide in-depth understanding of the newly implemented criminal laws — Bharatiya Nyaya Sanhita (BNS), Bharatiya Nagarik Suraksha Sanhita (BNSS), and Bharatiya Sakshya Adhiniyam (BSA).',
        fees: { online: '9,500' },
        suitableFor: ['Anyone one interested in learning new criminal laws']
      },
      {
        slug: 'bihar-apo-prelims',
        title: 'Bihar APO Prelims Special Batch',
        subtitle: 'Focused Preparation for Bihar APO Preliminary Examination',
        category: getCatId('Special Batch'),
        mode: 'Online',
        imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2923216?auto=format&fit=crop&q=80&w=800',
        faculty: 'Expert Faculty',
        duration: 'Fast-track',
        language: 'Hindi & English',
        studentsEnrolled: '500+',
        about: 'Fast-track and exam-oriented course designed specifically for Bihar APO aspirants emphasizing objective law preparation and revision strategy.',
        highlights: ['BNS, 2023', 'BNSS, 2023', 'BSA, 2023', 'Constitution', 'CPC, 1908'],
        fees: { online: '3,500' },
        note: 'Extra charges applicable for Test series + Mock'
      },
      {
        slug: 'uttarakhand-apo-prelims',
        title: 'Uttarakhand APO Prelims Special Batch',
        subtitle: 'Targeted Preparation for Uttarakhand APO Aspirants',
        category: getCatId('Special Batch'),
        mode: 'Online',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
        faculty: 'Expert Faculty',
        duration: 'Fast-track',
        language: 'Hindi & English',
        studentsEnrolled: '400+',
        about: 'Designed to help students prepare effectively for the Uttarakhand APO Preliminary Examination through structured study plans and focused law preparation.',
        highlights: ['BNS, 2023', 'BNSS, 2023', 'BSA, 2023', 'Police Act'],
        fees: { online: '3,500' },
        note: 'Extra charges applicable for Test series + Mock'
      },
      {
        slug: 'bns-recorded',
        title: 'BNS Recorded Lecture Course',
        subtitle: 'Bharatiya Nyaya Sanhita Complete Recorded Program',
        category: getCatId('Recorded'),
        mode: 'Online',
        imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800',
        faculty: 'R. N. Rai (Rai Sir)',
        duration: '3 Months Access',
        language: 'Hindi & English',
        studentsEnrolled: '900+',
        about: 'Comprehensive and systematic coverage of the Bharatiya Nyaya Sanhita (BNS), 2023, with special focus on conceptual clarity and comparative understanding with IPC.',
        features: [
          'Complete BNS Coverage',
          'Important Sections & Concepts',
          'Judiciary & APO Oriented Preparation',
          'Conceptual + Exam-Focused Teaching',
          'Flexible Recorded Access',
          'Notes & Revision Support'
        ],
        fees: { online: '3,500' },
        suitableFor: ['Judiciary Aspirants', 'APO Aspirants', 'Law Students', 'Legal Professionals']
      },
      {
        slug: 'bnss-recorded',
        title: 'BNSS Recorded Lecture Course',
        subtitle: 'Bharatiya Nagarik Suraksha Sanhita Complete Recorded Program',
        category: getCatId('Recorded'),
        mode: 'Online',
        imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800',
        faculty: 'R. N. Rai (Rai Sir)',
        duration: '3 Months Access',
        language: 'Hindi & English',
        studentsEnrolled: '850+',
        about: 'Detailed recorded lectures on the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023, focusing on criminal procedure, investigation, and trial processes.',
        features: [
          'Complete BNSS Coverage',
          'Procedural Law Simplified',
          'Practical & Exam-Oriented Approach',
          'Recorded Access with Revision Support'
        ],
        fees: { online: '3,500' },
        suitableFor: ['Judiciary Aspirants', 'APO Aspirants', 'Law Students', 'Criminal Law Learners']
      },
      {
        slug: 'bsa-recorded',
        title: 'BSA Recorded Lecture Course',
        subtitle: 'Bharatiya Sakshya Adhiniyam Complete Recorded Program',
        category: getCatId('Recorded'),
        mode: 'Online',
        imageUrl: 'https://images.unsplash.com/photo-1589216532372-2c2f3d70e65d?auto=format&fit=crop&q=80&w=800',
        faculty: 'R. N. Rai (Rai Sir)',
        duration: '3 Months Access',
        language: 'Hindi & English',
        studentsEnrolled: '750+',
        about: 'Build strong command over Law of Evidence (BSA, 2023). Lectures focus on evidence principles, relevancy of facts, and admissibility.',
        features: [
          'Complete BSA Coverage',
          'Comparative Analysis with Indian Evidence Act',
          'Conceptual & Analytical Learning',
          'Judiciary & APO Focused Preparation',
          'Recorded Classes; Revision Support',
          'Notes'
        ],
        fees: { online: '3,500' },
        suitableFor: ['Judiciary Aspirants', 'APO Aspirants', 'Law Students']
      },
      {
        slug: 'constitution-recorded',
        title: 'Constitution Recorded Lecture Course',
        subtitle: 'Constitutional Law Complete Recorded Program',
        category: getCatId('Recorded'),
        mode: 'Online',
        imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=800',
        faculty: 'R. N. Rai (Rai Sir)',
        duration: 'Unlimited Access',
        language: 'Hindi & English',
        studentsEnrolled: '1.5k+',
        about: 'Understand the Foundation of Indian Democracy. Covers constitutional philosophy, fundamental rights, judiciary, federalism, and landmark judgments.',
        features: [
          'Comprehensive Constitutional Law Coverage',
          'Landmark Judgments & Case Law Analysis',
          'Article-Wise Conceptual Teaching',
          'Notes'
        ],
        fees: { online: '3,500' },
        suitableFor: ['PCS-J Aspirants', 'APO Aspirants', 'LL.B. Students', 'Judiciary Foundation Students']
      },
      {
        slug: 'cpc-recorded',
        title: 'CPC Recorded Lecture Course',
        subtitle: 'Code of Civil Procedure Complete Recorded Program',
        category: getCatId('Recorded'),
        mode: 'Online',
        imageUrl: 'https://images.unsplash.com/photo-1423592707957-3b212afa6733?auto=format&fit=crop&q=80&w=800',
        faculty: 'R. N. Rai (Rai Sir)',
        duration: 'Unlimited Access',
        language: 'Hindi & English',
        studentsEnrolled: '1.1k+',
        about: 'Master Civil Procedure through structured learning. Focuses on procedural concepts, important provisions, and answer-writing understanding.',
        features: [
          'Complete CPC Coverage',
          'Order & Section-Wise Explanation',
          'Procedural Concepts Simplified',
          'Notes'
        ],
        fees: { online: '3,500' },
        suitableFor: ['Judiciary Aspirants', 'Law Students', 'APO Aspirants', 'Civil Law Learners']
      },
      {
        slug: 'major-laws-recorded-combo',
        title: 'Judiciary Major Laws Recorded Combo',
        subtitle: 'Constitution + CPC + Criminal Laws Combo + Police Act',
        category: getCatId('Recorded Combo'),
        mode: 'Online',
        imageUrl: 'https://images.unsplash.com/photo-1505664177941-ac4666fc7cb9?auto=format&fit=crop&q=80&w=800',
        faculty: 'R. N. Rai (Rai Sir)',
        duration: 'Full Access',
        language: 'Hindi & English',
        studentsEnrolled: '2k+',
        about: 'Comprehensive major law preparation for Judiciary and APO exams. Combines Constitution, CPC, BNS, BNSS, and BSA into one integrated package.',
        features: [
          'Constitution + CPC + BNS + BNSS + BSA',
          'Structured Major Law Preparation',
          'Recorded Lectures with Flexible Access',
          'Notes, & Case Law Discussions',
          'Judiciary-Oriented Preparation Strategy'
        ],
        fees: { online: '18,500' },
        suitableFor: ['PCS-J Aspirants', 'APO Aspirants', 'Law Graduates', 'Students Seeking Flexible Learning'],
        note: 'Extra charges applicable for Test series + Mock'
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
