'use client';
// components/Sidebar.tsx: sidebar with current user header, logout and user list
import { useState } from 'react';
import Avatar from '@/components/Avatar';
import UserList from '@/components/UserList';
import { logout } from '@/lib/auth';
import type { ChatUser } from '@/types';

interface SidebarProps {
  me: ChatUser;
  users: ChatUser[];
  selectedUid: string | null;
  loading: boolean;
  error: string | null;
  now: number;
  onSelect: (uid: string) => void;
}

export default function Sidebar({ me, users, selectedUid, loading, error, now, onSelect }: SidebarProps) {
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const handleLogout = async (): Promise<void> => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 p-4">
        <Avatar name={me.name} photoURL={me.photoURL} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">{me.name}</p>
          <p className="truncate text-xs text-slate-400">{me.email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
        >
          {loggingOut ? '...' : 'লগআউট'}
        </button>
      </div>
      <UserList
        users={users}
        selectedUid={selectedUid}
        loading={loading}
        error={error}
        now={now}
        onSelect={onSelect}
      />
    </aside>
  );
}
