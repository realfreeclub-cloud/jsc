import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, AlertCircle, Loader2, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title} Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Configure and monitor your {title.toLowerCase()} items.</p>
        </div>
        <button 
          onClick={() => { setEditData(undefined); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} /> Add New {title}
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-gray-100 dark:border-slate-900 shadow-premium overflow-hidden">
        {/* Filter Bar */}
        <div className="p-6 border-b border-gray-50 dark:border-slate-900 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder={`Quick search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No items found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Start by adding your first {title.toLowerCase()} record.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Content Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-900">
                {results.map((row: Record<string, unknown>) => (
                  <tr key={row._id as string} className="group hover:bg-gray-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {row.imageUrl ? (
                          <img src={row.imageUrl as string} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="Thumbnail" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400">
                            <MoreHorizontal size={20} />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
                            {(row.title as string) || (row.name as string) || 'Untitled Entry'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">ID: ...{(row._id as string)?.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        row.isActive !== false 
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-600/10" 
                          : "bg-gray-100 text-gray-500 dark:bg-slate-800"
                      )}>
                        {row.isActive !== false ? 'Live' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {new Date(row.createdAt as string).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(row)}
                          className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-600/10 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-600/20 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(row)}
                          className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-600/10 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-600/20 transition-colors"
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
