import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Image, 
  FileText, 
  Camera, 
  Calendar, 
  Zap,
  BookOpen,
  MonitorPlay,
  Download,
  Users,
  GraduationCap,
  Globe,
  Bell,
  MessageSquare,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSidebar } from '../../store/useSidebar';

const navigation = [
  {
    group: 'Dashboard',
    items: [
      { name: 'Overview', path: '/', icon: LayoutDashboard },
      { name: 'Analytics', path: '/analytics', icon: Zap },
      { name: 'Reports', path: '/reports', icon: FileText },
    ]
  },
  {
    group: 'Content Management',
    items: [
      { name: 'Hero Slider', path: '/hero-slider', icon: Image },
      { name: 'Blogs', path: '/blogs', icon: FileText },
      { name: 'Gallery', path: '/gallery', icon: Camera },
      { name: 'Events', path: '/events', icon: Calendar },
      { name: 'Announcements', path: '/notifications', icon: Bell },
    ]
  },
  {
    group: 'Academics',
    items: [
      { name: 'Courses', path: '/courses', icon: BookOpen },
      { name: 'Batch Management', path: '/batches', icon: Users },
      { name: 'Demo Classes', path: '/demo-classes', icon: MonitorPlay },
      { name: 'Study Material', path: '/study-material', icon: Download },
      { name: 'Test Series', path: '/test-series', icon: FileText },
      { name: 'Question Bank', path: '/questions', icon: BookOpen },
      { name: 'Assignments', path: '/assignments', icon: FileText },
      { name: 'Attendance', path: '/academic-attendance', icon: Calendar },
    ]
  },
  {
    group: 'Student Management',
    items: [
      { name: 'Students', path: '/students', icon: GraduationCap },
      { name: 'Admissions', path: '/admissions', icon: Users },
      { name: 'Fee Management', path: '/fees', icon: Zap },
      { name: 'ID Cards', path: '/id-cards', icon: Image },
      { name: 'Certificates', path: '/certificates', icon: FileText },
      { name: 'Performance Tracking', path: '/performance', icon: Zap },
    ]
  },
  {
    group: 'Faculty Management',
    items: [
      { name: 'Faculty', path: '/faculty', icon: Users },
      { name: 'Salary', path: '/salary', icon: Zap },
      { name: 'Attendance', path: '/faculty-attendance', icon: Calendar },
      { name: 'Lecture Scheduling', path: '/scheduling', icon: Calendar },
    ]
  },
  {
    group: 'Marketing & SEO',
    items: [
      { name: 'SEO Settings', path: '/seo', icon: Globe },
      { name: 'Meta Tags', path: '/meta-tags', icon: Globe },
      { name: 'Social Media', path: '/social-media', icon: Globe },
      { name: 'WhatsApp Leads', path: '/whatsapp-settings', icon: MessageSquare },
      { name: 'Email Campaigns', path: '/email-campaigns', icon: MessageSquare },
    ]
  },
  {
    group: 'System',
    items: [
      { name: 'Roles & Permissions', path: '/roles', icon: ShieldCheck },
      { name: 'Admin Users', path: '/admins', icon: ShieldCheck },
      { name: 'Settings', path: '/app-settings', icon: Settings },
      { name: 'API Config', path: '/api-config', icon: Settings },
      { name: 'Backup & Security', path: '/security', icon: ShieldCheck },
    ]
  }
];

const Sidebar = () => {
  const { isCollapsed, toggle } = useSidebar();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNavigation = navigation.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className={cn(
        "fixed left-0 top-0 h-screen z-50 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out shadow-sm",
        "dark:bg-slate-950 dark:border-slate-800"
      )}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 justify-between border-b border-gray-50 dark:border-slate-900">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                J
              </div>
              <span className="font-bold text-xl tracking-tight dark:text-white">JSC Admin</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-900 text-gray-500"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="px-4 py-4">
          <div className="relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto hidden-scrollbar py-4 px-3 space-y-8">
        {filteredNavigation.map((group) => (
          <div key={group.group} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                {group.group}
              </h3>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                  isActive 
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-600/10 dark:text-blue-500 dark:shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-900 dark:hover:text-white"
                )}
              >
                <item.icon size={20} className={cn(
                  "shrink-0",
                  location.pathname === item.path ? "text-blue-600 dark:text-blue-500" : "group-hover:scale-110 transition-transform"
                )} />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Logout Section */}
      <div className="p-4 border-t border-gray-50 dark:border-slate-900">
        <button className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors",
          isCollapsed && "justify-center"
        )}>
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
