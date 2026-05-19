import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, ArrowLeft, Trash2, Edit2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AppDrawer from '../components/ui/AppDrawer';

const NAVY = '#07152F';
const GOLD = '#F4B400';

const ExamQuestions = () => {
  const { id: examId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<{ _id: string; text: string; options: string[]; correctOptionIndex: number; marks: number } | undefined>(undefined);
  const queryClient = useQueryClient();

  // Form State
  const [text, setText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);
  const [marks, setMarks] = useState<number>(1);

  // Fetch Exam Details (for title)
  const { data: examData } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => api.get(`/exams/${examId}`).then((res: { data: { exam: { title: string } } }) => res.data),
  });

  // Fetch Questions
  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['examQuestions', examId],
    queryFn: () => api.get(`/exams/${examId}/questions`).then((res: { data: { questions: { _id: string; text: string; options: string[]; correctOptionIndex: number; marks: number }[] } }) => res.data),
  });

  const exam = examData?.exam;
  const questions = (questionsData?.questions || []) as { _id: string; text: string; options: string[]; correctOptionIndex: number; marks: number }[];

  const createMutation = useMutation({
    mutationFn: (newData: { text: string; options: string[]; correctOptionIndex: number; marks: number }) => api.post(`/exams/${examId}/questions`, newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examQuestions', examId] });
      queryClient.invalidateQueries({ queryKey: ['exams'] }); // For updated total marks
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updateData: { _id: string; text: string; options: string[]; correctOptionIndex: number; marks: number }) => api.patch(`/exams/questions/${updateData._id}`, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examQuestions', examId] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (qId: string) => api.delete(`/exams/questions/${qId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examQuestions', examId] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });

  const handleOpenEdit = (q: { _id: string; text: string; options: string[]; correctOptionIndex: number; marks: number }) => {
    setEditData(q);
    setText(q.text);
    setOptions(q.options.length ? q.options : ['', '', '', '']);
    setCorrectOptionIndex(q.correctOptionIndex);
    setMarks(q.marks);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditData(undefined);
    setText('');
    setOptions(['', '', '', '']);
    setCorrectOptionIndex(0);
    setMarks(1);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (options.some(o => !o.trim())) {
      alert("All options must be filled.");
      return;
    }
    const payload = { text, options, correctOptionIndex, marks };
    
    try {
      if (editData) {
        await updateMutation.mutateAsync({ ...payload, _id: editData._id });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (err: unknown) {
      const error = err as { message: string };
      alert(`Error saving question: ${error.message}`);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const drawerFooter = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
      <button type="button" onClick={handleClose} style={{ padding: '10px 22px', borderRadius: 10, border: '1.5px solid #D0D8E8', background: '#fff', color: NAVY, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
        Cancel
      </button>
      <button type="submit" form="question-form" disabled={isSaving} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: isSaving ? '#D0D8E8' : `linear-gradient(135deg,${GOLD},#FFD24C)`, color: NAVY, fontSize: 14, fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
        {isSaving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : null}
        Save Question
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div className="jsc-page-header">
          <button onClick={() => navigate('/exams')} className="btn-outline" style={{ marginBottom: 12, padding: '6px 12px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
             <ArrowLeft size={14} /> Back to Exams
          </button>
          <h1 className="jsc-page-title">Manage Questions</h1>
          <p className="jsc-page-subtitle">Exam: {exam?.title || 'Loading...'}</p>
        </div>
        <div>
          <button onClick={() => setIsModalOpen(true)} className="btn-gold" style={{ padding: '9px 18px', fontSize: 13 }}>
            <Plus size={15} /> Add Question
          </button>
        </div>
      </div>

      <div className="jsc-card" style={{ overflow: 'hidden', padding: 24 }}>
        {isLoading ? (
            <div style={{ padding: '48px 24px', display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" size={32} color={GOLD} /></div>
        ) : questions.length === 0 ? (
             <div className="jsc-empty-state">
                <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY }}>No questions added yet</h3>
                <p style={{ fontSize: 13.5, color: 'var(--color-navy-400)', marginBottom: 24 }}>Add some MCQs to this exam.</p>
             </div>
        ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {questions.map((q: { _id: string; text: string; options: string[]; correctOptionIndex: number; marks: number }, idx: number) => (
                    <div key={q._id} style={{ border: '1px solid #EEF1F8', borderRadius: 12, padding: 16, background: '#F9FAFB' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h4 style={{ fontSize: 15, fontWeight: 600, color: NAVY, marginBottom: 12 }}>
                                Q{idx + 1}. {q.text}
                            </h4>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{q.marks} Marks</span>
                                <button onClick={() => handleOpenEdit(q)} className="jsc-action-btn edit" style={{ opacity: 1, padding: 4 }}><Edit2 size={15} /></button>
                                <button onClick={() => { if(window.confirm('Delete question?')) deleteMutation.mutate(q._id) }} className="jsc-action-btn delete" style={{ opacity: 1, padding: 4 }}><Trash2 size={15} /></button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {q.options.map((opt: string, optIdx: number) => (
                                <div key={optIdx} style={{ 
                                    padding: '8px 12px', 
                                    background: q.correctOptionIndex === optIdx ? '#D1FAE5' : '#fff', 
                                    border: `1px solid ${q.correctOptionIndex === optIdx ? '#10B981' : '#E5E7EB'}`,
                                    borderRadius: 6,
                                    fontSize: 13,
                                    color: q.correctOptionIndex === optIdx ? '#065F46' : NAVY
                                }}>
                                    {String.fromCharCode(65 + optIdx)}. {opt} {q.correctOptionIndex === optIdx && '(Correct)'}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
             </div>
        )}
      </div>

      <AppDrawer isOpen={isModalOpen} onClose={handleClose} title={editData ? `Edit Question` : `Add Question`} subtitle="Add MCQ options and mark the correct one." footer={drawerFooter} maxWidth={600}>
         <form id="question-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
                <label className="jsc-form-label">Question Text <span className="required">*</span></label>
                <textarea className="jsc-textarea" required value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="Enter the question here..." />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {options.map((opt, idx) => (
                    <div key={idx}>
                        <label className="jsc-form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            Option {String.fromCharCode(65 + idx)}
                            <input 
                                type="radio" 
                                name="correctOption" 
                                checked={correctOptionIndex === idx} 
                                onChange={() => setCorrectOptionIndex(idx)} 
                            />
                        </label>
                        <input type="text" className="jsc-input" required value={opt} onChange={e => {
                            const newOptions = [...options];
                            newOptions[idx] = e.target.value;
                            setOptions(newOptions);
                        }} placeholder={`Option ${idx + 1}`} />
                    </div>
                ))}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="jsc-form-label" style={{ margin: 0 }}>Correct Option is marked by radio button above.</span>
            </div>

            <div>
                <label className="jsc-form-label">Marks for this question <span className="required">*</span></label>
                <input type="number" min="1" className="jsc-input" required value={marks} onChange={e => setMarks(Number(e.target.value))} style={{ width: 100 }} />
            </div>
         </form>
      </AppDrawer>
    </div>
  );
};

export default ExamQuestions;
