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
import OwnerSidebar from '@/components/owner/OwnerSidebar';

/* ── palette ── */
const PAGE_BG =
  'linear-gradient(180deg,#87ceeb 0%,#98d8e8 18%,#c8eeaa 42%,#a8dc7a 68%,#7cb342 100%)';
const C = {
  brown: '#4a2511',
  brownMid: '#654321',
  yellow: '#ffe135',
  orange: '#ff8c00',
  green: '#7cb342',
  darkGreen: '#228b22',
  textGreen: '#3d7a1c',
  muted: '#9a8478',
  rowBg: 'rgba(255,255,255,0.92)',
  rowHover: 'rgba(255,249,220,0.95)',
  rowExpanded: 'rgba(255,252,235,1)',
  rowDivider: 'rgba(74,37,17,0.08)',
  panelBg: 'rgba(255,253,240,0.98)',
  card: 'rgba(255,255,255,0.82)',
  cardBorder: 'rgba(255,255,255,0.6)',
  yellowBorder: 'rgba(255,225,53,0.7)',
  shadow: '0 2px 14px rgba(0,80,40,0.10)',
  shadowMd: '0 4px 24px rgba(34,100,34,0.13)',
};

interface Order {
  id: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number | string;
  items: {
    name: string;
    quantity: number;
    unit: string;
    totalPrice: number | string;
  }[];
  adminNote?: string;
}

const STATUS_META: Record<
  string,
  { label: string; bg: string; color: string; dot: string }
> = {
  pending: {
    label: 'Pending',
    bg: '#FEF3E2',
    color: '#A05C00',
    dot: '#E08C20',
  },
  processing: {
    label: 'Processing',
    bg: '#E8F3FB',
    color: '#1B6899',
    dot: '#3A8EBF',
  },
  shipped: {
    label: 'Shipped',
    bg: '#F0E8FB',
    color: '#6230A0',
    dot: '#8A52CA',
  },
  delivered: {
    label: 'Delivered',
    bg: '#EBF5E5',
    color: '#2E6020',
    dot: '#4A9432',
  },
  cancelled: {
    label: 'Cancelled',
    bg: '#FCEAEA',
    color: '#991B1B',
    dot: '#DC3535',
  },
};

