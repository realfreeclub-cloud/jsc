import { useQuery } from '@tanstack/react-query';
import { Loader2, FileText, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

interface ExamListItem {
  _id: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  lastAttemptStatus: string;
  bestScore: number;
  attemptsCount: number;
  lastAttemptId: string;
}

const ExamsList = () => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['studentExams'],
    queryFn: () => api.get('/student-exams/available').then((res: { data: { data: { exams: ExamListItem[] } } }) => res.data),
  });

  const exams = data?.data?.exams || [];

  const handleStartExam = async (examId: string) => {
    try {
        const response = await api.post('/student-exams/start', { examId });
        const attemptId = response.data.data.attempt._id;
        navigate(`/student/exams/${attemptId}/attempt`);
    } catch(err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        alert(error.response?.data?.message || 'Failed to start exam');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-serif">Test Series</h2>
          <p className="text-slate-500 text-sm">Attempt practice exams for your enrolled courses</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gold" size={40} />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-semibold">
          Failed to load exams. Please try again later.
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-xs border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No Exams Available</h3>
          <p className="text-slate-500">There are currently no active exams for your enrolled courses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {exams.map((exam: { _id: string; title: string; description: string; durationMinutes: number; totalMarks: number; lastAttemptStatus: string; bestScore: number; attemptsCount: number; lastAttemptId: string }) => (
            <div key={exam._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-gold/10 to-transparent rounded-bl-full z-0" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center shrink-0">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 leading-tight">{exam.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{exam.description || 'MCQ Based Test'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <Clock size={14} />
                            <span className="text-xs font-semibold uppercase tracking-wider">Duration</span>
                        </div>
                        <div className="font-bold text-slate-700">{exam.durationMinutes} mins</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <CheckCircle size={14} />
                            <span className="text-xs font-semibold uppercase tracking-wider">Marks</span>
                        </div>
                        <div className="font-bold text-slate-700">{exam.totalMarks}</div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    {exam.lastAttemptStatus === 'completed' ? (
                         <div className="flex flex-col">
                            <span className="text-xs text-slate-500">Best Score</span>
                            <span className="text-sm font-bold text-green-600">{exam.bestScore} / {exam.totalMarks}</span>
                         </div>
                    ) : (
                         <div className="text-xs text-slate-500 font-medium">
                            {exam.attemptsCount} Attempts
                         </div>
                    )}
                    
                    {exam.lastAttemptStatus === 'in-progress' ? (
                         <button onClick={() => navigate(`/student/exams/${exam.lastAttemptId}/attempt`)} className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-yellow-200 transition-colors">
                            Resume <ArrowRight size={16} />
                         </button>
                    ) : (
                        <button onClick={() => handleStartExam(exam._id)} className="px-4 py-2 bg-primary text-gold rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
                            {exam.attemptsCount > 0 ? 'Retake' : 'Start Exam'} <ArrowRight size={16} />
                        </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamsList;
