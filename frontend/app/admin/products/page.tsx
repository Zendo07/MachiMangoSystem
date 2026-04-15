'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredToken } from '@/lib/auth';
import { AdminSidebar } from '@/app/admin/dashboard/page';
import CreateAccountModal, {
  type CreatedAccountData,
} from '@/components/admin/CreateAccountModal';
import SuccessCredentialModal from '@/components/admin/SuccessCredentialModal';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  brownDarker: '#3E1A00',
  brownDark: '#6B3A2A',
  brown: '#8B4513',
  yellow: '#F5C842',
  orange: '#FF8C00',
  green: '#5A9E3A',
  darkGreen: '#3D6E27',
  bg: '#F4EFE6',
  surface: '#FFFFFF',
  border: '#E8DDD0',
  borderHover: '#D4C4B0',
  textMuted: '#9A8878',
  textSub: '#B5A595',
};

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
type SortKey = 'name' | 'price' | 'stock' | 'sales';
type ViewMode = 'grid' | 'table';

// ─── SVG ICON LIBRARY ────────────────────────────────────────────────────────
const Icon = {
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
  TrendingUp: () => (
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
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  Plus: ({ size = 16 }: { size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Edit: () => (
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
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
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
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
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
  Upload: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  ),
  Camera: () => (
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
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  X: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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
  ArrowUp: () => (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  ),
  ArrowDown: () => (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  ),
  LogOut: () => (
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Minus: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  PlusSmall: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};

// ─── CSS-CLASS-BASED STABLE STYLES (no inline hover mutations) ───────────────
const globalStyles = `
  .prod-card {
    background: #fff;
    border-radius: 14px;
    border: 1.5px solid #E8DDD0;
    overflow: visible;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    position: relative;
    will-change: transform;
  }
  .prod-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(62,26,0,0.12);
    border-color: #F5C842;
  }
  .btn-edit {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 11px; border-radius: 8px;
    border: 1.5px solid #E8DDD0;
    background: #FAFAF8; color: #6B3A2A;
    font-weight: 600; font-size: 12px; cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }
  .btn-edit:hover { border-color: #F5C842; background: #FFFAE8; }
  .btn-delete {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 8px;
    border: 1.5px solid #FFCDD2; background: #FFF5F5; color: #C62828;
    cursor: pointer; transition: background 0.15s;
  }
  .btn-delete:hover { background: #FFCDD2; }
  .btn-stock {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 8px;
    border: 1.5px solid #E8DDD0; background: #FAFAF8; color: #6B3A2A;
    cursor: pointer; transition: border-color 0.15s;
  }
  .btn-stock:hover { border-color: #FF8C00; }
  .filter-tab {
    padding: 5px 12px; border-radius: 7px; font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.15s; white-space: nowrap; border: 1.5px solid transparent;
  }
  .filter-tab.active {
    background: #FFF0D9; border-color: #FF8C00; color: #3E1A00; font-weight: 700;
  }
  .filter-tab:not(.active) {
    background: transparent; border-color: #E8DDD0; color: #6B3A2A;
  }
  .filter-tab:not(.active):hover { border-color: #D4C4B0; background: #F8F4EE; }
  .sort-btn {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 5px 10px; border-radius: 7px; font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.15s; border: 1.5px solid #E8DDD0;
    background: transparent; color: #6B3A2A;
  }
  .sort-btn.active { background: #FFFAE8; border-color: #F5C842; color: #3E1A00; font-weight: 700; }
  .sort-btn:not(.active):hover { background: #F8F4EE; }
  .view-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 13px; font-size: 12px; font-weight: 600;
    cursor: pointer; border: none; transition: all 0.15s;
  }
  .view-btn.active { background: linear-gradient(135deg,#F5C842,#FF8C00); color: #3E1A00; font-weight: 700; }
  .view-btn:not(.active) { background: transparent; color: #6B3A2A; }
  .view-btn:not(.active):hover { background: #F8F4EE; }
  .add-card {
    border-radius: 14px; border: 2px dashed #D4C4B0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 8px; padding: 28px; cursor: pointer; transition: all 0.2s; min-height: 240px;
    background: transparent;
  }
  .add-card:hover { border-color: #FF8C00; background: #FFF8F0; }
  .tr-product { transition: background 0.12s; }
  .tr-product:hover { background: rgba(245,200,66,0.07) !important; }
  .stat-card {
    background: #fff; border-radius: 12px; padding: 16px 18px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1.5px solid #EDE5D8;
    transition: transform 0.18s, box-shadow 0.18s;
    will-change: transform;
  }
  .stat-card:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.09); }
  .header-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 700;
    cursor: pointer; transition: opacity 0.15s, transform 0.15s;
  }
  .header-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .inp-field {
    width: 100%; padding: 10px 14px; border-radius: 10px;
    border: 1.5px solid #E8DDD0; background: #FAFAF8;
    color: #3E1A00; font-size: 13px; outline: none;
    transition: border-color 0.15s; font-family: inherit;
    box-sizing: border-box;
  }
  .inp-field:focus { border-color: #F5C842; }
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    display: flex; align-items: center; justify-content: center; padding: 16px;
    background: rgba(20,8,0,0.55); backdrop-filter: blur(4px);
  }
`;

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Product['status'] }) {
  const cfg = {
    'In Stock': {
      bg: '#EAF5E9',
      color: '#2E7D32',
      dot: '#43A047',
      icon: <Icon.CheckCircle />,
    },
    'Low Stock': {
      bg: '#FFF3E0',
      color: '#E65100',
      dot: '#FB8C00',
      icon: <Icon.AlertTriangle />,
    },
    'Out of Stock': {
      bg: '#FFEBEE',
      color: '#C62828',
      dot: '#EF5350',
      icon: <Icon.XCircle />,
    },
  }[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
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
        height: 4,
        background: '#EDE5D8',
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
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  );
}

// ─── STOCK POPOVER ────────────────────────────────────────────────────────────
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
        boxShadow: '0 8px 32px rgba(0,0,0,.18)',
        border: `1.5px solid ${C.yellow}`,
        top: '110%',
        left: '50%',
        transform: 'translateX(-50%)',
        minWidth: 170,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: C.brownDark,
          marginBottom: 10,
          textTransform: 'uppercase',
          letterSpacing: '.08em',
        }}
      >
        Update Stock
      </div>
      <div
        style={{
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <button
          className="btn-stock"
          onClick={() => setV((x) => Math.max(0, x - 1))}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            border: '1.5px solid #E8DDD0',
            background: '#FAFAF8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: C.brownDarker,
          }}
        >
          <Icon.Minus />
        </button>
        <input
          type="number"
          value={v}
          onChange={(e) => setV(Math.max(0, +e.target.value))}
          style={{
            width: 62,
            textAlign: 'center',
            border: `1.5px solid ${C.yellow}`,
            borderRadius: 8,
            padding: '5px 6px',
            fontWeight: 700,
            color: C.brownDarker,
            outline: 'none',
            fontSize: 14,
          }}
        />
        <button
          className="btn-stock"
          onClick={() => setV((x) => x + 1)}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            border: '1.5px solid #E8DDD0',
            background: '#FAFAF8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: C.brownDarker,
          }}
        >
          <Icon.PlusSmall />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '7px',
            borderRadius: 8,
            border: '1.5px solid #E8DDD0',
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

