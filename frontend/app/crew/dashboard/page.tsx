'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, getStoredToken, clearAuth } from '@/lib/auth';

// ─── DESIGN TOKENS (matches admin sky-green theme) ────────────────────────────
const C = {
  brownDarker: '#3E1A00',
  brownDark: '#6B3A2A',
  brown: '#8B4513',
  yellow: '#F5C842',
  orange: '#FF8C00',
  green: '#5A9E3A',
  darkGreen: '#3D6E27',
  bg: '#F2EAD8',
  textMuted: '#9A8878',
  textSub: '#B5A595',
};

const PAGE_BG =
  'linear-gradient(180deg,#87ceeb 0%,#98d8e8 18%,#c8eeaa 42%,#a8dc7a 68%,#7cb342 100%)';

const CATEGORIES = [
  'All',
  'Fruits',
  'Dairy',
  'Dry Goods',
  'Toppings',
  'Packaging',
];

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

// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const globalStyles = `
  .crew-card {
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 14px;
    overflow: hidden;
    transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
    border: 1.5px solid rgba(255,255,255,0.55);
    cursor: default;
  }
  .crew-card:hover {
    box-shadow: 0 12px 32px rgba(34,100,34,0.18);
    border-color: #F5C842;
    transform: translateY(-3px);
  }
  .crew-img-band {
    height: 120px;
    background: linear-gradient(135deg, #F4EFE6, #EDE5D8);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .crew-img-band.has-image { background: transparent; }
  .filter-tab {
    padding: 5px 12px; border-radius: 7px; font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
    border: 1.5px solid transparent;
  }
  .filter-tab.active { background: #FFF0D9; border-color: #FF8C00; color: #3E1A00; font-weight: 700; }
  .filter-tab:not(.active) { background: rgba(255,255,255,0.55); border-color: rgba(255,255,255,0.55); color: #6B3A2A; }
  .filter-tab:not(.active):hover { border-color: #D4C4B0; background: rgba(255,255,255,0.80); }
  .inp-field {
    width: 100%; padding: 9px 14px; border-radius: 10px;
    border: 1.5px solid rgba(255,255,255,0.55); background: rgba(255,255,255,0.72);
    color: #3E1A00; font-size: 13px; outline: none;
    transition: border-color 0.15s; font-family: inherit;
    box-sizing: border-box; backdrop-filter: blur(8px);
  }
  .inp-field:focus { border-color: #F5C842; }
  .stat-card {
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 14px;
    padding: 18px 20px;
    box-shadow: 0 2px 14px rgba(34,100,34,0.10);
    border: 1.5px solid rgba(255,255,255,0.55);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(34,100,34,0.18);
  }
  .view-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 13px; font-size: 12px; font-weight: 600;
    cursor: pointer; border: none; transition: background 0.15s;
  }
  .view-btn.active { background: linear-gradient(135deg,#F5C842,#FF8C00); color: #3E1A00; font-weight: 700; }
  .view-btn:not(.active) { background: transparent; color: #6B3A2A; }
  .view-btn:not(.active):hover { background: rgba(255,255,255,0.55); }
  .tr-stock { transition: background 0.12s; }
  .tr-stock:hover { background: rgba(245,200,66,0.12) !important; }
`;

// ─── ICONS ─────────────────────────────────────────────────────────────────────
const Icon = {
  Search: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Package: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  CheckCircle: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  XCircle: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  Image: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Grid: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  List: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  ChevronDown: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  RefreshCw: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  ArrowBack: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
};

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Product['status'] }) {
  const cfg = {
    'In Stock': { bg: '#EAF5E9', color: '#2E7D32', dot: '#43A047' },
    'Low Stock': { bg: '#FFF3E0', color: '#E65100', dot: '#FB8C00' },
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
        background: cfg.bg,
        color: cfg.color,
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
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}

// ─── STOCK BAR ────────────────────────────────────────────────────────────────
function StockBar({ stock }: { stock: number }) {
  const pct = Math.min(100, (stock / 200) * 100);
  const color = stock === 0 ? '#EF5350' : stock <= 10 ? '#FB8C00' : '#43A047';
  return (
    <div
      style={{
        height: 6,
        background: 'rgba(0,0,0,0.08)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          borderRadius: 10,
          background: color,
          width: `${pct}%`,
          transition: 'width 0.6s ease',
        }}
      />
    </div>
  );
}

// ─── STOCK LEVEL RING ─────────────────────────────────────────────────────────
function StockRing({ stock }: { stock: number }) {
  const pct = Math.min(100, (stock / 200) * 100);
  const color = stock === 0 ? '#EF5350' : stock <= 10 ? '#FB8C00' : '#43A047';
  const r = 18,
    circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="4"
      />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text
        x="22"
        y="26"
        textAnchor="middle"
        fontSize="10"
        fontWeight="800"
        fill={color}
      >
        {stock}
      </text>
    </svg>
  );
}

// ─── PRODUCT CARD (READ-ONLY) ─────────────────────────────────────────────────
function StockCard({ p }: { p: Product }) {
  const hasImage =
    p.image && (p.image.startsWith('http') || p.image.startsWith('data:'));
  const stockPct = Math.min(100, (p.stock / 200) * 100);

  return (
    <div className="crew-card">
      <div className={`crew-img-band${hasImage ? ' has-image' : ''}`}>
        {hasImage ? (
          <img
            src={p.image}
            alt={p.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div style={{ color: '#C8B89A' }}>
            <Icon.Image />
          </div>
        )}
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
          <StatusBadge status={p.status} />
        </div>
        {/* Low/out stock warning overlay */}
        {p.stock <= 10 && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background:
                p.stock === 0 ? 'rgba(198,40,40,0.85)' : 'rgba(230,81,0,0.80)',
              padding: '5px 10px',
              textAlign: 'center',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {p.stock === 0 ? '⚠ Out of Stock' : `⚠ Only ${p.stock} left`}
          </div>
        )}
      </div>

      <div style={{ padding: '14px 16px' }}>
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
            fontWeight: 700,
            fontSize: 14,
            color: C.brownDarker,
            marginBottom: 10,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {p.name}
        </div>

        {/* Price */}
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
                fontSize: 10,
                color: C.textMuted,
                fontWeight: 600,
                marginBottom: 2,
              }}
            >
              UNIT PRICE
            </div>
            <div
              style={{
                fontWeight: 900,
                fontSize: 20,
                color: C.brownDarker,
                letterSpacing: '-.4px',
              }}
            >
              ₱{Number(p.price).toLocaleString()}
            </div>
          </div>
          <StockRing stock={p.stock} />
        </div>

        {/* Stock bar */}
        <div style={{ marginBottom: 4 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 5,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: C.brownDark }}>
              Stock Level
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color:
                  p.stock === 0
                    ? '#C62828'
                    : p.stock <= 10
                      ? '#E65100'
                      : C.darkGreen,
              }}
            >
              {p.stock} units
            </span>
          </div>
          <StockBar stock={p.stock} />
          <div
            style={{
              fontSize: 10,
              color: C.textSub,
              marginTop: 4,
              textAlign: 'right',
            }}
          >
            {stockPct.toFixed(0)}% capacity
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function CrewStocksPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

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
      const data = (await res.json()) as {
        success: boolean;
        data: Product[];
        message?: string;
      };
      if (data.success) {
        setProducts(data.data);
        setLastRefresh(new Date());
      } else {
        setFetchError(data.message ?? 'Failed to load stock data');
      }
    } catch {
      setFetchError('Cannot reach server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) void fetchProducts();
  }, [user, fetchProducts]);

  if (!user) return null;

  const filtered = products
    .filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        (statusFilter === 'All' || p.status === statusFilter) &&
        p.name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      // Sort: out of stock first, then low stock, then in stock; within each group alphabetically
      const order = { 'Out of Stock': 0, 'Low Stock': 1, 'In Stock': 2 };
      const diff = order[a.status] - order[b.status];
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });

  const total = products.length;
  const inStock = products.filter((p) => p.status === 'In Stock').length;
  const lowStock = products.filter((p) => p.status === 'Low Stock').length;
  const outStock = products.filter((p) => p.status === 'Out of Stock').length;

  const firstName = user.fullName?.split(' ')[0] ?? 'there';
  const branchName = user.branchId ?? 'Your Branch';

  const statCards = [
    {
      label: 'Total Ingredients',
      value: total,
      grad: `linear-gradient(135deg,${C.orange},#CC7000)`,
      icon: <Icon.Package />,
      textColor: '#fff',
    },
    {
      label: 'In Stock',
      value: inStock,
      grad: `linear-gradient(135deg,${C.green},${C.darkGreen})`,
      icon: <Icon.CheckCircle />,
      textColor: '#fff',
    },
    {
      label: 'Low Stock',
      value: lowStock,
      grad: 'linear-gradient(135deg,#FB8C00,#E65100)',
      icon: <Icon.AlertTriangle />,
      textColor: '#fff',
    },
    {
      label: 'Out of Stock',
      value: outStock,
      grad: 'linear-gradient(135deg,#C62828,#B71C1C)',
      icon: <Icon.XCircle />,
      textColor: '#fff',
    },
  ];

  return (
    <>
      <style>{globalStyles}</style>

      <div
        style={{
          minHeight: '100vh',
          background: PAGE_BG,
          backgroundAttachment: 'fixed',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── HEADER ── */}
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
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => router.push('/crew/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 10,
                border: `2px solid ${C.yellow}`,
                background: `${C.yellow}22`,
                color: C.brownDark,
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all .15s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = `${C.yellow}44`)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = `${C.yellow}22`)
              }
            >
              <Icon.ArrowBack /> Back
            </button>

            {/* Logo mark */}
            <div
              style={{
                width: 40,
                height: 40,
                flexShrink: 0,
                background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                boxShadow: '0 3px 10px rgba(255,140,0,0.35)',
              }}
            >
              🥭
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{ fontWeight: 800, fontSize: 19, color: C.brownDark }}
                >
                  Stock Viewer
                </div>
                <span
                  style={{
                    padding: '3px 9px',
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
                {branchName} · Hi, {firstName}!
                {lastRefresh && (
                  <span
                    style={{ marginLeft: 8, color: C.textSub, fontWeight: 500 }}
                  >
                    Last updated:{' '}
                    {lastRefresh.toLocaleTimeString('en-PH', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => void fetchProducts()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 16px',
                borderRadius: 10,
                border: `2px solid ${C.yellow}`,
                background: `${C.yellow}22`,
                color: C.brownDark,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = `${C.yellow}44`)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = `${C.yellow}22`)
              }
            >
              <Icon.RefreshCw /> Refresh
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

        {/* ── BODY ── */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          {/* Alert banner if items need attention */}
          {(lowStock > 0 || outStock > 0) && !loading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 20px',
                borderRadius: 14,
                marginBottom: 20,
                background:
                  outStock > 0
                    ? 'rgba(255,235,238,0.90)'
                    : 'rgba(255,243,224,0.90)',
                border: `2px solid ${outStock > 0 ? '#EF9A9A' : '#FFB74D'}`,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: '0 2px 14px rgba(34,100,34,0.08)',
              }}
            >
              <span style={{ fontSize: 22 }}>{outStock > 0 ? '🚨' : '⚠️'}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 14,
                    color: C.brownDarker,
                  }}
                >
                  {outStock > 0
                    ? `${outStock} ingredient${outStock > 1 ? 's' : ''} out of stock`
                    : `${lowStock} ingredient${lowStock > 1 ? 's' : ''} running low`}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: C.brownDark,
                    marginTop: 2,
                    fontWeight: 500,
                  }}
                >
                  Contact your franchise owner or HQ to restock.
                </div>
              </div>
              <button
                onClick={() =>
                  setStatusFilter(outStock > 0 ? 'Out of Stock' : 'Low Stock')
                }
                style={{
                  padding: '7px 14px',
                  borderRadius: 9,
                  border: 'none',
                  cursor: 'pointer',
                  background:
                    outStock > 0
                      ? 'linear-gradient(135deg,#C62828,#B71C1C)'
                      : 'linear-gradient(135deg,#FB8C00,#E65100)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                View
              </button>
            </div>
          )}

          {/* ── STAT CARDS ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4,1fr)',
              gap: 14,
              marginBottom: 22,
            }}
          >
            {statCards.map((card, i) => (
              <div
                key={i}
                className="stat-card"
                onClick={() => setStatusFilter(i === 0 ? 'All' : card.label)}
                style={{ cursor: 'pointer' }}
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
                    marginBottom: 10,
                    color: '#fff',
                    boxShadow: '0 2px 10px rgba(0,0,0,.14)',
                  }}
                >
                  {card.icon}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.textMuted,
                    marginBottom: 3,
                    textTransform: 'uppercase',
                    letterSpacing: '.04em',
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    color: C.brownDarker,
                    letterSpacing: '-.5px',
                    lineHeight: 1,
                  }}
                >
                  {loading ? '—' : card.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── FILTER BAR ── */}
          <div
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 14,
              boxShadow: '0 2px 14px rgba(34,100,34,0.10)',
              border: '1.5px solid rgba(255,255,255,0.55)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              alignItems: 'center',
            }}
          >
            {/* Search */}
            <div
              style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: C.textSub,
                  pointerEvents: 'none',
                }}
              >
                <Icon.Search />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ingredients…"
                className="inp-field"
                style={{ paddingLeft: 32, paddingTop: 8, paddingBottom: 8 }}
              />
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`filter-tab${category === cat ? ' active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div style={{ position: 'relative' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="inp-field"
                style={{
                  paddingRight: 28,
                  paddingTop: 7,
                  paddingBottom: 7,
                  appearance: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                <option value="All">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              <span
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: C.brownDark,
                }}
              >
                <Icon.ChevronDown />
              </span>
            </div>

            {/* Clear filters */}
            {(statusFilter !== 'All' || category !== 'All' || search) && (
              <button
                onClick={() => {
                  setStatusFilter('All');
                  setCategory('All');
                  setSearch('');
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: `1.5px solid ${C.orange}`,
                  background: '#FFF0D9',
                  color: '#CC7000',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Clear ✕
              </button>
            )}

            {/* View toggle */}
            <div
              style={{
                display: 'flex',
                borderRadius: 8,
                overflow: 'hidden',
                border: '1.5px solid rgba(255,255,255,0.55)',
                marginLeft: 'auto',
              }}
            >
              <button
                className={`view-btn${viewMode === 'grid' ? ' active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Icon.Grid /> Grid
              </button>
              <button
                className={`view-btn${viewMode === 'table' ? ' active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <Icon.List /> Table
              </button>
            </div>
          </div>

          {/* Results count */}
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.textMuted,
              marginBottom: 14,
            }}
          >
            Showing{' '}
            <strong style={{ color: C.brownDarker }}>{filtered.length}</strong>{' '}
            of <strong style={{ color: C.brownDarker }}>{total}</strong>{' '}
            ingredients
            {statusFilter !== 'All' && (
              <span style={{ color: C.orange }}>
                {' '}
                · Filtered by: {statusFilter}
              </span>
            )}
          </div>

          {/* Error banner */}
          {fetchError && (
            <div
              style={{
                padding: '14px 18px',
                background: 'rgba(255,235,238,0.88)',
                borderRadius: 12,
                border: '1.5px solid #EF9A9A',
                color: '#C62828',
                fontWeight: 600,
                fontSize: 13,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <Icon.AlertTriangle /> {fetchError}
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
            <div style={{ padding: 80, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.9)',
                  marginBottom: 4,
                }}
              >
                Loading stock data…
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
                Fetching the latest inventory information
              </div>
            </div>
          )}

          {/* GRID VIEW */}
          {!loading && viewMode === 'grid' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 14,
              }}
            >
              {filtered.map((p) => (
                <StockCard key={p.id} p={p} />
              ))}
              {filtered.length === 0 && !fetchError && (
                <div
                  style={{
                    gridColumn: '1/-1',
                    padding: 60,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: 'rgba(255,255,255,0.9)',
                      marginBottom: 4,
                    }}
                  >
                    No ingredients found
                  </div>
                  <div
                    style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}
                  >
                    Try adjusting your search or filters
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TABLE VIEW */}
          {!loading && viewMode === 'table' && (
            <div
              style={{
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                borderRadius: 18,
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(34,100,34,0.13)',
                border: `3px solid ${C.yellow}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 24px',
                  background: `linear-gradient(90deg,${C.yellow}28,${C.orange}18)`,
                  borderBottom: `2px solid ${C.yellow}`,
                }}
              >
                <div
                  style={{ fontWeight: 800, fontSize: 16, color: C.brownDark }}
                >
                  Ingredient Stock List
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
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.brownDark,
                    opacity: 0.6,
                  }}
                >
                  Read-only · sorted by urgency
                </div>
              </div>

              {filtered.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center' }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: C.brownDark,
                    }}
                  >
                    No ingredients match your filters
                  </div>
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
                          '#',
                          'Ingredient',
                          'Category',
                          'Unit Price',
                          'Stock',
                          'Capacity',
                          'Status',
                        ].map((col) => (
                          <th
                            key={col}
                            style={{
                              padding: '13px 20px',
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
                      {filtered.map((p, idx) => {
                        const hasImg =
                          p.image &&
                          (p.image.startsWith('http') ||
                            p.image.startsWith('data:'));
                        const stockPct = Math.min(100, (p.stock / 200) * 100);
                        return (
                          <tr
                            key={p.id}
                            className="tr-stock"
                            style={{
                              borderBottom: `1.5px solid ${C.yellow}30`,
                              background:
                                p.status === 'Out of Stock'
                                  ? 'rgba(255,235,238,0.45)'
                                  : p.status === 'Low Stock'
                                    ? 'rgba(255,243,224,0.45)'
                                    : idx % 2 === 0
                                      ? 'rgba(255,255,255,0.55)'
                                      : 'rgba(200,238,170,0.25)',
                            }}
                          >
                            <td
                              style={{
                                padding: '12px 20px',
                                fontWeight: 700,
                                fontSize: 12,
                                color: C.textMuted,
                              }}
                            >
                              {idx + 1}
                            </td>
                            <td style={{ padding: '12px 20px' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                }}
                              >
                                <div
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background: '#F4EFE6',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {hasImg ? (
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                      }}
                                    />
                                  ) : (
                                    <span style={{ color: '#C8B89A' }}>
                                      <Icon.Image />
                                    </span>
                                  )}
                                </div>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    fontSize: 13,
                                    color: C.brownDarker,
                                  }}
                                >
                                  {p.name}
                                </div>
                              </div>
                            </td>
                            <td
                              style={{
                                padding: '12px 20px',
                                fontSize: 12,
                                color: C.orange,
                                fontWeight: 700,
                              }}
                            >
                              {p.category}
                            </td>
                            <td
                              style={{
                                padding: '12px 20px',
                                fontWeight: 900,
                                fontSize: 14,
                                color: C.brownDarker,
                              }}
                            >
                              ₱{Number(p.price).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 20px' }}>
                              <span
                                style={{
                                  fontWeight: 800,
                                  fontSize: 16,
                                  color:
                                    p.stock === 0
                                      ? '#C62828'
                                      : p.stock <= 10
                                        ? '#E65100'
                                        : C.darkGreen,
                                }}
                              >
                                {p.stock}
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  color: C.textMuted,
                                  marginLeft: 3,
                                }}
                              >
                                units
                              </span>
                            </td>
                            <td style={{ padding: '12px 20px', minWidth: 120 }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <StockBar stock={p.stock} />
                                </div>
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: C.textMuted,
                                    minWidth: 30,
                                  }}
                                >
                                  {stockPct.toFixed(0)}%
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 20px' }}>
                              <StatusBadge status={p.status} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Bottom notice */}
          <div
            style={{
              marginTop: 24,
              padding: '12px 18px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.45)',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(255,255,255,0.55)',
              fontSize: 12,
              color: C.brownDarker,
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            You have <strong>view-only</strong> access to stock data. To request
            restocking, contact your franchise owner or HQ admin.
          </div>
        </main>
      </div>
    </>
  );
}
