'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CreatedAccountData } from './CreateAccountModal';

interface Props {
  isOpen: boolean;
  data: CreatedAccountData | null;
  onClose: () => void;
  onCreateAnother: () => void;
}

type CopyState = 'idle' | 'copied';

const ROLE_LABEL: Record<string, string> = {
  franchise_owner: 'Franchise Owner',
  franchisee: 'Franchisee',
  crew: 'Crew Member',
};

const ROLE_BADGE: Record<string, string> = {
  franchise_owner: 'bg-gradient-to-r from-purple-400 to-purple-600 text-white',
  franchisee: 'bg-gradient-to-r from-blue-400 to-blue-600 text-white',
  crew: 'bg-gradient-to-r from-green-400 to-green-600 text-white',
};

const ROLE_PERMS: Record<string, string> = {
  franchise_owner: '🏪 Full branch access · Products, Orders & Analytics',
  franchisee: '🤝 Can place ingredient orders · View products',
  crew: '👷 View-only · Dashboard & Products',
};

export default function SuccessCredentialModal({
  isOpen,
  data,
  onClose,
  onCreateAnother,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [ring, setRing] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [emailCopy, setEmailCopy] = useState<CopyState>('idle');
  const [pwCopy, setPwCopy] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setVisible(true);
        timer.current = setTimeout(() => setRing(true), 60);
      });
    } else {
      setVisible(false);
      setRing(false);
      setShowPw(false);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [isOpen]);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 260);
  }, [onClose]);

  const another = useCallback(() => {
    setVisible(false);
    setTimeout(onCreateAnother, 260);
  }, [onCreateAnother]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) close();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, close]);

  const copy = useCallback(async (text: string, field: 'email' | 'pw') => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = document.createElement('textarea');
      t.value = text;
      t.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      document.body.removeChild(t);
    }
    const set = field === 'email' ? setEmailCopy : setPwCopy;
    set('copied');
    setTimeout(() => set('idle'), 2200);
  }, []);

  if (!isOpen || !data) return null;

  const r = 42;
  const circ = 2 * Math.PI * r;

  const CopyBtn = ({
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
            width="12"
            height="12"
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
            width="12"
            height="12"
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
        transition: 'all .25s',
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        className="w-full max-w-[480px] bg-white rounded-2xl overflow-hidden"
        style={{
          transform: visible
            ? 'translateY(0) scale(1)'
            : 'translateY(28px) scale(0.96)',
          opacity: visible ? 1 : 0,
          transition: 'transform .3s cubic-bezier(.4,0,.2,1), opacity .25s',
          boxShadow:
            '0 40px 100px rgba(62,26,0,.32), 0 0 0 1.5px rgba(245,200,66,.35)',
        }}
      >
        {/* Header */}
        <div
          className="px-7 py-6 border-b-[3px] border-primaryYellow flex items-center gap-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#3E1A00,#5A2800)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 20% 50%,rgba(245,200,66,.08),transparent 65%)',
            }}
          />
          <div className="relative flex-shrink-0 w-16 h-16">
            <svg className="w-16 h-16 absolute inset-0" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="rgba(255,255,255,.1)"
                strokeWidth="5"
              />
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="#F5C842"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={ring ? 0 : circ}
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                  transition:
                    'stroke-dashoffset .85s cubic-bezier(.4,0,.2,1) .1s',
                }}
              />
            </svg>
            <div
              className="absolute inset-0 m-2.5 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg,#5A9E3A,#3D6E27)',
                boxShadow: '0 4px 16px rgba(61,110,39,.4)',
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
                  strokeDashoffset={ring ? 0 : 30}
                  style={{ transition: 'stroke-dashoffset .42s ease .82s' }}
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
            onClick={close}
            className="w-8 h-8 rounded-full border-2 border-primaryYellow/30 bg-primaryYellow/10 text-primaryYellow hover:bg-primaryYellow/20 flex items-center justify-center text-sm font-bold relative z-10"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-5 flex flex-col gap-4">
          {/* User pill */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl border"
            style={{
              background:
                'linear-gradient(90deg,rgba(245,200,66,.12),rgba(255,140,0,.08))',
              borderColor: 'rgba(245,200,66,.3)',
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-heading font-bold text-lg text-primaryYellow border-2"
              style={{
                background: 'linear-gradient(135deg,#6B3A2A,#3E1A00)',
                borderColor: 'rgba(245,200,66,.35)',
              }}
            >
              {data.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-brownDarker truncate">
                {data.fullName}
              </div>
              <div className="text-xs text-brownDark/60 mt-0.5 truncate">
                {ROLE_LABEL[data.role]} · {data.branch}
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-heading font-bold flex-shrink-0 shadow-sm ${ROLE_BADGE[data.role]}`}
            >
              {ROLE_LABEL[data.role]}
            </span>
          </div>

          {/* Permissions preview */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FDFAF4] border border-[#E5D9C8]">
            <span className="text-sm">
              {ROLE_PERMS[data.role]?.split(' ')[0]}
            </span>
            <p className="text-[11px] font-semibold text-brownDark">
              {ROLE_PERMS[data.role]?.slice(2)}
            </p>
          </div>

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
            Login Credentials
          </div>

          {/* Email row */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-[#EAE0CC] bg-[#FDFAF4] hover:border-primaryYellow transition-colors">
            <div
              className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-[#2E7BAD]"
              style={{ background: 'linear-gradient(135deg,#E0F2FA,#B3DDF0)' }}
            >
              <svg
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-brownDark/55">
                Email (Login)
              </div>
              <div className="font-mono font-bold text-sm text-brownDarker mt-0.5 truncate">
                {data.email}
              </div>
            </div>
            <CopyBtn
              state={emailCopy}
              onCopy={() => copy(data.email, 'email')}
            />
          </div>

          {/* Password row */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-[#EAE0CC] bg-[#FDFAF4] hover:border-primaryYellow transition-colors">
            <div
              className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-[#7B3FA0]"
              style={{ background: 'linear-gradient(135deg,#F5E6FF,#E0C4FF)' }}
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
                {showPw ? (
                  <span className="font-mono font-bold text-sm text-brownDarker tracking-wider">
                    {data.tempPassword}
                  </span>
                ) : (
                  <span className="text-[#BBA98A] tracking-[.2em] text-base">
                    ••••••••
                  </span>
                )}
                <button
                  onClick={() => setShowPw((v) => !v)}
                  className="text-brownDark/40 hover:text-brownDark transition-colors flex-shrink-0"
                >
                  {showPw ? (
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
            <CopyBtn
              state={pwCopy}
              onCopy={() => copy(data.tempPassword, 'pw')}
            />
          </div>

          {/* Notice */}
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
              Share credentials securely. The user will be prompted to{' '}
              <strong className="text-brownDarker">
                change their password on first login.
              </strong>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 pb-7 flex items-center justify-between gap-3">
          <button
            onClick={another}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#D8C8B0] text-brownDark font-bold text-sm hover:border-brownDark hover:bg-[#F5EDE3] transition-all"
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
            onClick={close}
            className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-primaryYellow to-primaryOrange text-brownDarker font-heading font-bold text-sm shadow-lg hover:opacity-90 hover:-translate-y-px transition-all"
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
