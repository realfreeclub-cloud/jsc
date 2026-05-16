import { useState } from 'react';
import { Plus, X, Loader2, AlertCircle, Search } from 'lucide-react';
import { Table, type Column } from '../components/ui/Table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

interface Category {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  title: string;
  category: Category | string;
  language: string;
  mode: string;
  duration: string;
  price: number;
  imageUrl?: string;
  demoVideoUrl?: string;
  appRedirectLink?: string;
  whatsappMessage?: string;
  isActive?: boolean;
  createdAt: string;
}

const Courses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editData, setEditData] = useState<Course | null>(null);
  const [formData, setFormData] = useState<Partial<Course>>({});
  
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['courses', searchTerm],
    queryFn: () => api.get(`/courses?search=${searchTerm}`).then(res => res.data)
  });

  const results = data?.data || [];

  const createMutation = useMutation({
    mutationFn: (newData: Partial<Course>) => api.post('/courses', newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsModalOpen(false);
      setEditData(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updateData: Partial<Course> & { _id: string }) => api.patch(`/courses/${updateData._id}`, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsModalOpen(false);
      setEditData(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    }
  });

  const handleEdit = (course: Course) => {
    setEditData(course);
    setFormData({
      ...course,
      category: typeof course.category === 'object' ? course.category?._id : course.category
    });
    setIsModalOpen(true);
  };

  const handleDelete = (course: Course) => {
    if (window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
      deleteMutation.mutate(course._id);
    }
  };

  const handleAddNew = () => {
    setEditData(null);
    setFormData({
      title: '',
      language: 'English',
      mode: 'Online',
      duration: '',
      price: 0,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editData) {
      await updateMutation.mutateAsync({ ...formData, _id: editData._id });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const columns: Column<Course>[] = [
    { key: 'title', header: 'Course Title', render: (row) => <span className="font-medium">{row.title}</span> },
    { key: 'category', header: 'Category', render: (row) => <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{(row.category as Category)?.name || 'Uncategorized'}</span> },
    { key: 'language', header: 'Language' },
    { key: 'mode', header: 'Mode' },
    { key: 'duration', header: 'Duration' },
    { key: 'price', header: 'Price (₹)', render: (row) => `₹${row.price?.toLocaleString() || 0}` },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage categories, syllabus, and course offerings.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} /> Add New Course
        </button>
      </div>

      <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-gray-100 dark:border-slate-900 shadow-premium flex items-center gap-4 group">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search courses by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-4 py-2 bg-transparent outline-none text-gray-700 dark:text-white"
          />
        </div>
        <Loader2 size={20} className={`text-blue-600 animate-spin ${isLoading ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {isLoading ? (
        <div className="p-12 space-y-4 bg-white dark:bg-slate-950 rounded-3xl border border-gray-100 dark:border-slate-900">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-50 dark:bg-slate-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-600 p-8 rounded-3xl border border-red-100 dark:border-red-900/20 text-center">
          <AlertCircle className="mx-auto mb-2" size={32} />
          <p className="font-bold">Failed to load courses</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-950 rounded-3xl border border-gray-100 dark:border-slate-900 shadow-premium overflow-hidden">
          <Table 
            columns={columns} 
            data={results} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* Add/Edit Slide-over */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-950 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100 dark:border-slate-900">
            <div className="p-6 md:p-8 border-b border-gray-50 dark:border-slate-900 flex justify-between items-center bg-white dark:bg-slate-950 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editData ? 'Edit Course' : 'Create Course'}</h2>
                <p className="text-sm text-gray-500 mt-1">Configure your course settings below.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-900 p-2.5 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto hidden-scrollbar">
              <form id="course-form" onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Course Title *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" 
                    placeholder="e.g. UP PCS (J) Target Batch" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Language *</label>
                  <select 
                    value={formData.language || 'English'}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Bilingual (Hindi/English)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mode of Study *</label>
                  <select 
                    value={formData.mode || 'Online'}
                    onChange={(e) => setFormData({...formData, mode: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  >
                    <option>Online</option>
                    <option>Offline</option>
                    <option>Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Duration *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" 
                    placeholder="e.g. 12 Months" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Price (₹) *</label>
                  <input 
                    type="number" 
                    required
                    value={formData.price || 0}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" 
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Thumbnail Image URL</label>
                  <input 
                    type="url" 
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" 
                    placeholder="https://example.com/image.jpg" 
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Demo YouTube Video URL</label>
                  <input 
                    type="url" 
                    value={formData.demoVideoUrl || ''}
                    onChange={(e) => setFormData({...formData, demoVideoUrl: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" 
                    placeholder="https://youtube.com/watch?v=..." 
                  />
                </div>
              </div>

              </form>
            </div>

            <div className="p-6 border-t border-gray-50 dark:border-slate-900 bg-white dark:bg-slate-950 shrink-0">
              <div className="flex items-center justify-end gap-3 max-w-2xl mx-auto">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-slate-900 transition-all">
                  Cancel
                </button>
                <button 
                  form="course-form"
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 size={18} className="animate-spin" />}
                  {editData ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
