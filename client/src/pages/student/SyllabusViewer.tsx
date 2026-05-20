import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Video, FileText, CheckCircle, Lock, Play, Sparkles, Check, Info, MessageSquare, Send, BookOpenCheck } from 'lucide-react';
import api from '../../utils/api';
import { openWhatsApp } from '../../utils/appRedirect';
import CustomVideoPlayer from '../../components/ui/CustomVideoPlayer';

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
  watchProgress?: number;
}

interface CourseDetails {
  _id: string;
  title: string;
  subtitle?: string;
  about?: string;
  accessType?: string;
}

interface MockComment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

const SyllabusViewer = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  
  // Progress state
  const [progressList, setProgressList] = useState<ProgressRecord[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  // Active playing lesson
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Throttled watch progress save ref
  const lastSavedTimeRef = useRef<number>(0);
  const lastSavedLessonIdRef = useRef<string>('');

  // Discussion state
  const [comments, setComments] = useState<Record<string, MockComment[]>>({});
  const [newCommentText, setNewCommentText] = useState('');

  // Fetch course info, syllabus, and progress
  const fetchSyllabusAndProgress = async (shouldAutoSelect = true) => {
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
        const { totalLessons, completedLessons, percentage, progressList: list } = progressRes.data.data;
        setTotalLessons(totalLessons);
        setCompletedCount(completedLessons);
        setProgressPercent(percentage);
        setProgressList(list || []);

        const completedIds = (list || [])
          .filter((item: ProgressRecord) => item.completed)
          .map((item: ProgressRecord) => item.lesson);
        setCompletedLessonIds(completedIds);
      }

      // 4. Default to first unlocked lesson if none is active
      if (shouldAutoSelect && fetchedModules.length > 0) {
        let firstLesson: Lesson | null = null;
        for (const mod of fetchedModules) {
          if (mod.lessons && mod.lessons.length > 0) {
            firstLesson = mod.lessons.find((l: Lesson) => !l.isLocked) || mod.lessons[0];
            break;
          }
        }
        if (firstLesson) {
          setActiveLesson(firstLesson);
          lastSavedTimeRef.current = 0;
          lastSavedLessonIdRef.current = firstLesson._id;
        }
      }
    } catch (err) {
      console.error('Failed to load syllabus/progress details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabusAndProgress(true);
  }, [courseId]);

  // Handle manual complete toggle
  const handleToggleComplete = async (lessonId: string, currentCompleted: boolean) => {
    if (!courseId) return;
    try {
      await api.post('/lesson-progress/track', {
        courseId,
        lessonId,
        completed: !currentCompleted
      });
      // Refresh progress data (do not auto-select lesson)
      fetchSyllabusAndProgress(false);
    } catch (err) {
      console.error('Error tracking progress', err);
    }
  };

  // Handle continuous video play position updates
  const handleProgressUpdate = async (currentTime: number, _duration: number, percent: number) => {
    if (!courseId || !activeLesson || !hasAccess) return;

    // Reset progress tracking ref if lesson changed
    if (lastSavedLessonIdRef.current !== activeLesson._id) {
      lastSavedTimeRef.current = 0;
      lastSavedLessonIdRef.current = activeLesson._id;
    }

    const timeDiff = Math.abs(currentTime - lastSavedTimeRef.current);
    const isCompletedNow = percent >= 90;
    const wasAlreadyCompleted = completedLessonIds.includes(activeLesson._id);

    // Save progress if 10 seconds elapsed, or if it hit 90% and wasn't completed
    if (timeDiff >= 10 || (isCompletedNow && !wasAlreadyCompleted)) {
      lastSavedTimeRef.current = currentTime;
      try {
        await api.post('/lesson-progress/track', {
          courseId,
          lessonId: activeLesson._id,
          watchProgress: Math.floor(currentTime),
          completed: wasAlreadyCompleted || isCompletedNow
        });
        
        // If progress completes the lesson, refresh the numbers silently
        if (isCompletedNow && !wasAlreadyCompleted) {
          fetchSyllabusAndProgress(false);
        }
      } catch (err) {
        console.error('Failed to track progress automatically', err);
      }
    }
  };

  // Play next unlocked lesson in order
  const handleVideoEnded = () => {
    if (modules.length === 0 || !activeLesson) return;
    const allLessons = modules.flatMap(mod => mod.lessons);
    const currentIndex = allLessons.findIndex(l => l._id === activeLesson._id);

    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      if (!nextLesson.isLocked) {
        setActiveLesson(nextLesson);
        lastSavedTimeRef.current = 0;
        lastSavedLessonIdRef.current = nextLesson._id;
      }
    }
  };

  const handleEnrollClick = () => {
    if (!course) return;
    openWhatsApp(course.title);
  };

  // Discussion comments logic
  const activeLessonComments = activeLesson ? (comments[activeLesson._id] || [
    { id: '1', user: 'Rohan Sharma', text: 'Highly helpful lecture. The explanation on Section 300 exceptions cleared my doubts.', timestamp: '2 hours ago' },
    { id: '2', user: 'Aditi Verma', text: 'Sir, will the answer writing practice sheet for this module be uploaded today?', timestamp: 'Yesterday' }
  ]) : [];

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLesson || !newCommentText.trim()) return;

    const newComment: MockComment = {
      id: Date.now().toString(),
      user: 'You (Student)',
      text: newCommentText.trim(),
      timestamp: 'Just now'
    };

    setComments(prev => ({
      ...prev,
      [activeLesson._id]: [...activeLessonComments, newComment]
    }));
    setNewCommentText('');
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
  const activeLessonProgress = activeLesson ? progressList.find(p => p.lesson === activeLesson._id) : null;
  const initialResumeTime = activeLessonProgress?.watchProgress || 0;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Back & Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/student/courses" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-all">
          <ArrowLeft size={14} /> BACK TO MY CLASSROOM
        </Link>
        <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-bold border border-slate-200">
          Enrolled Program
        </span>
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
              <span className="text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpenCheck size={14} className="text-emerald-500" /> Syllabus Completed
              </span>
              <span className="text-emerald-600 font-mono">{progressPercent}% ({completedCount}/{totalLessons})</span>
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

      {/* Main Three-Column Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Syllabus Structure (Modules & Lessons list) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4 uppercase tracking-wider">
              <BookOpen size={16} className="text-gold" /> Syllabus Contents
            </h2>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
              {modules.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Syllabus is being updated. Check back soon!
                </div>
              ) : (
                modules.map((mod) => (
                  <div key={mod._id} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
                    {/* Module header */}
                    <div className="bg-slate-100/70 px-3.5 py-2.5 border-b border-slate-100">
                      <h3 className="font-bold text-slate-800 text-xs leading-snug">{mod.title}</h3>
                      {mod.description && <p className="text-[10px] text-slate-400 mt-0.5">{mod.description}</p>}
                    </div>

                    {/* Lessons list */}
                    <div className="divide-y divide-slate-100">
                      {mod.lessons.map((les) => {
                        const isActive = activeLesson?._id === les._id;
                        const isCompleted = completedLessonIds.includes(les._id);
                        
                        return (
                          <button
                            key={les._id}
                            onClick={() => {
                              setActiveLesson(les);
                              lastSavedTimeRef.current = 0;
                              lastSavedLessonIdRef.current = les._id;
                            }}
                            className={`w-full text-left p-3 flex items-start gap-2.5 hover:bg-slate-100/50 transition-all cursor-pointer ${
                              isActive ? 'bg-gold/5 border-l-4 border-gold' : ''
                            }`}
                          >
                            <div className={`mt-0.5 shrink-0 rounded-lg p-1.5 ${
                              isActive ? 'bg-gold/15 text-gold' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {les.isLocked ? <Lock size={11} /> : <Video size={11} />}
                            </div>

                            <div className="grow min-w-0">
                              <div className="flex items-start justify-between gap-1">
                                <span className={`text-xs font-semibold line-clamp-2 leading-snug ${
                                  isActive ? 'text-primary font-bold' : 'text-slate-700'
                                }`}>
                                  {les.title}
                                </span>
                                {isCompleted && (
                                  <CheckCircle size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1.5 mt-1">
                                {les.isPreview && (
                                  <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
                                    Free Preview
                                  </span>
                                )}
                                {les.pdfUrl && !les.isLocked && (
                                  <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-semibold">
                                    PDF Attached
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
        </div>

        {/* Center Column: Video Player & Lecture details */}
        <div className="lg:col-span-6 space-y-6">
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
                <div className="space-y-6">
                  {/* Custom Video Player integration */}
                  {activeLesson.videoUrl ? (
                    <div>
                      <CustomVideoPlayer
                        videoUrl={activeLesson.videoUrl}
                        title={activeLesson.title}
                        initialTime={initialResumeTime}
                        onProgress={handleProgressUpdate}
                        onEnded={handleVideoEnded}
                      />
                      {initialResumeTime > 0 && (
                        <div className="mt-2 text-[11px] font-semibold text-gold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-gold/20 flex items-center gap-1.5">
                          <Info size={13} />
                          <span>Resuming from last watched time: {Math.floor(initialResumeTime / 60)}m {Math.floor(initialResumeTime % 60)}s</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8">
                      <Play className="text-slate-300 mb-4" size={48} />
                      <p className="text-sm font-medium text-slate-500">No video URL linked to this lecture</p>
                    </div>
                  )}

                  {/* Header Title */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
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
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 ${
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

        {/* Right Column: PDF Notes & Live Q&A Discussion board */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* PDF Downloads */}
          {activeLesson && !activeLesson.isLocked && (
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
              <h4 className="font-bold text-slate-800 text-xs mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={15} className="text-blue-500" /> Lecture Notes & PDF
              </h4>
              {activeLesson.pdfUrl ? (
                <div>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4">
                    Download revision materials, notes, and key answer pointers structured for this class.
                  </p>
                  <a
                    href={activeLesson.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <FileText size={14} /> Download PDF Notes
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <Info size={13} className="text-slate-400" />
                  <span>No PDF attachment linked for this lesson.</span>
                </div>
              )}
            </div>
          )}

          {/* Q&A discussion board */}
          {activeLesson && !activeLesson.isLocked && (
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col min-h-[350px]">
              <h4 className="font-bold text-slate-800 text-xs mb-4 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                <MessageSquare size={15} className="text-gold" /> Discussion & Q&A
              </h4>

              {/* Comments stream */}
              <div className="space-y-3 grow overflow-y-auto max-h-[200px] mb-4 pr-1 text-xs">
                {activeLessonComments.map((c) => (
                  <div key={c.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-700">{c.user}</span>
                      <span className="text-[9px] text-slate-400">{c.timestamp}</span>
                    </div>
                    <p className="text-slate-600 leading-snug">{c.text}</p>
                  </div>
                ))}
              </div>

              {/* Post comment form */}
              <form onSubmit={handlePostComment} className="flex gap-2 border-t border-slate-100 pt-3 mt-auto">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-gold p-2 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyllabusViewer;
