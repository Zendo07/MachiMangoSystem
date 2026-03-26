'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateAccountModal, {
  type CreatedAccountData,
} from '@/components/admin/CreateAccountModal';
import SuccessCredentialModal from '@/components/admin/SuccessCredentialModal';

// ─── COLORS ───────────────────────────────────────────────────────────────────
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
  id: number;
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

// ─── DATA ─────────────────────────────────────────────────────────────────────
const INITIAL_PRODUCTS: Product[] = [
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
    name: 'Mango Polvoron',
    category: 'Snacks',
    price: 75,
    stock: 3,
    image: '🌟',
    status: 'Low Stock',
    sales: 74,
  },
  {
    id: 9,
    name: 'Mango Turon',
    category: 'Snacks',
    price: 45,
    stock: 0,
    image: '🌯',
    status: 'Out of Stock',
    sales: 62,
  },
  {
    id: 10,
    name: 'Fresh Mango (per kg)',
    category: 'Fresh',
    price: 180,
    stock: 90,
    image: '🥭',
    status: 'In Stock',
    sales: 671,
  },
  {
    id: 11,
    name: 'Mango Jam',
    category: 'Spreads',
    price: 135,
    stock: 55,
    image: '🫙',
    status: 'In Stock',
    sales: 210,
  },
  {
    id: 12,
    name: 'Mango Tart',
    category: 'Desserts',
    price: 175,
    stock: 7,
    image: '🥧',
    status: 'Low Stock',
    sales: 143,
  },
];

const CATEGORIES = [
  'All',
  'Desserts',
  'Ice Cream',
  'Drinks',
  'Snacks',
  'Candy',
  'Fresh',
  'Spreads',
];
const EMOJIS = [
  '🥭',
  '🍦',
  '🧋',
  '🍋',
  '🍰',
  '🥤',
  '🍬',
  '🌟',
  '🌯',
  '🫙',
  '🥧',
  '🍱',
];

