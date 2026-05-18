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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then(res => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        if (mapped) {
          setLiveCourses(mapped);
        }
      })
      .catch(err => {
        console.error('API courses fetch failed:', err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="pt-28 pb-20 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
          {liveCourses.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-500 text-lg">
              No courses available at the moment. Please check back later.
            </div>
          ) : liveCourses.map((course, i) => (
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
