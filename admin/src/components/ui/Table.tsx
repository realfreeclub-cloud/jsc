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

const NAVY = '#07152F';

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
    <div className="jsc-card" style={{ overflow: 'hidden', padding: 0 }}>
      {/* Table Toolbar */}
      <div className="jsc-filter-bar">
        <div className="relative w-full sm:w-72">
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="jsc-search-bar"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn-outline" style={{ padding: '8px 14px', fontSize: 13, gap: 6 }}>
            <Filter size={15} /> Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="jsc-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} style={{ textAlign: 'left' }}>{col.header}</th>
              ))}
              {(onEdit || onDelete) && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? currentData.map((row, i) => (
              <tr key={i} className="group">
                {columns.map((col, j) => (
                  <td key={j} style={{ color: NAVY, fontWeight: 500, fontSize: 13.5 }}>
                    {col.render ? col.render(row) : String(row[col.key as keyof T] || '')}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 6,
                        opacity: 0,
                        transition: 'opacity 0.15s',
                      }}
                      className="group-action-btns"
                    >
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="jsc-action-btn edit"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="jsc-action-btn delete"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--color-navy-400)' }}>
                  No data found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--color-navy-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--color-navy-500)', fontWeight: 500 }}>
          Showing <span style={{ fontWeight: 700, color: NAVY }}>{filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span style={{ fontWeight: 700, color: NAVY }}>{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span style={{ fontWeight: 700, color: NAVY }}>{filteredData.length}</span> entries
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-outline"
            style={{ padding: 8, minWidth: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="btn-outline"
            style={{ padding: 8, minWidth: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
