import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import { Table, type Column } from './Table';

interface GenericModuleProps {
  title: string;
  endpoint: string;
  columns?: Column<Record<string, unknown>>[];
}

const GenericModule = ({ title, endpoint, columns }: GenericModuleProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: [endpoint, searchTerm],
    queryFn: () => api.get(`/${endpoint}?search=${searchTerm}`).then(res => res.data)
  });

  const results = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title} Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your {title.toLowerCase()} from here.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
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
          columns={columns || [{ key: 'title', header: 'Title' }, { key: 'createdAt', header: 'Date Created', render: (row: Record<string, unknown>) => new Date(row.createdAt as string).toLocaleDateString() }]} 
          data={results} 
          onEdit={(row) => console.log('Edit', row)}
          onDelete={(row) => console.log('Delete', row)}
        />
      )}
    </div>
  );
};

export default GenericModule;
