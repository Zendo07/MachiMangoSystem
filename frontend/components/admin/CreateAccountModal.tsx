'use client';

import { API_BASE } from '@/lib/config';
import { useState, useEffect, useCallback } from 'react';
import { getStoredToken } from '@/lib/auth';

// ── Same tokens as OwnerDashboard ──────────────────────────────────────────
const C = {
  brownDarker: '#4a2511',
  brownDark: '#654321',
  yellow: '#ffe135',
  orange: '#ff8c00',
  green: '#7cb342',
  darkGreen: '#228b22',
  // Card surface — frosted white, matching dashboard stat cards on the gradient bg
  card: 'rgba(255,255,255,0.92)',
  cardBorder: 'rgba(255,255,255,0.70)',
  // Inputs — clean white
  inputBg: '#ffffff',
  inputBorder: '#d1d5db',
  // Text
  textDark: '#1e293b',
  textMid: '#475569',
  textMuted: '#94a3b8',
};

const BRANCHES = [
  'Florida Blanca — Pampanga',
  'Porac — Pampanga',
  'Sta. Rita — Pampanga',
  'Angeles — Pampanga',
  'San Fernando — Pampanga',
];

export interface CreatedAccountData {
  fullName: string;
  email: string;
  tempPassword: string;
  role: 'franchise_owner' | 'franchisee' | 'crew';
  branch: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: CreatedAccountData) => void;
}

type Role = 'franchise_owner' | 'franchisee' | 'crew';

const ROLES: { value: Role; label: string; sub: string }[] = [
  {
    value: 'franchise_owner',
    label: 'Franchise Owner',
    sub: 'Full access + analytics',
  },
  {
    value: 'franchisee',
    label: 'Franchisee',
    sub: 'Place orders, view products',
  },
  { value: 'crew', label: 'Crew Member', sub: 'View-only access' },
];

const PERM: Record<Role, string> = {
  franchise_owner: 'Full access: Dashboard, Products, Orders, Analytics',
  franchisee: 'Can place ingredient orders and view products',
  crew: 'View-only: Dashboard and Products only',
};

function genPassword(): string {
  const u = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const l = 'abcdefghjkmnpqrstuvwxyz';
  const d = '23456789';
  const s = '!@#$';
  const all = u + l + d + s;
  let p =
    u[Math.floor(Math.random() * u.length)] +
    l[Math.floor(Math.random() * l.length)] +
    d[Math.floor(Math.random() * d.length)] +
    s[Math.floor(Math.random() * s.length)];
  for (let i = 0; i < 6; i++) p += all[Math.floor(Math.random() * all.length)];
  return p
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

const fieldBase: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: `1.5px solid ${C.inputBorder}`,
  background: C.inputBg,
  fontSize: 13,
  color: C.textDark,
  fontFamily: "'Poppins', sans-serif",
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
};
const fieldErr: React.CSSProperties = {
  ...fieldBase,
  border: '1.5px solid #EF5350',
  background: '#FFF5F5',
};
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '.07em',
  color: C.textMid,
  marginBottom: 6,
  fontFamily: "'Poppins', sans-serif",
};
const errStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#C62828',
  fontWeight: 600,
  marginTop: 4,
  fontFamily: "'Poppins', sans-serif",
};

