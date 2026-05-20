import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, ArrowLeft, Trash2, Edit2, BookOpen, Search, Image as ImageIcon, Info } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AppDrawer from '../components/ui/AppDrawer';
import type { QuestionBankItem } from './QuestionBank';

const NAVY = '#07152F';
const GOLD = '#F4B400';

const ExamQuestions = () => {
  const { id: examId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSearchTerm, setImportSearchTerm] = useState('');
  const [selectedBankQuestions, setSelectedBankQuestions] = useState<QuestionBankItem[]>([]);
  const [editData, setEditData] = useState<{ _id: string; text: string; options: string[]; correctOptionIndex: number; marks: number; explanation?: string; imageUrl?: string; difficultyLevel?: string } | undefined>(undefined);
  const queryClient = useQueryClient();

  // Form State
  const [text, setText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);
  const [marks, setMarks] = useState<number>(1);
  const [explanation, setExplanation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('medium');

  // Fetch Exam Details (for title)
  const { data: examData } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => api.get(`/exams/${examId}`).then((res: { data: { exam: { title: string } } }) => res.data),
  });

  // Fetch Questions
  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['examQuestions', examId],
    queryFn: () => api.get(`/exams/${examId}/questions`).then((res: { data: { questions: { _id: string; text: string; options: string[]; correctOptionIndex: number; marks: number; explanation?: string; imageUrl?: string; difficultyLevel?: string }[] } }) => res.data),
  });

  const exam = examData?.exam;
  const questions = (questionsData?.questions || []) as { _id: string; text: string; options: string[]; correctOptionIndex: number; marks: number; explanation?: string; imageUrl?: string; difficultyLevel?: string }[];

  const createMutation = useMutation({
    mutationFn: (newData: { text: string; options: string[]; correctOptionIndex: number; marks: number; explanation?: string; imageUrl?: string; difficultyLevel?: string }) => api.post(`/exams/${examId}/questions`, newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examQuestions', examId] });
      queryClient.invalidateQueries({ queryKey: ['exams'] }); // For updated total marks
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updateData: { _id: string; text: string; options: string[]; correctOptionIndex: number; marks: number; explanation?: string; imageUrl?: string; difficultyLevel?: string }) => api.patch(`/exams/questions/${updateData._id}`, updateData),
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

  const { data: qbData } = useQuery({
    queryKey: ['questionBank'],
    queryFn: () => api.get('/question-bank').then((res: { data: { data: { questions: QuestionBankItem[] } } }) => res.data.data),
    enabled: isImportModalOpen
  });

  const questionBank = qbData?.questions || [];
  const filteredQuestionBank = questionBank.filter((q: QuestionBankItem) => 
    q.text.toLowerCase().includes(importSearchTerm.toLowerCase()) || 
    q.subject?.toLowerCase().includes(importSearchTerm.toLowerCase()) ||
    q.topic?.toLowerCase().includes(importSearchTerm.toLowerCase())
  );

  const importMutation = useMutation({
    mutationFn: (questions: QuestionBankItem[]) => api.post(`/exams/${examId}/questions/import`, { questions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examQuestions', examId] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setIsImportModalOpen(false);
      setSelectedBankQuestions([]);
    }
  });

  const handleImport = () => {
    if (selectedBankQuestions.length === 0) return;
    importMutation.mutate(selectedBankQuestions);
  };

  const handleOpenEdit = (q: { _id: string; text: string; options: string[]; correctOptionIndex: number; marks: number; explanation?: string; imageUrl?: string; difficultyLevel?: string }) => {
    setEditData(q);
    setText(q.text);
    setOptions(q.options.length ? q.options : ['', '', '', '']);
    setCorrectOptionIndex(q.correctOptionIndex);
    setMarks(q.marks);
    setExplanation(q.explanation || '');
    setImageUrl(q.imageUrl || '');
    setDifficultyLevel(q.difficultyLevel || 'medium');
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditData(undefined);
    setText('');
    setOptions(['', '', '', '']);
    setCorrectOptionIndex(0);
    setMarks(1);
    setExplanation('');
    setImageUrl('');
    setDifficultyLevel('medium');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (options.some(o => !o.trim())) {
      alert("All options must be filled.");
      return;
    }
    const payload = { text, options, correctOptionIndex, marks, explanation, imageUrl, difficultyLevel };
    
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
          <button onClick={() => setIsImportModalOpen(true)} className="btn-outline" style={{ padding: '9px 18px', fontSize: 13, marginRight: 12 }}>
            <BookOpen size={15} style={{ display: 'inline', marginRight: 6 }} /> Import from Bank
          </button>
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
             <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {questions.map((q, idx: number) => (
                    <div key={q._id} style={{ border: '1px solid #EEF1F8', borderRadius: 12, padding: 16, background: '#F9FAFB' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1, marginRight: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4, background: q.difficultyLevel === 'easy' ? '#D1FAE5' : q.difficultyLevel === 'hard' ? '#FEE2E2' : '#FEF3C7', color: q.difficultyLevel === 'easy' ? '#065F46' : q.difficultyLevel === 'hard' ? '#991B1B' : '#92400E' }}>
                                    {q.difficultyLevel || 'medium'}
                                  </span>
                                  {q.imageUrl && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, background: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: 4 }}><ImageIcon size={12} /> Graphic Attached</span>}
                                </div>
                                <h4 style={{ fontSize: 15, fontWeight: 600, color: NAVY, marginBottom: 12 }}>
                                    Q{idx + 1}. {q.text}
                                </h4>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, height: 'fit-content' }}>{q.marks} Marks</span>
                                <button onClick={() => handleOpenEdit(q)} className="jsc-action-btn edit" style={{ opacity: 1, padding: 4 }}><Edit2 size={15} /></button>
                                <button onClick={() => { if(window.confirm('Delete question?')) deleteMutation.mutate(q._id) }} className="jsc-action-btn delete" style={{ opacity: 1, padding: 4 }}><Trash2 size={15} /></button>
                            </div>
                        </div>

                        {q.imageUrl && (
                          <div style={{ margin: '8px 0 16px 0', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', maxWidth: 300, background: '#fff' }}>
                            <img src={q.imageUrl} alt="Diagram" style={{ width: '100%', height: 'auto', display: 'block' }} />
                          </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: q.explanation ? 12 : 0 }}>
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

                        {q.explanation && (
                          <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: 10, marginTop: 10, fontSize: 12.5, color: '#4B5563', display: 'flex', gap: 6 }}>
                            <Info size={14} style={{ color: GOLD, marginTop: 2, flexShrink: 0 }} />
                            <div>
                              <strong>Explanation:</strong> {q.explanation}
                            </div>
                          </div>
                        )}
                    </div>
                ))}
             </div>
        )}
      </div>

      <AppDrawer isOpen={isModalOpen} onClose={handleClose} title={editData ? `Edit Question` : `Add Question`} subtitle="Add MCQ options and mark the correct one." footer={drawerFooter} maxWidth={620}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                    <label className="jsc-form-label">Marks <span className="required">*</span></label>
                    <input type="number" min="1" className="jsc-input" required value={marks} onChange={e => setMarks(Number(e.target.value))} />
                </div>
                <div>
                    <label className="jsc-form-label">Difficulty Level</label>
                    <select className="jsc-input" value={difficultyLevel} onChange={e => setDifficultyLevel(e.target.value)}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="jsc-form-label">Question Graphic/Image URL (Optional)</label>
                <input type="text" className="jsc-input" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://judicialstudycentre.in/uploads/diagram.jpeg" />
            </div>

            <div>
                <label className="jsc-form-label">Solution Explanation (Optional)</label>
                <textarea className="jsc-textarea" value={explanation} onChange={e => setExplanation(e.target.value)} rows={3} placeholder="Provide details, section citations, and logic for the correct answer..." />
            </div>
         </form>
      </AppDrawer>

      <AppDrawer
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import from Question Bank"
        subtitle="Select questions to add to this exam."
        maxWidth={800}
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%' }}>
            <span style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{selectedBankQuestions.length} selected</span>
            <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setIsImportModalOpen(false)} style={{ padding: '10px 22px', borderRadius: 10, border: '1.5px solid #D0D8E8', background: '#fff', color: NAVY, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="button" onClick={handleImport} disabled={importMutation.isPending || selectedBankQuestions.length === 0} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: importMutation.isPending || selectedBankQuestions.length === 0 ? '#D0D8E8' : `linear-gradient(135deg,${GOLD},#FFD24C)`, color: NAVY, fontSize: 14, fontWeight: 700, cursor: importMutation.isPending || selectedBankQuestions.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {importMutation.isPending ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                  Import Selected
                </button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-navy-400)' }} />
            <input type="text" placeholder="Search by question, subject or topic..." value={importSearchTerm} onChange={(e) => setImportSearchTerm(e.target.value)} className="jsc-search-bar" style={{ paddingLeft: 36, width: '100%' }} />
          </div>
          
          <div style={{ maxHeight: '60vh', overflowY: 'auto', border: '1px solid #EEF1F8', borderRadius: 12 }}>
            <table className="jsc-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedBankQuestions.length === filteredQuestionBank.length && filteredQuestionBank.length > 0}
                        onChange={(e) => {
                            if (e.target.checked) setSelectedBankQuestions([...filteredQuestionBank]);
                            else setSelectedBankQuestions([]);
                        }}
                      />
                  </th>
                  <th style={{ textAlign: 'left' }}>Question</th>
                  <th style={{ textAlign: 'left' }}>Subject</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestionBank.map((q: QuestionBankItem) => (
                  <tr key={q._id}>
                    <td style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedBankQuestions.some(sq => sq._id === q._id)}
                        onChange={(e) => {
                            if (e.target.checked) setSelectedBankQuestions([...selectedBankQuestions, q]);
                            else setSelectedBankQuestions(selectedBankQuestions.filter(sq => sq._id !== q._id));
                        }}
                      />
                    </td>
                    <td>
                      <p style={{ fontWeight: 600, color: NAVY, fontSize: 13, marginBottom: 4 }}>{q.text}</p>
                    </td>
                    <td><span style={{ fontSize: 11, background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: 12 }}>{q.subject}</span></td>
                  </tr>
                ))}
                {filteredQuestionBank.length === 0 && (
                    <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: 24, color: 'var(--color-navy-400)' }}>No questions found in bank</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AppDrawer>
    </div>
  );
};

export default ExamQuestions;
