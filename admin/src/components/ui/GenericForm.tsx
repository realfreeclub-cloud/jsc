import React, { useState } from 'react';
import { Loader2, Upload, Image as ImageIcon, CheckCircle, FileText, X } from 'lucide-react';
import api from '../../utils/api';

export interface Field {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'url' | 'date' | 'file';
  options?: { label: string; value: string | number }[];
  placeholder?: string;
  required?: boolean;
}

interface GenericFormProps<T = Record<string, unknown>> {
  formId: string;
  title: string;
  fields: Field[];
  initialData?: T;
  onSubmit: (data: T) => Promise<void>;
}

const NAVY = '#07152F';
const GOLD = '#F4B400';


const GenericForm = <T extends Record<string, unknown>>({
  formId,
  title,
  fields,
  initialData,
  onSubmit,
}: GenericFormProps<T>) => {
  const [formData, setFormData] = useState<T>(() => {
    if (initialData) return { ...initialData };
    return fields.reduce((acc, field) => {
      const defaultValue = (field.type === 'checkbox' ? true : '') as unknown;
      acc[field.name as keyof T] = defaultValue as T[keyof T];
      return acc;
    }, {} as T);
  });

  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (name: string, file: File) => {
    setUploadingField(name);
    const uploadData = new FormData();
    uploadData.append('file', file);
    try {
      const response = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      handleChange(name, response.data.url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form id={formId} onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 20px' }}>
        {fields.map((field) => (
          <div
            key={field.name}
            style={{
              gridColumn:
                field.type === 'textarea' || field.type === 'file' || field.type === 'checkbox'
                  ? '1 / -1'
                  : 'auto',
            }}
          >
            {field.type !== 'checkbox' && (
              <label className="jsc-form-label">
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
            )}

            {field.type === 'textarea' ? (
              <textarea
                value={(formData[field.name as keyof T] as string) || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                className="jsc-textarea"
              />
            ) : field.type === 'file' ? (
              (() => {
                const isDocField =
                  field.name.toLowerCase().includes('pdf') ||
                  field.name.toLowerCase().includes('file') ||
                  field.name.toLowerCase().includes('url') ||
                  title.toLowerCase().includes('material');
                const fileVal = formData[field.name as keyof T] as string;
                const isDocFile =
                  fileVal &&
                  (fileVal.toLowerCase().endsWith('.pdf') ||
                    fileVal.toLowerCase().endsWith('.doc') ||
                    fileVal.toLowerCase().endsWith('.docx') ||
                    fileVal.toLowerCase().endsWith('.xls') ||
                    fileVal.toLowerCase().endsWith('.xlsx') ||
                    fileVal.toLowerCase().endsWith('.ppt') ||
                    fileVal.toLowerCase().endsWith('.pptx') ||
                    fileVal.includes('/uploads/file-'));

                return (
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div
                      style={{
                        width: 110, height: 110, borderRadius: 12,
                        overflow: 'hidden', border: '2px solid #EEF1F8',
                        flexShrink: 0, position: 'relative',
                      }}
                    >
                      {fileVal ? (
                        <>
                          {isDocFile ? (
                            <div style={{ width: '100%', height: '100%', background: '#F5F7FB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: GOLD, padding: 8, textAlign: 'center' }}>
                              <FileText size={32} />
                              <span style={{ fontSize: 9, marginTop: 6, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', whiteSpace: 'nowrap' }}>
                                {fileVal.split('/').pop()?.substring(0, 15) || 'Document'}
                              </span>
                            </div>
                          ) : (
                            <img src={fileVal} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                          <button
                            type="button"
                            onClick={() => handleChange(field.name, '')}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(7,21,47,0.7)', color: '#fff', border: 'none', cursor: 'pointer', opacity: 0, transition: 'opacity 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0'; }}
                          >
                            <X size={14} /> Remove
                          </button>
                        </>
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#F5F7FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#AAB3C5' }}>
                          {isDocField ? <FileText size={30} /> : <ImageIcon size={30} />}
                        </div>
                      )}
                    </div>

                    <label style={{ flex: 1, height: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, border: '2px dashed #D0D8E8', borderRadius: 12, cursor: 'pointer', background: '#F5F7FB' }}>
                      {uploadingField === field.name ? (
                        <>
                          <Loader2 size={22} style={{ color: GOLD, animation: 'spin 1s linear infinite' }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#C9930A' }}>Uploading...</span>
                        </>
                      ) : fileVal ? (
                        <>
                          <CheckCircle size={22} style={{ color: '#059669' }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>Uploaded!</span>
                          <span style={{ fontSize: 11.5, color: '#2A5298' }}>Click to replace</span>
                        </>
                      ) : (
                        <>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(244,180,0,0.12)', border: '1px solid rgba(244,180,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD }}>
                            <Upload size={18} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>
                            {isDocField ? 'Upload PDF / Document' : 'Upload Image'}
                          </span>
                          <span style={{ fontSize: 11.5, color: '#2A5298' }}>
                            {isDocField ? 'PDF, DOC, PNG up to 50 MB' : 'PNG, JPG up to 5 MB'}
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept={isDocField ? '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*' : 'image/*'}
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(field.name, file);
                        }}
                      />
                    </label>
                  </div>
                );
              })()
            ) : field.type === 'select' ? (
              <select
                value={(formData[field.name as keyof T] as string) || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                className="jsc-select"
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : field.type === 'checkbox' ? (
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#F5F7FB', border: '1.5px solid #EEF1F8', borderRadius: 10, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleChange(field.name, !formData[field.name])}
              >
                <div
                  style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${formData[field.name] ? GOLD : '#D0D8E8'}`, background: formData[field.name] ? GOLD : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}
                >
                  {Boolean(formData[field.name]) && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4L4.5 7.5L10 1" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: NAVY }}>{field.label}</p>
                  <p style={{ fontSize: 12, color: '#2A5298', marginTop: 2 }}>Toggle to enable or disable this record</p>
                </div>
              </div>
            ) : (
              <input
                type={field.type}
                value={(formData[field.name as keyof T] as string | number) || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                className="jsc-input"
              />
            )}
          </div>
        ))}
      </div>
    </form>
  );
};

export default GenericForm;
