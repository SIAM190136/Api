'use client';
// context/AuthContext.tsx: provides auth state, session cookie and online presence
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { setPresence, upsertUserProfile } from '@/lib/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

const SESSION_COOKIE = 'chat_session';
const HEARTBEAT_MS = 30_000;

function setSessionCookie(active: boolean): void {
  if (active) {
    document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=2592000; SameSite=Lax`;
  } else {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setSessionCookie(nextUser !== null);
      setUser(nextUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    const markPresence = (online: boolean): void => {
      setPresence(uid, online).catch(() => undefined);
    };

    upsertUserProfile(user).catch(() => undefined);

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') markPresence(true);
    }, HEARTBEAT_MS);

    const onVisibility = (): void => markPresence(document.visibilityState === 'visible');
    const onPageHide = (): void => markPresence(false);

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({ user, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
