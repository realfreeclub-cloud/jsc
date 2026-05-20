import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Clock, CheckCircle, ChevronLeft, ChevronRight, AlertTriangle, ShieldAlert } from 'lucide-react';
import api from '../../utils/api';

interface ExamQuestion {
  _id: string;
  text: string;
  marks: number;
  options: string[];
  imageUrl?: string;
  difficultyLevel?: string;
}

interface ExamAttemptData {
  status: string;
  answers: { questionId: string; selectedOptionIndex: number }[];
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
  const [answers, setAnswers] = useState<{ questionId: string; selectedOptionIndex: number }[]>([]);
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
    mutationFn: (answersData: { questionId: string; selectedOptionIndex: number }[]) => 
      api.post(`/student-exams/attempt/${attemptId}/submit`, { 
        answers: answersData,
        antiCheatViolations: violations,
        timeSpentSeconds: data?.data?.attempt ? Math.floor((new Date().getTime() - new Date(data.data.attempt.startedAt).getTime()) / 1000) : 0
      }),
    onSuccess: () => {
      // Exit fullscreen on submit
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
      if (!force && !window.confirm('Are you sure you want to submit the exam?')) return;
      submitMutation.mutate(answersRef.current);
  };

  useEffect(() => {
    if (data?.data?.attempt && data?.data?.questions) {
        if (answers.length === 0 && data.data.attempt.answers) {
            setTimeout(() => {
                setAnswers(data.data!.attempt.answers);
            }, 0);
        }

        if (timeLeft === null) {
            const startedAt = new Date(data.data.attempt.startedAt).getTime();
            const durationMs = data.data.attempt.exam.durationMinutes * 60 * 1000;
            const endsAt = startedAt + durationMs;
            const now = new Date().getTime();
            
            const remaining = Math.max(0, Math.floor((endsAt - now) / 1000));
            setTimeout(() => {
                setTimeLeft(remaining);
            }, 0);
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

  // Tab switching / Focus loss detector (Anti-Cheat Engine)
  useEffect(() => {
    if (!isStarted || submitMutation.isPending) return;

    const handleViolation = () => {
      setViolations(prev => {
        const nextViolations = prev + 1;
        if (nextViolations >= 3) {
          alert('Anti-Cheat Warning: Tab switching detected 3 times. The exam will be auto-submitted now.');
          handleSubmit(true);
        } else {
          alert(`Anti-Cheat Warning: Switching tabs or leaving the screen is prohibited. Warning ${nextViolations}/3. The exam will auto-submit on the 3rd violation.`);
        }
        return nextViolations;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation();
      }
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

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
      const existingIdx = answers.findIndex(a => a.questionId === questionId);
      const newAnswers = [...answers];
      
      if (existingIdx >= 0) {
          newAnswers[existingIdx].selectedOptionIndex = optionIndex;
      } else {
          newAnswers.push({ questionId, selectedOptionIndex: optionIndex });
      }
      
      setAnswers(newAnswers);
  };

  const getSelectedOption = (questionId: string) => {
      const answer = answers.find(a => a.questionId === questionId);
      return answer ? answer.selectedOptionIndex : -1;
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
  if (error || !attempt) return <div className="text-center text-red-500 font-bold py-10">Failed to load exam data.</div>;
  
  if (attempt.status === 'completed') {
      return (
          <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Exam Already Submitted</h2>
              <button onClick={() => navigate(`/student/exams/results/${attemptId}`)} className="px-6 py-3 bg-primary text-gold rounded-xl font-bold">View Results</button>
          </div>
      );
  }
  if (questions.length === 0) return <div className="text-center py-10">No questions available for this exam.</div>;

  const currentQ = questions[currentQuestionIndex];

  // Welcome / Setup screen before starting exam questions
  if (!isStarted) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-gold mx-auto mb-6 border border-amber-100">
            <ShieldAlert size={32} />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{attempt.exam.title}</h2>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-6">Security Check & Exam Protocols</p>
          
          <div className="text-left space-y-3.5 mb-8 text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs">
            <h4 className="font-bold text-slate-800 text-sm mb-2 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-gold animate-pulse" /> Important Instructions:
            </h4>
            <p>1. **Fullscreen Mode**: This exam will run in mandatory fullscreen mode to prevent external searches.</p>
            <p>2. **Tab-Switching Lock**: Leaving the page or changing tabs will count as a violation. **3 violations will automatically submit the exam.**</p>
            <p>3. **Right-Click & Copy-Paste Disabled**: Selection and right-clicking are locked on questions.</p>
            {attempt.exam.negativeMarking > 0 && (
              <p className="text-red-600 font-semibold">4. **Negative Marking**: Each wrong response deducts **{attempt.exam.negativeMarking} marks**.</p>
            )}
            <p>5. **Attempts Limit**: This program enforces limited submissions. Closing this window will not stop the timer.</p>
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
      className="max-w-4xl mx-auto pb-10 px-4 select-none animate-in fade-in duration-300 min-h-screen bg-slate-50 p-6 rounded-3xl"
    >
      {/* Exam Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-4 z-10">
          <div>
              <h2 className="text-lg font-bold text-slate-800 font-serif">{attempt.exam.title}</h2>
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
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                  <Clock size={16} className={timeLeft !== null && timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-400'} />
                  <span className={`font-mono font-bold text-base ${timeLeft !== null && timeLeft < 300 ? 'text-red-600' : 'text-slate-700'}`}>
                      {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                  </span>
              </div>
              <button 
                  onClick={() => handleSubmit(false)}
                  disabled={submitMutation.isPending}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer text-xs"
              >
                  {submitMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  Submit Exam
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="md:col-span-3">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                  
                  {/* Difficulty & Marks badges */}
                  <div className="flex items-center justify-between mb-4">
                    {currentQ.difficultyLevel && (
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        currentQ.difficultyLevel === 'easy' ? 'bg-emerald-50 text-emerald-700' :
                        currentQ.difficultyLevel === 'hard' ? 'bg-rose-50 text-rose-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {currentQ.difficultyLevel}
                      </span>
                    )}
                    <span className="shrink-0 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                        {currentQ.marks} Marks
                    </span>
                  </div>

                  {/* Question image rendering */}
                  {currentQ.imageUrl && (
                    <div className="mb-6 rounded-xl overflow-hidden max-h-[300px] border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center p-2">
                      <img src={currentQ.imageUrl} alt="Question Diagram" className="max-w-full max-h-[280px] object-contain" />
                    </div>
                  )}

                  {/* Question Text */}
                  <div className="mb-6">
                      <h3 className="text-base font-bold text-slate-800 leading-relaxed font-sans">
                          <span className="text-gold mr-1.5 font-bold font-serif">Q{currentQuestionIndex + 1}.</span> 
                          {currentQ.text}
                      </h3>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                      {currentQ.options.map((opt: string, idx: number) => {
                          const isSelected = getSelectedOption(currentQ._id) === idx;
                          return (
                              <label 
                                  key={idx}
                                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-gold bg-yellow-50/50' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-slate-50/50'}`}
                              >
                                  <input 
                                      type="radio" 
                                      name={`question-${currentQ._id}`}
                                      checked={isSelected}
                                      onChange={() => handleOptionSelect(currentQ._id, idx)}
                                      className="mt-1 w-4 h-4 text-gold focus:ring-gold accent-gold"
                                  />
                                  <span className={`text-sm leading-relaxed ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                                      <span className="font-bold mr-2 text-slate-400">{String.fromCharCode(65 + idx)}.</span>
                                      {opt}
                                  </span>
                              </label>
                          );
                      })}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                      <button 
                          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                          disabled={currentQuestionIndex === 0}
                          className="px-4 py-2 rounded-xl border border-gray-200 text-slate-600 font-bold flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs"
                      >
                          <ChevronLeft size={16} /> Previous
                      </button>
                      
                      <button 
                          onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                          disabled={currentQuestionIndex === questions.length - 1}
                          className="px-4 py-2 rounded-xl bg-primary text-gold font-bold flex items-center gap-1.5 hover:bg-primary/95 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs"
                      >
                          Next <ChevronRight size={16} />
                      </button>
                  </div>
              </div>
          </div>

          {/* Question Palette Sidebar */}
          <div className="md:col-span-1">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-32">
                  <h4 className="font-bold text-slate-800 mb-4 text-[10px] uppercase tracking-wider">Palette</h4>
                  <div className="grid grid-cols-4 gap-2">
                      {questions.map((q: { _id: string }, idx: number) => {
                          const isAnswered = getSelectedOption(q._id) !== -1;
                          const isCurrent = currentQuestionIndex === idx;
                          
                          let btnClass = 'w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-all border cursor-pointer ';
                          
                          if (isCurrent) {
                              btnClass += 'border-primary bg-primary text-gold ring-2 ring-primary/20';
                          } else if (isAnswered) {
                              btnClass += 'border-green-500 bg-green-500 text-white';
                          } else {
                              btnClass += 'border-gray-200 bg-white text-slate-500 hover:bg-slate-50';
                          }

                          return (
                              <button 
                                  key={q._id} 
                                  onClick={() => setCurrentQuestionIndex(idx)}
                                  className={btnClass}
                              >
                                  {idx + 1}
                              </button>
                          );
                      })}
                  </div>
                  <div className="mt-6 space-y-2 text-[10px] font-semibold text-slate-500 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-green-500" /> Answered</div>
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-white border border-gray-300" /> Not Answered</div>
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-primary" /> Current</div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ExamAttempt;
