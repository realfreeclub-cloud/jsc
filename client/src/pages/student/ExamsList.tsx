import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, FileText, ArrowRight, CheckCircle, Clock, Lock, Unlock, HelpCircle, AlertCircle, ShoppingCart } from 'lucide-react';
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
  accessType?: 'free' | 'paid';
  pricing?: number;
  discountedPrice?: number;
  isLocked?: boolean;
  accessStatus?: 'unsubscribed' | 'pending' | 'active' | 'rejected' | 'expired';
  isLifetimeAccess?: boolean;
  enrollmentExpiryDate?: string;
  attemptsAllowed: number;
}

const ExamsList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'free' | 'paid' | 'history'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; whatsappUrl?: string; isLocked?: boolean } } };
      if (error.response?.data?.isLocked && error.response?.data?.whatsappUrl) {
        if (window.confirm(error.response.data.message + '\n\nWould you like to contact us on WhatsApp to unlock this test series?')) {
          window.open(error.response.data.whatsappUrl, '_blank');
        }
      } else {
        alert(error.response?.data?.message || 'Failed to start exam');
      }
    }
  };

  const handleUnlock = async (examId: string) => {
    try {
      const response = await api.post('/test-enrollments/enroll', { examId });
      if (response.data.whatsappUrl) {
        window.open(response.data.whatsappUrl, '_blank');
      }
      alert(response.data.message || 'Unlock request registered. Redirecting to WhatsApp for payment...');
      queryClient.invalidateQueries({ queryKey: ['studentExams'] });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to request unlock');
    }
  };

  // Filtering exams based on selected tab and search query
  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (exam.description && exam.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (activeTab === 'free') {
      return exam.accessType === 'free';
    }
    if (activeTab === 'paid') {
      return exam.accessType === 'paid';
    }
    if (activeTab === 'history') {
      return exam.attemptsCount > 0;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-serif">Test Series</h2>
          <p className="text-slate-500 text-sm">Attempt practice exams for your enrolled courses</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search test series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-100 gap-6">
        {(['all', 'free', 'paid', 'history'] as const).map((tab) => {
          const label = tab === 'all' ? 'All Test Series' : 
                        tab === 'free' ? 'Free Tests' : 
                        tab === 'paid' ? 'Paid Test Series' : 'My Attempt History';
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
                isActive 
                  ? 'border-gold text-slate-800 font-bold' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gold" size={40} />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center font-semibold border border-red-100 flex items-center justify-center gap-3">
          <AlertCircle size={20} />
          Failed to load exams. Please check your internet connection or try again later.
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-xs border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No Exams Available</h3>
          <p className="text-slate-500">There are currently no active exams matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const isLocked = exam.isLocked;
            const isPaid = exam.accessType === 'paid';
            const status = exam.accessStatus || 'unsubscribed';

            return (
              <div 
                key={exam._id} 
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group"
              >
                {/* Visual Accent Badge */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gold/10 to-transparent rounded-bl-full z-0" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    {/* Free/Paid badge */}
                    <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full ${
                      isPaid 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {isPaid ? 'Paid' : 'Free'}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-bold text-slate-800 leading-tight flex items-center gap-1.5">
                      {exam.title}
                      {isLocked && <Lock size={14} className="text-red-500 shrink-0" />}
                      {!isLocked && isPaid && <Unlock size={14} className="text-green-600 shrink-0" />}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{exam.description || 'MCQ Based Test Series'}</p>
                  </div>

                  {/* Exam Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                        <Clock size={12} />
                        <span className="text-[9px] font-semibold uppercase tracking-wider">Duration</span>
                      </div>
                      <div className="font-bold text-slate-700 text-sm">{exam.durationMinutes} mins</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                        <CheckCircle size={12} />
                        <span className="text-[9px] font-semibold uppercase tracking-wider">Marks</span>
                      </div>
                      <div className="font-bold text-slate-700 text-sm">{exam.totalMarks} Marks</div>
                    </div>
                  </div>

                  {/* Attempt constraints info */}
                  <div className="text-[10px] text-slate-400 font-medium mb-4 flex items-center gap-1">
                    <HelpCircle size={12} />
                    <span>
                      Attempts: {exam.attemptsAllowed > 0 ? `${exam.attemptsCount} / ${exam.attemptsAllowed} used` : `${exam.attemptsCount} completed (Unlimited)`}
                    </span>
                  </div>

                  {/* Expiry / Purchase info if Active */}
                  {status === 'active' && isPaid && (
                    <div className="text-[11px] bg-emerald-50 text-emerald-800 p-2 rounded-xl mb-4 border border-emerald-100">
                      Access: {exam.isLifetimeAccess ? 'Lifetime Access' : exam.enrollmentExpiryDate ? `Expires on ${new Date(exam.enrollmentExpiryDate).toLocaleDateString('en-IN')}` : 'Activated'}
                    </div>
                  )}
                </div>

                <div className="relative z-10 mt-2 border-t border-slate-50 pt-4 flex items-center justify-between">
                  {/* Left Side Info: Price details or score details */}
                  <div>
                    {isLocked ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 line-through">₹{exam.pricing || 999}</span>
                        <span className="text-sm font-extrabold text-slate-800">₹{exam.discountedPrice || 499}</span>
                      </div>
                    ) : exam.bestScore !== null ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400">Best Score</span>
                        <span className="text-xs font-bold text-green-600">{exam.bestScore} / {exam.totalMarks}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">{exam.attemptsCount} Attempts</span>
                    )}
                  </div>
                  
                  {/* Right Side Action Button */}
                  <div>
                    {isLocked ? (
                      status === 'pending' ? (
                        <button 
                          onClick={() => handleUnlock(exam._id)} 
                          className="px-3.5 py-2 bg-yellow-100 text-yellow-800 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-yellow-200 transition-colors cursor-pointer border border-yellow-200"
                        >
                          <Clock size={13} /> Pending Appr.
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUnlock(exam._id)} 
                          className="px-3.5 py-2 bg-amber-500 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-amber-600 transition-colors shadow-sm cursor-pointer"
                        >
                          <ShoppingCart size={13} /> Unlock
                        </button>
                      )
                    ) : exam.lastAttemptStatus === 'in-progress' ? (
                      <button 
                        onClick={() => navigate(`/student/exams/${exam.lastAttemptId}/attempt`)} 
                        className="px-3.5 py-2 bg-yellow-100 text-yellow-800 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-yellow-200 transition-colors border border-yellow-200 cursor-pointer"
                      >
                        Resume <ArrowRight size={14} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStartExam(exam._id)} 
                        disabled={exam.attemptsAllowed > 0 && exam.attemptsCount >= exam.attemptsAllowed}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                          exam.attemptsAllowed > 0 && exam.attemptsCount >= exam.attemptsAllowed
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : 'bg-primary text-gold hover:bg-primary/90 cursor-pointer'
                        }`}
                      >
                        {exam.attemptsCount > 0 ? 'Retake' : 'Start Test'} <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExamsList;
