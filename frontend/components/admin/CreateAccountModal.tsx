'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStoredToken } from '@/lib/auth';

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

const ROLES: {
  value: Role;
  label: string;
  sub: string;
  emoji: string;
  grad: string;
  color: string;
}[] = [
  {
    value: 'franchise_owner',
    label: 'Franchise Owner',
    sub: 'Full branch access + analytics',
    emoji: '🏪',
    grad: 'from-purple-400 to-purple-600',
    color: '#7B3FA0',
  },
  {
    value: 'franchisee',
    label: 'Franchisee',
    sub: 'Can place orders + view products',
    emoji: '🤝',
    grad: 'from-blue-300 to-blue-500',
    color: '#2E7BAD',
  },
  {
    value: 'crew',
    label: 'Crew Member',
    sub: 'View-only access',
    emoji: '👷',
    grad: 'from-green-300 to-green-600',
    color: '#3D6E27',
  },
];

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
    } else {
      setVisible(false);
    }
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
    // Branch is required for franchisee and crew, optional for franchise_owner
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
      const res = await fetch('http://localhost:3000/api/auth/create-account', {
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

  const base =
    'w-full px-4 py-3 rounded-xl border-2 text-sm text-brownDarker bg-[#FDFAF4] outline-none transition-all placeholder:text-[#BBA98A] font-body';
  const ok =
    'border-[#E5D9C8] focus:border-primaryYellow focus:ring-2 focus:ring-primaryYellow/20';
  const errCls =
    'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-400/20';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: visible ? 'rgba(30,10,0,0.55)' : 'rgba(30,10,0,0)',
        backdropFilter: visible ? 'blur(3px)' : 'none',
        transition: 'all .25s',
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white overflow-hidden"
        style={{
          transform: visible
            ? 'translateY(0) scale(1)'
            : 'translateY(24px) scale(0.96)',
          opacity: visible ? 1 : 0,
          transition: 'transform .28s cubic-bezier(.4,0,.2,1), opacity .25s',
          boxShadow:
            '0 32px 80px rgba(62,26,0,.28), 0 0 0 1.5px rgba(245,200,66,.3)',
        }}
      >
        {/* ── HEADER ── */}
        <div className="bg-gradient-to-r from-brownDarker to-brownDark px-7 py-5 border-b-[3px] border-primaryYellow flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primaryYellow to-primaryOrange flex items-center justify-center text-xl shadow-lg flex-shrink-0">
            👤
          </div>
          <div className="flex-1">
            <h2 className="font-heading font-bold text-xl text-primaryYellow leading-tight">
              Create Account
            </h2>
            <p className="text-xs text-primaryYellow/60 mt-0.5 font-body">
              Add a Franchise Owner, Franchisee, or Crew member
            </p>
          </div>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full border-2 border-primaryYellow/30 bg-primaryYellow/10 text-primaryYellow hover:bg-primaryYellow/20 flex items-center justify-center text-sm font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="px-7 py-5 flex flex-col gap-4 max-h-[72vh] overflow-y-auto">
          {/* Server error */}
          {serverErr && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-300">
              <svg
                width="15"
                height="15"
                fill="none"
                stroke="#C62828"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                className="flex-shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-xs font-semibold text-red-700">{serverErr}</p>
            </div>
          )}

          {/* Name + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-brownDark flex items-center gap-1">
                Full Name <span className="text-primaryOrange">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clr('fullName');
                }}
                placeholder="e.g. Juan Dela Cruz"
                className={`${base} ${errors.fullName ? errCls : ok}`}
              />
              {errors.fullName && (
                <p className="text-[10px] text-red-600 font-semibold">
                  {errors.fullName}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-brownDark flex items-center gap-1">
                Email <span className="text-primaryOrange">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clr('email');
                }}
                placeholder="juan@example.com"
                className={`${base} ${errors.email ? errCls : ok}`}
              />
              {errors.email && (
                <p className="text-[10px] text-red-600 font-semibold">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-brownDark flex items-center justify-between">
              <span className="flex items-center gap-1">
                Temp Password <span className="text-primaryOrange">*</span>
              </span>
              <button
                type="button"
                onClick={() => setPassword(genPassword())}
                className="text-[10px] font-bold text-primaryOrange hover:text-brownDark transition-colors underline underline-offset-2"
              >
                ↺ Regenerate
              </button>
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clr('password');
                }}
                className={`${base} pr-12 font-mono tracking-wider ${errors.password ? errCls : ok}`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brownDark/40 hover:text-brownDark transition-colors p-1"
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
            {errors.password && (
              <p className="text-[10px] text-red-600 font-semibold">
                {errors.password}
              </p>
            )}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[#E5D9C8] to-transparent" />

          {/* Role — all 3 roles */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-brownDark">
              Role <span className="text-primaryOrange">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => {
                    setRole(r.value);
                    // Clear branch error when switching to franchise_owner
                    if (r.value === 'franchise_owner') {
                      setErrors((prev) => ({ ...prev, branch: '' }));
                    }
                  }}
                  className={`flex flex-col items-center gap-2 px-3 py-4 rounded-xl border-2 text-center transition-all ${
                    role === r.value
                      ? 'border-primaryOrange bg-orange-50 shadow-sm'
                      : 'border-[#E5D9C8] bg-[#FDFAF4] hover:border-primaryYellow hover:bg-yellow-50/40'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${r.grad} flex items-center justify-center text-2xl shadow-sm`}
                  >
                    {r.emoji}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-brownDark leading-tight">
                      {r.label}
                    </div>
                    <div className="text-[9px] text-brownDark/55 mt-0.5 leading-tight">
                      {r.sub}
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      role === r.value
                        ? 'border-primaryOrange bg-primaryOrange'
                        : 'border-[#C8B8A0]'
                    }`}
                  >
                    {role === r.value && (
                      <svg
                        width="8"
                        height="8"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Permission summary for selected role */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FDFAF4] border border-[#E5D9C8]">
              <span className="text-base flex-shrink-0">
                {ROLES.find((r) => r.value === role)?.emoji}
              </span>
              <div>
                <p className="text-[10px] font-bold text-brownDark">
                  {role === 'franchise_owner' &&
                    'Full access: Dashboard, Products (edit), Orders, Analytics'}
                  {role === 'franchisee' &&
                    'Can place ingredient orders and view products'}
                  {role === 'crew' && 'View-only: Dashboard and Products only'}
                </p>
              </div>
            </div>
          </div>

          {/* Branch — required for franchisee/crew, optional for franchise_owner */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-brownDark flex items-center gap-1">
              Assign Branch{' '}
              {role === 'franchise_owner' ? (
                <span className="text-brownDark/40 font-normal normal-case tracking-normal">
                  (optional)
                </span>
              ) : (
                <span className="text-primaryOrange">*</span>
              )}
            </label>
            <div className="relative">
              <select
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                  clr('branch');
                }}
                className={`${base} pr-10 appearance-none cursor-pointer ${errors.branch ? errCls : ok}`}
              >
                <option value="">
                  {role === 'franchise_owner'
                    ? 'All branches (no restriction)…'
                    : 'Select a branch…'}
                </option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brownDark/50"
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
            {errors.branch && (
              <p className="text-[10px] text-red-600 font-semibold">
                {errors.branch}
              </p>
            )}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="px-7 pb-6 pt-3 flex items-center justify-end gap-3 border-t border-[#F0E8D8]">
          <button
            onClick={close}
            className="px-5 py-2.5 rounded-xl border-2 border-[#D0BFA8] text-brownDark font-bold text-sm hover:border-brownDark hover:bg-[#F5EDE3] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primaryYellow to-primaryOrange text-brownDarker font-heading font-bold text-sm flex items-center gap-2 shadow-lg hover:opacity-90 hover:-translate-y-px transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Creating…
              </>
            ) : (
              <>
                <svg
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                  <line x1="18" y1="8" x2="23" y2="8" />
                  <line x1="20.5" y1="5.5" x2="20.5" y2="10.5" />
                </svg>
                Create Account
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
