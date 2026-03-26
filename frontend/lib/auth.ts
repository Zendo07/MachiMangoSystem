// frontend/lib/auth.ts
// Central auth utility — role routing, permissions, session helpers

export type UserRole = 'hq_admin' | 'franchise_owner' | 'franchisee' | 'crew';

export interface StoredUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  branchId?: string;
  isActive: boolean;
}

// ─── SESSION HELPERS ──────────────────────────────────────────────────────────
export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function clearAuth(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// ─── ROUTING ──────────────────────────────────────────────────────────────────
export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case 'hq_admin':
      return '/admin/dashboard';
    case 'franchise_owner':
      return '/owner/dashboard';
    case 'franchisee':
      return '/owner/dashboard';
    case 'crew':
      return '/crew/dashboard';
    default:
      return '/login';
  }
}

// ─── PERMISSIONS ──────────────────────────────────────────────────────────────
export const PERMISSIONS = {
  canManageAccounts: (role: UserRole) => role === 'hq_admin',
  canEditProducts: (role: UserRole) =>
    role === 'hq_admin' || role === 'franchise_owner',
  canViewAnalytics: (role: UserRole) => role !== 'crew',
  canManageBranches: (role: UserRole) => role === 'hq_admin',
  canViewProducts: (_role: UserRole) => true,
} as const;

// ─── ROLE METADATA ────────────────────────────────────────────────────────────
export const ROLE_META: Record<
  UserRole,
  {
    label: string;
    badgeBg: string;
    badgeColor: string;
    emoji: string;
  }
> = {
  hq_admin: {
    label: 'HQ Administrator',
    badgeBg: '#FFF0D9',
    badgeColor: '#CC7000',
    emoji: '👑',
  },
  franchise_owner: {
    label: 'Franchise Owner',
    badgeBg: '#FFF0D9',
    badgeColor: '#CC7000',
    emoji: '🏪',
  },
  franchisee: {
    label: 'Franchisee',
    badgeBg: '#E0F2FA',
    badgeColor: '#2E7BAD',
    emoji: '🤝',
  },
  crew: {
    label: 'Crew Member',
    badgeBg: '#E8F5E1',
    badgeColor: '#3D6E27',
    emoji: '👷',
  },
};
