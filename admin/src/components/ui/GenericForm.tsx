import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

export interface Field {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'url' | 'date';
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

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit' : 'Add New'} {title}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                  <textarea
                    value={(formData[field.name as keyof T] as string | number) || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none h-32"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={(formData[field.name as keyof T] as string | number) || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      checked={!!formData[field.name]}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Active / Visible</span>
                  </div>
                ) : (
                  <input
                    type={field.type}
                    value={(formData[field.name as keyof T] as string | number) || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
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
