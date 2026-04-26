'use client';

import { API_BASE } from '@/lib/config';
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

const C = {
  brownDarker: '#4a2511',
  brownDark: '#654321',
  yellow: '#ffe135',
  orange: '#ff8c00',
  green: '#7cb342',
  darkGreen: '#228b22',
  card: 'rgba(255,255,255,0.72)',
  cardBorder: 'rgba(255,255,255,0.55)',
  cardShadow: '0 2px 14px rgba(0,80,40,0.10)',
  panelBg: 'rgba(255,255,255,0.68)',
  inputBg: 'rgba(255,255,255,0.85)',
  inputBorder: 'rgba(124,179,66,0.30)',
  textPrimary: '#4a2511',
  textSecondary: '#654321',
  textMuted: '#999',
  textGreen: '#3d7a1c',
};

const PAGE_BG =
  'linear-gradient(180deg, #87ceeb 0%, #98d8e8 18%, #c8eeaa 42%, #a8dc7a 68%, #7cb342 100%)';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number | string;
  stock: number;
  image: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  sales: number;
}

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  sales: number;
  quantity: number;
  totalPrice: number;
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

function ImgPlaceholder({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(124,179,66,0.5)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
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
        boxShadow: '0 8px 32px rgba(34,139,34,.30)',
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

// ─── QUANTITY INPUT ────────────────────────────────────────────────────────────
// Replaces the +/− buttons with a plain typeable number field.
function QtyInput({
  qty,
  onUpdate,
}: {
  qty: number;
  onUpdate: (n: number) => void;
}) {
  const [raw, setRaw] = useState(String(qty));

  // Keep raw in sync when parent qty changes (e.g. addToCart increments)
  useEffect(() => {
    setRaw(String(qty));
  }, [qty]);

  const handleChange = (val: string) => {
    // Allow empty or digits only — no negatives, no letters
    if (val === '' || /^\d+$/.test(val)) {
      setRaw(val);
      const n = parseInt(val, 10);
      if (!isNaN(n)) onUpdate(n); // 0 → removeFromCart handled by updateQty
    }
  };

  const handleBlur = () => {
    const n = parseInt(raw, 10);
    if (isNaN(n) || raw === '') {
      setRaw('0');
      onUpdate(0);
    } else {
      setRaw(String(n));
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={raw}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      style={{
        width: '100%',
        textAlign: 'center',
        fontWeight: 800,
        fontSize: 14,
        color: C.textPrimary,
        border: `1.5px solid ${C.orange}`,
        borderRadius: 9,
        padding: '6px 4px',
        outline: 'none',
        background: 'rgba(255,240,217,0.8)',
        boxSizing: 'border-box',
        cursor: 'text',
        transition: 'border-color .15s, box-shadow .15s',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = C.yellow;
        e.currentTarget.style.boxShadow = `0 0 0 3px rgba(255,225,53,0.22)`;
        e.currentTarget.select();
      }}
      onMouseLeave={(e) => {
        if (document.activeElement !== e.currentTarget) {
          e.currentTarget.style.borderColor = C.orange;
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    />
  );
}

export default function ProductsPage() {
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

  const fetchProducts = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    setLoadingProducts(true);
    setProductError('');
    try {
      const res = await fetch(`${API_BASE}/products`, {
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
      const res = await fetch(`${API_BASE}/orders/my-orders`, {
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
  const isFranchiseOwner = role === 'franchise_owner';

  const addToCart = (product: Product) => {
    const unitPrice = toNum(product.price);
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

  const cartTotal =
    Math.round(cart.reduce((s, i) => s + i.totalPrice, 0) * 100) / 100;
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
          unit: 'pcs',
          quantity: i.quantity,
          pricePerUnit: i.price,
          totalPrice: i.totalPrice,
        })),
        totalAmount: cartTotal,
      };
      const res = await fetch(`${API_BASE}/orders`, {
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

  const allCategories = [
    'All',
    ...Array.from(new Set(products.map((p) => p.category))),
  ];
  const filtered = products.filter(
    (p) =>
      (categoryFilter === 'All' || p.category === categoryFilter) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {toast && <SuccessToast message={toast} onClose={() => setToast('')} />}

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
        <OwnerSidebar
          activeNav="Products"
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
              background: 'rgba(255,255,255,0.68)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderBottom: `3px solid ${C.yellow}`,
              padding: '0 28px',
              height: 70,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              boxShadow: '0 2px 14px rgba(34,100,34,0.10)',
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 19,
                  color: C.brownDark,
                  fontFamily: "'Fredoka', sans-serif",
                }}
              >
                Order Products
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: C.textGreen,
                  fontWeight: 600,
                  marginTop: 1,
                }}
              >
                {meta.label} · {user.branchId ?? 'Your Branch'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {cart.length > 0 && (
                <div
                  style={{
                    padding: '7px 14px',
                    borderRadius: 10,
                    background: 'rgba(255,140,0,0.12)',
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
                  border: '2px solid rgba(255,225,53,.35)',
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

          {/* ── Main ── */}
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 24,
              background: 'transparent',
            }}
          >
            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 4,
                marginBottom: 20,
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: 12,
                padding: 4,
                boxShadow: C.cardShadow,
                border: `1.5px solid ${C.cardBorder}`,
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
                    boxShadow:
                      tab === t ? '0 3px 10px rgba(255,140,0,0.25)' : 'none',
                  }}
                >
                  {t === 'order' ? ' Place Order' : ' Order History'}
                </button>
              ))}
            </div>

            {/* ══ ORDER TAB ══ */}
            {tab === 'order' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 300px',
                  gap: 20,
                  height: 'calc(100vh - 170px)',
                  minWidth: 0,
                }}
              >
                {/* ── Left: Product catalog ── */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    minWidth: 0,
                    overflow: 'hidden',
                  }}
                >
                  {/* Filters */}
                  <div
                    style={{
                      background: C.panelBg,
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: `1.5px solid ${C.cardBorder}`,
                      borderRadius: 14,
                      padding: '12px 16px',
                      boxShadow: C.cardShadow,
                      display: 'flex',
                      gap: 10,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{ position: 'relative', flex: 1, minWidth: 160 }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          left: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: 14,
                          opacity: 0.4,
                        }}
                      >
                        🔍
                      </span>
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
                          border: `1.5px solid ${C.inputBorder}`,
                          background: C.inputBg,
                          fontSize: 13,
                          outline: 'none',
                          color: C.textPrimary,
                          boxSizing: 'border-box',
                          transition: 'border-color .18s',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = C.yellow)}
                        onBlur={(e) =>
                          (e.target.style.borderColor = C.inputBorder)
                        }
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {allCategories.map((cat) => {
                        const active = categoryFilter === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              border: `1.5px solid ${active ? C.orange : 'rgba(124,179,66,0.3)'}`,
                              background: active
                                ? 'rgba(255,140,0,0.14)'
                                : 'rgba(255,255,255,0.5)',
                              color: active ? C.brownDarker : C.brownDark,
                              fontWeight: active ? 800 : 600,
                              fontSize: 12,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              transition: 'all .15s',
                            }}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {productError && (
                    <div
                      style={{
                        padding: '14px 18px',
                        background: 'rgba(255,235,238,0.85)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: 12,
                        border: '1.5px solid #EF9A9A',
                        color: '#C62828',
                        fontWeight: 600,
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        flexShrink: 0,
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

                  {loadingProducts && (
                    <div
                      style={{
                        padding: 48,
                        textAlign: 'center',
                        color: C.brownDark,
                        fontSize: 13,
                        background: 'rgba(255,255,255,0.5)',
                        borderRadius: 14,
                        border: `1.5px solid ${C.cardBorder}`,
                        flexShrink: 0,
                      }}
                    >
                      ⏳ Loading products from HQ…
                    </div>
                  )}

                  {/* Scrollable product grid */}
                  {!loadingProducts && !productError && (
                    <div
                      style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(auto-fill, minmax(160px, 1fr))',
                          gap: 12,
                        }}
                      >
                        {filtered.map((product) => {
                          const qty = cartQty(product.id);
                          const unitPrice = toNum(product.price);
                          const outOfStock = product.status === 'Out of Stock';
                          const hasImage =
                            product.image &&
                            (product.image.startsWith('http') ||
                              product.image.startsWith('data:'));

                          return (
                            <div
                              key={product.id}
                              style={{
                                background: C.card,
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                borderRadius: 14,
                                overflow: 'hidden',
                                border: `1.5px solid ${qty > 0 ? C.yellow : outOfStock ? 'rgba(255,205,210,0.8)' : C.cardBorder}`,
                                boxShadow:
                                  qty > 0
                                    ? '0 4px 16px rgba(255,225,53,0.22)'
                                    : C.cardShadow,
                                opacity: outOfStock ? 0.7 : 1,
                                transition: 'border .2s',
                              }}
                            >
                              {/* Image */}
                              <div
                                style={{
                                  height: 100,
                                  position: 'relative',
                                  overflow: 'hidden',
                                  background: hasImage
                                    ? 'transparent'
                                    : 'linear-gradient(135deg,rgba(200,238,170,0.6),rgba(168,220,122,0.5))',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderBottom: `1px solid ${C.cardBorder}`,
                                }}
                              >
                                {hasImage ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      display: 'block',
                                    }}
                                  />
                                ) : (
                                  <ImgPlaceholder size={28} />
                                )}
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: 6,
                                    right: 6,
                                    zIndex: 2,
                                  }}
                                >
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      padding: '3px 7px',
                                      borderRadius: 20,
                                      background: outOfStock
                                        ? '#FFEBEE'
                                        : product.status === 'Low Stock'
                                          ? '#FFF3E0'
                                          : '#EAF5E9',
                                      color: outOfStock
                                        ? '#C62828'
                                        : product.status === 'Low Stock'
                                          ? '#E65100'
                                          : '#2E7D32',
                                      fontSize: 9,
                                      fontWeight: 700,
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: 4,
                                        height: 4,
                                        borderRadius: '50%',
                                        background: outOfStock
                                          ? '#EF5350'
                                          : product.status === 'Low Stock'
                                            ? '#FB8C00'
                                            : '#43A047',
                                      }}
                                    />
                                    {product.status}
                                  </span>
                                </div>
                                {outOfStock && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      inset: 0,
                                      background: 'rgba(0,0,0,.35)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: 10,
                                        textTransform: 'uppercase',
                                        letterSpacing: '.06em',
                                      }}
                                    >
                                      Out of Stock
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div style={{ padding: '9px 10px' }}>
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
                                    color: C.textPrimary,
                                    marginBottom: 5,
                                    lineHeight: 1.3,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {product.name}
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 5,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontWeight: 900,
                                      fontSize: 14,
                                      color: C.textPrimary,
                                    }}
                                  >
                                    {formatPHP(unitPrice)}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 9,
                                      color:
                                        product.stock <= 10
                                          ? '#CC7000'
                                          : C.textMuted,
                                    }}
                                  >
                                    {product.stock <= 10 && product.stock > 0
                                      ? `⚠️ ${product.stock} left`
                                      : outOfStock
                                        ? ''
                                        : `${product.stock} in stock`}
                                  </span>
                                </div>

                                {/* Stock bar */}
                                <div
                                  style={{
                                    height: 3,
                                    background: 'rgba(124,179,66,0.2)',
                                    borderRadius: 10,
                                    overflow: 'hidden',
                                    marginBottom: 8,
                                  }}
                                >
                                  <div
                                    style={{
                                      height: '100%',
                                      borderRadius: 10,
                                      background:
                                        product.stock === 0
                                          ? '#EF5350'
                                          : product.stock <= 10
                                            ? '#FB8C00'
                                            : '#43A047',
                                      width: `${Math.min(100, (product.stock / 200) * 100)}%`,
                                      transition: 'width .4s',
                                    }}
                                  />
                                </div>

                                {outOfStock ? (
                                  <div
                                    style={{
                                      width: '100%',
                                      padding: '6px 0',
                                      borderRadius: 9,
                                      background: 'rgba(245,245,245,0.7)',
                                      color: '#AAA',
                                      fontWeight: 700,
                                      fontSize: 11,
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
                                      boxShadow:
                                        '0 2px 8px rgba(255,140,0,0.25)',
                                      transition: 'transform .15s',
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.transform =
                                        'scale(1.02)')
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.transform =
                                        'scale(1)')
                                    }
                                  >
                                    + Add to Order
                                  </button>
                                ) : (
                                  /* ── Quantity input replaces the +/− buttons ── */
                                  <QtyInput
                                    qty={qty}
                                    onUpdate={(n) => updateQty(product.id, n)}
                                  />
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
                              color: C.brownDark,
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

                {/* ── Right: Cart panel ── */}
                <div
                  style={{
                    background: C.panelBg,
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    borderRadius: 18,
                    boxShadow: '0 4px 24px rgba(34,100,34,0.13)',
                    border: `1.5px solid ${C.cardBorder}`,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      padding: '16px 18px',
                      borderBottom: `2px solid rgba(255,225,53,0.25)`,
                      background: 'rgba(255,255,255,0.28)',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 15,
                        color: C.brownDark,
                        fontFamily: "'Fredoka', sans-serif",
                      }}
                    >
                      🛒 Your Order
                    </div>
                    <div
                      style={{ fontSize: 11, color: C.textGreen, marginTop: 2 }}
                    >
                      {cart.length === 0
                        ? 'No items yet'
                        : `${cart.length} item${cart.length > 1 ? 's' : ''} selected`}
                    </div>
                  </div>

                  <div
                    style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}
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
                        <div style={{ fontSize: 36, opacity: 0.35 }}>🛒</div>
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
                            color: C.textMuted,
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
                        {cart.map((item) => {
                          const hasImage =
                            item.image &&
                            (item.image.startsWith('http') ||
                              item.image.startsWith('data:'));
                          return (
                            <div
                              key={item.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '9px 10px',
                                borderRadius: 10,
                                background: 'rgba(255,255,255,0.5)',
                                border: `1.5px solid rgba(144,238,144,0.25)`,
                              }}
                            >
                              <div
                                style={{
                                  width: 38,
                                  height: 38,
                                  borderRadius: 9,
                                  overflow: 'hidden',
                                  background: hasImage
                                    ? 'transparent'
                                    : 'linear-gradient(135deg,rgba(200,238,170,0.6),rgba(168,220,122,0.5))',
                                  flexShrink: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {hasImage ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      display: 'block',
                                    }}
                                  />
                                ) : (
                                  <ImgPlaceholder size={18} />
                                )}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    fontSize: 12,
                                    color: C.textPrimary,
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
                                    color: C.textGreen,
                                    marginTop: 1,
                                  }}
                                >
                                  {item.quantity} × {formatPHP(item.price)}
                                </div>
                              </div>
                              <div
                                style={{ textAlign: 'right', flexShrink: 0 }}
                              >
                                <div
                                  style={{
                                    fontWeight: 800,
                                    fontSize: 12,
                                    color: C.textPrimary,
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
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div
                      style={{
                        padding: '12px 14px',
                        borderTop: `2px solid rgba(255,225,53,0.25)`,
                        background: 'rgba(255,255,255,0.28)',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          marginBottom: 6,
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
                              color: C.textGreen,
                            }}
                          >
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                            <span>{formatPHP(item.totalPrice)}</span>
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          height: 1,
                          background: 'rgba(124,179,66,0.2)',
                          margin: '8px 0',
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 12,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: 13,
                            color: C.brownDark,
                          }}
                        >
                          Grand Total
                        </span>
                        <span
                          style={{
                            fontWeight: 900,
                            fontSize: 18,
                            color: C.textPrimary,
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
                          padding: '11px 0',
                          borderRadius: 12,
                          border: 'none',
                          background: placing
                            ? '#CCC'
                            : `linear-gradient(135deg,${C.green},${C.darkGreen})`,
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: 14,
                          cursor: placing ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 14px rgba(34,139,34,.28)',
                        }}
                      >
                        {placing ? ' Placing Order…' : ' Place Order'}
                      </button>
                      <div
                        style={{
                          fontSize: 10,
                          color: C.textMuted,
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

            {/* ══ HISTORY TAB ══ */}
            {tab === 'history' && (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {loadingOrders ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: 60,
                      color: C.brownDark,
                      fontSize: 14,
                    }}
                  >
                    ⏳ Loading orders…
                  </div>
                ) : orders.length === 0 ? (
                  <div
                    style={{
                      background: C.panelBg,
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: `1.5px solid ${C.cardBorder}`,
                      borderRadius: 18,
                      padding: 60,
                      textAlign: 'center',
                      boxShadow: C.cardShadow,
                    }}
                  >
                    <div
                      style={{ fontSize: 44, marginBottom: 12, opacity: 0.45 }}
                    >
                      📋
                    </div>
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
                    <div style={{ fontSize: 12, color: C.textMuted }}>
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
                        boxShadow: '0 3px 12px rgba(255,140,0,0.25)',
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
                        background: C.card,
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        borderRadius: 16,
                        padding: '18px 22px',
                        boxShadow: C.cardShadow,
                        border: `2px solid ${order.status === 'processing' ? C.yellow : C.cardBorder}`,
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
                              color: C.textPrimary,
                            }}
                          >
                            Order #{order.id.slice(-8).toUpperCase()}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: C.textMuted,
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
                        <StatusBadge status={order.status} />
                      </div>
                      <div
                        style={{
                          background: 'rgba(255,255,255,0.5)',
                          borderRadius: 10,
                          padding: '10px 14px',
                          border: `1px solid rgba(144,238,144,0.25)`,
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
                                  ? '1px solid rgba(144,238,144,0.2)'
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
                                color: C.textPrimary,
                              }}
                            >
                              {formatPHP(item.totalPrice)}
                            </span>
                          </div>
                        ))}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: 8,
                            paddingTop: 8,
                            borderTop: `2px solid rgba(255,225,53,0.35)`,
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
                              color: C.textPrimary,
                            }}
                          >
                            {formatPHP(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                      {order.adminNote && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 12px',
                            borderRadius: 10,
                            background: 'rgba(255,250,220,0.85)',
                            border: `1.5px solid rgba(255,225,53,0.5)`,
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
