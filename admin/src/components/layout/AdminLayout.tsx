import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
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

      {/*
        Use a plain div with CSS transition instead of Framer Motion's <motion.div>.
        Framer Motion internally applies CSS transforms which create a new containing
        block for position:fixed children — this breaks ALL fixed-position overlays
        and drawers by making them position relative to this div instead of the screen.

        CSS transition on padding-left is visually identical but safe for fixed children.
      */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          paddingLeft: isCollapsed ? 72 : 268,
          transition: 'padding-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Header />

        <main style={{ flex: 1, padding: '28px 32px' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>

        <footer
          className="jsc-footer"
          style={{ padding: '18px 32px', textAlign: 'center', fontSize: 13 }}
        >
          © {new Date().getFullYear()} Judicial Study Centre — Premium Admin Panel
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
