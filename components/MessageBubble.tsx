// components/MessageBubble.tsx: single chat message with sender name, photo and timestamp
import Avatar from '@/components/Avatar';
import type { ChatMessage } from '@/types';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  senderName: string;
  senderPhoto: string | null;
}

function formatTime(ms: number | null): string {
  if (ms === null) return '';
  const date = new Date(ms);
  const time = date.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
  const isToday = date.toDateString() === new Date().toDateString();
  if (isToday) return time;
  return `${date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}, ${time}`;
}

export default function MessageBubble({ message, isOwn, senderName, senderPhoto }: MessageBubbleProps) {
  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar name={senderName} photoURL={senderPhoto} size={32} />
      <div className={`flex max-w-[78%] flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        <span className="mb-0.5 px-1 text-xs text-slate-500">{senderName}</span>
        <div
          className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm ${
            isOwn
              ? 'rounded-br-sm bg-indigo-600 text-white'
              : 'rounded-bl-sm bg-white text-slate-800 shadow-sm'
          }`}
        >
          {message.text}
        </div>
        <span className="mt-0.5 px-1 text-[11px] text-slate-400">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