// ─── IMAGE UPLOADER ───────────────────────────────────────────────────────────
function ImageUploader({
  current,
  onChange,
}: {
  current: string;
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const hasImage =
    current && (current.startsWith('http') || current.startsWith('data:'));

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target?.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '.08em',
          color: C.brownDark,
          marginBottom: 8,
        }}
      >
        Product Image <span style={{ color: C.orange }}>*</span>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) processFile(f);
        }}
        onClick={() => !hasImage && fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? C.orange : hasImage ? C.green : '#D4C4B0'}`,
          borderRadius: 12,
          background: dragging ? '#FFF8F0' : hasImage ? '#F2FAF0' : '#FAFAF8',
          padding: hasImage ? 0 : '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: hasImage ? 'default' : 'pointer',
          transition: 'all .18s',
          position: 'relative',
          overflow: 'hidden',
          minHeight: hasImage ? 180 : 110,
        }}
      >
        {uploading && (
          <div style={{ color: C.brownDark, fontSize: 13, fontWeight: 600 }}>
            Processing…
          </div>
        )}
        {!uploading && hasImage && (
          <>
            <img
              src={current}
              alt="Product"
              style={{
                width: '100%',
                height: 180,
                objectFit: 'cover',
                display: 'block',
                borderRadius: 10,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background .18s',
                borderRadius: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.45)';
                e.currentTarget
                  .querySelectorAll('button')
                  .forEach((b) => ((b as HTMLElement).style.opacity = '1'));
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0)';
                e.currentTarget
                  .querySelectorAll('button')
                  .forEach((b) => ((b as HTMLElement).style.opacity = '0'));
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileRef.current?.click();
                }}
                style={{
                  opacity: 0,
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
                  color: C.brownDarker,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'opacity .15s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Icon.Camera /> Change
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                style={{
                  opacity: 0,
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'rgba(198,40,40,0.9)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'opacity .15s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Icon.Trash /> Remove
              </button>
            </div>
          </>
        )}
        {!uploading && !hasImage && (
          <>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${C.yellow}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: C.brownDark,
              }}
            >
              <Icon.Upload />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{ fontWeight: 700, fontSize: 13, color: C.brownDark }}
              >
                Click or drag & drop
              </div>
              <div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>
                PNG, JPG, WEBP · max 5MB
              </div>
            </div>
          </>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) processFile(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}

// ─── PRODUCT MODAL ────────────────────────────────────────────────────────────
function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: Partial<Product> | null;
  onClose: () => void;
  onSave: (p: Partial<Product>) => Promise<void>;
}) {
  const isNew = !product?.id;
  const [form, setForm] = useState<Partial<Product>>(
    product ?? {
      name: '',
      category: 'Toppings',
      price: 0,
      stock: 0,
      image: '',
    },
  );
  const [vis, setVis] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    requestAnimationFrame(() => setVis(true));
  }, []);
  const close = () => {
    setVis(false);
    setTimeout(onClose, 240);
  };

  return (
    <div
      className="modal-overlay"
      style={{
        background: vis ? 'rgba(20,8,0,0.55)' : 'rgba(20,8,0,0)',
        transition: 'background .24s',
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 540,
          background: '#fff',
          borderRadius: 18,
          overflow: 'hidden',
          transform: vis
            ? 'scale(1) translateY(0)'
            : 'scale(0.97) translateY(16px)',
          opacity: vis ? 1 : 0,
          transition: 'all .26s cubic-bezier(.4,0,.2,1)',
          boxShadow: '0 24px 64px rgba(30,10,0,.28)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            background: `linear-gradient(135deg,${C.brownDarker},#5A2800)`,
            borderBottom: `2px solid ${C.yellow}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: C.brownDarker,
            }}
          >
            {isNew ? <Icon.Plus size={18} /> : <Icon.Edit />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.yellow }}>
              {isNew ? 'Add New Ingredient' : 'Edit Ingredient'}
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(245,200,66,.55)',
                marginTop: 1,
              }}
            >
              Changes are saved to the database · visible to franchisees
            </div>
          </div>
          <button
            onClick={close}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: '1.5px solid rgba(245,200,66,.3)',
              background: 'rgba(245,200,66,.1)',
              color: C.yellow,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.X />
          </button>
        </div>
        {/* Body */}
        <div
          style={{
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            maxHeight: 480,
            overflowY: 'auto',
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
          <ImageUploader
            current={form.image ?? ''}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
          />
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
              Name <span style={{ color: C.orange }}>*</span>
            </div>
            <input
              type="text"
              className="inp-field"
              value={form.name ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Nata de Coco"
              style={{
                border: `1.5px solid ${!form.name ? '#EF9A9A' : '#E8DDD0'}`,
              }}
            />
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
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
                Category
              </div>
              <div style={{ position: 'relative' }}>
                <select
                  className="inp-field"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  style={{
                    paddingRight: 32,
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <span
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: C.brownDark,
                  }}
                >
                  <Icon.ChevronDown />
                </span>
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
                Price per unit (₱) <span style={{ color: C.orange }}>*</span>
              </div>
              <input
                type="number"
                className="inp-field"
                value={form.price ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: +e.target.value }))
                }
                placeholder="0.00"
                min="0"
              />
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
              Stock Quantity <span style={{ color: C.orange }}>*</span>
            </div>
            <input
              type="number"
              className="inp-field"
              value={form.stock ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, stock: +e.target.value }))
              }
              placeholder="0"
              min="0"
            />
          </div>
        </div>
        {/* Footer */}
        <div
          style={{
            padding: '14px 24px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            borderTop: '1px solid #F0E8D8',
          }}
        >
          <button
            onClick={close}
            style={{
              padding: '9px 18px',
              borderRadius: 10,
              border: '1.5px solid #D4C4B0',
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
            disabled={saving}
            onClick={async () => {
              if (!form.name) return;
              setSaving(true);
              setError('');
              try {
                await onSave(form);
                close();
              } catch (err: any) {
                setError(err.message ?? 'Failed to save');
              } finally {
                setSaving(false);
              }
            }}
            style={{
              padding: '9px 22px',
              borderRadius: 10,
              border: 'none',
              background: saving
                ? '#CCC'
                : `linear-gradient(135deg,${C.yellow},${C.orange})`,
              color: C.brownDarker,
              fontWeight: 800,
              fontSize: 13,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 3px 12px rgba(255,140,0,.25)',
            }}
          >
            {saving ? 'Saving…' : isNew ? 'Add Ingredient' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DELETE MODAL ─────────────────────────────────────────────────────────────
function DeleteModal({
  product,
  onClose,
  onConfirm,
}: {
  product: Product;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [vis, setVis] = useState(false);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVis(true));
  }, []);
  const close = () => {
    setVis(false);
    setTimeout(onClose, 240);
  };
  return (
    <div
      className="modal-overlay"
      style={{
        background: vis ? 'rgba(20,8,0,0.55)' : 'rgba(20,8,0,0)',
        transition: 'background .24s',
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 18,
          maxWidth: 380,
          width: '100%',
          transform: vis ? 'scale(1)' : 'scale(0.94)',
          opacity: vis ? 1 : 0,
          transition: 'all .26s',
          boxShadow: '0 24px 60px rgba(30,10,0,.25)',
          padding: 28,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: '#FFEBEE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#C62828',
          }}
        >
          <Icon.Trash />
        </div>
        <div
          style={{
            fontWeight: 800,
            fontSize: 17,
            color: C.brownDarker,
            marginBottom: 6,
          }}
        >
          Remove Ingredient?
        </div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: C.brownDarker,
            marginBottom: 8,
          }}
        >
          {product.name}
        </div>
        <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 24 }}>
          This will remove it from the database and the franchisee order
          catalog.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={close}
            style={{
              flex: 1,
              padding: 11,
              borderRadius: 10,
              border: '1.5px solid #D4C4B0',
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
            disabled={deleting}
            onClick={async () => {
              setDeleting(true);
              await onConfirm();
              close();
            }}
            style={{
              flex: 1,
              padding: 11,
              borderRadius: 10,
              border: 'none',
              background: deleting
                ? '#CCC'
                : 'linear-gradient(135deg,#C62828,#B71C1C)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              cursor: deleting ? 'not-allowed' : 'pointer',
            }}
          >
            {deleting ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({
  p,
  onEdit,
  onDelete,
  onStock,
}: {
  p: Product;
  onEdit: () => void;
  onDelete: () => void;
  onStock: (n: number) => void;
}) {
  const [pop, setPop] = useState(false);
  const hasImage =
    p.image && (p.image.startsWith('http') || p.image.startsWith('data:'));
  return (
    <div className="prod-card">
      {/* Image band */}
      <div
        style={{
          height: 112,
          background: hasImage
            ? 'transparent'
            : 'linear-gradient(135deg,#F4EFE6,#EDE5D8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderRadius: '12px 12px 0 0',
          overflow: 'hidden',
        }}
      >
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
        {p.status === 'Out of Stock' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,.38)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                color: '#fff',
                fontWeight: 700,
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '.06em',
              }}
            >
              Out of Stock
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
            fontWeight: 700,
            fontSize: 13.5,
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

        {/* Price + sales row */}
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
              fontSize: 18,
              color: C.brownDarker,
              letterSpacing: '-.4px',
            }}
          >
            ₱{Number(p.price).toLocaleString()}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 11,
              color: C.textMuted,
            }}
          >
            <Icon.TrendingUp />
            {p.sales}
          </span>
        </div>

        {/* Stock */}
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: C.brownDark }}>
              Stock
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
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 5 }}>
          <button className="btn-edit" onClick={onEdit} style={{ flex: 1 }}>
            <Icon.Edit /> Edit
          </button>
          <div style={{ position: 'relative' }}>
            <button
              className="btn-stock"
              onClick={() => setPop((v) => !v)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1.5px solid #E8DDD0',
                background: '#FAFAF8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: C.brownDarker,
              }}
            >
              <Icon.PlusSmall />
            </button>
            {pop && (
              <StockPopover
                value={p.stock}
                onSave={onStock}
                onClose={() => setPop(false)}
              />
            )}
          </div>
          <button className="btn-delete" onClick={onDelete}>
            <Icon.Trash />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');
  const [sidebarOpen, setSidebar] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatus] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setView] = useState<ViewMode>('grid');
  const [editProd, setEdit] = useState<Partial<Product> | null | undefined>(
    undefined,
  );
  const [delProd, setDel] = useState<Product | null>(null);
  const [createModal, setCreate] = useState(false);
  const [successModal, setSuccess] = useState(false);
  const [account, setAccount] = useState<CreatedAccountData | null>(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      if (u)
        setAdminName(
          (JSON.parse(u) as { fullName?: string }).fullName ?? 'Admin',
        );
    } catch {
      /**/
    }
  }, []);

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
      setFetchError('Cannot reach backend. Is it running on port 3000?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const handleNav = (route: string) => router.push(route);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const apiSaveProduct = async (data: Partial<Product>) => {
    const token = getStoredToken();
    const isNew = !data.id;
    const res = await fetch(
      isNew
        ? 'http://localhost:3000/api/products'
        : `http://localhost:3000/api/products/${data.id}`,
      {
        method: isNew ? 'POST' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          price: data.price,
          stock: data.stock,
          image: data.image,
        }),
      },
    );
    const json = (await res.json()) as {
      success: boolean;
      data: Product;
      message?: string;
    };
    if (!res.ok || !json.success)
      throw new Error(json.message ?? 'Failed to save');
    await fetchProducts();
  };

  const apiUpdateStock = async (id: string, stock: number) => {
    const token = getStoredToken();
    const res = await fetch(`http://localhost:3000/api/products/${id}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stock }),
    });
    const json = (await res.json()) as { success: boolean; data: Product };
    if (json.success)
      setProducts((prev) => prev.map((p) => (p.id === id ? json.data : p)));
  };

  const apiDeleteProduct = async (id: string) => {
    const token = getStoredToken();
    await fetch(`http://localhost:3000/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const filtered = products
    .filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        (statusFilter === 'All' || p.status === statusFilter) &&
        p.name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const v =
        sortKey === 'name'
          ? a.name.localeCompare(b.name)
          : sortKey === 'price'
            ? a.price - b.price
            : sortKey === 'stock'
              ? a.stock - b.stock
              : a.sales - b.sales;
      return sortAsc ? v : -v;
    });

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc((v) => !v);
    else {
      setSortKey(k);
      setSortAsc(true);
    }
  };

  const total = products.length;
  const inStock = products.filter((p) => p.status === 'In Stock').length;
  const lowStock = products.filter((p) => p.status === 'Low Stock').length;
  const outStock = products.filter((p) => p.status === 'Out of Stock').length;
  const sold = products.reduce((s, p) => s + p.sales, 0);

  const statCards = [
    {
      label: 'Total Ingredients',
      value: total,
      grad: `linear-gradient(135deg,${C.orange},#CC7000)`,
      icon: <Icon.Package />,
    },
    {
      label: 'In Stock',
      value: inStock,
      grad: `linear-gradient(135deg,${C.green},${C.darkGreen})`,
      icon: <Icon.CheckCircle />,
    },
    {
      label: 'Low Stock',
      value: lowStock,
      grad: 'linear-gradient(135deg,#FB8C00,#E65100)',
      icon: <Icon.AlertTriangle />,
    },
    {
      label: 'Out of Stock',
      value: outStock,
      grad: 'linear-gradient(135deg,#C62828,#B71C1C)',
      icon: <Icon.XCircle />,
    },
    {
      label: 'Total Units Sold',
      value: sold,
      grad: 'linear-gradient(135deg,#4A9ECA,#2E7BAD)',
      icon: <Icon.TrendingUp />,
    },
  ];

  return (
    <>
      <style>{globalStyles}</style>
      <CreateAccountModal
        isOpen={createModal}
        onClose={() => setCreate(false)}
        onSuccess={(d) => {
          setAccount(d);
          setCreate(false);
          setTimeout(() => setSuccess(true), 320);
        }}
      />
      <SuccessCredentialModal
        isOpen={successModal}
        data={account}
        onClose={() => setSuccess(false)}
        onCreateAnother={() => {
          setSuccess(false);
          setTimeout(() => setCreate(true), 320);
        }}
      />
      {editProd !== undefined && (
        <ProductModal
          product={editProd}
          onClose={() => setEdit(undefined)}
          onSave={apiSaveProduct}
        />
      )}
      {delProd && (
        <DeleteModal
          product={delProd}
          onClose={() => setDel(null)}
          onConfirm={() => apiDeleteProduct(delProd.id)}
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
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          activeNav="Products"
          onNav={handleNav}
          adminName={adminName}
          onCreateAccount={() => setCreate(true)}
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
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <header
            style={{
              background: C.surface,
              borderBottom: `2px solid ${C.yellow}`,
              padding: '0 28px',
              height: 68,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              boxShadow: '0 1px 8px rgba(0,0,0,.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                onClick={() => setSidebar((v) => !v)}
                style={{
                  border: '1.5px solid transparent',
                  borderRadius: 9,
                  padding: '7px 8px',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  transition: 'all .15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${C.yellow}20`;
                  e.currentTarget.style.borderColor = `${C.yellow}80`;
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
                      width: 18,
                      height: 2,
                      background: C.brown,
                      borderRadius: 2,
                    }}
                  />
                ))}
              </button>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: C.brownDark,
                    letterSpacing: '-.3px',
                  }}
                >
                  Ingredient Catalog
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: C.green,
                    fontWeight: 600,
                    marginTop: 1,
                  }}
                >
                  {loading
                    ? 'Loading…'
                    : `${total} ingredients · visible to all franchisees`}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="header-btn"
                onClick={() => setEdit(null)}
                style={{
                  background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
                  color: C.brownDarker,
                  border: 'none',
                  boxShadow: '0 3px 12px rgba(255,140,0,.28)',
                }}
              >
                <Icon.Plus /> Add Ingredient
              </button>
              <button
                className="header-btn"
                onClick={() => void fetchProducts()}
                style={{
                  background: `${C.yellow}18`,
                  border: `1.5px solid ${C.yellow}`,
                  color: C.brownDark,
                }}
              >
                <Icon.RefreshCw /> Refresh
              </button>
              <button
                className="header-btn"
                onClick={handleLogout}
                style={{
                  background: `linear-gradient(135deg,${C.brownDark},${C.brownDarker})`,
                  color: C.yellow,
                  border: '1.5px solid rgba(245,200,66,.3)',
                }}
              >
                <Icon.LogOut /> Sign Out
              </button>
            </div>
          </header>

          {/* ── Scrollable body ─────────────────────────────────────────────── */}
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: 24,
              background: C.bg,
            }}
          >
            {/* Stat cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5,1fr)',
                gap: 12,
                marginBottom: 20,
              }}
            >
              {statCards.map((card, i) => (
                <div key={i} className="stat-card">
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: card.grad,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10,
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,.14)',
                    }}
                  >
                    {card.icon}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: C.textMuted,
                      marginBottom: 2,
                      textTransform: 'uppercase',
                      letterSpacing: '.04em',
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: C.brownDarker,
                      letterSpacing: '-.5px',
                      lineHeight: 1,
                    }}
                  >
                    {loading ? '—' : card.value.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Filter bar */}
            <div
              style={{
                background: C.surface,
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 14,
                boxShadow: '0 1px 4px rgba(0,0,0,.05)',
                border: `1.5px solid ${C.border}`,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                alignItems: 'center',
              }}
            >
              {/* Search */}
              <div
                style={{
                  position: 'relative',
                  flex: '1 1 200px',
                  minWidth: 160,
                }}
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
                  style={{
                    paddingLeft: 32,
                    paddingRight: 12,
                    paddingTop: 8,
                    paddingBottom: 8,
                  }}
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

              {/* Status select */}
              <div style={{ position: 'relative' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatus(e.target.value)}
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

              {/* Sort */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: C.textSub,
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                    marginRight: 2,
                  }}
                >
                  Sort
                </span>
                {(['name', 'price', 'stock', 'sales'] as SortKey[]).map((k) => (
                  <button
                    key={k}
                    className={`sort-btn${sortKey === k ? ' active' : ''}`}
                    onClick={() => toggleSort(k)}
                  >
                    {k.charAt(0).toUpperCase() + k.slice(1)}
                    {sortKey === k && (
                      <span style={{ marginLeft: 2 }}>
                        {sortAsc ? <Icon.ArrowUp /> : <Icon.ArrowDown />}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div
                style={{
                  display: 'flex',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: `1.5px solid ${C.border}`,
                  marginLeft: 'auto',
                }}
              >
                <button
                  className={`view-btn${viewMode === 'grid' ? ' active' : ''}`}
                  onClick={() => setView('grid')}
                >
                  <Icon.Grid /> Grid
                </button>
                <button
                  className={`view-btn${viewMode === 'table' ? ' active' : ''}`}
                  onClick={() => setView('table')}
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
              <strong style={{ color: C.brownDarker }}>
                {filtered.length}
              </strong>{' '}
              of <strong style={{ color: C.brownDarker }}>{total}</strong>{' '}
              ingredients
            </div>

            {/* Error banner */}
            {fetchError && (
              <div
                style={{
                  padding: '14px 18px',
                  background: '#FFEBEE',
                  borderRadius: 10,
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
                <Icon.AlertTriangle /> {fetchError}
                <button
                  onClick={() => void fetchProducts()}
                  style={{
                    marginLeft: 'auto',
                    padding: '5px 14px',
                    borderRadius: 7,
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
                  color: C.textMuted,
                  fontSize: 14,
                }}
              >
                Loading ingredients from database…
              </div>
            )}

            {/* ── GRID VIEW ── */}
            {!loading && viewMode === 'grid' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(196px,1fr))',
                  gap: 14,
                }}
              >
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    p={p}
                    onEdit={() => setEdit(p)}
                    onDelete={() => setDel(p)}
                    onStock={(n) => void apiUpdateStock(p.id, n)}
                  />
                ))}
                {/* Add card */}
                <div className="add-card" onClick={() => setEdit(null)}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: C.brownDarker,
                      boxShadow: '0 3px 12px rgba(255,140,0,.28)',
                    }}
                  >
                    <Icon.Plus size={20} />
                  </div>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: C.brownDark,
                    }}
                  >
                    Add Ingredient
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: C.textSub,
                      textAlign: 'center',
                      lineHeight: 1.4,
                    }}
                  >
                    Saved to DB · visible to franchisees
                  </span>
                </div>
                {filtered.length === 0 && !fetchError && (
                  <div
                    style={{
                      gridColumn: '1/-1',
                      padding: 48,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ color: C.textSub, marginBottom: 8 }}>
                      <Icon.Search />
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: C.brownDark,
                      }}
                    >
                      No ingredients found
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TABLE VIEW ── */}
            {!loading && viewMode === 'table' && (
              <div
                style={{
                  background: C.surface,
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: '0 1px 8px rgba(0,0,0,.07)',
                  border: `2px solid ${C.yellow}`,
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr
                      style={{
                        background: `linear-gradient(90deg,${C.brownDarker},${C.brownDark})`,
                      }}
                    >
                      {[
                        'Ingredient',
                        'Price',
                        'Stock',
                        'Status',
                        'Sales',
                        'Actions',
                      ].map((col) => (
                        <th
                          key={col}
                          style={{
                            padding: '12px 18px',
                            textAlign: 'left',
                            fontSize: 10,
                            fontWeight: 800,
                            color: C.yellow,
                            textTransform: 'uppercase',
                            letterSpacing: '.08em',
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
                      return (
                        <tr
                          key={p.id}
                          className="tr-product"
                          style={{
                            borderBottom: `1px solid ${C.border}`,
                            background: idx % 2 === 0 ? '#fff' : '#FDFAF8',
                          }}
                        >
                          <td style={{ padding: '12px 18px' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                              }}
                            >
                              <div
                                style={{
                                  width: 42,
                                  height: 42,
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
                              <div>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    fontSize: 13,
                                    color: C.brownDarker,
                                  }}
                                >
                                  {p.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: C.orange,
                                    fontWeight: 600,
                                  }}
                                >
                                  {p.category}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: '12px 18px',
                              fontWeight: 900,
                              fontSize: 13,
                              color: C.brownDarker,
                            }}
                          >
                            ₱{Number(p.price).toLocaleString()}
                          </td>
                          <td style={{ padding: '12px 18px' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontSize: 13,
                                  color:
                                    p.stock === 0
                                      ? '#C62828'
                                      : p.stock <= 10
                                        ? '#E65100'
                                        : C.darkGreen,
                                  minWidth: 24,
                                }}
                              >
                                {p.stock}
                              </span>
                              <div style={{ flex: 1, minWidth: 50 }}>
                                <StockBar stock={p.stock} />
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 18px' }}>
                            <StatusBadge status={p.status} />
                          </td>
                          <td
                            style={{
                              padding: '12px 18px',
                              fontSize: 13,
                              color: C.textMuted,
                              fontWeight: 600,
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <Icon.TrendingUp />
                              {p.sales}
                            </span>
                          </td>
                          <td style={{ padding: '12px 18px' }}>
                            <div style={{ display: 'flex', gap: 5 }}>
                              <button
                                className="btn-edit"
                                onClick={() => setEdit(p)}
                              >
                                <Icon.Edit /> Edit
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => setDel(p)}
                              >
                                <Icon.Trash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ color: C.textSub, marginBottom: 8 }}>
                      <Icon.Search />
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: C.brownDark,
                      }}
                    >
                      No ingredients found
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
