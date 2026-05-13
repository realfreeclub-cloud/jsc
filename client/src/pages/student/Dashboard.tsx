import { BookOpen, Download, Bell, Star, ArrowRight, PlayCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { Link } from 'react-router-dom';

interface Course {
  title: string;
  about: string;
}

interface Notice {
  title: string;
  createdAt?: string;
}

const StudentDashboard = () => {
  // Fetch Courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses?limit=4').then(res => res.data)
  });

  // Fetch Notifications
  const { data: noticesData, isLoading: noticesLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications?limit=5').then(res => res.data)
  });

  // Fetch Study Materials
  const { data: materialsData } = useQuery({
    queryKey: ['materials'],
    queryFn: () => api.get('/studymaterials?limit=5').then(res => res.data)
  });

  const courses = coursesData?.data || [];
  const notices = noticesData?.data || [];


  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-primary-light to-blue-900 p-8 md:p-10 text-white shadow-2xl shadow-primary/20">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-gold rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-10 -mb-20 w-48 h-48 bg-blue-400 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-4"
          >
            Welcome back, <span className="text-gold">Student!</span> 👋
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-blue-100 max-w-xl text-lg"
          >
            Your journey to becoming a judicial officer is on track. Keep up the momentum!
          </motion.p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { icon: Star, label: 'Available Courses', value: coursesData?.totalCount || 0, gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/20' },
          { icon: Download, label: 'Study Materials', value: materialsData?.totalCount || 0, gradient: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-500/20' },
          { icon: Bell, label: 'New Notices', value: noticesData?.totalCount || 0, gradient: 'from-rose-400 to-red-500', shadow: 'shadow-rose-500/20' },
          { icon: BookOpen, label: 'Mock Tests', value: '0', gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/20' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }} 
            key={i} 
            className="group bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-white flex flex-col relative overflow-hidden hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-linear-to-br opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out"></div>
            <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${stat.gradient} ${stat.shadow} text-white flex items-center justify-center mb-4 shadow-lg`}>
              <stat.icon size={26} strokeWidth={2.5} />
            </div>
            <div className="text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</div>
            <div className="text-sm font-semibold text-slate-500 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Continue Learning - Spans 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary font-serif">Featured Courses</h2>
            <Link to="/courses" className="text-sm font-bold text-gold hover:text-primary transition-colors flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="space-y-4">
            {coursesLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-slate-50 rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-dashed border-slate-200">
                <AlertCircle className="text-slate-400 mb-4" size={48} />
                <h3 className="text-lg font-bold text-slate-700">No courses available yet</h3>
                <p className="text-slate-500 mt-2 text-sm max-w-sm">When new courses are published, they will appear here.</p>
              </div>
            ) : (
              courses.map((course: Course, i: number) => (
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  key={i} 
                  className="bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-6 items-center cursor-pointer group"
                >
                  <div className="relative w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                    <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                      <BookOpen className="text-primary/20" size={48} />
                    </div>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/50 group-hover:bg-gold group-hover:border-gold transition-colors">
                        <PlayCircle size={24} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grow w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">Available</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{course.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{course.about}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Notice Board */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary font-serif">Notice Board</h2>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden min-h-[300px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-rose-50 to-orange-50 rounded-bl-full z-0"></div>
            
            <div className="space-y-5 relative z-10">
              {noticesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : notices.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center pt-10">
                  <Bell className="text-slate-300 mb-4" size={40} />
                  <p className="text-sm font-medium text-slate-500">No new notices</p>
                </div>
              ) : (
                notices.map((notice: Notice, i: number) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex gap-4 items-start">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 bg-blue-500`}></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 leading-snug group-hover:text-primary transition-colors">{notice.title}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-slate-400">
                          <Clock size={12} /> {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : 'Recently'}
                        </div>
                      </div>
                    </div>
                    {i !== notices.length - 1 && <div className="h-px bg-slate-100 mt-4 ml-6"></div>}
                  </div>
                ))
              )}
            </div>
            
            {notices.length > 0 && (
              <button className="w-full mt-6 py-3 rounded-xl bg-slate-50 text-primary font-bold text-sm hover:bg-primary hover:text-white transition-colors duration-300">
                View All Notices
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
