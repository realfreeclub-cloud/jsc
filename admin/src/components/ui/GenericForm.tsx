import React, { useState } from 'react';
import { X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
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
  title: string;
  fields: Field[];
  initialData?: T;
  onSave: (data: T) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const GenericForm = <T extends Record<string, unknown>>({ 
  title, 
  fields, 
  initialData, 
  onSave, 
  onCancel, 
  isLoading 
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
        headers: { 'Content-Type': 'multipart/form-data' }
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
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white dark:bg-slate-950 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800"
      >
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center bg-white dark:bg-slate-950 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{initialData ? 'Edit' : 'Create New'} {title}</h2>
            <p className="text-sm text-slate-500 mt-1">Fill out the information below.</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-900 p-2.5 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto hidden-scrollbar">
          <form id="generic-form" onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
              {fields.map((field) => (
                <div key={field.name} className={field.type === 'textarea' || field.type === 'file' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      value={(formData[field.name as keyof T] as string | number) || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none h-32 text-sm dark:text-white transition-all resize-none shadow-sm"
                    />
                  ) : field.type === 'file' ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-6">
                        {formData[field.name as keyof T] ? (
                          <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm group">
                            <img 
                              src={formData[field.name as keyof T] as string} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                type="button"
                                onClick={() => handleChange(field.name, '')}
                                className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition-colors shadow-lg flex items-center gap-2 text-sm font-bold"
                              >
                                <X size={16} /> Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                            <ImageIcon size={32} />
                          </div>
                        )}
                        
                        <label className="flex-1 h-32">
                          <div className="flex flex-col items-center justify-center gap-2 px-6 h-full border border-dashed border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer relative group">
                            {uploadingField === field.name ? (
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 size={24} className="animate-spin text-blue-600" />
                                <span className="text-xs font-semibold text-blue-600">Uploading...</span>
                              </div>
                            ) : (
                              <>
                                <div className="p-3 bg-white dark:bg-slate-950 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform">
                                  <Upload size={18} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Upload Image</span>
                                <span className="text-xs text-slate-400">PNG, JPG up to 5MB</span>
                              </>
                            )}
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(field.name, file);
                              }}
                            />
                          </div>
                        </label>
                      </div>
                    </div>
                  ) : field.type === 'select' ? (
                    <select
                      value={(formData[field.name as keyof T] as string | number) || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all appearance-none shadow-sm"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm" onClick={(e) => { e.stopPropagation(); handleChange(field.name, !formData[field.name]); }}>
                      <input
                        type="checkbox"
                        checked={!!formData[field.name]}
                        onChange={(e) => handleChange(field.name, e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-950 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800 dark:text-white">Is Active</span>
                        <span className="text-xs text-slate-500 mt-0.5">Enable or disable this entry</span>
                      </div>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      value={(formData[field.name as keyof T] as string | number) || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all placeholder:text-slate-400 shadow-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shrink-0">
          <div className="flex items-center justify-end gap-3 max-w-2xl mx-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              form="generic-form"
              type="submit"
              disabled={isLoading || uploadingField !== null}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {initialData ? 'Update' : 'Create'} {title}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericForm;
