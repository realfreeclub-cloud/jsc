import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Upload, Search, Loader2, Trash2, Plus, Edit2, X, Filter, 
  AlertTriangle, CheckCircle, Info, Download, RefreshCw 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../utils/api';

const NAVY = '#07152F';
const GOLD = '#F4B400';

export interface QuestionBankItem {
  _id?: string;
  subject: string;
  topic?: string;
  chapter?: string;
  text: string;
  textHindi?: string;
  options: string[];
  optionsHindi?: string[];
  correctOptionIndex: number;
  correctOptionIndices?: number[];
  marks: number;
  negativeMarks?: number;
  explanation?: string;
  explanationImage?: string;
  explanationVideoUrl?: string;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  questionType?: 'single-correct' | 'multiple-correct' | 'true-false' | 'match-following' | 'assertion-reason' | 'paragraph';
  estimatedSolveTime?: number;
  status?: 'active' | 'draft';
  tags?: string[];
  faculty?: string;
  paragraphText?: string;
  matchPairs?: { left: string; right: string }[];
  assertion?: string;
  reason?: string;
}

const DEFAULT_FORM_STATE: QuestionBankItem = {
  subject: '',
  topic: '',
  chapter: '',
  text: '',
  textHindi: '',
  options: ['', '', '', ''],
  optionsHindi: ['', '', '', ''],
  correctOptionIndex: 0,
  correctOptionIndices: [],
  marks: 1,
  negativeMarks: 0,
  explanation: '',
  explanationImage: '',
  explanationVideoUrl: '',
  difficultyLevel: 'medium',
  imageUrl: '',
  questionType: 'single-correct',
  estimatedSolveTime: 60,
  status: 'active',
  tags: [],
  faculty: '',
  paragraphText: '',
  matchPairs: [{ left: '', right: '' }],
  assertion: '',
  reason: ''
};

interface ExcelValidationWarning {
  row: number;
  questionText: string;
  type: 'error' | 'warning';
  message: string;
}

