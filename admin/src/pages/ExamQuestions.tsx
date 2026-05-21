import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Loader2, ArrowLeft, Trash2, Edit2, Search, 
  ChevronUp, ChevronDown, Save, HelpCircle 
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AppDrawer from '../components/ui/AppDrawer';
import type { QuestionBankItem } from './QuestionBank';

const NAVY = '#07152F';
const GOLD = '#F4B400';

interface Section {
  _id?: string;
  name: string;
  description?: string;
  marksPerQuestion?: number;
}

const ExamQuestions = () => {
  const { id: examId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Tab State: 'config' | 'questions' | 'add' | 'publish'
  const [activeTab, setActiveTab] = useState<'config' | 'questions' | 'add' | 'publish'>('questions');

  // Drawer form states for editing / adding questions manually
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(undefined);
  const [text, setText] = useState('');
  const [textHindi, setTextHindi] = useState('');
  const [questionType, setQuestionType] = useState('single-correct');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [optionsHindi, setOptionsHindi] = useState<string[]>(['', '', '', '']);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);
  const [correctOptionIndices, setCorrectOptionIndices] = useState<number[]>([]);
  const [marks, setMarks] = useState<number>(1);
  const [negativeMarks, setNegativeMarks] = useState<number>(0);
  const [explanation, setExplanation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [selectedSection, setSelectedSection] = useState('');

  // Config tab state
  const [accessType, setAccessType] = useState<'free' | 'paid'>('free');
  const [pricing, setPricing] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState('919450614241');
  const [whatsappEnrollmentMessage, setWhatsappEnrollmentMessage] = useState('');
  const [expiryType, setExpiryType] = useState<'lifetime' | 'duration' | 'fixed'>('lifetime');
  const [accessDuration, setAccessDuration] = useState(30);
  const [expiryDate, setExpiryDate] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  
  // Section creation state
  const [newSecName, setNewSecName] = useState('');
  const [newSecDesc, setNewSecDesc] = useState('');
  const [newSecMarks, setNewSecMarks] = useState(1);

  // Manual Picker state
  const [importSearchTerm, setImportSearchTerm] = useState('');
  const [selectedBankQuestions, setSelectedBankQuestions] = useState<QuestionBankItem[]>([]);
  const [importSection, setImportSection] = useState('');

  // Auto-generate state
  const [autoSubject, setAutoSubject] = useState('');
  const [autoTopic, setAutoTopic] = useState('');
  const [autoDifficulty, setAutoDifficulty] = useState('medium');
  const [autoCount, setAutoCount] = useState(10);
  const [autoSection, setAutoSection] = useState('');

  // Publish tab settings
  const [isActive, setIsActive] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [passingMarks, setPassingMarks] = useState(0);
  const [negativeMarking, setNegativeMarking] = useState(0);
  const [attemptsAllowed, setAttemptsAllowed] = useState(1);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);

  // Fetch Exam details
  const { data: examData, isLoading: isExamLoading } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => api.get(`/exams/${examId}`).then(res => res.data),
  });

  // Fetch Questions
  const { data: questionsData, isLoading: isQuestionsLoading } = useQuery({
    queryKey: ['examQuestions', examId],
    queryFn: () => api.get(`/exams/${examId}/questions`).then(res => res.data),
  });

  const exam = examData?.data?.exam;
  const questions = (questionsData?.data?.questions || []) as any[];

  // Sync exam details to local form states on load
  useEffect(() => {
    if (exam) {
      setAccessType(exam.accessType || 'free');
      setPricing(exam.pricing || 0);
      setDiscountedPrice(exam.discountedPrice || 0);
      setWhatsappNumber(exam.whatsappNumber || '919450614241');
      setWhatsappEnrollmentMessage(exam.whatsappEnrollmentMessage || '');
      
      if (exam.expiryDate) {
        setExpiryType('fixed');
        setExpiryDate(new Date(exam.expiryDate).toISOString().substring(0, 10));
      } else if (exam.accessDuration) {
        setExpiryType('duration');
        setAccessDuration(exam.accessDuration);
      } else {
        setExpiryType('lifetime');
      }

      setSections(exam.sections || []);
      
      // Publish tab settings
      setIsActive(exam.isActive !== undefined ? exam.isActive : true);
      setDurationMinutes(exam.durationMinutes || 60);
      setPassingMarks(exam.passingMarks || 0);
      setNegativeMarking(exam.negativeMarking || 0);
      setAttemptsAllowed(exam.attemptsAllowed || 1);
      setShuffleQuestions(exam.shuffleQuestions || false);
      setShuffleOptions(exam.shuffleOptions || false);
    }
  }, [exam]);

  // Mutations
  const updateExamMutation = useMutation({
    mutationFn: (updatedFields: any) => api.patch(`/exams/${examId}`, updatedFields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam', examId] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      alert('Settings updated successfully!');
    },
    onError: (err: any) => {
      alert(`Error updating settings: ${err.response?.data?.message || err.message}`);
    }
  });

  const createQuestionMutation = useMutation({
    mutationFn: (newData: any) => api.post(`/exams/${examId}/questions`, newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examQuestions', examId] });
      queryClient.invalidateQueries({ queryKey: ['exam', examId] });
      handleCloseDrawer();
      alert('Question added successfully!');
    },
    onError: (err: any) => {
      alert(`Error creating question: ${err.message}`);
    }
  });

  const updateQuestionMutation = useMutation({
    mutationFn: (updateData: any) => api.patch(`/exams/questions/${updateData._id}`, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examQuestions', examId] });
      queryClient.invalidateQueries({ queryKey: ['exam', examId] });
      handleCloseDrawer();
      alert('Question updated successfully!');
    },
    onError: (err: any) => {
      alert(`Error updating question: ${err.message}`);
    }
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (qId: string) => api.delete(`/exams/questions/${qId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examQuestions', examId] });
      queryClient.invalidateQueries({ queryKey: ['exam', examId] });
    },
    onError: (err: any) => {
      alert(`Error deleting question: ${err.message}`);
    }
  });

  const importMutation = useMutation({
    mutationFn: (payload: { questions: QuestionBankItem[]; section?: string }) => 
      api.post(`/exams/${examId}/questions/import`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examQuestions', examId] });
      queryClient.invalidateQueries({ queryKey: ['exam', examId] });
      setSelectedBankQuestions([]);
      alert('Questions imported from bank!');
    },
    onError: (err: any) => {
      alert(`Error importing questions: ${err.message}`);
    }
  });

  const autoGenerateMutation = useMutation({
    mutationFn: (payload: any) => api.post(`/exams/${examId}/auto-generate`, payload),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['examQuestions', examId] });
      queryClient.invalidateQueries({ queryKey: ['exam', examId] });
      alert(`Successfully auto-generated ${res.data?.count || 10} questions!`);
    },
    onError: (err: any) => {
      alert(`Error auto-generating: ${err.response?.data?.message || err.message}`);
    }
  });

  // Fetch Question Bank for manual selection
  const { data: qbData } = useQuery({
    queryKey: ['questionBank'],
    queryFn: () => api.get('/question-bank').then(res => res.data),
  });

  const questionBank = (qbData?.data?.questions || []) as QuestionBankItem[];
  const filteredQuestionBank = questionBank.filter((q: QuestionBankItem) => 
    q.text.toLowerCase().includes(importSearchTerm.toLowerCase()) || 
    q.subject?.toLowerCase().includes(importSearchTerm.toLowerCase()) ||
    q.topic?.toLowerCase().includes(importSearchTerm.toLowerCase())
  );

  // Reorder questions client-side swapping
  const handleMoveQuestion = async (currentIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const q1 = questions[currentIndex];
    const q2 = questions[newIndex];

    // Create shallow copies without database identifiers
    const { _id: id1, exam: ex1, createdAt: c1, updatedAt: u1, ...q1Data } = q1;
    const { _id: id2, exam: ex2, createdAt: c2, updatedAt: u2, ...q2Data } = q2;

    try {
      await api.patch(`/exams/questions/${id1}`, q2Data);
      await api.patch(`/exams/questions/${id2}`, q1Data);
      queryClient.invalidateQueries({ queryKey: ['examQuestions', examId] });
    } catch (err: any) {
      alert('Error swapping question positions: ' + err.message);
    }
  };

  const handleSaveConfig = () => {
    const payload: any = {
      accessType,
      pricing: accessType === 'paid' ? pricing : 0,
      discountedPrice: accessType === 'paid' ? discountedPrice : 0,
      whatsappNumber: accessType === 'paid' ? whatsappNumber : undefined,
      whatsappEnrollmentMessage: accessType === 'paid' ? whatsappEnrollmentMessage : undefined,
      sections
    };

    if (expiryType === 'lifetime') {
      payload.accessDuration = null;
      payload.expiryDate = null;
    } else if (expiryType === 'duration') {
      payload.accessDuration = accessDuration;
      payload.expiryDate = null;
    } else if (expiryType === 'fixed') {
      payload.accessDuration = null;
      payload.expiryDate = expiryDate ? new Date(expiryDate) : null;
    }

    updateExamMutation.mutate(payload);
  };

  const handleSavePublish = () => {
    updateExamMutation.mutate({
      isActive,
      durationMinutes,
      passingMarks,
      negativeMarking,
      attemptsAllowed,
      shuffleQuestions,
      shuffleOptions
    });
  };

  // Section Add / Remove
  const handleAddSection = () => {
    if (!newSecName.trim()) return;
    if (sections.some(s => s.name.toLowerCase() === newSecName.trim().toLowerCase())) {
      alert('Section name must be unique.');
      return;
    }
    const updated = [...sections, { name: newSecName.trim(), description: newSecDesc.trim(), marksPerQuestion: newSecMarks }];
    setSections(updated);
    setNewSecName('');
    setNewSecDesc('');
    setNewSecMarks(1);
  };

  const handleRemoveSection = (index: number) => {
    if (window.confirm('Delete section? Questions in this section will revert to General.')) {
      const updated = [...sections];
      updated.splice(index, 1);
      setSections(updated);
    }
  };

  // Drawer management
  const handleOpenCreate = () => {
    setEditData(undefined);
    setText('');
    setTextHindi('');
    setQuestionType('single-correct');
    setOptions(['', '', '', '']);
    setOptionsHindi(['', '', '', '']);
    setCorrectOptionIndex(0);
    setCorrectOptionIndices([]);
    setMarks(1);
    setNegativeMarks(0);
    setExplanation('');
    setImageUrl('');
    setDifficultyLevel('medium');
    setSelectedSection('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: any) => {
    setEditData(q);
    setText(q.text || '');
    setTextHindi(q.textHindi || '');
    setQuestionType(q.questionType || 'single-correct');
    setOptions(q.options?.length ? q.options : ['', '', '', '']);
    setOptionsHindi(q.optionsHindi?.length ? q.optionsHindi : ['', '', '', '']);
    setCorrectOptionIndex(q.correctOptionIndex || 0);
    setCorrectOptionIndices(q.correctOptionIndices || []);
    setMarks(q.marks || 1);
    setNegativeMarks(q.negativeMarks || 0);
    setExplanation(q.explanation || '');
    setImageUrl(q.imageUrl || '');
    setDifficultyLevel(q.difficultyLevel || 'medium');
    setSelectedSection(q.section || '');
    setIsModalOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsModalOpen(false);
    setEditData(undefined);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Question text is required.');
      return;
    }
    
    const payload = {
      text,
      textHindi,
      questionType,
      options: questionType === 'true-false' ? ['True', 'False'] : options,
      optionsHindi: questionType === 'true-false' ? ['सत्य', 'असत्य'] : optionsHindi,
      correctOptionIndex,
      correctOptionIndices,
      marks,
      negativeMarks,
      explanation,
      imageUrl,
      difficultyLevel,
      section: selectedSection
    };

    if (editData) {
      updateQuestionMutation.mutate({ ...payload, _id: editData._id });
    } else {
      createQuestionMutation.mutate(payload);
    }
  };

  // Change question's section directly from list
  const handleChangeQuestionSection = async (qId: string, sectionName: string) => {
    try {
      await api.patch(`/exams/questions/${qId}`, { section: sectionName });
      queryClient.invalidateQueries({ queryKey: ['examQuestions', examId] });
    } catch (err: any) {
      alert('Error updating question section: ' + err.message);
    }
  };

  // Change question's marks directly from list
  const handleChangeQuestionMarks = async (qId: string, marksVal: number) => {
    try {
      await api.patch(`/exams/questions/${qId}`, { marks: marksVal });
      queryClient.invalidateQueries({ queryKey: ['examQuestions', examId] });
      queryClient.invalidateQueries({ queryKey: ['exam', examId] });
    } catch (err: any) {
      alert('Error updating question marks: ' + err.message);
    }
  };

  const handleImportSelected = () => {
    if (selectedBankQuestions.length === 0) return;
    importMutation.mutate({
      questions: selectedBankQuestions,
      section: importSection
    });
  };

  const handleTriggerAutoGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoSubject) {
      alert('Please specify a Subject.');
      return;
    }
    autoGenerateMutation.mutate({
      subject: autoSubject,
      topic: autoTopic,
      difficultyLevel: autoDifficulty,
      count: autoCount,
      section: autoSection
    });
  };

  if (isExamLoading) {
    return (
      <div style={{ padding: 100, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Loader2 className="animate-spin" size={40} color={GOLD} />
        <span style={{ fontSize: 14, color: '#4B5563' }}>Loading Exam Details...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minHeight: '85vh', paddingBottom: 40 }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div className="jsc-page-header">
          <button onClick={() => navigate('/exams')} className="btn-outline" style={{ marginBottom: 12, padding: '6px 12px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: '#fff', border: '1px solid #D0D8E8', borderRadius: 4, fontWeight: 600 }}>
             <ArrowLeft size={14} /> Back to Exams
          </button>
          <h1 className="jsc-page-title" style={{ fontSize: 24, fontWeight: 800, color: NAVY }}>Exam Builder</h1>
          <p className="jsc-page-subtitle" style={{ fontSize: 14, color: '#4B5563', fontWeight: 500 }}>
            {exam?.title} | Total Questions: <span style={{ fontWeight: 700, color: GOLD }}>{questions.length}</span> | Marks: <span style={{ fontWeight: 700, color: GOLD }}>{exam?.totalMarks || 0}</span>
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', gap: 8 }}>
        <button
          onClick={() => setActiveTab('questions')}
          style={{
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'questions' ? `3px solid ${GOLD}` : '3px solid transparent',
            color: activeTab === 'questions' ? NAVY : '#6B7280',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Questions ({questions.length})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          style={{
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'add' ? `3px solid ${GOLD}` : '3px solid transparent',
            color: activeTab === 'add' ? NAVY : '#6B7280',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Add / Auto-Generate
        </button>
        <button
          onClick={() => setActiveTab('config')}
          style={{
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'config' ? `3px solid ${GOLD}` : '3px solid transparent',
            color: activeTab === 'config' ? NAVY : '#6B7280',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Pricing & Sections
        </button>
        <button
          onClick={() => setActiveTab('publish')}
          style={{
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'publish' ? `3px solid ${GOLD}` : '3px solid transparent',
            color: activeTab === 'publish' ? NAVY : '#6B7280',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Exam Settings & Rules
        </button>
      </div>

      {/* Tab 1: Pricing & Sections */}
      {activeTab === 'config' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Access Control & WhatsApp pricing */}
          <div className="jsc-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: 0 }}>Enrollment Access & Pricing</h3>
            
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Access Type:</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="accessType"
                    checked={accessType === 'free'}
                    onChange={() => setAccessType('free')}
                  />
                  Free (Instant access for all students)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="accessType"
                    checked={accessType === 'paid'}
                    onChange={() => setAccessType('paid')}
                  />
                  Paid (Requires WhatsApp enrollment/approval)
                </label>
              </div>
            </div>

            {accessType === 'paid' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Original Price (₹)</label>
                    <input
                      type="number"
                      value={pricing}
                      onChange={(e) => setPricing(parseInt(e.target.value) || 0)}
                      style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Discounted/Selling Price (₹)</label>
                    <input
                      type="number"
                      value={discountedPrice}
                      onChange={(e) => setDiscountedPrice(parseInt(e.target.value) || 0)}
                      style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>JSC WhatsApp Number (with country code)</label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="e.g. 919450614241"
                      style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Expiration Policy</label>
                    <select
                      value={expiryType}
                      onChange={(e: any) => setExpiryType(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #D2D6DC', fontSize: 13, background: '#fff' }}
                    >
                      <option value="lifetime">Lifetime Access</option>
                      <option value="duration">Days from Activation</option>
                      <option value="fixed">Fixed Date Expiry</option>
                    </select>
                  </div>
                </div>

                {expiryType === 'duration' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Validity Duration (in Days)</label>
                    <input
                      type="number"
                      value={accessDuration}
                      onChange={(e) => setAccessDuration(parseInt(e.target.value) || 30)}
                      style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13, width: '50%' }}
                    />
                  </div>
                )}

                {expiryType === 'fixed' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Fixed Expiry Date</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13, width: '50%' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>WhatsApp Prefilled Message template</label>
                  <textarea
                    rows={3}
                    value={whatsappEnrollmentMessage}
                    onChange={(e) => setWhatsappEnrollmentMessage(e.target.value)}
                    placeholder="Hi Judicial Study Centre, I want to enroll in the test series. My email is [email]..."
                    style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}
                  />
                  <span style={{ fontSize: 11.5, color: '#6B7280' }}>Tip: Use tags <strong>[email]</strong> and <strong>[phone]</strong> which will be dynamically replaced with the student's profile details.</span>
                </div>
              </div>
            )}

            <button onClick={handleSaveConfig} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: 6, width: 'fit-content', padding: '9px 18px', fontSize: 13, border: 'none', borderRadius: 6, cursor: 'pointer', background: GOLD, color: NAVY, fontWeight: 700 }}>
              <Save size={15} /> Save Access Config
            </button>
          </div>

          {/* Section Management */}
          <div className="jsc-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: 0 }}>Exam Sections</h3>
              <p style={{ fontSize: 12.5, color: '#6B7280', margin: '4px 0 0 0' }}>Structure your test into multiple sections (e.g. GK, Criminal Law, Constitution).</p>
            </div>

            {/* List existing sections */}
            {sections.length === 0 ? (
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: 6, fontSize: 13, color: '#6B7280', border: '1px dashed #E2E8F0' }}>
                No sections defined yet. Questions will all be placed in a single default "General" section.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: 6 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                      <th style={{ padding: 10, color: NAVY }}>Section Name</th>
                      <th style={{ padding: 10, color: NAVY }}>Description</th>
                      <th style={{ padding: 10, color: NAVY, textAlign: 'center' }}>Default Marks / Q</th>
                      <th style={{ padding: 10, color: NAVY, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((sec, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: 10, fontWeight: 600, color: NAVY }}>{sec.name}</td>
                        <td style={{ padding: 10, color: '#4B5563' }}>{sec.description || '-'}</td>
                        <td style={{ padding: 10, textAlign: 'center', fontWeight: 600 }}>{sec.marksPerQuestion || 1}</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>
                          <button onClick={() => handleRemoveSection(idx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Create Section Inline Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: '#F8FAFC', padding: 16, borderRadius: 6, border: '1px solid #E2E8F0' }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: NAVY, margin: 0 }}>Add New Section</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr', gap: 12 }}>
                <input
                  type="text"
                  placeholder="Section Name (e.g. Civil Procedure)"
                  value={newSecName}
                  onChange={(e) => setNewSecName(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                />
                <input
                  type="text"
                  placeholder="Description (Optional)"
                  value={newSecDesc}
                  onChange={(e) => setNewSecDesc(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                />
                <input
                  type="number"
                  placeholder="Marks/Q"
                  value={newSecMarks}
                  onChange={(e) => setNewSecMarks(parseFloat(e.target.value) || 1)}
                  style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                />
              </div>
              <button
                onClick={handleAddSection}
                style={{ width: 'fit-content', background: NAVY, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
              >
                + Add Section
              </button>
            </div>

            <button onClick={handleSaveConfig} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: 6, width: 'fit-content', padding: '9px 18px', fontSize: 13, border: 'none', borderRadius: 6, cursor: 'pointer', background: GOLD, color: NAVY, fontWeight: 700 }}>
              <Save size={15} /> Save Sections Array
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Questions List */}
      {activeTab === 'questions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button onClick={handleOpenCreate} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 13, background: GOLD, color: NAVY, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>
              <Plus size={15} /> Add Question Manually
            </button>
          </div>

          {isQuestionsLoading ? (
            <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" size={32} color={GOLD} /></div>
          ) : questions.length === 0 ? (
            <div className="jsc-card" style={{ padding: 48, textAlign: 'center' }}>
              <HelpCircle size={40} color="#9CA3AF" style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '0 0 6px 0' }}>No questions added to this exam yet</h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 20px 0' }}>Use the Add/Auto-Generate tab to import or create questions.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {questions.map((q, idx: number) => (
                <div key={q._id} className="jsc-card" style={{ padding: 18, background: '#fff', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    
                    {/* Left: Metadata badges & title */}
                    <div style={{ flex: 1, minWidth: 280 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, background: '#F3F4F6', color: NAVY, padding: '2px 8px', borderRadius: 4 }}>Q{idx + 1}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4, background: q.difficultyLevel === 'easy' ? '#D1FAE5' : q.difficultyLevel === 'hard' ? '#FEE2E2' : '#FEF3C7', color: q.difficultyLevel === 'easy' ? '#065F46' : q.difficultyLevel === 'hard' ? '#991B1B' : '#92400E' }}>
                          {q.difficultyLevel || 'medium'}
                        </span>
                        <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4, background: '#E0F2FE', color: '#0369A1' }}>
                          {q.questionType?.replace('-', ' ') || 'single correct'}
                        </span>
                        
                        {/* Section Selection Dropdown */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>Section:</span>
                          <select
                            value={q.section || ''}
                            onChange={(e) => handleChangeQuestionSection(q._id, e.target.value)}
                            style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid #D2D6DC', fontSize: 11, background: '#fff', outline: 'none' }}
                          >
                            <option value="">General (No Section)</option>
                            {sections.map(s => (
                              <option key={s.name} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* English & Hindi texts */}
                      <h4 style={{ fontSize: 14.5, fontWeight: 600, color: NAVY, margin: '0 0 6px 0', lineHeight: 1.4 }}>{q.text}</h4>
                      {q.textHindi && (
                        <p style={{ fontSize: 13.5, color: '#4B5563', margin: '0 0 10px 0', fontStyle: 'italic', lineHeight: 1.4 }}>{q.textHindi}</p>
                      )}
                    </div>

                    {/* Right: Actions, marks input, ordering */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      
                      {/* Marks Input field */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>Marks:</span>
                        <input
                          type="number"
                          value={q.marks || 1}
                          onChange={(e) => handleChangeQuestionMarks(q._id, parseFloat(e.target.value) || 0)}
                          style={{ width: 50, padding: '4px 6px', border: '1px solid #D2D6DC', borderRadius: 4, fontSize: 12, textAlign: 'center' }}
                        />
                      </div>

                      {/* Position Reordering arrows */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <button 
                          onClick={() => handleMoveQuestion(idx, 'up')} 
                          disabled={idx === 0}
                          style={{ border: 'none', background: '#F3F4F6', padding: 3, borderRadius: 4, cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? '#9CA3AF' : NAVY }}
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button 
                          onClick={() => handleMoveQuestion(idx, 'down')} 
                          disabled={idx === questions.length - 1}
                          style={{ border: 'none', background: '#F3F4F6', padding: 3, borderRadius: 4, cursor: idx === questions.length - 1 ? 'not-allowed' : 'pointer', color: idx === questions.length - 1 ? '#9CA3AF' : NAVY }}
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>

                      {/* Edit / Delete actions */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleOpenEdit(q)} className="jsc-action-btn edit" style={{ padding: 6, background: '#F3F4F6', color: NAVY, border: 'none', borderRadius: 4, cursor: 'pointer' }}><Edit2 size={13} /></button>
                        <button onClick={() => { if(window.confirm('Remove question from exam?')) deleteQuestionMutation.mutate(q._id) }} className="jsc-action-btn delete" style={{ padding: 6, background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: 4, cursor: 'pointer' }}><Trash2 size={13} /></button>
                      </div>
                    </div>

                  </div>

                  {/* Options List */}
                  {q.questionType !== 'match-following' && q.options && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', background: '#F9FAFB', padding: 12, borderRadius: 8, fontSize: 12.5 }}>
                      {q.options.map((opt: string, optIdx: number) => {
                        const isCorrect = q.questionType === 'multiple-correct' 
                          ? q.correctOptionIndices?.includes(optIdx)
                          : q.correctOptionIndex === optIdx;

                        return (
                          <div key={optIdx} style={{ display: 'flex', gap: 4, color: isCorrect ? '#065F46' : NAVY, fontWeight: isCorrect ? 700 : 400 }}>
                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                            {isCorrect && <span style={{ color: '#10B981', fontSize: 11 }}>(Correct)</span>}
                            {q.optionsHindi?.[optIdx] && (
                              <span style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: 11.5 }}>({q.optionsHindi[optIdx]})</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Add / Auto-Generate */}
      {activeTab === 'add' && (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* Sub-card 1: Manual Picker from Bank */}
          <div className="jsc-card" style={{ flex: 1, minWidth: 320, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: 0 }}>Import from Question Bank</h3>
              <p style={{ fontSize: 12.5, color: '#6B7280', margin: '4px 0 0 0' }}>Search and select questions from the master database.</p>
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input 
                type="text" 
                placeholder="Search master bank by question text, subject..." 
                value={importSearchTerm} 
                onChange={(e) => setImportSearchTerm(e.target.value)} 
                style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13, outline: 'none' }} 
              />
            </div>

            {/* Set Section target for imported questions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <span style={{ fontWeight: 600, color: NAVY }}>Import into Section:</span>
              <select
                value={importSection}
                onChange={(e) => setImportSection(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #D2D6DC', fontSize: 13, background: '#fff' }}
              >
                <option value="">General (No Section)</option>
                {sections.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Bank table listing */}
            <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #EEF1F8', borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                    <th style={{ width: 40, padding: 8, textAlign: 'center' }}>
                      <input 
                        type="checkbox"
                        checked={filteredQuestionBank.length > 0 && selectedBankQuestions.length === filteredQuestionBank.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedBankQuestions([...filteredQuestionBank]);
                          else setSelectedBankQuestions([]);
                        }}
                      />
                    </th>
                    <th style={{ padding: 8, color: NAVY }}>Question text</th>
                    <th style={{ padding: 8, color: NAVY }}>Subject</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestionBank.map((q) => (
                    <tr key={q._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: 8, textAlign: 'center' }}>
                        <input 
                          type="checkbox"
                          checked={selectedBankQuestions.some(sq => sq._id === q._id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedBankQuestions([...selectedBankQuestions, q]);
                            else setSelectedBankQuestions(selectedBankQuestions.filter(sq => sq._id !== q._id));
                          }}
                        />
                      </td>
                      <td style={{ padding: 8, fontWeight: 500, color: NAVY }}>
                        <div style={{ maxHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.text}</div>
                      </td>
                      <td style={{ padding: 8 }}>
                        <span style={{ fontSize: 11, background: '#EEF2FF', color: '#4F46E5', padding: '2px 6px', borderRadius: 4 }}>{q.subject}</span>
                      </td>
                    </tr>
                  ))}
                  {filteredQuestionBank.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#9CA3AF' }}>No questions found in bank matching search</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12.5, color: '#6B7280', fontWeight: 600 }}>{selectedBankQuestions.length} questions selected</span>
              <button
                type="button"
                onClick={handleImportSelected}
                disabled={selectedBankQuestions.length === 0 || importMutation.isPending}
                className="btn-gold"
                style={{ padding: '8px 16px', background: GOLD, color: NAVY, border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: selectedBankQuestions.length === 0 ? 'not-allowed' : 'pointer', opacity: selectedBankQuestions.length === 0 ? 0.6 : 1 }}
              >
                {importMutation.isPending ? 'Importing...' : 'Import Selected'}
              </button>
            </div>
          </div>

          {/* Sub-card 2: Random Auto-Generation */}
          <div className="jsc-card" style={{ width: 340, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: 0 }}>Auto-Generate Randomly</h3>
              <p style={{ fontSize: 12.5, color: '#6B7280', margin: '4px 0 0 0' }}>Pull matching questions randomly using database aggregation.</p>
            </div>

            <form onSubmit={handleTriggerAutoGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: NAVY }}>Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Criminal Law"
                  value={autoSubject}
                  onChange={(e) => setAutoSubject(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: NAVY }}>Topic (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. IPC"
                  value={autoTopic}
                  onChange={(e) => setAutoTopic(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: NAVY }}>Difficulty Level</label>
                <select
                  value={autoDifficulty}
                  onChange={(e) => setAutoDifficulty(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #D2D6DC', fontSize: 13, background: '#fff' }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: NAVY }}>Number of Questions</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={autoCount}
                  onChange={(e) => setAutoCount(parseInt(e.target.value) || 10)}
                  style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: NAVY }}>Assign to Section</label>
                <select
                  value={autoSection}
                  onChange={(e) => setAutoSection(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #D2D6DC', fontSize: 13, background: '#fff' }}
                >
                  <option value="">General (No Section)</option>
                  {sections.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={autoGenerateMutation.isPending}
                className="btn-gold"
                style={{ padding: '9px 18px', background: GOLD, color: NAVY, border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}
              >
                {autoGenerateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                Generate Questions
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Exam Settings & Rules */}
      {activeTab === 'publish' && (
        <div className="jsc-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: 0 }}>Exam Rules & Configuration</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Duration (Minutes) *</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Passing Marks *</label>
              <input
                type="number"
                value={passingMarks}
                onChange={(e) => setPassingMarks(parseInt(e.target.value) || 0)}
                style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Negative Marks (Penality per wrong answer)</label>
              <input
                type="number"
                step="0.1"
                value={negativeMarking}
                onChange={(e) => setNegativeMarking(parseFloat(e.target.value) || 0)}
                style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Attempts Allowed per Student (0 for unlimited)</label>
              <input
                type="number"
                value={attemptsAllowed}
                onChange={(e) => setAttemptsAllowed(parseInt(e.target.value) || 0)}
                style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
              />
            </div>
          </div>

          {/* Shuffling rules */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: NAVY, margin: 0 }}>Randomization Shuffling</h4>
            <div style={{ display: 'flex', gap: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                />
                Shuffle Question Delivery Order
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                />
                Shuffle Options A/B/C/D Order
              </label>
            </div>
          </div>

          {/* Active status */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: NAVY, margin: 0 }}>Exam Publication Status</h4>
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="isActive"
                  checked={isActive === true}
                  onChange={() => setIsActive(true)}
                />
                Published (Visible to students)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="isActive"
                  checked={isActive === false}
                  onChange={() => setIsActive(false)}
                />
                Draft (Hidden from students)
              </label>
            </div>
          </div>

          <button onClick={handleSavePublish} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: 6, width: 'fit-content', padding: '9px 18px', fontSize: 13, border: 'none', borderRadius: 6, cursor: 'pointer', background: GOLD, color: NAVY, fontWeight: 700 }}>
            <Save size={15} /> Save Exam Rules
          </button>
        </div>
      )}

      {/* AppDrawer overlay for Manual Question Creation/Editing */}
      <AppDrawer
        isOpen={isModalOpen}
        onClose={handleCloseDrawer}
        title={editData ? 'Edit Question' : 'Add Question'}
        subtitle="Specify bilingual contents and options for this question."
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={handleCloseDrawer} style={{ padding: '9px 18px', border: '1px solid #D0D8E8', background: '#fff', color: NAVY, cursor: 'pointer', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>Cancel</button>
            <button type="submit" form="jsc-question-form" disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending} className="btn-gold" style={{ padding: '9px 20px', background: GOLD, color: NAVY, border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              {(createQuestionMutation.isPending || updateQuestionMutation.isPending) && <Loader2 size={14} className="animate-spin" />}
              Save Question
            </button>
          </div>
        }
        maxWidth={680}
      >
        <form id="jsc-question-form" onSubmit={handleSaveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Section Selector in Drawer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label className="jsc-form-label">Assign to Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="jsc-input"
              style={{ background: '#fff' }}
            >
              <option value="">General (No Section)</option>
              {sections.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Question Text English */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label className="jsc-form-label">Question Text (English) *</label>
            <textarea
              required
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="jsc-textarea"
              placeholder="Type question here..."
            />
          </div>

          {/* Question Text Hindi */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label className="jsc-form-label">Question Text (Hindi translation)</label>
            <textarea
              rows={3}
              value={textHindi}
              onChange={(e) => setTextHindi(e.target.value)}
              className="jsc-textarea"
              placeholder="हिंदी अनुवाद यहाँ लिखें..."
            />
          </div>

          {/* Question Type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label className="jsc-form-label">Question Type</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="jsc-input"
              style={{ background: '#fff' }}
            >
              <option value="single-correct">Single Correct MCQ</option>
              {questionType && questionType !== 'single-correct' && (
                <option value={questionType}>
                  {questionType === 'multiple-correct' && 'Multiple Correct MCQ'}
                  {questionType === 'true-false' && 'True / False'}
                </option>
              )}
            </select>
          </div>

          {/* Options builder for Drawer */}
          {questionType !== 'true-false' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="jsc-form-label">Options & Bilingual Keys</span>
              
              {options.map((opt, idx) => {
                const isCorrect = questionType === 'multiple-correct'
                  ? correctOptionIndices.includes(idx)
                  : correctOptionIndex === idx;

                return (
                  <div key={idx} style={{ padding: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {questionType === 'multiple-correct' ? (
                        <input
                          type="checkbox"
                          checked={isCorrect}
                          onChange={(e) => {
                            let curr = [...correctOptionIndices];
                            if (e.target.checked) curr.push(idx);
                            else curr = curr.filter(c => c !== idx);
                            setCorrectOptionIndices(curr);
                          }}
                        />
                      ) : (
                        <input
                          type="radio"
                          name="drawerCorrectRadio"
                          checked={isCorrect}
                          onChange={() => setCorrectOptionIndex(idx)}
                        />
                      )}
                      <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{String.fromCharCode(65 + idx)}</span>
                      
                      <input
                        type="text"
                        required
                        placeholder={`Option ${idx + 1} (English)`}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[idx] = e.target.value;
                          setOptions(newOpts);
                        }}
                        className="jsc-input"
                        style={{ flex: 1 }}
                      />
                    </div>
                    <div style={{ paddingLeft: 28 }}>
                      <input
                        type="text"
                        placeholder={`विकल्प ${idx + 1} (Hindi)`}
                        value={optionsHindi[idx] || ''}
                        onChange={(e) => {
                          const newOptsH = [...optionsHindi];
                          newOptsH[idx] = e.target.value;
                          setOptionsHindi(newOptsH);
                        }}
                        className="jsc-input"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* True / False correct answer selector */}
          {questionType === 'true-false' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="jsc-form-label">Correct Option</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="tfCorrect"
                    checked={correctOptionIndex === 0}
                    onChange={() => setCorrectOptionIndex(0)}
                  />
                  True (सत्य)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="tfCorrect"
                    checked={correctOptionIndex === 1}
                    onChange={() => setCorrectOptionIndex(1)}
                  />
                  False (असत्य)
                </label>
              </div>
            </div>
          )}

          {/* Marks & Difficulty */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label className="jsc-form-label">Marks *</label>
              <input
                type="number"
                required
                value={marks}
                onChange={(e) => setMarks(parseFloat(e.target.value) || 1)}
                className="jsc-input"
              />
            </div>
            <div>
              <label className="jsc-form-label">Negative Marks</label>
              <input
                type="number"
                step="0.1"
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0)}
                className="jsc-input"
              />
            </div>
            <div>
              <label className="jsc-form-label">Difficulty Level</label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="jsc-input"
                style={{ background: '#fff' }}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Image & Explanations */}
          <div>
            <label className="jsc-form-label">Question Image URL (Optional)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="jsc-input"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="jsc-form-label">Solution Explanation (Optional)</label>
            <textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="jsc-textarea"
              placeholder="Explain the section reference and logic..."
            />
          </div>

        </form>
      </AppDrawer>

    </div>
  );
};

export default ExamQuestions;
