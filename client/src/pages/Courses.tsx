import { type ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, MessageCircle, Smartphone, Shield, BookOpen } from 'lucide-react';
import { openCourseInApp, openWhatsApp } from '../utils/appRedirect';
import api from '../utils/api';

export interface Course {
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  mode: string;
  thumbnail: string;
  faculty: string;
  duration: string;
  language: string;
  studentsEnrolled: string;
  about: string;
  highlights?: string[];
  features?: string[];
  suitableFor?: string[];
  states?: string[];
  fees: {
    online?: string;
    offline?: string;
    hybrid?: string;
  };
  note?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const courses: Course[] = [
  {
    slug: 'pcs-j-foundation',
    title: 'Judiciary Foundation Course for PCS (J)',
    subtitle: 'Build a Strong Foundation for Judicial Services',
    category: 'Foundation',
    mode: 'Hybrid',
    thumbnail: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800',
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
    category: 'APO Foundation',
    mode: 'Hybrid',
    thumbnail: 'https://images.unsplash.com/photo-1505664177941-ac4666fc7cb9?auto=format&fit=crop&q=80&w=800',
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
    category: 'Special Module',
    mode: 'Online',
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
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
    category: 'Special Batch',
    mode: 'Online',
    thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2923216?auto=format&fit=crop&q=80&w=800',
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
    category: 'Special Batch',
    mode: 'Online',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
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
    category: 'Recorded',
    mode: 'Online',
    thumbnail: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800',
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
    category: 'Recorded',
    mode: 'Online',
    thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800',
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
    category: 'Recorded',
    mode: 'Online',
    thumbnail: 'https://images.unsplash.com/photo-1589216532372-2c2f3d70e65d?auto=format&fit=crop&q=80&w=800',
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
    category: 'Recorded',
    mode: 'Online',
    thumbnail: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=800',
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
    category: 'Recorded',
    mode: 'Online',
    thumbnail: 'https://images.unsplash.com/photo-1423592707957-3b212afa6733?auto=format&fit=crop&q=80&w=800',
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
    category: 'Recorded Combo',
    mode: 'Online',
    thumbnail: 'https://images.unsplash.com/photo-1505664177941-ac4666fc7cb9?auto=format&fit=crop&q=80&w=800',
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
];

const FadeIn = ({ children, delay = 0 }: { children: ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

const Courses = () => {
  const [liveCourses, setLiveCourses] = useState<Course[]>([]);

  useEffect(() => {
    api.get('/courses')
      .then(res => {
        const mapped = res.data.data.map((c: any) => ({
          slug: c.slug,
          title: c.title,
          subtitle: c.subtitle,
          category: c.category?.name || 'General',
          mode: c.mode,
          thumbnail: c.imageUrl || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800',
          faculty: c.faculty || 'Expert Faculty',
          duration: c.duration || '12 Months',
          language: c.language || 'English',
          studentsEnrolled: c.studentsEnrolled || '1k+',
          about: c.about || '',
          highlights: c.highlights || [],
          features: c.features || [],
          suitableFor: c.suitableFor || [],
          states: c.states || [],
          fees: c.fees || { online: '0' },
          note: c.note || ''
        }));
        if (mapped && mapped.length > 0) {
          setLiveCourses(mapped);
        }
      })
      .catch(err => {
        console.warn('API courses fetch warning, using static fallback:', err.message);
      });
  }, []);

  const displayCourses = liveCourses.length > 0 ? liveCourses : courses;

  return (
    <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Our Premium Courses</h1>
          <div className="w-24 h-1 bg-gold mx-auto rounded-full mb-6"></div>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Choose from our meticulously crafted programs designed to guarantee your success in judicial service examinations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayCourses.map((course, i) => (
            <FadeIn delay={i * 0.1} key={course.slug}>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group flex flex-col h-full hover:shadow-2xl transition-all">
                {/* Thumbnail & Badges */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-primary/80 to-transparent"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    <span className="px-3 py-1 bg-gold text-primary text-[10px] font-bold rounded-full uppercase tracking-wider shadow-md w-max">
                      {course.category}
                    </span>
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-primary text-[10px] font-bold rounded-full shadow-md w-max">
                      {course.mode}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                    <h3 className="text-xl font-bold leading-tight line-clamp-2">{course.title}</h3>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 grow flex flex-col">
                  <p className="text-slate-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                    {course.about}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-[12px] text-slate-600">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gold" />
                      <span className="font-bold text-primary truncate">{course.faculty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-emerald-500" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-blue-500" />
                      <span>{course.language}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-purple-500" />
                      <span className="font-bold text-primary">₹{course.fees.online || course.fees.offline || course.fees.hybrid || 'TBD'}</span>
                    </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    <Link 
                      to={`/courses/${course.slug}`}
                      className="w-full block text-center py-3 rounded-xl border border-gray-200 text-primary font-bold hover:border-gold hover:text-gold transition-colors text-sm"
                    >
                      View Details & Syllabus
                    </Link>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => openCourseInApp(course.slug)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-light transition-colors shadow-lg text-xs"
                      >
                        <Smartphone size={16} /> Enroll Now
                      </button>
                      
                      <button 
                        onClick={() => openWhatsApp(course.title)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-lg text-xs"
                      >
                        <MessageCircle size={16} /> Ask Query
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;
