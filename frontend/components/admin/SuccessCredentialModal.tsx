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

const C = {
  skyDeep: '#2E7BAD',
  skyMid: '#4A9ECA',
  skyLight: '#87CEEB',
  teal: '#3D8B6E',
  tealLight: '#E0F5EE',
  tealMid: '#A8D5C2',
  mint: '#C8EEAA',
  mintDark: '#7CB342',
  offWhite: '#F7FDFB',
  border: '#C4DDD5',
  textDark: '#0F2A22',
  textMid: '#3D6E58',
  textMuted: '#7BA898',
  yellow: '#F5C842',
  orange: '#FF8C00',
};

const ROLE_LABEL: Record<string, string> = {
  franchise_owner: 'Franchise Owner',
  franchisee: 'Franchisee',
  crew: 'Crew Member',
};

const ROLE_BADGE_STYLE: Record<string, React.CSSProperties> = {
  franchise_owner: {
    background: 'linear-gradient(135deg,#2E7BAD,#1A5A8A)',
    color: '#fff',
  },
  franchisee: {
    background: 'linear-gradient(135deg,#3D8B6E,#266050)',
    color: '#fff',
  },
  crew: {
    background: 'linear-gradient(135deg,#7CB342,#558B2F)',
    color: '#fff',
  },
};

const ROLE_PERMS: Record<string, string> = {
  franchise_owner: 'Full branch access — Products, Orders and Analytics',
  franchisee: 'Can place ingredient orders — View products',
  crew: 'View-only — Dashboard and Products',
};

