import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Image, BookOpen, Video, ImageIcon, FileText, 
  Calendar, Bell, Rss, Download, Users, Star, GraduationCap, 
  Search, MessageCircle, Smartphone, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/hero-slider', label: 'Hero Slider', icon: Image },
  { path: '/courses', label: 'Course Management', icon: BookOpen },
  { path: '/demo-classes', label: 'Demo Classes', icon: Video },
  { path: '/gallery', label: 'Gallery', icon: ImageIcon },
  { path: '/blogs', label: 'Blogs', icon: FileText },
  { path: '/events', label: 'Events', icon: Calendar },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/latest-updates', label: 'Latest Updates', icon: Rss },
  { path: '/study-material', label: 'Study Material', icon: Download },
  { path: '/faculty', label: 'Faculty', icon: Users },
  { path: '/testimonials', label: 'Testimonials', icon: Star },
  { path: '/students', label: 'Students', icon: GraduationCap },
  { path: '/seo', label: 'SEO Settings', icon: Search },
  { path: '/whatsapp-settings', label: 'WhatsApp', icon: MessageCircle },
  { path: '/app-settings', label: 'Mobile App', icon: Smartphone },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed top-0 left-0 overflow-y-auto hidden-scrollbar">
      <div className="h-16 flex items-center justify-center border-b border-white/10 sticky top-0 bg-slate-900 z-10">
        <h1 className="font-bold text-xl tracking-wide text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm shadow-lg">JSC</span>
          Admin Panel
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
              {item.label}
            </Link>
          );
        })}
        
        <button
          onClick={() => {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            navigate('/admin/login');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300 mt-4"
        >
          <LogOut size={20} />
          Logout
        </button>
      </nav>
      <div className="p-4 border-t border-white/10 text-sm text-slate-500 sticky bottom-0 bg-slate-900">
        v1.0.0 &copy; 2026 JSC
      </div>
    </aside>
  );
};

export default Sidebar;
