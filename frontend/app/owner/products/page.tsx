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

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  sales: number;
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Product['status'] }) {
  const m = {
    'In Stock': { bg: '#E8F5E1', color: '#3D6E27', dot: '#5A9E3A' },
    'Low Stock': { bg: '#FFF0D9', color: '#CC7000', dot: '#FF8C00' },
    'Out of Stock': { bg: '#FFEBEE', color: '#C62828', dot: '#EF5350' },
  }[status];
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
        whiteSpace: 'nowrap',
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
      {status}
    </span>
  );
}

// ─── OWNER SIDEBAR ────────────────────────────────────────────────────────────
function OwnerSidebar({
  open,
  user,
  activeNav,
  onNav,
}: {
  open: boolean;
  user: { fullName: string; role: UserRole };
  activeNav: string;
  onNav: (r: string) => void;
}) {
  const meta = ROLE_META[user.role];
  const navItems = [
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

  return (
    <aside
      style={{
        width: open ? 240 : 72,
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
            }}
          >
            🥭
          </div>
          {open && (
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 17,
                  color: C.yellow,
                  letterSpacing: '-0.3px',
                }}
              >
                Machi Mango
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(245,200,66,.7)',
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
              {open && (
                <span style={{ flex: 1, textAlign: 'left' }}>{item.name}</span>
              )}
            </button>
          );
        })}
      </nav>
      {/* User */}
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
              background: `linear-gradient(135deg,${C.green},${C.darkGreen})`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            {user.fullName.charAt(0).toUpperCase()}
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
                {user.fullName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(245,200,66,.6)',
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

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function OwnerProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [sidebarOpen, setSidebar] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatus] = useState('All');

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
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch('http://localhost:3000/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { success: boolean; data: Product[] };
      if (data.success) setProducts(data.data);
      else setFetchError('Failed to load products');
    } catch {
      setFetchError('Cannot reach backend. Is it running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) void fetchProducts();
  }, [user, fetchProducts]);

  if (!user) return null;

  const role = user.role as UserRole;
  const meta = ROLE_META[role];

  // Derive categories from real products
  const allCategories = [
    'All',
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filtered = products.filter(
    (p) =>
      (category === 'All' || p.category === category) &&
      (statusFilter === 'All' || p.status === statusFilter) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const inStock = products.filter((p) => p.status === 'In Stock').length;
  const lowStock = products.filter((p) => p.status === 'Low Stock').length;
  const outStock = products.filter((p) => p.status === 'Out of Stock').length;

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
      {/* ── OWNER SIDEBAR — correct nav (Dashboard, Products, My Orders) ── */}
      <OwnerSidebar
        open={sidebarOpen}
        user={{ fullName: user.fullName, role }}
        activeNav="Products"
        onNav={(r) => router.push(r)}
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
                Ingredient Catalog
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: C.green,
                  fontWeight: 600,
                  marginTop: 1,
                }}
              >
                {meta.emoji} {meta.label} ·{' '}
                {loading
                  ? 'Loading…'
                  : `${products.length} ingredients available to order`}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Order Now shortcut */}
            <button
              onClick={() => router.push('/owner/orders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 13,
                border: 'none',
                background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
                color: C.brownDarker,
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255,140,0,.35)',
              }}
            >
              🛒 Place an Order
            </button>
            <button
              onClick={() => void fetchProducts()}
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
          style={{ flex: 1, overflowY: 'auto', padding: 28, background: C.bg }}
        >
          {/* Info banner — read-only notice */}
          <div
            style={{
              background: `linear-gradient(135deg,${C.brownDarker},${C.brownDark})`,
              borderRadius: 14,
              padding: '14px 22px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              border: '2px solid rgba(245,200,66,.2)',
            }}
          >
            <div style={{ fontSize: 28 }}>📦</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.yellow }}>
                HQ Ingredient Catalog
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(245,200,66,.7)',
                  marginTop: 2,
                }}
              >
                These are the ingredients managed by HQ. To order, click{' '}
                <strong style={{ color: C.yellow }}>"Place an Order"</strong>{' '}
                above.
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4,1fr)',
              gap: 14,
              marginBottom: 20,
            }}
          >
            {[
              {
                label: 'Total Ingredients',
                value: products.length,
                icon: '📦',
                grad: `linear-gradient(135deg,${C.orange},#CC7000)`,
              },
              {
                label: 'In Stock',
                value: inStock,
                icon: '✅',
                grad: `linear-gradient(135deg,${C.green},${C.darkGreen})`,
              },
              {
                label: 'Low Stock',
                value: lowStock,
                icon: '⚠️',
                grad: `linear-gradient(135deg,#FF8C00,#E65100)`,
              },
              {
                label: 'Out of Stock',
                value: outStock,
                icon: '🚫',
                grad: 'linear-gradient(135deg,#C62828,#B71C1C)',
              },
            ].map((card, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: '16px 18px',
                  boxShadow: '0 2px 10px rgba(0,0,0,.06)',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 11,
                    background: card.grad,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    marginBottom: 10,
                  }}
                >
                  {card.icon}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.brownDark,
                    marginBottom: 3,
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: C.brownDarker,
                    letterSpacing: '-.6px',
                    lineHeight: 1,
                  }}
                >
                  {loading ? '—' : card.value}
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: '14px 18px',
              marginBottom: 16,
              boxShadow: '0 2px 10px rgba(0,0,0,.06)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ingredients…"
              style={{
                flex: '1 1 200px',
                minWidth: 160,
                padding: '9px 14px',
                borderRadius: 10,
                border: '1.5px solid #E5D9C8',
                background: '#FDFAF4',
                color: C.brownDarker,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = C.yellow)}
              onBlur={(e) => (e.target.style.borderColor = '#E5D9C8')}
            />
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${category === cat ? C.orange : '#E5D9C8'}`,
                    background: category === cat ? '#FFF0D9' : 'transparent',
                    color: category === cat ? C.brownDarker : C.brownDark,
                    fontWeight: category === cat ? 800 : 600,
                    fontSize: 12,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '1.5px solid #E5D9C8',
                background: '#FDFAF4',
                color: C.brownDark,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="All">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Error */}
          {fetchError && (
            <div
              style={{
                padding: '16px 20px',
                background: '#FFEBEE',
                borderRadius: 12,
                border: '1.5px solid #EF9A9A',
                color: '#C62828',
                fontWeight: 600,
                fontSize: 13,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              ⚠️ {fetchError}
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
          {loading && (
            <div
              style={{
                padding: 60,
                textAlign: 'center',
                color: '#AAA',
                fontSize: 14,
              }}
            >
              Loading ingredient catalog from HQ…
            </div>
          )}

          {/* Product Grid — VIEW ONLY for franchisees */}
          {!loading && (
            <>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.brownDark,
                  marginBottom: 14,
                }}
              >
                Showing{' '}
                <strong style={{ color: C.brownDarker }}>
                  {filtered.length}
                </strong>{' '}
                of{' '}
                <strong style={{ color: C.brownDarker }}>
                  {products.length}
                </strong>{' '}
                ingredients
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
                  gap: 16,
                }}
              >
                {filtered.map((p) => {
                  const outOfStock = p.status === 'Out of Stock';
                  return (
                    <div
                      key={p.id}
                      style={{
                        background: '#fff',
                        borderRadius: 18,
                        border: `2px solid ${outOfStock ? '#FFCDD2' : '#F0E8D8'}`,
                        overflow: 'hidden',
                        boxShadow: '0 2px 10px rgba(0,0,0,.06)',
                        opacity: outOfStock ? 0.75 : 1,
                      }}
                    >
                      {/* Image area */}
                      <div
                        style={{
                          height: 96,
                          background: outOfStock
                            ? '#F5F5F5'
                            : 'linear-gradient(135deg,#F2EAD8,#EFE0C8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 50,
                          position: 'relative',
                          borderRadius: '16px 16px 0 0',
                        }}
                      >
                        <span
                          style={{
                            filter: 'drop-shadow(0 4px 8px rgba(62,26,0,.15))',
                          }}
                        >
                          {p.image}
                        </span>
                        <div style={{ position: 'absolute', top: 9, right: 9 }}>
                          <StatusBadge status={p.status} />
                        </div>
                        {outOfStock && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(0,0,0,.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '16px 16px 0 0',
                            }}
                          >
                            <span
                              style={{
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: 12,
                                textTransform: 'uppercase',
                                letterSpacing: '.05em',
                              }}
                            >
                              Unavailable
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div style={{ padding: '13px 15px' }}>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: C.orange,
                            textTransform: 'uppercase',
                            letterSpacing: '.1em',
                            marginBottom: 3,
                          }}
                        >
                          {p.category}
                        </div>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 14,
                            color: C.brownDarker,
                            lineHeight: 1.3,
                            marginBottom: 8,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {p.name}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 10,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 900,
                              fontSize: 19,
                              color: C.brownDarker,
                            }}
                          >
                            ₱{Number(p.price).toLocaleString()}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color:
                                p.stock <= 10 && p.stock > 0
                                  ? '#CC7000'
                                  : '#AAA',
                              fontWeight:
                                p.stock <= 10 && p.stock > 0 ? 700 : 400,
                            }}
                          >
                            {p.stock <= 10 && p.stock > 0
                              ? `⚠️ ${p.stock} left`
                              : outOfStock
                                ? '🚫 None'
                                : `${p.stock} in stock`}
                          </span>
                        </div>
                        {/* Stock bar */}
                        <div style={{ marginBottom: 10 }}>
                          <div
                            style={{
                              height: 5,
                              background: '#F0E8D8',
                              borderRadius: 10,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                borderRadius: 10,
                                background:
                                  p.stock === 0
                                    ? '#EF5350'
                                    : p.stock <= 10
                                      ? C.orange
                                      : `linear-gradient(90deg,${C.green},${C.darkGreen})`,
                                width: `${Math.min(100, (p.stock / 200) * 100)}%`,
                                transition: 'width .4s',
                              }}
                            />
                          </div>
                        </div>
                        {/* Order button */}
                        <button
                          onClick={() =>
                            !outOfStock && router.push('/owner/orders')
                          }
                          disabled={outOfStock}
                          style={{
                            width: '100%',
                            padding: '8px 0',
                            borderRadius: 10,
                            border: 'none',
                            background: outOfStock
                              ? '#F0E8D8'
                              : `linear-gradient(135deg,${C.yellow},${C.orange})`,
                            color: outOfStock ? '#BBA98A' : C.brownDarker,
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: outOfStock ? 'not-allowed' : 'pointer',
                            transition: 'all .15s',
                          }}
                        >
                          {outOfStock ? 'Unavailable' : '🛒 Order This'}
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div
                    style={{
                      gridColumn: '1/-1',
                      padding: 48,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 34, marginBottom: 10 }}>🔍</div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: C.brownDark,
                      }}
                    >
                      No ingredients found
                    </div>
                    <div style={{ fontSize: 12, color: '#AAA', marginTop: 4 }}>
                      Try adjusting your search or category filter
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
