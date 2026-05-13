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
  Zap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

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

const chartData = [
  { name: 'Jan', students: 400, revenue: 2400 },
  { name: 'Feb', students: 600, revenue: 1398 },
  { name: 'Mar', students: 500, revenue: 9800 },
  { name: 'Apr', students: 900, revenue: 3908 },
  { name: 'May', students: 1100, revenue: 4800 },
  { name: 'Jun', students: 1500, revenue: 3800 },
];

const Dashboard = () => {
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
            Export Data
          </button>
          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all">
            + New Course
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
            className="p-6 bg-white dark:bg-slate-950 rounded-3xl border border-gray-50 dark:border-slate-900 shadow-premium hover:shadow-premium-hover transition-all group"
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
        {/* Growth Chart */}
        <div className="lg:col-span-2 p-8 bg-white dark:bg-slate-950 rounded-3xl border border-gray-50 dark:border-slate-900 shadow-premium">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold dark:text-white">Student Enrollment Growth</h3>
            <select className="bg-gray-50 dark:bg-slate-900 border-none text-xs font-bold rounded-lg px-3 py-1.5 outline-none">
              <option>Last 6 Months</option>
              <option>Yearly</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="students" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorStudents)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold dark:text-white">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
            <button className="flex items-center gap-4 p-4 bg-white dark:bg-slate-950 rounded-2xl border border-gray-50 dark:border-slate-900 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all text-left">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-600/10 text-blue-600">
                <Plus size={20} />
              </div>
              <div>
                <p className="text-sm font-bold dark:text-white">New Course</p>
                <p className="text-xs text-gray-400">Launch a new study program</p>
              </div>
            </button>
            <button className="flex items-center gap-4 p-4 bg-white dark:bg-slate-950 rounded-2xl border border-gray-50 dark:border-slate-900 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all text-left">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-600/10 text-emerald-600">
                <Send size={20} />
              </div>
              <div>
                <p className="text-sm font-bold dark:text-white">Push Notification</p>
                <p className="text-xs text-gray-400">Alert students about updates</p>
              </div>
            </button>
            <button className="flex items-center gap-4 p-4 bg-white dark:bg-slate-950 rounded-2xl border border-gray-50 dark:border-slate-900 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all text-left">
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-600/10 text-violet-600">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-sm font-bold dark:text-white">Schedule Event</p>
                <p className="text-xs text-gray-400">Create a seminar or test</p>
              </div>
            </button>
            <button className="flex items-center gap-4 p-4 bg-white dark:bg-slate-950 rounded-2xl border border-gray-50 dark:border-slate-900 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all text-left">
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-600/10 text-orange-600">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-sm font-bold dark:text-white">Instant Alert</p>
                <p className="text-xs text-gray-400">Post to Marquee/Ticker</p>
              </div>
            </button>
          </div>

          <div className="p-6 bg-linear-to-tr from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-500/30">
            <h4 className="font-bold text-lg">System Update</h4>
            <p className="text-blue-100 text-sm mt-2">The new Student Portal API is now live. Check the logs for performance metrics.</p>
            <button className="mt-4 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold hover:bg-white/30 transition-all">
              View Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
