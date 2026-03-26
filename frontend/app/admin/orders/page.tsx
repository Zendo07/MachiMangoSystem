'use client';

// frontend/app/admin/orders/page.tsx
import { useEffect, useState, useCallback } from 'react';
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

type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

interface OrderItem {
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

interface Order {
  id: string;
  franchiseeId: string;
  franchiseeName: string;
  branch: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_META: Record<
  OrderStatus,
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

function StatusBadge({ status }: { status: OrderStatus }) {
  const m = STATUS_META[status];
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

// ─── UPDATE STATUS MODAL ──────────────────────────────────────────────────────
function UpdateStatusModal({
  order,
  onClose,
  onUpdated,
}: {
  order: Order;
  onClose: () => void;
  onUpdated: (updated: Order) => void;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [note, setNote] = useState(order.adminNote ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 240);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const token = getStoredToken();
      if (!token) {
        setError('Session expired. Please log in again.');
        setSaving(false);
        return;
      }
      const res = await fetch(
        `http://localhost:3000/api/orders/${order.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, adminNote: note }),
        },
      );
      const data = (await res.json()) as {
        success: boolean;
        data: Order;
        message?: string;
      };
      if (res.ok && data.success) {
        onUpdated(data.data);
        close();
      } else {
        setError(data.message ?? 'Failed to update status');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: visible ? 'rgba(30,10,0,.55)' : 'rgba(30,10,0,0)',
        backdropFilter: visible ? 'blur(3px)' : 'none',
        transition: 'all .24s',
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#fff',
          borderRadius: 20,
          overflow: 'hidden',
          transform: visible ? 'scale(1)' : 'scale(0.96)',
          opacity: visible ? 1 : 0,
          transition: 'all .28s cubic-bezier(.4,0,.2,1)',
          boxShadow: '0 32px 80px rgba(62,26,0,.3)',
        }}
      >
        <div
          style={{
            padding: '20px 26px',
            background: `linear-gradient(135deg,${C.brownDarker},${C.brownDark})`,
            borderBottom: `3px solid ${C.yellow}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            📦
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.yellow }}>
              Update Order Status
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(245,200,66,.6)',
                marginTop: 2,
              }}
            >
              Order #{order.id.slice(-8).toUpperCase()} · {order.franchiseeName}
            </div>
          </div>
          <button
            onClick={close}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: '2px solid rgba(245,200,66,.3)',
              background: 'rgba(245,200,66,.1)',
              color: C.yellow,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: '22px 26px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: '#FFEBEE',
                border: '1.5px solid #EF9A9A',
                color: '#C62828',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              ⚠️ {error}
            </div>
          )}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.08em',
                color: C.brownDark,
                marginBottom: 10,
              }}
            >
              Set Status
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
              }}
            >
              {(Object.keys(STATUS_META) as OrderStatus[]).map((s) => {
                const m = STATUS_META[s];
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 10,
                      border: `2px solid ${status === s ? m.dot : '#E5D9C8'}`,
                      background: status === s ? m.bg : '#FDFAF4',
                      color: status === s ? m.color : C.brownDark,
                      fontWeight: status === s ? 800 : 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all .15s',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{m.icon}</span>
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.08em',
                color: C.brownDark,
                marginBottom: 6,
              }}
            >
              Note to Franchisee{' '}
              <span
                style={{
                  color: '#AAA',
                  fontWeight: 500,
                  textTransform: 'none',
                  letterSpacing: 0,
                }}
              >
                (optional)
              </span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="e.g. Your order will arrive Thursday morning."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 11,
                border: '2px solid #E5D9C8',
                background: '#FDFAF4',
                color: C.brownDarker,
                fontSize: 13,
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = C.yellow)}
              onBlur={(e) => (e.target.style.borderColor = '#E5D9C8')}
            />
          </div>
        </div>

        <div
          style={{
            padding: '14px 26px 22px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            borderTop: '1px solid #F0E8D8',
          }}
        >
          <button
            onClick={close}
            style={{
              padding: '10px 20px',
              borderRadius: 11,
              border: '2px solid #D0BFA8',
              background: 'transparent',
              color: C.brownDark,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{
              padding: '10px 24px',
              borderRadius: 11,
              border: 'none',
              background: saving
                ? '#CCC'
                : `linear-gradient(135deg,${C.yellow},${C.orange})`,
              color: C.brownDarker,
              fontWeight: 800,
              fontSize: 13,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(255,140,0,.3)',
            }}
          >
            {saving ? 'Saving…' : '✓ Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [selected, setSelected] = useState<Order | null>(null);
  const [sidebarOpen, setSidebar] = useState(true);
  const [userName, setUserName] = useState('Admin');

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const u = getStoredUser();
    const t = getStoredToken();
    if (!u || !t) {
      router.replace('/login');
      return;
    }
    if (u.role !== 'hq_admin') {
      router.replace('/login');
      return;
    }
    setUserName(u.fullName ?? 'Admin');
    setReady(true);
  }, [router]);

  // ── Fetch orders — only after auth confirmed ───────────────────────────────
  const fetchOrders = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;

    setLoading(true);
    setFetchError('');

    try {
      const res = await fetch('http://localhost:3000/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        setFetchError('Session expired. Please sign in again.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setFetchError(`Server error: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }

      const data = (await res.json()) as {
        success: boolean;
        data: Order[];
        message?: string;
      };

      if (data.success) {
        setOrders(data.data);
      } else {
        setFetchError(data.message ?? 'Failed to load orders');
      }
    } catch (err) {
      setFetchError(
        'Cannot reach backend. Make sure it is running on port 3000.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Trigger fetch once auth is confirmed ───────────────────────────────────
  useEffect(() => {
    if (ready) {
      void fetchOrders();
    }
  }, [ready, fetchOrders]);

  if (!ready) return null;

  const handleUpdated = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSelected(null);
  };

  const filtered =
    filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  // ─── NAV: Dashboard · Franchisee Orders · Products ───────────────────────
  const NAV_ITEMS = [
    {
      name: 'Dashboard',
      label: 'Dashboard',
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
      route: '/admin/dashboard',
      badge: 0,
    },
    {
      name: 'Franchisee Orders',
      label: 'Franchisee Orders',
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
      route: '/admin/orders',
      badge: counts.pending,
    },
    {
      name: 'Products',
      label: 'Products',
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
        </svg>
      ),
      route: '/admin/products',
      badge: 0,
    },
  ];

  return (
    <>
      {selected && (
        <UpdateStatusModal
          order={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
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
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside
          style={{
            width: sidebarOpen ? 240 : 72,
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
              padding: '24px 16px 20px',
              borderBottom: '1px solid rgba(245,200,66,.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
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
              }}
            >
              🥭
            </div>
            {sidebarOpen && (
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.yellow }}>
                  Machi Mango
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'rgba(245,200,66,.7)',
                    marginTop: 1,
                  }}
                >
                  HQ Control Center
                </div>
              </div>
            )}
          </div>

          {/* Nav links */}
          <nav style={{ flex: 1, padding: '16px 10px' }}>
            {NAV_ITEMS.map((item) => {
              const active = item.name === 'Franchisee Orders';
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.route)}
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
                    color: active ? C.brownDarker : 'rgba(245,200,66,.65)',
                    fontWeight: active ? 700 : 500,
                    fontSize: 13.5,
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
                  {sidebarOpen && (
                    <span style={{ flex: 1, textAlign: 'left' }}>
                      {item.label}
                    </span>
                  )}
                  {sidebarOpen && item.badge > 0 && (
                    <span
                      style={{
                        background: C.orange,
                        color: '#fff',
                        borderRadius: 20,
                        padding: '1px 8px',
                        fontSize: 10,
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {/* collapsed badge dot */}
                  {!sidebarOpen && item.badge > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 10,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: C.orange,
                        border: `2px solid ${C.brownDarker}`,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User footer */}
          <div
            style={{
              padding: '14px 10px',
              borderTop: '1px solid rgba(245,200,66,.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
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
                <div style={{ fontSize: 11, color: 'rgba(245,200,66,.6)' }}>
                  HQ Administrator
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
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
                onClick={() => setSidebar((v) => !v)}
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
                <div
                  style={{ fontWeight: 800, fontSize: 19, color: C.brownDark }}
                >
                  Franchisee Orders
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: C.green,
                    fontWeight: 600,
                    marginTop: 1,
                  }}
                >
                  {counts.pending > 0
                    ? `⚠️ ${counts.pending} pending order${counts.pending > 1 ? 's' : ''} need attention`
                    : 'All orders up to date ✓'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => void fetchOrders()}
                style={{
                  padding: '9px 16px',
                  border: `2px solid ${C.yellow}`,
                  borderRadius: 10,
                  background: `${C.yellow}22`,
                  color: C.brownDark,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                ↺ Refresh
              </button>
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
              >
                Sign Out
              </button>
            </div>
          </header>

          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 28,
              background: C.bg,
            }}
          >
            {/* Summary cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5,1fr)',
                gap: 12,
                marginBottom: 22,
              }}
            >
              {(Object.keys(STATUS_META) as OrderStatus[]).map((s) => {
                const m = STATUS_META[s];
                return (
                  <div
                    key={s}
                    onClick={() => setFilter(filter === s ? 'all' : s)}
                    style={{
                      background: filter === s ? m.bg : '#fff',
                      border: `2px solid ${filter === s ? m.dot : '#F0E8D8'}`,
                      borderRadius: 14,
                      padding: '14px 16px',
                      cursor: 'pointer',
                      transition: 'all .18s',
                      boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform =
                        'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform =
                        'translateY(0)';
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 6 }}>
                      {m.icon}
                    </div>
                    <div
                      style={{ fontSize: 22, fontWeight: 900, color: m.color }}
                    >
                      {counts[s]}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.brownDark,
                        marginTop: 2,
                      }}
                    >
                      {m.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Orders table */}
            <div
              style={{
                background: '#fff',
                borderRadius: 18,
                overflow: 'hidden',
                boxShadow: '0 2px 16px rgba(0,0,0,.08)',
                border: `3px solid ${C.yellow}`,
              }}
            >
              <div
                style={{
                  padding: '16px 24px',
                  background: `linear-gradient(90deg,${C.yellow}28,${C.orange}18)`,
                  borderBottom: `2px solid ${C.yellow}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Franchisee Orders icon */}
                  <span style={{ fontSize: 18 }}>🏪</span>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 16,
                      color: C.brownDark,
                    }}
                  >
                    {filter === 'all'
                      ? 'All Franchisee Orders'
                      : `${STATUS_META[filter as OrderStatus]?.label} Orders`}
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#AAA',
                      }}
                    >
                      ({filtered.length})
                    </span>
                  </div>
                </div>
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    style={{
                      fontSize: 12,
                      color: C.orange,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    Clear filter ✕
                  </button>
                )}
              </div>

              {/* Error state */}
              {fetchError && !loading && (
                <div
                  style={{
                    padding: '32px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 36 }}>⚠️</div>
                  <div
                    style={{ fontWeight: 700, fontSize: 14, color: '#C62828' }}
                  >
                    {fetchError}
                  </div>
                  <button
                    onClick={() => void fetchOrders()}
                    style={{
                      marginTop: 8,
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
                    Try Again
                  </button>
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div
                  style={{
                    padding: 60,
                    textAlign: 'center',
                    color: '#AAA',
                    fontSize: 14,
                  }}
                >
                  Loading franchisee orders…
                </div>
              )}

              {/* Empty state */}
              {!loading && !fetchError && filtered.length === 0 && (
                <div style={{ padding: 60, textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🏪</div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: C.brownDark,
                      marginBottom: 6,
                    }}
                  >
                    {orders.length === 0
                      ? 'No franchisee orders yet'
                      : 'No orders match this filter'}
                  </div>
                  <div style={{ fontSize: 12, color: '#AAA' }}>
                    {orders.length === 0
                      ? 'Orders placed by franchisees will appear here'
                      : 'Try selecting a different status filter'}
                  </div>
                </div>
              )}

              {/* Table */}
              {!loading && !fetchError && filtered.length > 0 && (
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
                          'Franchisee',
                          'Branch',
                          'Items',
                          'Total',
                          'Status',
                          'Date',
                          'Action',
                        ].map((col) => (
                          <th
                            key={col}
                            style={{
                              padding: '12px 18px',
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
                      {filtered.map((order, idx) => (
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
                              padding: '14px 18px',
                              fontWeight: 700,
                              fontSize: 12,
                              color: C.brownDarker,
                              fontFamily: 'monospace',
                            }}
                          >
                            #{order.id.slice(-8).toUpperCase()}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}
                            >
                              {/* Franchisee avatar */}
                              <div
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: '50%',
                                  background: `linear-gradient(135deg,${C.brown},${C.brownDark})`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: C.yellow,
                                  fontWeight: 800,
                                  fontSize: 12,
                                  flexShrink: 0,
                                }}
                              >
                                {order.franchiseeName.charAt(0).toUpperCase()}
                              </div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: 13,
                                  color: C.brownDarker,
                                }}
                              >
                                {order.franchiseeName}
                              </div>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: '14px 18px',
                              fontSize: 12,
                              color: C.green,
                              fontWeight: 600,
                            }}
                          >
                            {order.branch}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 4,
                                maxWidth: 200,
                              }}
                            >
                              {order.items.slice(0, 3).map((item, i) => (
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
                              {order.items.length > 3 && (
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
                                  +{order.items.length - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: '14px 18px',
                              fontWeight: 900,
                              fontSize: 14,
                              color: C.brownDarker,
                            }}
                          >
                            ₱{Number(order.totalAmount).toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <StatusBadge status={order.status} />
                          </td>
                          <td
                            style={{
                              padding: '14px 18px',
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
                          <td style={{ padding: '14px 18px' }}>
                            <button
                              onClick={() => setSelected(order)}
                              style={{
                                padding: '7px 14px',
                                borderRadius: 9,
                                border: `1.5px solid ${order.status === 'pending' ? C.orange : '#E5D9C8'}`,
                                background:
                                  order.status === 'pending'
                                    ? '#FFF0D9'
                                    : '#FDFAF4',
                                color:
                                  order.status === 'pending'
                                    ? '#CC7000'
                                    : C.brownDark,
                                fontWeight: 700,
                                fontSize: 12,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all .15s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = C.yellow;
                                e.currentTarget.style.background = '#FFFAE0';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor =
                                  order.status === 'pending'
                                    ? C.orange
                                    : '#E5D9C8';
                                e.currentTarget.style.background =
                                  order.status === 'pending'
                                    ? '#FFF0D9'
                                    : '#FDFAF4';
                              }}
                            >
                              {order.status === 'pending'
                                ? '⚡ Process'
                                : '✏️ Update'}
                            </button>
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
