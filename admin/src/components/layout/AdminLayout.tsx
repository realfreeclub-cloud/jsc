import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion } from 'framer-motion';
import { useSidebar } from '../../store/useSidebar';
import { cn } from '../../utils/cn';

const AdminLayout = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar />
      
      <motion.div
        animate={{ 
          paddingLeft: isCollapsed ? '80px' : '280px' 
        }}
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        )}
      >
        <Header />
        
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        <footer className="py-6 px-8 border-t border-gray-100 dark:border-slate-900 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Judicial Study Centre. Premium Admin Panel.
          </p>
        </footer>
      </motion.div>
    </div>
  );
};

export default AdminLayout;
