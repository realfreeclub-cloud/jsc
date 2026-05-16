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
      const defaultValue = (field.type === 'checkbox' ? false : '') as unknown;
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
        className="bg-white dark:bg-slate-950 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100 dark:border-slate-900"
      >
        <div className="p-6 md:p-8 border-b border-gray-50 dark:border-slate-900 flex justify-between items-center bg-white dark:bg-slate-950 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{initialData ? 'Edit' : 'Create New'} {title}</h2>
            <p className="text-sm text-gray-500 mt-1">Fill out the information below.</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-900 p-2.5 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto hidden-scrollbar">
          <form id="generic-form" onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
              {fields.map((field) => (
                <div key={field.name} className={field.type === 'textarea' || field.type === 'file' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      value={(formData[field.name as keyof T] as string | number) || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-transparent focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-950 outline-none focus:ring-4 focus:ring-blue-500/10 h-32 dark:text-white transition-all resize-none"
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
                          <div className="w-32 h-32 rounded-2xl bg-gray-50 dark:bg-slate-900 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-800 text-gray-400">
                            <ImageIcon size={32} />
                          </div>
                        )}
                        
                        <label className="flex-1 h-32">
                          <div className="flex flex-col items-center justify-center gap-2 px-6 h-full border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl hover:bg-blue-50 dark:hover:bg-slate-900/50 hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors cursor-pointer relative group">
                            {uploadingField === field.name ? (
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 size={24} className="animate-spin text-blue-600" />
                                <span className="text-xs font-bold text-blue-600">Uploading...</span>
                              </div>
                            ) : (
                              <>
                                <div className="p-3 bg-white dark:bg-slate-950 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                  <Upload size={20} className="text-blue-500" />
                                </div>
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Upload Image</span>
                                <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
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
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-transparent focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-950 outline-none focus:ring-4 focus:ring-blue-500/10 dark:text-white transition-all appearance-none font-medium"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 cursor-pointer hover:bg-gray-50 transition-colors" onClick={(e) => { e.stopPropagation(); handleChange(field.name, !formData[field.name]); }}>
                      <input
                        type="checkbox"
                        checked={!!formData[field.name]}
                        onChange={(e) => handleChange(field.name, e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-950"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Is Active</span>
                        <span className="text-xs text-gray-500">Enable or disable this entry</span>
                      </div>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      value={(formData[field.name as keyof T] as string | number) || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-transparent focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-950 outline-none focus:ring-4 focus:ring-blue-500/10 dark:text-white transition-all font-medium placeholder:text-gray-400 placeholder:font-normal"
                    />
                  )}
                </div>
              ))}
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-50 dark:border-slate-900 bg-white dark:bg-slate-950 shrink-0">
          <div className="flex items-center justify-end gap-3 max-w-2xl mx-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              form="generic-form"
              type="submit"
              disabled={isLoading || uploadingField !== null}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {initialData ? 'Update' : 'Create'} {title}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericForm;
