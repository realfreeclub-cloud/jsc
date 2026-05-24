import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Loader2, Edit2, Trash2, Info } from 'lucide-react';
import api from '../utils/api';
import AppDrawer from '../components/ui/AppDrawer';
import type { QuestionBankItem } from './QuestionBank';

const NAVY = '#07152F';
const GOLD = '#F4B400';

interface PaperSet {
  _id: string;
  title: string;
  description: string;
  questions: QuestionBankItem[];
  createdAt: string;
}

const PaperSets = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Form states
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [qbSearchTerm, setQbSearchTerm] = useState('');

  // Fetch Paper Sets
  const { data: paperSetsData, isLoading: isLoadingPaperSets, error: errorPaperSets } = useQuery({
    queryKey: ['paperSets'],
    queryFn: () => api.get('/paper-sets').then(res => res.data),
  });

  // Fetch Question Bank for selection
  const { data: qbData, isLoading: isLoadingQb } = useQuery({
    queryKey: ['questionBank'],
    queryFn: () => api.get('/question-bank').then(res => res.data),
  });

  const paperSets = (paperSetsData?.data?.paperSets || []) as PaperSet[];
  const questionBank = (qbData?.data?.questions || []) as QuestionBankItem[];

  const filteredPaperSets = paperSets.filter(ps => 
    ps.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (ps.description && ps.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredQuestionBank = questionBank.filter(q => 
    q.text.toLowerCase().includes(qbSearchTerm.toLowerCase()) ||
    (q.subject && q.subject.toLowerCase().includes(qbSearchTerm.toLowerCase())) ||
    (q.topic && q.topic.toLowerCase().includes(qbSearchTerm.toLowerCase()))
  );

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newData: any) => api.post('/paper-sets', newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paperSets'] });
      handleClose();
      alert('Paper Set created successfully!');
    },
    onError: (err: any) => {
      alert(`Create failed: ${err.response?.data?.message || err.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updateData: { _id: string; title: string; description: string; questions: string[] }) =>
      api.patch(`/paper-sets/${updateData._id}`, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paperSets'] });
      handleClose();
      alert('Paper Set updated successfully!');
    },
    onError: (err: any) => {
      alert(`Update failed: ${err.response?.data?.message || err.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/paper-sets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paperSets'] });
      alert('Paper Set deleted successfully!');
    },
    onError: (err: any) => {
      alert(`Delete failed: ${err.response?.data?.message || err.message}`);
    }
  });

  const handleOpenCreate = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setSelectedQuestions([]);
    setQbSearchTerm('');
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (ps: PaperSet) => {
    setEditId(ps._id);
    setTitle(ps.title);
    setDescription(ps.description || '');
    setSelectedQuestions(ps.questions?.map(q => q._id as string).filter(Boolean) || []);
    setQbSearchTerm('');
    setIsDrawerOpen(true);
  };

  const handleDelete = (ps: PaperSet) => {
    if (window.confirm(`Are you sure you want to delete Paper Set "${ps.title}"?`)) {
      deleteMutation.mutate(ps._id);
    }
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
    setEditId(null);
    setTitle('');
    setDescription('');
    setSelectedQuestions([]);
  };

  const handleToggleQuestion = (id: string) => {
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter(qId => qId !== id));
    } else {
      setSelectedQuestions([...selectedQuestions, id]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Paper Set Title is required.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      questions: selectedQuestions
    };

    if (editId) {
      await updateMutation.mutateAsync({ ...payload, _id: editId });
    } else {
      await createMutation.mutateAsync(payload);
    }
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
        form="paper-set-form"
        disabled={isSaving}
        style={{
          padding: '10px 24px', borderRadius: 10, border: 'none',
          background: isSaving ? '#D0D8E8' : `linear-gradient(135deg,${GOLD},#FFD24C)`,
          color: NAVY, fontSize: 14, fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 8
        }}
      >
        {isSaving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : null}
        {editId ? `Update Paper Set` : `Create Paper Set`}
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div className="jsc-page-header">
          <h1 className="jsc-page-title">Paper Set Management</h1>
          <p className="jsc-page-subtitle">Group questions into reusable paper sets and publish them as live exams.</p>
        </div>
        <div>
          <button
            onClick={handleOpenCreate}
            className="btn-gold" style={{ padding: '9px 18px', fontSize: 13 }}
          >
            <Plus size={15} /> Add New Paper Set
          </button>
        </div>
      </div>

      <div className="jsc-card" style={{ overflow: 'hidden' }}>
        <div className="jsc-filter-bar">
          <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-navy-400)' }} />
            <input
              type="text"
              placeholder="Search paper sets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="jsc-search-bar"
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        {isLoadingPaperSets ? (
          <div style={{ padding: '48px 24px', display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" size={32} color={GOLD} /></div>
        ) : errorPaperSets ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>Error loading paper sets</div>
        ) : filteredPaperSets.length === 0 ? (
          <div className="jsc-empty-state">
            <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY }}>No paper sets found</h3>
            <p style={{ fontSize: 13.5, color: 'var(--color-navy-400)', marginBottom: 24 }}>Create your first reusable question paper set.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="jsc-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Paper Set Name</th>
                  <th style={{ textAlign: 'left' }}>Description</th>
                  <th style={{ textAlign: 'center' }}>Total Questions</th>
                  <th style={{ textAlign: 'center' }}>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPaperSets.map((row) => (
                  <tr key={row._id} className="group">
                    <td>
                      <p style={{ fontWeight: 600, color: NAVY, fontSize: 13.5 }}>{row.title}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--color-navy-300)' }}>{row._id}</p>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: '#4B5563' }}>{row.description || 'No description provided'}</span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: NAVY }}>
                      {row.questions?.length || 0} Questions
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {new Date(row.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <button onClick={() => handleOpenEdit(row)} className="jsc-action-btn edit" title="Edit" style={{ opacity: 1 }}><Edit2 size={15} /></button>
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
        isOpen={isDrawerOpen}
        onClose={handleClose}
        title={editId ? `✏ Edit Paper Set` : `+ Create New Paper Set`}
        subtitle="Specify paper details and choose question set."
        footer={drawerFooter}
        maxWidth={720}
      >
        <form id="paper-set-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="jsc-form-label">Paper Set Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter paper set title (e.g. Constitutional Law Test A)"
                className="jsc-input"
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="jsc-form-label">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter short description..."
                className="jsc-textarea"
                rows={2}
              />
            </div>
          </div>

          {/* Question Selection UI */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="jsc-form-label" style={{ marginBottom: 2 }}>Select Questions from Question Bank</label>
              <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>Choose questions to assign to this Paper Set ({selectedQuestions.length} selected)</p>
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search master bank by question text, subject, topic..."
                value={qbSearchTerm}
                onChange={(e) => setQbSearchTerm(e.target.value)}
                className="jsc-input"
                style={{ paddingLeft: 34, height: 36, fontSize: 12.5 }}
              />
            </div>

            {/* Questions Selection Scroll List */}
            {isLoadingQb ? (
              <div style={{ padding: 20, display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" size={24} color={GOLD} /></div>
            ) : filteredQuestionBank.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', background: '#F8FAFC', borderRadius: 8, color: '#6B7280', fontSize: 12.5 }}>
                <Info size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                No matching questions found in bank.
              </div>
            ) : (
              <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #EEF1F8', borderRadius: 8, background: '#F9FAFB' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                      <th style={{ width: 40, padding: 8, textAlign: 'center' }}>
                        <input 
                          type="checkbox"
                          checked={filteredQuestionBank.length > 0 && filteredQuestionBank.every(q => selectedQuestions.includes(q._id as string))}
                          onChange={(e) => {
                            const newIds = e.target.checked 
                              ? Array.from(new Set([...selectedQuestions, ...filteredQuestionBank.map(q => q._id as string)]))
                              : selectedQuestions.filter(id => !filteredQuestionBank.map(q => q._id as string).includes(id));
                            setSelectedQuestions(newIds);
                          }}
                        />
                      </th>
                      <th style={{ padding: 8, color: NAVY }}>Question Text</th>
                      <th style={{ padding: 8, color: NAVY, width: 120 }}>Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestionBank.map((q) => {
                      const isChecked = selectedQuestions.includes(q._id as string);
                      return (
                        <tr key={q._id} style={{ borderBottom: '1px solid #F1F5F9', background: isChecked ? 'rgba(244,180,0,0.06)' : '#fff' }}>
                          <td style={{ padding: 8, textAlign: 'center' }}>
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleQuestion(q._id as string)}
                            />
                          </td>
                          <td style={{ padding: 8, color: NAVY, fontWeight: 500 }}>
                            <div style={{ maxHeight: 38, overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.text}</div>
                          </td>
                          <td style={{ padding: 8 }}>
                            <span style={{ fontSize: 10.5, background: '#EEF2FF', color: '#4F46E5', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                              {q.subject}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </form>
      </AppDrawer>
    </div>
  );
};

export default PaperSets;
