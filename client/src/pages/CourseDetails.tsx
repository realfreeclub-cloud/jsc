import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlayCircle, Clock, Globe, Users, MessageCircle, Smartphone, 
  CheckCircle, ChevronRight, MapPin, Award, BookOpen, CreditCard, Info, Loader2
} from 'lucide-react';
import { openCourseInApp, openWhatsApp } from '../utils/appRedirect';
import { type Course } from './Courses.tsx';
import api from '../utils/api';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

const CourseDetails = () => {
  const { slug } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then(res => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const found = res.data.data.find((c: any) => c.slug === slug);
        if (found) {
          const mapped: Course = {
            slug: found.slug,
            title: found.title,
            subtitle: found.subtitle,
            category: found.category?.name || 'General',
            mode: found.mode,
            thumbnail: found.imageUrl || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800',
            faculty: found.faculty || 'Expert Faculty',
            duration: found.duration || '12 Months',
            language: found.language || 'English',
            studentsEnrolled: found.studentsEnrolled || '1k+',
            about: found.about || '',
            highlights: found.highlights || [],
            features: found.features || [],
            suitableFor: found.suitableFor || [],
            states: found.states || [],
            fees: found.fees || { online: '0' },
            note: found.note || ''
          };
          setCourse(mapped);
        } else {
          setCourse(null);
        }
      })
      .catch(err => {
        console.error('API course fetch error:', err.message);
        setCourse(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-gold" size={48} />
          <p className="text-slate-500 font-semibold">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="pt-40 pb-20 text-center">
        <h2 className="text-3xl font-bold text-primary">Course Not Found</h2>
        <Link to="/courses" className="mt-4 text-gold hover:underline inline-block">Back to Courses</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-primary text-white pt-32 pb-20 md:pt-40 md:pb-28 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-gold/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gold/30 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7">
            <FadeIn>
              <div className="flex gap-3 mb-6">
                <span className="px-3 py-1 bg-gold text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold rounded-full uppercase tracking-wider border border-white/20">
                  {course.mode}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                {course.title}
              </h1>
              {course.subtitle && (
                <p className="text-xl text-gold/90 font-medium mb-6 italic">
                  “{course.subtitle}”
                </p>
              )}
              <p className="text-lg text-slate-300 mb-10 max-w-2xl leading-relaxed">
                {course.about}
              </p>
              
              <div className="flex flex-wrap gap-8 text-sm mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gold">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Duration</p>
                    <p className="font-bold">{course.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gold">
                    <Globe size={20} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Language</p>
                    <p className="font-bold">{course.language}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gold">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Enrolled</p>
                    <p className="font-bold">{course.studentsEnrolled}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => openCourseInApp(course.slug)}
                  className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-linear-to-r from-gold to-yellow-500 text-primary font-bold hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-1 text-lg shadow-xl"
                >
                  <Smartphone size={24} /> Enroll via App
                </button>
                
                <button 
                  onClick={() => openWhatsApp(course.title)}
                  className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-white/10 text-white border border-white/20 font-bold hover:bg-white/20 transition-all text-lg backdrop-blur-sm"
                >
                  <MessageCircle size={24} /> Inquiry on WhatsApp
                </button>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-5">
            <FadeIn delay={0.2}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group aspect-video bg-primary-dark">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-gold hover:text-primary transition-all hover:scale-110">
                    <PlayCircle size={48} className="ml-1" />
                  </button>
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                  <span className="bg-primary/80 backdrop-blur-md px-6 py-2 rounded-full text-sm font-bold text-white border border-white/10 tracking-widest uppercase">
                    Watch Demo
                  </span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-12 gap-12">
        
        {/* Main Details */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Highlights */}
          {course.highlights && course.highlights.length > 0 && (
            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                  <Award size={28} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-primary">Course Highlights</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {course.highlights.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="mt-1">
                      <CheckCircle className="text-emerald-500" size={20} />
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Features (for Recorded) */}
          {course.features && course.features.length > 0 && (
            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <BookOpen size={28} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-primary">Program Features</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {course.features.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <ChevronRight className="text-gold" size={20} />
                    <p className="text-slate-700 font-bold leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Fee Structure */}
          <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CreditCard size={28} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-primary">Fee Structure</h2>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-6">
              {course.fees.online && (
                <div className="p-6 rounded-3xl border-2 border-slate-50 bg-slate-50 text-center group hover:border-gold transition-all">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Online</p>
                  <p className="text-3xl font-black text-primary">₹{course.fees.online}</p>
                </div>
              )}
              {course.fees.offline && (
                <div className="p-6 rounded-3xl border-2 border-slate-50 bg-slate-50 text-center group hover:border-gold transition-all">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Offline</p>
                  <p className="text-3xl font-black text-primary">₹{course.fees.offline}</p>
                </div>
              )}
              {course.fees.hybrid && (
                <div className="p-6 rounded-3xl border-2 border-gold/20 bg-gold/5 text-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-gold text-primary text-[10px] font-bold rounded-bl-xl uppercase">Best Value</div>
                  <p className="text-sm font-bold text-gold uppercase tracking-widest mb-2">Hybrid</p>
                  <p className="text-3xl font-black text-primary">₹{course.fees.hybrid}</p>
                </div>
              )}
              {!course.fees?.online && !course.fees?.offline && !course.fees?.hybrid && (
                <div className="col-span-3 p-6 text-center text-slate-500 font-medium bg-slate-50 rounded-2xl border border-slate-100">
                  Pricing details will be announced soon. Please contact us for more information.
                </div>
              )}
            </div>

            {course.note && (
              <div className="mt-8 flex items-start gap-3 p-4 bg-blue-50 rounded-2xl text-blue-700 text-sm font-medium border border-blue-100">
                <Info size={20} className="shrink-0" />
                <p>{course.note}</p>
              </div>
            )}
          </section>

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Enrollment Card */}
          <div className="bg-primary rounded-[2.5rem] p-8 shadow-2xl text-white">
            <h3 className="text-2xl font-serif font-bold mb-6">Start Enrollment</h3>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle size={18} className="text-gold" />
                <span>Instant Course Access</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle size={18} className="text-gold" />
                <span>Downloadable PDF Notes</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle size={18} className="text-gold" />
                <span>Live Doubt Support</span>
              </div>
            </div>

            <button 
              onClick={() => openCourseInApp(course.slug)}
              className="w-full py-5 rounded-2xl bg-white text-primary font-bold hover:bg-gold transition-all shadow-lg flex items-center justify-center gap-3 mb-4 group"
            >
              <Smartphone size={22} className="group-hover:scale-110 transition-transform" /> 
              Open in Mobile App
            </button>
            <p className="text-[11px] text-center text-slate-400 px-4">
              Our mobile app provides the most secure and features-rich learning experience.
            </p>
          </div>

          {/* States Covered */}
          {course.states && course.states.length > 0 && (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <MapPin size={20} className="text-gold" /> States Covered
              </h3>
              <div className="flex flex-wrap gap-2">
                {course.states.map((state, i) => (
                  <span key={i} className="px-4 py-2 bg-slate-50 rounded-full text-sm font-bold text-slate-600 border border-slate-100">
                    {state}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suitable For */}
          {course.suitableFor && course.suitableFor.length > 0 && (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <Users size={20} className="text-gold" /> Suitable For
              </h3>
              <ul className="space-y-3">
                {course.suitableFor.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                    <ChevronRight size={16} className="text-gold mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default CourseDetails;
