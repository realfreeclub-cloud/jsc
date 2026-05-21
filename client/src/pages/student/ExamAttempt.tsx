import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Clock, ChevronLeft, ChevronRight, AlertTriangle, ShieldAlert, Globe, Trash2, Check, HelpCircle } from 'lucide-react';
import api from '../../utils/api';

interface ExamQuestion {
  _id: string;
  text: string;
  textHindi?: string;
  marks: number;
  options: string[];
  optionsHindi?: string[];
  imageUrl?: string;
  difficultyLevel?: string;
  questionType?: 'single-correct' | 'multiple-correct' | 'true-false' | 'match-following' | 'assertion-reason' | 'paragraph';
  paragraphText?: string;
  paragraphTextHindi?: string;
  assertion?: string;
  assertionHindi?: string;
  reason?: string;
  reasonHindi?: string;
  section?: string;
}

interface ExamAttemptData {
  status: string;
  answers: { questionId: string; selectedOptionIndex: number; selectedOptionIndices?: number[] }[];
  startedAt: string;
  exam: {
    title: string;
    durationMinutes: number;
    negativeMarking: number;
    attemptsAllowed: number;
  };
}

const ExamAttempt = () => {
  const { id: attemptId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedOptionIndex: number; selectedOptionIndices?: number[] }[]>([]);
  const [markedQuestions, setMarkedQuestions] = useState<Record<string, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<string, boolean>>({});
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [violations, setViolations] = useState(0);

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['attemptQuestions', attemptId],
    queryFn: () => api.get(`/student-exams/attempt/${attemptId}/questions`).then((res: { data: { data: { attempt: ExamAttemptData; questions: ExamQuestion[] } } }) => res.data),
  });

  const submitMutation = useMutation({
    mutationFn: (answersData: any[]) => 
      api.post(`/student-exams/attempt/${attemptId}/submit`, { 
        answers: answersData,
        antiCheatViolations: violations,
        timeSpentSeconds: data?.data?.attempt ? Math.floor((new Date().getTime() - new Date(data.data.attempt.startedAt).getTime()) / 1000) : 0
      }),
    onSuccess: () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      navigate(`/student/exams/results/${attemptId}`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      alert(err.response?.data?.message || 'Failed to submit exam');
    }
  });

  const handleSubmit = (force = false) => {
    if (!force && !window.confirm('Are you sure you want to submit the exam? All answered questions will be evaluated.')) return;
    submitMutation.mutate(answersRef.current);
  };

  useEffect(() => {
    if (data?.data?.attempt && data?.data?.questions) {
      const qList = data.data.questions;
      if (answers.length === 0 && data.data.attempt.answers) {
        setAnswers(data.data.attempt.answers.map(ans => ({
          questionId: ans.questionId,
          selectedOptionIndex: ans.selectedOptionIndex,
          selectedOptionIndices: ans.selectedOptionIndices || (ans.selectedOptionIndex !== -1 ? [ans.selectedOptionIndex] : [])
        })));
      }

      // Mark the first question as visited initially
      if (qList.length > 0) {
        setVisitedQuestions(prev => ({ ...prev, [qList[0]._id]: true }));
      }

      if (timeLeft === null) {
        const startedAt = new Date(data.data.attempt.startedAt).getTime();
        const durationMs = data.data.attempt.exam.durationMinutes * 60 * 1000;
        const endsAt = startedAt + durationMs;
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((endsAt - now) / 1000));
        setTimeLeft(remaining);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (timeLeft === null) return;
    
    if (timeLeft <= 0 && !submitMutation.isPending) {
      handleSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev !== null ? prev - 1 : prev);
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Security violations monitor
  useEffect(() => {
    if (!isStarted || submitMutation.isPending) return;

    const handleViolation = () => {
      setViolations(prev => {
        const nextViolations = prev + 1;
        if (nextViolations >= 3) {
          alert('Security Violation: Tab switching or window blur detected. Automatically submitting exam.');
          handleSubmit(true);
        } else {
          alert(`Warning: Leaving the exam interface or switching tabs is prohibited. Warning ${nextViolations}/3. The exam will submit automatically on the 3rd violation.`);
        }
        return nextViolations;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation();
    };

    const handleBlur = () => {
      handleViolation();
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStarted, submitMutation.isPending]);

  const questions = data?.data?.questions || [];
  const attempt = data?.data?.attempt;

  // Track Visited Questions
  useEffect(() => {
    if (questions.length > 0 && questions[currentQuestionIndex]) {
      const currentQId = questions[currentQuestionIndex]._id;
      setVisitedQuestions(prev => {
        if (prev[currentQId]) return prev;
        return { ...prev, [currentQId]: true };
      });
    }
  }, [currentQuestionIndex, questions]);

  const handleOptionSelect = (questionId: string, optionIndex: number, isMultipleCorrect: boolean) => {
    const existingIdx = answers.findIndex(a => a.questionId === questionId);
    const newAnswers = [...answers];

    if (isMultipleCorrect) {
      if (existingIdx >= 0) {
        const currentIndices = newAnswers[existingIdx].selectedOptionIndices || [];
        const indexInArray = currentIndices.indexOf(optionIndex);
        let nextIndices = [...currentIndices];
        if (indexInArray >= 0) {
          nextIndices.splice(indexInArray, 1);
        } else {
          nextIndices.push(optionIndex);
        }
        newAnswers[existingIdx].selectedOptionIndices = nextIndices.sort();
        newAnswers[existingIdx].selectedOptionIndex = nextIndices[0] !== undefined ? nextIndices[0] : -1;
      } else {
        newAnswers.push({ 
          questionId, 
          selectedOptionIndex: optionIndex, 
          selectedOptionIndices: [optionIndex] 
        });
      }
    } else {
      if (existingIdx >= 0) {
        newAnswers[existingIdx].selectedOptionIndex = optionIndex;
        newAnswers[existingIdx].selectedOptionIndices = [optionIndex];
      } else {
        newAnswers.push({ 
          questionId, 
          selectedOptionIndex: optionIndex, 
          selectedOptionIndices: [optionIndex] 
        });
      }
    }
    setAnswers(newAnswers);
  };

  const clearResponse = (questionId: string) => {
    const existingIdx = answers.findIndex(a => a.questionId === questionId);
    if (existingIdx >= 0) {
      const newAnswers = [...answers];
      newAnswers[existingIdx].selectedOptionIndex = -1;
      newAnswers[existingIdx].selectedOptionIndices = [];
      setAnswers(newAnswers);
    }
  };

  const getSelectedOption = (questionId: string) => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer ? answer.selectedOptionIndex : -1;
  };

  const getSelectedOptionIndices = (questionId: string): number[] => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer?.selectedOptionIndices || [];
  };

  const getQuestionStatus = (qId: string) => {
    const ans = answers.find(a => a.questionId === qId);
    const hasAnswered = ans && (ans.selectedOptionIndex !== -1 || (ans.selectedOptionIndices && ans.selectedOptionIndices.length > 0));
    const isMarked = !!markedQuestions[qId];
    const isVisited = !!visitedQuestions[qId];

    if (hasAnswered && isMarked) return 'answered-marked';
    if (isMarked) return 'marked';
    if (hasAnswered) return 'answered';
    if (isVisited) return 'visited';
    return 'unvisited';
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const startExamFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    }
    setIsStarted(true);
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" size={40} /></div>;
  if (error || !attempt) return <div className="text-center text-red-500 font-bold py-10 animate-in fade-in">Failed to load exam.</div>;
  
  if (attempt.status === 'completed') {
    return (
      <div className="text-center py-20 animate-in fade-in">
        <h2 className="text-2xl font-bold mb-4 text-slate-800 font-serif">Exam Already Completed</h2>
        <button onClick={() => navigate(`/student/exams/results/${attemptId}`)} className="px-6 py-3 bg-primary text-gold rounded-xl font-bold cursor-pointer">
          View Detailed Analytics
        </button>
      </div>
    );
  }

  if (questions.length === 0) return <div className="text-center py-10">No questions available for this exam.</div>;

  const currentQ = questions[currentQuestionIndex];
  const isMultipleCorrect = currentQ.questionType === 'multiple-correct';

  // Group questions by section
  const sections = Array.from(new Set(questions.map(q => q.section || 'General')));

  const handleSectionTabClick = (sectionName: string) => {
    const targetIdx = questions.findIndex(q => (q.section || 'General') === sectionName);
    if (targetIdx >= 0) {
      setCurrentQuestionIndex(targetIdx);
    }
  };

  const currentQuestionSection = currentQ.section || 'General';

  // Pre-Start Security check modal
  if (!isStarted) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-gold mx-auto mb-6 border border-amber-100 animate-pulse">
            <ShieldAlert size={32} />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2 font-serif">{attempt.exam.title}</h2>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-6">Security Check & Exam Protocols</p>
          
          <div className="text-left space-y-3.5 mb-8 text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs leading-relaxed">
            <h4 className="font-bold text-slate-800 text-sm mb-2 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-gold" /> Important Instructions:
            </h4>
            <p>1. <strong>Fullscreen Mode</strong>: This exam will run in mandatory fullscreen mode to prevent external searches.</p>
            <p>2. <strong>Tab-Switching Lock</strong>: Leaving the page or changing tabs will count as a violation. <strong>3 violations will automatically submit the exam.</strong></p>
            <p>3. <strong>Right-Click & Copy-Paste Disabled</strong>: Selection and right-clicking are locked on questions.</p>
            {attempt.exam.negativeMarking > 0 && (
              <p className="text-red-600 font-semibold">4. <strong>Negative Marking</strong>: Each wrong response deducts <strong>{attempt.exam.negativeMarking} marks</strong>.</p>
            )}
            <p>5. <strong>Timer</strong>: Timer runs continuously in the background. Closing or reloading this window will not pause the timer.</p>
          </div>

          <button
            onClick={startExamFullscreen}
            className="w-full py-4 bg-primary text-gold rounded-2xl font-serif font-bold tracking-wide hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all cursor-pointer text-sm"
          >
            Start Exam & Enter Fullscreen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      className="max-w-7xl mx-auto pb-10 px-4 select-none animate-in fade-in duration-300 min-h-screen bg-slate-50 p-6 rounded-3xl"
      style={{ userSelect: 'none' }}
    >
      {/* Exam Header */}
      <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-4 z-10">
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-serif leading-tight">{attempt.exam.title}</h2>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold border border-slate-200">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            {violations > 0 && (
              <span className="text-[11px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold border border-red-100 animate-pulse flex items-center gap-1">
                <ShieldAlert size={12} /> Violations: {violations}/3
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 self-end md:self-auto">
          {/* Language Toggle */}
          <button 
            onClick={() => setLanguage(lang => lang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-gold hover:bg-yellow-50/20 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Globe size={14} className="text-slate-400" />
            <span>{language === 'en' ? 'Hindi (हिंदी)' : 'English'}</span>
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <Clock size={16} className={timeLeft !== null && timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-400'} />
            <span className={`font-mono font-bold text-base ${timeLeft !== null && timeLeft < 300 ? 'text-red-600' : 'text-slate-700'}`}>
              {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
            </span>
          </div>
          
          <button 
            onClick={() => handleSubmit(false)}
            disabled={submitMutation.isPending}
            className="px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold flex items-center gap-1.5 hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer text-xs"
          >
            {submitMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Submit Exam
          </button>
        </div>
      </div>

      {/* Section Tabs row */}
      {sections.length > 1 && (
        <div className="flex bg-white p-2.5 rounded-xl border border-gray-100 mb-6 gap-2 overflow-x-auto">
          {sections.map((secName, idx) => {
            const isCurrentSec = currentQuestionSection === secName;
            return (
              <button
                key={idx}
                onClick={() => handleSectionTabClick(secName)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  isCurrentSec 
                    ? 'bg-primary text-gold shadow-xs' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                {secName}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Console Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Question and Options Panel */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col justify-between min-h-[480px]">
            
            <div>
              {/* Badges row */}
              <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
                <span className="text-[11px] uppercase font-extrabold text-primary bg-primary/5 px-2.5 py-1 rounded-lg">
                  {currentQuestionSection}
                </span>
                
                <div className="flex items-center gap-3">
                  {currentQ.difficultyLevel && (
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      currentQ.difficultyLevel === 'easy' ? 'bg-emerald-50 text-emerald-700' :
                      currentQ.difficultyLevel === 'hard' ? 'bg-rose-50 text-rose-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {currentQ.difficultyLevel}
                    </span>
                  )}
                  <span className="bg-blue-50 text-blue-700 px-3 py-0.5 rounded-md text-[11px] font-bold">
                    {currentQ.marks} {currentQ.marks === 1 ? 'Mark' : 'Marks'}
                  </span>
                </div>
              </div>

              {/* Paragraph details if paragraph type question */}
              {currentQ.questionType === 'paragraph' && (currentQ.paragraphText || currentQ.paragraphTextHindi) && (
                <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 max-h-[160px] overflow-y-auto leading-relaxed">
                  <strong className="text-slate-800 block mb-1">Passage / Paragraph:</strong>
                  <p className="whitespace-pre-line">
                    {language === 'hi' && currentQ.paragraphTextHindi ? currentQ.paragraphTextHindi : currentQ.paragraphText}
                  </p>
                </div>
              )}

              {/* Question Illustration Graphic */}
              {currentQ.imageUrl && (
                <div className="mb-6 rounded-xl overflow-hidden max-h-[250px] border border-slate-100 bg-slate-50 flex items-center justify-center p-2">
                  <img src={currentQ.imageUrl} alt="Question Diagram" className="max-w-full max-h-[230px] object-contain" />
                </div>
              )}

              {/* Assertion & Reason details */}
              {currentQ.questionType === 'assertion-reason' && (
                <div className="mb-5 bg-yellow-50/30 p-4 rounded-xl border border-yellow-100 text-xs text-slate-700 space-y-2">
                  <div>
                    <strong>Assertion (A):</strong> {language === 'hi' && currentQ.assertionHindi ? currentQ.assertionHindi : currentQ.assertion}
                  </div>
                  <div>
                    <strong>Reason (R):</strong> {language === 'hi' && currentQ.reasonHindi ? currentQ.reasonHindi : currentQ.reason}
                  </div>
                </div>
              )}

              {/* Question Text */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-800 leading-relaxed font-sans">
                  <span className="text-gold mr-1.5 font-bold font-serif">Q{currentQuestionIndex + 1}.</span> 
                  {language === 'hi' && currentQ.textHindi ? currentQ.textHindi : currentQ.text}
                </h3>
                {isMultipleCorrect && (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold mt-1 inline-block">
                    Multiple Choice (Choose one or more correct options)
                  </span>
                )}
              </div>

              {/* Options selection layout */}
              <div className="space-y-3">
                {currentQ.options.map((opt: string, idx: number) => {
                  const optText = language === 'hi' && currentQ.optionsHindi?.[idx] ? currentQ.optionsHindi[idx] : opt;
                  const isSelected = isMultipleCorrect 
                    ? getSelectedOptionIndices(currentQ._id).includes(idx)
                    : getSelectedOption(currentQ._id) === idx;

                  return (
                    <label 
                      key={idx}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-gold bg-yellow-50/40 shadow-xs' 
                          : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50'
                      }`}
                    >
                      <input 
                        type={isMultipleCorrect ? "checkbox" : "radio"} 
                        name={`question-${currentQ._id}`}
                        checked={isSelected}
                        onChange={() => handleOptionSelect(currentQ._id, idx, isMultipleCorrect)}
                        className="mt-1 w-4 h-4 text-gold focus:ring-gold accent-gold cursor-pointer"
                      />
                      <span className={`text-xs md:text-sm leading-relaxed ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                        <span className="font-bold mr-2 text-slate-400">{String.fromCharCode(65 + idx)}.</span>
                        {optText}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-5 border-t border-slate-100">
              
              <div className="flex gap-2.5 w-full sm:w-auto">
                {/* Clear Response */}
                <button 
                  onClick={() => clearResponse(currentQ._id)}
                  disabled={getSelectedOption(currentQ._id) === -1 && getSelectedOptionIndices(currentQ._id).length === 0}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:text-red-600 hover:border-red-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer text-xs font-bold flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                >
                  <Trash2 size={14} /> Clear Response
                </button>

                {/* Mark for Review */}
                <button 
                  onClick={() => {
                    setMarkedQuestions(prev => ({
                      ...prev,
                      [currentQ._id]: !prev[currentQ._id]
                    }));
                  }}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial ${
                    markedQuestions[currentQ._id]
                      ? 'bg-purple-50 border-purple-200 text-purple-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <HelpCircle size={14} /> 
                  {markedQuestions[currentQ._id] ? 'Marked for Review' : 'Mark for Review'}
                </button>
              </div>

              {/* Prev / Next buttons */}
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 font-bold flex items-center gap-1.5 rounded-xl hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs flex-1 sm:flex-initial justify-center"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                
                <button 
                  onClick={() => {
                    if (currentQuestionIndex < questions.length - 1) {
                      setCurrentQuestionIndex(prev => prev + 1);
                    }
                  }}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="px-5 py-2.5 bg-primary text-gold font-bold flex items-center gap-1.5 rounded-xl hover:bg-primary/95 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs flex-1 sm:flex-initial justify-center shadow-xs"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Sidebar Navigation Palette */}
        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-28 space-y-6">
            
            <div>
              <h4 className="font-bold text-slate-800 mb-3 text-[10px] uppercase tracking-wider text-slate-400">
                Question Palette
              </h4>
              <div className="grid grid-cols-4 gap-2 max-h-[260px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const status = getQuestionStatus(q._id);
                  const isCurrent = currentQuestionIndex === idx;
                  
                  let btnStyle = 'w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-all border cursor-pointer relative ';
                  
                  if (isCurrent) {
                    btnStyle += 'border-primary ring-2 ring-primary/20 scale-105 z-1';
                  } else {
                    btnStyle += 'border-slate-100 ';
                  }

                  if (status === 'answered-marked') {
                    btnStyle += 'bg-purple-600 text-white border-purple-600';
                  } else if (status === 'marked') {
                    btnStyle += 'bg-purple-100 text-purple-800 border-purple-200';
                  } else if (status === 'answered') {
                    btnStyle += 'bg-emerald-600 text-white border-emerald-600';
                  } else if (status === 'visited') {
                    btnStyle += 'bg-rose-50 text-rose-800 border-rose-200';
                  } else {
                    btnStyle += 'bg-slate-50 text-slate-400 hover:bg-slate-100';
                  }

                  return (
                    <button 
                      key={q._id} 
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={btnStyle}
                    >
                      {idx + 1}
                      {/* Answered & Marked dot indicator */}
                      {status === 'answered-marked' && (
                        <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full border border-purple-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Legends */}
            <div className="space-y-2 text-[10px] font-semibold text-slate-500 border-t border-slate-100 pt-4 leading-normal">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-emerald-600" /> 
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-rose-50 border border-rose-200" /> 
                <span>Not Answered (Visited)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-purple-100 border border-purple-200" /> 
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center gap-2 relative">
                <div className="w-3.5 h-3.5 rounded bg-purple-600" /> 
                <span className="absolute bottom-0 right-[-14px] w-1.5 h-1.5 bg-emerald-400 rounded-full border border-purple-600" style={{ transform: 'translate(-28px, -10px)' }} />
                <span>Answered & Marked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-slate-50 border border-slate-200" /> 
                <span>Not Visited</span>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExamAttempt;
