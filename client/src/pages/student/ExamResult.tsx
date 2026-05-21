import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Award, Target, HelpCircle, ShieldAlert, Timer, Info, Globe } from 'lucide-react';
import api from '../../utils/api';

interface ResultQuestion {
  _id: string;
  text: string;
  textHindi?: string;
  marks: number;
  correctOptionIndex: number;
  correctOptionIndices?: number[];
  options: string[];
  optionsHindi?: string[];
  explanation?: string;
  explanationHindi?: string;
  imageUrl?: string;
  difficultyLevel?: string;
  questionType?: 'single-correct' | 'multiple-correct' | 'true-false' | 'match-following' | 'assertion-reason' | 'paragraph';
  paragraphText?: string;
  paragraphTextHindi?: string;
  assertion?: string;
  assertionHindi?: string;
  reason?: string;
  reasonHindi?: string;
  subject?: string;
  topic?: string;
  section?: string;
}

interface ResultAttemptData {
  _id: string;
  score: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  skippedAnswers?: number;
  timeSpentSeconds?: number;
  isPassed?: boolean;
  antiCheatViolations?: number;
  answers: { question: string; selectedOptionIndex: number; selectedOptionIndices?: number[] }[];
  exam: {
    title: string;
    totalMarks: number;
    passingMarks: number;
    negativeMarking: number;
  };
}

interface SubjectStat {
  subject: string;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  marks: number;
  score: number;
  accuracy: number;
}

interface TopicStat {
  topic: string;
  subject: string;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  marks: number;
  score: number;
  accuracy: number;
}

interface SectionStat {
  sectionName: string;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  marks: number;
  score: number;
}

interface AttemptResultResponse {
  attempt: ResultAttemptData;
  questions: ResultQuestion[];
  analytics: {
    rankInfo: { rank: number; totalCandidates: number };
    subjectsAnalysis: SubjectStat[];
    topicsAnalysis: TopicStat[];
    sectionsAnalysis: SectionStat[];
    timeAnalysis: { averageTimePerQuestionSeconds: number };
  };
}

