'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import CreateAccountModal, {
  type CreatedAccountData,
} from '@/components/admin/CreateAccountModal';
import SuccessCredentialModal from '@/components/admin/SuccessCredentialModal';
import { getStoredToken, getStoredUser, clearAuth } from '@/lib/auth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export const C = {
  brownDarker: '#3E1A00',
  brownDark: '#6B3A2A',
  brown: '#8B4513',
  yellow: '#F5C842',
  orange: '#FF8C00',
  green: '#5A9E3A',
  darkGreen: '#3D6E27',
  bg: '#F2EAD8',
};

const PAGE_BG =
  'linear-gradient(180deg,#87ceeb 0%,#98d8e8 18%,#c8eeaa 42%,#a8dc7a 68%,#7cb342 100%)';

interface BranchStat {
  branch: string;
  orders: number;
  sales: number;
}

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  activeUsers: number;
  branchStats: BranchStat[];
}

const EMPTY_STATS: DashboardStats = {
  totalSales: 0,
  totalOrders: 0,
  activeUsers: 0,
  branchStats: [],
};

export default function AdminDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdAccount, setCreatedAccount] =
    useState<CreatedAccountData | null>(null);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const u = getStoredUser();
    const t = getStoredToken();
    if (!u || !t) {
      router.replace('/login');
      return;
    }
    if (u.role !== 'hq_admin') {
      router.replace('/login');
      return;
    }
    setAdminName(u.fullName ?? 'Admin');
  }, [router]);

  const fetchStats = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3000/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        clearAuth();
        router.replace('/login');
        return;
      }
      const json = (await res.json()) as {
        success: boolean;
        data: DashboardStats;
        message?: string;
      };
      if (json.success) {
        setStats(json.data);
      } else {
        setError(json.message ?? 'Failed to load stats');
        setStats(EMPTY_STATS);
      }
    } catch {
      setError('Cannot reach backend. Make sure it is running on port 3000.');
      setStats(EMPTY_STATS);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const handleLogout = () => {
    clearAuth();
    router.replace('/login');
  };

  const handleAccountCreated = (data: CreatedAccountData) => {
    setCreatedAccount(data);
    setCreateModalOpen(false);
    setTimeout(() => setSuccessModalOpen(true), 320);
    void fetchStats();
  };

  const handleCreateAnother = () => {
    setSuccessModalOpen(false);
    setTimeout(() => setCreateModalOpen(true), 320);
  };

  const branchLabels =
    stats.branchStats.length > 0
      ? stats.branchStats.map((b) => b.branch)
      : ['No Data'];

  const branchOrderCounts =
    stats.branchStats.length > 0 ? stats.branchStats.map((b) => b.orders) : [0];

  const branchSalesAmounts =
    stats.branchStats.length > 0 ? stats.branchStats.map((b) => b.sales) : [0];

  const salesLineData = {
    labels: branchLabels,
    datasets: [
      {
        label: 'Sales (PHP)',
        data: branchSalesAmounts,
        borderColor: C.green,
        backgroundColor: 'rgba(90,158,58,0.12)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 5,
        pointBackgroundColor: C.green,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
      },
    ],
  };

  const branchBarData = {
    labels: branchLabels,
    datasets: [
      {
        label: 'Orders',
        data: branchOrderCounts,
        backgroundColor: C.orange,
        borderRadius: 6,
        barThickness: 36,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: C.brownDarker,
        titleColor: C.yellow,
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { color: C.brown, font: { size: 11, weight: 'bold' as const } },
      },
      x: {
        grid: { display: false },
        ticks: { color: C.brown, font: { size: 11, weight: 'bold' as const } },
      },
    },
  };

  const statCards = [
    {
      label: 'Total Sales',
      value: loading
        ? '...'
        : `P${stats.totalSales.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext:
        stats.totalSales === 0 && !loading
          ? 'No orders yet'
          : `From ${stats.totalOrders} order${stats.totalOrders !== 1 ? 's' : ''}`,
      grad: 'linear-gradient(135deg,#5A9E3A,#3D6E27)',
      badgeBg: '#E8F5E1',
      badgeColor: '#3D6E27',
      subtextColor: '#3D6E27',
      badge: loading
        ? '...'
        : `${stats.branchStats.length} branch${stats.branchStats.length !== 1 ? 'es' : ''}`,
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: 'Total Orders',
      value: loading ? '...' : stats.totalOrders.toLocaleString(),
      subtext:
        stats.totalOrders === 0 && !loading
          ? 'No orders placed yet'
          : 'Across all branches',
      grad: 'linear-gradient(135deg,#FF8C00,#CC7000)',
      badgeBg: '#FFF0D9',
      badgeColor: '#CC7000',
      subtextColor: '#CC7000',
      badge: loading
        ? '...'
        : stats.totalOrders === 0
          ? '0'
          : `+${stats.totalOrders}`,
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
    },
    {
      label: 'Active Users',
      value: loading ? '...' : stats.activeUsers.toLocaleString(),
      subtext: loading ? '' : 'Admin + crew accounts',
      grad: 'linear-gradient(135deg,#F5C842,#E0A800)',
      badgeBg: '#FFFAE0',
      badgeColor: '#6B3A2A',
      subtextColor: '#6B3A2A',
      badge: loading ? '...' : `${stats.activeUsers}`,
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6B3A2A"
          strokeWidth="2.5"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Top Branch Orders',
      value: loading
        ? '...'
        : stats.branchStats.length > 0
          ? stats.branchStats[0].orders.toLocaleString()
          : '0',
      subtext: loading
        ? ''
        : stats.branchStats.length > 0
          ? stats.branchStats[0].branch
          : 'No branch data yet',
      grad: 'linear-gradient(135deg,#4A9ECA,#2E7BAD)',
      badgeBg: '#E0F2FA',
      badgeColor: '#2E7BAD',
      subtextColor: '#2E7BAD',
      badge: stats.branchStats.length > 0 ? '#1' : '—',
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <CreateAccountModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleAccountCreated}
      />
      <SuccessCredentialModal
        isOpen={successModalOpen}
        data={createdAccount}
        onClose={() => setSuccessModalOpen(false)}
        onCreateAnother={handleCreateAnother}
      />

      <div
        style={{
          display: 'flex',
          height: '100vh',
          background: PAGE_BG,
          backgroundAttachment: 'fixed',
          overflow: 'hidden',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          activeNav="Dashboard"
          onNav={(route) => router.push(route)}
          adminName={adminName}
          onCreateAccount={() => setCreateModalOpen(true)}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                onClick={() => setSidebarOpen((v) => !v)}
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
                  Dashboard Overview
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
                    ? 'Loading data...'
                    : error
                      ? 'Backend connection issue'
                      : 'Live franchise analytics'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => void fetchStats()}
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
                Refresh
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
                  boxShadow: '0 2px 8px rgba(62,26,0,0.2)',
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

          {/* Body */}
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 28,
              background: 'transparent',
            }}
          >
            {/* Error banner */}
            {error && !loading && (
              <div
                style={{
                  marginBottom: 18,
                  padding: '12px 18px',
                  borderRadius: 12,
                  background: '#FFEBEE',
                  border: '1.5px solid #EF9A9A',
                  color: '#C62828',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{error}</span>
                <button
                  onClick={() => void fetchStats()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#C62828',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Stat cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4,1fr)',
                gap: 18,
                marginBottom: 24,
              }}
            >
              {statCards.map((card, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: 16,
                    padding: '22px 22px 18px',
                    boxShadow: '0 2px 14px rgba(34,100,34,0.10)',
                    border: '1.5px solid rgba(255,255,255,0.55)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    opacity: loading ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 24px rgba(34,100,34,0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 2px 14px rgba(34,100,34,0.10)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 13,
                        background: card.grad,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      }}
                    >
                      {card.icon}
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: card.badgeBg,
                        color: card.badgeColor,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.brownDark,
                      marginBottom: 4,
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: C.brownDarker,
                      letterSpacing: '-0.5px',
                      lineHeight: 1.1,
                    }}
                  >
                    {card.value}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: card.subtextColor,
                      fontWeight: 600,
                      marginTop: 5,
                    }}
                  >
                    {card.subtext}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 18,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.72)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: 16,
                  padding: '22px 22px 18px',
                  boxShadow: '0 2px 14px rgba(34,100,34,0.10)',
                  border: '1.5px solid rgba(255,255,255,0.55)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 16,
                        color: C.brownDark,
                      }}
                    >
                      Sales Performance
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: C.green,
                        fontWeight: 600,
                        marginTop: 2,
                      }}
                    >
                      {loading
                        ? 'Loading...'
                        : `Sales per branch · ${stats.branchStats.length} active`}
                    </div>
                  </div>
                </div>
                <div style={{ height: 250 }}>
                  <Line data={salesLineData} options={chartOptions} />
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.72)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: 16,
                  padding: '22px 22px 18px',
                  boxShadow: '0 2px 14px rgba(34,100,34,0.10)',
                  border: '1.5px solid rgba(255,255,255,0.55)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 16,
                        color: C.brownDark,
                      }}
                    >
                      Branch Performance
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: C.orange,
                        fontWeight: 600,
                        marginTop: 2,
                      }}
                    >
                      {loading ? 'Loading...' : 'Orders per branch'}
                    </div>
                  </div>
                </div>
                <div style={{ height: 250 }}>
                  <Bar data={branchBarData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Branch table */}
            <div
              style={{
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                borderRadius: 18,
                boxShadow: '0 4px 24px rgba(34,100,34,0.13)',
                overflow: 'hidden',
                border: `3px solid ${C.yellow}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 24px',
                  background: `linear-gradient(90deg,${C.yellow}28,${C.orange}18)`,
                  borderBottom: `2px solid ${C.yellow}`,
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 16,
                      color: C.brownDark,
                    }}
                  >
                    Branch Analytics
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: C.brownDark,
                      fontWeight: 600,
                      opacity: 0.7,
                      marginTop: 2,
                    }}
                  >
                    Live order and sales data across all franchise locations
                  </div>
                </div>
              </div>

              {loading && (
                <div
                  style={{
                    padding: 48,
                    textAlign: 'center',
                    color: '#AAA',
                    fontSize: 14,
                  }}
                >
                  Loading branch data...
                </div>
              )}

              {!loading && stats.branchStats.length === 0 && (
                <div style={{ padding: 60, textAlign: 'center' }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: C.brownDark,
                      marginBottom: 6,
                    }}
                  >
                    No branch data yet
                  </div>
                  <div style={{ fontSize: 12, color: '#AAA' }}>
                    Branch analytics will appear here once franchisees place
                    orders
                  </div>
                </div>
              )}

              {!loading && stats.branchStats.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr
                        style={{
                          background: `linear-gradient(90deg,${C.brownDarker},${C.brownDark})`,
                        }}
                      >
                        {['Branch Location', 'Total Sales', 'Total Orders'].map(
                          (col) => (
                            <th
                              key={col}
                              style={{
                                padding: '13px 22px',
                                textAlign: 'left',
                                fontSize: 11,
                                fontWeight: 800,
                                color: C.yellow,
                                textTransform: 'uppercase',
                                letterSpacing: '0.07em',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {col}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.branchStats.map((b, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: `1.5px solid ${C.yellow}30`,
                            background:
                              idx % 2 === 0
                                ? 'rgba(255,255,255,0.55)'
                                : 'rgba(200,238,170,0.25)',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = `${C.yellow}18`)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              idx % 2 === 0
                                ? 'rgba(255,255,255,0.55)'
                                : 'rgba(200,238,170,0.25)')
                          }
                        >
                          <td style={{ padding: '14px 22px' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                              }}
                            >
                              <div
                                style={{
                                  width: 38,
                                  height: 38,
                                  flexShrink: 0,
                                  background: `linear-gradient(135deg,${C.yellow},${C.orange})`,
                                  borderRadius: 10,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: 15,
                                  color: C.brownDarker,
                                  boxShadow: '0 2px 6px rgba(255,140,0,0.25)',
                                }}
                              >
                                {idx + 1}
                              </div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: 13.5,
                                  color: C.brownDark,
                                }}
                              >
                                {b.branch}
                              </div>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: '14px 22px',
                              fontWeight: 800,
                              fontSize: 14,
                              color: C.brownDarker,
                            }}
                          >
                            P
                            {b.sales.toLocaleString('en-PH', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td
                            style={{
                              padding: '14px 22px',
                              fontWeight: 700,
                              fontSize: 14,
                              color: C.brownDark,
                            }}
                          >
                            {b.orders.toLocaleString()}
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
