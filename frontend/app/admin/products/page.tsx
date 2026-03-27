'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredToken } from '@/lib/auth';
import { AdminSidebar } from '@/app/admin/dashboard/page';
import CreateAccountModal, {
  type CreatedAccountData,
} from '@/components/admin/CreateAccountModal';
import SuccessCredentialModal from '@/components/admin/SuccessCredentialModal';

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

const EMOJIS = [
  '🥭',
  '🥛',
  '🍪',
  '🫧',
  '🍫',
  '🥤',
  '🔵',
  '🛍️',
  '🍱',
  '🧃',
  '🫙',
  '🌟',
  '📦',
  '🍋',
  '🍰',
  '⚫',
];
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

// ─── ADD / EDIT MODAL ─────────────────────────────────────────────────────────
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
      image: '📦',
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
              {isNew ? 'Add New Ingredient' : 'Edit Ingredient'}
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'rgba(245,200,66,.6)',
                marginTop: 2,
              }}
            >
              Changes are saved to the database · visible to franchisees
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
                marginBottom: 8,
              }}
            >
              Icon
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
                    transform: form.image === e ? 'scale(1.12)' : 'scale(1)',
                    transition: 'all .15s',
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
              Name <span style={{ color: C.orange }}>*</span>
            </div>
            <input
              type="text"
              value={form.name ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Nata"
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
                onFocus={(e) => (e.currentTarget.style.borderColor = C.yellow)}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E5D9C8')}
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
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
              onChange={(e) =>
                setForm((f) => ({ ...f, stock: +e.target.value }))
              }
              placeholder="0"
              min="0"
              style={inp}
              onFocus={(e) => (e.target.style.borderColor = C.yellow)}
              onBlur={(e) => (e.target.style.borderColor = '#E5D9C8')}
            />
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
            {saving ? 'Saving…' : isNew ? '✓ Add Ingredient' : '✓ Save Changes'}
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
          Remove Ingredient?
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
          This will remove it from the database and the franchisee order
          catalog.
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
            onClick={async () => {
              setDeleting(true);
              await onConfirm();
              close();
            }}
            disabled={deleting}
            style={{
              flex: 1,
              padding: 11,
              borderRadius: 12,
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
              Out of Stock
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
          <span style={{ fontWeight: 900, fontSize: 19, color: C.brownDarker }}>
            ₱{Number(p.price).toLocaleString()}
          </span>
          <span style={{ fontSize: 11, color: '#888' }}>📈 {p.sales} sold</span>
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
            ✏️ Edit
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
                fontSize: 14,
                fontWeight: 700,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = C.orange)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = '#E5D9C8')
              }
            >
              +
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
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FFCDD2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#FFEBEE')}
          >
            🗑️
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
  const handleCreated = (d: CreatedAccountData) => {
    setAccount(d);
    setCreate(false);
    setTimeout(() => setSuccess(true), 320);
  };
  const handleAnother = () => {
    setSuccess(false);
    setTimeout(() => setCreate(true), 320);
  };

  // ─── API CALLS ─────────────────────────────────────────────────────────────
  const apiSaveProduct = async (data: Partial<Product>) => {
    const token = getStoredToken();
    const isNew = !data.id;
    const url = isNew
      ? 'http://localhost:3000/api/products'
      : `http://localhost:3000/api/products/${data.id}`;
    const res = await fetch(url, {
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
    });
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

  // ─── FILTER & SORT ─────────────────────────────────────────────────────────
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
        {/* ── SHARED SIDEBAR (correct 3-item nav) ── */}
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
                  {loading
                    ? 'Loading…'
                    : `${total} ingredients · visible to all franchisees for ordering`}
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
                }}
              >
                + Add Ingredient
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
                onClick={handleLogout}
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
            {/* Stat Cards */}
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
                  label: 'Total Ingredients',
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
                  label: 'Total Units Sold',
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
                    transition: 'all .2s',
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
                    {loading ? '—' : card.value.toLocaleString()}
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
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#BBA98A',
                    textTransform: 'uppercase',
                    marginRight: 2,
                  }}
                >
                  Sort:
                </span>
                {(['name', 'price', 'stock', 'sales'] as SortKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => toggleSort(k)}
                    style={{
                      padding: '6px 11px',
                      borderRadius: 8,
                      border: `1.5px solid ${sortKey === k ? C.yellow : '#E5D9C8'}`,
                      background: sortKey === k ? '#FFFAE0' : 'transparent',
                      color: sortKey === k ? C.brownDarker : C.brownDark,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {k.charAt(0).toUpperCase() + k.slice(1)}{' '}
                    {sortKey === k ? (sortAsc ? '↑' : '↓') : ''}
                  </button>
                ))}
              </div>
              <div
                style={{
                  display: 'flex',
                  borderRadius: 9,
                  overflow: 'hidden',
                  border: '1.5px solid #E5D9C8',
                  marginLeft: 'auto',
                }}
              >
                {(['grid', 'table'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setView(mode)}
                    style={{
                      padding: '7px 14px',
                      background:
                        viewMode === mode
                          ? `linear-gradient(135deg,${C.yellow},${C.orange})`
                          : 'transparent',
                      color: viewMode === mode ? C.brownDarker : C.brownDark,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                      border: 'none',
                    }}
                  >
                    {mode === 'grid' ? '⊞ Grid' : '☰ Table'}
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
              ingredients
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
                    padding: '6px 16px',
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
                Loading ingredients from database…
              </div>
            )}

            {/* Grid View */}
            {!loading && viewMode === 'grid' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
                  gap: 16,
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
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      '#D0BFA8';
                    (e.currentTarget as HTMLElement).style.background =
                      'transparent';
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
                    Add Ingredient
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: '#BBA98A',
                      textAlign: 'center',
                      lineHeight: 1.4,
                    }}
                  >
                    Saved to DB · visible to franchisees
                  </span>
                </div>
                {!loading && filtered.length === 0 && !fetchError && (
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
                  </div>
                )}
              </div>
            )}

            {/* Table View */}
            {!loading && viewMode === 'table' && (
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
                    {filtered.map((p, idx) => (
                      <tr
                        key={p.id}
                        style={{
                          borderBottom: `1.5px solid ${C.yellow}30`,
                          background: idx % 2 === 0 ? '#fff' : '#FDFAF4',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = `${C.yellow}12`)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            idx % 2 === 0 ? '#fff' : '#FDFAF4')
                        }
                      >
                        <td style={{ padding: '13px 20px' }}>
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
                                borderRadius: 11,
                                background:
                                  'linear-gradient(135deg,#F2EAD8,#EFE0C8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 20,
                              }}
                            >
                              {p.image}
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
                            padding: '13px 20px',
                            fontWeight: 900,
                            fontSize: 14,
                            color: C.brownDarker,
                          }}
                        >
                          ₱{Number(p.price).toLocaleString()}
                        </td>
                        <td
                          style={{
                            padding: '13px 20px',
                            fontWeight: 700,
                            fontSize: 13,
                            color:
                              p.stock === 0
                                ? '#C62828'
                                : p.stock <= 10
                                  ? '#CC7000'
                                  : C.darkGreen,
                          }}
                        >
                          {p.stock}
                        </td>
                        <td style={{ padding: '13px 20px' }}>
                          <StatusBadge status={p.status} />
                        </td>
                        <td
                          style={{
                            padding: '13px 20px',
                            fontSize: 13,
                            color: '#666',
                            fontWeight: 600,
                          }}
                        >
                          {p.sales}
                        </td>
                        <td style={{ padding: '13px 20px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => setEdit(p)}
                              style={{
                                padding: '6px 11px',
                                borderRadius: 8,
                                border: '1.5px solid #E5D9C8',
                                background: '#FDFAF4',
                                color: C.brownDark,
                                fontWeight: 700,
                                fontSize: 12,
                                cursor: 'pointer',
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => setDel(p)}
                              style={{
                                padding: '6px 9px',
                                borderRadius: 8,
                                border: '1.5px solid #FFCDD2',
                                background: '#FFEBEE',
                                color: '#C62828',
                                cursor: 'pointer',
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
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
