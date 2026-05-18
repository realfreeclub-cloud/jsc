import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Loader2, Scale } from 'lucide-react';
import api from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, data } = response.data;
      if (data.role !== 'admin' && data.role !== 'superadmin') {
        setError('Access denied. Admin accounts only.');
        return;
      }
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(data));
      navigate('/');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="jsc-login-bg"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,180,0,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,180,0,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="animate-fade-up"
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        {/* Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(7,21,47,0.35), 0 0 0 1px rgba(244,180,0,0.12)',
          }}
        >
          {/* Card Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #07152F 0%, #102444 100%)',
              padding: '40px 40px 36px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* Gold decorative line */}
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: 3,
                background: 'linear-gradient(90deg, transparent, #F4B400, transparent)',
              }}
            />

            <div
              className="animate-pulse-gold"
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(244,180,0,0.20), rgba(244,180,0,0.08))',
                border: '2px solid rgba(244,180,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <Scale size={34} style={{ color: '#F4B400' }} />
            </div>

            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#fff',
                fontFamily: 'Playfair Display, Georgia, serif',
                letterSpacing: '-0.01em',
                marginBottom: 8,
              }}
            >
              Judicial Study Centre
            </h1>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.50)', fontWeight: 500 }}>
              Admin Control Panel — Secure Login
            </p>
          </div>

          {/* Form */}
          <div style={{ padding: '36px 40px 40px' }}>
            {error && (
              <div
                style={{
                  marginBottom: 20,
                  padding: '12px 16px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13.5,
                  color: '#DC2626',
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#DC2626',
                    flexShrink: 0,
                  }}
                />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Email */}
              <div>
                <label
                  className="jsc-form-label"
                  htmlFor="login-email"
                  style={{ marginBottom: 8 }}
                >
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={17}
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-navy-400)',
                    }}
                  />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@judicialstudycentre.com"
                    required
                    className="jsc-input"
                    style={{ paddingLeft: 42 }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  className="jsc-form-label"
                  htmlFor="login-password"
                  style={{ marginBottom: 8 }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={17}
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-navy-400)',
                    }}
                  />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    required
                    className="jsc-input"
                    style={{ paddingLeft: 42, paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-navy-400)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#F4B400')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--color-navy-400)')}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-gold"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '14px 24px',
                  fontSize: 15,
                  marginTop: 4,
                  borderRadius: 12,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Authenticating...
                  </>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
            </form>

            <p
              style={{
                textAlign: 'center',
                fontSize: 12.5,
                color: 'var(--color-navy-400)',
                marginTop: 24,
              }}
            >
              Forgot password?{' '}
              <span style={{ color: 'var(--color-gold-600)', fontWeight: 600, cursor: 'pointer' }}>
                Contact system administrator
              </span>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: 'rgba(255,255,255,0.25)',
            marginTop: 20,
            letterSpacing: '0.02em',
          }}
        >
          © {new Date().getFullYear()} Judicial Study Centre — Secure Admin Panel
        </p>
      </div>
    </div>
  );
};

export default Login;
