import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Table, type Column } from '../components/ui/Table';
import { Loader2, AlertCircle, CheckCircle, XCircle, Clock, Calendar, Check, X, ShieldAlert } from 'lucide-react';

interface Enrollment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  course: {
    _id: string;
    title: string;
  };
  status: 'pending' | 'active' | 'rejected' | 'expired';
  enrolledAt: string;
  activatedAt?: string;
  isLifetime?: boolean;
  expiryDate?: string;
}

const NAVY = '#07152F';
const GOLD = '#F4B400';

const Enrollments = () => {
  const queryClient = useQueryClient();
  
  // Activation Modal State
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isLifetime, setIsLifetime] = useState(true);
  const [expiryDate, setExpiryDate] = useState('');

  // Fetch Enrollments
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-enrollments'],
    queryFn: () => api.get('/enrollments').then((res) => res.data),
  });

  // Status Update Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      api.patch(`/enrollments/${id}/status`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] });
      setIsActivationModalOpen(false);
      setSelectedEnrollment(null);
    },
  });

  const enrollmentsList: Enrollment[] = data?.data || [];

  const handleApproveClick = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsLifetime(enrollment.isLifetime !== false);
    
    // Default expiry date to 1 year from now
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    setExpiryDate(enrollment.expiryDate ? enrollment.expiryDate.split('T')[0] : oneYearFromNow.toISOString().split('T')[0]);
    
    setIsActivationModalOpen(true);
  };

  const handleConfirmActivation = async () => {
    if (!selectedEnrollment) return;
    
    await updateStatusMutation.mutateAsync({
      id: selectedEnrollment._id,
      payload: {
        status: 'active',
        isLifetime,
        expiryDate: isLifetime ? undefined : expiryDate
      }
    });
  };

  const handleRejectClick = async (enrollment: Enrollment) => {
    if (window.confirm(`Are you sure you want to REJECT the enrollment of "${enrollment.user.name}" for "${enrollment.course.title}"?`)) {
      await updateStatusMutation.mutateAsync({
        id: enrollment._id,
        payload: { status: 'rejected' }
      });
    }
  };

  const handleRevokeClick = async (enrollment: Enrollment) => {
    if (window.confirm(`Are you sure you want to REVOKE/EXPIRE the access of "${enrollment.user.name}" for "${enrollment.course.title}"?`)) {
      await updateStatusMutation.mutateAsync({
        id: enrollment._id,
        payload: { status: 'expired' }
      });
    }
  };

  const columns: Column<Enrollment>[] = [
    {
      key: 'user',
      header: 'Student Info',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontWeight: 600, color: NAVY }}>{row.user?.name || 'Deleted Student'}</span>
          <span style={{ fontSize: 11, color: 'var(--color-navy-400)' }}>{row.user?.email || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Course Program',
      render: (row) => (
        <span style={{ fontWeight: 600, color: NAVY }}>{row.course?.title || 'Deleted Course'}</span>
      ),
    },
    {
      key: 'enrolledAt',
      header: 'Enrollment Request Date',
      render: (row) => (
        <span style={{ fontSize: 12, color: 'var(--color-navy-600)' }}>
          {new Date(row.enrolledAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Access Status',
      render: (row) => {
        let bg = '#FEF3C7';
        let fg = '#D97706';
        let icon = <Clock size={12} />;

        if (row.status === 'active') {
          bg = '#ECFDF5';
          fg = '#059669';
          icon = <CheckCircle size={12} />;
        } else if (row.status === 'rejected') {
          bg = '#FEE2E2';
          fg = '#DC2626';
          icon = <XCircle size={12} />;
        } else if (row.status === 'expired') {
          bg = '#F3F4F6';
          fg = '#4B5563';
          icon = <ShieldAlert size={12} />;
        }

        return (
          <span
            className="badge-active"
            style={{
              background: bg,
              color: fg,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              alignSelf: 'flex-start',
              fontSize: 11,
              padding: '4px 8px',
              borderRadius: 6,
              border: `1px solid ${fg}22`
            }}
          >
            {icon}
            {row.status.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'accessDuration',
      header: 'Access Expiration',
      render: (row) => {
        if (row.status !== 'active') return <span style={{ color: 'var(--color-navy-300)' }}>—</span>;
        return (
          <span style={{ fontSize: 12, color: 'var(--color-navy-600)' }}>
            {row.isLifetime ? (
              <strong style={{ color: '#059669' }}>Lifetime</strong>
            ) : row.expiryDate ? (
              new Date(row.expiryDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            ) : (
              'Not Specified'
            )}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Quick Action',
      render: (row) => (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleApproveClick(row)}
                className="btn-gold"
                style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Check size={12} /> Activate Access
              </button>
              <button
                onClick={() => handleRejectClick(row)}
                className="btn-outline"
                style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: '#DC2626', borderColor: '#FCA5A5' }}
              >
                <X size={12} /> Reject
              </button>
            </>
          )}

          {row.status === 'active' && (
            <>
              <button
                onClick={() => handleApproveClick(row)}
                className="btn-outline"
                style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                Change Expiry
              </button>
              <button
                onClick={() => handleRevokeClick(row)}
                className="btn-outline"
                style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: '#DC2626', borderColor: '#FCA5A5' }}
              >
                Revoke Access
              </button>
            </>
          )}

          {(row.status === 'expired' || row.status === 'rejected') && (
            <button
              onClick={() => handleApproveClick(row)}
              className="btn-outline"
              style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, borderColor: GOLD, color: NAVY }}
            >
              Re-activate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-up">
      {/* ── Page Header ── */}
      <div className="jsc-page-header">
        <h1 className="jsc-page-title">Student Enrollment Approvals</h1>
        <p className="jsc-page-subtitle">Verify payment confirmations, activate program syllabus permissions, and set expiration limits.</p>
      </div>

      {/* ── Table Content ── */}
      {isLoading ? (
        <div style={{ padding: '48px 24px' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 56,
                background: 'var(--color-navy-50)',
                borderRadius: 10,
                marginBottom: 10,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: '64px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: '#DC2626' }}>
            <AlertCircle size={28} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Connection Error</h3>
          <p style={{ fontSize: 13.5, color: 'var(--color-navy-400)' }}>We couldn't fetch enrollment requests. Check the server connection.</p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={enrollmentsList}
          searchPlaceholder="Search enrollments by student name, course..."
        />
      )}

      {/* ── Access Activation Modal ── */}
      {isActivationModalOpen && selectedEnrollment && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,21,47,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 20, width: '90%', maxWidth: 450, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Configure Program Access</h3>
            <p style={{ fontSize: 13, color: 'var(--color-navy-500)', marginBottom: 20 }}>
              Set access configuration for <strong>{selectedEnrollment.user?.name}</strong> enrolling in <strong>{selectedEnrollment.course?.title}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Lifetime Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="lifetimeAccess"
                  checked={isLifetime}
                  onChange={(e) => setIsLifetime(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <label htmlFor="lifetimeAccess" style={{ fontSize: 13.5, fontWeight: 700, color: NAVY, cursor: 'pointer' }}>
                  Grant Lifetime Access (Unlimited duration)
                </label>
              </div>

              {/* Expiry Date Selector */}
              {!isLifetime && (
                <div>
                  <label className="jsc-form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} style={{ color: GOLD }} /> Set Custom Expiration Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="jsc-input"
                    style={{ marginTop: 6 }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsActivationModalOpen(false);
                    setSelectedEnrollment(null);
                  }}
                  className="btn-outline"
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updateStatusMutation.isPending}
                  onClick={handleConfirmActivation}
                  className="btn-gold"
                  style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {updateStatusMutation.isPending && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  Save Activation Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enrollments;