const ExamResult = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['attemptResult', attemptId],
    queryFn: () => api.get(`/student-exams/attempt/${attemptId}/result`).then((res: { data: { data: AttemptResultResponse } }) => res.data),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" size={40} /></div>;
  if (error || !data?.data) return <div className="text-center text-red-500 font-bold py-10">Failed to load result.</div>;

  const { attempt, questions, analytics } = data.data;

  const totalMarks = attempt.exam.totalMarks;
  const passingMarks = attempt.exam.passingMarks;
  const score = attempt.score;
  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
  
  const isPassed = attempt.isPassed !== undefined ? attempt.isPassed : score >= passingMarks;
  const correctCount = attempt.correctAnswers || 0;
  const incorrectCount = attempt.incorrectAnswers || 0;
  const skippedCount = attempt.skippedAnswers || 0;
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

  // Filtered list of questions for solution key
  const filteredQuestions = questions.filter((q) => {
    const studentAnswer = attempt.answers.find((a) => a.question === q._id);
    const selectedIndex = studentAnswer ? studentAnswer.selectedOptionIndex : -1;
    const selectedIndices = studentAnswer?.selectedOptionIndices || [];
    const isUnattempted = selectedIndex === -1 && selectedIndices.length === 0;

    let isCorrect = false;
    if (q.questionType === 'multiple-correct') {
      const correctIndices = q.correctOptionIndices || [q.correctOptionIndex];
      const hasSameLength = selectedIndices.length === correctIndices.length;
      const allMatch = selectedIndices.every((val) => correctIndices.includes(val));
      isCorrect = hasSameLength && allMatch;
    } else {
      isCorrect = selectedIndex === q.correctOptionIndex;
    }

    if (filterType === 'correct') return isCorrect;
    if (filterType === 'incorrect') return !isCorrect && !isUnattempted;
    if (filterType === 'skipped') return isUnattempted;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto pb-10 px-4 space-y-8 animate-in fade-in duration-300">
      
      {/* Back Navigation & Language Selector */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/student/exams')} className="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors font-bold text-xs cursor-pointer">
          <ArrowLeft size={14} /> Back to Test Directory
        </button>
        
        <button 
          onClick={() => setLanguage(lang => lang === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-gold hover:bg-yellow-50/20 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer bg-white shadow-xs"
        >
          <Globe size={14} className="text-slate-400" />
          <span>Toggle: {language === 'en' ? 'Hindi (हिंदी)' : 'English'}</span>
        </button>
      </div>

      {/* Performance Overview Banner Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xs relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-64 h-64 opacity-5 blur-3xl rounded-full ${isPassed ? 'bg-green-500' : 'bg-red-500'} -translate-y-1/2 translate-x-1/3`} />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-slate-800 leading-tight">Performance Analytics</h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">{attempt.exam.title}</p>
          </div>

          {/* Rank Badge Indicator */}
          {analytics?.rankInfo && (
            <div className="bg-gradient-to-br from-primary to-slate-900 border border-slate-800 text-white rounded-2xl px-5 py-3 flex items-center gap-3 shrink-0 shadow-sm">
              <Award className="text-gold shrink-0 animate-bounce" size={24} />
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">State Rank</div>
                <div className="text-lg font-black text-gold leading-none">
                  #{analytics.rankInfo.rank} <span className="text-xs text-white font-normal">of {analytics.rankInfo.totalCandidates}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
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
            <div className="w-9 h-9 rounded-full bg-slate-100 text-gray-500 flex items-center justify-center mx-auto mb-2 border border-gray-200">
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
            <ShieldAlert size={18} className="shrink-0 animate-bounce text-red-600" />
            <span>
              <strong>Anti-Cheat Log</strong>: This attempt registered <strong>{violations} window refocus violations</strong>. Multiple infractions may flag results.
            </span>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center">
          <div className={`px-6 py-1.5 rounded-full font-bold text-xs tracking-widest uppercase ${isPassed ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {isPassed ? 'Passed' : 'Failed'}
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Passing threshold is <strong>{passingMarks} marks</strong>. You achieved <strong>{percentage.toFixed(1)}%</strong>.
          </p>
        </div>
      </div>

      {/* Section-wise Breakdown Panel */}
      {analytics?.sectionsAnalysis && analytics.sectionsAnalysis.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
          <h3 className="text-base font-bold text-slate-800 mb-4 font-serif">Sectional Performance Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold">
                  <th className="py-2.5">Section Name</th>
                  <th className="py-2.5 text-center">Total Qs</th>
                  <th className="py-2.5 text-center text-green-600">Correct</th>
                  <th className="py-2.5 text-center text-red-600">Incorrect</th>
                  <th className="py-2.5 text-center text-slate-500">Skipped</th>
                  <th className="py-2.5 text-right">Max Marks</th>
                  <th className="py-2.5 text-right font-bold">Obtained Score</th>
                </tr>
              </thead>
              <tbody>
                {analytics.sectionsAnalysis.map((sec, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-800">{sec.sectionName}</td>
                    <td className="py-3 text-center font-medium text-slate-700">{sec.total}</td>
                    <td className="py-3 text-center font-bold text-green-600">{sec.correct}</td>
                    <td className="py-3 text-center font-bold text-red-500">{sec.incorrect}</td>
                    <td className="py-3 text-center text-slate-400">{sec.skipped}</td>
                    <td className="py-3 text-right text-slate-500">{sec.marks}</td>
                    <td className="py-3 text-right font-bold text-primary">{sec.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subject & Topic Accuracy Analysis Grid */}
      {analytics?.subjectsAnalysis && analytics.subjectsAnalysis.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subject Level */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800 font-serif border-b border-slate-50 pb-2">Subject Accuracy Breakdown</h3>
            <div className="space-y-4">
              {analytics.subjectsAnalysis.map((sub, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{sub.subject}</span>
                    <span>{sub.correct}/{sub.total} Correct ({sub.accuracy}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        sub.accuracy >= 70 ? 'bg-green-500' : sub.accuracy >= 40 ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${sub.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Topic Level */}
          {analytics?.topicsAnalysis && analytics.topicsAnalysis.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-800 font-serif border-b border-slate-50 pb-2">Topic Accuracy Breakdown</h3>
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {analytics.topicsAnalysis.map((top, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <div>
                        <span>{top.topic}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">({top.subject})</span>
                      </div>
                      <span>{top.correct}/{top.total} ({top.accuracy}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          top.accuracy >= 70 ? 'bg-green-500' : top.accuracy >= 40 ? 'bg-amber-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${top.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Solutions list Filters & Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider font-serif">
            <Target className="text-gold" size={20} /> Solution Key & Explanations
          </h3>

          {/* Filters */}
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold gap-1 self-start sm:self-auto">
            {(['all', 'correct', 'incorrect', 'skipped'] as const).map((type) => {
              const label = type === 'all' ? `All (${questions.length})` :
                            type === 'correct' ? `Correct (${correctCount})` :
                            type === 'incorrect' ? `Wrong (${incorrectCount})` : `Skipped (${skippedCount})`;
              const isSel = filterType === type;
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                    isSel ? 'bg-primary text-gold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Questions list */}
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 text-slate-500 text-xs">
            No questions found matching this filter criteria.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q: ResultQuestion) => {
              const studentAnswer = attempt.answers.find((a) => a.question === q._id);
              const selectedIndex = studentAnswer ? studentAnswer.selectedOptionIndex : -1;
              const selectedIndices = studentAnswer?.selectedOptionIndices || [];
              const isUnattempted = selectedIndex === -1 && selectedIndices.length === 0;

              let isCorrect = false;
              if (q.questionType === 'multiple-correct') {
                const correctIndices = q.correctOptionIndices || [q.correctOptionIndex];
                const hasSameLength = selectedIndices.length === correctIndices.length;
                const allMatch = selectedIndices.every((val) => correctIndices.includes(val));
                isCorrect = hasSameLength && allMatch;
              } else {
                isCorrect = selectedIndex === q.correctOptionIndex;
              }

              const actualQIdx = questions.findIndex(origQ => origQ._id === q._id) + 1;

              return (
                <div key={q._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-50 pb-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold font-serif text-sm">Q{actualQIdx}.</span>
                        <span className="text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded font-semibold uppercase">
                          {q.section || 'General'}
                        </span>
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
                      
                      {/* Passage / Paragraph if relevant */}
                      {q.questionType === 'paragraph' && (q.paragraphText || q.paragraphTextHindi) && (
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 max-h-[140px] overflow-y-auto mb-3 whitespace-pre-line leading-relaxed">
                          <strong>Passage:</strong> {language === 'hi' && q.paragraphTextHindi ? q.paragraphTextHindi : q.paragraphText}
                        </div>
                      )}

                      {/* Assertion & Reason */}
                      {q.questionType === 'assertion-reason' && (
                        <div className="bg-yellow-50/20 p-3 rounded-lg border border-yellow-100 text-xs text-slate-700 space-y-1.5 mb-3">
                          <div><strong>Assertion (A):</strong> {language === 'hi' && q.assertionHindi ? q.assertionHindi : q.assertion}</div>
                          <div><strong>Reason (R):</strong> {language === 'hi' && q.reasonHindi ? q.reasonHindi : q.reason}</div>
                        </div>
                      )}

                      <h4 className="font-bold text-slate-800 text-sm leading-relaxed">
                        {language === 'hi' && q.textHindi ? q.textHindi : q.text}
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

                  {/* Graphic Diagram */}
                  {q.imageUrl && (
                    <div className="rounded-xl overflow-hidden max-h-[220px] border border-slate-100 bg-slate-50 flex items-center justify-center p-2">
                      <img src={q.imageUrl} alt="Question Graphic" className="max-h-[200px] object-contain" />
                    </div>
                  )}

                  {/* Options review */}
                  <div className="space-y-2.5 pl-4">
                    {q.options.map((opt: string, optIdx: number) => {
                      const optText = language === 'hi' && q.optionsHindi?.[optIdx] ? q.optionsHindi[optIdx] : opt;
                      const isMultiple = q.questionType === 'multiple-correct';

                      // Find if this specific option was selected
                      const isThisSelected = isMultiple 
                        ? selectedIndices.includes(optIdx)
                        : selectedIndex === optIdx;

                      // Find if this specific option is correct
                      const isThisCorrect = isMultiple
                        ? (q.correctOptionIndices || [q.correctOptionIndex]).includes(optIdx)
                        : q.correctOptionIndex === optIdx;
                      
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
                            <span className="flex items-center gap-2">
                              <input 
                                type={isMultiple ? "checkbox" : "radio"}
                                checked={isThisSelected}
                                disabled
                                className="accent-gold w-3.5 h-3.5"
                              />
                              <span><span className="font-bold opacity-50 mr-1">{String.fromCharCode(65 + optIdx)}.</span> {optText}</span>
                            </span>
                            {isThisCorrect && <CheckCircle2 size={15} className="text-green-500 shrink-0" />}
                            {isThisSelected && !isThisCorrect && <XCircle size={15} className="text-red-500 shrink-0" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Solution & Explanation */}
                  {(q.explanation || q.explanationHindi) && (
                    <div className="mt-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs pl-6">
                      <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                        <Info size={13} className="text-gold" /> Solution & Explanation:
                      </h5>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {language === 'hi' && q.explanationHindi ? q.explanationHindi : q.explanation}
                      </p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default ExamResult;
