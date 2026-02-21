'use client';

import { useEffect, useState } from 'react';
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

const colors = {
  brownDarker: '#3E1A00',
  brownDark: '#6B3A2A',
  brown: '#8B4513',
  yellow: '#F5C842',
  yellowLight: '#FFF8DC',
  orange: '#FF8C00',
  green: '#5A9E3A',
  darkGreen: '#3D6E27',
  skyBlue: '#4A9ECA',
  bg: '#FDF6EC',
};

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState('Admin');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [activeNav, setActiveNav] = useState('Dashboard');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setAdminName(user.fullName || 'Admin');
      }
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const salesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales',
        data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
        borderColor: colors.green,
        backgroundColor: 'rgba(90, 158, 58, 0.12)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 5,
        pointBackgroundColor: colors.green,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
      },
    ],
  };

  const branchPerformanceData = {
    labels: ['Fla. Blanca', 'Porac', 'Sta. Rita', 'Angeles', 'San Fernando'],
    datasets: [
      {
        label: 'Orders',
        data: [450, 380, 520, 290, 410],
        backgroundColor: colors.orange,
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
        backgroundColor: colors.brownDarker,
        titleColor: colors.yellow,
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
        grid: { color: 'rgba(0,0,0,0.06)', drawBorder: false },
        ticks: {
          color: colors.brown,
          font: { size: 11, weight: 'bold' as const },
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: colors.brown,
          font: { size: 11, weight: 'bold' as const },
        },
      },
    },
  };

  const branches = [
    {
      name: 'Florida Blanca',
      location: 'Pampanga',
      sales: '₱125,450',
      orders: 450,
      trend: '+12%',
      status: 'High',
    },
    {
      name: 'Porac',
      location: 'Pampanga',
      sales: '₱98,230',
      orders: 380,
      trend: '+8%',
      status: 'High',
    },
    {
      name: 'Sta. Rita',
      location: 'Pampanga',
      sales: '₱142,890',
      orders: 520,
      trend: '+15%',
      status: 'High',
    },
    {
      name: 'Angeles',
      location: 'Pampanga',
      sales: '₱76,120',
      orders: 290,
      trend: '-3%',
      status: 'Low',
    },
    {
      name: 'San Fernando',
      location: 'Pampanga',
      sales: '₱105,340',
      orders: 410,
      trend: '+9%',
      status: 'Average',
    },
  ];

  const navItems = [
    {
      name: 'Dashboard',
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
      name: 'Branches',
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      name: 'Analytics',
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      name: 'Reports',
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      name: 'Settings',
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6M17 12h6M1 12h6" />
        </svg>
      ),
    },
  ];

  const statCards = [
    {
      label: 'Total Sales',
      value: '₱0.00',
      subtext: 'Sample: ₱548,920',
      badge: '0%',
      bgGrad: 'linear-gradient(135deg, #5A9E3A, #3D6E27)',
      badgeBg: '#E8F5E1',
      badgeColor: '#3D6E27',
      subtextColor: '#3D6E27',
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
      value: '0',
      subtext: 'Sample: 2,050',
      badge: '0%',
      bgGrad: 'linear-gradient(135deg, #FF8C00, #CC7000)',
      badgeBg: '#FFF0D9',
      badgeColor: '#CC7000',
      subtextColor: '#CC7000',
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
      value: '1',
      subtext: 'Admin only',
      badge: '1',
      bgGrad: 'linear-gradient(135deg, #F5C842, #E0A800)',
      badgeBg: '#FFFAE0',
      badgeColor: '#6B3A2A',
      subtextColor: '#6B3A2A',
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
      label: 'Net Revenue',
      value: '₱0.00',
      subtext: 'Sample: ₱428,340',
      badge: '0%',
      bgGrad: 'linear-gradient(135deg, #4A9ECA, #2E7BAD)',
      badgeBg: '#E0F2FA',
      badgeColor: '#2E7BAD',
      subtextColor: '#2E7BAD',
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
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: colors.bg,
        overflow: 'hidden',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── SIDEBAR ── */}
      <aside
        style={{
          width: sidebarOpen ? 256 : 72,
          background: `linear-gradient(180deg, ${colors.brownDarker} 0%, ${colors.brownDark} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.28s cubic-bezier(.4,0,.2,1)',
          flexShrink: 0,
          boxShadow: '4px 0 24px rgba(62,26,0,0.18)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '24px 16px 20px',
            borderBottom: `1px solid rgba(245,200,66,0.2)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                flexShrink: 0,
                background: `linear-gradient(135deg, ${colors.yellow}, ${colors.orange})`,
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
            {sidebarOpen && (
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 17,
                    color: colors.yellow,
                    letterSpacing: '-0.3px',
                    lineHeight: 1.2,
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

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const active = activeNav === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveNav(item.name)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: sidebarOpen ? '11px 14px' : '11px 0',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  borderRadius: 12,
                  marginBottom: 4,
                  border: 'none',
                  cursor: 'pointer',
                  background: active
                    ? `linear-gradient(90deg, ${colors.yellow}, ${colors.orange})`
                    : 'transparent',
                  color: active ? colors.brownDarker : 'rgba(245,200,66,0.65)',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13.5,
                  boxShadow: active ? '0 4px 14px rgba(255,140,0,0.3)' : 'none',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    e.currentTarget.style.background = 'rgba(245,200,66,0.1)';
                  if (!active) e.currentTarget.style.color = colors.yellow;
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent';
                  if (!active)
                    e.currentTarget.style.color = 'rgba(245,200,66,0.65)';
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    color: active ? colors.brownDarker : 'inherit',
                  }}
                >
                  {item.icon}
                </span>
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div
          style={{
            padding: '14px 10px',
            borderTop: `1px solid rgba(245,200,66,0.2)`,
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
                background: `linear-gradient(135deg, ${colors.green}, ${colors.darkGreen})`,
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
            {sidebarOpen && (
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: colors.yellow,
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

      {/* ── MAIN ── */}
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
            borderBottom: `3px solid ${colors.yellow}`,
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
            {/* Hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                border: `2px solid transparent`,
                borderRadius: 10,
                padding: '7px 9px',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${colors.yellow}22`;
                e.currentTarget.style.borderColor = colors.yellow;
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
                    background: colors.brown,
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
                  color: colors.brownDark,
                  letterSpacing: '-0.4px',
                }}
              >
                Dashboard Overview
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: colors.green,
                  fontWeight: 600,
                  marginTop: 1,
                }}
              >
                Real-time franchise analytics · Pampanga Region
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Date select */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 10,
                background: `${colors.yellow}22`,
                border: `2px solid ${colors.yellow}`,
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.brown}
                strokeWidth="2.5"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  color: colors.brownDark,
                  cursor: 'pointer',
                }}
              >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>This Year</option>
              </select>
            </div>

            {/* Bell */}
            <button
              style={{
                position: 'relative',
                padding: '9px 10px',
                border: `2px solid transparent`,
                borderRadius: 10,
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${colors.yellow}22`;
                e.currentTarget.style.borderColor = colors.yellow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.brown}
                strokeWidth="2.5"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 8,
                  height: 8,
                  background: colors.orange,
                  borderRadius: '50%',
                  border: '2px solid #fff',
                }}
              />
            </button>

            {/* Sign out */}
            <button
              onClick={handleLogout}
              style={{
                padding: '9px 20px',
                background: `linear-gradient(135deg, ${colors.brownDark}, ${colors.brownDarker})`,
                color: colors.yellow,
                border: `2px solid rgba(245,200,66,0.4)`,
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(62,26,0,0.2)',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = colors.yellow)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = 'rgba(245,200,66,0.4)')
              }
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Scrollable body */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 28,
            background: '#F2EAD8',
          }}
        >
          {/* ── STAT CARDS ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 18,
              marginBottom: 24,
            }}
          >
            {statCards.map((card, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '22px 22px 18px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow =
                    '0 8px 24px rgba(0,0,0,0.11)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 2px 12px rgba(0,0,0,0.07)';
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
                      background: card.bgGrad,
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
                    color: colors.brownDark,
                    marginBottom: 4,
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: colors.brownDarker,
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

          {/* ── CHARTS ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 18,
              marginBottom: 24,
            }}
          >
            {/* Sales chart */}
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: '22px 22px 18px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
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
                      color: colors.brownDark,
                    }}
                  >
                    Sales Performance
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: colors.green,
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    7-day trend · Sample Data
                  </div>
                </div>
                <span
                  style={{
                    padding: '5px 12px',
                    background: '#E8F5E1',
                    color: colors.darkGreen,
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    border: `1.5px solid ${colors.green}`,
                  }}
                >
                  LIVE SAMPLE
                </span>
              </div>
              <div style={{ height: 250 }}>
                <Line data={salesData} options={chartOptions} />
              </div>
            </div>

            {/* Branch chart */}
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: '22px 22px 18px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
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
                      color: colors.brownDark,
                    }}
                  >
                    Branch Performance
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: colors.orange,
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    Pampanga branches · Sample Data
                  </div>
                </div>
                <span
                  style={{
                    padding: '5px 12px',
                    background: '#FFF0D9',
                    color: colors.orange,
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    border: `1.5px solid ${colors.orange}`,
                  }}
                >
                  TOP 5
                </span>
              </div>
              <div style={{ height: 250 }}>
                <Bar data={branchPerformanceData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* ── BRANCH TABLE ── */}
          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              boxShadow: '0 2px 16px rgba(0,0,0,0.09)',
              overflow: 'hidden',
              border: `3px solid ${colors.yellow}`,
            }}
          >
            {/* Table header bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                background: `linear-gradient(90deg, ${colors.yellow}28, ${colors.orange}18)`,
                borderBottom: `2px solid ${colors.yellow}`,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 16,
                    color: colors.brownDark,
                  }}
                >
                  Pampanga Branch Analytics
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: colors.brownDark,
                    fontWeight: 600,
                    opacity: 0.7,
                    marginTop: 2,
                  }}
                >
                  Performance metrics across all franchise locations (Sample
                  Data)
                </div>
              </div>
              <button
                style={{
                  padding: '9px 20px',
                  background: `linear-gradient(135deg, ${colors.green}, ${colors.darkGreen})`,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(61,110,39,0.3)',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Export Data
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr
                    style={{
                      background: `linear-gradient(90deg, ${colors.brownDarker}, ${colors.brownDark})`,
                    }}
                  >
                    {[
                      'Branch Location',
                      'Sales',
                      'Orders',
                      'Growth',
                      'Status',
                    ].map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: '13px 22px',
                          textAlign: 'left',
                          fontSize: 11,
                          fontWeight: 800,
                          color: colors.yellow,
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: `1.5px solid ${colors.yellow}30`,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = `${colors.yellow}12`)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = 'transparent')
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
                              background: `linear-gradient(135deg, ${colors.yellow}, ${colors.orange})`,
                              borderRadius: 10,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: 15,
                              color: colors.brownDarker,
                              boxShadow: '0 2px 6px rgba(255,140,0,0.25)',
                            }}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: 13.5,
                                color: colors.brownDark,
                              }}
                            >
                              {branch.name}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: colors.green,
                                fontWeight: 600,
                                marginTop: 1,
                              }}
                            >
                              {branch.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '14px 22px',
                          fontWeight: 800,
                          fontSize: 14,
                          color: colors.brownDarker,
                        }}
                      >
                        {branch.sales}
                      </td>
                      <td
                        style={{
                          padding: '14px 22px',
                          fontWeight: 700,
                          fontSize: 14,
                          color: colors.brownDark,
                        }}
                      >
                        {branch.orders}
                      </td>
                      <td style={{ padding: '14px 22px' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: 13.5,
                            color: branch.trend.startsWith('+')
                              ? colors.green
                              : '#D32F2F',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {branch.trend.startsWith('+') ? '↗' : '↘'}{' '}
                          {branch.trend}
                        </span>
                      </td>
                      <td style={{ padding: '14px 22px' }}>
                        <span
                          style={{
                            padding: '5px 13px',
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 800,
                            ...(branch.status === 'High'
                              ? {
                                  background: '#E8F5E1',
                                  color: colors.darkGreen,
                                  border: `1.5px solid ${colors.green}`,
                                }
                              : branch.status === 'Average'
                                ? {
                                    background: '#FFFAE0',
                                    color: colors.brownDark,
                                    border: `1.5px solid ${colors.yellow}`,
                                  }
                                : {
                                    background: '#FFEBEE',
                                    color: '#C62828',
                                    border: '1.5px solid #EF9A9A',
                                  }),
                          }}
                        >
                          {branch.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
