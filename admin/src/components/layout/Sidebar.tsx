import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useSidebar } from '../../store/useSidebar';

const navigation = [
  {
    group: 'Dashboard',
    items: [{ name: 'Overview', path: '/', icon: LayoutDashboard }],
  },
  {
    group: 'Content',
    items: [
      { name: 'Hero Slider', path: '/hero-slider', icon: Image },
      { name: 'Blogs', path: '/blogs', icon: FileText },
      { name: 'Gallery', path: '/gallery', icon: Camera },
      { name: 'Events', path: '/events', icon: Calendar },
      { name: 'Announcements', path: '/notifications', icon: Bell },
    ],
  },
  {
    group: 'Academics',
    items: [
      { name: 'Courses', path: '/courses', icon: BookOpen },
      { name: 'Enrollments', path: '/enrollments', icon: GraduationCap },
      { name: 'Study Material', path: '/study-material', icon: Download },
      { name: 'Demo Classes', path: '/demo-classes', icon: MonitorPlay },
      { name: 'Demo Sessions', path: '/demo-sessions', icon: MonitorPlay },
      { name: 'Course Leads', path: '/leads', icon: Users },
      { name: 'Question Bank', path: '/question-bank', icon: FileText },
      { name: 'Test Series', path: '/exams', icon: FileText },
      { name: 'Test Approvals', path: '/test-enrollments', icon: GraduationCap },
    ],
  },
  {
    group: 'People',
    items: [
      { name: 'Students', path: '/students', icon: GraduationCap },
      { name: 'Faculty', path: '/faculty', icon: Users },
    ],
  },
  {
    group: 'Marketing & SEO',
    items: [
      { name: 'SEO Dashboard', path: '/seo-dashboard', icon: Zap },
      { name: 'SEO Settings', path: '/seo-settings', icon: Globe },
      { name: 'Meta Tags', path: '/meta-tags', icon: Globe },
      { name: 'Social Media', path: '/social-media', icon: Globe },
      { name: 'WhatsApp Leads', path: '/whatsapp-leads', icon: MessageSquare },
    ],
  },
];

const Sidebar = () => {
  const { isCollapsed, toggle } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredNavigation = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 268 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="jsc-sidebar fixed left-0 top-0 h-screen z-20 flex flex-col overflow-hidden"
    >
      {/* ── Logo Row ── */}
      <div className="jsc-sidebar-logo h-[68px] flex items-center px-4 justify-between shrink-0">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              {/* Gold J badge */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg,#F4B400,#FFD24C)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontWeight: 700,
                  fontSize: 18,
                  color: '#07152F',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(244,180,0,0.35)',
                }}
              >
                J
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                  JSC Admin
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Control Panel
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isCollapsed && (
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#F4B400,#FFD24C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Playfair Display, Georgia, serif',
              fontWeight: 700, fontSize: 18, color: '#07152F',
              boxShadow: '0 2px 8px rgba(244,180,0,0.35)',
            }}
          >
            J
          </div>
        )}

        <button className="jsc-sidebar-toggle ml-auto" onClick={toggle}>
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* ── Search ── */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="jsc-sidebar-search px-4 pt-3 pb-1 shrink-0"
          >
            <div className="relative">
              <Search
                size={14}
                style={{
                  position: 'absolute', left: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.35)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Quick search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 30, paddingRight: 10, paddingTop: 8, paddingBottom: 8, fontSize: 13 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation ── */}
      <div
        className="hidden-scrollbar flex-1 overflow-y-auto py-4 px-3 space-y-6"
        style={{ marginTop: isCollapsed ? 8 : 4 }}
      >
        {filteredNavigation.map((group) => (
          <div key={group.group} className="space-y-0.5">
            {!isCollapsed && (
              <div className="jsc-nav-group-label mb-2">{group.group}</div>
            )}
            {isCollapsed && (
              <div
                style={{
                  width: '100%',
                  height: 1,
                  background: 'rgba(255,255,255,0.06)',
                  marginBottom: 8,
                  marginTop: 4,
                }}
              />
            )}

            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `jsc-nav-item group${isActive ? ' active' : ''}${isCollapsed ? ' justify-center' : ''}`
                }
                style={isCollapsed ? { paddingLeft: 0, paddingRight: 0, justifyContent: 'center' } : {}}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon size={17} className="jsc-nav-icon" />

                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      style={{ fontSize: 13.5 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="jsc-tooltip">{item.name}</div>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* ── Footer / Logout ── */}
      <div className="jsc-sidebar-footer p-3 shrink-0">
        {!isCollapsed && (
          <div
            style={{
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.06)',
              marginBottom: 10,
            }}
          >
            <div style={{ color: 'rgba(255,255,255,0.50)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
              Logged in as
            </div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>System Admin</div>
            <div style={{ color: 'var(--color-gold-400)', fontSize: 11, fontWeight: 500 }}>Super Admin</div>
          </div>
        )}

        <button
          className="jsc-logout-btn"
          onClick={handleLogout}
          style={isCollapsed ? { justifyContent: 'center', paddingLeft: 0, paddingRight: 0 } : {}}
        >
          <LogOut size={17} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
