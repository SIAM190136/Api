'use client';
// app/page.tsx: login page (redirects to /chat when already signed in)
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import Loading from '@/components/Loading';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/chat');
  }, [user, loading, router]);

  if (loading || user) return <Loading fullScreen />;

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-slate-100 p-4">
      <LoginForm />
    </main>
  );
}
