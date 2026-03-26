'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  getStoredUser,
  getStoredToken,
  clearAuth,
  PERMISSIONS,
  ROLE_META,
  type UserRole,
} from '@/lib/auth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

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

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({
  open,
  role,
  userName,
  branchName,
  activeNav,
  onNav,
}: {
  open: boolean;
  role: UserRole;
  userName: string;
  branchName: string;
  activeNav: string;
  onNav: (n: string) => void;
}) {
  const meta = ROLE_META[role];
  const canAnalytics = PERMISSIONS.canViewAnalytics(role);

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
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    ...(canAnalytics
      ? [
          {
            name: 'Analytics',
            icon: (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  return (
    <aside
      style={{
        width: open ? 256 : 72,
        background: `linear-gradient(180deg,${C.brownDarker},${C.brownDark})`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width .28s cubic-bezier(.4,0,.2,1)',
        flexShrink: 0,
        boxShadow: '4px 0 24px rgba(62,26,0,.18)',
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 16px 18px',
          borderBottom: '1px solid rgba(245,200,66,.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
              boxShadow: '0 4px 12px rgba(255,140,0,.4)',
            }}
          >
            🥭
          </div>
          {open && (
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 17,
                  color: C.yellow,
                  letterSpacing: '-.3px',
                }}
              >
                Machi Mango
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(245,200,66,.7)',
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                {branchName}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role chip */}
      {open && (
        <div style={{ padding: '10px 16px 0' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 10px',
              borderRadius: 20,
              background: meta.badgeBg,
              color: meta.badgeColor,
              fontSize: 10,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '.05em',
            }}
          >
            {meta.emoji} {meta.label}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {open && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              color: 'rgba(245,200,66,.35)',
              padding: '8px 14px 6px',
            }}
          >
            Menu
          </div>
        )}
        {navItems.map((item) => {
          const active = activeNav === item.name;
          return (
            <button
              key={item.name}
              onClick={() => onNav(item.name)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: open ? '11px 14px' : '11px 0',
                justifyContent: open ? 'flex-start' : 'center',
                borderRadius: 12,
                marginBottom: 3,
                border: 'none',
                cursor: 'pointer',
                background: active
                  ? `linear-gradient(90deg,${C.yellow},${C.orange})`
                  : 'transparent',
                color: active ? C.brownDarker : 'rgba(245,200,66,.65)',
                fontWeight: active ? 700 : 500,
                fontSize: 13.5,
                boxShadow: active ? '0 4px 14px rgba(255,140,0,.3)' : 'none',
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
              <span
                style={{
                  flexShrink: 0,
                  color: active ? C.brownDarker : 'inherit',
                }}
              >
                {item.icon}
              </span>
              {open && <span>{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* User card */}
      <div
        style={{
          padding: '14px 10px',
          borderTop: '1px solid rgba(245,200,66,.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 12,
            background: 'rgba(255,255,255,.06)',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              background: 'linear-gradient(135deg,#4A9ECA,#2E7BAD)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          {open && (
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: C.yellow,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {userName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(245,200,66,.6)',
                  marginTop: 1,
                }}
              >
                {meta.label}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [open, setOpen] = useState(true);
  const [activeNav, setActive] = useState('Dashboard');
  const [loaded, setLoaded] = useState(false);

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
    if (u.role === 'crew') {
      router.replace('/crew/dashboard');
      return;
    }
    setUser(u);
    setTimeout(() => setLoaded(true), 80);
  }, [router]);

  const handleNav = (name: string) => {
    setActive(name);
    if (name === 'Products') router.push('/owner/products');
  };

  if (!user) return null;

  const role = user.role as UserRole;
  const meta = ROLE_META[role];
  const canEdit = PERMISSIONS.canEditProducts(role);
  const canAnalyze = PERMISSIONS.canViewAnalytics(role);
  const branchName = user.branchId ?? 'Your Branch';

  const salesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales',
        data: [8000, 12000, 9500, 15000, 13000, 18000, 16000],
        borderColor: C.green,
        backgroundColor: 'rgba(90,158,58,.12)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 5,
        pointBackgroundColor: C.green,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };
  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: C.brownDarker,
        titleColor: C.yellow,
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,.06)' },
        ticks: { color: C.brown, font: { size: 11, weight: 'bold' as const } },
      },
      x: {
        grid: { display: false },
        ticks: { color: C.brown, font: { size: 11, weight: 'bold' as const } },
      },
    },
  };

  const stats = [
    {
      label: "Today's Sales",
      value: '₱0.00',
      sub: 'No data yet',
      grad: `linear-gradient(135deg,${C.green},${C.darkGreen})`,
      icon: '💰',
    },
    {
      label: "Today's Orders",
      value: '0',
      sub: 'No orders yet',
      grad: `linear-gradient(135deg,${C.orange},#CC7000)`,
      icon: '🛒',
    },
    {
      label: 'Products',
      value: '12',
      sub: 'Set by HQ',
      grad: `linear-gradient(135deg,${C.yellow},${C.orange})`,
      icon: '📦',
    },
    {
      label: 'Low Stock',
      value: '3',
      sub: 'Needs attention',
      grad: 'linear-gradient(135deg,#C62828,#B71C1C)',
      icon: '⚠️',
    },
  ];

  const perms = [
    { label: 'View Dashboard', ok: true },
    { label: 'View Products', ok: true },
    { label: 'Edit Products', ok: canEdit },
    { label: 'View Analytics', ok: canAnalyze },
    { label: 'Manage Branches', ok: false },
    { label: 'Create Accounts', ok: false },
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
      <Sidebar
        open={open}
        role={role}
        userName={user.fullName ?? 'User'}
        branchName={branchName}
        activeNav={activeNav}
        onNav={handleNav}
      />

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => setOpen((v) => !v)}
              style={{
                border: '2px solid transparent',
                borderRadius: 10,
                padding: '7px 9px',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${C.yellow}22`;
                e.currentTarget.style.borderColor = C.yellow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: 20,
                    height: 2.5,
                    background: C.brown,
                    borderRadius: 2,
                  }}
                />
              ))}
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{ fontWeight: 800, fontSize: 19, color: C.brownDark }}
                >
                  Branch Dashboard
                </div>
                {/* Read-only badge */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: '#FFEBEE',
                    color: '#C62828',
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '.05em',
                    border: '1.5px solid #EF9A9A',
                  }}
                >
                  <svg
                    width="9"
                    height="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  View Only
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
                {branchName} · {meta.label}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                padding: '7px 14px',
                borderRadius: 10,
                background: `${meta.badgeBg}`,
                border: `1.5px solid ${meta.badgeColor}40`,
                fontSize: 11,
                fontWeight: 700,
                color: meta.badgeColor,
              }}
            >
              {meta.emoji} {canEdit ? 'Can Edit Products' : 'View Only Access'}
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
              Welcome back, {user.fullName?.split(' ')[0]} 👋
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
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4,1fr)',
              gap: 16,
              marginBottom: 24,
            }}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '20px 20px 16px',
                  boxShadow: '0 2px 12px rgba(0,0,0,.07)',
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? 'translateY(0)' : 'translateY(14px)',
                  transition: `opacity .4s ${i * 0.07}s, transform .4s ${i * 0.07}s`,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(-3px)';
                  el.style.boxShadow = '0 8px 24px rgba(0,0,0,.11)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = '0 2px 12px rgba(0,0,0,.07)';
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: s.grad,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    marginBottom: 14,
                    boxShadow: '0 4px 10px rgba(0,0,0,.15)',
                  }}
                >
                  {s.icon}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.brownDark,
                    marginBottom: 4,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: C.brownDarker,
                    letterSpacing: '-.5px',
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#AAA',
                    fontWeight: 600,
                    marginTop: 4,
                  }}
                >
                  {s.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Chart + Permissions */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.6fr 1fr',
              gap: 18,
            }}
          >
            {/* Chart */}
            {canAnalyze ? (
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 16,
                        color: C.brownDark,
                      }}
                    >
                      Branch Sales
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: C.green,
                        fontWeight: 600,
                        marginTop: 2,
                      }}
                    >
                      7-day trend · Sample Data
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '5px 12px',
                      background: '#E8F5E1',
                      color: C.darkGreen,
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      border: `1.5px solid ${C.green}`,
                    }}
                  >
                    THIS WEEK
                  </span>
                </div>
                <div style={{ height: 220 }}>
                  <Line data={salesData} options={chartOpts} />
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '22px',
                  boxShadow: '0 2px 12px rgba(0,0,0,.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 40 }}>🔒</div>
                <div
                  style={{ fontWeight: 700, fontSize: 14, color: C.brownDark }}
                >
                  Analytics Restricted
                </div>
                <div
                  style={{ fontSize: 12, color: '#AAA', textAlign: 'center' }}
                >
                  Analytics access is available to Franchise Owners and above.
                </div>
              </div>
            )}

            {/* Permissions */}
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
                Your Permissions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {perms.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: 9,
                      background: p.ok ? '#E8F5E1' : '#FDFAF4',
                      border: `1.5px solid ${p.ok ? C.green + '50' : '#E5D9C8'}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.brownDark,
                      }}
                    >
                      {p.label}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: p.ok ? C.darkGreen : '#C62828',
                      }}
                    >
                      {p.ok ? '✓ Yes' : '✕ No'}
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 14,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#FFFAE0',
                  border: `1.5px solid ${C.yellow}60`,
                  fontSize: 11,
                  color: C.brownDark,
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                Contact HQ to change your access level
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
