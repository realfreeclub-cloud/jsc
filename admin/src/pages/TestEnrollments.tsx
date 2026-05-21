import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Table, type Column } from '../components/ui/Table';
import { Loader2, AlertCircle, CheckCircle, XCircle, Clock, Calendar, Check, X, ShieldAlert } from 'lucide-react';

interface TestEnrollment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  exam: {
    _id: string;
    title: string;
  };
  status: 'pending' | 'active' | 'rejected' | 'expired';
  enrolledAt: string;
  activatedAt?: string;
  isLifetime?: boolean;
  expiryDate?: string;
  paymentNotes?: string;
}

const NAVY = '#07152F';
const GOLD = '#F4B400';

const TestEnrollments = () => {
  const queryClient = useQueryClient();
  
  // Activation Modal State
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<TestEnrollment | null>(null);
  const [isLifetime, setIsLifetime] = useState(true);
  const [expiryDate, setExpiryDate] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Fetch Test Enrollments
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-test-enrollments'],
    queryFn: () => api.get('/test-enrollments').then((res) => res.data),
  });

  // Status Update Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      api.patch(`/test-enrollments/${id}/status`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-test-enrollments'] });
      setIsActivationModalOpen(false);
      setSelectedEnrollment(null);
      setPaymentNotes('');
    },
    onError: (err: any) => {
      alert('Error updating status: ' + (err.response?.data?.message || err.message));
    }
  });

  const enrollmentsList: TestEnrollment[] = data?.data || [];

  const handleApproveClick = (enrollment: TestEnrollment) => {
    setSelectedEnrollment(enrollment);
    setIsLifetime(enrollment.isLifetime !== false);
    setPaymentNotes(enrollment.paymentNotes || '');
    
    // Default expiry date to 90 days from now (custom for test series)
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    setExpiryDate(enrollment.expiryDate ? enrollment.expiryDate.split('T')[0] : ninetyDaysFromNow.toISOString().split('T')[0]);
    
    setIsActivationModalOpen(true);
  };

  const handleConfirmActivation = async () => {
    if (!selectedEnrollment) return;
    
    await updateStatusMutation.mutateAsync({
      id: selectedEnrollment._id,
      payload: {
        status: 'active',
        isLifetime,
        expiryDate: isLifetime ? undefined : expiryDate,
        paymentNotes: paymentNotes.trim() || undefined
      }
    });
  };

  const handleRejectClick = async (enrollment: TestEnrollment) => {
    if (window.confirm(`Are you sure you want to REJECT the test enrollment of "${enrollment.user?.name}" for "${enrollment.exam?.title}"?`)) {
      await updateStatusMutation.mutateAsync({
        id: enrollment._id,
        payload: { status: 'rejected' }
      });
    }
  };

  const handleRevokeClick = async (enrollment: TestEnrollment) => {
    if (window.confirm(`Are you sure you want to REVOKE/EXPIRE the test access of "${enrollment.user?.name}" for "${enrollment.exam?.title}"?`)) {
      await updateStatusMutation.mutateAsync({
        id: enrollment._id,
        payload: { status: 'expired' }
      });
    }
  };

  const columns: Column<TestEnrollment>[] = [
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
      key: 'exam',
      header: 'Test Series / Exam',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontWeight: 600, color: NAVY }}>{row.exam?.title || 'Deleted Exam'}</span>
          {row.paymentNotes && (
            <span style={{ fontSize: 10.5, color: '#4F46E5', fontStyle: 'italic' }}>Notes: {row.paymentNotes}</span>
          )}
        </div>
      ),
    },
    {
      key: 'enrolledAt',
      header: 'Request Date',
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
              border: `1px solid ${fg}22`,
              fontWeight: 600,
              width: 'fit-content'
            }}
          >
            {icon}
            {row.status.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'expiryDate',
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
      header: 'Quick Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleApproveClick(row)}
                className="btn-gold"
                style={{ padding: '5px 12px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', background: GOLD, border: 'none', borderRadius: 4, fontWeight: 700, color: NAVY }}
              >
                <Check size={12} /> Approve
              </button>
              <button
                onClick={() => handleRejectClick(row)}
                className="btn-outline"
                style={{ padding: '5px 12px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: '#DC2626', borderColor: '#FCA5A5', cursor: 'pointer', borderRadius: 4 }}
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
                style={{ padding: '5px 12px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', borderRadius: 4 }}
              >
                Change Expiry
              </button>
              <button
                onClick={() => handleRevokeClick(row)}
                className="btn-outline"
                style={{ padding: '5px 12px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: '#DC2626', borderColor: '#FCA5A5', cursor: 'pointer', borderRadius: 4 }}
              >
                Revoke Access
              </button>
            </>
          )}

          {(row.status === 'expired' || row.status === 'rejected') && (
            <button
              onClick={() => handleApproveClick(row)}
              className="btn-outline"
              style={{ padding: '5px 12px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, borderColor: GOLD, color: NAVY, cursor: 'pointer', borderRadius: 4 }}
            >
              Re-activate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div className="jsc-page-header">
        <h1 className="jsc-page-title" style={{ fontSize: 24, fontWeight: 800, color: NAVY }}>Test Series Approvals</h1>
        <p className="jsc-page-subtitle" style={{ fontSize: 14, color: '#6B7280' }}>Manage paid exam access subscriptions and verify manual payment receipts.</p>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div style={{ padding: '48px 24px', display: 'flex', justifyContent: 'center' }}>
          <Loader2 className="animate-spin" size={32} color={GOLD} />
        </div>
      ) : error ? (
        <div style={{ padding: '64px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: '#DC2626' }}>
            <AlertCircle size={28} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Connection Error</h3>
          <p style={{ fontSize: 13.5, color: 'var(--color-navy-400)' }}>We couldn't fetch test series enrollment requests. Check the server connection.</p>
        </div>
      ) : (
        <div className="jsc-card" style={{ padding: 16 }}>
          <Table
            columns={columns}
            data={enrollmentsList}
            searchPlaceholder="Search requests by student name or test series..."
          />
        </div>
      )}

      {/* Access Activation Modal */}
      {isActivationModalOpen && selectedEnrollment && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,21,47,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 12, width: '90%', maxWidth: 460, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Configure Test Series Access</h3>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
              Grant exam permissions for <strong>{selectedEnrollment.user?.name}</strong> enrolling in <strong>{selectedEnrollment.exam?.title}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Payment Notes/Transaction Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: NAVY }}>Payment Notes / Transaction ID</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref: 62719283719"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                />
              </div>

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
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: NAVY }}>
                    <Calendar size={14} style={{ color: GOLD }} /> Custom Expiration Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13, marginTop: 6 }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12, borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsActivationModalOpen(false);
                    setSelectedEnrollment(null);
                  }}
                  style={{ padding: '8px 16px', border: '1px solid #D2D6DC', background: '#fff', color: NAVY, cursor: 'pointer', borderRadius: 6, fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updateStatusMutation.isPending}
                  onClick={handleConfirmActivation}
                  className="btn-gold"
                  style={{ padding: '8px 18px', background: GOLD, color: NAVY, border: 'none', cursor: 'pointer', borderRadius: 6, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {updateStatusMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  Approve Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestEnrollments;
