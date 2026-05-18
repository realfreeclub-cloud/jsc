import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  FileText,
  Camera,
  Calendar,
  MonitorPlay,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Clock,
  Briefcase,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const NAVY = '#07152F';
const GOLD = '#F4B400';
const GOLD_LIGHT = '#FFD24C';

const stats = [
  { name: 'Total Students', value: '2,845', change: '+12.5%', trend: 'up', icon: Users, color: '#2563EB', bg: '#EFF6FF' },
  { name: 'Total Faculty', value: '42', change: '+2', trend: 'up', icon: Briefcase, color: '#7C3AED', bg: '#F5F3FF' },
  { name: 'Total Courses', value: '31', change: '0', trend: 'neutral', icon: BookOpen, color: '#059669', bg: '#ECFDF5' },
  { name: 'Total Blogs', value: '156', change: '+12', trend: 'up', icon: FileText, color: '#D97706', bg: '#FFFBEB' },
  { name: 'Gallery Images', value: '840', change: '+45', trend: 'up', icon: Camera, color: '#DC2626', bg: '#FEF2F2' },
  { name: 'Total Events', value: '24', change: '-1', trend: 'down', icon: Calendar, color: '#9333EA', bg: '#FAF5FF' },
  { name: 'Demo Classes', value: '128', change: '+18%', trend: 'up', icon: MonitorPlay, color: '#0891B2', bg: '#ECFEFF' },
  { name: 'WhatsApp Leads', value: '4,521', change: '+32.4%', trend: 'up', icon: MessageSquare, color: '#16A34A', bg: '#F0FDF4' },
];

const trafficData = [
  { name: 'Jan', organic: 4000, social: 2400 },
  { name: 'Feb', organic: 3000, social: 1398 },
  { name: 'Mar', organic: 2000, social: 9800 },
  { name: 'Apr', organic: 2780, social: 3908 },
  { name: 'May', organic: 1890, social: 4800 },
  { name: 'Jun', organic: 2390, social: 3800 },
  { name: 'Jul', organic: 3490, social: 4300 },
];

const deviceData = [
  { name: 'Mobile', value: 65, color: GOLD },
  { name: 'Desktop', value: 25, color: '#163059' },
  { name: 'Tablet', value: 10, color: GOLD_LIGHT },
];

