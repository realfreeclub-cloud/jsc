import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit, Trash2, Filter } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  searchPlaceholder?: string;
}

export function Table<T>({ columns, data, onEdit, onDelete, searchPlaceholder = "Search..." }: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Simple search filter (assuming any string value in object matches)
  const filteredData = data.filter(item => 
    Object.values(item as Record<string, unknown>).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-72">
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-4 font-semibold">{col.header}</th>
              ))}
              {(onEdit || onDelete) && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? currentData.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {columns.map((col, j) => (
                  <td key={j} className="px-6 py-4 text-gray-900">
                    {col.render ? col.render(row) : String(row[col.key as keyof T] || '')}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    {onEdit && (
                      <button onClick={() => onEdit(row)} className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-lg transition-colors">
                        <Edit size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(row)} className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-500">
                  No data found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-900">{filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-semibold text-gray-900">{filteredData.length}</span> entries
        </p>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
