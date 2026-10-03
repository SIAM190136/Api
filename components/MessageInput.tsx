'use client';
// components/MessageInput.tsx: message textarea with send button (Enter to send)
import { useState, type FormEvent, type KeyboardEvent } from 'react';

interface MessageInputProps {
  disabled?: boolean;
  onSend: (text: string) => Promise<void>;
}

export default function MessageInput({ disabled = false, onSend }: MessageInputProps) {
  const [text, setText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);

  const submit = async (): Promise<void> => {
    const value = text.trim();
    if (!value || sending || disabled) return;
    setSending(true);
    try {
      await onSend(value);
      setText('');
    } catch {
      // the parent shows the error message; keep the text so the user can retry
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    void submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-slate-200 bg-white p-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        maxLength={2000}
        placeholder="মেসেজ লিখুন..."
        disabled={disabled}
        className="max-h-32 min-h-[42px] flex-1 resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || sending || text.trim().length === 0}
        className="h-[42px] rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {sending ? '...' : 'পাঠান'}
      </button>
    </form>
  );
}
