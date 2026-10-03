'use client';
// app/chat/page.tsx: main chat page (sidebar + chat window, mobile responsive)
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatWindow from '@/components/ChatWindow';
import Loading from '@/components/Loading';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { getDisplayName } from '@/lib/auth';
import { subscribeToUsers } from '@/lib/chat';
import type { ChatUser } from '@/types';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<ChatUser[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  const uid = user?.uid ?? null;

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (!uid) return;
    setUsersLoading(true);
    setUsersError(null);
    const unsub = subscribeToUsers(
      uid,
      (list) => {
        setUsers(list);
        setUsersLoading(false);
      },
      (msg) => {
        setUsersError(msg);
        setUsersLoading(false);
      }
    );
    return unsub;
  }, [uid]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const me = useMemo<ChatUser | null>(() => {
    if (!user) return null;
    return {
      uid: user.uid,
      name: getDisplayName(user),
      email: user.email ?? '',
      photoURL: user.photoURL,
      online: true,
      lastSeen: null,
    };
  }, [user]);

  const peer = useMemo<ChatUser | null>(
    () => users.find((u) => u.uid === selectedUid) ?? null,
    [users, selectedUid]
  );

  if (loading || !user || !me) return <Loading fullScreen />;

  return (
    <main className="flex h-[100dvh] w-full overflow-hidden bg-slate-100">
      <div className={`${peer ? 'hidden md:flex' : 'flex'} h-full w-full md:w-80 md:shrink-0 lg:w-96`}>
        <Sidebar
          me={me}
          users={users}
          selectedUid={selectedUid}
          loading={usersLoading}
          error={usersError}
          now={now}
          onSelect={setSelectedUid}
        />
      </div>

      <div className={`${peer ? 'flex' : 'hidden md:flex'} h-full min-w-0 flex-1`}>
        {peer ? (
          <ChatWindow me={me} peer={peer} now={now} onBack={() => setSelectedUid(null)} />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
            <span className="text-5xl">💬</span>
            <p className="text-sm">চ্যাট শুরু করতে বাম পাশ থেকে একজন ইউজার বেছে নিন</p>
          </div>
        )}
      </div>
    </main>
  );
}