const QuestionBank = () => {
  const queryClient = useQueryClient();
  
  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // UI state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<QuestionBankItem>(DEFAULT_FORM_STATE);
  const [tagInput, setTagInput] = useState('');
  
  // Bulk upload preview state
  const [uploadPreview, setUploadPreview] = useState<QuestionBankItem[] | null>(null);
  const [validationReport, setValidationReport] = useState<ExcelValidationWarning[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debouncing search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Questions
  const { data: qbData, isLoading } = useQuery({
    queryKey: ['questionBank'],
    queryFn: () => api.get('/question-bank').then(res => res.data),
  });

  const questions = (qbData?.data?.questions || []) as QuestionBankItem[];

  // Get unique subjects for filter
  const uniqueSubjects = Array.from(new Set(questions.map(q => q.subject))).filter(Boolean);

  // Filter questions list
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = 
      q.text?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
      q.textHindi?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
      q.subject?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      q.topic?.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesSubject = !selectedSubject || q.subject === selectedSubject;
    const matchesDifficulty = !selectedDifficulty || q.difficultyLevel === selectedDifficulty;
    const matchesType = !selectedType || q.questionType === selectedType;

    return matchesSearch && matchesSubject && matchesDifficulty && matchesType;
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newQ: QuestionBankItem) => api.post('/question-bank', newQ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionBank'] });
      setDrawerOpen(false);
      alert('Question created successfully!');
    },
    onError: (err: any) => {
      alert(`Error creating question: ${err.response?.data?.message || err.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updatedQ }: { id: string; updatedQ: QuestionBankItem }) => 
      api.patch(`/question-bank/${id}`, updatedQ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionBank'] });
      setDrawerOpen(false);
      alert('Question updated successfully!');
    },
    onError: (err: any) => {
      alert(`Error updating question: ${err.response?.data?.message || err.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/question-bank/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionBank'] });
    },
    onError: (err: any) => {
      alert(`Error deleting question: ${err.response?.data?.message || err.message}`);
    }
  });

  const bulkCreateMutation = useMutation({
    mutationFn: (newQuestions: QuestionBankItem[]) => api.post('/question-bank/bulk', { questions: newQuestions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionBank'] });
      setUploadPreview(null);
      setValidationReport([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      alert('Questions imported successfully!');
    },
    onError: (err: any) => {
      alert(`Error importing questions: ${err.response?.data?.message || err.message}`);
    }
  });

  // Actions
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({ ...DEFAULT_FORM_STATE });
    setTagInput('');
    setDrawerOpen(true);
  };

  const handleOpenEdit = (q: QuestionBankItem) => {
    setIsEditing(true);
    setFormData({
      ...DEFAULT_FORM_STATE,
      ...q,
      options: q.options || ['', '', '', ''],
      optionsHindi: q.optionsHindi || ['', '', '', ''],
      matchPairs: q.matchPairs || [{ left: '', right: '' }]
    });
    setTagInput((q.tags || []).join(', '));
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this question from the master Question Bank?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.text) {
      alert('Please fill out all required fields.');
      return;
    }

    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    const updatedQ = { ...formData, tags };

    if (isEditing && formData._id) {
      updateMutation.mutate({ id: formData._id, updatedQ });
    } else {
      createMutation.mutate(updatedQ);
    }
  };

  // Dynamic Option Fields Actions
  const handleOptionChange = (index: number, val: string, isHindi = false) => {
    if (isHindi) {
      const updated = [...(formData.optionsHindi || [])];
      updated[index] = val;
      setFormData({ ...formData, optionsHindi: updated });
    } else {
      const updated = [...(formData.options || [])];
      updated[index] = val;
      setFormData({ ...formData, options: updated });
    }
  };

  const handleAddOptionField = () => {
    setFormData({
      ...formData,
      options: [...(formData.options || []), ''],
      optionsHindi: [...(formData.optionsHindi || []), '']
    });
  };

  const handleRemoveOptionField = (index: number) => {
    if ((formData.options || []).length <= 2) {
      alert('A question must have at least 2 options.');
      return;
    }
    const opts = [...(formData.options || [])];
    const optsH = [...(formData.optionsHindi || [])];
    opts.splice(index, 1);
    optsH.splice(index, 1);
    
    // adjust correct indices
    let idx = formData.correctOptionIndex;
    if (idx >= opts.length) idx = 0;

    let idxs = formData.correctOptionIndices || [];
    idxs = idxs.filter(i => i !== index).map(i => (i > index ? i - 1 : i));

    setFormData({
      ...formData,
      options: opts,
      optionsHindi: optsH,
      correctOptionIndex: idx,
      correctOptionIndices: idxs
    });
  };

  // Match Following Pairs Actions
  const handlePairChange = (index: number, field: 'left' | 'right', val: string) => {
    const updated = [...(formData.matchPairs || [{ left: '', right: '' }])];
    updated[index] = { ...updated[index], [field]: val };
    setFormData({ ...formData, matchPairs: updated });
  };

  const handleAddPair = () => {
    setFormData({
      ...formData,
      matchPairs: [...(formData.matchPairs || []), { left: '', right: '' }]
    });
  };

  const handleRemovePair = (index: number) => {
    if ((formData.matchPairs || []).length <= 1) return;
    const updated = [...(formData.matchPairs || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, matchPairs: updated });
  };

  // Excel Bulk File Upload Parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as Record<string, string | number>[];

        const reports: ExcelValidationWarning[] = [];
        const parsed: QuestionBankItem[] = [];

        data.forEach((row, i) => {
          const rowNum = i + 2; // spreadsheet index
          const qText = (row['Question'] as string) || '';
          
          if (!qText) {
            reports.push({
              row: rowNum,
              questionText: `Row ${rowNum}`,
              type: 'error',
              message: 'Question text is empty.'
            });
            return;
          }

          const qType = ((row['Question Type'] as string) || 'single-correct').toLowerCase().trim() as any;
          const subject = (row['Subject'] as string) || 'General';

          let options: string[] = [];
          let optionsHindi: string[] = [];

          if (qType === 'true-false') {
            options = ['True', 'False'];
            optionsHindi = ['सत्य', 'असत्य'];
          } else {
            options = [
              row['Option 1'],
              row['Option 2'],
              row['Option 3'],
              row['Option 4'],
              row['Option 5']
            ].filter(Boolean).map(String);

            optionsHindi = [
              row['Option 1 Hindi'],
              row['Option 2 Hindi'],
              row['Option 3 Hindi'],
              row['Option 4 Hindi'],
              row['Option 5 Hindi']
            ].filter(Boolean).map(String);
          }

          if (options.length < 2) {
            reports.push({
              row: rowNum,
              questionText: qText,
              type: 'error',
              message: 'At least 2 options are required.'
            });
            return;
          }

          let correctOptionIndex = 0;
          let correctOptionIndices: number[] = [];

          if (qType === 'multiple-correct') {
            const indicesStr = String(row['Correct Option Indices (comma separated for multi)'] || '');
            correctOptionIndices = indicesStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
            if (correctOptionIndices.length === 0) {
              reports.push({
                row: rowNum,
                questionText: qText,
                type: 'error',
                message: 'Multiple correct question requires "Correct Option Indices" (e.g. 0,2).'
              });
              return;
            }
          } else {
            correctOptionIndex = parseInt(String(row['Correct Option (1-4)'] || '1')) - 1;
            if (isNaN(correctOptionIndex) || correctOptionIndex < 0 || correctOptionIndex >= options.length) {
              reports.push({
                row: rowNum,
                questionText: qText,
                type: 'warning',
                message: `Correct option index "${correctOptionIndex + 1}" out of bounds. Defaulting to 1st option.`
              });
              correctOptionIndex = 0;
            }
          }

          // Warnings checks
          if (!row['Question Hindi']) {
            reports.push({
              row: rowNum,
              questionText: qText,
              type: 'warning',
              message: 'Missing Hindi question text translation.'
            });
          }

          if (optionsHindi.length < options.length && qType !== 'true-false') {
            reports.push({
              row: rowNum,
              questionText: qText,
              type: 'warning',
              message: 'Fewer Hindi options provided than English options.'
            });
          }

          parsed.push({
            subject,
            topic: (row['Topic'] as string) || '',
            chapter: (row['Chapter'] as string) || '',
            text: qText,
            textHindi: (row['Question Hindi'] as string) || '',
            options,
            optionsHindi,
            correctOptionIndex,
            correctOptionIndices,
            marks: parseFloat(String(row['Marks'])) || 1,
            negativeMarks: parseFloat(String(row['Negative Marks'])) || 0,
            explanation: (row['Explanation'] as string) || '',
            difficultyLevel: ((row['Difficulty'] as string) || 'medium').toLowerCase() as any,
            imageUrl: (row['Image URL'] as string) || '',
            questionType: qType
          });
        });

        setUploadPreview(parsed);
        setValidationReport(reports);
        setIsUploading(false);
      } catch (err: any) {
        alert(`Error parsing Excel: ${err.message}`);
        setIsUploading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Subject": "Criminal Law",
        "Topic": "IPC",
        "Chapter": "General Exceptions",
        "Question": "Which section of IPC covers insanity?",
        "Question Hindi": "IPC की कौन सी धारा पागलपन को कवर करती है?",
        "Question Type": "single-correct", // single-correct, multiple-correct, true-false, match-following, assertion-reason, paragraph
        "Option 1": "Section 82",
        "Option 1 Hindi": "धारा 82",
        "Option 2": "Section 84",
        "Option 2 Hindi": "धारा 84",
        "Option 3": "Section 86",
        "Option 3 Hindi": "धारा 86",
        "Option 4": "Section 90",
        "Option 4 Hindi": "धारा 90",
        "Correct Option (1-4)": 2,
        "Correct Option Indices (comma separated for multi)": "",
        "Marks": 1.0,
        "Negative Marks": 0.25,
        "Difficulty": "medium", // easy, medium, hard
        "Explanation": "Section 84 IPC deals with acts of a person of unsound mind.",
        "Image URL": ""
      },
      {
        "Subject": "Constitutional Law",
        "Topic": "Fundamental Rights",
        "Chapter": "Article 19",
        "Question": "Which of the following are fundamental freedoms?",
        "Question Hindi": "निम्नलिखित में से कौन सी मौलिक स्वतंत्रताएं हैं?",
        "Question Type": "multiple-correct",
        "Option 1": "Speech and Expression",
        "Option 1 Hindi": "भाषण और अभिव्यक्ति",
        "Option 2": "Peaceful Assembly",
        "Option 2 Hindi": "शांतिपूर्ण सभा",
        "Option 3": "Form Associations",
        "Option 3 Hindi": "संघ बनाना",
        "Option 4": "Acquire property anywhere",
        "Option 4 Hindi": "कहीं भी संपत्ति अर्जित करना",
        "Correct Option (1-4)": "",
        "Correct Option Indices (comma separated for multi)": "0,1,2", // 0-based indices
        "Marks": 2.0,
        "Negative Marks": 0.5,
        "Difficulty": "hard",
        "Explanation": "Article 19 guarantees speech, assembly, association, movement, residence, and profession.",
        "Image URL": ""
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "JSC_QB_Template");
    XLSX.writeFile(wb, "JSC_Question_Bank_Template.xlsx");
  };

  const hasValidationErrors = validationReport.some(r => r.type === 'error');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minHeight: '85vh', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div className="jsc-page-header">
          <h1 className="jsc-page-title" style={{ fontSize: 24, fontWeight: 800, color: NAVY }}>Master Question Bank</h1>
          <p className="jsc-page-subtitle" style={{ fontSize: 14, color: 'var(--color-navy-400)' }}>Create, manage, and bulk import questions for exams & test series.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleDownloadTemplate} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: 13, borderColor: '#D0D8E8', background: '#fff', color: NAVY, borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
            <Download size={15} /> Download Template
          </button>
          
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: 13, borderColor: '#D0D8E8', background: '#fff', color: NAVY, borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
          >
            {isUploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} 
            Bulk Import Excel
          </button>

          <button onClick={handleOpenCreate} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 13, background: GOLD, color: NAVY, border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={15} /> Create Question
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Left Filters Sidebar */}
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0' }}>
          <div style={{ fontWeight: 700, color: NAVY, borderBottom: '1px solid #E2E8F0', paddingBottom: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <Filter size={16} /> Filters
          </div>

          {/* Subject Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: NAVY }}>Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #D2D6DC', fontSize: 13, outline: 'none', background: '#fff', width: '100%' }}
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: NAVY }}>Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #D2D6DC', fontSize: 13, outline: 'none', background: '#fff', width: '100%' }}
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Type Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: NAVY }}>Question Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #D2D6DC', fontSize: 13, outline: 'none', background: '#fff', width: '100%' }}
            >
              <option value="">All Types</option>
              <option value="single-correct">Single Correct MCQ</option>
              <option value="multiple-correct">Multiple Correct MCQ</option>
              <option value="true-false">True / False</option>
              <option value="match-following">Match the Following</option>
              <option value="assertion-reason">Assertion / Reason</option>
              <option value="paragraph">Paragraph Comprehension</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(selectedSubject || selectedDifficulty || selectedType) && (
            <button
              onClick={() => {
                setSelectedSubject('');
                setSelectedDifficulty('');
                setSelectedType('');
              }}
              style={{ border: '1px solid #D0D8E8', background: '#fff', color: NAVY, padding: '8px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <RefreshCw size={12} /> Clear Filters
            </button>
          )}
        </div>

        {/* Right Table Container */}
        <div style={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Excel Bulk Upload Preview Section */}
          {uploadPreview && (
            <div style={{ background: '#fff', border: `1px solid ${hasValidationErrors ? '#EF4444' : GOLD}`, borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {hasValidationErrors ? <AlertTriangle color="#EF4444" size={20} /> : <CheckCircle color="#10B981" size={20} />}
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Excel Bulk Upload Preview</h3>
                </div>
                <button onClick={() => setUploadPreview(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={18} /></button>
              </div>

              {/* Validation Metrics */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ background: '#F3F4F6', padding: '10px 16px', borderRadius: 6, flex: 1, minWidth: 120 }}>
                  <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>Total Rows</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: NAVY, margin: 0 }}>{uploadPreview.length}</p>
                </div>
                <div style={{ background: '#FEF2F2', padding: '10px 16px', borderRadius: 6, flex: 1, minWidth: 120, border: validationReport.some(r => r.type === 'error') ? '1px solid #FCA5A5' : 'none' }}>
                  <p style={{ fontSize: 11, color: '#EF4444', margin: 0 }}>Errors (Must Fix)</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: '#EF4444', margin: 0 }}>{validationReport.filter(r => r.type === 'error').length}</p>
                </div>
                <div style={{ background: '#FFFBEB', padding: '10px 16px', borderRadius: 6, flex: 1, minWidth: 120 }}>
                  <p style={{ fontSize: 11, color: '#D97706', margin: 0 }}>Warnings</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: '#D97706', margin: 0 }}>{validationReport.filter(r => r.type === 'warning').length}</p>
                </div>
              </div>

              {/* Validation Warning/Error details */}
              {validationReport.length > 0 && (
                <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: 6, padding: 12, background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {validationReport.map((w, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, fontSize: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, color: w.type === 'error' ? '#EF4444' : '#D97706', minWidth: 60 }}>
                        [Row {w.row}]
                      </span>
                      <span style={{ color: '#4B5563', flex: 1 }}>{w.message}</span>
                      <span style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: 11 }}>"{w.questionText.slice(0, 30)}..."</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  onClick={() => setUploadPreview(null)}
                  style={{ padding: '8px 16px', border: '1px solid #D1D5DB', borderRadius: 6, background: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => bulkCreateMutation.mutate(uploadPreview)}
                  disabled={hasValidationErrors}
                  className="btn-gold"
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: 6, 
                    fontSize: 13, 
                    fontWeight: 700, 
                    cursor: hasValidationErrors ? 'not-allowed' : 'pointer', 
                    background: hasValidationErrors ? '#E5E7EB' : GOLD,
                    color: hasValidationErrors ? '#9CA3AF' : NAVY,
                    border: 'none'
                  }}
                >
                  Save {uploadPreview.length} Questions
                </button>
              </div>
            </div>
          )}

          {/* Search bar card */}
          <div className="jsc-card" style={{ display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 450 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder="Search by question text, subject or topic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="jsc-search-bar"
                  style={{ width: '100%', paddingLeft: 38, paddingRight: 12, height: 38, border: '1px solid #D2D6DC', borderRadius: 6, outline: 'none', fontSize: 13 }}
                />
              </div>
            </div>

            {/* Questions Table */}
            {isLoading ? (
              <div style={{ padding: '80px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 12 }}>
                <Loader2 className="animate-spin" size={32} color={GOLD} />
                <span style={{ fontSize: 13, color: '#6B7280' }}>Loading questions database...</span>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="jsc-empty-state" style={{ padding: '80px 24px', textAlign: 'center' }}>
                <Info size={40} color="#9CA3AF" style={{ marginBottom: 12 }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '0 0 6px 0' }}>No questions found</h3>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Try clearing search/filters or upload/create a question.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="jsc-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 12, fontWeight: 700, color: NAVY }}>Type</th>
                      <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 12, fontWeight: 700, color: NAVY, minWidth: 320 }}>Question Details</th>
                      <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 12, fontWeight: 700, color: NAVY }}>Subject / Chapter</th>
                      <th style={{ textAlign: 'center', padding: '12px 20px', fontSize: 12, fontWeight: 700, color: NAVY }}>Marks</th>
                      <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: 12, fontWeight: 700, color: NAVY }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map((q: QuestionBankItem) => (
                      <tr key={q._id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.2s' }} className="hover:bg-slate-50">
                        <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                          <span style={{ 
                            fontSize: 10.5, 
                            fontWeight: 700, 
                            textTransform: 'uppercase', 
                            padding: '3px 8px', 
                            borderRadius: 4, 
                            background: q.questionType === 'multiple-correct' ? '#FEE2E2' : q.questionType === 'true-false' ? '#FEF3C7' : '#E0F2FE',
                            color: q.questionType === 'multiple-correct' ? '#EF4444' : q.questionType === 'true-false' ? '#D97706' : '#0284C7'
                          }}>
                            {q.questionType?.replace('-', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                          <div>
                            {/* Eng Text */}
                            <p style={{ fontWeight: 600, color: NAVY, fontSize: 13.5, margin: '0 0 6px 0', lineHeight: 1.4 }}>{q.text}</p>
                            {/* Hindi Text */}
                            {q.textHindi && (
                              <p style={{ fontWeight: 400, color: '#4B5563', fontSize: 13, margin: '0 0 8px 0', lineHeight: 1.4, fontStyle: 'italic' }}>{q.textHindi}</p>
                            )}

                            {/* Options Preview */}
                            {q.questionType !== 'match-following' && q.options && q.options.length > 0 && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: 12, marginTop: 8, borderTop: '1px dashed #F1F5F9', paddingTop: 8 }}>
                                {q.options.map((opt: string, idx: number) => {
                                  const isCorrect = q.questionType === 'multiple-correct' 
                                    ? q.correctOptionIndices?.includes(idx)
                                    : q.correctOptionIndex === idx;

                                  return (
                                    <div key={idx} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                      <span style={{ 
                                        fontWeight: isCorrect ? 800 : 400, 
                                        color: isCorrect ? '#10B981' : '#6B7280' 
                                      }}>
                                        {String.fromCharCode(65 + idx)}. {opt}
                                      </span>
                                      {q.optionsHindi?.[idx] && (
                                        <span style={{ color: '#9CA3AF', fontSize: 11 }}>({q.optionsHindi[idx]})</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Match Pairs Preview */}
                            {q.questionType === 'match-following' && q.matchPairs && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, marginTop: 8, background: '#F9FAFB', padding: 8, borderRadius: 6 }}>
                                {q.matchPairs.map((p, idx) => (
                                  <div key={idx} style={{ display: 'flex', gap: 12 }}>
                                    <span style={{ fontWeight: 600, color: NAVY }}>{idx + 1}. {p.left}</span>
                                    <span style={{ color: '#9CA3AF' }}>⇄</span>
                                    <span style={{ color: '#4B5563' }}>{p.right}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 11.5, background: '#EEF2FF', color: '#4F46E5', padding: '3px 8px', borderRadius: 12, width: 'fit-content', fontWeight: 600 }}>{q.subject}</span>
                            {q.chapter && <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>Ch: {q.chapter}</span>}
                            {q.topic && <span style={{ fontSize: 10.5, color: '#9CA3AF' }}>T: {q.topic}</span>}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', verticalAlign: 'top', textAlign: 'center', fontWeight: 700, color: NAVY, fontSize: 13 }}>
                          +{q.marks}
                          {q.negativeMarks ? <span style={{ color: '#EF4444', fontSize: 11, display: 'block', fontWeight: 500 }}>-{q.negativeMarks}</span> : null}
                        </td>
                        <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                            <button onClick={() => handleOpenEdit(q)} className="jsc-action-btn" style={{ border: 'none', background: '#F3F4F6', color: NAVY, padding: 6, borderRadius: 4, cursor: 'pointer' }} title="Edit"><Edit2 size={14} /></button>
                            <button onClick={() => handleDelete(q._id as string)} className="jsc-action-btn delete" style={{ border: 'none', background: '#FEF2F2', color: '#EF4444', padding: 6, borderRadius: 4, cursor: 'pointer' }} title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Creation/Editing Drawer */}
      {drawerOpen && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          {/* Backdrop Click */}
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} onClick={() => setDrawerOpen(false)} />
          
          {/* Drawer Sheet */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 700, background: '#fff', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', animation: 'slideIn 0.3s ease' }}>
            
            {/* Drawer Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: NAVY, color: '#fff' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: GOLD, margin: 0 }}>{isEditing ? 'Edit Question' : 'Create Question'}</h2>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0 0 0' }}>Bilingual manual builder</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Drawer Content Form */}
            <form onSubmit={handleFormSubmit} style={{ flex: 1, overflowY: 'auto', padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Row 1: Subject & Topic */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Criminal Law"
                    style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Topic</label>
                  <input
                    type="text"
                    value={formData.topic || ''}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g. IPC"
                    style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Row 2: Chapter & Tags */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Chapter</label>
                  <input
                    type="text"
                    value={formData.chapter || ''}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    placeholder="e.g. Chapter 4"
                    style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="e.g. important, prelims, 2024"
                    style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Question Text (English) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Question Text (English) *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Enter the question in English..."
                  style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              {/* Question Text (Hindi) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Question Text (Hindi - Translation)</label>
                <textarea
                  rows={3}
                  value={formData.textHindi || ''}
                  onChange={(e) => setFormData({ ...formData, textHindi: e.target.value })}
                  placeholder="हिंदी में प्रश्न दर्ज करें..."
                  style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              {/* Question Image URL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Question Image URL (Optional)</label>
                <input
                  type="text"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="e.g. https://domain.com/diagram.jpg"
                  style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                />
              </div>

              {/* Question Type Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Question Type</label>
                <select
                  value={formData.questionType}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    questionType: e.target.value as any,
                    options: e.target.value === 'true-false' ? ['True', 'False'] : formData.options,
                    optionsHindi: e.target.value === 'true-false' ? ['सत्य', 'असत्य'] : formData.optionsHindi,
                  })}
                  style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #D2D6DC', fontSize: 13, background: '#fff' }}
                >
                  <option value="single-correct">Single Correct MCQ</option>
                  <option value="multiple-correct">Multiple Correct MCQ</option>
                  <option value="true-false">True / False</option>
                  <option value="match-following">Match the Following</option>
                  <option value="assertion-reason">Assertion / Reason</option>
                  <option value="paragraph">Paragraph Comprehension</option>
                </select>
              </div>

              {/* Type specific fields: ParagraphText */}
              {formData.questionType === 'paragraph' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#F8FAFC', padding: 16, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Comprehension Paragraph Text</label>
                  <textarea
                    rows={4}
                    value={formData.paragraphText || ''}
                    onChange={(e) => setFormData({ ...formData, paragraphText: e.target.value })}
                    placeholder="Enter the main reference text/passage..."
                    style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
              )}

              {/* Type specific fields: Match Pairs */}
              {formData.questionType === 'match-following' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#F8FAFC', padding: 16, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Match Pairs (Left to Right)</label>
                  {(formData.matchPairs || []).map((pair, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Left side item"
                        value={pair.left}
                        onChange={(e) => handlePairChange(idx, 'left', e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                      />
                      <span style={{ fontWeight: 600, color: '#9CA3AF' }}>➔</span>
                      <input
                        type="text"
                        placeholder="Right side item"
                        value={pair.right}
                        onChange={(e) => handlePairChange(idx, 'right', e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemovePair(idx)} 
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddPair}
                    style={{ width: 'fit-content', background: '#fff', border: '1px solid #E2E8F0', padding: '6px 12px', fontSize: 12, borderRadius: 4, cursor: 'pointer', fontWeight: 600, color: NAVY }}
                  >
                    + Add Pair
                  </button>
                </div>
              )}

              {/* Type specific fields: Assertion & Reason */}
              {formData.questionType === 'assertion-reason' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: '#F8FAFC', padding: 16, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: NAVY }}>Assertion (Statement A)</label>
                    <textarea
                      rows={2}
                      value={formData.assertion || ''}
                      onChange={(e) => setFormData({ ...formData, assertion: e.target.value })}
                      placeholder="e.g. Assertion: Right to speech is not absolute."
                      style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: NAVY }}>Reason (Statement R)</label>
                    <textarea
                      rows={2}
                      value={formData.reason || ''}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="e.g. Reason: Public order restrictions apply."
                      style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                </div>
              )}

              {/* Options Section (For MCQ, TF, Paragraph, AR) */}
              {formData.questionType !== 'match-following' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Options & Correct Key</label>
                    {formData.questionType !== 'true-false' && (
                      <button
                        type="button"
                        onClick={handleAddOptionField}
                        style={{ border: 'none', background: 'none', color: GOLD, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                      >
                        + Add Option
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {(formData.options || []).map((opt, idx) => {
                      const isCorrect = formData.questionType === 'multiple-correct'
                        ? formData.correctOptionIndices?.includes(idx)
                        : formData.correctOptionIndex === idx;

                      return (
                        <div key={idx} style={{ background: '#F8FAFC', padding: 12, borderRadius: 6, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            {/* Key Selection Indicator */}
                            {formData.questionType === 'multiple-correct' ? (
                              <input
                                type="checkbox"
                                checked={isCorrect}
                                onChange={(e) => {
                                  let current = [...(formData.correctOptionIndices || [])];
                                  if (e.target.checked) {
                                    current.push(idx);
                                  } else {
                                    current = current.filter(i => i !== idx);
                                  }
                                  setFormData({ ...formData, correctOptionIndices: current });
                                }}
                                style={{ width: 18, height: 18, cursor: 'pointer' }}
                              />
                            ) : (
                              <input
                                type="radio"
                                name="correctOption"
                                checked={isCorrect}
                                onChange={() => setFormData({ ...formData, correctOptionIndex: idx })}
                                style={{ width: 18, height: 18, cursor: 'pointer' }}
                              />
                            )}

                            <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{String.fromCharCode(65 + idx)}</span>
                            
                            {/* Option English Input */}
                            <input
                              type="text"
                              required
                              value={opt}
                              onChange={(e) => handleOptionChange(idx, e.target.value, false)}
                              placeholder={`Option ${idx + 1} (English)`}
                              style={{ flex: 1, padding: '6px 10px', border: '1px solid #D2D6DC', borderRadius: 4, fontSize: 13 }}
                              disabled={formData.questionType === 'true-false'}
                            />

                            {/* Option delete */}
                            {formData.questionType !== 'true-false' && (formData.options || []).length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOptionField(idx)}
                                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>

                          {/* Option Hindi Input */}
                          <div style={{ paddingLeft: 28 }}>
                            <input
                              type="text"
                              value={formData.optionsHindi?.[idx] || ''}
                              onChange={(e) => handleOptionChange(idx, e.target.value, true)}
                              placeholder={`विकल्प ${idx + 1} (Hindi Translation)`}
                              style={{ width: '100%', padding: '6px 10px', border: '1px solid #D2D6DC', borderRadius: 4, fontSize: 13 }}
                              disabled={formData.questionType === 'true-false'}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Marks & Negative Marks */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Marks *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: parseFloat(e.target.value) || 0 })}
                    style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Negative Marks</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.negativeMarks || 0}
                    onChange={(e) => setFormData({ ...formData, negativeMarks: parseFloat(e.target.value) || 0 })}
                    style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Difficulty *</label>
                  <select
                    value={formData.difficultyLevel}
                    onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value as any })}
                    style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #D2D6DC', fontSize: 13, background: '#fff' }}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Faculty & Estimated Solve Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Faculty Name</label>
                  <input
                    type="text"
                    value={formData.faculty || ''}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    placeholder="e.g. Verma Sir"
                    style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Est. Solve Time (seconds)</label>
                  <input
                    type="number"
                    value={formData.estimatedSolveTime || 60}
                    onChange={(e) => setFormData({ ...formData, estimatedSolveTime: parseInt(e.target.value) || 60 })}
                    style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Explanation (English) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Explanation (English)</label>
                <textarea
                  rows={3}
                  value={formData.explanation || ''}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Enter detailed explanation..."
                  style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}
                />
              </div>

              {/* Explanation Image & Explanation Video */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Explanation Image URL</label>
                  <input
                    type="text"
                    value={formData.explanationImage || ''}
                    onChange={(e) => setFormData({ ...formData, explanationImage: e.target.value })}
                    placeholder="https://..."
                    style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Explanation Video URL</label>
                  <input
                    type="text"
                    value={formData.explanationVideoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, explanationVideoUrl: e.target.value })}
                    placeholder="Youtube link..."
                    style={{ padding: '8px 12px', border: '1px solid #D2D6DC', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginTop: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Status:</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData({ ...formData, status: 'active' })}
                    />
                    Active
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === 'draft'}
                      onChange={() => setFormData({ ...formData, status: 'draft' })}
                    />
                    Draft
                  </label>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #E2E8F0', paddingTop: 20, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  style={{ padding: '9px 18px', border: '1px solid #D1D5DB', borderRadius: 6, background: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-gold"
                  style={{ padding: '9px 24px', background: GOLD, color: NAVY, border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 size={14} className="animate-spin" />}
                  {isEditing ? 'Save Changes' : 'Create Question'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SlideIn CSS animation inline injection */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .btn-outline:hover {
          background-color: #F8FAFC !important;
        }
        .btn-gold:hover {
          filter: brightness(0.95);
        }
        tr.group:hover {
          background-color: #F8FAFC !important;
        }
      `}</style>
    </div>
  );
};

export default QuestionBank;
