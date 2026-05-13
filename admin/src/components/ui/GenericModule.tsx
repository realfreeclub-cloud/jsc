import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import { Table, type Column } from './Table';
import GenericForm, { type Field } from './GenericForm';

interface GenericModuleProps<T = Record<string, unknown>> {
  title: string;
  endpoint: string;
  columns?: Column<T>[];
  fields: Field[];
}

const GenericModule = <T extends Record<string, unknown>>({ title, endpoint, columns, fields }: GenericModuleProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<T | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: [endpoint, searchTerm],
    queryFn: () => api.get(`/${endpoint}?search=${searchTerm}`).then(res => res.data)
  });

  const results = data?.data || [];

  const createMutation = useMutation({
    mutationFn: (newData: T) => api.post(`/${endpoint}`, newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setIsModalOpen(false);
      setEditData(undefined);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updateData: T) => api.patch(`/${endpoint}/${updateData._id}`, updateData),
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

  const handleSave = async (formData: T) => {
    if (editData) {
      await updateMutation.mutateAsync({ ...formData, _id: editData._id });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleEdit = (row: T) => {
    setEditData(row);
    setIsModalOpen(true);
  };

  const handleDelete = (row: T) => {
    if (window.confirm(`Are you sure you want to delete this ${title.toLowerCase()}?`)) {
      deleteMutation.mutate(row._id as string);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title} Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your {title.toLowerCase()} from here.</p>
        </div>
        <button 
          onClick={() => { setEditData(undefined); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} /> Add New {title}
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
        <Search size={20} className="text-gray-400" />
        <input 
          type="text" 
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full outline-none text-gray-700"
        />
        {(isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending) && (
          <Loader2 size={20} className="text-blue-600 animate-spin" />
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
          <AlertCircle className="mx-auto mb-2" size={32} />
          <p className="font-semibold">Failed to load data.</p>
          <p className="text-sm">Please check your connection and try again.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No {title.toLowerCase()} available yet</h3>
          <p className="text-gray-500 max-w-sm">Click the "Add New {title}" button above to create your first entry.</p>
        </div>
      ) : (
        <Table 
          columns={columns || [{ key: 'title', header: 'Title' }, { key: 'createdAt', header: 'Date Created', render: (row: T) => new Date(row.createdAt as string).toLocaleDateString() }]} 
          data={results} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

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
