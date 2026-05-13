import { useState } from 'react';
import { Plus, X, Loader2, AlertCircle } from 'lucide-react';
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
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage categories, syllabus, and course offerings.</p>
        </div>
        <button 
          onClick={handleAddNew}
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
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto hidden-scrollbar">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">{editData ? 'Edit Course' : 'Add New Course'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="e.g. UP PCS (J) Target Batch" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language *</label>
                  <select 
                    value={formData.language || 'English'}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Bilingual (Hindi/English)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Study *</label>
                  <select 
                    value={formData.mode || 'Online'}
                    onChange={(e) => setFormData({...formData, mode: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>Online</option>
                    <option>Offline</option>
                    <option>Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="e.g. 12 Months" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input 
                    type="number" 
                    required
                    value={formData.price || 0}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image URL</label>
                  <input 
                    type="url" 
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="https://example.com/image.jpg" 
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Demo YouTube Video URL</label>
                  <input 
                    type="url" 
                    value={formData.demoVideoUrl || ''}
                    onChange={(e) => setFormData({...formData, demoVideoUrl: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="https://youtube.com/watch?v=..." 
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white -mx-6 -mb-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 size={18} className="animate-spin" />}
                  {editData ? 'Update Course' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
