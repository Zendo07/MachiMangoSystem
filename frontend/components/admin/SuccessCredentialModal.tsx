'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CreatedAccountData } from './CreateAccountModal';

interface SuccessCredentialModalProps {
  isOpen: boolean;
  data: CreatedAccountData | null;
  onClose: () => void;
  onCreateAnother: () => void;
}

type CopyState = 'idle' | 'copied';

export default function SuccessCredentialModal({
  isOpen,
  data,
  onClose,
  onCreateAnother,
}: SuccessCredentialModalProps) {
  const [visible, setVisible] = useState(false);
  const [animateRing, setAnimateRing] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [usernameCopy, setUsernameCopy] = useState<CopyState>('idle');
  const [passwordCopy, setPasswordCopy] = useState<CopyState>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animate in
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setVisible(true);
        // Slight delay for ring animation
        timerRef.current = setTimeout(() => setAnimateRing(true), 60);
      });
    } else {
      setVisible(false);
      setAnimateRing(false);
      setPasswordVisible(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => onClose(), 260);
  }, [onClose]);

  const handleCreateAnother = useCallback(() => {
    setVisible(false);
    setTimeout(() => onCreateAnother(), 260);
  }, [onCreateAnother]);

  // ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, handleClose]);

  const copyToClipboard = useCallback(
    async (text: string, field: 'username' | 'password') => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      const setter = field === 'username' ? setUsernameCopy : setPasswordCopy;
      setter('copied');
      setTimeout(() => setter('idle'), 2200);
    },
    [],
  );

  if (!isOpen || !data) return null;

  // SVG circle params
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // ≈ 264

  const roleBadgeClass =
    data.role === 'Franchisor'
      ? 'bg-gradient-to-r from-primaryYellow to-primaryOrange text-brownDarker'
      : 'bg-gradient-to-r from-primaryGreen to-darkGreen text-white';

  const CopyButton = ({
    state,
    onCopy,
  }: {
    state: CopyState;
    onCopy: () => void;
  }) => (
    <button
      onClick={onCopy}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold flex-shrink-0 transition-all ${
        state === 'copied'
          ? 'border-primaryGreen bg-green-50 text-darkGreen'
          : 'border-[#DDD0BC] bg-white text-brownDark hover:border-primaryYellow hover:bg-yellow-50'
      }`}
    >
      {state === 'copied' ? (
        <>
          <svg
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            viewBox="0 0 24 24"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: visible ? 'rgba(30,10,0,0.55)' : 'rgba(30,10,0,0)',
        backdropFilter: visible ? 'blur(3px)' : 'none',
        transition: 'background 0.25s ease, backdrop-filter 0.25s ease',
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="w-full max-w-[480px] bg-white rounded-2xl overflow-hidden"
        style={{
          transform: visible
            ? 'translateY(0) scale(1)'
            : 'translateY(28px) scale(0.96)',
          opacity: visible ? 1 : 0,
          transition:
            'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease',
          boxShadow:
            '0 40px 100px rgba(62,26,0,0.32), 0 0 0 1.5px rgba(245,200,66,0.35)',
        }}
      >
        {/* ── HEADER ── */}
        <div
          className="px-7 py-6 border-b-[3px] border-primaryYellow flex items-center gap-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #3E1A00 0%, #5A2800 100%)',
          }}
        >
          {/* Subtle radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 20% 50%, rgba(245,200,66,0.08) 0%, transparent 65%)',
            }}
          />

          {/* Animated ring + check */}
          <div className="relative flex-shrink-0 w-16 h-16">
            <svg className="w-16 h-16 absolute inset-0" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="5"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#F5C842"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={animateRing ? 0 : circumference}
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                  transition:
                    'stroke-dashoffset 0.85s cubic-bezier(0.4,0,0.2,1) 0.1s',
                }}
              />
            </svg>
            <div
              className="absolute inset-0 m-2.5 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #5A9E3A, #3D6E27)',
                boxShadow: '0 4px 16px rgba(61,110,39,0.4)',
              }}
            >
              <svg
                width="28"
                height="28"
                fill="none"
                stroke="white"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline
                  points="20 6 9 17 4 12"
                  strokeDasharray="30"
                  strokeDashoffset={animateRing ? 0 : 30}
                  style={{ transition: 'stroke-dashoffset 0.42s ease 0.82s' }}
                />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0 relative z-10">
            <h2 className="font-heading font-bold text-xl text-primaryYellow leading-tight">
              Account Created!
            </h2>
            <p className="text-xs text-primaryYellow/60 mt-1 font-body">
              New user added to the franchise system
            </p>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full border-2 border-primaryYellow/30 bg-primaryYellow/10 text-primaryYellow hover:bg-primaryYellow/20 hover:border-primaryYellow flex items-center justify-center transition-all flex-shrink-0 text-sm font-bold relative z-10"
          >
            ✕
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="px-7 py-5 flex flex-col gap-4">
          {/* User summary pill */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl border"
            style={{
              background:
                'linear-gradient(90deg, rgba(245,200,66,0.12), rgba(255,140,0,0.08))',
              borderColor: 'rgba(245,200,66,0.3)',
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-heading font-bold text-lg text-primaryYellow border-2"
              style={{
                background: 'linear-gradient(135deg, #6B3A2A, #3E1A00)',
                borderColor: 'rgba(245,200,66,0.35)',
              }}
            >
              {data.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-brownDarker truncate">
                {data.fullName}
              </div>
              <div className="text-xs text-brownDark/60 mt-0.5 truncate">
                {data.role} · {data.branch.split('—')[0].trim()}
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-heading font-bold flex-shrink-0 shadow-sm ${roleBadgeClass}`}
            >
              {data.role}
            </span>
          </div>

          {/* Section label */}
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-brownDark/50">
            <svg
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Generated Credentials
          </div>

          {/* Username row */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-[#EAE0CC] bg-[#FDFAF4] hover:border-primaryYellow transition-colors">
            <div
              className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-[#2E7BAD]"
              style={{
                background: 'linear-gradient(135deg, #E0F2FA, #B3DDF0)',
              }}
            >
              <svg
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-brownDark/55">
                Username / Email
              </div>
              <div className="font-heading font-bold text-sm text-brownDarker mt-0.5 truncate">
                {data.username}
              </div>
            </div>
            <CopyButton
              state={usernameCopy}
              onCopy={() => copyToClipboard(data.username, 'username')}
            />
          </div>

          {/* Password row */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-[#EAE0CC] bg-[#FDFAF4] hover:border-primaryYellow transition-colors">
            <div
              className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-[#7B3FA0]"
              style={{
                background: 'linear-gradient(135deg, #F5E6FF, #E0C4FF)',
              }}
            >
              <svg
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-brownDark/55">
                Temporary Password
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {passwordVisible ? (
                  <span className="font-heading font-bold text-sm text-brownDarker">
                    {data.password}
                  </span>
                ) : (
                  <span className="text-[#BBA98A] tracking-[0.2em] text-base">
                    ••••••••
                  </span>
                )}
                <button
                  onClick={() => setPasswordVisible((v) => !v)}
                  className="text-brownDark/40 hover:text-brownDark transition-colors flex-shrink-0"
                >
                  {passwordVisible ? (
                    <svg
                      width="14"
                      height="14"
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
                      width="14"
                      height="14"
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
            <CopyButton
              state={passwordCopy}
              onCopy={() => copyToClipboard(data.password, 'password')}
            />
          </div>

          {/* Notice banner */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-primaryOrange/25 bg-orange-50/60">
            <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-primaryOrange bg-primaryOrange/15">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-xs text-brownDark leading-relaxed">
              The user will be prompted to{' '}
              <strong className="text-brownDarker">
                change their password on first login.
              </strong>{' '}
              Please share these credentials through a secure channel.
            </p>
          </div>
        </div>
        {/* /body */}

        {/* ── FOOTER ── */}
        <div className="px-7 pb-7 flex items-center justify-between gap-3">
          <button
            onClick={handleCreateAnother}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#D8C8B0] text-brownDark font-bold text-sm font-body hover:border-brownDark hover:bg-[#F5EDE3] transition-all"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Another
          </button>
          <button
            onClick={handleClose}
            className="flex items-center gap-2 px-7 py-2.5 rounded-xl border-none bg-gradient-to-r from-primaryYellow to-primaryOrange text-brownDarker font-heading font-bold text-sm shadow-lg shadow-orange-200/50 hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              viewBox="0 0 24 24"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