const recentActivity = [
  { id: 1, student: 'Rahul Sharma', action: 'Registered for MP Civil Judge Demo', date: 'Today, 10:30 AM', status: 'New Lead', statusColor: { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' } },
  { id: 2, student: 'Priya Verma', action: 'Submitted Admission Form', date: 'Today, 09:15 AM', status: 'Pending', statusColor: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' } },
  { id: 3, student: 'Amit Singh', action: 'Fee Payment Successful', date: 'Yesterday, 04:45 PM', status: 'Completed', statusColor: { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' } },
  { id: 4, student: 'Sneha Gupta', action: 'Downloaded CrPC Study Notes', date: 'Yesterday, 02:20 PM', status: 'Active', statusColor: { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' } },
  { id: 5, student: 'Vikram AD', action: 'WhatsApp Inquiry Generated', date: '12 May, 11:10 AM', status: 'Follow Up', statusColor: { bg: '#FAF5FF', color: '#9333EA', border: '#E9D5FF' } },
];

const fadeCard = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 40 }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: '-0.02em' }}>
            Dashboard Overview
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-navy-400)', marginTop: 4 }}>
            Welcome back! Here is the latest data for Judicial Study Centre.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            style={{
              background: '#fff',
              border: '1.5px solid var(--color-navy-200)',
              color: 'var(--color-navy-700)',
              fontSize: 13,
              borderRadius: 10,
              padding: '8px 14px',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
          <button className="btn-gold" style={{ padding: '9px 18px', fontSize: 13 }}>
            <TrendingUp size={15} />
            Generate Report
          </button>
        </div>
      </div>

      {/* ── 8 Stat Cards ── */}
      <div
        className="stagger"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 18,
        }}
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.name}
            variants={fadeCard}
            initial="initial"
            animate="animate"
            transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="jsc-card jsc-stat-card animate-fade-up"
            style={{ padding: 22, position: 'relative', overflow: 'hidden' }}
          >
            {/* Soft bg circle */}
            <div
              style={{
                position: 'absolute',
                right: -20,
                top: -20,
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: stat.bg,
                opacity: 0.7,
                transition: 'transform 0.4s',
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: stat.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                    border: `1px solid ${stat.bg}`,
                  }}
                >
                  <stat.icon size={21} strokeWidth={2.2} />
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 99,
                    background:
                      stat.trend === 'up'
                        ? '#ECFDF5'
                        : stat.trend === 'down'
                        ? '#FEF2F2'
                        : '#F8FAFC',
                    color:
                      stat.trend === 'up'
                        ? '#059669'
                        : stat.trend === 'down'
                        ? '#DC2626'
                        : '#64748b',
                  }}
                >
                  {stat.trend === 'up' && <ArrowUpRight size={12} />}
                  {stat.trend === 'down' && <ArrowDownRight size={12} />}
                  {stat.change}
                </span>
              </div>

              <p style={{ fontSize: 13, color: 'var(--color-navy-400)', fontWeight: 500, marginBottom: 4 }}>
                {stat.name}
              </p>
              <p style={{ fontSize: 26, fontWeight: 800, color: NAVY, letterSpacing: '-0.02em' }}>
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Area Chart */}
        <div className="jsc-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Platform Traffic</h2>
              <p style={{ fontSize: 12.5, color: 'var(--color-navy-400)', marginTop: 2 }}>Organic vs Social Media Leads</p>
            </div>
            <button
              style={{
                padding: 7,
                borderRadius: 8,
                border: '1.5px solid var(--color-navy-100)',
                background: 'transparent',
                color: 'var(--color-navy-400)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <MoreVertical size={17} />
            </button>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="gOrganic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={NAVY} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={NAVY} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSocial" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GOLD} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#EEF1F8" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#AAB3C5', fontSize: 12, fontWeight: 500 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#AAB3C5', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #EEF1F8',
                    borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(7,21,47,0.10)',
                    fontSize: 13,
                  }}
                  itemStyle={{ color: NAVY, fontWeight: 600 }}
                  cursor={{ stroke: '#EEF1F8', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="organic" name="Organic" stroke={NAVY} strokeWidth={2.5} fill="url(#gOrganic)" />
                <Area type="monotone" dataKey="social" name="Social" stroke={GOLD} strokeWidth={2.5} fill="url(#gSocial)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center' }}>
            {[{ label: 'Organic', color: NAVY }, { label: 'Social Media', color: GOLD }].map((l) => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--color-navy-500)', fontWeight: 500 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="jsc-card" style={{ padding: 28, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Traffic Source</h2>
              <p style={{ fontSize: 12.5, color: 'var(--color-navy-400)', marginTop: 2 }}>Device distribution</p>
            </div>
            <button style={{ padding: 7, borderRadius: 8, border: '1.5px solid var(--color-navy-100)', background: 'transparent', color: 'var(--color-navy-400)', cursor: 'pointer' }}>
              <MoreVertical size={17} />
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={84}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: '1px solid #EEF1F8', boxShadow: '0 8px 24px rgba(7,21,47,0.10)', fontSize: 13 }}
                    itemStyle={{ color: NAVY, fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
              {deviceData.map((item) => (
                <div key={item.name} style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center', marginBottom: 3 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                    <span style={{ fontSize: 11.5, color: 'var(--color-navy-400)', fontWeight: 500 }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Activity Table ── */}
      <div className="jsc-card" style={{ overflow: 'hidden' }}>
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-navy-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Recent Leads & Activity</h2>
            <p style={{ fontSize: 12.5, color: 'var(--color-navy-400)', marginTop: 2 }}>Latest actions across all modules</p>
          </div>
          <button
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--color-gold-600)',
              background: 'var(--color-gold-dim)',
              border: '1px solid rgba(244,180,0,0.20)',
              borderRadius: 8,
              padding: '6px 14px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Activity size={14} />
            View All
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="jsc-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Student</th>
                <th style={{ textAlign: 'left' }}>Action</th>
                <th style={{ textAlign: 'left' }}>Date & Time</th>
                <th style={{ textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, var(--color-navy-800), var(--color-navy-700))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: GOLD,
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {a.student[0]}
                      </div>
                      <span style={{ fontWeight: 600, color: NAVY, fontSize: 13.5 }}>{a.student}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-navy-600)', maxWidth: 280 }}>{a.action}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-navy-400)', fontSize: 12.5 }}>
                      <Clock size={13} />
                      {a.date}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 10px',
                        borderRadius: 99,
                        fontSize: 11.5,
                        fontWeight: 700,
                        background: a.statusColor.bg,
                        color: a.statusColor.color,
                        border: `1px solid ${a.statusColor.border}`,
                      }}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
