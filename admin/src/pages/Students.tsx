import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  Trash2, 
  Download,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  createColumnHelper,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  type HeaderGroup,
  type Header,
  type Row,
  type Cell,
  type CellContext,
  type Column
} from '@tanstack/react-table';
import { cn } from '../utils/cn';

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  status: 'Active' | 'Inactive' | 'Pending';
  registrationDate: string;
  avatar?: string;
}

const mockData: Student[] = [
  { id: '1', name: 'Rahul Sharma', email: 'rahul@example.com', course: 'MP Civil Judge', status: 'Active', registrationDate: '2024-05-10' },
  { id: '2', name: 'Priya Verma', email: 'priya@example.com', course: 'UP PCS (J)', status: 'Active', registrationDate: '2024-05-08' },
  { id: '3', name: 'Amit Singh', email: 'amit@example.com', course: 'Delhi Judiciary', status: 'Pending', registrationDate: '2024-05-05' },
  { id: '4', name: 'Sneha Gupta', email: 'sneha@example.com', course: 'MP Civil Judge', status: 'Inactive', registrationDate: '2024-05-01' },
  { id: '5', name: 'Vikram AD', email: 'vikram@example.com', course: 'Foundation Batch', status: 'Active', registrationDate: '2024-04-28' },
];

const columnHelper = createColumnHelper<Student>();

const Students = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: ({ column }: { column: Column<Student, unknown> }) => (
        <button className="flex items-center gap-2 hover:text-blue-600 transition-colors" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name <ArrowUpDown size={14} />
        </button>
      ),
      cell: (info: CellContext<Student, string>) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-600/20 text-blue-600 flex items-center justify-center font-bold text-sm">
            {info.getValue().charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{info.getValue()}</p>
            <p className="text-xs text-gray-500">{info.row.original.email}</p>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('course', {
      header: 'Course',
      cell: (info: CellContext<Student, string>) => <span className="font-medium text-gray-600 dark:text-gray-400">{info.getValue()}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info: CellContext<Student, 'Active' | 'Inactive' | 'Pending'>) => {
        const status = info.getValue();
        return (
          <span className={cn(
            "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
            status === 'Active' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-600/10" :
            status === 'Pending' ? "bg-amber-50 text-amber-600 dark:bg-amber-600/10" :
            "bg-rose-50 text-rose-600 dark:bg-rose-600/10"
          )}>
            {status}
          </span>
        );
      },
    }),
    columnHelper.accessor('registrationDate', {
      header: 'Enrolled On',
      cell: (info: CellContext<Student, string>) => <span className="text-gray-500 tabular-nums">{info.getValue()}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg text-gray-400 hover:text-blue-600 transition-all">
            <Eye size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg text-gray-400 hover:text-emerald-600 transition-all">
            <Edit2 size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg text-gray-400 hover:text-rose-600 transition-all">
            <Trash2 size={18} />
          </button>
        </div>
      ),
    }),
  ], []);

  const table = useReactTable({
    data: mockData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 5 }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students Directory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and monitor all registered students.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl text-sm font-semibold hover:shadow-sm transition-all">
            <Download size={16} /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:scale-105 transition-all">
            <UserPlus size={18} /> Add Student
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-gray-50 dark:border-slate-900 shadow-premium overflow-hidden">
        {/* Filters Header */}
        <div className="p-6 border-b border-gray-50 dark:border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search students..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-slate-900 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 transition-all">
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Real Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              {table.getHeaderGroups().map((headerGroup: HeaderGroup<Student>) => (
                <tr key={headerGroup.id} className="bg-gray-50/50 dark:bg-slate-900/50">
                  {headerGroup.headers.map((header: Header<Student, unknown>) => (
                    <th key={header.id} className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-900">
              {table.getRowModel().rows.map((row: Row<Student>) => (
                <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  {row.getVisibleCells().map((cell: Cell<Student, unknown>) => (
                    <td key={cell.id} className="px-6 py-5 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-50 dark:border-slate-900 flex items-center justify-between">
          <div className="text-sm text-gray-400 font-medium">
            Showing <span className="text-gray-900 dark:text-white">1 to 5</span> of <span className="text-gray-900 dark:text-white">1,240</span> students
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map(page => (
                <button 
                  key={page}
                  className={cn(
                    "w-9 h-9 rounded-xl text-sm font-bold transition-all",
                    page === 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "hover:bg-gray-100 dark:hover:bg-slate-900 text-gray-400"
                  )}
                >
                  {page}
                </button>
              ))}
              <span className="text-gray-400 px-2">...</span>
            </div>
            <button 
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-xl border border-gray-100 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-900 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
