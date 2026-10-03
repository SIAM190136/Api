'use client';
// components/UserList.tsx: searchable list of users with online status
import { useMemo, useState } from 'react';
import Avatar from '@/components/Avatar';
import Loading from '@/components/Loading';
import { isUserOnline } from '@/lib/chat';
import type { ChatUser } from '@/types';

interface UserListProps {
  users: ChatUser[];
  selectedUid: string | null;
  loading: boolean;
  error: string | null;
  now: number;
  onSelect: (uid: string) => void;
}

export default function UserList({ users, selectedUid, loading, error, now, onSelect }: UserListProps) {
  const [search, setSearch] = useState<string>('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  }, [users, search]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="p-3">
        <input
          type="search"
          placeholder="ইউজার খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading && <Loading label="ইউজার লোড হচ্ছে..." />}
        {error && (
          <p role="alert" className="m-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">কোনো ইউজার পাওয়া যায়নি।</p>
        )}

        {filtered.map((u) => {
          const online = isUserOnline(u, now);
          return (
            <button
              key={u.uid}
              type="button"
              onClick={() => onSelect(u.uid)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                selectedUid === u.uid ? 'bg-indigo-50' : ''
              }`}
            >
              <Avatar name={u.name} photoURL={u.photoURL} online={online} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{u.name}</p>
                <p className={`text-xs ${online ? 'text-green-600' : 'text-slate-400'}`}>
                  {online ? 'অনলাইন' : 'অফলাইন'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
