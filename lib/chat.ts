// lib/chat.ts: Firestore helpers for users list and 1-on-1 messages
import {
  addDoc,
  collection,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ChatMessage, ChatUser } from '@/types';

const ONLINE_TIMEOUT_MS = 90_000;

export function getChatId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('_');
}

function toMillis(value: unknown): number | null {
  return value instanceof Timestamp ? value.toMillis() : null;
}

export function isUserOnline(user: ChatUser, now: number): boolean {
  if (!user.online) return false;
  if (user.lastSeen === null) return true;
  return now - user.lastSeen < ONLINE_TIMEOUT_MS;
}

export function subscribeToUsers(
  currentUid: string,
  onData: (users: ChatUser[]) => void,
  onError: (message: string) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'users'),
    (snap) => {
      const users: ChatUser[] = snap.docs
        .filter((d) => d.id !== currentUid)
        .map((d) => {
          const data = d.data({ serverTimestamps: 'estimate' });
          return {
            uid: d.id,
            name: typeof data.name === 'string' && data.name ? data.name : 'Unknown',
            email: typeof data.email === 'string' ? data.email : '',
            photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
            online: data.online === true,
            lastSeen: toMillis(data.lastSeen),
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      onData(users);
    },
    (err) => onError(err.message)
  );
}

export function subscribeToMessages(
  chatId: string,
  onData: (messages: ChatMessage[]) => void,
  onError: (message: string) => void
): Unsubscribe {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc'),
    limitToLast(200)
  );
  return onSnapshot(
    q,
    (snap) => {
      const messages: ChatMessage[] = snap.docs.map((d) => {
        const data = d.data({ serverTimestamps: 'estimate' });
        return {
          id: d.id,
          text: typeof data.text === 'string' ? data.text : '',
          senderId: typeof data.senderId === 'string' ? data.senderId : '',
          createdAt: toMillis(data.createdAt),
        };
      });
      onData(messages);
    },
    (err) => onError(err.message)
  );
}

export async function sendMessage(chatId: string, senderId: string, text: string): Promise<void> {
  const clean = text.trim();
  if (clean.length === 0) return;
  if (clean.length > 2000) throw new Error('মেসেজ সর্বোচ্চ ২০০০ অক্ষরের হতে পারে।');
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    text: clean,
    senderId,
    createdAt: serverTimestamp(),
  });
}