function autoStatus(qty: number): Product['status'] {
  return qty === 0 ? 'Out of Stock' : qty <= 10 ? 'Low Stock' : 'In Stock';
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
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
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
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
        boxShadow: '0 8px 32px rgba(0,0,0,.2)',
        border: `1.5px solid ${C.yellow}`,
        top: '110%',
        left: '50%',
        transform: 'translateX(-50%)',
        minWidth: 164,
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
            lineHeight: 1,
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
            lineHeight: 1,
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

// ─── ADD/EDIT MODAL ───────────────────────────────────────────────────────────
function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: Partial<Product> | null;
  onClose: () => void;
  onSave: (p: Partial<Product>) => void;
}) {
  const isNew = !product?.id;
  const [form, setForm] = useState<Partial<Product>>(
    product ?? {
      name: '',
      category: 'Desserts',
      price: 0,
      stock: 0,
      image: '🥭',
      status: 'In Stock',
      sales: 0,
    },
  );
  const [vis, setVis] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVis(true));
  }, []);
  const close = () => {
    setVis(false);
    setTimeout(onClose, 240);
  };
  const inp = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 11,
    border: '2px solid #E5D9C8',
    background: '#FDFAF4',
    color: C.brownDarker,
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && close()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: vis ? 'rgba(30,10,0,0.55)' : 'rgba(30,10,0,0)',
        backdropFilter: vis ? 'blur(3px)' : 'none',
        transition: 'all .24s',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: '#fff',
          borderRadius: 20,
          overflow: 'hidden',
          transform: vis
            ? 'scale(1) translateY(0)'
            : 'scale(0.96) translateY(20px)',
          opacity: vis ? 1 : 0,
          transition: 'all .28s cubic-bezier(.4,0,.2,1)',
          boxShadow: '0 32px 80px rgba(62,26,0,.3)',
        }}
      >
        <div
          style={{
            padding: '20px 26px',
            background: `linear-gradient(135deg,${C.brownDarker},#5A2800)`,
            borderBottom: `3px solid ${C.yellow}`,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            {isNew ? '➕' : '✏️'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: C.yellow }}>
              {isNew ? 'Add New Product' : 'Edit Product'}
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'rgba(245,200,66,.6)',
                marginTop: 2,
              }}
            >
              {isNew
                ? 'Fill in the details to add a product'
                : 'Update the product information'}
            </div>
          </div>
          <button
            onClick={close}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: '2px solid rgba(245,200,66,.3)',
              background: 'rgba(245,200,66,.1)',
              color: C.yellow,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            padding: '20px 26px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            maxHeight: 420,
            overflowY: 'auto',
          }}
        >
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
              Product Icon
            </div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setForm((f) => ({ ...f, image: e }))}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    border: `2px solid ${form.image === e ? C.orange : '#E5D9C8'}`,
                    background: form.image === e ? '#FFF0D9' : '#FDFAF4',
                    fontSize: 19,
                    cursor: 'pointer',
                    transition: 'all .15s',
                    transform: form.image === e ? 'scale(1.12)' : 'scale(1)',
                  }}
                >
                  {e}
                </button>
              ))}
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
              Product Name <span style={{ color: C.orange }}>*</span>
            </div>
            <input
              type="text"
              value={form.name ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Mango Graham Float"
              style={{
                ...inp,
                border: `2px solid ${!form.name ? '#EF9A9A' : '#E5D9C8'}`,
              }}
              onFocus={(e) => (e.target.style.borderColor = C.yellow)}
              onBlur={(e) =>
                (e.target.style.borderColor = form.name ? '#E5D9C8' : '#EF9A9A')
              }
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
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  style={{
                    ...inp,
                    paddingRight: 32,
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = C.yellow)
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = '#E5D9C8')
                  }
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <svg
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                  width="11"
                  height="11"
                  fill="none"
                  stroke={C.brownDark}
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
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
                Price (₱) <span style={{ color: C.orange }}>*</span>
              </div>
              <input
                type="number"
                value={form.price ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: +e.target.value }))
                }
                placeholder="0.00"
                min="0"
                style={inp}
                onFocus={(e) => (e.target.style.borderColor = C.yellow)}
                onBlur={(e) => (e.target.style.borderColor = '#E5D9C8')}
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
              value={form.stock ?? ''}
              onChange={(e) => {
                const q = +e.target.value;
                setForm((f) => ({ ...f, stock: q, status: autoStatus(q) }));
              }}
              placeholder="0"
              min="0"
              style={inp}
              onFocus={(e) => (e.target.style.borderColor = C.yellow)}
              onBlur={(e) => (e.target.style.borderColor = '#E5D9C8')}
            />
            <div
              style={{
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <StatusBadge status={form.status ?? 'In Stock'} />
              <span
                style={{ fontSize: 11, color: '#AAA', fontStyle: 'italic' }}
              >
                auto-set from quantity
              </span>
            </div>
          </div>
        </div>
        <div
          style={{
            padding: '14px 26px 20px',
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
            onClick={() => {
              if (!form.name) return;
              onSave(form);
              close();
            }}
            style={{
              padding: '10px 24px',
              borderRadius: 11,
              border: 'none',
              background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
              color: C.brownDarker,
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255,140,0,.3)',
            }}
          >
            {isNew ? '✓  Add Product' : '✓  Save Changes'}
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
  onConfirm: () => void;
}) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVis(true));
  }, []);
  const close = () => {
    setVis(false);
    setTimeout(onClose, 240);
  };
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && close()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: vis ? 'rgba(30,10,0,0.55)' : 'rgba(30,10,0,0)',
        backdropFilter: vis ? 'blur(3px)' : 'none',
        transition: 'all .24s',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          maxWidth: 400,
          width: '100%',
          transform: vis ? 'scale(1)' : 'scale(0.92)',
          opacity: vis ? 1 : 0,
          transition: 'all .28s',
          boxShadow: '0 24px 60px rgba(62,26,0,.3)',
          padding: 28,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: '#FFEBEE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            margin: '0 auto 14px',
          }}
        >
          🗑️
        </div>
        <div
          style={{
            fontWeight: 800,
            fontSize: 17,
            color: C.brownDarker,
            marginBottom: 6,
          }}
        >
          Remove Product?
        </div>
        <div style={{ color: C.brownDark, fontSize: 14, marginBottom: 4 }}>
          You are about to remove
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: C.brownDarker,
            marginBottom: 8,
          }}
        >
          {product.image} {product.name}
        </div>
        <div style={{ color: '#999', fontSize: 13, marginBottom: 22 }}>
          This action cannot be undone.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={close}
            style={{
              flex: 1,
              padding: 11,
              borderRadius: 12,
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
            onClick={() => {
              onConfirm();
              close();
            }}
            style={{
              flex: 1,
              padding: 11,
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg,#C62828,#B71C1C)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Remove
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
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        borderRadius: 18,
        border: `2px solid ${hov ? C.yellow : '#F0E8D8'}`,
        overflow: 'visible',
        transition: 'all .22s',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hov
          ? '0 16px 40px rgba(62,26,0,.14)'
          : '0 2px 10px rgba(0,0,0,.06)',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: 96,
          background: 'linear-gradient(135deg,#F2EAD8,#EFE0C8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 50,
          position: 'relative',
          borderRadius: '16px 16px 0 0',
        }}
      >
        <span style={{ filter: 'drop-shadow(0 4px 8px rgba(62,26,0,.18))' }}>
          {p.image}
        </span>
        <div style={{ position: 'absolute', top: 9, right: 9 }}>
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
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontWeight: 900,
              fontSize: 19,
              color: C.brownDarker,
              letterSpacing: '-.5px',
            }}
          >
            ₱{p.price}
          </span>
          <span
            style={{
              fontSize: 11,
              color: '#888',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <svg
              width="11"
              height="11"
              fill="none"
              stroke={C.green}
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            {p.sales} sold
          </span>
        </div>
        <div style={{ marginBottom: 11 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 3,
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
                      ? '#CC7000'
                      : C.darkGreen,
              }}
            >
              {p.stock} units
            </span>
          </div>
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
                transition: 'width .4s',
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
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onEdit}
            style={{
              flex: 1,
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
              gap: 4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.yellow;
              e.currentTarget.style.background = '#FFFAE0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5D9C8';
              e.currentTarget.style.background = '#FDFAF4';
            }}
          >
            <svg
              width="11"
              height="11"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setPop((v) => !v)}
              style={{
                padding: '7px 10px',
                borderRadius: 9,
                border: '1.5px solid #E5D9C8',
                background: '#FDFAF4',
                color: C.brownDark,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = C.orange)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = '#E5D9C8')
              }
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
            </button>
            {pop && (
              <StockPopover
                value={p.stock}
                onSave={onStock}
                onClose={() => setPop(false)}
              />
            )}
          </div>
          <button
            onClick={onDelete}
            style={{
              padding: '7px 10px',
              borderRadius: 9,
              border: '1.5px solid #FFCDD2',
              background: '#FFEBEE',
              color: '#C62828',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FFCDD2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#FFEBEE')}
          >
            <svg
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TABLE ROW ────────────────────────────────────────────────────────────────
function TableRow({
  p,
  idx,
  onEdit,
  onDelete,
  onStock,
}: {
  p: Product;
  idx: number;
  onEdit: () => void;
  onDelete: () => void;
  onStock: (n: number) => void;
}) {
  const [pop, setPop] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `${C.yellow}12` : idx % 2 === 0 ? '#fff' : '#FDFAF4',
        borderBottom: '1.5px solid #F0E8D8',
        transition: 'background .15s',
      }}
    >
      <td style={{ padding: '13px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background: 'linear-gradient(135deg,#F2EAD8,#EFE0C8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            {p.image}
          </div>
          <div>
            <div
              style={{ fontWeight: 700, fontSize: 13, color: C.brownDarker }}
            >
              {p.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: C.orange,
                fontWeight: 600,
                marginTop: 1,
              }}
            >
              {p.category}
            </div>
          </div>
        </div>
      </td>
      <td
        style={{
          padding: '13px 20px',
          fontWeight: 900,
          fontSize: 14,
          color: C.brownDarker,
        }}
      >
        ₱{p.price}
      </td>
      <td style={{ padding: '13px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: 13,
              color:
                p.stock === 0
                  ? '#C62828'
                  : p.stock <= 10
                    ? '#CC7000'
                    : C.darkGreen,
              minWidth: 26,
            }}
          >
            {p.stock}
          </span>
          <div
            style={{
              flex: 1,
              height: 5,
              background: '#F0E8D8',
              borderRadius: 10,
              overflow: 'hidden',
              minWidth: 50,
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
        </div>
      </td>
      <td style={{ padding: '13px 20px' }}>
        <StatusBadge status={p.status} />
      </td>
      <td
        style={{
          padding: '13px 20px',
          fontWeight: 600,
          fontSize: 13,
          color: '#666',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg
            width="11"
            height="11"
            fill="none"
            stroke={C.green}
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
          {p.sales}
        </span>
      </td>
      <td style={{ padding: '13px 20px' }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <button
            onClick={onEdit}
            style={{
              padding: '6px 11px',
              borderRadius: 8,
              border: '1.5px solid #E5D9C8',
              background: '#FDFAF4',
              color: C.brownDark,
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.yellow;
              e.currentTarget.style.background = '#FFFAE0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5D9C8';
              e.currentTarget.style.background = '#FDFAF4';
            }}
          >
            <svg
              width="11"
              height="11"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setPop((v) => !v)}
              style={{
                padding: '6px 9px',
                borderRadius: 8,
                border: '1.5px solid #E5D9C8',
                background: '#FDFAF4',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = C.orange)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = '#E5D9C8')
              }
            >
              <svg
                width="11"
                height="11"
                fill="none"
                stroke={C.brownDark}
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            {pop && (
              <StockPopover
                value={p.stock}
                onSave={onStock}
                onClose={() => setPop(false)}
              />
            )}
          </div>
          <button
            onClick={onDelete}
            style={{
              padding: '6px 9px',
              borderRadius: 8,
              border: '1.5px solid #FFCDD2',
              background: '#FFEBEE',
              color: '#C62828',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FFCDD2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#FFEBEE')}
          >
            <svg
              width="11"
              height="11"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
// Nav: Dashboard · Franchisee Orders · Products (no Analytics, no Settings, no Branches)
const ADMIN_NAV = [
  {
    name: 'Dashboard',
    route: '/admin/dashboard',
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
    name: 'Franchisee Orders',
    route: '/admin/orders',
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
  {
    name: 'Products',
    route: '/admin/products',
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
];

function Sidebar({
  open,
  adminName,
  onNav,
  onCreateAccount,
}: {
  open: boolean;
  adminName: string;
  onNav: (route: string) => void;
  onCreateAccount: () => void;
}) {
  return (
    <aside
      style={{
        width: open ? 256 : 72,
        background: `linear-gradient(180deg,${C.brownDarker} 0%,${C.brownDark} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.28s cubic-bezier(.4,0,.2,1)',
        flexShrink: 0,
        boxShadow: '4px 0 24px rgba(62,26,0,0.18)',
        zIndex: 10,
      }}
    >
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
          {open && (
            <div>
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
                  color: 'rgba(245,200,66,0.7)',
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                HQ Control Center
              </div>
            </div>
          )}
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto' }}>
        {open && (
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
        {ADMIN_NAV.map((item) => {
          const active = item.name === 'Products';
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
                color: active ? C.brownDarker : 'rgba(245,200,66,0.65)',
                fontWeight: active ? 700 : 500,
                fontSize: 13.5,
                boxShadow: active ? '0 4px 14px rgba(255,140,0,0.3)' : 'none',
                transition: 'all 0.18s',
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
              {open && (
                <span style={{ flex: 1, textAlign: 'left' }}>{item.name}</span>
              )}
            </button>
          );
        })}

        {open && (
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
            width: open ? '100%' : 42,
            margin: open ? '4px 0 8px' : '4px auto 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'flex-start' : 'center',
            gap: 10,
            padding: open ? '12px 14px' : '11px 0',
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
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(245,200,66,0.07)';
            e.currentTarget.style.borderColor = 'rgba(245,200,66,0.4)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
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
              boxShadow: '0 2px 8px rgba(255,140,0,0.35)',
            }}
          >
            +
          </div>
          {open && <span>Create Account</span>}
        </button>
      </nav>

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
            {adminName.charAt(0).toUpperCase()}
          </div>
          {open && (
            <div>
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
                {adminName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(245,200,66,0.6)',
                  marginTop: 1,
                }}
              >
                HQ Administrator
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');
  const [sidebarOpen, setSidebar] = useState(true);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
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
  const [loaded, setLoaded] = useState(false);
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
    setTimeout(() => setLoaded(true), 80);
  }, []);

  // Route to whatever page was clicked in the sidebar
  const handleNav = (route: string) => router.push(route);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  const handleCreated = (d: CreatedAccountData) => {
    setAccount(d);
    setCreate(false);
    setTimeout(() => setSuccess(true), 320);
  };
  const handleAnother = () => {
    setSuccess(false);
    setTimeout(() => setCreate(true), 320);
  };

  const total = products.length;
  const inStock = products.filter((p) => p.status === 'In Stock').length;
  const lowStock = products.filter((p) => p.status === 'Low Stock').length;
  const outStock = products.filter((p) => p.status === 'Out of Stock').length;
  const sold = products.reduce((s, p) => s + p.sales, 0);

  const filtered = products
    .filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        (statusFilter === 'All' || p.status === statusFilter) &&
        (p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())),
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
  const saveProduct = (data: Partial<Product>) => {
    if (data.id)
      setProducts((ps) =>
        ps.map((p) => (p.id === data.id ? ({ ...p, ...data } as Product) : p)),
      );
    else {
      const qty = data.stock ?? 0;
      setProducts((ps) => [
        ...ps,
        {
          ...data,
          id: Math.max(...ps.map((p) => p.id)) + 1,
          status: autoStatus(qty),
          sales: 0,
        } as Product,
      ]);
    }
  };
  const updateStock = (id: number, qty: number) =>
    setProducts((ps) =>
      ps.map((p) =>
        p.id === id ? { ...p, stock: qty, status: autoStatus(qty) } : p,
      ),
    );

  const SBtn = ({ label, k }: { label: string; k: SortKey }) => (
    <button
      onClick={() => toggleSort(k)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '6px 11px',
        borderRadius: 8,
        border: `1.5px solid ${sortKey === k ? C.yellow : '#E5D9C8'}`,
        background: sortKey === k ? '#FFFAE0' : 'transparent',
        color: sortKey === k ? C.brownDarker : C.brownDark,
        fontWeight: 700,
        fontSize: 12,
        cursor: 'pointer',
        transition: 'all .15s',
        flexShrink: 0,
      }}
    >
      {label}{' '}
      <span style={{ opacity: sortKey === k ? 1 : 0.3, fontSize: 10 }}>
        {sortKey === k && !sortAsc ? '↑' : '↓'}
      </span>
    </button>
  );

  return (
    <>
      <CreateAccountModal
        isOpen={createModal}
        onClose={() => setCreate(false)}
        onSuccess={handleCreated}
      />
      <SuccessCredentialModal
        isOpen={successModal}
        data={account}
        onClose={() => setSuccess(false)}
        onCreateAnother={handleAnother}
      />
      {editProd !== undefined && (
        <ProductModal
          product={editProd}
          onClose={() => setEdit(undefined)}
          onSave={saveProduct}
        />
      )}
      {delProd && (
        <DeleteModal
          product={delProd}
          onClose={() => setDel(null)}
          onConfirm={() =>
            setProducts((ps) => ps.filter((p) => p.id !== delProd.id))
          }
        />
      )}

      <div
        style={{
          display: 'flex',
          height: '100vh',
          background: C.bg,
          overflow: 'hidden',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        <Sidebar
          open={sidebarOpen}
          adminName={adminName}
          onNav={handleNav}
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
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
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
                  style={{
                    fontWeight: 800,
                    fontSize: 19,
                    color: C.brownDark,
                    letterSpacing: '-0.4px',
                  }}
                >
                  Products
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: C.green,
                    fontWeight: 600,
                    marginTop: 1,
                  }}
                >
                  Manage your store inventory · {total} items
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => setEdit(null)}
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
                  transition: 'all .18s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = 'translateY(-1px)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = 'translateY(0)')
                }
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  viewBox="0 0 24 24"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Product
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: '9px 20px',
                  background: `linear-gradient(135deg,${C.brownDark},${C.brownDarker})`,
                  color: C.yellow,
                  border: '2px solid rgba(245,200,66,0.4)',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = C.yellow)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = 'rgba(245,200,66,0.4)')
                }
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
            {/* Stat cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5,1fr)',
                gap: 14,
                marginBottom: 20,
              }}
            >
              {[
                {
                  label: 'Total Products',
                  value: total,
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
                {
                  label: 'Total Sold',
                  value: sold,
                  icon: '📈',
                  grad: 'linear-gradient(135deg,#4A9ECA,#2E7BAD)',
                },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    background: '#fff',
                    borderRadius: 14,
                    padding: '16px 18px',
                    boxShadow: '0 2px 10px rgba(0,0,0,.06)',
                    opacity: loaded ? 1 : 0,
                    transform: loaded ? 'translateY(0)' : 'translateY(14px)',
                    transition: `opacity .4s ${i * 0.06}s, transform .4s ${i * 0.06}s`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      '0 8px 24px rgba(0,0,0,.12)';
                    (e.currentTarget as HTMLElement).style.transform =
                      'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      '0 2px 10px rgba(0,0,0,.06)';
                    (e.currentTarget as HTMLElement).style.transform =
                      'translateY(0)';
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
                      boxShadow: '0 3px 8px rgba(0,0,0,.15)',
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
                    {card.value.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Filter bar */}
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
              <div
                style={{
                  position: 'relative',
                  flex: '1 1 200px',
                  minWidth: 160,
                }}
              >
                <svg
                  style={{
                    position: 'absolute',
                    left: 11,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#BBA98A',
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
                    color: C.brownDarker,
                    fontSize: 13,
                    outline: 'none',
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
              <div style={{ position: 'relative' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    padding: '8px 28px 8px 11px',
                    borderRadius: 10,
                    border: '1.5px solid #E5D9C8',
                    background: '#FDFAF4',
                    color: C.brownDark,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                  }}
                >
                  <option value="All">All Status</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
                <svg
                  style={{
                    position: 'absolute',
                    right: 9,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                  width="10"
                  height="10"
                  fill="none"
                  stroke={C.brownDark}
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 4,
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#BBA98A',
                    textTransform: 'uppercase',
                    letterSpacing: '.07em',
                    marginRight: 2,
                  }}
                >
                  Sort:
                </span>
                <SBtn label="Name" k="name" />
                <SBtn label="Price" k="price" />
                <SBtn label="Stock" k="stock" />
                <SBtn label="Sales" k="sales" />
              </div>
              <div
                style={{
                  display: 'flex',
                  borderRadius: 9,
                  overflow: 'hidden',
                  border: '1.5px solid #E5D9C8',
                  flexShrink: 0,
                  marginLeft: 'auto',
                }}
              >
                {(['grid', 'table'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setView(mode)}
                    style={{
                      padding: '7px 12px',
                      background:
                        viewMode === mode
                          ? `linear-gradient(135deg,${C.yellow},${C.orange})`
                          : 'transparent',
                      color: viewMode === mode ? C.brownDarker : C.brownDark,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {mode === 'grid' ? (
                      <svg
                        width="12"
                        height="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                      </svg>
                    ) : (
                      <svg
                        width="12"
                        height="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                    )}
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

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
              of <strong style={{ color: C.brownDarker }}>{total}</strong>{' '}
              products
              {search && (
                <span style={{ color: C.orange }}>
                  {' '}
                  for &quot;{search}&quot;
                </span>
              )}
            </div>

            {/* Grid view */}
            {viewMode === 'grid' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))',
                  gap: 16,
                }}
              >
                {filtered.map((p, i) => (
                  <div
                    key={p.id}
                    style={{
                      opacity: loaded ? 1 : 0,
                      transform: loaded ? 'translateY(0)' : 'translateY(18px)',
                      transition: `opacity .4s ${Math.min(i * 0.04, 0.4)}s, transform .4s ${Math.min(i * 0.04, 0.4)}s`,
                    }}
                  >
                    <ProductCard
                      p={p}
                      onEdit={() => setEdit(p)}
                      onDelete={() => setDel(p)}
                      onStock={(n) => updateStock(p.id, n)}
                    />
                  </div>
                ))}
                <div
                  onClick={() => setEdit(null)}
                  style={{
                    borderRadius: 18,
                    border: '2px dashed #D0BFA8',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 9,
                    padding: 28,
                    cursor: 'pointer',
                    transition: 'all .2s',
                    minHeight: 240,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      C.orange;
                    (e.currentTarget as HTMLElement).style.background =
                      '#FFF0D9';
                    (e.currentTarget as HTMLElement).style.transform =
                      'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      '#D0BFA8';
                    (e.currentTarget as HTMLElement).style.background =
                      'transparent';
                    (e.currentTarget as HTMLElement).style.transform =
                      'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      color: C.brownDarker,
                      fontWeight: 900,
                      boxShadow: '0 4px 14px rgba(255,140,0,.3)',
                    }}
                  >
                    +
                  </div>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: C.brownDark,
                    }}
                  >
                    Add Product
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: '#BBA98A',
                      textAlign: 'center',
                      lineHeight: 1.4,
                    }}
                  >
                    Click to add a new item to your store
                  </span>
                </div>
              </div>
            )}

            {/* Table view */}
            {viewMode === 'table' && (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  overflow: 'hidden',
                  boxShadow: '0 2px 16px rgba(0,0,0,.08)',
                  border: `3px solid ${C.yellow}`,
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
                        { l: 'Product', k: null },
                        { l: 'Price', k: 'price' },
                        { l: 'Stock', k: 'stock' },
                        { l: 'Status', k: null },
                        { l: 'Sales', k: 'sales' },
                        { l: 'Actions', k: null },
                      ].map(({ l, k }) => (
                        <th
                          key={l}
                          onClick={
                            k ? () => toggleSort(k as SortKey) : undefined
                          }
                          style={{
                            padding: '13px 20px',
                            textAlign: 'left',
                            fontSize: 11,
                            fontWeight: 800,
                            color: C.yellow,
                            textTransform: 'uppercase',
                            letterSpacing: '.07em',
                            whiteSpace: 'nowrap',
                            cursor: k ? 'pointer' : 'default',
                            userSelect: 'none',
                          }}
                        >
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            {l}
                            {k && (
                              <span
                                style={{
                                  opacity: sortKey === k ? 1 : 0.3,
                                  fontSize: 10,
                                }}
                              >
                                {sortKey === k ? (sortAsc ? '↑' : '↓') : '↕'}
                              </span>
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, idx) => (
                      <TableRow
                        key={p.id}
                        p={p}
                        idx={idx}
                        onEdit={() => setEdit(p)}
                        onDelete={() => setDel(p)}
                        onStock={(n) => updateStock(p.id, n)}
                      />
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: 34, marginBottom: 10 }}>🔍</div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: C.brownDark,
                        marginBottom: 5,
                      }}
                    >
                      No products found
                    </div>
                    <div style={{ fontSize: 13, color: '#BBA98A' }}>
                      Try adjusting your search or filters
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
