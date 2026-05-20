import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlayCircle, Clock, Globe, Users, MessageCircle, 
  CheckCircle, ChevronRight, MapPin, Award, BookOpen, CreditCard, Info, Loader2,
  Lock, ChevronDown, ChevronUp, Play, FileText, CheckCircle2
} from 'lucide-react';
import { openWhatsApp } from '../utils/appRedirect';
import { type Course } from './Courses.tsx';
import api from '../utils/api';

interface SyllabusLesson {
  _id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  pdfUrl?: string;
  isPreview?: boolean;
  isLocked?: boolean;
  order: number;
}

interface SyllabusModule {
  _id: string;
  title: string;
  description?: string;
  order: number;
  lessons: SyllabusLesson[];
}

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
  const [courseId, setCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syllabus, setSyllabus] = useState<SyllabusModule[]>([]);
  const [syllabusLoading, setSyllabusLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [hasAccess, setHasAccess] = useState(false);
  const [activeLesson, setActiveLesson] = useState<SyllabusLesson | null>(null);

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
          setCourseId(found._id);
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

  // Fetch syllabus once courseId is known
  useEffect(() => {
    if (!courseId) return;
    setSyllabusLoading(true);
    const token = localStorage.getItem('jsc_token');
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    api.get(`/lessons/course/${courseId}/syllabus`, { headers })
      .then(res => {
        const modules: SyllabusModule[] = res.data?.data || [];
        setSyllabus(modules);
        const access = !!res.data?.hasAccess;
        setHasAccess(access);
        // Auto-expand all modules; auto-select first unlocked lesson
        setExpandedModules(new Set(modules.map((m: SyllabusModule) => m._id)));
        if (access) {
          for (const mod of modules) {
            const first = mod.lessons.find((l: SyllabusLesson) => !l.isLocked);
            if (first) { setActiveLesson(first); break; }
          }
        }
      })
      .catch(() => setSyllabus([]))
      .finally(() => setSyllabusLoading(false));
  }, [courseId]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const getYoutubeId = (url?: string): string => {
    if (!url) return '';
    const m = url.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*)/);
    return (m && m[1].length === 11) ? m[1] : url;
  };

  const scrollToSyllabus = () => {
    document.getElementById('course-syllabus')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
                {hasAccess ? (
                  /* FREE COURSE — scroll down to video classroom */
                  <button
                    onClick={scrollToSyllabus}
                    className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-linear-to-r from-gold to-yellow-500 text-primary font-bold hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-1 text-lg shadow-xl"
                  >
                    <PlayCircle size={24} /> Watch Free Lessons ↓
                  </button>
                ) : (
                  /* PAID COURSE — WhatsApp enrollment */
                  <button
                    onClick={() => openWhatsApp(course.title)}
                    className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-linear-to-r from-gold to-yellow-500 text-primary font-bold hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-1 text-lg shadow-xl"
                  >
                    <MessageCircle size={24} /> Enroll via WhatsApp
                  </button>
                )}

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

          {/* ─── Syllabus / Video Classroom Section ─── */}
          {(syllabusLoading || syllabus.length > 0) && (
            <section id="course-syllabus" className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              {/* Section Header */}
              <div className="flex items-center gap-4 px-10 pt-10 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <BookOpen size={26} />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-primary">Course Syllabus</h2>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {hasAccess
                      ? `${syllabus.reduce((a, m) => a + m.lessons.length, 0)} lessons · Free & open access`
                      : 'Enroll via WhatsApp after payment confirmation to unlock all lessons'}
                  </p>
                </div>
              </div>

              {syllabusLoading ? (
                <div className="flex items-center gap-3 py-16 justify-center">
                  <Loader2 className="animate-spin text-gold" size={28} />
                  <span className="text-slate-400 font-medium">Loading syllabus...</span>
                </div>
              ) : hasAccess ? (
                /* ══ FREE COURSE — Full Video Classroom ══ */
                <div className="grid lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

                  {/* LEFT: Lesson List */}
                  <div className="lg:col-span-2 overflow-y-auto" style={{ maxHeight: '72vh' }}>
                    {syllabus.map((mod) => (
                      <div key={mod._id}>
                        {/* Module Header */}
                        <button
                          onClick={() => toggleModule(mod._id)}
                          className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left border-b border-slate-100"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm leading-snug truncate">{mod.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{mod.lessons.length} lessons</p>
                          </div>
                          {expandedModules.has(mod._id)
                            ? <ChevronUp size={16} className="text-slate-400 shrink-0 ml-2" />
                            : <ChevronDown size={16} className="text-slate-400 shrink-0 ml-2" />}
                        </button>

                        {/* Lesson Rows */}
                        {expandedModules.has(mod._id) && mod.lessons.map((lesson) => {
                          const isActive = activeLesson?._id === lesson._id;
                          return (
                            <button
                              key={lesson._id}
                              onClick={() => setActiveLesson(lesson)}
                              className={`w-full flex items-start gap-3 px-5 py-3.5 border-b border-slate-50 text-left transition-all ${
                                isActive
                                  ? 'bg-gold/8 border-l-4 border-l-gold'
                                  : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                              }`}
                            >
                              <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isActive ? 'bg-gold text-primary' : 'bg-slate-100 text-slate-400'
                              }`}>
                                <Play size={12} className={isActive ? '' : 'ml-0.5'} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold leading-snug ${
                                  isActive ? 'text-primary' : 'text-slate-700'
                                }`}>{lesson.title}</p>
                                {lesson.description && (
                                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{lesson.description}</p>
                                )}
                                <div className="flex gap-1.5 mt-1.5">
                                  {lesson.videoUrl && (
                                    <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">VIDEO</span>
                                  )}
                                  {lesson.pdfUrl && (
                                    <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold">PDF</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* RIGHT: Video Player */}
                  <div className="lg:col-span-3 p-6 flex flex-col gap-5">
                    {activeLesson ? (
                      <>
                        {/* YouTube Embed */}
                        {activeLesson.videoUrl ? (
                          <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-xl" style={{ paddingTop: '56.25%' }}>
                            <iframe
                              key={activeLesson._id}
                              src={`https://www.youtube.com/embed/${getYoutubeId(activeLesson.videoUrl)}?rel=0&modestbranding=1`}
                              title={activeLesson.title}
                              className="absolute inset-0 w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div className="aspect-video rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center">
                            <Play size={40} className="text-slate-300 mb-3" />
                            <p className="text-sm text-slate-400 font-medium">No video available for this lesson</p>
                          </div>
                        )}

                        {/* Lesson Meta */}
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 mb-1">{activeLesson.title}</h3>
                          {activeLesson.description && (
                            <p className="text-sm text-slate-500 leading-relaxed">{activeLesson.description}</p>
                          )}
                        </div>

                        {/* PDF Download */}
                        {activeLesson.pdfUrl && (
                          <a
                            href={activeLesson.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 px-5 py-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl text-sm font-bold transition-all self-start"
                          >
                            <FileText size={16} />
                            Download Lecture Notes (PDF)
                          </a>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                        <Play size={48} className="text-slate-200 mb-4" />
                        <p className="font-bold text-slate-700 text-lg mb-1">Select a Lesson</p>
                        <p className="text-sm text-slate-400">Click any lesson on the left to start watching.</p>
                      </div>
                    )}
                  </div>
                </div>

              ) : (
                /* ══ PAID COURSE — Preview player + locked lessons with WhatsApp CTA ══ */
                <div className="grid lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

                  {/* LEFT: Lesson List */}
                  <div className="lg:col-span-2 overflow-y-auto" style={{ maxHeight: '72vh' }}>
                    {syllabus.map((mod) => (
                      <div key={mod._id}>
                        {/* Module Header */}
                        <button
                          onClick={() => toggleModule(mod._id)}
                          className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left border-b border-slate-100"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm leading-snug truncate">{mod.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {mod.lessons.filter(l => l.isPreview).length} free preview · {mod.lessons.filter(l => !l.isPreview).length} paid
                            </p>
                          </div>
                          {expandedModules.has(mod._id)
                            ? <ChevronUp size={16} className="text-slate-400 shrink-0 ml-2" />
                            : <ChevronDown size={16} className="text-slate-400 shrink-0 ml-2" />}
                        </button>

                        {/* Lesson Rows */}
                        {expandedModules.has(mod._id) && mod.lessons.map((lesson) => {
                          const isActive = activeLesson?._id === lesson._id;
                          return (
                            <button
                              key={lesson._id}
                              onClick={() => setActiveLesson(lesson)}
                              className={`w-full flex items-start gap-3 px-5 py-3.5 border-b border-slate-50 text-left transition-all ${
                                isActive
                                  ? 'bg-gold/8 border-l-4 border-l-gold'
                                  : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                              }`}
                            >
                              <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                lesson.isPreview
                                  ? isActive ? 'bg-gold text-primary' : 'bg-emerald-50 text-emerald-500'
                                  : 'bg-slate-100 text-slate-400'
                              }`}>
                                {lesson.isPreview
                                  ? <Play size={12} className={isActive ? '' : 'ml-0.5'} />
                                  : <Lock size={12} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold leading-snug ${
                                  isActive ? 'text-primary' : lesson.isPreview ? 'text-slate-700' : 'text-slate-400'
                                }`}>{lesson.title}</p>
                                {lesson.description && (
                                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{lesson.description}</p>
                                )}
                              </div>
                              {lesson.isPreview
                                ? <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-extrabold uppercase shrink-0">Free</span>
                                : <span className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-bold shrink-0">Paid</span>}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* RIGHT: Player or Lock Screen */}
                  <div className="lg:col-span-3 p-6 flex flex-col gap-5">
                    {!activeLesson ? (
                      /* Default: no lesson selected */
                      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                        <Play size={48} className="text-slate-200 mb-4" />
                        <p className="font-bold text-slate-700 text-lg mb-1">Select a Lesson</p>
                        <p className="text-sm text-slate-400 max-w-xs">
                          Click a <span className="text-emerald-600 font-bold">Free Preview</span> lesson to watch it instantly, or a <span className="text-slate-500 font-bold">Paid</span> lesson to enroll.
                        </p>
                      </div>

                    ) : activeLesson.isPreview && activeLesson.videoUrl ? (
                      /* Preview lesson — play directly */
                      <>
                        <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-xl" style={{ paddingTop: '56.25%' }}>
                          <iframe
                            key={activeLesson._id}
                            src={`https://www.youtube.com/embed/${getYoutubeId(activeLesson.videoUrl)}?rel=0&modestbranding=1`}
                            title={activeLesson.title}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-extrabold uppercase">Free Preview</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 mb-1">{activeLesson.title}</h3>
                          {activeLesson.description && (
                            <p className="text-sm text-slate-500 leading-relaxed">{activeLesson.description}</p>
                          )}
                        </div>
                        {activeLesson.pdfUrl && (
                          <a
                            href={activeLesson.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 px-5 py-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl text-sm font-bold transition-all self-start"
                          >
                            <FileText size={16} />
                            Download Lecture Notes (PDF)
                          </a>
                        )}
                        {/* Upsell to enroll */}
                        <div className="mt-2 p-4 bg-primary/5 border border-primary/10 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                          <div className="flex-1">
                            <p className="font-bold text-primary text-sm">Enjoying this lesson?</p>
                            <p className="text-xs text-slate-500 mt-0.5">Enroll to unlock all remaining paid lectures and PDF notes.</p>
                          </div>
                          <button
                            onClick={() => openWhatsApp(course?.title || '')}
                            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-yellow-400 text-primary font-black rounded-xl text-xs transition-all shadow-md"
                          >
                            <MessageCircle size={14} /> Enroll via WhatsApp
                          </button>
                        </div>
                      </>

                    ) : (
                      /* Locked / paid lesson selected — show enroll prompt */
                      <div className="flex flex-col items-center justify-center h-full py-14 px-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/8 border-2 border-primary/15 flex items-center justify-center mb-6 animate-bounce">
                          <Lock size={32} className="text-primary/60" />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-slate-800 mb-2">This Lesson is Locked</h3>
                        <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-8">
                          <strong>{activeLesson.title}</strong> is part of the paid curriculum. Complete enrollment after payment confirmation to unlock all lectures.
                        </p>
                        <div className="w-full max-w-sm bg-primary rounded-2xl p-6 text-white text-left">
                          <p className="font-bold mb-1">How to Enroll</p>
                          <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside mb-5">
                            <li>Click "Enroll via WhatsApp" below</li>
                            <li>Complete payment as guided by admin</li>
                            <li>Admin activates your access instantly</li>
                            <li>Log in to watch all lessons</li>
                          </ol>
                          <button
                            onClick={() => openWhatsApp(course?.title || '')}
                            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gold hover:bg-yellow-400 text-primary font-black rounded-xl text-sm transition-all shadow-lg"
                          >
                            <MessageCircle size={16} /> Enroll via WhatsApp
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Enrollment Card */}
            <div className="bg-primary rounded-[2.5rem] p-8 shadow-2xl text-white">
              <h3 className="text-2xl font-serif font-bold mb-2">
                {hasAccess ? '🎓 Free Course' : 'Start Enrollment'}
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                {hasAccess
                  ? 'This course is completely free. Watch all lessons directly below.'
                  : 'Send your payment via WhatsApp. Admin activates access after confirmation.'}
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle size={18} className="text-gold" />
                  <span>{hasAccess ? 'All video lessons unlocked' : 'Instant activation after payment'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle size={18} className="text-gold" />
                  <span>Downloadable PDF Notes</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle size={18} className="text-gold" />
                  <span>{hasAccess ? 'No login required' : 'Lifetime / timed access options'}</span>
                </div>
              </div>

              {hasAccess ? (
                <button
                  onClick={scrollToSyllabus}
                  className="w-full py-5 rounded-2xl bg-gold text-primary font-bold hover:bg-yellow-400 transition-all shadow-lg flex items-center justify-center gap-3 group"
                >
                  <PlayCircle size={22} className="group-hover:scale-110 transition-transform" />
                  Watch Lessons Now ↓
                </button>
              ) : (
                <button
                  onClick={() => openWhatsApp(course.title)}
                  className="w-full py-5 rounded-2xl bg-white text-primary font-bold hover:bg-gold transition-all shadow-lg flex items-center justify-center gap-3 group"
                >
                  <MessageCircle size={22} className="group-hover:scale-110 transition-transform" />
                  Enroll via WhatsApp
                </button>
              )}
              <p className="text-[11px] text-center text-slate-400 px-4 mt-3">
                {hasAccess
                  ? 'Free and open access — no account needed.'
                  : 'Pay on WhatsApp → Admin confirms → You get access.'}
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
