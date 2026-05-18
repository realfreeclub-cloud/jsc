import { useState } from 'react';
import { Bell, Search, User, ChevronDown, LogOut, Key, Loader2, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const pathLabel = (pathname: string): string => {
  if (pathname === '/') return 'Dashboard';
  return pathname
    .split('/')[1]
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = pathLabel(location.pathname);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Reset Password Modal States
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const adminUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('adminUser') || '{}');
    } catch {
      return {};
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (newPassword !== confirmPassword) {
      setModalError('New passwords do not match!');
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
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to update password. Verify current password.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <header
      className="jsc-header sticky top-0 z-40 w-full flex items-center justify-between"
      style={{ height: 68, paddingLeft: 28, paddingRight: 28 }}
    >
      {/* Left: Page title + breadcrumb */}
      <div className="jsc-page-header">
        <h2 className="jsc-page-title" style={{ fontSize: 18 }}>
          {path}
        </h2>
        <div className="jsc-breadcrumb">
          <span>Admin</span>
          <span style={{ color: 'var(--color-navy-200)' }}>/</span>
          <span className="jsc-breadcrumb-current">{path}</span>
        </div>
      </div>

      {/* Right: Search + actions + profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Visible search on md+ */}
        <label
          className="jsc-header-search"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            width: 240,
            cursor: 'text',
          }}
          htmlFor="header-search-lg"
        >
          <Search size={15} style={{ color: 'var(--color-navy-400)', flexShrink: 0 }} />
          <input
            id="header-search-lg"
            type="text"
            placeholder="Search here..."
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 13.5,
              color: 'var(--color-navy-800)',
              width: '100%',
            }}
          />
        </label>

        {/* Notification bell */}
        <button className="jsc-header-icon-btn" title="Notifications">
          <Bell size={19} />
          <span
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              background: '#EF4444',
              borderRadius: '50%',
              border: '2px solid #fff',
            }}
          />
        </button>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 28,
            background: 'var(--color-navy-100)',
            margin: '0 4px',
          }}
        />

        {/* Profile Container */}
        <div style={{ position: 'relative' }}>
          {/* Profile Click Trigger */}
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              padding: '4px 10px 4px 4px',
              borderRadius: 12,
              border: `1.5px solid ${isDropdownOpen ? 'var(--color-gold-400)' : 'var(--color-navy-100)'}`,
              background: isDropdownOpen ? 'var(--color-gold-50)' : 'var(--color-navy-50)',
              transition: 'all 0.18s',
            }}
          >
            <div className="jsc-avatar">
              <User size={17} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--color-navy-900)',
                  lineHeight: 1.2,
                }}
              >
                {adminUser?.name || 'System Admin'}
              </span>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: 'var(--color-gold-600)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {adminUser?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--color-navy-400)', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </div>

          {/* Absolute Dropdown Popup */}
          {isDropdownOpen && (
            <>
              {/* Overlay to close on click outside */}
              <div 
                onClick={() => setIsDropdownOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 49 }}
              />
              
              <div
                className="animate-fade-in"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: 240,
                  background: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 10px 30px rgba(7,21,47,0.15), 0 0 0 1px rgba(244,180,0,0.12)',
                  border: '1px solid rgba(244,180,0,0.08)',
                  padding: 12,
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                {/* User Info Header */}
                <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid var(--color-navy-50)', marginBottom: 8 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-navy-900)' }}>
                    {adminUser?.name || 'Admin Account'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-navy-400)', wordBreak: 'break-all' }}>
                    {adminUser?.email || 'admin@judicialstudycentre.com'}
                  </div>
                </div>

                {/* Dropdown Options */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsResetModalOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    color: 'var(--color-navy-700)',
                    fontSize: 13.5,
                    fontWeight: 600,
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-gold-50)';
                    e.currentTarget.style.color = 'var(--color-gold-700)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = 'var(--color-navy-700)';
                  }}
                >
                  <Key size={16} />
                  Reset Password
                </button>

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    color: '#EF4444',
                    fontSize: 13.5,
                    fontWeight: 600,
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FEF2F2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  <LogOut size={16} />
                  Logout Securely
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Change Password Luxury Modal */}
      {isResetModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 21, 47, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 24
          }}
        >
          <div
            className="animate-scale-up"
            style={{
              background: '#fff',
              borderRadius: 24,
              width: '100%',
              maxWidth: 420,
              boxShadow: '0 20px 50px rgba(7, 21, 47, 0.25), 0 0 0 1px rgba(244, 180, 0, 0.15)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #07152F 0%, #102444 100%)',
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'between',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: 3,
                  background: 'linear-gradient(90deg, transparent, #F4B400, transparent)',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(244,180,0,0.15)', border: '1px solid rgba(244,180,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Key size={18} style={{ color: '#F4B400' }} />
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: 'Playfair Display, Georgia, serif' }}>
                    Reset Password
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 500 }}>
                    Change your administrative key
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsResetModalOpen(false);
                  setModalError('');
                  setModalSuccess('');
                }}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 8,
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                  e.currentTarget.style.background = 'none';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content / Form */}
            <form onSubmit={handlePasswordReset} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {modalError && (
                <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontSize: 13, color: '#DC2626', fontWeight: 500 }}>
                  {modalError}
                </div>
              )}
              {modalSuccess && (
                <div style={{ padding: '10px 14px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, fontSize: 13, color: '#059669', fontWeight: 500 }}>
                  {modalSuccess}
                </div>
              )}

              <div>
                <label className="jsc-form-label" style={{ marginBottom: 6 }}>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className="jsc-input"
                />
              </div>

              <div>
                <label className="jsc-form-label" style={{ marginBottom: 6 }}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className="jsc-input"
                />
              </div>

              <div>
                <label className="jsc-form-label" style={{ marginBottom: 6 }}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className="jsc-input"
                />
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="btn-gold"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px 20px',
                  borderRadius: 12,
                  marginTop: 6
                }}
              >
                {modalLoading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
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
    </header>
  );
};

export default Header;
