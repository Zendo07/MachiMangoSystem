// lib/auth.ts
import { API_BASE } from './config';
export type UserRole = 'hq_admin' | 'franchise_owner' | 'franchisee' | 'crew';

export interface StoredUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  branchId?: string;
}

export const ROLE_META: Record<
  UserRole,
  {
    label: string;
    emoji: string;
    description: string;
    badgeBg: string;
    badgeColor: string;
  }
> = {
  hq_admin: {
    label: 'HQ Admin',
    emoji: '👑',
    description: 'Full system access',
    badgeBg: '#FFF3E0',
    badgeColor: '#E65100',
  },
  franchise_owner: {
    label: 'Franchise Owner',
    emoji: '🏪',
    description: 'Manages franchise operations',
    badgeBg: '#E8F5E9',
    badgeColor: '#2E7D32',
  },
  franchisee: {
    label: 'Franchisee',
    emoji: '🧑‍💼',
    description: 'Branch-level access',
    badgeBg: '#E3F2FD',
    badgeColor: '#1565C0',
  },
  crew: {
    label: 'Crew',
    emoji: '👷',
    description: 'Operational access only',
    badgeBg: '#F3E5F5',
    badgeColor: '#6A1B9A',
  },
};

// ─── Storage keys ──────────────────────────────────────────────────────────
// NOTE: login/signup pages use 'token' and 'user' — keeping keys consistent
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// ─── Getters ───────────────────────────────────────────────────────────────
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

// ─── Setters ───────────────────────────────────────────────────────────────
export function setAuth(token: string, user: StoredUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ─── Clear ─────────────────────────────────────────────────────────────────
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ─── Dashboard route helper ────────────────────────────────────────────────
export function getDashboardRoute(role: UserRole): string {
  const routes: Record<UserRole, string> = {
    hq_admin: '/admin/dashboard',
    franchise_owner: '/owner/dashboard',
    franchisee: '/owner/dashboard',
    crew: '/crew/dashboard',
  };
  return routes[role] ?? '/login';
}

// ─── Token expiry check ────────────────────────────────────────────────────
// Decodes the JWT payload (no verification — server handles that).
// Returns true if the token is missing or expires within `bufferSeconds`.
export function isTokenExpired(bufferSeconds = 30): boolean {
  const token = getStoredToken();
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp: number = payload.exp ?? 0;
    return Date.now() / 1000 >= exp - bufferSeconds;
  } catch {
    return true; // malformed token → treat as expired
  }
}

// ─── Authenticated fetch ───────────────────────────────────────────────────
// Drop-in replacement for fetch() that:
//   • Injects the Bearer token automatically
//   • Throws an AuthError on 401 / 403 so callers can redirect to /login
//   • Throws a plain Error on other non-ok responses

export class AuthError extends Error {
  constructor(public status: number) {
    super(`Auth error: ${status}`);
    this.name = 'AuthError';
  }
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getStoredToken();

  const headers = new Headers(options.headers ?? {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 || res.status === 403) {
    // Session is gone — wipe local auth so the guard redirects to login
    clearAuth();
    throw new AuthError(res.status);
  }

  return res;
}
