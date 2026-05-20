import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Loader2, Edit2, Trash2, Video, Calendar, Users, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import AppDrawer from '../components/ui/AppDrawer';
import GenericForm, { type Field } from '../components/ui/GenericForm';

const NAVY = '#07152F';
const GOLD = '#F4B400';

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
  isPublished?: boolean;
  whatsappGroupLink?: string;
  registrationsCount?: number;
}

const fields: Field[] = [
  { name: 'title', label: 'Session Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'subject', label: 'Subject / Topic Area', type: 'text' },
  { name: 'faculty', label: 'Faculty Name', type: 'text' },
  { name: 'scheduleDate', label: 'Schedule Date & Time', type: 'date' },
  { name: 'durationMinutes', label: 'Duration (Minutes)', type: 'number' },
  { name: 'thumbnailUrl', label: 'Thumbnail Image URL', type: 'file' },
  { name: 'videoUrl', label: 'YouTube Video URL (for recorded class)', type: 'text' },
  { name: 'whatsappGroupLink', label: 'WhatsApp Group Link (after registration)', type: 'text' },
  { name: 'isLive', label: 'Is Upcoming/Live Session', type: 'checkbox' },
  { name: 'isPublished', label: 'Published (Visible to Students)', type: 'checkbox' },
];

const DemoSessions = () => {
  const [formId] = useState('demo-session-form');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<Record<string, unknown> | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['demoSessions'],
    queryFn: () => api.get('/demosessions').then(res => res.data),
  });

  const sessions = (data?.data?.sessions || []) as DemoSession[];
  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.faculty || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/demosessions', payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['demoSessions'] }); handleClose(); },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { _id: string } & Record<string, unknown>) =>
      api.patch(`/demosessions/${payload._id}`, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['demoSessions'] }); handleClose(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/demosessions/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['demoSessions'] }); },
  });

  const handleSave = async (formData: Record<string, unknown>) => {
    try {
      if (editData) {
        await updateMutation.mutateAsync({ ...formData, _id: editData._id as string });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message: string };
      alert(`Save failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (row: DemoSession) => {
    setEditData({ ...row });
    setIsModalOpen(true);
  };

  const handleDelete = (row: DemoSession) => {
    if (window.confirm(`Delete session "${row.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(row._id);
    }
  };

  const handleClose = () => { setIsModalOpen(false); setEditData(undefined); };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const drawerFooter = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
      <button type="button" onClick={handleClose} style={{ padding: '10px 22px', borderRadius: 10, border: '1.5px solid #D0D8E8', background: '#fff', color: NAVY, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
        Cancel
      </button>
      <button type="submit" form={formId} disabled={isSaving} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: isSaving ? '#D0D8E8' : `linear-gradient(135deg,${GOLD},#FFD24C)`, color: NAVY, fontSize: 14, fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
        {isSaving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : null}
        {editData ? 'Update Session' : 'Publish Session'}
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div className="jsc-page-header">
          <h1 className="jsc-page-title">Demo Sessions</h1>
          <p className="jsc-page-subtitle">Publish live and recorded demo classes visible to students and the public.</p>
        </div>
        <button onClick={() => { setEditData(undefined); setIsModalOpen(true); }} className="btn-gold" style={{ padding: '9px 18px', fontSize: 13 }}>
          <Plus size={15} /> New Demo Session
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Sessions', value: sessions.length, icon: <Video size={18} color={GOLD} /> },
          { label: 'Published', value: sessions.filter(s => s.isPublished).length, icon: <Eye size={18} color="#10B981" /> },
          { label: 'Live / Upcoming', value: sessions.filter(s => s.isLive).length, icon: <Calendar size={18} color="#6366F1" /> }
        ].map((stat, i) => (
          <div key={i} className="jsc-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#F8F9FC', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #EEF1F8' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: NAVY }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--color-navy-400)', fontWeight: 600 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="jsc-card" style={{ overflow: 'hidden' }}>
        <div className="jsc-filter-bar">
          <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-navy-400)' }} />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="jsc-search-bar"
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '48px 24px', display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" size={32} color={GOLD} /></div>
        ) : filtered.length === 0 ? (
          <div className="jsc-empty-state">
            <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY }}>No sessions found</h3>
            <p style={{ fontSize: 13.5, color: 'var(--color-navy-400)', marginBottom: 24 }}>Create your first demo session to get started.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="jsc-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Session</th>
                  <th style={{ textAlign: 'left' }}>Faculty / Subject</th>
                  <th style={{ textAlign: 'center' }}>Schedule</th>
                  <th style={{ textAlign: 'center' }}>Registrations</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row._id} className="group">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {row.thumbnailUrl ? (
                          <img src={row.thumbnailUrl} alt="" style={{ width: 48, height: 36, borderRadius: 6, objectFit: 'cover', border: '1px solid #EEF1F8', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 48, height: 36, borderRadius: 6, background: '#F0F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Video size={18} color="#6366F1" />
                          </div>
                        )}
                        <div>
                          <p style={{ fontWeight: 700, color: NAVY, fontSize: 13.5 }}>{row.title}</p>
                          {row.isLive && <span style={{ fontSize: 10, background: '#FEE2E2', color: '#DC2626', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>LIVE</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>
                        <span style={{ fontWeight: 600, color: NAVY }}>{row.faculty || '—'}</span>
                        {row.subject && <div style={{ fontSize: 11, color: 'var(--color-navy-400)' }}>{row.subject}</div>}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-navy-400)' }}>{formatDate(row.scheduleDate)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: NAVY }}>
                        <Users size={13} color="var(--color-navy-400)" />
                        {row.registrationsCount || 0}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {row.isPublished ? (
                        <span className="badge-active">Published</span>
                      ) : (
                        <span className="badge-inactive">Draft</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <button onClick={() => handleEdit(row)} className="jsc-action-btn edit" title="Edit" style={{ opacity: 1 }}><Edit2 size={15} /></button>
                        <button onClick={() => handleDelete(row)} className="jsc-action-btn delete" title="Delete" style={{ opacity: 1 }}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AppDrawer
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editData ? '✏ Edit Demo Session' : '+ New Demo Session'}
        subtitle="Configure and publish a class session for students."
        footer={drawerFooter}
        maxWidth={640}
      >
        <GenericForm
          formId={formId}
          title="Demo Session"
          fields={fields}
          initialData={editData}
          onSubmit={handleSave}
        />
      </AppDrawer>
    </div>
  );
};

export default DemoSessions;
