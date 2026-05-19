import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

interface ExamQuestion {
  _id: string;
  text: string;
  marks: number;
  options: string[];
}

interface ExamAttemptData {
  status: string;
  answers: { questionId: string; selectedOptionIndex: number }[];
  startedAt: string;
  exam: {
    title: string;
    durationMinutes: number;
  };
}

const ExamAttempt = () => {
  const { id: attemptId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedOptionIndex: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['attemptQuestions', attemptId],
    queryFn: () => api.get(`/student-exams/attempt/${attemptId}/questions`).then((res: { data: { data: { attempt: ExamAttemptData; questions: ExamQuestion[] } } }) => res.data),
  });

  const submitMutation = useMutation({
    mutationFn: (answersData: { questionId: string; selectedOptionIndex: number }[]) => api.post(`/student-exams/attempt/${attemptId}/submit`, { answers: answersData }),
    onSuccess: () => {
        navigate(`/student/exams/results/${attemptId}`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
        alert(err.response?.data?.message || 'Failed to submit exam');
    }
  });

  const handleSubmit = () => {
      if (!window.confirm('Are you sure you want to submit the exam?')) return;
      submitMutation.mutate(answers);
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
        handleSubmit();
        return;
    }

    const timer = setInterval(() => {
        setTimeLeft(prev => prev !== null ? prev - 1 : prev);
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

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

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* Exam Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-4 z-10">
          <div>
              <h2 className="text-xl font-bold text-slate-800">{attempt.exam.title}</h2>
              <p className="text-sm text-slate-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                  <Clock size={18} className={timeLeft !== null && timeLeft < 300 ? 'text-red-500' : 'text-slate-400'} />
                  <span className={`font-mono font-bold text-lg ${timeLeft !== null && timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                      {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                  </span>
              </div>
              <button 
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
              >
                  {submitMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  Submit Exam
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="md:col-span-3">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-6">
                      <h3 className="text-lg font-bold text-slate-800 leading-relaxed pr-8">
                          <span className="text-gold mr-2">Q{currentQuestionIndex + 1}.</span> 
                          {currentQ.text}
                      </h3>
                      <span className="shrink-0 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                          {currentQ.marks} Marks
                      </span>
                  </div>

                  <div className="space-y-3">
                      {currentQ.options.map((opt: string, idx: number) => {
                          const isSelected = getSelectedOption(currentQ._id) === idx;
                          return (
                              <label 
                                  key={idx}
                                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-gold bg-yellow-50' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-slate-50'}`}
                              >
                                  <input 
                                      type="radio" 
                                      name={`question-${currentQ._id}`}
                                      checked={isSelected}
                                      onChange={() => handleOptionSelect(currentQ._id, idx)}
                                      className="mt-1 w-4 h-4 text-gold focus:ring-gold"
                                  />
                                  <span className={`text-sm ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
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
                          className="px-5 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-bold flex items-center gap-2 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                          <ChevronLeft size={18} /> Previous
                      </button>
                      
                      <button 
                          onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                          disabled={currentQuestionIndex === questions.length - 1}
                          className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                          Next <ChevronRight size={18} />
                      </button>
                  </div>
              </div>
          </div>

          {/* Question Palette Sidebar */}
          <div className="md:col-span-1">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-32">
                  <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Question Palette</h4>
                  <div className="grid grid-cols-4 gap-2">
                      {questions.map((q: { _id: string }, idx: number) => {
                          const isAnswered = getSelectedOption(q._id) !== -1;
                          const isCurrent = currentQuestionIndex === idx;
                          
                          let btnClass = 'w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all border ';
                          
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
                  <div className="mt-6 space-y-2 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500" /> Answered</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-white border border-gray-300" /> Not Answered</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary" /> Current</div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ExamAttempt;
