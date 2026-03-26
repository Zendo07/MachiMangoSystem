'use client';

// frontend/app/owner/orders/page.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getStoredUser,
  getStoredToken,
  clearAuth,
  ROLE_META,
  type UserRole,
} from '@/lib/auth';

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

// ─── INGREDIENTS CATALOG ──────────────────────────────────────────────────────
interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  pricePerUnit: number;
  image: string;
}

const INGREDIENTS: Ingredient[] = [
  {
    id: '1',
    name: 'Fresh Mango',
    category: 'Fruits',
    unit: 'kg',
    pricePerUnit: 120,
    image: '🥭',
  },
  {
    id: '2',
    name: 'Graham Crackers',
    category: 'Dry Goods',
    unit: 'pack',
    pricePerUnit: 55,
    image: '🍪',
  },
  {
    id: '3',
    name: 'All-Purpose Cream',
    category: 'Dairy',
    unit: 'can',
    pricePerUnit: 45,
    image: '🥛',
  },
  {
    id: '4',
    name: 'Condensed Milk',
    category: 'Dairy',
    unit: 'can',
    pricePerUnit: 40,
    image: '🍶',
  },
  {
    id: '5',
    name: 'Boba Pearls',
    category: 'Dry Goods',
    unit: 'kg',
    pricePerUnit: 180,
    image: '⚫',
  },
  {
    id: '6',
    name: 'Milk Tea Base',
    category: 'Beverages',
    unit: 'L',
    pricePerUnit: 250,
    image: '🧋',
  },
  {
    id: '7',
    name: 'Sugar Syrup',
    category: 'Condiments',
    unit: 'L',
    pricePerUnit: 80,
    image: '🍯',
  },
  {
    id: '8',
    name: 'Ice Cream Mix',
    category: 'Dairy',
    unit: 'kg',
    pricePerUnit: 220,
    image: '🍦',
  },
  {
    id: '9',
    name: 'Cheese Powder',
    category: 'Dairy',
    unit: 'kg',
    pricePerUnit: 310,
    image: '🧀',
  },
  {
    id: '10',
    name: 'Pastillas Mix',
    category: 'Dry Goods',
    unit: 'kg',
    pricePerUnit: 160,
    image: '🍬',
  },
  {
    id: '11',
    name: 'Plastic Cups',
    category: 'Packaging',
    unit: 'pcs',
    pricePerUnit: 3,
    image: '🥤',
  },
  {
    id: '12',
    name: 'Paper Bags',
    category: 'Packaging',
    unit: 'pcs',
    pricePerUnit: 2,
    image: '🛍️',
  },
];

const CATEGORIES = [
  'All',
  'Fruits',
  'Dairy',
  'Dry Goods',
  'Beverages',
  'Condiments',
  'Packaging',
];

interface CartItem extends Ingredient {
  quantity: number;
  totalPrice: number;
}

// ─── ORDER STATUS TYPES ───────────────────────────────────────────────────────
interface Order {
  id: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: { name: string; quantity: number; unit: string; totalPrice: number }[];
  adminNote?: string;
}

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
        padding: '4px 10px',
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
      {m.label}
    </span>
  );
}

