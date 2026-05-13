import { useState } from 'react';
import { Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { Table, type Column } from '../components/ui/Table';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

interface Category {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  title: string;
  category: Category;
  language: string;
  mode: string;
  duration: string;
  price: number;
  createdAt: string;
}

const Courses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['courses', searchTerm],
    queryFn: () => api.get(`/courses?search=${searchTerm}`).then(res => res.data)
  });

  const results = data?.data || [];

  const columns: Column<Course>[] = [
    { key: 'title', header: 'Course Title', render: (row) => <span className="font-medium">{row.title}</span> },
    { key: 'category', header: 'Category', render: (row) => <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{row.category?.name || 'Uncategorized'}</span> },
    { key: 'language', header: 'Language' },
    { key: 'mode', header: 'Mode' },
    { key: 'duration', header: 'Duration' },
    { key: 'price', header: 'Price (₹)', render: (row) => `₹${row.price?.toLocaleString() || 0}` },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage categories, syllabus, and course offerings.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} /> Add New Course
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
        <Loader2 size={20} className={`text-blue-600 animate-spin ${isLoading ? 'opacity-100' : 'opacity-0'}`} />
        <input 
          type="text" 
          placeholder="Search courses by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full outline-none text-gray-700"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
          <AlertCircle className="mx-auto mb-2" size={32} />
          <p className="font-semibold">Failed to load courses.</p>
        </div>
      ) : (
        <Table 
          columns={columns} 
          data={results} 
          onEdit={(row) => console.log('Edit', row)}
          onDelete={(row) => console.log('Delete', row)}
        />
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto hidden-scrollbar">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Add New Course</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
                    <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. UP PCS (J) Target Batch" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none">
                      <option>Foundation</option>
                      <option>Target Batch</option>
                      <option>Mains Answer Writing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language *</label>
                    <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none">
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Bilingual (Hindi/English)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Study *</label>
                    <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none">
                      <option>Online</option>
                      <option>Offline</option>
                      <option>Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                    <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 12 Months" />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image</label>
                    <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                      <p className="text-gray-500">Click to upload thumbnail image (1920x1080 recommended)</p>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Demo YouTube Video URL</label>
                    <input type="url" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://youtube.com/watch?v=..." />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">App Redirect Link</label>
                    <input type="url" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="jscapp://course/123" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Inquiry Pre-fill Msg</label>
                    <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="I'm interested in..." />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Faculty</label>
                    <select multiple className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none h-24">
                      <option>Justice R. Sharma</option>
                      <option>Dr. A. Desai</option>
                      <option>Mr. M. Singh</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>

                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                Save Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
