'use client';
// components/ChatWindow.tsx: chat panel with header, live messages and input
import { useEffect, useMemo, useRef, useState } from 'react';
import Avatar from '@/components/Avatar';
import Loading from '@/components/Loading';
import MessageBubble from '@/components/MessageBubble';
import MessageInput from '@/components/MessageInput';
import { getChatId, isUserOnline, sendMessage, subscribeToMessages } from '@/lib/chat';
import type { ChatMessage, ChatUser } from '@/types';

interface ChatWindowProps {
  me: ChatUser;
  peer: ChatUser;
  now: number;
  onBack: () => void;
}

export default function ChatWindow({ me, peer, now, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatId = useMemo(() => getChatId(me.uid, peer.uid), [me.uid, peer.uid]);
  const online = isUserOnline(peer, now);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setMessages([]);
    const unsub = subscribeToMessages(
      chatId,
      (list) => {
        setMessages(list);
        setLoading(false);
      },
      (msg) => {
        setError(msg);
        setLoading(false);
      }
    );
    return unsub;
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string): Promise<void> => {
    try {
      setError(null);
      await sendMessage(chatId, me.uid, text);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'মেসেজ পাঠানো যায়নি।');
      throw err;
    }
  };

  return (
    <section className="flex h-full min-h-0 w-full flex-col bg-slate-100">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="পেছনে যান"
          className="rounded-lg px-2 py-1 text-xl text-slate-600 hover:bg-slate-100 md:hidden"
        >
          ←
        </button>
        <Avatar name={peer.name} photoURL={peer.photoURL} online={online} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{peer.name}</p>
          <p className={`text-xs ${online ? 'text-green-600' : 'text-slate-400'}`}>
            {online ? 'অনলাইন' : 'অফলাইন'}
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
        {loading && <Loading label="মেসেজ লোড হচ্ছে..." />}
        {!loading && messages.length === 0 && !error && (
          <p className="py-10 text-center text-sm text-slate-400">
            এখনো কোনো মেসেজ নেই। প্রথম মেসেজটি পাঠান!
          </p>
        )}
        {messages.map((m) => {
          const isOwn = m.senderId === me.uid;
          return (
            <MessageBubble
              key={m.id}
              message={m}
              isOwn={isOwn}
              senderName={isOwn ? me.name : peer.name}
              senderPhoto={isOwn ? me.photoURL : peer.photoURL}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p role="alert" className="mx-3 mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <MessageInput onSend={handleSend} disabled={loading && messages.length === 0 && !error} />
    </section>
  );
}
