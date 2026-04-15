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

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  category: string;
  price: number | string; // TypeORM decimal columns serialize as strings from the API
  stock: number;
  image: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  sales: number;
}

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number; // always a parsed float — never a string
  stock: number;
  image: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  sales: number;
  quantity: number;
  totalPrice: number; // quantity × price, rounded to 2 dp
}

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

// ─── HELPERS ─────────────────────────────────────────────────────────────────
/** Safely parse any price value (string | number) to a float rounded to 2 dp */
function toNum(v: number | string | undefined | null): number {
  const n = parseFloat(String(v ?? 0));
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

/** Format as Philippine Peso with 2 decimal places */
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
      {m.icon} {m.label}
    </span>
  );
}

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

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tab, setTab] = useState<'order' | 'history'>('order');
  const [orders, setOrders] = useState<Order[]>([]);
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState('');
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
  }, [router]);

  // ─── FETCH ────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    setLoadingProducts(true);
    setProductError('');
    try {
      const res = await fetch('http://localhost:3000/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { success: boolean; data: Product[] };
      if (data.success) setProducts(data.data);
      else setProductError('Failed to load products');
    } catch {
      setProductError('Cannot reach backend. Is it running?');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    setLoadingOrders(true);
    try {
      const res = await fetch('http://localhost:3000/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { success: boolean; data: Order[] };
      if (data.success) setOrders(data.data);
    } catch {
      /**/
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (user) void fetchProducts();
  }, [user, fetchProducts]);
  useEffect(() => {
    if (tab === 'history') void fetchOrders();
  }, [tab, fetchOrders]);

  if (!user) return null;

  const role = user.role as UserRole;
  const meta = ROLE_META[role];

  // ─── CART HELPERS ─────────────────────────────────────────────────────────
  const addToCart = (product: Product) => {
    const unitPrice = toNum(product.price); // parse ONCE here
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        const newQty = existing.quantity + 1;
        return prev.map((i) =>
          i.id === product.id
            ? {
                ...i,
                quantity: newQty,
                totalPrice: Math.round(newQty * i.price * 100) / 100,
              }
            : i,
        );
      }
      return [
        ...prev,
        {
          ...product,
          price: unitPrice,
          quantity: 1,
          totalPrice: unitPrice,
        } as CartItem,
      ];
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
          ? {
              ...i,
              quantity: qty,
              totalPrice: Math.round(qty * i.price * 100) / 100,
            }
          : i,
      ),
    );
  };

  // Sum line totals and round to avoid floating-point drift
  const cartTotal =
    Math.round(cart.reduce((s, i) => s + i.totalPrice, 0) * 100) / 100;
  const cartQty = (id: string) => cart.find((i) => i.id === id)?.quantity ?? 0;

  // ─── PLACE ORDER ──────────────────────────────────────────────────────────
  const placeOrder = async () => {
    if (!cart.length) return;
    setPlacing(true);
    try {
      const token = getStoredToken();
      const payload = {
        items: cart.map((i) => ({
          ingredientId: i.id,
          name: i.name,
          unit: 'pcs',
          quantity: i.quantity,
          pricePerUnit: i.price,
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
      /**/
    } finally {
      setPlacing(false);
    }
  };

  // ─── FILTER ───────────────────────────────────────────────────────────────
  const allCategories = [
    'All',
    ...Array.from(new Set(products.map((p) => p.category))),
  ];
  const filtered = products.filter(
    (p) =>
      (categoryFilter === 'All' || p.category === categoryFilter) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const navItems = [
    { name: 'Dashboard', icon: '⊞', route: '/owner/dashboard' },
    { name: 'Products', icon: '📦', route: '/owner/products' },
    { name: 'Orders', icon: '🛒', route: '/owner/orders' },
  ];

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      {toast && <SuccessToast message={toast} onClose={() => setToast('')} />}

      <div
        style={{
          display: 'flex',
          height: '100vh',
          background: C.bg,
          overflow: 'hidden',
          fontFamily: "'Segoe UI',system-ui,sans-serif",
        }}
      >
        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
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
            {navItems.map((item) => {
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
                    fontSize: 18,
                    transition: 'all .18s',
                  }}
                  onMouseEnter={(e) => {
                    if (!active)
                      e.currentTarget.style.background = 'rgba(245,200,66,.1)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active)
                      e.currentTarget.style.background = 'transparent';
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
          {/* ── Header ───────────────────────────────────────────────────── */}
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
                Order Products
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
                  🛒 {cart.length} item{cart.length > 1 ? 's' : ''} ·{' '}
                  {formatPHP(cartTotal)}
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

            {/* ══ ORDER TAB ══════════════════════════════════════════════════ */}
            {tab === 'order' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 340px',
                  gap: 20,
                  height: 'calc(100vh - 200px)',
                }}
              >
                {/* Left: Product catalog */}
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
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products…"
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
                      {allCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            border: `1.5px solid ${categoryFilter === cat ? C.orange : '#E5D9C8'}`,
                            background:
                              categoryFilter === cat
                                ? '#FFF0D9'
                                : 'transparent',
                            color:
                              categoryFilter === cat
                                ? C.brownDarker
                                : C.brownDark,
                            fontWeight: categoryFilter === cat ? 800 : 600,
                            fontSize: 12,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error */}
                  {productError && (
                    <div
                      style={{
                        padding: '14px 18px',
                        background: '#FFEBEE',
                        borderRadius: 12,
                        border: '1.5px solid #EF9A9A',
                        color: '#C62828',
                        fontWeight: 600,
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      ⚠️ {productError}
                      <button
                        onClick={() => void fetchProducts()}
                        style={{
                          marginLeft: 'auto',
                          padding: '6px 14px',
                          borderRadius: 8,
                          border: 'none',
                          background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
                          color: C.brownDarker,
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Loading */}
                  {loadingProducts && (
                    <div
                      style={{
                        padding: 48,
                        textAlign: 'center',
                        color: '#AAA',
                        fontSize: 13,
                      }}
                    >
                      Loading products from HQ…
                    </div>
                  )}

                  {/* Product grid */}
                  {!loadingProducts && !productError && (
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(auto-fill,minmax(170px,1fr))',
                          gap: 12,
                        }}
                      >
                        {filtered.map((product) => {
                          const qty = cartQty(product.id);
                          const unitPrice = toNum(product.price);
                          const outOfStock = product.status === 'Out of Stock';
                          return (
                            <div
                              key={product.id}
                              style={{
                                background: '#fff',
                                borderRadius: 16,
                                overflow: 'hidden',
                                border: `2px solid ${qty > 0 ? C.yellow : outOfStock ? '#FFCDD2' : '#F0E8D8'}`,
                                boxShadow:
                                  qty > 0
                                    ? '0 4px 16px rgba(245,200,66,.2)'
                                    : '0 2px 8px rgba(0,0,0,.06)',
                                opacity: outOfStock ? 0.7 : 1,
                                transition: 'border .2s',
                              }}
                            >
                              {/* Thumbnail */}
                              <div
                                style={{
                                  height: 72,
                                  background: outOfStock
                                    ? '#F5F5F5'
                                    : 'linear-gradient(135deg,#F2EAD8,#EFE0C8)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 36,
                                  position: 'relative',
                                }}
                              >
                                {product.image}
                                {outOfStock && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      inset: 0,
                                      background: 'rgba(0,0,0,.3)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: '#fff',
                                        fontWeight: 800,
                                        fontSize: 10,
                                        textTransform: 'uppercase',
                                        letterSpacing: '.05em',
                                      }}
                                    >
                                      Out of Stock
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Info */}
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
                                  {product.category}
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
                                  {product.name}
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
                                    {formatPHP(unitPrice)}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 10,
                                      color:
                                        product.stock <= 10
                                          ? '#CC7000'
                                          : '#AAA',
                                    }}
                                  >
                                    {product.stock <= 10 && product.stock > 0
                                      ? `⚠️ ${product.stock} left`
                                      : outOfStock
                                        ? '🚫'
                                        : `${product.stock} in stock`}
                                  </span>
                                </div>

                                {/* Add / qty controls */}
                                {outOfStock ? (
                                  <div
                                    style={{
                                      width: '100%',
                                      padding: '7px 0',
                                      borderRadius: 9,
                                      background: '#F5F5F5',
                                      color: '#AAA',
                                      fontWeight: 700,
                                      fontSize: 12,
                                      textAlign: 'center',
                                    }}
                                  >
                                    Unavailable
                                  </div>
                                ) : qty === 0 ? (
                                  <button
                                    onClick={() => addToCart(product)}
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
                                      onClick={() =>
                                        updateQty(product.id, qty - 1)
                                      }
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
                                      onClick={() =>
                                        updateQty(product.id, qty + 1)
                                      }
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
                        {filtered.length === 0 && (
                          <div
                            style={{
                              gridColumn: '1 / -1',
                              padding: 48,
                              textAlign: 'center',
                              color: '#AAA',
                              fontSize: 13,
                            }}
                          >
                            No products found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Cart panel */}
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
                  {/* Cart header */}
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

                  {/* Cart items */}
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
                          Add products from the catalog
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
                                {item.quantity} × {formatPHP(item.price)}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div
                                style={{
                                  fontWeight: 800,
                                  fontSize: 13,
                                  color: C.brownDarker,
                                }}
                              >
                                {formatPHP(item.totalPrice)}
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

                  {/* Cart footer — subtotals + grand total */}
                  {cart.length > 0 && (
                    <div
                      style={{
                        padding: '14px 16px',
                        borderTop: `2px solid ${C.yellow}30`,
                      }}
                    >
                      {/* Line subtotals */}
                      <div
                        style={{
                          marginBottom: 8,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 3,
                        }}
                      >
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: 11,
                              color: '#999',
                            }}
                          >
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                            <span>{formatPHP(item.totalPrice)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Divider */}
                      <div
                        style={{
                          height: 1,
                          background: '#F0E8D8',
                          margin: '8px 0',
                        }}
                      />

                      {/* Grand total */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 14,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: 14,
                            color: C.brownDark,
                          }}
                        >
                          Grand Total
                        </span>
                        <span
                          style={{
                            fontWeight: 900,
                            fontSize: 20,
                            color: C.brownDarker,
                          }}
                        >
                          {formatPHP(cartTotal)}
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

            {/* ══ HISTORY TAB ════════════════════════════════════════════════ */}
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
                      {/* Order header */}
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
                        </div>
                      </div>

                      {/* Item breakdown */}
                      <div
                        style={{
                          background: '#FDFAF4',
                          borderRadius: 10,
                          padding: '10px 14px',
                          border: '1px solid #F0E8D8',
                          marginBottom: order.adminNote ? 10 : 0,
                        }}
                      >
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              paddingBottom: i < order.items.length - 1 ? 6 : 0,
                              marginBottom: i < order.items.length - 1 ? 6 : 0,
                              borderBottom:
                                i < order.items.length - 1
                                  ? '1px solid #F0E8D8'
                                  : 'none',
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: C.brownDark,
                              }}
                            >
                              {item.name} × {item.quantity}
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: C.brownDarker,
                              }}
                            >
                              {formatPHP(item.totalPrice)}
                            </span>
                          </div>
                        ))}
                        {/* Total row */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: 8,
                            paddingTop: 8,
                            borderTop: `2px solid ${C.yellow}50`,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: C.brownDark,
                            }}
                          >
                            Total
                          </span>
                          <span
                            style={{
                              fontSize: 15,
                              fontWeight: 900,
                              color: C.brownDarker,
                            }}
                          >
                            {formatPHP(order.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Admin note */}
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
                            marginTop: 10,
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
