import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Loader2, Edit2, Trash2, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AppDrawer from '../components/ui/AppDrawer';
import GenericForm, { type Field } from '../components/ui/GenericForm';

const NAVY = '#07152F';
const GOLD = '#F4B400';

const Exams = () => {
  const navigate = useNavigate();
  const [formId] = useState(() => `exam-form`);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<Record<string, unknown> | undefined>(undefined);
  const queryClient = useQueryClient();

  // Fetch Exams
  const { data: examsData, isLoading: isLoadingExams, error: errorExams } = useQuery({
    queryKey: ['exams'],
    queryFn: () => api.get('/exams').then(res => res.data),
  });

  // Fetch Courses for Select Dropdown
  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(res => res.data),
  });

  const exams = (examsData?.data?.exams || []) as { _id: string; title: string; course: { _id: string; title: string }; durationMinutes: number; totalMarks: number; isActive: boolean }[];
  const courses = (coursesData?.data?.courses || []) as { _id: string; title: string }[];
  const filteredExams = exams.filter((e) => e.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const courseOptions = courses.map(c => ({
    label: c.title,
    value: c._id
  }));

  const fields: Field[] = [
    { name: 'title', label: 'Exam Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'course', label: 'Course', type: 'select', options: courseOptions, required: true },
    { name: 'durationMinutes', label: 'Duration (Minutes)', type: 'number', required: true },
    { name: 'passingMarks', label: 'Passing Marks', type: 'number', required: true },
    { name: 'negativeMarking', label: 'Negative Marks (Deducted per incorrect MCQ)', type: 'number' },
    { name: 'attemptsAllowed', label: 'Allowed Attempts count (0 or 99 for unlimited)', type: 'number' },
    { name: 'shuffleQuestions', label: 'Shuffle Questions order dynamically', type: 'checkbox' },
    { name: 'shuffleOptions', label: 'Shuffle Options order dynamically', type: 'checkbox' },
    { name: 'isActive', label: 'Is Active', type: 'checkbox' }
  ];

  const createMutation = useMutation({
    mutationFn: (newData: Record<string, unknown>) => api.post(`/exams`, newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updateData: { _id: string } & Record<string, unknown>) =>
      api.patch(`/exams/${updateData._id}`, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/exams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });

  const handleSave = async (formData: Record<string, unknown>) => {
    try {
      if (editData) {
        // extract string if object populated
        const payload = { ...formData, course: typeof formData.course === 'object' && formData.course !== null ? (formData.course as { _id: string })._id : formData.course };
        await updateMutation.mutateAsync({ ...payload, _id: editData._id as string });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message: string };
      alert(`Save failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (row: { _id: string; title: string; course?: { _id: string; title: string } | string; durationMinutes: number; totalMarks: number; isActive: boolean }) => {
    setEditData({
        ...row,
        course: typeof row.course === 'object' && row.course !== null ? row.course._id : row.course
    });
    setIsModalOpen(true);
  };

  const handleDelete = (row: { _id: string; title: string }) => {
    if (window.confirm(`Delete exam "${row.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(row._id as string);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditData(undefined);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const drawerFooter = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
      <button
        type="button"
        onClick={handleClose}
        style={{
          padding: '10px 22px', borderRadius: 10, border: '1.5px solid #D0D8E8',
          background: '#fff', color: NAVY, fontSize: 14, fontWeight: 600, cursor: 'pointer'
        }}
      >
        Cancel
      </button>
      <button
        type="submit"
        form={formId}
        disabled={isSaving}
        style={{
          padding: '10px 24px', borderRadius: 10, border: 'none',
          background: isSaving ? '#D0D8E8' : `linear-gradient(135deg,${GOLD},#FFD24C)`,
          color: NAVY, fontSize: 14, fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 8
        }}
      >
        {isSaving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : null}
        {editData ? `Update Exam` : `Create Exam`}
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div className="jsc-page-header">
          <h1 className="jsc-page-title">Exams Management (Test Series)</h1>
          <p className="jsc-page-subtitle">Manage MCQ Test Series and assign them to courses.</p>
        </div>
        <div>
          <button
            onClick={() => { setEditData(undefined); setIsModalOpen(true); }}
            className="btn-gold" style={{ padding: '9px 18px', fontSize: 13 }}
          >
            <Plus size={15} /> Add New Exam
          </button>
        </div>
      </div>

      <div className="jsc-card" style={{ overflow: 'hidden' }}>
        <div className="jsc-filter-bar">
          <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-navy-400)' }} />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="jsc-search-bar"
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        {isLoadingExams ? (
          <div style={{ padding: '48px 24px', display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" size={32} color={GOLD} /></div>
        ) : errorExams ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>Error loading exams</div>
        ) : filteredExams.length === 0 ? (
          <div className="jsc-empty-state">
            <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY }}>No exams found</h3>
            <p style={{ fontSize: 13.5, color: 'var(--color-navy-400)', marginBottom: 24 }}>Get started by creating your first exam.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="jsc-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Exam Details</th>
                  <th style={{ textAlign: 'left' }}>Course</th>
                  <th style={{ textAlign: 'center' }}>Duration</th>
                  <th style={{ textAlign: 'center' }}>Total Marks</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((row: { _id: string; title: string; course: { _id: string; title: string }; durationMinutes: number; totalMarks: number; isActive: boolean }) => (
                  <tr key={row._id} className="group">
                    <td>
                      <p style={{ fontWeight: 600, color: NAVY, fontSize: 13.5 }}>{row.title}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--color-navy-300)' }}>{row._id}</p>
                    </td>
                    <td><span style={{ fontSize: 13 }}>{row.course?.title || 'Unknown'}</span></td>
                    <td style={{ textAlign: 'center' }}>{row.durationMinutes} min</td>
                    <td style={{ textAlign: 'center' }}>{row.totalMarks}</td>
                    <td style={{ textAlign: 'center' }}>
                      {row.isActive ? (
                        <span className="badge-active">Active</span>
                      ) : (
                        <span className="badge-inactive">Draft</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <button onClick={() => navigate(`/exams/${row._id}/questions`)} className="jsc-action-btn view" title="Manage Questions" style={{ background: '#EEF2FF', color: '#4F46E5', opacity: 1 }}>
                            <List size={15} /> Questions
                        </button>
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
        title={editData ? `✏ Edit Exam` : `+ Create New Exam`}
        subtitle="Fill out the information below."
        footer={drawerFooter}
        maxWidth={620}
      >
        <GenericForm
          formId={formId}
          title="Exam"
          fields={fields}
          initialData={editData}
          onSubmit={handleSave}
        />
      </AppDrawer>
    </div>
  );
};

export default Exams;
