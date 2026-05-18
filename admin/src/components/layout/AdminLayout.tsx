import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion } from 'framer-motion';
import { useSidebar } from '../../store/useSidebar';

const AdminLayout = () => {
  const { isCollapsed } = useSidebar();

  // Always force light mode — JSC admin uses Navy+Gold light theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.style.backgroundColor = 'var(--color-navy-50, #F5F7FB)';
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-navy-50, #F5F7FB)' }}>
      <Sidebar />

      <motion.div
        animate={{ paddingLeft: isCollapsed ? 72 : 268 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <Header />

        <main style={{ flex: 1, padding: '28px 32px' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>

        <footer
          className="jsc-footer"
          style={{
            padding: '18px 32px',
            textAlign: 'center',
            fontSize: 13,
          }}
        >
          © {new Date().getFullYear()} Judicial Study Centre — Premium Admin Panel
        </footer>
      </motion.div>
    </div>
  );
};

export default AdminLayout;
