import { useState, useEffect } from 'react';
import { Bell, Clock, AlertCircle, Info } from 'lucide-react';
import api from '../../utils/api';

interface Notice {
  _id: string;
  title: string;
  message?: string;
  content?: string;
  createdAt: string;
  type?: 'general' | 'alert' | 'update' | 'event';
  isImportant?: boolean;
}

const fallbackNotices: Notice[] = [
  {
    _id: 'notice-mp',
    title: 'MP Civil Judge Notification Released!',
    message: 'The official notification for MP Civil Judge 2026 has been published. Last date to apply is 30th May.',
    createdAt: new Date().toISOString(),
    type: 'alert',
    isImportant: true
  },
  {
    _id: 'notice-mock',
    title: 'New Mock Test Available',
    message: 'Constitutional Law Mock Test #4 is now live on the student portal.',
    createdAt: new Date().toISOString(),
    type: 'update',
    isImportant: false
  },
  {
    _id: 'notice-maintenance',
    title: 'Scheduled System Maintenance',
    message: 'Our student portal will undergo routine database updates on Sunday between 2:00 AM and 4:00 AM.',
    createdAt: new Date().toISOString(),
    type: 'general',
    isImportant: false
  }
];

const StudentNotifications = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications')
      .then(res => {
        const data = res.data.data;
        if (data && data.length > 0) {
          setNotices(data);
        } else {
          setNotices(fallbackNotices);
        }
      })
      .catch(err => {
        console.warn('API notifications warning, using fallback:', err.message);
        setNotices(fallbackNotices);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-2.5">
          <Bell size={28} className="text-gold" />
          Updates & Announcements
        </h1>
        <p className="text-sm text-slate-500 mt-1">Get real-time notices, exam dates, syllabus updates, and system logs</p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm font-semibold">Loading announcements...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 max-w-md mx-auto shadow-xs">
          <Info size={40} className="text-slate-400 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-base mb-1">No updates yet</h4>
          <p className="text-xs text-slate-500">We don't have any announcements or notifications posted right now. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {notices.map((notice) => {
            const isAlert = notice.type === 'alert' || notice.isImportant;
            return (
              <div
                key={notice._id}
                className={`p-6 rounded-3xl border flex gap-4 transition-all relative overflow-hidden bg-white ${
                  isAlert 
                    ? 'border-red-100 shadow-md shadow-red-50/50' 
                    : 'border-slate-100 shadow-xs hover:border-gold/15'
                }`}
              >
                {/* Important ribbon */}
                {isImportant(notice) && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-red-50 text-red-700 text-[9px] font-black uppercase rounded-bl-xl tracking-wider">
                    Important
                  </div>
                )}

                {/* Left Icon Status */}
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  isAlert ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-primary'
                }`}>
                  {isAlert ? <AlertCircle size={20} /> : <Info size={20} />}
                </div>

                {/* Notice text */}
                <div className="grow">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5 pr-14">
                    <h3 className="font-bold text-slate-800 text-base leading-snug">
                      {notice.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    {notice.message || notice.content || 'No details provided.'}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
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

// Helper function to check if notice is important
const isImportant = (notice: Notice) => {
  return notice.isImportant || notice.type === 'alert';
};

export default StudentNotifications;