const ALL_STATUSES = [
  'all',
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

const COLS = '160px 1fr 130px 140px 150px 36px';

function toNum(v: number | string | undefined | null): number {
  const n = parseFloat(String(v ?? 0));
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

function formatPHP(v: number | string): string {
  return (
    '₱' +
    toNum(v).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 12px',
        borderRadius: 20,
        background: m.bg,
        color: m.color,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        border: `1px solid ${m.dot}30`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: m.dot,
          flexShrink: 0,
        }}
      />
      {m.label}
    </span>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={C.brownMid}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: 'transform .22s ease',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        flexShrink: 0,
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ─────────────────────────── page ─────────────────────────── */
export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

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
  }, [router]);

  const fetchOrders = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { success: boolean; data: Order[] };
      if (data.success) setOrders(data.data);
    } catch {
      /**/
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) void fetchOrders();
  }, [user, fetchOrders]);

  if (!user) return null;

  const role = user.role as UserRole;
  const meta = ROLE_META[role];
  const isFranchiseOwner = role === 'franchise_owner';
  const filtered =
    filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  /* Summary stats */
  const totalSpent = orders
    .filter((o) => o.status === 'delivered')
    .reduce((s, o) => s + toNum(o.totalAmount), 0);
  const activeCount = orders.filter(
    (o) =>
      o.status === 'pending' ||
      o.status === 'processing' ||
      o.status === 'shipped',
  ).length;

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: "'Poppins', system-ui, sans-serif",
        background: PAGE_BG,
        backgroundAttachment: 'fixed',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Fredoka:wght@600;700&family=JetBrains+Mono:wght@500&display=swap');
        * { box-sizing: border-box; }

        .order-row { transition: background .15s, border-left-color .15s; cursor: pointer; }
        .order-row:hover { background: ${C.rowHover} !important; }

        .pill-btn { transition: all .15s; border: none; cursor: pointer; }
        .pill-btn:hover { opacity: .85; transform: translateY(-1px); }

        .hdr-btn { transition: all .13s; border: none; cursor: pointer; }
        .hdr-btn:hover { filter: brightness(1.07); transform: translateY(-1px); }
        .hdr-btn:active { transform: translateY(0); }

        .item-card { transition: transform .14s, box-shadow .14s; }
        .item-card:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.08) !important; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(100,67,33,.22); border-radius: 99px; }

        @media (max-width: 860px) {
          .tbl-head { display: none !important; }
          .tbl-row  { grid-template-columns: 1fr !important; gap: 6px !important; }
          .main-pad { padding: 14px !important; }
        }
        @media (max-width: 580px) {
          .filter-row { overflow-x: auto; flex-wrap: nowrap !important; padding-bottom: 4px; }
        }
      `}</style>

      <OwnerSidebar
        activeNav="My Orders"
        userName={user.fullName}
        userRole={role}
        onCreateAccount={isFranchiseOwner ? () => {} : undefined}
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
        {/* ── Header ── */}
        <header
          style={{
            background: 'rgba(255,255,255,0.70)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            borderBottom: `3px solid ${C.yellow}`,
            height: 70,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            padding: '0 28px',
            justifyContent: 'space-between',
            boxShadow: '0 2px 14px rgba(34,100,34,.10)',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontWeight: 700,
                fontSize: 21,
                color: C.brownMid,
                lineHeight: 1.1,
              }}
            >
              My Orders
            </div>
            <div
              style={{
                fontSize: 11,
                color: C.textGreen,
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              {meta.label} · {user.branchId ?? 'Your Branch'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="hdr-btn"
              onClick={() => router.push('/owner/products')}
              style={{
                padding: '9px 20px',
                borderRadius: 10,
                background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
                color: C.brown,
                fontWeight: 700,
                fontSize: 13,
                boxShadow: '0 3px 10px rgba(255,140,0,.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Place New Order
            </button>
            <button
              className="hdr-btn"
              onClick={() => {
                clearAuth();
                router.replace('/login');
              }}
              style={{
                padding: '9px 18px',
                borderRadius: 10,
                background: `linear-gradient(135deg,${C.brownMid},${C.brown})`,
                color: C.yellow,
                fontWeight: 700,
                fontSize: 13,
                border: '2px solid rgba(255,225,53,.30)',
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* ── Body ── */}
        <main
          className="main-pad"
          style={{ flex: 1, overflowY: 'auto', padding: '22px 26px' }}
        >
          {/* ── Summary stat tiles ── */}
          {!loading && orders.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                marginBottom: 20,
              }}
            >
              {[
                {
                  label: 'Active Orders',
                  value: activeCount,
                  sub: 'in progress',
                  accent: '#1B6899',
                  accentBg: '#E8F3FB',
                },
                {
                  label: 'Delivered',
                  value: orders.filter((o) => o.status === 'delivered').length,
                  sub: 'completed',
                  accent: '#2E6020',
                  accentBg: '#EBF5E5',
                },
                {
                  label: 'Total Spent',
                  value: formatPHP(totalSpent),
                  sub: 'delivered orders',
                  accent: C.brown,
                  accentBg: 'rgba(255,225,53,0.18)',
                  large: true,
                },
              ].map((tile, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.82)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: 14,
                    padding: '16px 18px',
                    border: `1.5px solid rgba(255,255,255,0.6)`,
                    boxShadow: C.shadow,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '.07em',
                    }}
                  >
                    {tile.label}
                  </div>
                  <div
                    style={{
                      fontSize: tile.large ? 18 : 28,
                      fontWeight: 900,
                      color: tile.accent,
                      lineHeight: 1.1,
                    }}
                  >
                    {tile.value}
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignSelf: 'flex-start',
                      padding: '2px 8px',
                      borderRadius: 20,
                      background: tile.accentBg,
                      fontSize: 10,
                      fontWeight: 600,
                      color: tile.accent,
                    }}
                  >
                    {tile.sub}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Filter pills ── */}
          <div
            className="filter-row"
            style={{
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
              marginBottom: 16,
            }}
          >
            {ALL_STATUSES.map((s) => {
              const active = filter === s;
              const m = STATUS_META[s];
              const count =
                s === 'all'
                  ? orders.length
                  : orders.filter((o) => o.status === s).length;
              return (
                <button
                  key={s}
                  className="pill-btn"
                  onClick={() => setFilter(s)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontWeight: 700,
                    fontSize: 12,
                    background: active
                      ? s === 'all'
                        ? `linear-gradient(135deg,${C.yellow},${C.orange})`
                        : m.bg
                      : 'rgba(255,255,255,0.60)',
                    color: active
                      ? s === 'all'
                        ? C.brown
                        : m.color
                      : C.brownMid,
                    border: `1.5px solid ${
                      active
                        ? s === 'all'
                          ? C.orange
                          : m.dot + '70'
                        : 'rgba(255,255,255,0.55)'
                    }`,
                    backdropFilter: 'blur(8px)',
                    boxShadow: active ? C.shadow : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  {s === 'all' ? 'All Orders' : m.label}
                  <span
                    style={{
                      minWidth: 18,
                      textAlign: 'center',
                      padding: '0 5px',
                      borderRadius: 10,
                      fontSize: 10,
                      fontWeight: 800,
                      background: active
                        ? s === 'all'
                          ? 'rgba(74,37,17,.18)'
                          : m.dot + '28'
                        : 'rgba(100,67,33,.10)',
                      color: active
                        ? s === 'all'
                          ? C.brown
                          : m.color
                        : C.muted,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Table ── */}
          {loading ? (
            <div
              style={{
                background: C.card,
                backdropFilter: 'blur(12px)',
                borderRadius: 16,
                border: `1.5px solid ${C.cardBorder}`,
                padding: '64px 24px',
                textAlign: 'center',
                color: C.muted,
                fontSize: 14,
                fontWeight: 500,
                boxShadow: C.shadow,
              }}
            >
              Loading your orders…
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                background: C.card,
                backdropFilter: 'blur(12px)',
                borderRadius: 16,
                border: `1.5px solid ${C.cardBorder}`,
                padding: '64px 24px',
                textAlign: 'center',
                boxShadow: C.shadow,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: C.brown,
                  marginBottom: 6,
                }}
              >
                {filter === 'all'
                  ? 'No orders yet'
                  : `No ${STATUS_META[filter]?.label ?? filter} orders`}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>
                {filter === 'all'
                  ? 'Your order history will appear here once you place an order.'
                  : 'Try a different filter.'}
              </div>
              {filter === 'all' && (
                <button
                  className="hdr-btn"
                  onClick={() => router.push('/owner/products')}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 10,
                    background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
                    color: C.brown,
                    fontWeight: 700,
                    fontSize: 13,
                    boxShadow: '0 3px 12px rgba(255,140,0,.25)',
                  }}
                >
                  Place Your First Order
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                background: C.card,
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                borderRadius: 16,
                border: `2px solid ${C.yellowBorder}`,
                overflow: 'hidden',
                boxShadow: C.shadowMd,
              }}
            >
              {/* Table head */}
              <div
                className="tbl-head"
                style={{
                  display: 'grid',
                  gridTemplateColumns: COLS,
                  padding: '12px 20px',
                  background: `linear-gradient(90deg,${C.brown},${C.brownMid})`,
                  gap: 12,
                }}
              >
                {['Order ID', 'Items', 'Total', 'Status', 'Date', ''].map(
                  (col) => (
                    <div
                      key={col}
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: C.yellow,
                        textTransform: 'uppercase',
                        letterSpacing: '.08em',
                      }}
                    >
                      {col}
                    </div>
                  ),
                )}
              </div>

              {/* Rows */}
              {filtered.map((order, idx) => {
                const isOpen = expanded === order.id;
                const itemsTotal = order.items.reduce(
                  (s, item) => s + toNum(item.totalPrice),
                  0,
                );

                return (
                  <div key={order.id}>
                    <div
                      className="order-row tbl-row"
                      onClick={() => setExpanded(isOpen ? null : order.id)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: COLS,
                        padding: '15px 20px',
                        gap: 12,
                        alignItems: 'center',
                        background: isOpen ? C.rowExpanded : C.rowBg,
                        borderBottom:
                          idx < filtered.length - 1 || isOpen
                            ? `1px solid ${C.rowDivider}`
                            : 'none',
                        borderLeft: isOpen
                          ? `3px solid ${C.orange}`
                          : '3px solid transparent',
                      }}
                    >
                      {/* Order ID */}
                      <div
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 500,
                          fontSize: 12,
                          color: C.brownMid,
                        }}
                      >
                        #{order.id.slice(-8).toUpperCase()}
                      </div>

                      {/* Items */}
                      <div
                        style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}
                      >
                        {order.items.slice(0, 3).map((item, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '3px 9px',
                              borderRadius: 20,
                              background: 'rgba(200,238,170,0.50)',
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#2e6010',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.name} ×{item.quantity}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span
                            style={{
                              padding: '3px 9px',
                              borderRadius: 20,
                              background: 'rgba(100,67,33,.08)',
                              fontSize: 11,
                              fontWeight: 600,
                              color: C.muted,
                            }}
                          >
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Total */}
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 13,
                          color: C.brown,
                        }}
                      >
                        {formatPHP(order.totalAmount)}
                      </div>

                      {/* Status */}
                      <StatusBadge status={order.status} />

                      {/* Date */}
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: C.brown,
                          }}
                        >
                          {new Date(order.createdAt).toLocaleDateString(
                            'en-PH',
                            { month: 'short', day: 'numeric', year: 'numeric' },
                          )}
                        </div>
                        <div
                          style={{ fontSize: 10, color: C.muted, marginTop: 2 }}
                        >
                          {new Date(order.createdAt).toLocaleTimeString(
                            'en-PH',
                            { hour: '2-digit', minute: '2-digit' },
                          )}
                        </div>
                      </div>

                      {/* Chevron */}
                      <div
                        style={{ display: 'flex', justifyContent: 'center' }}
                      >
                        <Chevron open={isOpen} />
                      </div>
                    </div>

                    {/* ── Expanded panel ── */}
                    {isOpen && (
                      <div
                        style={{
                          background: C.panelBg,
                          borderBottom: `1px solid ${C.rowDivider}`,
                          borderLeft: `3px solid ${C.orange}`,
                          padding: '20px 22px 22px',
                        }}
                      >
                        {/* Section label */}
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: C.muted,
                            textTransform: 'uppercase',
                            letterSpacing: '.08em',
                            marginBottom: 12,
                          }}
                        >
                          Order Breakdown
                        </div>

                        {/* Item cards */}
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8,
                            marginBottom: 16,
                          }}
                        >
                          {order.items.map((item, i) => (
                            <div
                              key={i}
                              className="item-card"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                                background: 'rgba(255,255,255,0.92)',
                                border: '1.5px solid rgba(255,225,53,0.30)',
                                borderRadius: 11,
                                padding: '10px 16px',
                                boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                                minWidth: 200,
                              }}
                            >
                              {/* Item color indicator */}
                              <div
                                style={{
                                  width: 4,
                                  height: 36,
                                  borderRadius: 99,
                                  background: `linear-gradient(180deg,${C.yellow},${C.orange})`,
                                  flexShrink: 0,
                                }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: C.brown,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {item.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: C.muted,
                                    marginTop: 2,
                                  }}
                                >
                                  {item.quantity} {item.unit}
                                </div>
                              </div>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 800,
                                  color: C.brownMid,
                                  flexShrink: 0,
                                }}
                              >
                                {formatPHP(item.totalPrice)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order total summary row */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: `linear-gradient(135deg,rgba(255,225,53,0.18),rgba(255,140,0,0.12))`,
                            border: `1.5px solid rgba(255,225,53,0.45)`,
                            borderRadius: 12,
                            padding: '14px 20px',
                            marginBottom: order.adminNote ? 12 : 0,
                          }}
                        >
                          <div style={{ display: 'flex', gap: 24 }}>
                            <div>
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: C.muted,
                                  textTransform: 'uppercase',
                                  letterSpacing: '.06em',
                                  marginBottom: 3,
                                }}
                              >
                                Items
                              </div>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 800,
                                  color: C.brownMid,
                                }}
                              >
                                {order.items.length} product
                                {order.items.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                            <div
                              style={{
                                width: 1,
                                background: 'rgba(74,37,17,0.12)',
                                alignSelf: 'stretch',
                              }}
                            />
                            <div>
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: C.muted,
                                  textTransform: 'uppercase',
                                  letterSpacing: '.06em',
                                  marginBottom: 3,
                                }}
                              >
                                Subtotal
                              </div>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 800,
                                  color: C.brownMid,
                                }}
                              >
                                {formatPHP(itemsTotal)}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: C.muted,
                                textTransform: 'uppercase',
                                letterSpacing: '.06em',
                                marginBottom: 3,
                              }}
                            >
                              Order Total
                            </div>
                            <div
                              style={{
                                fontSize: 20,
                                fontWeight: 900,
                                color: C.brown,
                              }}
                            >
                              {formatPHP(order.totalAmount)}
                            </div>
                          </div>
                        </div>

                        {/* Admin note */}
                        {order.adminNote && (
                          <div
                            style={{
                              display: 'flex',
                              gap: 10,
                              alignItems: 'flex-start',
                              background: 'rgba(255,248,200,0.95)',
                              border: '1px solid rgba(255,200,50,.50)',
                              borderRadius: 10,
                              padding: '10px 14px',
                            }}
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke={C.brownMid}
                              strokeWidth="2"
                              strokeLinecap="round"
                              style={{ marginTop: 1, flexShrink: 0 }}
                            >
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <div>
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  color: C.brownMid,
                                  textTransform: 'uppercase',
                                  letterSpacing: '.05em',
                                  marginBottom: 3,
                                }}
                              >
                                Admin Note
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: C.brown,
                                  fontWeight: 500,
                                }}
                              >
                                {order.adminNote}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
