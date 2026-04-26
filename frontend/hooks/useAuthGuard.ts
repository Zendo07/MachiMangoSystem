'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getStoredUser,
  getStoredToken,
  isTokenExpired,
  clearAuth,
  apiFetch,
  AuthError,
  type UserRole,
  type StoredUser,
} from '@/lib/auth';

interface UseAuthGuardResult {
  user: StoredUser | null;
  token: string | null;
  ready: boolean;
  authFetch: (path: string, options?: RequestInit) => Promise<Response>;
}

export function useAuthGuard(
  allowedRoles?: UserRole[],
  redirectMap?: Partial<Record<UserRole, string>>,
): UseAuthGuardResult {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const userRef = useRef<StoredUser | null>(null);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    const token = getStoredToken();

    if (!user || !token) {
      clearAuth();
      router.replace('/login');
      return;
    }

    if (isTokenExpired()) {
      clearAuth();
      router.replace('/login?reason=session_expired');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const defaults: Record<UserRole, string> = {
        hq_admin: '/admin/dashboard',
        franchise_owner: '/owner/dashboard',
        franchisee: '/owner/dashboard',
        crew: '/crew/dashboard',
      };
      const dest = redirectMap?.[user.role] ?? defaults[user.role] ?? '/login';
      router.replace(dest);
      return;
    }

    userRef.current = user;
    tokenRef.current = token;
    setReady(true);
  }, [router, allowedRoles, redirectMap]);

  useEffect(() => {
    const id = setInterval(() => {
      if (isTokenExpired()) {
        clearAuth();
        router.replace('/login?reason=session_expired');
      }
    }, 30_000);
    return () => clearInterval(id);
  }, [router]);

  const authFetch = useCallback(
    async (path: string, options: RequestInit = {}): Promise<Response> => {
      if (isTokenExpired()) {
        clearAuth();
        router.replace('/login?reason=session_expired');
        throw new AuthError(401);
      }
      try {
        return await apiFetch(path, options);
      } catch (err) {
        if (err instanceof AuthError) {
          router.replace('/login?reason=session_expired');
        }
        throw err;
      }
    },
    [router],
  );

  return {
    user: getStoredUser(),
    token: getStoredToken(),
    ready,
    authFetch,
  };
}