// ─── SUCCESS TOAST ────────────────────────────────────────────────────────────
function SuccessToast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 999,
        background: `linear-gradient(135deg,${C.darkGreen},${C.green})`,
        color: '#fff',
        borderRadius: 16,
        padding: '16px 22px',
        boxShadow: '0 8px 32px rgba(61,110,39,.35)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        maxWidth: 380,
        animation: 'slideUp .3s ease',
      }}
    >
      <div style={{ fontSize: 24 }}>✅</div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 14 }}>Order Placed!</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
          {message}
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          marginLeft: 'auto',
          background: 'rgba(255,255,255,.2)',
          border: 'none',
          borderRadius: '50%',
          width: 24,
          height: 24,
          color: '#fff',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tab, setTab] = useState<'order' | 'history'>('order');
  const [orders, setOrders] = useState<Order[]>([]);
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

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

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const token = getStoredToken();
      const res = await fetch('http://localhost:3000/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });
      const data = (await res.json()) as { success: boolean; data: Order[] };
      if (data.success) setOrders(data.data);
    } catch {
      /* ignore */
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (tab === 'history') void fetchOrders();
  }, [tab]);

  if (!user) return null;

  const role = user.role as UserRole;
  const meta = ROLE_META[role];

  // Cart helpers
  const addToCart = (ing: Ingredient) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === ing.id);
      if (ex)
        return prev.map((i) =>
          i.id === ing.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                totalPrice: (i.quantity + 1) * i.pricePerUnit,
              }
            : i,
        );
      return [...prev, { ...ing, quantity: 1, totalPrice: ing.pricePerUnit }];
    });
  };
  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((i) => i.id !== id));
  const updateQty = (id: string, qty: number) => {
    if (qty < 1) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, quantity: qty, totalPrice: qty * i.pricePerUnit }
          : i,
      ),
    );
  };
  const cartTotal = cart.reduce((s, i) => s + i.totalPrice, 0);
  const cartQty = (id: string) => cart.find((i) => i.id === id)?.quantity ?? 0;

  const placeOrder = async () => {
    if (!cart.length) return;
    setPlacing(true);
    try {
      const token = getStoredToken();
      const payload = {
        items: cart.map((i) => ({
          ingredientId: i.id,
          name: i.name,
          unit: i.unit,
          quantity: i.quantity,
          pricePerUnit: i.pricePerUnit,
          totalPrice: i.totalPrice,
        })),
        totalAmount: cartTotal,
      };
      const res = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { success: boolean; message: string };
      if (res.ok && data.success) {
        setCart([]);
        setToast('Admin is now processing your order.');
        setTab('history');
        void fetchOrders();
      }
    } catch {
      /* ignore */
    } finally {
      setPlacing(false);
    }
  };

  const filtered = INGREDIENTS.filter(
    (i) =>
      (category === 'All' || i.category === category) &&
      i.name.toLowerCase().includes(search.toLowerCase()),
  );

  const navItems = [
    { name: 'Dashboard', route: '/owner/dashboard' },
    { name: 'Products', route: '/owner/products' },
    { name: 'Orders', route: '/owner/orders' },
  ];

  return (
    <>
      {toast && <SuccessToast message={toast} onClose={() => setToast('')} />}
      <style>{`@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      <div
        style={{
          display: 'flex',
          height: '100vh',
          background: C.bg,
          overflow: 'hidden',
          fontFamily: "'Segoe UI',system-ui,sans-serif",
        }}
      >
        {/* Sidebar */}
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
            {[
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
                route: '/owner/dashboard',
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
                  </svg>
                ),
                route: '/owner/products',
              },
              {
                name: 'Orders',
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
                route: '/owner/orders',
              },
            ].map((item) => {
              const active = item.name === 'Orders';
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.route)}
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
                  {item.icon}
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
                background: 'linear-gradient(135deg,#4A9ECA,#2E7BAD)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
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
              <div
                style={{ fontWeight: 800, fontSize: 19, color: C.brownDark }}
              >
                Order Ingredients
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: C.green,
                  fontWeight: 600,
                  marginTop: 1,
                }}
              >
                {meta.emoji} {meta.label} · {user.branchId ?? 'Your Branch'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {cart.length > 0 && (
                <div
                  style={{
                    padding: '7px 14px',
                    borderRadius: 10,
                    background: `${C.orange}18`,
                    border: `1.5px solid ${C.orange}`,
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.orange,
                  }}
                >
                  🛒 {cart.length} item{cart.length > 1 ? 's' : ''} · ₱
                  {cartTotal.toLocaleString()}
                </div>
              )}
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
            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 4,
                marginBottom: 22,
                background: '#fff',
                borderRadius: 12,
                padding: 4,
                boxShadow: '0 2px 10px rgba(0,0,0,.06)',
                width: 'fit-content',
              }}
            >
              {(['order', 'history'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: '8px 22px',
                    borderRadius: 9,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 13,
                    background:
                      tab === t
                        ? `linear-gradient(135deg,${C.yellow},${C.orange})`
                        : 'transparent',
                    color: tab === t ? C.brownDarker : C.brownDark,
                    transition: 'all .18s',
                  }}
                >
                  {t === 'order' ? '🛒 Place Order' : '📋 Order History'}
                </button>
              ))}
            </div>

            {/* ── ORDER TAB ── */}
            {tab === 'order' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 340px',
                  gap: 20,
                  height: 'calc(100vh - 200px)',
                }}
              >
                {/* Ingredients list */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    minWidth: 0,
                  }}
                >
                  {/* Filters */}
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: 14,
                      padding: '14px 18px',
                      boxShadow: '0 2px 10px rgba(0,0,0,.06)',
                      display: 'flex',
                      gap: 10,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{ position: 'relative', flex: 1, minWidth: 180 }}
                    >
                      <svg
                        style={{
                          position: 'absolute',
                          left: 11,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#BBA98A',
                          pointerEvents: 'none',
                        }}
                        width="14"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search ingredients…"
                        style={{
                          width: '100%',
                          paddingLeft: 34,
                          paddingRight: 12,
                          paddingTop: 8,
                          paddingBottom: 8,
                          borderRadius: 10,
                          border: '1.5px solid #E5D9C8',
                          background: '#FDFAF4',
                          fontSize: 13,
                          outline: 'none',
                          color: C.brownDarker,
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = C.yellow)}
                        onBlur={(e) => (e.target.style.borderColor = '#E5D9C8')}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            border: `1.5px solid ${category === cat ? C.orange : '#E5D9C8'}`,
                            background:
                              category === cat ? '#FFF0D9' : 'transparent',
                            color:
                              category === cat ? C.brownDarker : C.brownDark,
                            fontWeight: category === cat ? 800 : 600,
                            fontSize: 12,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all .15s',
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid */}
                  <div style={{ overflowY: 'auto', flex: 1 }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fill,minmax(170px,1fr))',
                        gap: 12,
                      }}
                    >
                      {filtered.map((ing, i) => {
                        const qty = cartQty(ing.id);
                        return (
                          <div
                            key={ing.id}
                            style={{
                              background: '#fff',
                              borderRadius: 16,
                              border: `2px solid ${qty > 0 ? C.yellow : '#F0E8D8'}`,
                              overflow: 'hidden',
                              boxShadow:
                                qty > 0
                                  ? '0 4px 16px rgba(245,200,66,.2)'
                                  : '0 2px 8px rgba(0,0,0,.06)',
                              opacity: loaded ? 1 : 0,
                              transform: loaded
                                ? 'translateY(0)'
                                : 'translateY(12px)',
                              transition: `opacity .35s ${Math.min(i * 0.03, 0.3)}s, transform .35s ${Math.min(i * 0.03, 0.3)}s, border .2s`,
                            }}
                          >
                            <div
                              style={{
                                height: 72,
                                background:
                                  'linear-gradient(135deg,#F2EAD8,#EFE0C8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 36,
                              }}
                            >
                              {ing.image}
                            </div>
                            <div style={{ padding: '10px 12px' }}>
                              <div
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  color: C.orange,
                                  textTransform: 'uppercase',
                                  letterSpacing: '.1em',
                                  marginBottom: 2,
                                }}
                              >
                                {ing.category}
                              </div>
                              <div
                                style={{
                                  fontWeight: 800,
                                  fontSize: 12,
                                  color: C.brownDarker,
                                  marginBottom: 4,
                                  lineHeight: 1.3,
                                }}
                              >
                                {ing.name}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  marginBottom: 8,
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 900,
                                    fontSize: 15,
                                    color: C.brownDarker,
                                  }}
                                >
                                  ₱{ing.pricePerUnit}
                                </span>
                                <span style={{ fontSize: 10, color: '#AAA' }}>
                                  /{ing.unit}
                                </span>
                              </div>
                              {qty === 0 ? (
                                <button
                                  onClick={() => addToCart(ing)}
                                  style={{
                                    width: '100%',
                                    padding: '7px 0',
                                    borderRadius: 9,
                                    border: 'none',
                                    background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
                                    color: C.brownDarker,
                                    fontWeight: 700,
                                    fontSize: 12,
                                    cursor: 'pointer',
                                  }}
                                >
                                  + Add
                                </button>
                              ) : (
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                  }}
                                >
                                  <button
                                    onClick={() => updateQty(ing.id, qty - 1)}
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: 8,
                                      border: `1.5px solid ${C.orange}`,
                                      background: '#FFF0D9',
                                      color: C.brownDarker,
                                      fontWeight: 800,
                                      fontSize: 15,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    −
                                  </button>
                                  <span
                                    style={{
                                      flex: 1,
                                      textAlign: 'center',
                                      fontWeight: 800,
                                      fontSize: 14,
                                      color: C.brownDarker,
                                    }}
                                  >
                                    {qty}
                                  </span>
                                  <button
                                    onClick={() => updateQty(ing.id, qty + 1)}
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: 8,
                                      border: `1.5px solid ${C.orange}`,
                                      background: '#FFF0D9',
                                      color: C.brownDarker,
                                      fontWeight: 800,
                                      fontSize: 15,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Cart panel */}
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 18,
                    boxShadow: '0 2px 16px rgba(0,0,0,.08)',
                    border: `2px solid ${C.yellow}30`,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '18px 20px',
                      borderBottom: `2px solid ${C.yellow}30`,
                      background: `linear-gradient(90deg,${C.yellow}18,${C.orange}10)`,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 16,
                        color: C.brownDark,
                      }}
                    >
                      🛒 Your Order
                    </div>
                    <div style={{ fontSize: 11, color: '#AAA', marginTop: 2 }}>
                      {cart.length === 0
                        ? 'No items yet'
                        : `${cart.length} item${cart.length > 1 ? 's' : ''} selected`}
                    </div>
                  </div>

                  <div
                    style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}
                  >
                    {cart.length === 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          gap: 8,
                        }}
                      >
                        <div style={{ fontSize: 40 }}>🛒</div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: C.brownDark,
                          }}
                        >
                          Cart is empty
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: '#AAA',
                            textAlign: 'center',
                          }}
                        >
                          Add ingredients from the catalog
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                        }}
                      >
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '10px 12px',
                              borderRadius: 10,
                              background: '#FDFAF4',
                              border: '1.5px solid #F0E8D8',
                            }}
                          >
                            <span style={{ fontSize: 20 }}>{item.image}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: 12,
                                  color: C.brownDarker,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {item.name}
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: '#AAA',
                                  marginTop: 1,
                                }}
                              >
                                {item.quantity} {item.unit} × ₱
                                {item.pricePerUnit}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div
                                style={{
                                  fontWeight: 800,
                                  fontSize: 13,
                                  color: C.brownDarker,
                                }}
                              >
                                ₱{item.totalPrice.toLocaleString()}
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                style={{
                                  fontSize: 10,
                                  color: '#C62828',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  padding: 0,
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div
                      style={{
                        padding: '14px 16px',
                        borderTop: `2px solid ${C.yellow}30`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 12,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: C.brownDark,
                          }}
                        >
                          Total
                        </span>
                        <span
                          style={{
                            fontWeight: 900,
                            fontSize: 18,
                            color: C.brownDarker,
                          }}
                        >
                          ₱{cartTotal.toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={placeOrder}
                        disabled={placing}
                        style={{
                          width: '100%',
                          padding: '12px 0',
                          borderRadius: 12,
                          border: 'none',
                          background: placing
                            ? '#CCC'
                            : `linear-gradient(135deg,${C.green},${C.darkGreen})`,
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: 14,
                          cursor: placing ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 14px rgba(61,110,39,.3)',
                          transition: 'all .2s',
                        }}
                      >
                        {placing ? '⏳ Placing Order…' : '✅ Place Order'}
                      </button>
                      <div
                        style={{
                          fontSize: 10,
                          color: '#AAA',
                          textAlign: 'center',
                          marginTop: 8,
                        }}
                      >
                        Admin will process your order after confirmation
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── HISTORY TAB ── */}
            {tab === 'history' && (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {loadingOrders ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: 60,
                      color: '#AAA',
                      fontSize: 14,
                    }}
                  >
                    Loading orders…
                  </div>
                ) : orders.length === 0 ? (
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: 18,
                      padding: 60,
                      textAlign: 'center',
                      boxShadow: '0 2px 12px rgba(0,0,0,.07)',
                    }}
                  >
                    <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: C.brownDark,
                        marginBottom: 6,
                      }}
                    >
                      No orders yet
                    </div>
                    <div style={{ fontSize: 12, color: '#AAA' }}>
                      Your order history will appear here
                    </div>
                    <button
                      onClick={() => setTab('order')}
                      style={{
                        marginTop: 16,
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
                      Place First Order
                    </button>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        background: '#fff',
                        borderRadius: 16,
                        padding: '18px 22px',
                        boxShadow: '0 2px 12px rgba(0,0,0,.07)',
                        border: `2px solid ${order.status === 'processing' ? C.yellow : '#F0E8D8'}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 12,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: 14,
                              color: C.brownDarker,
                            }}
                          >
                            Order #{order.id.slice(-8).toUpperCase()}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: '#AAA',
                              marginTop: 2,
                            }}
                          >
                            {new Date(order.createdAt).toLocaleDateString(
                              'en-PH',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )}
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                          }}
                        >
                          <StatusBadge status={order.status} />
                          <span
                            style={{
                              fontWeight: 900,
                              fontSize: 16,
                              color: C.brownDarker,
                            }}
                          >
                            ₱{Number(order.totalAmount).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Status message */}
                      {order.status === 'processing' && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 12px',
                            borderRadius: 10,
                            background: '#E0F2FA',
                            border: '1.5px solid #4A9ECA',
                            marginBottom: 10,
                          }}
                        >
                          <span>⚙️</span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#2E7BAD',
                            }}
                          >
                            Admin is now processing your order!
                          </span>
                        </div>
                      )}
                      {order.adminNote && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 12px',
                            borderRadius: 10,
                            background: '#FFFAE0',
                            border: `1.5px solid ${C.yellow}`,
                            marginBottom: 10,
                          }}
                        >
                          <span>💬</span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: C.brownDark,
                            }}
                          >
                            Admin note: {order.adminNote}
                          </span>
                        </div>
                      )}

                      {/* Items summary */}
                      <div
                        style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}
                      >
                        {order.items.map((item, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 20,
                              background: '#F2EAD8',
                              fontSize: 11,
                              fontWeight: 600,
                              color: C.brownDark,
                            }}
                          >
                            {item.name} × {item.quantity} {item.unit}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
