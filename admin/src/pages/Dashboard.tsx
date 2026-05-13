import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { BookOpen, Users, FileText, Calendar, Bell, Plus, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  // Fetch Counts
  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: () => api.get('/courses?limit=1').then(res => res.data) });
  const { data: blogs } = useQuery({ queryKey: ['blogs'], queryFn: () => api.get('/blogs?limit=1').then(res => res.data) });
  const { data: events } = useQuery({ queryKey: ['events'], queryFn: () => api.get('/events?limit=1').then(res => res.data) });
  const { data: notifications } = useQuery({ queryKey: ['notifications'], queryFn: () => api.get('/notifications?limit=1').then(res => res.data) });
  // Since we don't have a users endpoint yet mapped directly to standard factory in admin panel logic, let's mock students for now or use the generic count if available.

  const stats = [
    { label: 'Total Courses', value: courses?.totalCount || 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Students', value: 124, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Blogs', value: blogs?.totalCount || 0, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Events', value: events?.totalCount || 0, icon: Calendar, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Notifications', value: notifications?.totalCount || 0, icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Platform overview and summary</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm font-medium text-gray-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-900"><span className="font-bold">New Course Added:</span> UP PCS (J) Target Batch was published.</p>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <Users size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-900"><span className="font-bold">New Student:</span> Rahul Sharma registered an account.</p>
                <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-900"><span className="font-bold">Blog Published:</span> "How to crack Delhi Judiciary 2026"</p>
                <p className="text-xs text-gray-500 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/courses" className="flex items-center gap-3 w-full p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors font-medium">
              <Plus size={20} /> Add New Course
            </Link>
            <Link to="/blogs" className="flex items-center gap-3 w-full p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-colors font-medium">
              <Plus size={20} /> Publish Blog
            </Link>
            <Link to="/notifications" className="flex items-center gap-3 w-full p-4 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50 text-gray-700 hover:text-amber-700 transition-colors font-medium">
              <Bell size={20} /> Send Notification
            </Link>
            <Link to="/study-material" className="flex items-center gap-3 w-full p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 transition-colors font-medium">
              <Upload size={20} /> Upload Study Material
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
