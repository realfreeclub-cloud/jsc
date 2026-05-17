import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, AlertCircle, Loader2, Edit2, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import GenericForm, { type Field } from './GenericForm';
import { cn } from '../../utils/cn';

interface GenericModuleProps {
  title: string;
  endpoint: string;
  fields: Field[];
}

const GenericModule = ({ title, endpoint, fields }: GenericModuleProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<Record<string, unknown> | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: [endpoint, searchTerm],
    queryFn: () => api.get(`/${endpoint}?search=${searchTerm}`).then(res => res.data)
  });

  const results = (data?.data || []) as Record<string, unknown>[];

  const createMutation = useMutation({
    mutationFn: (newData: Record<string, unknown>) => api.post(`/${endpoint}`, newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setIsModalOpen(false);
      setEditData(undefined);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updateData: Record<string, unknown>) => api.patch(`/${endpoint}/${updateData._id}`, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setIsModalOpen(false);
      setEditData(undefined);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/${endpoint}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    }
  });

  const handleSave = async (formData: Record<string, unknown>) => {
    try {
      if (editData) {
        await updateMutation.mutateAsync({ ...formData, _id: editData._id });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleEdit = (row: Record<string, unknown>) => {
    setEditData(row);
    setIsModalOpen(true);
  };

  const handleDelete = (row: Record<string, unknown>) => {
    if (window.confirm(`Are you sure you want to delete this ${title.toLowerCase()}?`)) {
      deleteMutation.mutate(row._id as string);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title} Management</h1>
          <p className="text-slate-500 text-sm mt-1">Configure and monitor your {title.toLowerCase()} items.</p>
        </div>
        <button 
          onClick={() => { setEditData(undefined); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all"
        >
          <Plus size={16} /> Add New {title}
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="relative flex-1 max-w-md group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
            />
          </div>
          {(isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending) && (
            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-widest">
              <Loader2 size={16} className="animate-spin" />
              <span>Syncing...</span>
            </div>
          )}
        </div>

        {/* Dynamic Table Area */}
        {isLoading ? (
          <div className="p-12 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-50 dark:bg-slate-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold dark:text-white">Connection Error</h3>
            <p className="text-gray-500 text-sm mt-1">We couldn't fetch the {title.toLowerCase()} list.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-400 border border-slate-100 dark:border-slate-800">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No {title.toLowerCase()} found</h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">Get started by creating your first record.</p>
            <button 
              onClick={() => { setEditData(undefined); setIsModalOpen(true); }}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              + Create new {title.toLowerCase()}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {results.map((row: Record<string, unknown>) => (
                  <tr key={row._id as string} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {row.imageUrl && typeof row.imageUrl === 'string' && (
                          <img src={row.imageUrl} alt="Thumbnail" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                        )}
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">
                            {String(row.title || row.name || row.courseName || row.platform || 'Untitled Item')}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 max-w-[300px] truncate">
                            {String(row._id)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.isActive !== undefined ? (
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                          row.isActive 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400" 
                            : "bg-slate-100 text-slate-600 border border-slate-200/50 dark:bg-slate-800 dark:text-slate-400"
                        )}>
                          {row.isActive ? 'Active' : 'Draft'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {row.createdAt ? new Date(row.createdAt as string).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(row)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(row)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <GenericForm 
          title={title}
          fields={fields}
          initialData={editData}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
};

export default GenericModule;
