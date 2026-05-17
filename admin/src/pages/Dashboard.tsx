import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Camera, 
  Calendar, 
  MonitorPlay,
  MessageSquare,
  TrendingUp,
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  Briefcase
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Data mapping exactly to the 8 required metrics requested by the user
const stats = [
  { name: 'Total Students', value: '2,845', change: '+12.5%', trend: 'up', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Total Faculty', value: '42', change: '+2', trend: 'up', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { name: 'Total Courses', value: '31', change: '0', trend: 'neutral', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: 'Total Blogs', value: '156', change: '+12', trend: 'up', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'Gallery Images', value: '840', change: '+45', trend: 'up', icon: Camera, color: 'text-rose-600', bg: 'bg-rose-50' },
  { name: 'Total Events', value: '24', change: '-1', trend: 'down', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
  { name: 'Demo Classes', value: '128', change: '+18%', trend: 'up', icon: MonitorPlay, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { name: 'WhatsApp Leads', value: '4,521', change: '+32.4%', trend: 'up', icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50' },
];

const trafficData = [
  { name: 'Jan', organic: 4000, social: 2400 },
  { name: 'Feb', organic: 3000, social: 1398 },
  { name: 'Mar', organic: 2000, social: 9800 },
  { name: 'Apr', organic: 2780, social: 3908 },
  { name: 'May', organic: 1890, social: 4800 },
  { name: 'Jun', organic: 2390, social: 3800 },
  { name: 'Jul', organic: 3490, social: 4300 },
];

const deviceData = [
  { name: 'Mobile', value: 65, color: '#3b82f6' }, // blue-500
  { name: 'Desktop', value: 25, color: '#6366f1' }, // indigo-500
  { name: 'Tablet', value: 10, color: '#10b981' }, // emerald-500
];

const recentActivity = [
  { id: 1, student: "Rahul Sharma", action: "Registered for MP Civil Judge Demo", date: "Today, 10:30 AM", status: "New Lead", statusColor: "bg-blue-100 text-blue-700" },
  { id: 2, student: "Priya Verma", action: "Submitted Admission Form", date: "Today, 09:15 AM", status: "Pending Review", statusColor: "bg-amber-100 text-amber-700" },
  { id: 3, student: "Amit Singh", action: "Fee Payment Successful", date: "Yesterday, 04:45 PM", status: "Completed", statusColor: "bg-emerald-100 text-emerald-700" },
  { id: 4, student: "Sneha Gupta", action: "Downloaded Study Material (CrPC Notes)", date: "Yesterday, 02:20 PM", status: "Active", statusColor: "bg-gray-100 text-gray-700" },
  { id: 5, student: "Vikram AD", action: "WhatsApp Inquiry Generated", date: "12 May, 11:10 AM", status: "Follow Up", statusColor: "bg-purple-100 text-purple-700" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back! Here is the latest data for Judicial Study Centre.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none shadow-sm cursor-pointer">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-blue-500/20 transition-all flex items-center gap-2">
            <TrendingUp size={16} /> Generate Report
          </button>
        </div>
      </div>

      {/* 8 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group cursor-default relative overflow-hidden"
          >
            {/* Soft decorative background element */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-50 transition-transform group-hover:scale-150 duration-500 ${stat.bg}`} />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} shadow-sm`}>
                  <stat.icon size={22} strokeWidth={2.5} />
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  {stat.trend === 'up' ? (
                    <span className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <ArrowUpRight size={14} className="mr-0.5" /> {stat.change}
                    </span>
                  ) : stat.trend === 'down' ? (
                    <span className="flex items-center text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      <ArrowDownRight size={14} className="mr-0.5" /> {stat.change}
                    </span>
                  ) : (
                    <span className="flex items-center text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
                      {stat.change}
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.name}</h3>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Main Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Platform Traffic</h2>
              <p className="text-sm text-slate-500">Organic vs Social Media Leads</p>
            </div>
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSocial" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="organic" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorOrganic)" />
                <Area type="monotone" dataKey="social" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSocial)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Traffic Source</h2>
              <p className="text-sm text-slate-500">Device distribution</p>
            </div>
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col justify-center relative">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {deviceData.map((item) => (
                <div key={item.name} className="flex flex-col items-center text-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-xs font-medium text-slate-500">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Recent Leads & Activity</h2>
            <p className="text-sm text-slate-500">Latest actions across all modules</p>
          </div>
          <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            View All Activity
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User / Student</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentActivity.map((activity) => (
                <tr key={activity.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-800">{activity.student}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{activity.action}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Clock size={14} /> {activity.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${activity.statusColor}`}>
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
