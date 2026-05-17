import { Bell, Search, User, Sun, Moon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../store/useTheme';

const Header = () => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const path = location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <header className="sticky top-0 z-40 w-full h-[72px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 px-6 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
          {path}
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
          <span>Admin</span>
          <span>/</span>
          <span className="text-blue-600">{path}</span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-sm text-slate-400 hover:bg-slate-100 transition-colors w-64 justify-between group">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            <span className="text-slate-500">Search here...</span>
          </div>
          <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-400">⌘K</kbd>
        </button>

        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-blue-600 dark:hover:bg-slate-900 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white dark:border-slate-950 rounded-full"></span>
          </button>
          
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-amber-500 dark:hover:bg-slate-900 transition-colors"
          >
            {isDarkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} />}
          </button>
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        <div className="flex items-center gap-3 pl-1 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">System Admin</p>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
