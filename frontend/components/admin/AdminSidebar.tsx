'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const C = {
  // Same sky→green gradient as OwnerSidebar
  sidebarBg:
    'linear-gradient(180deg, #5bafd6 0%, #4a9ec4 30%, #5aab35 72%, #3d8c1e 100%)',
  surface1: 'rgba(255,255,255,0.18)',

  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.78)',
  textMuted: 'rgba(255,255,255,0.48)',

  border1: 'rgba(255,255,255,0.22)',

  yellow: '#ffe135',
  orange: '#ff8c00',
  brownDarker: '#4a2511',

  activeBg: 'linear-gradient(90deg, #ffe135, #ff8c00)',
  activeColor: '#4a2511',
  hoverBg: 'rgba(255,255,255,0.15)',
};

export const NAV_ITEMS = [
  {
    name: 'Dashboard',
    route: '/admin/dashboard',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    name: 'Franchisee Orders',
    route: '/admin/orders',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    name: 'Products',
    route: '/admin/products',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
];

export function AdminSidebar({
  sidebarOpen,
  activeNav,
  onNav,
  adminName,
  onCreateAccount,
}: {
  sidebarOpen: boolean;
  activeNav: string;
  onNav: (route: string) => void;
  adminName: string;
  onCreateAccount: () => void;
}) {
  return (
    <aside
      style={{
        width: sidebarOpen ? 256 : 72,
        background: C.sidebarBg,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.28s cubic-bezier(.4,0,.2,1)',
        flexShrink: 0,
        boxShadow: '4px 0 24px rgba(0,80,40,0.18)',
        zIndex: 10,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          padding: '22px 14px 18px',
          borderBottom: `1px solid ${C.border1}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div
            style={{
              width: 44,
              height: 44,
              flexShrink: 0,
              background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              boxShadow: '0 4px 14px rgba(255,140,0,0.38)',
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            🥭
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  color: C.textPrimary,
                  letterSpacing: '0.2px',
                  lineHeight: 1.2,
                  textShadow: '0 1px 4px rgba(0,0,0,0.15)',
                }}
              >
                Machi Mango
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: C.textSecondary,
                  fontWeight: 500,
                  marginTop: 2,
                }}
              >
                HQ Control Center
              </div>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <button
            onClick={() => onNav('')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: C.textMuted,
              display: 'flex',
              alignItems: 'center',
              padding: 4,
              borderRadius: 6,
              flexShrink: 0,
              transition: 'color .18s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.textPrimary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
        {sidebarOpen && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: C.textMuted,
              padding: '6px 12px 8px',
            }}
          >
            Main Menu
          </div>
        )}

        {NAV_ITEMS.map((item) => {
          const active = activeNav === item.name;
          return (
            <button
              key={item.name}
              onClick={() => onNav(item.route)}
              title={!sidebarOpen ? item.name : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: sidebarOpen ? '10px 13px' : '10px 0',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                borderRadius: 11,
                marginBottom: 3,
                border: active
                  ? '1.5px solid rgba(255,225,53,0.55)'
                  : '1.5px solid transparent',
                cursor: 'pointer',
                background: active ? C.activeBg : 'transparent',
                color: active ? C.activeColor : C.textSecondary,
                fontWeight: active ? 700 : 500,
                fontSize: 13.5,
                fontFamily: "'Poppins', sans-serif",
                boxShadow: active ? '0 3px 12px rgba(255,140,0,0.28)' : 'none',
                transition: 'all 0.17s ease',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = C.hoverBg;
                  e.currentTarget.style.color = C.textPrimary;
                  e.currentTarget.style.borderColor = C.border1;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = C.textSecondary;
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && (
                <span style={{ flex: 1, textAlign: 'left' }}>{item.name}</span>
              )}
            </button>
          );
        })}

        {/* ── Administration section ── */}
        {sidebarOpen && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: C.textMuted,
              padding: '14px 12px 8px',
            }}
          >
            Administration
          </div>
        )}
        <button
          onClick={onCreateAccount}
          title="Create Account"
          style={{
            width: sidebarOpen ? '100%' : 42,
            margin: sidebarOpen ? '2px 0 8px' : '4px auto 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            gap: 10,
            padding: sidebarOpen ? '11px 13px' : '10px 0',
            borderRadius: 11,
            border: '2px dashed rgba(255,255,255,0.35)',
            background: 'rgba(255,255,255,0.10)',
            color: C.textPrimary,
            fontWeight: 600,
            fontSize: 13.5,
            fontFamily: "'Poppins', sans-serif",
            cursor: 'pointer',
            transition: 'all .18s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.22)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              flexShrink: 0,
              background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.brownDarker,
              fontSize: 17,
              fontWeight: 800,
              boxShadow: '0 2px 6px rgba(255,140,0,0.35)',
            }}
          >
            +
          </div>
          {sidebarOpen && <span>Create Account</span>}
        </button>
      </nav>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: C.border1, margin: '0 10px' }} />

      {/* ── User card ── */}
      <div style={{ padding: '12px 10px 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 12,
            background: C.surface1,
            border: `1px solid ${C.border1}`,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.brownDarker,
              fontFamily: "'Fredoka', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 2px 8px rgba(255,140,0,0.35)',
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            {adminName.charAt(0).toUpperCase()}
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: C.textPrimary,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {adminName}
              </div>
              <div
                style={{ fontSize: 11, color: C.textSecondary, marginTop: 1 }}
              >
                HQ Administrator
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Standalone collapsible wrapper — drop-in replacement for pages
   that manage their own sidebarOpen state (dashboard, orders, products)
───────────────────────────────────────────────────────────────── */
export default function AdminSidebarWrapper({
  activeNav,
  adminName,
  onCreateAccount,
  onNav,
}: {
  activeNav: string;
  adminName: string;
  onCreateAccount: () => void;
  onNav: (route: string) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  return (
    <AdminSidebar
      sidebarOpen={open}
      activeNav={activeNav}
      adminName={adminName}
      onCreateAccount={onCreateAccount}
      onNav={(route) => {
        if (!route) {
          setOpen((v) => !v);
          return;
        }
        onNav(route);
        router.push(route);
      }}
    />
  );
}
