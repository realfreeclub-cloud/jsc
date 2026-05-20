import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Video, Calendar, Clock, Users, Play, MessageCircle, X,
  Loader2, CheckCircle, Search, BookOpen, Mic
} from 'lucide-react';
import api from '../utils/api';
import CustomVideoPlayer from '../components/ui/CustomVideoPlayer';

interface DemoSession {
  _id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  faculty?: string;
  subject?: string;
  scheduleDate?: string;
  durationMinutes?: number;
  isLive?: boolean;
  whatsappGroupLink?: string;
  registrationsCount?: number;
}

const DemoClasses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<DemoSession | null>(null);
  const [watchingSession, setWatchingSession] = useState<DemoSession | null>(null);
  const [regForm, setRegForm] = useState({ name: '', phone: '', email: '' });
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['publicDemoSessions'],
    queryFn: () => api.get('/demosessions/public').then(res => res.data),
  });

  const sessions = (data?.data?.sessions || []) as DemoSession[];

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.faculty || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const liveUpcoming = filtered.filter(s => s.isLive);
  const recorded = filtered.filter(s => !s.isLive && s.videoUrl);
  const preview = filtered.filter(s => !s.isLive && !s.videoUrl);

  const registerMutation = useMutation({
    mutationFn: (payload: { name: string; phone: string; email: string; courseInterest: string; demoSession: string }) =>
      api.post('/democlasses', payload),
    onSuccess: () => {
      setRegSuccess(true);
      setRegError('');
      // Auto redirect to WhatsApp group after 1.5s
      if (selectedSession?.whatsappGroupLink) {
        setTimeout(() => {
          window.open(selectedSession.whatsappGroupLink, '_blank');
        }, 1500);
      }
    },
    onError: (err: { response?: { data?: { message?: string } }; message: string }) => {
      setRegError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;
    registerMutation.mutate({
      name: regForm.name,
      phone: regForm.phone,
      email: regForm.email,
      courseInterest: selectedSession.title,
      demoSession: selectedSession._id
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const openRegModal = (session: DemoSession) => {
    setSelectedSession(session);
    setRegSuccess(false);
    setRegError('');
    setRegForm({ name: '', phone: '', email: '' });
  };

  const closeRegModal = () => {
    setSelectedSession(null);
    setRegSuccess(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <section className="bg-[#07152F] text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #F4B400 0%, transparent 60%), radial-gradient(circle at 80% 20%, #1E3A5F 0%, transparent 60%)' }} />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-semibold text-[#F4B400]">
            <Video size={16} /> Free Demo Classes
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 leading-tight">
            Experience Our Teaching
            <span className="text-[#F4B400]"> Before You Enroll</span>
          </h1>
          <p className="text-blue-200 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-8">
            Attend live sessions with our expert faculty, watch recorded masterclasses, and judge the quality of teaching for yourself — completely free.
          </p>
          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, faculty, or subject..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-800 text-sm font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-[#F4B400]"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#F4B400]" size={40} />
          </div>
        )}

        {!isLoading && sessions.length === 0 && (
          <div className="text-center py-20">
            <BookOpen size={48} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">Sessions Coming Soon</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Our faculty is preparing an exciting lineup of demo sessions. Check back soon!
            </p>
          </div>
        )}

        {/* Live / Upcoming Sessions */}
        {liveUpcoming.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 rounded-full px-3 py-1 text-xs font-bold">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Live & Upcoming
              </div>
              <div className="h-px bg-slate-200 flex-1" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveUpcoming.map(session => (
                <SessionCard key={session._id} session={session} onRegister={openRegModal} formatDate={formatDate} isLive />
              ))}
            </div>
          </section>
        )}

        {/* Recorded Sessions */}
        {recorded.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-bold text-slate-800 whitespace-nowrap flex items-center gap-2">
                <Video size={18} className="text-[#F4B400]" /> Recorded Masterclasses
              </h2>
              <div className="h-px bg-slate-200 flex-1" />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {recorded.map(session => (
                <RecordedSessionCard key={session._id} session={session} onWatch={() => setWatchingSession(session)} onRegister={openRegModal} formatDate={formatDate} />
              ))}
            </div>
          </section>
        )}

        {/* Preview-Only (no video yet) */}
        {preview.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-bold text-slate-800 whitespace-nowrap flex items-center gap-2">
                <Calendar size={18} className="text-[#F4B400]" /> Upcoming Sessions
              </h2>
              <div className="h-px bg-slate-200 flex-1" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {preview.map(session => (
                <SessionCard key={session._id} session={session} onRegister={openRegModal} formatDate={formatDate} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* In-Page Video Player Modal */}
      {watchingSession && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold text-lg font-serif">{watchingSession.title}</h3>
                {watchingSession.faculty && <p className="text-slate-400 text-sm mt-0.5">By {watchingSession.faculty}</p>}
              </div>
              <button onClick={() => setWatchingSession(null)} className="text-white/60 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10 cursor-pointer">
                <X size={24} />
              </button>
            </div>
            <CustomVideoPlayer
              videoUrl={watchingSession.videoUrl!}
              title={watchingSession.title}
            />
            <div className="mt-4 text-center">
              <button
                onClick={() => { setWatchingSession(null); openRegModal(watchingSession); }}
                className="px-6 py-2.5 bg-[#F4B400] hover:bg-yellow-500 text-[#07152F] rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                <MessageCircle size={15} className="inline mr-2" />
                Register & Join WhatsApp Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#07152F] p-6 relative">
              <button onClick={closeRegModal} className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer transition-colors">
                <X size={20} />
              </button>
              <p className="text-[#F4B400] text-xs font-bold uppercase tracking-wider mb-2">Free Registration</p>
              <h3 className="text-white font-bold text-xl font-serif leading-snug">{selectedSession.title}</h3>
              {selectedSession.faculty && (
                <p className="text-blue-300 text-sm mt-1 flex items-center gap-1.5">
                  <Mic size={13} /> {selectedSession.faculty}
                </p>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {regSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg mb-2">Registration Successful!</h4>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">
                    Your seat is reserved. Redirecting you to the WhatsApp discussion group…
                  </p>
                  {selectedSession.whatsappGroupLink && (
                    <a
                      href={selectedSession.whatsappGroupLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-all cursor-pointer"
                    >
                      <MessageCircle size={16} /> Join WhatsApp Group
                    </a>
                  )}
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={regForm.name}
                      onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#F4B400] bg-slate-50"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      value={regForm.phone}
                      onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#F4B400] bg-slate-50"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={regForm.email}
                      onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#F4B400] bg-slate-50"
                      placeholder="you@example.com"
                    />
                  </div>

                  {regError && (
                    <p className="text-red-500 text-xs font-semibold bg-red-50 p-3 rounded-xl border border-red-100">{regError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full py-3 bg-[#07152F] text-[#F4B400] rounded-xl font-bold font-serif text-sm hover:bg-[#0d2045] transition-all shadow-lg shadow-[#07152F]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {registerMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                    {registerMutation.isPending ? 'Registering...' : 'Register & Get WhatsApp Access'}
                  </button>

                  <p className="text-center text-[10px] text-slate-400">
                    By registering, you agree to receive updates via WhatsApp. No spam, unsubscribe anytime.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Session Card (Live / Upcoming) ───────────────────────────────────────────
const SessionCard = ({ session, onRegister, formatDate, isLive = false }: {
  session: DemoSession;
  onRegister: (s: DemoSession) => void;
  formatDate: (d?: string) => string | null;
  isLive?: boolean;
}) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
    {/* Thumbnail */}
    <div className="relative aspect-video bg-[#07152F] overflow-hidden">
      {session.thumbnailUrl ? (
        <img src={session.thumbnailUrl} alt={session.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <BookOpen size={40} className="text-white/20" />
        </div>
      )}
      {isLive && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
        </div>
      )}
    </div>

    <div className="p-5">
      <h3 className="font-bold text-[#07152F] text-sm leading-snug mb-1.5 line-clamp-2">{session.title}</h3>
      {session.faculty && (
        <p className="text-xs text-slate-500 font-medium mb-3 flex items-center gap-1.5">
          <Mic size={12} className="text-[#F4B400]" /> {session.faculty}
        </p>
      )}

      <div className="space-y-1.5 mb-4 text-xs text-slate-500">
        {formatDate(session.scheduleDate) && (
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-[#F4B400]" />
            {formatDate(session.scheduleDate)}
          </div>
        )}
        {session.durationMinutes && (
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-slate-400" />
            {session.durationMinutes} minutes
          </div>
        )}
        {(session.registrationsCount || 0) > 0 && (
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-emerald-500" />
            {session.registrationsCount} already registered
          </div>
        )}
      </div>

      <button
        onClick={() => onRegister(session)}
        className="w-full py-2.5 bg-[#07152F] hover:bg-[#0d2045] text-[#F4B400] rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <MessageCircle size={14} /> Reserve Free Seat
      </button>
    </div>
  </div>
);

// ─── Recorded Session Card ─────────────────────────────────────────────────────
const RecordedSessionCard = ({ session, onWatch, onRegister, formatDate }: {
  session: DemoSession;
  onWatch: () => void;
  onRegister: (s: DemoSession) => void;
  formatDate: (d?: string) => string | null;
}) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
    {/* Clickable Thumbnail Playback */}
    <div
      onClick={onWatch}
      className="relative aspect-video bg-[#07152F] overflow-hidden cursor-pointer group/thumb"
    >
      {session.thumbnailUrl ? (
        <img src={session.thumbnailUrl} alt={session.title} className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500 opacity-80" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Video size={40} className="text-white/20" />
        </div>
      )}
      {/* Play overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 bg-[#F4B400] rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40 group-hover/thumb:scale-110 transition-transform">
          <Play size={24} className="text-[#07152F] ml-1" fill="#07152F" />
        </div>
      </div>
      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">
        RECORDED
      </div>
    </div>

    <div className="p-5 flex gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-[#07152F] text-sm leading-snug mb-1 line-clamp-2">{session.title}</h3>
        {session.faculty && <p className="text-xs text-slate-500 font-medium flex items-center gap-1"><Mic size={11} className="text-[#F4B400]" /> {session.faculty}</p>}
        {session.description && <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{session.description}</p>}
        {formatDate(session.scheduleDate) && (
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1"><Calendar size={11} /> {formatDate(session.scheduleDate)}</p>
        )}
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <button
          onClick={onWatch}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
        >
          <Play size={12} /> Watch
        </button>
        <button
          onClick={() => onRegister(session)}
          className="px-3 py-2 bg-[#07152F] text-[#F4B400] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap"
        >
          <MessageCircle size={12} /> Join
        </button>
      </div>
    </div>
  </div>
);

export default DemoClasses;
