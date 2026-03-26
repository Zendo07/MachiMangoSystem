'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getStoredUser,
  getStoredToken,
  clearAuth,
  PERMISSIONS,
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
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  sales: number;
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Mango Graham Float',
    category: 'Desserts',
    price: 220,
    stock: 45,
    image: '🥭',
    status: 'In Stock',
    sales: 312,
  },
  {
    id: 2,
    name: 'Mango Ice Cream',
    category: 'Ice Cream',
    price: 85,
    stock: 8,
    image: '🍦',
    status: 'Low Stock',
    sales: 198,
  },
  {
    id: 3,
    name: 'Mango Boba Tea',
    category: 'Drinks',
    price: 120,
    stock: 0,
    image: '🧋',
    status: 'Out of Stock',
    sales: 87,
  },
  {
    id: 4,
    name: 'Dried Mango Slices',
    category: 'Snacks',
    price: 95,
    stock: 120,
    image: '🍋',
    status: 'In Stock',
    sales: 445,
  },
  {
    id: 5,
    name: 'Mango Cheesecake',
    category: 'Desserts',
    price: 350,
    stock: 12,
    image: '🍰',
    status: 'Low Stock',
    sales: 156,
  },
  {
    id: 6,
    name: 'Mango Shake',
    category: 'Drinks',
    price: 110,
    stock: 60,
    image: '🥤',
    status: 'In Stock',
    sales: 523,
  },
  {
    id: 7,
    name: 'Mango Pastillas',
    category: 'Candy',
    price: 65,
    stock: 200,
    image: '🍬',
    status: 'In Stock',
    sales: 389,
  },
  {
    id: 8,
    name: 'Fresh Mango (per kg)',
    category: 'Fresh',
    price: 180,
    stock: 90,
    image: '🥭',
    status: 'In Stock',
    sales: 671,
  },
];

function StatusBadge({ status }: { status: Product['status'] }) {
  const m = {
    'In Stock': { bg: '#E8F5E1', color: '#3D6E27', dot: '#5A9E3A' },
    'Low Stock': { bg: '#FFF0D9', color: '#CC7000', dot: '#FF8C00' },
    'Out of Stock': { bg: '#FFEBEE', color: '#C62828', dot: '#EF5350' },
  };
  const s = m[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        borderRadius: 20,
        background: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      <span
        style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }}
      />
      {status}
    </span>
  );
}

