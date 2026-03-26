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
  // Only HQ admin can manage global accounts
  canManageAccounts: (role: UserRole) => role === 'hq_admin',

  // HQ admin + franchise owner can edit products/stock
  canEditProducts: (role: UserRole) =>
    role === 'hq_admin' || role === 'franchise_owner',

  // Everyone except crew can view analytics
  canViewAnalytics: (role: UserRole) => role !== 'crew',

  // Only HQ admin can manage branches globally
  canManageBranches: (role: UserRole) => role === 'hq_admin',

  // Everyone can view products
  canViewProducts: (_role: UserRole) => true,

  // Franchise owner + franchisee + crew can place orders (franchisee & crew via their own portal)
  canPlaceOrders: (role: UserRole) =>
    role === 'franchise_owner' || role === 'franchisee' || role === 'crew',

  // Franchise owner has full access to their branch (same as admin but scoped)
  isFranchiseOwner: (role: UserRole) => role === 'franchise_owner',

  // Crew is view-only
  isViewOnly: (role: UserRole) => role === 'crew',

  // Can access the orders page (place + track)
  canAccessOrders: (role: UserRole) =>
    role === 'franchise_owner' || role === 'franchisee',
} as const;

// ─── ROLE METADATA ────────────────────────────────────────────────────────────
export const ROLE_META: Record<
  UserRole,
  {
    label: string;
    badgeBg: string;
    badgeColor: string;
    emoji: string;
    description: string;
  }
> = {
  hq_admin: {
    label: 'HQ Administrator',
    badgeBg: '#FFF0D9',
    badgeColor: '#CC7000',
    emoji: '👑',
    description: 'Full system access — all branches & accounts',
  },
  franchise_owner: {
    label: 'Franchise Owner',
    badgeBg: '#F3E5FF',
    badgeColor: '#7B3FA0',
    emoji: '🏪',
    description: 'Full branch access — products, orders & analytics',
  },
  franchisee: {
    label: 'Franchisee',
    badgeBg: '#E0F2FA',
    badgeColor: '#2E7BAD',
    emoji: '🤝',
    description: 'Can place orders & view products',
  },
  crew: {
    label: 'Crew Member',
    badgeBg: '#E8F5E1',
    badgeColor: '#3D6E27',
    emoji: '👷',
    description: 'View-only access',
  },
};
