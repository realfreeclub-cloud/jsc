import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, Clock, Globe, Users, MessageCircle, Smartphone } from 'lucide-react';
import { openCourseInApp, openWhatsApp } from '../utils/appRedirect';

// Mock Data
// eslint-disable-next-line react-refresh/only-export-components
export const courses = [
  {
    slug: 'pcs-j-foundation',
    title: 'UP PCS (J) Foundation Batch 2026',
    category: 'Foundation',
    mode: 'Hybrid',
    thumbnail: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800',
    faculty: 'Justice R. Sharma & Team',
    duration: '12 Months',
    language: 'Hindi & English',
    studentsEnrolled: '2.5k+',
  },
  {
    slug: 'delhi-judiciary-target',
    title: 'Delhi Judiciary Target Batch',
    category: 'Target Batch',
    mode: 'Online',
    thumbnail: 'https://images.unsplash.com/photo-1505664177941-ac4666fc7cb9?auto=format&fit=crop&q=80&w=800',
    faculty: 'Dr. A. Desai',
    duration: '6 Months',
    language: 'English',
    studentsEnrolled: '1.2k+',
  },
  {
    slug: 'rajasthan-apo-special',
    title: 'Rajasthan APO Special Crash Course',
    category: 'Crash Course',
    mode: 'Offline',
    thumbnail: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&q=80&w=800',
    faculty: 'Mr. M. Singh',
    duration: '3 Months',
    language: 'Hindi',
    studentsEnrolled: '800+',
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
          {courses.map((course, i) => (
            <FadeIn delay={i * 0.1} key={course.slug}>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group flex flex-col h-full">
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
                    <span className="px-3 py-1 bg-gold text-primary text-xs font-bold rounded-full uppercase tracking-wider shadow-md w-max">
                      {course.category}
                    </span>
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-primary text-xs font-bold rounded-full shadow-md w-max">
                      {course.mode}
                    </span>
                  </div>

                  {/* Demo Play Button overlay */}
                  <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-gold hover:text-primary transition-colors hover:scale-110 shadow-lg z-10">
                    <PlayCircle size={32} />
                  </button>
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                    <h3 className="text-xl font-bold leading-tight">{course.title}</h3>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 grow flex flex-col">
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gold" />
                      <span className="font-medium text-primary">By {course.faculty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-blue-500" />
                      <span>{course.studentsEnrolled} Students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-emerald-500" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-purple-500" />
                      <span>{course.language}</span>
                    </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    <Link 
                      to={`/courses/${course.slug}`}
                      className="w-full block text-center py-3 rounded-xl border border-gray-200 text-primary font-bold hover:border-gold hover:text-gold transition-colors"
                    >
                      View Full Details
                    </Link>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => openCourseInApp(course.slug)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-light transition-colors shadow-lg shadow-primary/20"
                      >
                        <Smartphone size={18} /> Open App
                      </button>
                      
                      <button 
                        onClick={() => openWhatsApp(course.title)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                      >
                        <MessageCircle size={18} /> Ask Query
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
