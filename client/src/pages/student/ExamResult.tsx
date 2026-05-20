import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Award, Target, HelpCircle, ShieldAlert, Timer, Info } from 'lucide-react';
import api from '../../utils/api';

interface ResultQuestion {
  _id: string;
  text: string;
  marks: number;
  correctOptionIndex: number;
  options: string[];
  explanation?: string;
  imageUrl?: string;
  difficultyLevel?: string;
}

interface ResultAttemptData {
  score: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  skippedAnswers?: number;
  timeSpentSeconds?: number;
  isPassed?: boolean;
  antiCheatViolations?: number;
  answers: { question: string; selectedOptionIndex: number }[];
  exam: {
    title: string;
    totalMarks: number;
    passingMarks: number;
    negativeMarking: number;
  };
}

const ExamResult = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['attemptResult', attemptId],
    queryFn: () => api.get(`/student-exams/attempt/${attemptId}/result`).then((res: { data: { data: { attempt: ResultAttemptData; questions: ResultQuestion[] } } }) => res.data),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" size={40} /></div>;
  if (error || !data?.data) return <div className="text-center text-red-500 font-bold py-10">Failed to load result.</div>;

  const attempt = data.data.attempt;
  const questions = data.data.questions;

  const totalMarks = attempt.exam.totalMarks;
  const passingMarks = attempt.exam.passingMarks;
  const score = attempt.score;
  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
  
  // Use server computed status if present, otherwise calculate fallback
  const isPassed = attempt.isPassed !== undefined ? attempt.isPassed : score >= passingMarks;

  const correctCount = attempt.correctAnswers !== undefined ? attempt.correctAnswers : 
    questions.filter(q => {
      const ans = attempt.answers.find(a => a.question === q._id);
      return ans && ans.selectedOptionIndex === q.correctOptionIndex;
    }).length;

  const incorrectCount = attempt.incorrectAnswers !== undefined ? attempt.incorrectAnswers :
    questions.filter(q => {
      const ans = attempt.answers.find(a => a.question === q._id);
      return ans && ans.selectedOptionIndex !== -1 && ans.selectedOptionIndex !== q.correctOptionIndex;
    }).length;

  const skippedCount = attempt.skippedAnswers !== undefined ? attempt.skippedAnswers :
    questions.filter(q => {
      const ans = attempt.answers.find(a => a.question === q._id);
      return !ans || ans.selectedOptionIndex === -1;
    }).length;

  const timeSpent = attempt.timeSpentSeconds || 0;
  const violations = attempt.antiCheatViolations || 0;
  
  const totalAnswered = correctCount + incorrectCount;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  const formatTimeSpent = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 px-4 space-y-6 animate-in fade-in duration-300">
        <button onClick={() => navigate('/student/exams')} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-xs">
            <ArrowLeft size={14} /> Back to Exams Directory
        </button>

        {/* Performance Overview Banner Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-64 h-64 opacity-5 blur-3xl rounded-full ${isPassed ? 'bg-green-500' : 'bg-red-500'} -translate-y-1/2 translate-x-1/3`} />
            
            <div className="text-center mb-8 relative z-10">
                <h1 className="text-2xl md:text-3xl font-bold font-serif text-slate-800 mb-2">Performance Analytics</h1>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{attempt.exam.title}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 border border-blue-100">
                        <Award size={18} />
                    </div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Score</div>
                    <div className="text-lg font-bold text-slate-800">{score} <span className="text-[10px] text-slate-400">/ {totalMarks}</span></div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-2 border border-green-100">
                        <CheckCircle2 size={18} />
                    </div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Correct</div>
                    <div className="text-lg font-bold text-slate-800">{correctCount}</div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-2 border border-red-100">
                        <XCircle size={18} />
                    </div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Wrong</div>
                    <div className="text-lg font-bold text-slate-800">{incorrectCount}</div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mx-auto mb-2 border border-gray-200">
                        <HelpCircle size={18} />
                    </div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Skipped</div>
                    <div className="text-lg font-bold text-slate-800">{skippedCount}</div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 border border-amber-100">
                        <Timer size={18} />
                    </div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Time Spent</div>
                    <div className="text-lg font-bold text-slate-800">{formatTimeSpent(timeSpent)}</div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2 border border-purple-100">
                        <Target size={18} />
                    </div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Accuracy</div>
                    <div className="text-lg font-bold text-slate-800">{accuracy}%</div>
                </div>
            </div>

            {/* Anti-cheat status banner */}
            {violations > 0 && (
              <div className="mt-5 p-3.5 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-700 text-xs">
                <ShieldAlert size={18} className="shrink-0 animate-bounce" />
                <span>
                  **Anti-Cheat Flag**: This attempt logged **{violations} focus-loss / tab-switching violations**. High violation frequency is reviewed by faculty.
                </span>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center">
                <div className={`px-6 py-2 rounded-full font-bold text-xs tracking-widest uppercase ${isPassed ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {isPassed ? 'Passed' : 'Failed'}
                </div>
                <p className="text-xs text-slate-500 mt-2.5 font-medium">
                    Passing threshold is **{passingMarks} marks**. You achieved **{percentage.toFixed(1)}%**.
                </p>
            </div>
        </div>

        {/* Detailed Solutions Section */}
        <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Target className="text-gold" size={20} /> Solution keys & Analysis
            </h3>
            <div className="space-y-4">
                {questions.map((q: ResultQuestion, idx: number) => {
                    const studentAnswer = attempt.answers.find((a: { question: string; selectedOptionIndex: number }) => a.question === q._id);
                    const selectedIndex = studentAnswer ? studentAnswer.selectedOptionIndex : -1;
                    const isCorrect = selectedIndex === q.correctOptionIndex;
                    const isUnattempted = selectedIndex === -1;

                    return (
                        <div key={q._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400 font-bold font-serif text-sm">Q{idx + 1}.</span>
                                    {q.difficultyLevel && (
                                      <span className={`text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                                        q.difficultyLevel === 'easy' ? 'bg-emerald-50 text-emerald-700' :
                                        q.difficultyLevel === 'hard' ? 'bg-rose-50 text-rose-700' :
                                        'bg-amber-50 text-amber-700'
                                      }`}>
                                        {q.difficultyLevel}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-bold text-slate-800 text-sm leading-relaxed">
                                      {q.text}
                                  </h4>
                                </div>
                                <div className="shrink-0 mt-1">
                                    {isCorrect ? (
                                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100 font-bold text-xs"><CheckCircle2 size={13} /> +{q.marks}</span>
                                    ) : isUnattempted ? (
                                        <span className="flex items-center gap-1 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 font-bold text-xs"><HelpCircle size={13} /> Skipped</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100 font-bold text-xs">
                                          <XCircle size={13} /> 
                                          {attempt.exam.negativeMarking > 0 ? `-${attempt.exam.negativeMarking}` : '0'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Question diagram if present */}
                            {q.imageUrl && (
                              <div className="rounded-xl overflow-hidden max-h-[250px] border border-slate-100 bg-slate-50 flex items-center justify-center p-2">
                                <img src={q.imageUrl} alt="Question Graphic" className="max-h-[230px] object-contain" />
                              </div>
                            )}

                            {/* Solutions review options */}
                            <div className="space-y-2.5 pl-6">
                                {q.options.map((opt: string, optIdx: number) => {
                                    const isThisSelected = selectedIndex === optIdx;
                                    const isThisCorrect = q.correctOptionIndex === optIdx;
                                    
                                    let optionClass = "p-3 rounded-xl border text-xs font-semibold transition-colors ";
                                    
                                    if (isThisCorrect) {
                                        optionClass += "border-green-200 bg-green-50/60 text-green-800";
                                    } else if (isThisSelected && !isThisCorrect) {
                                        optionClass += "border-red-200 bg-red-50/60 text-red-800";
                                    } else {
                                        optionClass += "border-slate-100 bg-slate-50/50 text-slate-600";
                                    }

                                    return (
                                        <div key={optIdx} className={optionClass}>
                                            <div className="flex items-center justify-between">
                                                <span><span className="font-bold opacity-50 mr-2">{String.fromCharCode(65 + optIdx)}.</span> {opt}</span>
                                                {isThisCorrect && <CheckCircle2 size={15} className="text-green-500 shrink-0" />}
                                                {isThisSelected && !isThisCorrect && <XCircle size={15} className="text-red-500 shrink-0" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Solution explanation */}
                            {q.explanation && (
                              <div className="mt-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs pl-6">
                                <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                                  <Info size={13} className="text-gold" /> Solution & Explanation:
                                </h5>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{q.explanation}</p>
                              </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default ExamResult;
