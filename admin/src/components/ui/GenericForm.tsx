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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-900">
        <div className="p-6 border-b border-gray-50 dark:border-slate-900 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-950 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{initialData ? 'Edit' : 'Add New'} {title}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-900 p-2 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-blue-500 outline-none h-32 dark:text-white"
                  />
                ) : field.type === 'file' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-6">
                      {formData[field.name as keyof T] ? (
                        <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm">
                          <img 
                            src={formData[field.name as keyof T] as string} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                          <button 
                            type="button"
                            onClick={() => handleChange(field.name, '')}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-28 h-28 rounded-2xl bg-gray-50 dark:bg-slate-900 flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-slate-800 text-gray-400">
                          <ImageIcon size={32} />
                        </div>
                      )}
                      
                      <label className="flex-1">
                        <div className="flex flex-col items-center justify-center gap-2 px-6 py-8 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer relative group">
                          {uploadingField === field.name ? (
                            <Loader2 size={24} className="animate-spin text-blue-600" />
                          ) : (
                            <>
                              <Upload size={24} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Click to upload image</span>
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
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-white appearance-none"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center gap-4 py-2">
                    <input
                      type="checkbox"
                      checked={!!formData[field.name]}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                      className="w-6 h-6 rounded-lg border-gray-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900"
                    />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Active / Visible</span>
                  </div>
                ) : (
                  <input
                    type={field.type}
                    value={(formData[field.name as keyof T] as string | number) || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-8 border-t border-gray-50 dark:border-slate-900">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-slate-900 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || uploadingField !== null}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {initialData ? 'Update' : 'Save'} {title}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenericForm;