function onFocus(
  e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  hasErr: boolean,
) {
  if (!hasErr) {
    e.currentTarget.style.borderColor = C.green;
    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(124,179,66,0.15)`;
  }
}
function onBlur(
  e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  hasErr: boolean,
) {
  e.currentTarget.style.borderColor = hasErr ? '#EF5350' : C.inputBorder;
  e.currentTarget.style.boxShadow = 'none';
}

export default function CreateAccountModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<Role>('franchise_owner');
  const [branch, setBranch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErr, setServerErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword(genPassword());
      requestAnimationFrame(() => setVisible(true));
    } else setVisible(false);
  }, [isOpen]);

  const reset = useCallback(() => {
    setFullName('');
    setEmail('');
    setPassword(genPassword());
    setShowPw(false);
    setRole('franchise_owner');
    setBranch('');
    setErrors({});
    setServerErr('');
    setSubmitting(false);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      reset();
      onClose();
    }, 260);
  }, [onClose, reset]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) close();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, close]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = 'Valid email required';
    if (password.length < 8) e.password = 'Min 8 characters';
    if (role !== 'franchise_owner' && !branch) e.branch = 'Select a branch';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setServerErr('');
    try {
      const token = getStoredToken();
      const res = await fetch(`${API_BASE}/auth/create-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          role,
          branch: branch || undefined,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string | string[];
        error?: string;
      };
      if (res.ok && data.success) {
        onSuccess({
          fullName: fullName.trim(),
          email: email.trim(),
          tempPassword: password,
          role,
          branch: branch || 'HQ / All Branches',
        });
        reset();
      } else {
        const msg = Array.isArray(data.message)
          ? data.message.join(', ')
          : (data.message ?? data.error ?? 'Failed to create account');
        setServerErr(msg);
      }
    } catch {
      setServerErr(
        'Cannot connect to server. Is the backend running on port 3000?',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const clr = (f: string) => {
    if (errors[f]) setErrors((p) => ({ ...p, [f]: '' }));
    setServerErr('');
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && close()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: visible ? 'rgba(0,30,10,0.45)' : 'rgba(0,30,10,0)',
        backdropFilter: visible ? 'blur(4px)' : 'none',
        transition: 'all .25s',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          borderRadius: 20,
          overflow: 'hidden',
          // Frosted white card — same as dashboard stat cards sitting on the gradient
          background:
            'linear-gradient(160deg,#f0f9e8 0%,#fdfaf4 60%,#f5f0e8 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `2px solid rgba(124,179,66,0.55)`,
          boxShadow:
            '0 20px 60px rgba(0,60,20,0.22), 0 4px 24px rgba(0,0,0,0.10), 0 0 0 5px rgba(124,179,66,0.10)',
          transform: visible
            ? 'translateY(0) scale(1)'
            : 'translateY(22px) scale(0.96)',
          opacity: visible ? 1 : 0,
          transition: 'transform .28s cubic-bezier(.4,0,.2,1), opacity .25s',
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {/* ── HEADER — yellow bottom border like the dashboard header ── */}
        <div
          style={{
            background: 'linear-gradient(135deg,#e8f5d0,#f5f0e0)',
            borderBottom: `3px solid ${C.yellow}`,
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontWeight: 700,
                fontSize: 20,
                color: C.brownDark,
              }}
            >
              Create Account
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
              Add a Franchise Owner, Franchisee, or Crew member
            </div>
          </div>
          <button
            onClick={close}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: `1.5px solid #e2e8f0`,
              background: 'rgba(255,255,255,0.80)',
              color: C.textMid,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* ── BODY ── */}
        <div
          style={{
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            maxHeight: '68vh',
            overflowY: 'auto',
            background: 'transparent',
          }}
        >
          {/* Server error */}
          {serverErr && (
            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                padding: '10px 14px',
                borderRadius: 10,
                background: '#FFF5F5',
                border: '1px solid #EF9A9A',
              }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="#C62828"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                style={{ flexShrink: 0, marginTop: 1 }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p style={{ fontSize: 12, color: '#C62828', fontWeight: 600 }}>
                {serverErr}
              </p>
            </div>
          )}

          {/* Name + Email */}
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}
          >
            <div>
              <label style={labelStyle}>
                Full Name <span style={{ color: C.orange }}>*</span>
              </label>
              <input
                type="text"
                value={fullName}
                placeholder="e.g. Juan Dela Cruz"
                style={errors.fullName ? fieldErr : fieldBase}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clr('fullName');
                }}
                onFocus={(e) => onFocus(e, !!errors.fullName)}
                onBlur={(e) => onBlur(e, !!errors.fullName)}
              />
              {errors.fullName && <p style={errStyle}>{errors.fullName}</p>}
            </div>
            <div>
              <label style={labelStyle}>
                Email <span style={{ color: C.orange }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                placeholder="juan@example.com"
                style={errors.email ? fieldErr : fieldBase}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clr('email');
                }}
                onFocus={(e) => onFocus(e, !!errors.email)}
                onBlur={(e) => onBlur(e, !!errors.email)}
              />
              {errors.email && <p style={errStyle}>{errors.email}</p>}
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                ...labelStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>
                Temp Password <span style={{ color: C.orange }}>*</span>
              </span>
              <button
                type="button"
                onClick={() => setPassword(genPassword())}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.darkGreen,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: "'Poppins', sans-serif",
                  textTransform: 'none',
                  letterSpacing: 0,
                }}
              >
                Regenerate
              </button>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                style={{
                  ...(errors.password ? fieldErr : fieldBase),
                  paddingRight: 44,
                  fontFamily: 'monospace',
                  letterSpacing: '.08em',
                }}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clr('password');
                }}
                onFocus={(e) => onFocus(e, !!errors.password)}
                onBlur={(e) => onBlur(e, !!errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: C.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPw ? (
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p style={errStyle}>{errors.password}</p>}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />

          {/* Role */}
          <div>
            <label style={labelStyle}>
              Role <span style={{ color: C.orange }}>*</span>
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: 10,
              }}
            >
              {ROLES.map((r) => {
                const active = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => {
                      setRole(r.value);
                      if (r.value === 'franchise_owner')
                        setErrors((p) => ({ ...p, branch: '' }));
                    }}
                    style={{
                      padding: '14px 10px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      border: active
                        ? `2px solid ${C.orange}`
                        : `1.5px solid rgba(0,0,0,0.10)`,
                      background: active
                        ? `rgba(255,225,53,0.16)`
                        : 'rgba(255,255,255,0.70)',
                      transition: 'all .15s',
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        flexShrink: 0,
                        border: active
                          ? `5px solid ${C.orange}`
                          : `2px solid #d1d5db`,
                        background: '#fff',
                        transition: 'all .15s',
                      }}
                    />
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 12,
                        color: C.brownDark,
                        lineHeight: 1.3,
                      }}
                    >
                      {r.label}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: C.textMuted,
                        lineHeight: 1.4,
                      }}
                    >
                      {r.sub}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Permission note */}
            <div
              style={{
                marginTop: 10,
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(124,179,66,0.10)',
                border: `1px solid rgba(124,179,66,0.25)`,
              }}
            >
              <p style={{ fontSize: 11, color: C.darkGreen, fontWeight: 600 }}>
                {PERM[role]}
              </p>
            </div>
          </div>

          {/* Branch */}
          <div>
            <label style={labelStyle}>
              Assign Branch{' '}
              {role === 'franchise_owner' ? (
                <span
                  style={{
                    color: C.textMuted,
                    fontWeight: 500,
                    textTransform: 'none',
                    letterSpacing: 0,
                    fontSize: 10,
                  }}
                >
                  (optional)
                </span>
              ) : (
                <span style={{ color: C.orange }}>*</span>
              )}
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={branch}
                style={{
                  ...(errors.branch ? fieldErr : fieldBase),
                  paddingRight: 36,
                  appearance: 'none',
                  cursor: 'pointer',
                }}
                onChange={(e) => {
                  setBranch(e.target.value);
                  clr('branch');
                }}
                onFocus={(e) => onFocus(e, !!errors.branch)}
                onBlur={(e) => onBlur(e, !!errors.branch)}
              >
                <option value="">
                  {role === 'franchise_owner'
                    ? 'Pampanga branches'
                    : 'Select a branch…'}
                </option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <svg
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: C.textMuted,
                }}
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {errors.branch && <p style={errStyle}>{errors.branch}</p>}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div
          style={{
            padding: '14px 24px 20px',
            borderTop: '1px solid rgba(0,0,0,0.07)',
            background: 'rgba(255,255,255,0.80)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <button
            onClick={close}
            style={{
              padding: '9px 20px',
              borderRadius: 10,
              border: '1.5px solid #d1d5db',
              background: 'transparent',
              color: C.textMid,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Cancel
          </button>
          {/* CTA — yellow→orange gradient matching the dashboard Place Order button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '9px 26px',
              borderRadius: 10,
              border: 'none',
              background: submitting
                ? '#ccc'
                : `linear-gradient(135deg,${C.yellow},${C.orange})`,
              color: C.brownDarker,
              fontWeight: 800,
              fontSize: 14,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: "'Fredoka', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: submitting ? 'none' : '0 2px 8px rgba(255,140,0,0.28)',
              transition: 'opacity .15s',
            }}
          >
            {submitting ? (
              <>
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  style={{ animation: 'spin 1s linear infinite' }}
                >
                  <circle
                    style={{ opacity: 0.25 }}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    style={{ opacity: 0.75 }}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Creating…
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
