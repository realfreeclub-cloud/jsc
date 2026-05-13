import { Bell, Search, User, Sun, Moon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../store/useTheme';

const Header = () => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const path = location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <header className="sticky top-0 z-40 w-full h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-900 px-8 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
          {path}
        </h2>
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <span>Admin</span>
          <span>/</span>
          <span className="text-blue-500">{path}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Global Search Button */}
        <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl text-sm text-gray-400 hover:border-blue-500/50 transition-all">
          <Search size={16} />
          <span>Search command...</span>
          <kbd className="ml-4 px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-[10px] font-bold">⌘K</kbd>
        </button>

        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-950 rounded-full"></span>
          </button>
          
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors"
          >
            {isDarkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} />}
          </button>
        </div>

        <div className="h-8 w-px bg-gray-100 dark:bg-slate-900 mx-2" />

        <div className="flex items-center gap-4 pl-2 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">System Admin</p>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tighter">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
