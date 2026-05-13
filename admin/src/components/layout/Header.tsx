import { Bell, Search, User } from 'lucide-react';

const Header = () => {
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm sticky top-0 z-10 ml-64">
      <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search everywhere..." 
          className="bg-transparent border-none outline-none ml-2 text-sm w-full text-gray-700"
        />
      </div>
      
      <div className="flex items-center gap-6">
        <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{adminUser.name || 'Admin User'}</p>
            <p className="text-xs text-gray-500">{adminUser.email || 'admin@jsc.com'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 uppercase">
            {adminUser.name ? adminUser.name[0] : <User size={20} />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
