import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Search, Loader2, Trash2, BookOpen } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../utils/api';

const NAVY = '#07152F';
const GOLD = '#F4B400';

export interface QuestionBankItem {
  _id?: string;
  subject: string;
  topic?: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
}

const QuestionBank = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: qbData, isLoading } = useQuery({
    queryKey: ['questionBank'],
    queryFn: () => api.get('/question-bank').then(res => res.data),
  });

  const questions = (qbData?.data?.questions || []) as QuestionBankItem[];
  const filteredQuestions = questions.filter((q) => 
    q.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bulkCreateMutation = useMutation({
    mutationFn: (newQuestions: QuestionBankItem[]) => api.post('/question-bank/bulk', { questions: newQuestions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionBank'] });
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      alert('Questions imported successfully!');
    },
    onError: (err: Error) => {
      setIsUploading(false);
      alert(`Error importing questions: ${err.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/question-bank/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionBank'] });
    }
  });

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
        const data = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws);

        const parsedQuestions: QuestionBankItem[] = data.map((row) => ({
          subject: (row['Subject'] as string) || 'General',
          topic: (row['Topic'] as string) || '',
          text: (row['Question'] as string),
          options: [
            row['Option 1'],
            row['Option 2'],
            row['Option 3'],
            row['Option 4']
          ].filter(Boolean) as string[],
          correctOptionIndex: parseInt(row['Correct Option (1-4)'] as string) - 1,
          marks: parseInt(row['Marks'] as string) || 1
        })).filter((q) => q.text && q.options.length >= 2);

        if (parsedQuestions.length === 0) {
          alert('No valid questions found in the Excel file. Please ensure column headers match the template.');
          setIsUploading(false);
          return;
        }

        bulkCreateMutation.mutate(parsedQuestions);
      } catch {
        alert('Error parsing Excel file. Please ensure it is a valid .xlsx file.');
        setIsUploading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this question from the bank?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Subject": "Criminal Law",
        "Topic": "IPC",
        "Question": "What is the primary objective of IPC?",
        "Option 1": "Deterrence",
        "Option 2": "Rehabilitation",
        "Option 3": "Retribution",
        "Option 4": "Prevention",
        "Correct Option (1-4)": 1,
        "Marks": 1
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Question_Bank_Template.xlsx");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div className="jsc-page-header">
          <h1 className="jsc-page-title">Question Bank Master</h1>
          <p className="jsc-page-subtitle">Manage thousands of questions and bulk import them via Excel.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleDownloadTemplate} className="btn-outline" style={{ padding: '9px 18px', fontSize: 13, borderColor: '#D0D8E8', background: '#fff', color: NAVY }}>
            <BookOpen size={15} style={{ marginRight: 6 }}/> Download Template
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
            className="btn-gold" style={{ padding: '9px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {isUploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} 
            Bulk Upload Excel
          </button>
        </div>
      </div>

      <div className="jsc-card" style={{ overflow: 'hidden' }}>
        <div className="jsc-filter-bar">
          <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-navy-400)' }} />
            <input
              type="text"
              placeholder="Search by question, subject or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="jsc-search-bar"
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '48px 24px', display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" size={32} color={GOLD} /></div>
        ) : filteredQuestions.length === 0 ? (
          <div className="jsc-empty-state">
            <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY }}>No questions found</h3>
            <p style={{ fontSize: 13.5, color: 'var(--color-navy-400)', marginBottom: 24 }}>Upload an Excel file to populate your Question Bank.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="jsc-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', minWidth: 300 }}>Question</th>
                  <th style={{ textAlign: 'left' }}>Subject / Topic</th>
                  <th style={{ textAlign: 'center' }}>Marks</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((q: QuestionBankItem) => (
                  <tr key={q._id} className="group">
                    <td>
                      <p style={{ fontWeight: 600, color: NAVY, fontSize: 13.5, marginBottom: 4 }}>{q.text}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 12, color: 'var(--color-navy-400)' }}>
                          {q.options.map((opt: string, i: number) => (
                              <span key={i} style={{ color: i === q.correctOptionIndex ? '#10B981' : 'inherit', fontWeight: i === q.correctOptionIndex ? 600 : 400 }}>
                                  {String.fromCharCode(65 + i)}. {opt}
                              </span>
                          ))}
                      </div>
                    </td>
                    <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 12, background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: 12, width: 'fit-content', fontWeight: 600 }}>{q.subject}</span>
                            {q.topic && <span style={{ fontSize: 11, color: 'var(--color-navy-400)' }}>{q.topic}</span>}
                        </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: NAVY }}>{q.marks}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <button onClick={() => handleDelete(q._id)} className="jsc-action-btn delete" title="Delete"><Trash2 size={15} /></button>
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
  );
};

export default QuestionBank;
