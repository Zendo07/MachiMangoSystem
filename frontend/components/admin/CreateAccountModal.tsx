'use client';

import { useState, useEffect, useCallback } from 'react';

const branches = [
  'Florida Blanca — Pampanga',
  'Porac — Pampanga',
  'Sta. Rita — Pampanga',
  'Angeles — Pampanga',
  'San Fernando — Pampanga',
];

export interface CreatedAccountData {
  fullName: string;
  username: string;
  password: string;
  role: 'Franchisor' | 'Crew';
  branch: string;
}

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: CreatedAccountData) => void;
}

type Role = 'Franchisor' | 'Crew';

export default function CreateAccountModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAccountModalProps) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('Franchisor');
  const [branch, setBranch] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      // slight delay so the overlay renders first
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const resetForm = useCallback(() => {
    setFullName('');
    setUsername('');
    setPassword('');
    setShowPassword(false);
    setRole('Franchisor');
    setBranch('');
    setErrors({});
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      resetForm();
      onClose();
    }, 260);
  }, [onClose, resetForm]);

  // ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, handleClose]);

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!fullName.trim()) newErrors.fullName = true;
    if (!username.trim()) newErrors.username = true;
    if (!password.trim()) newErrors.password = true;
    if (!branch) newErrors.branch = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    // Simulate API call — replace with your actual fetch to NestJS
    await new Promise((r) => setTimeout(r, 800));

    const data: CreatedAccountData = {
      fullName: fullName.trim(),
      username: username.trim(),
      password: password.trim(),
      role,
      branch,
    };

    setIsSubmitting(false);
    resetForm();
    onSuccess(data);
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
  };

  if (!isOpen) return null;

  const inputBase =
    'w-full px-4 py-3 rounded-xl border-2 font-body text-sm text-brownDarker bg-[#FDFAF4] outline-none transition-all placeholder:text-[#BBA98A]';
  const inputNormal =
    'border-[#E5D9C8] focus:border-primaryYellow focus:ring-2 focus:ring-primaryYellow/20';
  const inputError =
    'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20 bg-red-50';

  return (
    <>
      {/* ── OVERLAY ── */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: visible ? 'rgba(30,10,0,0.55)' : 'rgba(30,10,0,0)',
          backdropFilter: visible ? 'blur(3px)' : 'none',
          transition: 'background 0.25s ease, backdrop-filter 0.25s ease',
        }}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        {/* ── MODAL BOX ── */}
        <div
          className="w-full max-w-lg rounded-2xl bg-white overflow-hidden shadow-2xl"
          style={{
            transform: visible
              ? 'translateY(0) scale(1)'
              : 'translateY(24px) scale(0.96)',
            opacity: visible ? 1 : 0,
            transition:
              'transform 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease',
            boxShadow:
              '0 32px 80px rgba(62,26,0,0.28), 0 0 0 1.5px rgba(245,200,66,0.3)',
          }}
        >
          {/* ── HEADER ── */}
          <div className="bg-gradient-to-r from-brownDarker to-brownDark px-7 py-6 border-b-[3px] border-primaryYellow flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primaryYellow to-primaryOrange flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-heading font-bold text-xl text-primaryYellow tracking-tight leading-tight">
                Create Account
              </h2>
              <p className="text-xs text-primaryYellow/60 mt-0.5 font-body">
                Add a new user to the franchise system
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full border-2 border-primaryYellow/30 bg-primaryYellow/10 text-primaryYellow hover:bg-primaryYellow/20 hover:border-primaryYellow flex items-center justify-center transition-all flex-shrink-0 text-sm font-bold"
            >
              ✕
            </button>
          </div>

          {/* ── BODY ── */}
          <div className="px-7 py-6 flex flex-col gap-5">
            {/* Full Name + Username row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-brownDark flex items-center gap-1">
                  Full Name{' '}
                  <span className="text-primaryOrange text-sm">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearError('fullName');
                  }}
                  placeholder="e.g. Juan dela Cruz"
                  className={`${inputBase} ${errors.fullName ? inputError : inputNormal}`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-brownDark flex items-center gap-1">
                  Username / Email{' '}
                  <span className="text-primaryOrange text-sm">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    clearError('username');
                  }}
                  placeholder="e.g. juan@machi.com"
                  className={`${inputBase} ${errors.username ? inputError : inputNormal}`}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-brownDark flex items-center gap-1">
                Temporary Password{' '}
                <span className="text-primaryOrange text-sm">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError('password');
                  }}
                  placeholder="Set a temporary password"
                  className={`${inputBase} pr-12 ${errors.password ? inputError : inputNormal}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brownDark/40 hover:text-brownDark transition-colors p-1"
                >
                  {showPassword ? (
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
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#E5D9C8] to-transparent" />

            {/* Role selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-brownDark flex items-center gap-1">
                Assign Role{' '}
                <span className="text-primaryOrange text-sm">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['Franchisor', 'Crew'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      role === r
                        ? 'border-primaryOrange bg-orange-50 shadow-sm shadow-orange-200/50'
                        : 'border-[#E5D9C8] bg-[#FDFAF4] hover:border-primaryYellow hover:bg-yellow-50/50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${
                        r === 'Franchisor'
                          ? 'bg-gradient-to-br from-yellow-200 to-primaryOrange'
                          : 'bg-gradient-to-br from-primaryGreen to-darkGreen'
                      }`}
                    >
                      {r === 'Franchisor' ? '🏪' : '👷'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-brownDark leading-tight">
                        {r}
                      </div>
                      <div className="text-[10px] text-brownDark/55 mt-0.5">
                        {r === 'Franchisor'
                          ? 'Branch owner / manager'
                          : 'Branch staff member'}
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        role === r
                          ? 'border-primaryOrange bg-primaryOrange'
                          : 'border-[#C8B8A0]'
                      }`}
                    >
                      {role === r && (
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
            </div>

            {/* Branch */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-brownDark flex items-center gap-1">
                Assign Branch{' '}
                <span className="text-primaryOrange text-sm">*</span>
              </label>
              <div className="relative">
                <select
                  value={branch}
                  onChange={(e) => {
                    setBranch(e.target.value);
                    clearError('branch');
                  }}
                  className={`${inputBase} pr-10 appearance-none cursor-pointer ${errors.branch ? inputError : inputNormal}`}
                >
                  <option value="" disabled>
                    Select a branch…
                  </option>
                  {branches.map((b) => (
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
            </div>
          </div>
          {/* /body */}

          {/* ── FOOTER ── */}
          <div className="px-7 pb-7 flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl border-2 border-[#D0BFA8] text-brownDark font-bold text-sm font-body hover:border-brownDark hover:bg-[#F5EDE3] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primaryYellow to-primaryOrange text-brownDarker font-heading font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-200/50 hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
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
    </>
  );
}
