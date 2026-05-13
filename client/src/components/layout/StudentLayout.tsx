import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Download, Bell, User } from 'lucide-react';

const StudentLayout = () => {
  const location = useLocation();
  const navItems = [
    { path: '/student/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/student/courses', icon: BookOpen, label: 'My Courses' },
    { path: '/student/materials', icon: Download, label: 'Materials' },
    { path: '/student/notifications', icon: Bell, label: 'Updates' },
    { path: '/student/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed h-screen bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary text-gold flex items-center justify-center font-bold text-xl">S</div>
            <div>
              <h3 className="font-bold text-slate-900">John Doe</h3>
              <p className="text-xs text-slate-500">Student Account</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Icon size={20} className={isActive ? 'text-gold' : ''} /> {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-50 pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-slate-400'}`}>
              <div className={`p-2 rounded-full ${isActive ? 'bg-primary/10' : ''}`}>
                <Icon size={20} className={isActive ? 'text-primary' : ''} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
