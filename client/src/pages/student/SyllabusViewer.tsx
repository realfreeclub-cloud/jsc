import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Video, FileText, CheckCircle, Lock, Play, Sparkles, Check, Info } from 'lucide-react';
import api from '../../utils/api';
import { openWhatsApp } from '../../utils/appRedirect';

interface Lesson {
  _id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  pdfUrl?: string;
  order: number;
  isPreview?: boolean;
  isLocked?: boolean;
}

interface Module {
  _id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

interface ProgressRecord {
  lesson: string;
  completed: boolean;
}

interface CourseDetails {
  _id: string;
  title: string;
  subtitle?: string;
  about?: string;
  accessType?: string;
}

const getYoutubeId = (url?: string) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
};

const SyllabusViewer = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  
  // Progress state
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  // Active playing lesson
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Fetch course info, syllabus, and progress
  const fetchSyllabusAndProgress = async () => {
    if (!courseId) return;
    try {
      // 1. Fetch course details
      const courseRes = await api.get(`/courses/${courseId}`);
      if (courseRes.data?.data) {
        setCourse(courseRes.data.data);
      }

      // 2. Fetch syllabus
      const syllabusRes = await api.get(`/lessons/course/${courseId}/syllabus`);
      const fetchedModules = syllabusRes.data?.data || [];
      setModules(fetchedModules);
      setHasAccess(!!syllabusRes.data?.hasAccess);

      // 3. Fetch student progress
      const progressRes = await api.get(`/lesson-progress/course/${courseId}`);
      if (progressRes.data?.data) {
        const { totalLessons, completedLessons, percentage, progressList } = progressRes.data.data;
        setTotalLessons(totalLessons);
        setCompletedCount(completedLessons);
        setProgressPercent(percentage);

        const completedIds = (progressList || [])
          .filter((item: ProgressRecord) => item.completed)
          .map((item: ProgressRecord) => item.lesson);
        setCompletedLessonIds(completedIds);
      }

      // 4. Default to first unlocked lesson if none is active
      if (!activeLesson && fetchedModules.length > 0) {
        // Find first lesson (preferably preview or unlocked)
        for (const mod of fetchedModules) {
          if (mod.lessons && mod.lessons.length > 0) {
            const firstLesson = mod.lessons.find((l: Lesson) => !l.isLocked) || mod.lessons[0];
            setActiveLesson(firstLesson);
            break;
          }
        }
      }
    } catch (err) {
      console.error('Failed to load syllabus/progress details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabusAndProgress();
  }, [courseId]);

  const handleToggleComplete = async (lessonId: string, currentCompleted: boolean) => {
    if (!courseId) return;
    try {
      await api.post('/lesson-progress/track', {
        courseId,
        lessonId,
        completed: !currentCompleted
      });
      // Refresh progress data
      fetchSyllabusAndProgress();
    } catch (err) {
      console.error('Error tracking progress', err);
    }
  };

  const handleEnrollClick = () => {
    if (!course) return;
    openWhatsApp(course.title);
  };

  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm font-semibold">Loading syllabus & classroom...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Course not found.</h2>
        <Link to="/student/courses" className="mt-4 inline-flex items-center gap-2 text-gold font-bold">
          <ArrowLeft size={16} /> Back to Courses
        </Link>
      </div>
    );
  }

  const isCurrentCompleted = activeLesson ? completedLessonIds.includes(activeLesson._id) : false;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Back & Breadcrumb */}
      <div className="mb-6">
        <Link to="/student/courses" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-all">
          <ArrowLeft size={14} /> BACK TO MY CLASSROOM
        </Link>
      </div>

      {/* Course Main Details & Progress */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">{course.title}</h1>
            <p className="text-sm text-slate-400 mt-1">{course.subtitle || 'Comprehensive Syllabus Preparations'}</p>
          </div>
          
          {/* Progress Tracker */}
          <div className="bg-slate-50 rounded-2xl p-4 md:w-80 border border-slate-100">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-slate-500">SYLLABUS COMPLETED</span>
              <span className="text-emerald-600">{progressPercent}% ({completedCount}/{totalLessons})</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Syllabus Explorer */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side: Syllabus Modules Tree */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-gold" /> Syllabus Content
          </h2>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {modules.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-3xl border border-dashed border-slate-200">
                Syllabus is being updated. Check back soon!
              </div>
            ) : (
              modules.map((mod) => (
                <div key={mod._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
                  {/* Module header */}
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 text-sm">{mod.title}</h3>
                    {mod.description && <p className="text-[11px] text-slate-400 mt-0.5">{mod.description}</p>}
                  </div>

                  {/* Lessons list */}
                  <div className="divide-y divide-slate-50">
                    {mod.lessons.map((les) => {
                      const isActive = activeLesson?._id === les._id;
                      const isCompleted = completedLessonIds.includes(les._id);
                      
                      return (
                        <button
                          key={les._id}
                          onClick={() => setActiveLesson(les)}
                          className={`w-full text-left p-3.5 flex items-start gap-3 hover:bg-slate-50/50 transition-all cursor-pointer ${
                            isActive ? 'bg-gold/5 border-l-4 border-gold' : ''
                          }`}
                        >
                          <div className={`mt-0.5 shrink-0 rounded-lg p-1.5 ${
                            isActive ? 'bg-gold/15 text-gold' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {les.isLocked ? <Lock size={12} /> : <Video size={12} />}
                          </div>

                          <div className="grow min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-xs font-bold line-clamp-2 leading-snug ${
                                isActive ? 'text-primary font-bold' : 'text-slate-700'
                              }`}>
                                {les.title}
                              </span>
                              {isCompleted && (
                                <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1.5">
                              {les.isPreview && (
                                <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                                  Free Preview
                                </span>
                              )}
                              {les.pdfUrl && !les.isLocked && (
                                <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">
                                  Notes Attached
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Active Lesson Media & Details */}
        <div className="lg:col-span-2 space-y-6">
          {activeLesson ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
              {activeLesson.isLocked ? (
                /* LOCK SCREEN */
                <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-slate-50 rounded-2xl border border-slate-200/50">
                  <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-6 shadow-xs animate-bounce">
                    <Lock size={28} />
                  </div>
                  <h3 className="font-serif font-bold text-slate-800 text-xl mb-2">Lesson is Locked</h3>
                  <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-8">
                    To watch this premium video lecture and gain downloadable access to the attached study sheets & model notes, complete enrollment for this program.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleEnrollClick}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles size={16} /> Enroll & Unlock via WhatsApp
                    </button>
                    <Link
                      to="/student/courses"
                      className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-bold text-sm transition-all text-center"
                    >
                      Browse Other Classes
                    </Link>
                  </div>
                </div>
              ) : (
                /* LESSON PLAYER & DETAILS */
                <div>
                  {/* YouTube Embed Player */}
                  {activeLesson.videoUrl ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl bg-black border border-slate-100 mb-6">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYoutubeId(activeLesson.videoUrl)}?autoplay=1&rel=0`}
                        title={activeLesson.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8 mb-6">
                      <Play className="text-slate-300 mb-4" size={48} />
                      <p className="text-sm font-medium text-slate-500">No video URL linked to this lecture</p>
                    </div>
                  )}

                  {/* Header Title */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">{activeLesson.title}</h2>
                      {activeLesson.description && (
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{activeLesson.description}</p>
                      )}
                    </div>

                    {/* Progress tracking toggle */}
                    {hasAccess && (
                      <button
                        onClick={() => handleToggleComplete(activeLesson._id, isCurrentCompleted)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 ${
                          isCurrentCompleted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Check size={14} className={isCurrentCompleted ? 'text-emerald-600' : 'text-slate-400'} />
                        {isCurrentCompleted ? 'Completed' : 'Mark Completed'}
                      </button>
                    )}
                  </div>

                  {/* Attachments Section */}
                  {activeLesson.pdfUrl && (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <h4 className="font-bold text-slate-800 text-xs mb-3 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={14} className="text-blue-500" /> Lecture Notes & Downloads
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed mb-4">
                        Download high-yield revision sheets, key judiciary answers, and notes structured around this topic.
                      </p>
                      <a
                        href={activeLesson.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <FileText size={14} /> Download PDF Notes
                      </a>
                    </div>
                  )}
                  
                  {!activeLesson.pdfUrl && (
                    <div className="flex items-center gap-2.5 text-xs text-slate-400 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <Info size={14} className="text-slate-400" />
                      <span>No downloadable PDF attachments added for this lesson.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-white rounded-3xl border border-slate-100 min-h-[400px]">
              <BookOpen size={48} className="text-slate-200 mb-4" />
              <h3 className="font-serif font-bold text-slate-800 text-lg mb-1">Select a Lesson</h3>
              <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                Click on any of the modules and choose a lesson on the left to start streaming video tutorials and revision notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyllabusViewer;
