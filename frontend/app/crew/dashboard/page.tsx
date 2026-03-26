'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, getStoredToken, clearAuth } from '@/lib/auth';

const C = {
  brownDarker: '#3E1A00',
  brownDark: '#6B3A2A',
  brown: '#8B4513',
  yellow: '#F5C842',
  orange: '#FF8C00',
  green: '#5A9E3A',
  darkGreen: '#3D6E27',
  bg: '#F2EAD8',
};

export default function CrewDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeNav, setNav] = useState('Dashboard');

  useEffect(() => {
    const u = getStoredUser();
    const t = getStoredToken();
    if (!u || !t) {
      router.replace('/login');
      return;
    }
    if (u.role === 'hq_admin') {
      router.replace('/admin/dashboard');
      return;
    }
    if (u.role === 'franchise_owner' || u.role === 'franchisee') {
      router.replace('/owner/dashboard');
      return;
    }
    setUser(u);
    setTimeout(() => setLoaded(true), 80);
  }, [router]);

  if (!user) return null;

  const branchName = user.branchId ?? 'Your Branch';
  const firstName = user.fullName?.split(' ')[0] ?? 'there';

  const quickLinks = [
    {
      label: 'View Product List',
      icon: '📦',
      desc: 'Browse all available products',
      route: '/owner/products',
    },
    {
      label: 'Check Stock Levels',
      icon: '📊',
      desc: 'View current inventory levels',
      route: '/owner/products',
    },
    {
      label: 'See Product Prices',
      icon: '💰',
      desc: 'View current pricing information',
      route: '/owner/products',
    },
  ];

  const tasks = [
    { label: 'Morning inventory check', done: false, priority: 'high' },
    { label: 'Prepare opening station setup', done: false, priority: 'high' },
    { label: 'Review daily menu board', done: true, priority: 'medium' },
    { label: 'Restock condiment station', done: false, priority: 'medium' },
    { label: 'End-of-day stock count', done: false, priority: 'low' },
  ];

  const perms = [
    { label: 'View Dashboard', ok: true },
    { label: 'View Products', ok: true },
    { label: 'Edit Products', ok: false },
    { label: 'View Analytics', ok: false },
    { label: 'Manage Branches', ok: false },
    { label: 'Create Accounts', ok: false },
  ];

  const navItems = [
    {
      name: 'Dashboard',
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
      name: 'Products',
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
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: C.bg,
        overflow: 'hidden',
        fontFamily: "'Segoe UI',system-ui,sans-serif",
      }}
    >
      {/* Slim sidebar */}
      <aside
        style={{
          width: 72,
          background: `linear-gradient(180deg,${C.brownDarker},${C.brownDark})`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          boxShadow: '4px 0 24px rgba(62,26,0,.18)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: '20px 14px',
            borderBottom: '1px solid rgba(245,200,66,.2)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              boxShadow: '0 4px 12px rgba(255,140,0,.4)',
            }}
          >
            🥭
          </div>
        </div>
        <nav
          style={{
            flex: 1,
            padding: '16px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {navItems.map((item) => {
            const active = activeNav === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setNav(item.name);
                  if (item.name === 'Products') router.push('/owner/products');
                }}
                title={item.name}
                style={{
                  width: '100%',
                  padding: '11px 0',
                  display: 'flex',
                  justifyContent: 'center',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  background: active
                    ? `linear-gradient(90deg,${C.yellow},${C.orange})`
                    : 'transparent',
                  color: active ? C.brownDarker : 'rgba(245,200,66,.65)',
                  marginBottom: 3,
                  transition: 'all .18s',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(245,200,66,.1)';
                    e.currentTarget.style.color = C.yellow;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(245,200,66,.65)';
                  }
                }}
              >
                <span style={{ color: active ? C.brownDarker : 'inherit' }}>
                  {item.icon}
                </span>
              </button>
            );
          })}
        </nav>
        <div
          style={{
            padding: '14px 10px',
            borderTop: '1px solid rgba(245,200,66,.2)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: `linear-gradient(135deg,${C.green},${C.darkGreen})`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
            }}
            title={user.fullName}
          >
            {user.fullName?.charAt(0).toUpperCase()}
          </div>
        </div>
      </aside>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* Header */}
        <header
          style={{
            background: '#fff',
            borderBottom: `3px solid ${C.yellow}`,
            padding: '0 28px',
            height: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            boxShadow: '0 2px 12px rgba(0,0,0,.07)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{ fontWeight: 800, fontSize: 19, color: C.brownDark }}
              >
                Crew Dashboard
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: '#E8F5E1',
                  color: '#3D6E27',
                  fontSize: 10,
                  fontWeight: 800,
                  border: '1.5px solid #5A9E3A',
                  textTransform: 'uppercase',
                  letterSpacing: '.04em',
                }}
              >
                👷 Crew Member
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: C.green,
                fontWeight: 600,
                marginTop: 1,
              }}
            >
              {branchName}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                padding: '7px 14px',
                borderRadius: 10,
                background: '#E8F5E1',
                border: `1.5px solid ${C.green}`,
                fontSize: 11,
                fontWeight: 700,
                color: C.darkGreen,
              }}
            >
              👋 Hi, {firstName}!
            </div>
            <button
              onClick={() => {
                clearAuth();
                router.replace('/login');
              }}
              style={{
                padding: '9px 20px',
                background: `linear-gradient(135deg,${C.brownDark},${C.brownDarker})`,
                color: C.yellow,
                border: '2px solid rgba(245,200,66,.4)',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = C.yellow)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = 'rgba(245,200,66,.4)')
              }
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Body */}
        <main
          style={{ flex: 1, overflowY: 'auto', padding: 28, background: C.bg }}
        >
          {/* Welcome banner */}
          <div
            style={{
              background: `linear-gradient(135deg,${C.brownDarker},${C.brownDark})`,
              borderRadius: 18,
              padding: '20px 28px',
              marginBottom: 24,
              border: '2px solid rgba(245,200,66,.2)',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: C.yellow }}>
              Good day, {firstName}! 🥭
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'rgba(245,200,66,.7)',
                marginTop: 4,
              }}
            >
              {branchName} ·{' '}
              {new Date().toLocaleDateString('en-PH', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}
          >
            {/* Quick Links */}
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: '22px',
                boxShadow: '0 2px 12px rgba(0,0,0,.07)',
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 16,
                  color: C.brownDark,
                  marginBottom: 16,
                }}
              >
                Quick Access
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                {quickLinks.map((link, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(link.route)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1.5px solid #E5D9C8',
                      background: '#FDFAF4',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all .18s',
                      opacity: loaded ? 1 : 0,
                      transform: loaded ? 'translateY(0)' : 'translateY(10px)',
                      transitionDelay: `${i * 0.07}s`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        C.yellow;
                      (e.currentTarget as HTMLElement).style.background =
                        '#FFFAE0';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        '#E5D9C8';
                      (e.currentTarget as HTMLElement).style.background =
                        '#FDFAF4';
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 11,
                        background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      {link.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: C.brownDarker,
                        }}
                      >
                        {link.label}
                      </div>
                      <div
                        style={{ fontSize: 11, color: '#AAA', marginTop: 1 }}
                      >
                        {link.desc}
                      </div>
                    </div>
                    <svg
                      style={{ color: '#CCC' }}
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: '22px',
                boxShadow: '0 2px 12px rgba(0,0,0,.07)',
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 16,
                  color: C.brownDark,
                  marginBottom: 16,
                }}
              >
                Today&apos;s Tasks
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tasks.map((task, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: task.done ? '#E8F5E1' : '#FDFAF4',
                      border: `1.5px solid ${task.done ? C.green : '#E5D9C8'}`,
                      opacity: loaded ? 1 : 0,
                      transition: `opacity .4s ${i * 0.06}s`,
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: task.done ? C.green : '#E5D9C8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {task.done && (
                        <svg
                          width="10"
                          height="10"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: task.done ? C.darkGreen : C.brownDark,
                        textDecoration: task.done ? 'line-through' : 'none',
                        flex: 1,
                      }}
                    >
                      {task.label}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 6,
                        background:
                          task.priority === 'high'
                            ? '#FFEBEE'
                            : task.priority === 'medium'
                              ? '#FFF0D9'
                              : '#E8F5E1',
                        color:
                          task.priority === 'high'
                            ? '#C62828'
                            : task.priority === 'medium'
                              ? '#CC7000'
                              : C.darkGreen,
                      }}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Permissions summary - full width */}
            <div
              style={{
                gridColumn: '1 / -1',
                background: '#fff',
                borderRadius: 16,
                padding: '22px',
                boxShadow: '0 2px 12px rgba(0,0,0,.07)',
                border: `2px solid ${C.yellow}30`,
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 14,
                  color: C.brownDark,
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Your Access Level — Crew Member
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3,1fr)',
                  gap: 10,
                }}
              >
                {perms.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '9px 12px',
                      borderRadius: 9,
                      background: p.ok ? '#E8F5E1' : '#FDFAF4',
                      border: `1.5px solid ${p.ok ? C.green + '50' : '#E5D9C8'}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: p.ok ? C.darkGreen : '#C62828',
                        flexShrink: 0,
                      }}
                    >
                      {p.ok ? '✓' : '✕'}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: C.brownDark,
                        fontWeight: 500,
                      }}
                    >
                      {p.label}
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 12,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#FFFAE0',
                  border: `1.5px solid ${C.yellow}60`,
                  fontSize: 11,
                  color: C.brownDark,
                  fontWeight: 600,
                }}
              >
                💡 Need more access? Contact your Franchise Owner or HQ to
                update your permissions.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
