import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Activity, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useTheme } from '../store/useTheme';

const stats = [
  { 
    name: 'Total Students', 
    value: '2,845', 
    change: '+12.5%', 
    trend: 'up', 
    icon: Users,
    color: 'blue'
  },
  { 
    name: 'Active Courses', 
    value: '48', 
    change: '+4', 
    trend: 'up', 
    icon: BookOpen,
    color: 'indigo'
  },
  { 
    name: 'Avg. Attendance', 
    value: '92%', 
    change: '-2.1%', 
    trend: 'down', 
    icon: Activity,
    color: 'emerald'
  },
  { 
    name: 'Total Revenue', 
    value: '₹12.4L', 
    change: '+18.2%', 
    trend: 'up', 
    icon: TrendingUp,
    color: 'violet'
  }
];

const enrollmentData = [
  { name: 'Jan', students: 400 },
  { name: 'Feb', students: 600 },
  { name: 'Mar', students: 500 },
  { name: 'Apr', students: 900 },
  { name: 'May', students: 1100 },
  { name: 'Jun', students: 1500 },
];

const revenueData = [
  { name: 'Jan', revenue: 240000 },
  { name: 'Feb', revenue: 300000 },
  { name: 'Mar', revenue: 280000 },
  { name: 'Apr', revenue: 450000 },
  { name: 'May', revenue: 600000 },
  { name: 'Jun', revenue: 800000 },
];

const recentActivity = [
  { id: 1, action: "New Admission", user: "Rahul Sharma", time: "10 mins ago", status: "success" },
  { id: 2, action: "Material Uploaded", user: "Dr. H D Tripathi", time: "1 hour ago", status: "info" },
  { id: 3, action: "Fee Pending", user: "Amit Kumar", time: "2 hours ago", status: "warning" },
  { id: 4, action: "Course Created", user: "System Admin", time: "4 hours ago", status: "success" },
];

const Dashboard = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Good Morning, Admin 👋</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with Judicial Study Centre today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl text-sm font-semibold hover:shadow-sm transition-all">
            Export Report
          </button>
          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all">
            + Quick Create
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-white dark:bg-slate-950 rounded-4xl border border-gray-50 dark:border-slate-900 shadow-premium hover:shadow-premium-hover transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-500 transition-colors`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{stat.name}</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Enrollment Chart */}
          <div className="p-8 bg-white dark:bg-slate-950 rounded-4xl border border-gray-50 dark:border-slate-900 shadow-premium">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold dark:text-white">Enrollment Analytics</h3>
              <select className="bg-gray-50 dark:bg-slate-900 border-none text-xs font-bold rounded-lg px-3 py-1.5 outline-none">
                <option>Last 6 Months</option>
                <option>Yearly</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enrollmentData}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDarkMode ? '#64748b' : '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDarkMode ? '#64748b' : '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDarkMode ? '#020617' : '#ffffff', borderRadius: '16px', border: isDarkMode ? '1px solid #1e293b' : 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px', color: isDarkMode ? '#ffffff' : '#000000' }} 
                    itemStyle={{ color: isDarkMode ? '#3b82f6' : '#2563eb' }}
                  />
                  <Area type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="p-8 bg-white dark:bg-slate-950 rounded-4xl border border-gray-50 dark:border-slate-900 shadow-premium">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold dark:text-white">Revenue Overview</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDarkMode ? '#64748b' : '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDarkMode ? '#64748b' : '#94a3b8' }} tickFormatter={(value) => `₹${value / 1000}k`} />
                  <Tooltip 
                    cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
                    contentStyle={{ backgroundColor: isDarkMode ? '#020617' : '#ffffff', borderRadius: '16px', border: isDarkMode ? '1px solid #1e293b' : 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px', color: isDarkMode ? '#ffffff' : '#000000' }} 
                  />
                  <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 6, 6]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-8">
          
          {/* Quick Actions */}
          <div className="p-8 bg-white dark:bg-slate-950 rounded-4xl border border-gray-50 dark:border-slate-900 shadow-premium">
            <h3 className="text-lg font-bold dark:text-white mb-6">Shortcuts</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors group">
                <Plus size={24} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-blue-600">Course</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-colors group">
                <Users size={24} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-emerald-600">Student</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 transition-colors group">
                <Calendar size={24} className="text-gray-400 group-hover:text-violet-600 transition-colors" />
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-violet-600">Event</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 transition-colors group">
                <Send size={24} className="text-gray-400 group-hover:text-amber-600 transition-colors" />
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-amber-600">Alert</span>
              </button>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="p-8 bg-white dark:bg-slate-950 rounded-4xl border border-gray-50 dark:border-slate-900 shadow-premium">
            <h3 className="text-lg font-bold dark:text-white mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex gap-4 relative">
                  {index !== recentActivity.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-gray-100 dark:bg-slate-800" />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    activity.status === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20' :
                    activity.status === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20' :
                    'bg-blue-100 text-blue-600 dark:bg-blue-500/20'
                  }`}>
                    {activity.status === 'success' ? <CheckCircle2 size={16} /> :
                     activity.status === 'warning' ? <AlertCircle size={16} /> :
                     <Clock size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{activity.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
              View All Activity
            </button>
          </div>

          {/* System Alert */}
          <div className="p-6 bg-linear-to-tr from-rose-500 to-orange-500 rounded-3xl text-white shadow-xl shadow-rose-500/30">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle size={20} />
              <h4 className="font-bold text-lg">System Alert</h4>
            </div>
            <p className="text-white/90 text-sm">3 students have reported issues with the study material download API.</p>
            <button className="mt-4 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold hover:bg-white/30 transition-all">
              Investigate Log
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