const ROLE_ICON: Record<string, React.ReactNode> = {
  franchise_owner: (
    <svg
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  franchisee: (
    <svg
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  crew: (
    <svg
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 12px',
        borderRadius: 8,
        flexShrink: 0,
        border: `1.5px solid ${state === 'copied' ? C.teal : C.border}`,
        background: state === 'copied' ? C.tealLight : C.offWhite,
        color: state === 'copied' ? C.teal : C.textMid,
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all .15s',
      }}
    >
      {state === 'copied' ? (
        <>
          <svg
            width="11"
            height="11"
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
            width="11"
            height="11"
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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: visible ? 'rgba(14,40,60,.55)' : 'rgba(14,40,60,0)',
        backdropFilter: visible ? 'blur(5px)' : 'none',
        transition: 'all .25s',
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background:
            'linear-gradient(160deg, #EAF7F2 0%, #F7FDFB 55%, #EDF6FF 100%)',
          borderRadius: 22,
          overflow: 'hidden',
          border: `1.5px solid ${C.tealMid}`,
          boxShadow:
            '0 32px 90px rgba(14,80,60,.22), 0 0 0 4px rgba(168,213,194,.15)',
          transform: visible
            ? 'translateY(0) scale(1)'
            : 'translateY(28px) scale(0.96)',
          opacity: visible ? 1 : 0,
          transition: 'transform .3s cubic-bezier(.4,0,.2,1), opacity .25s',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '22px 26px 20px',
            background: `linear-gradient(135deg, ${C.skyDeep} 0%, ${C.teal} 100%)`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle radial glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'radial-gradient(ellipse at 20% 50%, rgba(135,206,235,.12), transparent 65%)',
            }}
          />

          {/* Animated ring + checkmark */}
          <div
            style={{
              position: 'relative',
              flexShrink: 0,
              width: 64,
              height: 64,
            }}
          >
            <svg
              style={{ position: 'absolute', inset: 0, width: 64, height: 64 }}
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="rgba(255,255,255,.15)"
                strokeWidth="5"
              />
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={C.skyLight}
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
              style={{
                position: 'absolute',
                inset: 10,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)',
                border: '1.5px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="26"
                height="26"
                fill="none"
                stroke="white"
                strokeWidth="3"
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

          <div
            style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 20,
                color: '#fff',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              Account Created!
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.6)',
                marginTop: 3,
                fontWeight: 500,
              }}
            >
              New user added to the franchise system
            </div>
          </div>

          <button
            onClick={close}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1.5px solid rgba(255,255,255,0.28)',
              background: 'rgba(255,255,255,0.12)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background .15s',
              position: 'relative',
              zIndex: 1,
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.24)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            }}
          >
            X
          </button>
        </div>

        {/* Accent stripe */}
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, ${C.skyLight}, ${C.mint}, ${C.mintDark})`,
          }}
        />

        {/* Body */}
        <div
          style={{
            padding: '20px 26px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {/* User pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              borderRadius: 14,
              border: `1px solid ${C.tealMid}`,
              background: `linear-gradient(90deg, rgba(74,158,202,0.08), rgba(61,139,110,0.08))`,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                flexShrink: 0,
                background: `linear-gradient(135deg, ${C.skyDeep}, ${C.teal})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 18,
                color: '#fff',
                border: `2px solid rgba(255,255,255,0.3)`,
              }}
            >
              {data.fullName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: C.textDark,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {data.fullName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: C.textMuted,
                  marginTop: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {ROLE_LABEL[data.role]} · {data.branch}
              </div>
            </div>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 700,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                ...ROLE_BADGE_STYLE[data.role],
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                {ROLE_ICON[data.role]}
              </span>
              {ROLE_LABEL[data.role]}
            </span>
          </div>

          {/* Permissions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 10,
              background: C.tealLight,
              border: `1px solid ${C.tealMid}`,
            }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke={C.teal}
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              style={{ flexShrink: 0 }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p style={{ fontSize: 11, color: C.teal, fontWeight: 600 }}>
              {ROLE_PERMS[data.role]}
            </p>
          </div>

          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg
              width="11"
              height="11"
              fill="none"
              stroke={C.textMuted}
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.09em',
                color: C.textMuted,
              }}
            >
              Login Credentials
            </span>
          </div>

          {/* Email row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              borderRadius: 12,
              border: `1.5px solid ${C.border}`,
              background: C.offWhite,
              transition: 'border-color .15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = C.skyMid;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = C.border;
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                flexShrink: 0,
                background: `linear-gradient(135deg, rgba(74,158,202,0.15), rgba(46,123,173,0.12))`,
                border: `1px solid rgba(74,158,202,0.25)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: C.skyDeep,
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
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                  color: C.textMuted,
                }}
              >
                Email (Login)
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: 13,
                  color: C.textDark,
                  marginTop: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {data.email}
              </div>
            </div>
            <CopyBtn
              state={emailCopy}
              onCopy={() => copy(data.email, 'email')}
            />
          </div>

          {/* Password row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              borderRadius: 12,
              border: `1.5px solid ${C.border}`,
              background: C.offWhite,
              transition: 'border-color .15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = C.skyMid;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = C.border;
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                flexShrink: 0,
                background: `linear-gradient(135deg, rgba(61,139,110,0.15), rgba(124,179,66,0.12))`,
                border: `1px solid rgba(61,139,110,0.25)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: C.teal,
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                  color: C.textMuted,
                }}
              >
                Temporary Password
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 3,
                }}
              >
                {showPw ? (
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: 13,
                      color: C.textDark,
                      letterSpacing: '.05em',
                    }}
                  >
                    {data.tempPassword}
                  </span>
                ) : (
                  <span
                    style={{
                      color: C.tealMid,
                      letterSpacing: '.2em',
                      fontSize: 15,
                    }}
                  >
                    ••••••••
                  </span>
                )}
                <button
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: C.textMuted,
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
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
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '11px 14px',
              borderRadius: 10,
              background: 'rgba(255,248,220,0.7)',
              border: `1px solid rgba(255,140,0,0.22)`,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                flexShrink: 0,
                background: 'rgba(255,140,0,0.12)',
                color: C.orange,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="13"
                height="13"
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
            <p style={{ fontSize: 11, color: C.textMid, lineHeight: 1.6 }}>
              Share credentials securely. The user will be prompted to{' '}
              <strong style={{ color: C.textDark }}>
                change their password on first login.
              </strong>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 26px 22px',
            borderTop: `1px solid ${C.border}`,
            background: 'rgba(240,250,246,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <button
            onClick={another}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 18px',
              borderRadius: 10,
              border: `1.5px solid ${C.border}`,
              background: 'transparent',
              color: C.teal,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all .15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.tealLight;
              e.currentTarget.style.borderColor = C.teal;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = C.border;
            }}
          >
            <svg
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              viewBox="0 0 24 24"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Another
          </button>
          <button
            onClick={close}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 26px',
              borderRadius: 10,
              border: 'none',
              background: `linear-gradient(135deg, ${C.skyDeep}, ${C.teal})`,
              color: '#fff',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(46,123,173,.3)',
              transition: 'all .15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <svg
              width="13"
              height="13"
              fill="none"
              stroke="white"
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
