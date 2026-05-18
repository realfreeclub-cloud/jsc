import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Download, Bell, Key, LogOut, Loader2, X, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const StudentLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Reset Password Modal States
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const navItems = [
    { path: '/student/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/student/courses', icon: BookOpen, label: 'My Courses' },
    { path: '/student/materials', icon: Download, label: 'Materials' },
    { path: '/student/notifications', icon: Bell, label: 'Updates' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (newPassword !== confirmPassword) {
      setModalError('Passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      setModalError('Password must be at least 6 characters long.');
      return;
    }

    setModalLoading(true);
    try {
      await api.patch('/auth/update-password', {
        currentPassword,
        newPassword
      });
      setModalSuccess('Password successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsResetModalOpen(false);
        setModalSuccess('');
      }, 1800);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setModalError(error.response?.data?.message || 'Failed to update password. Verify current password.');
    } finally {
      setModalLoading(false);
    }
  };

  const initial = (user?.name || 'Student').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pb-20 md:pb-0 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed h-screen bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary text-gold flex items-center justify-center font-bold text-xl shadow-md">
              {initial}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 line-clamp-1">{user?.name || 'Student'}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-semibold text-gold tracking-wider uppercase">Portal Access</span>
                <span className="text-gray-350 text-[10px]">•</span>
                <Link to="/" className="text-[10px] font-semibold text-primary hover:text-gold transition-colors">Visit Site</Link>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-450 uppercase tracking-wider px-4 mb-2">Study Area</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-650 hover:bg-slate-55 hover:text-primary'}`}
              >
                <Icon size={18} className={isActive ? 'text-gold' : ''} /> {item.label}
              </Link>
            );
          })}

          <div className="h-px bg-gray-150 my-6" />
          
          <div className="text-[10px] font-bold text-slate-450 uppercase tracking-wider px-4 mb-2">Account Config</div>
          
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-slate-650 hover:bg-slate-55 hover:text-primary transition-all text-left cursor-pointer"
          >
            <Key size={18} className="text-slate-400" /> Reset Password
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-all text-left cursor-pointer"
          >
            <LogOut size={18} className="text-red-400" /> Logout Securely
          </button>
        </nav>
      </aside>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-50 pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-slate-400'}`}>
              <div className={`p-2 rounded-full ${isActive ? 'bg-primary/10' : ''}`}>
                <Icon size={20} className={isActive ? 'text-primary' : ''} />
              </div>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Mobile Password Change Option */}
        <button 
          onClick={() => setIsResetModalOpen(true)} 
          className="flex flex-col items-center gap-1 text-slate-400 cursor-pointer"
        >
          <div className="p-2 rounded-full">
            <Key size={20} />
          </div>
          <span className="text-[10px] font-semibold">Key</span>
        </button>

        {/* Mobile Logout Option */}
        <button 
          onClick={handleLogout} 
          className="flex flex-col items-center gap-1 text-red-500 cursor-pointer"
        >
          <div className="p-2 rounded-full">
            <LogOut size={20} />
          </div>
          <span className="text-[10px] font-semibold">Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 min-h-screen">
        {/* Header with Visit Website option */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Judicial Study Centre</span>
            <h1 className="text-lg font-bold text-slate-800 font-serif mt-0.5">Student Portal</h1>
          </div>
          <Link to="/" className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 transition-all shadow-xs cursor-pointer">
            <Globe size={14} className="text-slate-500" />
            Visit Website
          </Link>
        </div>
        <Outlet />
      </main>

      {/* Student Password Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-999 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-primary p-6 text-white relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-gold to-transparent" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gold/25 border border-gold/30 flex items-center justify-center">
                    <Key size={18} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg font-serif">Reset Password</h3>
                    <p className="text-xs text-slate-400">Update portal access key</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setModalError('');
                    setModalSuccess('');
                  }}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePasswordReset} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-sm font-semibold text-red-600">
                  {modalError}
                </div>
              )}
              {modalSuccess && (
                <div className="p-3 bg-green-50 border border-green-150 rounded-xl text-sm font-semibold text-green-605">
                  {modalSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-750 mb-1">Current Password</label>
                <input 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-250 focus:ring-2 focus:ring-gold outline-none transition-all text-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-750 mb-1">New Password</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-250 focus:ring-2 focus:ring-gold outline-none transition-all text-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-750 mb-1">Confirm New Password</label>
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-250 focus:ring-2 focus:ring-gold outline-none transition-all text-slate-800 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="w-full py-3 rounded-xl bg-gold text-primary font-bold hover:bg-yellow-450 disabled:opacity-50 transition-colors shadow-lg shadow-gold/20 flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {modalLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Updating Key...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLayout;