// Stock popover — only shown when canEdit
function StockPopover({
  value,
  onSave,
  onClose,
}: {
  value: number;
  onSave: (n: number) => void;
  onClose: () => void;
}) {
  const [v, setV] = useState(value);
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        zIndex: 100,
        background: '#fff',
        borderRadius: 12,
        padding: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,.2)',
        border: `1.5px solid ${C.yellow}`,
        top: '110%',
        left: '50%',
        transform: 'translateX(-50%)',
        minWidth: 160,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: C.brownDark,
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '.08em',
        }}
      >
        Update Stock
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          onClick={() => setV((x) => Math.max(0, x - 1))}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            border: '1.5px solid #E5D9C8',
            background: '#FDFAF4',
            color: C.brownDarker,
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 18,
          }}
        >
          −
        </button>
        <input
          type="number"
          value={v}
          onChange={(e) => setV(Math.max(0, +e.target.value))}
          style={{
            width: 60,
            textAlign: 'center',
            border: `1.5px solid ${C.yellow}`,
            borderRadius: 8,
            padding: '4px 6px',
            fontWeight: 700,
            color: C.brownDarker,
            outline: 'none',
            fontSize: 14,
          }}
        />
        <button
          onClick={() => setV((x) => x + 1)}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            border: '1.5px solid #E5D9C8',
            background: '#FDFAF4',
            color: C.brownDarker,
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 18,
          }}
        >
          +
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '7px',
            borderRadius: 8,
            border: '1.5px solid #E5D9C8',
            background: 'transparent',
            color: C.brownDark,
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onSave(v);
            onClose();
          }}
          style={{
            flex: 1,
            padding: '7px',
            borderRadius: 8,
            border: 'none',
            background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
            color: C.brownDarker,
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default function OwnerProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [products, setProds] = useState<Product[]>(PRODUCTS);
  const [search, setSearch] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [popId, setPopId] = useState<number | null>(null);

  useEffect(() => {
    const u = getStoredUser();
    const t = getStoredToken();
    if (!u || !t) {
      router.replace('/login');
      return;
    }
    if (u.role === 'hq_admin') {
      router.replace('/admin/products');
      return;
    }
    setUser(u);
    setTimeout(() => setLoaded(true), 80);
  }, [router]);

  if (!user) return null;

  const role = user.role as UserRole;
  const meta = ROLE_META[role];
  const canEdit = PERMISSIONS.canEditProducts(role);
  const dashRoute = role === 'crew' ? '/crew/dashboard' : '/owner/dashboard';

  const updateStock = (id: number, qty: number) =>
    setProds((ps) =>
      ps.map((p) =>
        p.id === id
          ? {
              ...p,
              stock: qty,
              status:
                qty === 0
                  ? 'Out of Stock'
                  : qty <= 10
                    ? 'Low Stock'
                    : 'In Stock',
            }
          : p,
      ),
    );

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  const navItems = [
    {
      name: 'Dashboard',
      route: dashRoute,
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
      route: '',
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
            const active = item.name === 'Products';
            return (
              <button
                key={item.name}
                onClick={() => item.route && router.push(item.route)}
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
              background: 'linear-gradient(135deg,#4A9ECA,#2E7BAD)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'default',
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
                Products
              </div>
              {canEdit ? (
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
                  ✓ Can Edit Stock
                </span>
              ) : (
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
                    border: '1.5px solid #EF9A9A',
                    textTransform: 'uppercase',
                    letterSpacing: '.04em',
                  }}
                >
                  🔒 View Only
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 12,
                color: C.green,
                fontWeight: 600,
                marginTop: 1,
              }}
            >
              {meta.emoji} {meta.label} · {products.length} products
            </div>
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
          >
            Sign Out
          </button>
        </header>

        <main
          style={{ flex: 1, overflowY: 'auto', padding: 28, background: C.bg }}
        >
          {/* Search bar */}
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: '14px 18px',
              marginBottom: 16,
              boxShadow: '0 2px 10px rgba(0,0,0,.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
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
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                style={{
                  width: '100%',
                  paddingLeft: 34,
                  paddingRight: 12,
                  paddingTop: 9,
                  paddingBottom: 9,
                  borderRadius: 10,
                  border: '1.5px solid #E5D9C8',
                  background: '#FDFAF4',
                  fontSize: 13,
                  outline: 'none',
                  color: C.brownDarker,
                }}
                onFocus={(e) => (e.target.style.borderColor = C.yellow)}
                onBlur={(e) => (e.target.style.borderColor = '#E5D9C8')}
              />
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#BBA98A',
                whiteSpace: 'nowrap',
              }}
            >
              {filtered.length} of {products.length} shown
            </div>
          </div>

          {/* View-only notice */}
          {!canEdit && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 16px',
                borderRadius: 12,
                background: '#FFF0D9',
                border: `1.5px solid ${C.orange}`,
                marginBottom: 18,
                fontSize: 12,
                fontWeight: 600,
                color: '#CC7000',
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              You are in view-only mode. To edit products or stock, contact your
              Franchise Owner or HQ.
            </div>
          )}

          {/* Product grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
              gap: 16,
            }}
          >
            {filtered.map((p, i) => (
              <div
                key={p.id}
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  border: '2px solid #F0E8D8',
                  overflow: 'visible',
                  boxShadow: '0 2px 10px rgba(0,0,0,.06)',
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? 'translateY(0)' : 'translateY(18px)',
                  transition: `opacity .4s ${Math.min(i * 0.04, 0.4)}s, transform .4s ${Math.min(i * 0.04, 0.4)}s, border .2s`,
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = C.yellow;
                  (e.currentTarget as HTMLElement).style.transform =
                    'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    '#F0E8D8';
                  (e.currentTarget as HTMLElement).style.transform =
                    'translateY(0)';
                }}
              >
                {/* Image band */}
                <div
                  style={{
                    height: 90,
                    background: 'linear-gradient(135deg,#F2EAD8,#EFE0C8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 42,
                    position: 'relative',
                    borderRadius: '16px 16px 0 0',
                  }}
                >
                  {p.image}
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    <StatusBadge status={p.status} />
                  </div>
                  {p.status === 'Out of Stock' && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,.32)',
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
                          fontSize: 11,
                          textTransform: 'uppercase',
                          letterSpacing: '.05em',
                        }}
                      >
                        Unavailable
                      </span>
                    </div>
                  )}
                </div>
                {/* Body */}
                <div style={{ padding: '12px 14px' }}>
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
                      fontSize: 13,
                      color: C.brownDarker,
                      marginBottom: 6,
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
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 900,
                        fontSize: 18,
                        color: C.brownDarker,
                      }}
                    >
                      ₱{p.price}
                    </span>
                    <span style={{ fontSize: 11, color: '#888' }}>
                      {p.stock} units
                    </span>
                  </div>
                  {/* Stock bar */}
                  <div
                    style={{
                      height: 4,
                      background: '#F0E8D8',
                      borderRadius: 10,
                      overflow: 'hidden',
                      marginBottom: 10,
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
                        width: `${Math.min(100, (p.stock / 150) * 100)}%`,
                      }}
                    />
                  </div>
                  {/* Actions */}
                  {canEdit ? (
                    <div
                      style={{ display: 'flex', gap: 6, position: 'relative' }}
                    >
                      <div style={{ position: 'relative', flex: 1 }}>
                        <button
                          onClick={() => setPopId(popId === p.id ? null : p.id)}
                          style={{
                            width: '100%',
                            padding: '7px 0',
                            borderRadius: 9,
                            border: '1.5px solid #E5D9C8',
                            background: '#FDFAF4',
                            color: C.brownDark,
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = C.orange;
                            e.currentTarget.style.background = '#FFF0D9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E5D9C8';
                            e.currentTarget.style.background = '#FDFAF4';
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Update Stock
                        </button>
                        {popId === p.id && (
                          <StockPopover
                            value={p.stock}
                            onSave={(qty) => updateStock(p.id, qty)}
                            onClose={() => setPopId(null)}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        background: '#FDFAF4',
                        border: '1px solid #E5D9C8',
                        fontSize: 10,
                        color: '#AAA',
                        fontWeight: 600,
                        textAlign: 'center',
                      }}
                    >
                      🔒 View Only · Contact HQ to make changes
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
