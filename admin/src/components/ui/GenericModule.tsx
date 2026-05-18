import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, AlertCircle, Loader2, Edit2, Trash2, RefreshCw, Save } from 'lucide-react';
import api from '../../utils/api';
import GenericForm, { type Field } from './GenericForm';
import AppDrawer from './AppDrawer';

interface GenericModuleProps {
  title: string;
  endpoint: string;
  fields: Field[];
}

const NAVY = '#07152F';
const GOLD = '#F4B400';

let formCounter = 0;

const GenericModule = ({ title, endpoint, fields }: GenericModuleProps) => {
  const [formId] = useState(() => `gf-${++formCounter}`);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<Record<string, unknown> | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [endpoint, searchTerm],
    queryFn: () => api.get(`/${endpoint}?search=${searchTerm}`).then(res => res.data),
  });

  const results = (data?.data || []) as Record<string, unknown>[];

  const createMutation = useMutation({
    mutationFn: (newData: Record<string, unknown>) => api.post(`/${endpoint}`, newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updateData: Record<string, unknown>) =>
      api.patch(`/${endpoint}/${updateData._id}`, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/${endpoint}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
  });

  const handleSave = async (formData: Record<string, unknown>) => {
    try {
      if (editData) {
        await updateMutation.mutateAsync({ ...formData, _id: editData._id });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (err: unknown) {
      console.error('Save failed:', err);
      const error = err as Error & { response?: { data?: { message?: string } } };
      alert(`Save failed: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const handleEdit = (row: Record<string, unknown>) => {
    setEditData(row);
    setIsModalOpen(true);
  };

  const handleDelete = (row: Record<string, unknown>) => {
    if (window.confirm(`Delete this ${title.toLowerCase()}? This cannot be undone.`)) {
      deleteMutation.mutate(row._id as string);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditData(undefined);
  };

  const isBusy = isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  /* ── Drawer footer: Cancel + Submit — separated from GenericForm ─────────
     The submit button uses HTML5 form association (form={formId}) to trigger
     the <form id={formId}> that lives inside GenericForm, even though this
     button is outside that form element.                                     */
  const drawerFooter = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
      <button
        type="button"
        onClick={handleClose}
        style={{
          padding: '10px 22px',
          borderRadius: 10,
          border: '1.5px solid #D0D8E8',
          background: '#fff',
          color: NAVY,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        Cancel
      </button>

      {/* This button is NOT inside the form — it links to it via form={formId} */}
      <button
        type="submit"
        form={formId}
        disabled={isSaving}
        style={{
          padding: '10px 24px',
          borderRadius: 10,
          border: 'none',
          background: isSaving ? '#D0D8E8' : `linear-gradient(135deg,${GOLD},#FFD24C)`,
          color: NAVY,
          fontSize: 14,
          fontWeight: 700,
          cursor: isSaving ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: isSaving ? 'none' : '0 4px 14px rgba(244,180,0,0.35)',
          transition: 'all 0.2s',
        }}
      >
        {isSaving
          ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
          : <Save size={15} />
        }
        {editData ? `Update ${title}` : `Create ${title}`}
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div className="jsc-page-header">
          <h1 className="jsc-page-title">{title} Management</h1>
          <p className="jsc-page-subtitle">Configure and monitor your {title.toLowerCase()} records.</p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isBusy && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: GOLD, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Syncing...
            </div>
          )}
          <button onClick={() => refetch()} className="btn-outline" style={{ padding: '8px 14px', fontSize: 13, gap: 6 }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => { setEditData(undefined); setIsModalOpen(true); }}
            className="btn-gold"
            style={{ padding: '9px 18px', fontSize: 13 }}
          >
            <Plus size={15} /> Add New {title}
          </button>
        </div>
      </div>

      {/* ── Main Card ── */}
      <div className="jsc-card" style={{ overflow: 'hidden' }}>
        <div className="jsc-filter-bar">
          <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-navy-400)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="jsc-search-bar"
              style={{ paddingLeft: 36 }}
            />
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--color-navy-400)', fontWeight: 500 }}>
            {results.length > 0 && `${results.length} record${results.length > 1 ? 's' : ''}`}
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '48px 24px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ height: 56, background: 'var(--color-navy-50)', borderRadius: 10, marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: '64px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: '#DC2626' }}>
              <AlertCircle size={28} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Connection Error</h3>
            <p style={{ fontSize: 13.5, color: 'var(--color-navy-400)' }}>
              We couldn't fetch the {title.toLowerCase()} list. Check the server connection.
            </p>
            <button onClick={() => refetch()} className="btn-navy" style={{ marginTop: 20, padding: '9px 20px', fontSize: 13 }}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="jsc-empty-state">
            <div className="jsc-empty-icon"><Search size={26} /></div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 8 }}>No {title.toLowerCase()} found</h3>
            <p style={{ fontSize: 13.5, color: 'var(--color-navy-400)', marginBottom: 24 }}>
              Get started by creating your first {title.toLowerCase()} record.
            </p>
            <button onClick={() => { setEditData(undefined); setIsModalOpen(true); }} className="btn-gold" style={{ padding: '10px 24px' }}>
              <Plus size={15} /> Create First {title}
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="jsc-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Details</th>
                  <th style={{ textAlign: 'left' }}>Status</th>
                  <th style={{ textAlign: 'left' }}>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => (
                  <tr key={row._id as string} className="group">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {typeof row.imageUrl === 'string' && row.imageUrl && (
                          <img src={row.imageUrl} alt="Thumbnail" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1.5px solid var(--color-navy-100)', flexShrink: 0 }} />
                        )}
                        <div>
                          <p style={{ fontWeight: 600, color: NAVY, fontSize: 13.5, marginBottom: 2 }}>
                            {String(row.title || row.name || row.platform || row.courseName || 'Untitled')}
                          </p>
                          <p style={{ fontSize: 11.5, color: 'var(--color-navy-300)', fontFamily: 'monospace', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {String(row._id)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {row.isActive !== undefined ? (
                        row.isActive ? (
                          <span className="badge-active">
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} /> Active
                          </span>
                        ) : (
                          <span className="badge-inactive">
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-navy-300)', display: 'inline-block' }} /> Draft
                          </span>
                        )
                      ) : (
                        <span style={{ color: 'var(--color-navy-300)', fontSize: 13 }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-navy-500)' }}>
                      {row.createdAt
                        ? new Date(row.createdAt as string).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, opacity: 0, transition: 'opacity 0.15s' }} className="group-action-btns">
                        <button onClick={() => handleEdit(row)} className="jsc-action-btn edit" title="Edit"><Edit2 size={15} /></button>
                        <button onClick={() => handleDelete(row)} className="jsc-action-btn delete" title="Delete" disabled={deleteMutation.isPending}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Universal AppDrawer ── */}
      <AppDrawer
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editData ? `✏ Edit ${title}` : `+ Create New ${title}`}
        subtitle="Fill out the information below and save."
        footer={drawerFooter}
        maxWidth={620}
      >
        <GenericForm
          formId={formId}
          title={title}
          fields={fields}
          initialData={editData}
          onSubmit={handleSave}
        />
      </AppDrawer>
    </div>
  );
};

export default GenericModule;
