import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Award, ShoppingCart, ArrowRight, ShieldCheck, Lock, Unlock, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

interface PublicExam {
  _id: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  accessType: 'free' | 'paid';
  pricing?: number;
  discountedPrice?: number;
  course?: {
    _id: string;
    title: string;
  };
}

const TestSeries = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exams, setExams] = useState<PublicExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'free' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/exams/public')
      .then(res => {
        setExams(res.data.data.exams || []);
      })
      .catch(err => {
        console.error('Failed to fetch public exams:', err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleActionClick = () => {
    if (user) {
      navigate('/student/exams');
    } else {
      navigate('/login?redirect=/student/exams');
    }
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = 
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (exam.description && exam.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (activeTab === 'free') return exam.accessType === 'free';
    if (activeTab === 'paid') return exam.accessType === 'paid';
    return true;
  });

  if (isLoading) {
    return (
      <div className="pt-28 pb-20 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Banner Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Premium MCQ Test Series</h1>
          <div className="w-24 h-1 bg-gold mx-auto rounded-full mb-6"></div>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Practice quality question papers prepared by subject specialists to evaluate your preparation level and crack judicial service exams.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          
          {/* Tab buttons */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl gap-2 w-full md:w-auto">
            {(['all', 'free', 'paid'] as const).map((tab) => {
              const label = tab === 'all' ? 'All Test Series' : 
                            tab === 'free' ? 'Free Tests' : 'Paid Test Series';
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-primary text-gold shadow-sm' 
                      : 'text-slate-500 hover:text-primary hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
        </div>

        {/* List of Test Series Cards */}
        {filteredExams.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100 max-w-lg mx-auto flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Test Series Available</h3>
            <p className="text-slate-500">There are currently no active exams matching this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExams.map((exam) => {
              const isPaid = exam.accessType === 'paid';
              return (
                <div 
                  key={exam._id} 
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all flex flex-col justify-between relative overflow-hidden group"
                >
                  {/* Accent design */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gold/10 to-transparent rounded-bl-full z-0 pointer-events-none" />

                  <div className="relative z-10 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Badge Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center shrink-0">
                          <FileText size={20} />
                        </div>
                        <span className={`text-[10px] uppercase font-black tracking-wider px-3 py-1 rounded-full border ${
                          isPaid 
                            ? 'bg-amber-50 text-amber-800 border-amber-200' 
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {isPaid ? 'Paid Series' : 'Free Practice'}
                        </span>
                      </div>

                      {/* Course Association */}
                      <div className="mb-2">
                        <span className="text-[11px] font-bold text-gold uppercase tracking-wider">
                          {exam.course?.title || 'Standalone Test'}
                        </span>
                      </div>

                      {/* Title & Desc */}
                      <div className="mb-4">
                        <h3 className="font-serif font-bold text-xl text-slate-800 leading-tight group-hover:text-primary transition-colors flex items-center gap-1.5">
                          {exam.title}
                          {isPaid ? <Lock size={15} className="text-slate-400" /> : <Unlock size={15} className="text-green-600" />}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                          {exam.description || 'Access mock MCQ exams based on the latest syllabus pattern and test criteria.'}
                        </p>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center">
                          <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                            <Clock size={13} />
                            <span className="text-[9px] font-extrabold uppercase tracking-wider">Duration</span>
                          </div>
                          <div className="font-bold text-slate-700 text-sm">{exam.durationMinutes} Mins</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center">
                          <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                            <Award size={13} />
                            <span className="text-[9px] font-extrabold uppercase tracking-wider">Total Marks</span>
                          </div>
                          <div className="font-bold text-slate-700 text-sm">{exam.totalMarks} Marks</div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Pricing & Action row */}
                    <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between">
                      <div>
                        {isPaid ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 line-through">₹{exam.pricing || 999}</span>
                            <span className="text-base font-extrabold text-slate-800">₹{exam.discountedPrice || 499}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <ShieldCheck size={14} /> Full Access
                          </span>
                        )}
                      </div>

                      <button
                        onClick={handleActionClick}
                        className={`px-4.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                          isPaid 
                            ? 'bg-amber-500 text-slate-900 hover:bg-amber-600 hover:shadow-md' 
                            : 'bg-primary text-gold hover:bg-primary/95 hover:shadow-md'
                        }`}
                      >
                        {isPaid ? (
                          <>
                            <ShoppingCart size={13} /> Buy Series
                          </>
                        ) : (
                          <>
                            Start Test <ArrowRight size={13} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSeries;
