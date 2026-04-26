'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuth, ROLE_META, type UserRole } from '@/lib/auth';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import CreateAccountModal, {
  type CreatedAccountData,
} from '@/components/admin/CreateAccountModal';
import SuccessCredentialModal from '@/components/admin/SuccessCredentialModal';
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
  textPrimary: '#4a2511',
  textMuted: '#999',
  textGreen: '#3d7a1c',
};

const PAGE_BG =
  'linear-gradient(180deg,#87ceeb 0%,#98d8e8 18%,#c8eeaa 42%,#a8dc7a 68%,#7cb342 100%)';

const STATUS_META: Record<
  string,
  { label: string; bg: string; color: string; dot: string }
> = {
  pending: {
    label: 'Pending',
    bg: '#FFF0D9',
    color: '#CC7000',
    dot: '#FF8C00',
  },
  processing: {
    label: 'Processing',
    bg: '#E0F2FA',
    color: '#2E7BAD',
    dot: '#4A9ECA',
  },
  shipped: {
    label: 'Shipped',
    bg: '#F3E5FF',
    color: '#7B3FA0',
    dot: '#9C4DC4',
  },
  delivered: {
    label: 'Delivered',
    bg: '#E8F5E1',
    color: '#3D6E27',
    dot: '#5A9E3A',
  },
  cancelled: {
    label: 'Cancelled',
    bg: '#FFEBEE',
    color: '#C62828',
    dot: '#EF5350',
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
        padding: '4px 11px',
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

export default function OwnerDashboard() {
  const router = useRouter();

  const { user, ready, authFetch } = useAuthGuard(
    ['franchise_owner', 'franchisee'],
    {
      hq_admin: '/admin/dashboard',
      crew: '/crew/dashboard',
    },
  );

  const [loaded, setLoaded] = useState(false);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [createdAccount, setCreatedAccount] =
    useState<CreatedAccountData | null>(null);

  useEffect(() => {
    if (ready) setTimeout(() => setLoaded(true), 80);
  }, [ready]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/orders/my-orders');
      const data = (await res.json()) as { success: boolean; data: any[] };
      if (data.success) setAllOrders(data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    if (ready) void fetchOrders();
  }, [ready, fetchOrders]);

  if (!ready) return null;

  const role = user!.role as UserRole;
  const meta = ROLE_META[role];
  const isFO = role === 'franchise_owner';
  const firstName = user!.fullName?.split(' ')[0] ?? 'there';
  const branchLabel = user!.branchId ?? (isFO ? 'All Branches' : 'Your Branch');

  const totalOrders = allOrders.length;
  const pendingOrders = allOrders.filter((o) => o.status === 'pending').length;
  const shippedOrders = allOrders.filter((o) => o.status === 'shipped').length;
  const deliveredOrders = allOrders.filter(
    (o) => o.status === 'delivered',
  ).length;
  const cancelledOrders = allOrders.filter(
    (o) => o.status === 'cancelled',
  ).length;
  const totalDeliveredValue = allOrders
    .filter((o) => o.status === 'delivered')
    .reduce((s, o) => s + parseFloat(String(o.totalAmount ?? 0)), 0);
  const recentOrders = allOrders.slice(0, 5);

  const statCards = [
    { label: 'Total Orders', value: totalOrders, note: 'All time' },
    { label: 'Pending', value: pendingOrders, note: 'Awaiting HQ' },
    { label: 'Shipped', value: shippedOrders, note: 'On the way' },
    { label: 'Delivered', value: deliveredOrders, note: 'Completed' },
    { label: 'Cancelled', value: cancelledOrders, note: 'All time' },
    {
      label: 'Total Delivered Value',
      value: `₱${totalDeliveredValue.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      note: 'Excl. cancelled',
    },
  ];

  return (
    <>
      {isFO && (
        <CreateAccountModal
          isOpen={createModal}
          onClose={() => setCreateModal(false)}
          onSuccess={(d: CreatedAccountData) => {
            setCreatedAccount(d);
            setCreateModal(false);
            setTimeout(() => setSuccessModal(true), 320);
          }}
        />
      )}
      {isFO && (
        <SuccessCredentialModal
          isOpen={successModal}
          data={createdAccount}
          onClose={() => setSuccessModal(false)}
          onCreateAnother={() => {
            setSuccessModal(false);
            setTimeout(() => setCreateModal(true), 320);
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          height: '100vh',
          background: PAGE_BG,
          backgroundAttachment: 'fixed',
          overflow: 'hidden',
          fontFamily: "'Poppins', system-ui, sans-serif",
        }}
      >
        <OwnerSidebar
          activeNav="Dashboard"
          userName={user!.fullName}
          userRole={role}
          onCreateAccount={isFO ? () => setCreateModal(true) : undefined}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 19,
                    color: C.brownDark,
                    fontFamily: "'Fredoka', sans-serif",
                  }}
                >
                  {meta.label} Dashboard
                </div>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: meta.badgeBg,
                    color: meta.badgeColor,
                    fontSize: 10,
                    fontWeight: 800,
                    border: `1.5px solid ${meta.badgeColor}40`,
                    textTransform: 'uppercase',
                    letterSpacing: '.04em',
                  }}
                >
                  {meta.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: C.textGreen,
                  fontWeight: 600,
                  marginTop: 1,
                }}
              >
                {branchLabel} ·{' '}
                {new Date().toLocaleDateString('en-PH', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
            {/* Hero Banner */}
            <div
              style={{
                background: `linear-gradient(135deg,${C.darkGreen},${C.green})`,
                borderRadius: 18,
                padding: '24px 32px',
                marginBottom: 24,
                border: '2px solid rgba(255,255,255,.20)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(34,100,34,0.25)',
              }}
            >
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>
                  Good day, {firstName}!
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,.80)',
                    marginTop: 4,
                  }}
                >
                  {isFO
                    ? 'Manage your franchise operations and place orders from HQ below.'
                    : 'Place your ingredient orders and track their status from HQ below.'}
                </div>
              </div>
              <button
                onClick={() => router.push('/owner/orders')}
                style={{
                  padding: '12px 24px',
                  borderRadius: 13,
                  border: 'none',
                  background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
                  color: C.brownDarker,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Place Order
              </button>
            </div>

            {/* Stat Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6,1fr)',
                gap: 12,
                marginBottom: 24,
              }}
            >
              {statCards.map((card, i) => (
                <div
                  key={i}
                  style={{
                    background: C.card,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: 14,
                    padding: '18px 12px',
                    boxShadow: C.cardShadow,
                    border: `1.5px solid ${C.cardBorder}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 4,
                    opacity: loaded ? 1 : 0,
                    transform: loaded ? 'translateY(0)' : 'translateY(14px)',
                    transition: `opacity .4s ${i * 0.06}s, transform .4s ${i * 0.06}s`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      'translateY(-3px)';
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      '0 8px 24px rgba(0,80,40,0.16)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      C.cardShadow;
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.brownDark,
                      textTransform: 'uppercase',
                      letterSpacing: '.06em',
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{
                      fontSize: i === 5 ? 15 : 30,
                      fontWeight: 900,
                      color: C.brownDarker,
                      lineHeight: 1.1,
                      marginTop: 2,
                    }}
                  >
                    {loading ? '—' : card.value}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: C.textMuted,
                      fontWeight: 600,
                    }}
                  >
                    {card.note}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Orders Table */}
            <div
              style={{
                background: C.card,
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                borderRadius: 18,
                boxShadow: '0 4px 24px rgba(34,100,34,0.13)',
                overflow: 'hidden',
                border: `2px solid ${C.yellow}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 24px',
                  background:
                    'linear-gradient(90deg,rgba(255,225,53,0.22),rgba(255,140,0,0.14))',
                  borderBottom: '2px solid rgba(255,225,53,0.35)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 16,
                      color: C.brownDark,
                      fontFamily: "'Fredoka', sans-serif",
                    }}
                  >
                    Recent Orders
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: C.textGreen,
                      fontWeight: 600,
                      opacity: 0.9,
                      marginTop: 2,
                    }}
                  >
                    {totalOrders > 5
                      ? `Showing 5 of ${totalOrders} orders`
                      : 'Your latest ingredient orders from HQ'}
                  </div>
                </div>
                <button
                  onClick={() => router.push('/owner/orders')}
                  style={{
                    padding: '9px 20px',
                    background: `linear-gradient(135deg,${C.green},${C.darkGreen})`,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  View All Orders
                </button>
              </div>

              {loading ? (
                <div
                  style={{
                    padding: 48,
                    textAlign: 'center',
                    color: C.brownDark,
                    fontSize: 14,
                  }}
                >
                  Loading orders…
                </div>
              ) : recentOrders.length === 0 ? (
                <div style={{ padding: 56, textAlign: 'center' }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: C.brownDark,
                      marginBottom: 6,
                    }}
                  >
                    No orders yet
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: C.textMuted,
                      marginBottom: 18,
                    }}
                  >
                    Your ingredient orders from HQ will appear here
                  </div>
                  <button
                    onClick={() => router.push('/owner/orders')}
                    style={{
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
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr
                        style={{
                          background: `linear-gradient(90deg,${C.brownDarker},${C.brownDark})`,
                        }}
                      >
                        {[
                          'Order ID',
                          'Items',
                          'Total Amount',
                          'Status',
                          'Date',
                        ].map((col) => (
                          <th
                            key={col}
                            style={{
                              padding: '12px 20px',
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
                      {recentOrders.map((order, idx) => (
                        <tr
                          key={order.id}
                          style={{
                            borderBottom: '1.5px solid rgba(255,225,53,0.20)',
                            background:
                              idx % 2 === 0
                                ? 'rgba(255,255,255,0.55)'
                                : 'rgba(200,238,170,0.25)',
                            transition: 'background .15s',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              'rgba(255,225,53,0.12)')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              idx % 2 === 0
                                ? 'rgba(255,255,255,0.55)'
                                : 'rgba(200,238,170,0.25)')
                          }
                        >
                          <td
                            style={{
                              padding: '14px 20px',
                              fontWeight: 700,
                              fontSize: 12,
                              color: C.brownDarker,
                              fontFamily: 'monospace',
                            }}
                          >
                            #{order.id.slice(-8).toUpperCase()}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 4,
                                maxWidth: 220,
                              }}
                            >
                              {order.items
                                ?.slice(0, 2)
                                .map((item: any, i: number) => (
                                  <span
                                    key={i}
                                    style={{
                                      padding: '2px 8px',
                                      borderRadius: 20,
                                      background: 'rgba(200,238,170,0.6)',
                                      fontSize: 10,
                                      fontWeight: 600,
                                      color: C.brownDark,
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {item.name} ×{item.quantity}
                                  </span>
                                ))}
                              {(order.items?.length ?? 0) > 2 && (
                                <span
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: 20,
                                    background: 'rgba(200,238,170,0.6)',
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: C.textMuted,
                                  }}
                                >
                                  +{order.items.length - 2} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: '14px 20px',
                              fontWeight: 900,
                              fontSize: 14,
                              color: C.brownDarker,
                            }}
                          >
                            ₱{Number(order.totalAmount).toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <StatusBadge status={order.status} />
                          </td>
                          <td
                            style={{
                              padding: '14px 20px',
                              fontSize: 11,
                              color: C.textMuted,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {new Date(order.createdAt).toLocaleDateString(
                              'en-PH',
                              {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
