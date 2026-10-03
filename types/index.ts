// types/index.ts: shared TypeScript types for users and messages
export interface ChatUser {
  uid: string;
  name: string;
  email: string;
  photoURL: string | null;
  online: boolean;
  lastSeen: number | null;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: number | null;
}
