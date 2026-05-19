import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Award, Target, HelpCircle } from 'lucide-react';
import api from '../../utils/api';

interface ResultQuestion {
  _id: string;
  text: string;
  marks: number;
  correctOptionIndex: number;
  options: string[];
}

interface ResultAttemptData {
  score: number;
  answers: { question: string; selectedOptionIndex: number }[];
  exam: {
    title: string;
    totalMarks: number;
    passingMarks: number;
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
  const isPassed = score >= passingMarks;

  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  questions.forEach((q: { _id: string; correctOptionIndex: number }) => {
      const studentAnswer = attempt.answers.find((a: { question: string; selectedOptionIndex: number }) => a.question === q._id);
      const selectedIndex = studentAnswer ? studentAnswer.selectedOptionIndex : -1;

      if (selectedIndex === -1) {
          unattemptedCount++;
      } else if (selectedIndex === q.correctOptionIndex) {
          correctCount++;
      } else {
          incorrectCount++;
      }
  });

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-6">
        <button onClick={() => navigate('/student/exams')} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-semibold text-sm">
            <ArrowLeft size={16} /> Back to Exams
        </button>

        {/* Top Summary Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-64 h-64 opacity-5 blur-3xl rounded-full ${isPassed ? 'bg-green-500' : 'bg-red-500'} -translate-y-1/2 translate-x-1/3`} />
            
            <div className="text-center mb-8 relative z-10">
                <h1 className="text-3xl font-bold font-serif text-slate-800 mb-2">Performance Report</h1>
                <p className="text-slate-500">{attempt.exam.title}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                        <Award size={24} />
                    </div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Score</div>
                    <div className="text-2xl font-bold text-slate-800">{score} <span className="text-sm text-slate-400">/ {totalMarks}</span></div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Correct</div>
                    <div className="text-2xl font-bold text-slate-800">{correctCount}</div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                        <XCircle size={24} />
                    </div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Incorrect</div>
                    <div className="text-2xl font-bold text-slate-800">{incorrectCount}</div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mx-auto mb-3">
                        <HelpCircle size={24} />
                    </div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Skipped</div>
                    <div className="text-2xl font-bold text-slate-800">{unattemptedCount}</div>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col items-center">
                <div className={`px-6 py-2 rounded-full font-bold text-sm tracking-widest uppercase ${isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isPassed ? 'Passed' : 'Failed'}
                </div>
                <p className="text-sm text-slate-500 mt-3 font-medium">
                    Passing requires {passingMarks} marks. You achieved {percentage.toFixed(1)}%.
                </p>
            </div>
        </div>

        {/* Detailed Solutions */}
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Target className="text-gold" size={24} /> Detailed Analysis
            </h3>
            <div className="space-y-4">
                {questions.map((q: { _id: string; text: string; marks: number; correctOptionIndex: number; options: string[] }, idx: number) => {
                    const studentAnswer = attempt.answers.find((a: { question: string; selectedOptionIndex: number }) => a.question === q._id);
                    const selectedIndex = studentAnswer ? studentAnswer.selectedOptionIndex : -1;
                    const isCorrect = selectedIndex === q.correctOptionIndex;
                    const isUnattempted = selectedIndex === -1;

                    return (
                        <div key={q._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <h4 className="font-bold text-slate-800">
                                    <span className="text-slate-400 mr-2">Q{idx + 1}.</span>
                                    {q.text}
                                </h4>
                                <div className="shrink-0">
                                    {isCorrect ? (
                                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded font-bold text-xs"><CheckCircle2 size={14} /> +{q.marks}</span>
                                    ) : isUnattempted ? (
                                        <span className="flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded font-bold text-xs"><HelpCircle size={14} /> 0</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded font-bold text-xs"><XCircle size={14} /> 0</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 pl-6">
                                {q.options.map((opt: string, optIdx: number) => {
                                    const isThisSelected = selectedIndex === optIdx;
                                    const isThisCorrect = q.correctOptionIndex === optIdx;
                                    
                                    let optionClass = "p-3 rounded-xl border text-sm font-medium transition-colors ";
                                    
                                    if (isThisCorrect) {
                                        optionClass += "border-green-200 bg-green-50 text-green-800";
                                    } else if (isThisSelected && !isThisCorrect) {
                                        optionClass += "border-red-200 bg-red-50 text-red-800";
                                    } else {
                                        optionClass += "border-gray-100 bg-gray-50 text-slate-600";
                                    }

                                    return (
                                        <div key={optIdx} className={optionClass}>
                                            <div className="flex items-center justify-between">
                                                <span><span className="font-bold opacity-50 mr-2">{String.fromCharCode(65 + optIdx)}.</span> {opt}</span>
                                                {isThisCorrect && <CheckCircle2 size={16} className="text-green-500" />}
                                                {isThisSelected && !isThisCorrect && <XCircle size={16} className="text-red-500" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default ExamResult;
