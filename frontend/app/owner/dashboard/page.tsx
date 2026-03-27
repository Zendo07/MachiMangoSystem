'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getStoredUser,
  getStoredToken,
  clearAuth,
  ROLE_META,
  type UserRole,
} from '@/lib/auth';
import CreateAccountModal, {
  type CreatedAccountData,
} from '@/components/admin/CreateAccountModal';
import SuccessCredentialModal from '@/components/admin/SuccessCredentialModal';

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

// ─── NAV ITEMS per role ───────────────────────────────────────────────────────
function getNavItems(role: UserRole) {
  const base = [
    {
      name: 'Dashboard',
      route: '/owner/dashboard',
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
      route: '/owner/products',
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
    {
      name: 'My Orders',
      route: '/owner/orders',
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
  ];
  return base;
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function OwnerSidebar({
  sidebarOpen,
  activeNav,
  onNav,
  userName,
  userRole,
  onCreateAccount,
}: {
  sidebarOpen: boolean;
  activeNav: string;
  onNav: (route: string) => void;
  userName: string;
  userRole: UserRole;
  onCreateAccount?: () => void;
}) {
  const navItems = getNavItems(userRole);
  const meta = ROLE_META[userRole];
  const isFranchiseOwner = userRole === 'franchise_owner';

  return (
    <aside
      style={{
        width: sidebarOpen ? 256 : 72,
        background: `linear-gradient(180deg,${C.brownDarker} 0%,${C.brownDark} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.28s cubic-bezier(.4,0,.2,1)',
        flexShrink: 0,
        boxShadow: '4px 0 24px rgba(62,26,0,0.18)',
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 16px 20px',
          borderBottom: '1px solid rgba(245,200,66,0.2)',
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
              boxShadow: '0 4px 12px rgba(255,140,0,0.4)',
            }}
          >
            🥭
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 17,
                  color: C.yellow,
                  letterSpacing: '-0.3px',
                  lineHeight: 1.2,
                }}
              >
                Machi Mango
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(245,200,66,0.7)',
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                {meta.label} Portal
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto' }}>
        {sidebarOpen && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'rgba(245,200,66,0.35)',
              padding: '8px 14px 6px',
            }}
          >
            Main Menu
          </div>
        )}
        {navItems.map((item) => {
          const active = activeNav === item.name;
          return (
            <button
              key={item.name}
              onClick={() => onNav(item.route)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: sidebarOpen ? '11px 14px' : '11px 0',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                borderRadius: 12,
                marginBottom: 3,
                border: 'none',
                cursor: 'pointer',
                background: active
                  ? `linear-gradient(90deg,${C.yellow},${C.orange})`
                  : 'transparent',
                color: active ? C.brownDarker : 'rgba(245,200,66,0.65)',
                fontWeight: active ? 700 : 500,
                fontSize: 13.5,
                boxShadow: active ? '0 4px 14px rgba(255,140,0,0.3)' : 'none',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(245,200,66,0.1)';
                  e.currentTarget.style.color = C.yellow;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(245,200,66,0.65)';
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
              {sidebarOpen && (
                <span style={{ flex: 1, textAlign: 'left' }}>{item.name}</span>
              )}
            </button>
          );
        })}

        {/* Franchise Owner gets Create Account */}
        {isFranchiseOwner && onCreateAccount && (
          <>
            {sidebarOpen && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(245,200,66,0.35)',
                  padding: '14px 14px 6px',
                }}
              >
                Administration
              </div>
            )}
            <button
              onClick={onCreateAccount}
              style={{
                width: sidebarOpen ? '100%' : 42,
                margin: sidebarOpen ? '4px 0 8px' : '4px auto 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                gap: 10,
                padding: sidebarOpen ? '12px 14px' : '11px 0',
                borderRadius: 13,
                border: '2px dashed rgba(245,200,66,0.4)',
                background: 'rgba(245,200,66,0.07)',
                color: C.yellow,
                fontWeight: 700,
                fontSize: 13.5,
                cursor: 'pointer',
                transition: 'all .2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(245,200,66,0.15)';
                e.currentTarget.style.borderColor = C.yellow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(245,200,66,0.07)';
                e.currentTarget.style.borderColor = 'rgba(245,200,66,0.4)';
              }}
              title="Create Account"
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
                }}
              >
                +
              </div>
              {sidebarOpen && <span>Create Account</span>}
            </button>
          </>
        )}
      </nav>

      {/* User card */}
      <div
        style={{
          padding: '14px 10px',
          borderTop: '1px solid rgba(245,200,66,0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              background: `linear-gradient(135deg,${C.green},${C.darkGreen})`,
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
          {sidebarOpen && (
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
                  color: 'rgba(245,200,66,0.6)',
                  marginTop: 1,
                }}
              >
                {meta.emoji} {meta.label}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── ORDER STATUS BADGE ───────────────────────────────────────────────────────
const STATUS_META: Record<
  string,
  { label: string; bg: string; color: string; dot: string; icon: string }
> = {
  pending: {
    label: 'Pending',
    bg: '#FFF0D9',
    color: '#CC7000',
    dot: '#FF8C00',
    icon: '⏳',
  },
  processing: {
    label: 'Processing',
    bg: '#E0F2FA',
    color: '#2E7BAD',
    dot: '#4A9ECA',
    icon: '⚙️',
  },
  shipped: {
    label: 'Shipped',
    bg: '#F3E5FF',
    color: '#7B3FA0',
    dot: '#9C4DC4',
    icon: '🚚',
  },
  delivered: {
    label: 'Delivered',
    bg: '#E8F5E1',
    color: '#3D6E27',
    dot: '#5A9E3A',
    icon: '✅',
  },
  cancelled: {
    label: 'Cancelled',
    bg: '#FFEBEE',
    color: '#C62828',
    dot: '#EF5350',
    icon: '❌',
  },
};

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 11px',
        borderRadius: 20,
        background: m.bg,
        color: m.color,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      <span
        style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot }}
      />
      {m.icon} {m.label}
    </span>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [createdAccount, setCreatedAccount] =
    useState<CreatedAccountData | null>(null);

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

  const fetchOrders = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    setLoadingOrders(true);
    try {
      const res = await fetch('http://localhost:3000/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { success: boolean; data: any[] };
      if (data.success) setRecentOrders(data.data.slice(0, 5));
    } catch {
      /* ignore */
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (user) void fetchOrders();
  }, [user, fetchOrders]);

  if (!user) return null;

  const role = user.role as UserRole;
  const meta = ROLE_META[role];
  const isFranchiseOwner = role === 'franchise_owner';
  const firstName = user.fullName?.split(' ')[0] ?? 'there';
  const branchLabel =
    user.branchId ?? (isFranchiseOwner ? 'All Branches' : 'Your Branch');

  const handleNav = (route: string) => router.push(route);
  const handleAccountCreated = (data: CreatedAccountData) => {
    setCreatedAccount(data);
    setCreateModal(false);
    setTimeout(() => setSuccessModal(true), 320);
  };
  const handleCreateAnother = () => {
    setSuccessModal(false);
    setTimeout(() => setCreateModal(true), 320);
  };

  // Stats derived from real orders
  const totalOrders = recentOrders.length;
  const pendingOrders = recentOrders.filter(
    (o) => o.status === 'pending',
  ).length;
  const deliveredOrders = recentOrders.filter(
    (o) => o.status === 'delivered',
  ).length;

  const quickActions = [
    {
      label: 'Place an Order',
      desc: 'Order ingredients from HQ',
      icon: '🛒',
      route: '/owner/orders',
      color: C.orange,
    },
    {
      label: 'View Products',
      desc: 'Browse available items',
      icon: '📦',
      route: '/owner/products',
      color: C.green,
    },
    {
      label: 'Order History',
      desc: 'Track all your orders',
      icon: '📋',
      route: '/owner/orders',
      color: '#4A9ECA',
    },
  ];

  const perms = isFranchiseOwner
    ? [
        { label: 'View Dashboard', ok: true },
        { label: 'View Products', ok: true },
        { label: 'Place Orders', ok: true },
        { label: 'Order History', ok: true },
        { label: 'Create Accounts', ok: true },
        { label: 'Manage HQ Settings', ok: false },
      ]
    : [
        { label: 'View Dashboard', ok: true },
        { label: 'View Products', ok: true },
        { label: 'Place Orders', ok: true },
        { label: 'Order History', ok: true },
        { label: 'Create Accounts', ok: false },
        { label: 'Manage Settings', ok: false },
      ];

  return (
    <>
      {isFranchiseOwner && (
        <CreateAccountModal
          isOpen={createModal}
          onClose={() => setCreateModal(false)}
          onSuccess={handleAccountCreated}
        />
      )}
      {isFranchiseOwner && (
        <SuccessCredentialModal
          isOpen={successModal}
          data={createdAccount}
          onClose={() => setSuccessModal(false)}
          onCreateAnother={handleCreateAnother}
        />
      )}

      <div
        style={{
          display: 'flex',
          height: '100vh',
          background: C.bg,
          overflow: 'hidden',
          fontFamily: "'Segoe UI',system-ui,sans-serif",
        }}
      >
        <OwnerSidebar
          sidebarOpen={sidebarOpen}
          activeNav="Dashboard"
          onNav={handleNav}
          userName={user.fullName}
          userRole={role}
          onCreateAccount={
            isFranchiseOwner ? () => setCreateModal(true) : undefined
          }
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
                onClick={() => setSidebarOpen((v) => !v)}
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
                    style={{
                      fontWeight: 800,
                      fontSize: 19,
                      color: C.brownDark,
                    }}
                  >
                    {meta.emoji} {meta.label} Dashboard
                  </div>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 20,
                      background: meta.badgeBg,
                      color: meta.badgeColor,
                      fontSize: 10,
                      fontWeight: 800,
                      border: `1.5px solid ${meta.badgeColor}40`,
                      textTransform: 'uppercase',
                      letterSpacing: '.04em',
                    }}
                  >
                    {meta.label}
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
                  {branchLabel} ·{' '}
                  {new Date().toLocaleDateString('en-PH', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
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
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 28,
              background: C.bg,
            }}
          >
            {/* Welcome Banner */}
            <div
              style={{
                background: `linear-gradient(135deg,${C.brownDarker},${C.brownDark})`,
                borderRadius: 18,
                padding: '24px 32px',
                marginBottom: 24,
                border: '2px solid rgba(245,200,66,.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: C.yellow }}>
                  Good day, {firstName}! 🥭
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'rgba(245,200,66,.7)',
                    marginTop: 4,
                  }}
                >
                  {isFranchiseOwner
                    ? 'Manage your franchise operations and place orders from HQ below.'
                    : 'Place your ingredient orders and track their status from HQ below.'}
                </div>
              </div>
              <button
                onClick={() => router.push('/owner/orders')}
                style={{
                  padding: '12px 24px',
                  borderRadius: 13,
                  border: 'none',
                  background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
                  color: C.brownDarker,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(255,140,0,.35)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  viewBox="0 0 24 24"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Place Order
              </button>
            </div>

            {/* Stat Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: 16,
                marginBottom: 24,
              }}
            >
              {[
                {
                  label: 'Total Orders',
                  value: totalOrders,
                  icon: '📋',
                  grad: `linear-gradient(135deg,${C.orange},#CC7000)`,
                  note: 'All time',
                },
                {
                  label: 'Pending Orders',
                  value: pendingOrders,
                  icon: '⏳',
                  grad: `linear-gradient(135deg,#FF8C00,#E65100)`,
                  note: 'Awaiting HQ',
                },
                {
                  label: 'Delivered',
                  value: deliveredOrders,
                  icon: '✅',
                  grad: `linear-gradient(135deg,${C.green},${C.darkGreen})`,
                  note: 'Completed',
                },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: '22px 22px 18px',
                    boxShadow: '0 2px 12px rgba(0,0,0,.07)',
                    opacity: loaded ? 1 : 0,
                    transform: loaded ? 'translateY(0)' : 'translateY(14px)',
                    transition: `opacity .4s ${i * 0.08}s, transform .4s ${i * 0.08}s`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      'translateY(-3px)';
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      '0 8px 24px rgba(0,0,0,.11)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      '0 2px 12px rgba(0,0,0,.07)';
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 13,
                      background: card.grad,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      marginBottom: 14,
                      boxShadow: '0 4px 10px rgba(0,0,0,.15)',
                    }}
                  >
                    {card.icon}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.brownDark,
                      marginBottom: 4,
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{
                      fontSize: 30,
                      fontWeight: 900,
                      color: C.brownDarker,
                      letterSpacing: '-0.5px',
                      lineHeight: 1.1,
                    }}
                  >
                    {loadingOrders ? '—' : card.value}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: '#AAA',
                      fontWeight: 600,
                      marginTop: 4,
                    }}
                  >
                    {card.note}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 18,
                marginBottom: 18,
              }}
            >
              {/* Quick Actions */}
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
                  Quick Actions
                </div>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => router.push(action.route)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '14px 16px',
                        borderRadius: 12,
                        border: '1.5px solid #E5D9C8',
                        background: '#FDFAF4',
                        cursor: 'pointer',
                        textAlign: 'left',
                        opacity: loaded ? 1 : 0,
                        transform: loaded
                          ? 'translateY(0)'
                          : 'translateY(10px)',
                        transition: `all .18s, opacity .4s ${i * 0.07}s, transform .4s ${i * 0.07}s`,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          C.yellow;
                        (e.currentTarget as HTMLElement).style.background =
                          '#FFFAE0';
                        (e.currentTarget as HTMLElement).style.transform =
                          'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          '#E5D9C8';
                        (e.currentTarget as HTMLElement).style.background =
                          '#FDFAF4';
                        (e.currentTarget as HTMLElement).style.transform =
                          'translateX(0)';
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: `${action.color}18`,
                          border: `2px solid ${action.color}30`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20,
                          flexShrink: 0,
                        }}
                      >
                        {action.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13.5,
                            color: C.brownDarker,
                          }}
                        >
                          {action.label}
                        </div>
                        <div
                          style={{ fontSize: 11, color: '#AAA', marginTop: 2 }}
                        >
                          {action.desc}
                        </div>
                      </div>
                      <svg
                        style={{ color: '#CCC', flexShrink: 0 }}
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

              {/* Access Level */}
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Your Access Level
                </div>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: `${meta.badgeBg}`,
                    border: `2px solid ${meta.badgeColor}30`,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 14,
                      color: meta.badgeColor,
                    }}
                  >
                    {meta.emoji} {meta.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: meta.badgeColor,
                      opacity: 0.8,
                      marginTop: 2,
                    }}
                  >
                    {meta.description}
                  </div>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                  }}
                >
                  {perms.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        padding: '8px 10px',
                        borderRadius: 9,
                        background: p.ok ? '#E8F5E1' : '#FDFAF4',
                        border: `1.5px solid ${p.ok ? C.green + '40' : '#E5D9C8'}`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
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
              </div>
            </div>

            {/* Recent Orders */}
            <div
              style={{
                background: '#fff',
                borderRadius: 18,
                boxShadow: '0 2px 16px rgba(0,0,0,.08)',
                overflow: 'hidden',
                border: `3px solid ${C.yellow}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 24px',
                  background: `linear-gradient(90deg,${C.yellow}28,${C.orange}18)`,
                  borderBottom: `2px solid ${C.yellow}`,
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
                    Recent Orders
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: C.brownDark,
                      fontWeight: 600,
                      opacity: 0.7,
                      marginTop: 2,
                    }}
                  >
                    Your latest ingredient orders from HQ
                  </div>
                </div>
                <button
                  onClick={() => router.push('/owner/orders')}
                  style={{
                    padding: '9px 20px',
                    background: `linear-gradient(135deg,${C.green},${C.darkGreen})`,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(61,110,39,.3)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  View All Orders
                </button>
              </div>

              {loadingOrders ? (
                <div
                  style={{
                    padding: 48,
                    textAlign: 'center',
                    color: '#AAA',
                    fontSize: 14,
                  }}
                >
                  Loading orders…
                </div>
              ) : recentOrders.length === 0 ? (
                <div style={{ padding: 56, textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: C.brownDark,
                      marginBottom: 6,
                    }}
                  >
                    No orders yet
                  </div>
                  <div
                    style={{ fontSize: 12, color: '#AAA', marginBottom: 18 }}
                  >
                    Your ingredient orders from HQ will appear here
                  </div>
                  <button
                    onClick={() => router.push('/owner/orders')}
                    style={{
                      padding: '10px 24px',
                      borderRadius: 10,
                      border: 'none',
                      background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
                      color: C.brownDarker,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    🛒 Place First Order
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr
                        style={{
                          background: `linear-gradient(90deg,${C.brownDarker},${C.brownDark})`,
                        }}
                      >
                        {[
                          'Order ID',
                          'Items',
                          'Total Amount',
                          'Status',
                          'Date',
                        ].map((col) => (
                          <th
                            key={col}
                            style={{
                              padding: '12px 20px',
                              textAlign: 'left',
                              fontSize: 11,
                              fontWeight: 800,
                              color: C.yellow,
                              textTransform: 'uppercase',
                              letterSpacing: '.07em',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order, idx) => (
                        <tr
                          key={order.id}
                          style={{
                            borderBottom: `1.5px solid ${C.yellow}30`,
                            background: idx % 2 === 0 ? '#fff' : '#FDFAF4',
                            transition: 'background .15s',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = `${C.yellow}12`)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              idx % 2 === 0 ? '#fff' : '#FDFAF4')
                          }
                        >
                          <td
                            style={{
                              padding: '14px 20px',
                              fontWeight: 700,
                              fontSize: 12,
                              color: C.brownDarker,
                              fontFamily: 'monospace',
                            }}
                          >
                            #{order.id.slice(-8).toUpperCase()}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 4,
                                maxWidth: 220,
                              }}
                            >
                              {order.items
                                ?.slice(0, 2)
                                .map((item: any, i: number) => (
                                  <span
                                    key={i}
                                    style={{
                                      padding: '2px 8px',
                                      borderRadius: 20,
                                      background: '#F2EAD8',
                                      fontSize: 10,
                                      fontWeight: 600,
                                      color: C.brownDark,
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {item.name} ×{item.quantity}
                                  </span>
                                ))}
                              {(order.items?.length ?? 0) > 2 && (
                                <span
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: 20,
                                    background: '#F2EAD8',
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: '#AAA',
                                  }}
                                >
                                  +{order.items.length - 2} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: '14px 20px',
                              fontWeight: 900,
                              fontSize: 14,
                              color: C.brownDarker,
                            }}
                          >
                            ₱{Number(order.totalAmount).toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <StatusBadge status={order.status} />
                          </td>
                          <td
                            style={{
                              padding: '14px 20px',
                              fontSize: 11,
                              color: '#AAA',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {new Date(order.createdAt).toLocaleDateString(
                              'en-PH',
                              {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
