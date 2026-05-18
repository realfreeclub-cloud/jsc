import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

export interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Placed in the scrollable body */
  children: React.ReactNode;
  /** Always-visible footer — Cancel + Submit buttons go here */
  footer: React.ReactNode;
  maxWidth?: number | string;
}

/**
 * Universal portal-based drawer for the JSC Admin Panel.
 *
 * Renders via ReactDOM.createPortal directly on document.body so it is
 * completely unaffected by any ancestor CSS transforms (including those
 * applied by Framer Motion's <motion.div> in AdminLayout).
 *
 * Layout guarantee:
 *   Header  → flexShrink:0          — never scrolls
 *   Body    → flex:1, overflow auto — ONLY scrollable zone
 *   Footer  → flexShrink:0, sticky  — ALWAYS visible
 */
const AppDrawer: React.FC<AppDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 620,
}) => {
  /* Lock body scroll while open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    /* z-index:60 — above Sidebar (z-50) but below any higher-priority toasts */
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', justifyContent: 'flex-end' }}>

      {/* Dimmed overlay — click outside to close */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(7,21,47,0.55)',
          backdropFilter: 'blur(5px)',
        }}
      />

      {/* ─── Drawer Panel ─────────────────────────────────────────────────── */}
      {/* Uses className="app-drawer-panel" for the 100dvh rule in index.css  */}
      <div
        className="app-drawer-panel"
        style={{
          position: 'relative',         /* sits above the overlay */
          zIndex: 50,
          width: '100%',
          maxWidth,
          background: '#fff',
          borderLeft: '1px solid #EEF1F8',
          boxShadow: '-8px 0 48px rgba(7,21,47,0.20)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',            /* clips children to 100dvh — CRITICAL */
        }}
      >
        {/* ── HEADER — flexShrink:0 so it never scrolls ─────────────────── */}
        <div
          style={{
            flexShrink: 0,
            background: 'linear-gradient(135deg,#07152F 0%,#0B1D3A 100%)',
            padding: '22px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.01em',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', marginTop: 4, marginBottom: 0 }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            style={{
              flexShrink: 0,
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10,
              padding: 8,
              color: 'rgba(255,255,255,0.70)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244,180,0,0.20)';
              (e.currentTarget as HTMLButtonElement).style.color = '#F4B400';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.10)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.70)';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ── BODY — THE ONLY SCROLLABLE SECTION ────────────────────────── */}
        {/* flex:1           → takes all remaining height between header & footer */}
        {/* minHeight:0      → MANDATORY in flex; without this flex children    */}
        {/*                    can overflow and push footer off-screen           */}
        {/* overflowY:auto   → internal scroll ONLY for this section            */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            padding: 28,
            background: '#fff',
          }}
        >
          {children}
        </div>

        {/* ── FOOTER — always visible, NEVER scrolls ────────────────────── */}
        {/* flexShrink:0     → will NOT be compressed by the body             */}
        {/* position:sticky  → extra insurance on any browser quirk           */}
        {/* bottom:0         → anchored to the bottom of the panel            */}
        <div
          style={{
            flexShrink: 0,
            position: 'sticky',
            bottom: 0,
            zIndex: 20,
            background: '#F5F7FB',
            borderTop: '2px solid #EEF1F8',
            padding: '18px 28px',
          }}
        >
          {footer}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AppDrawer;
