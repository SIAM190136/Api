// lib/auth.ts: authentication helpers (Google, email/password, logout, presence)
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

export function getDisplayName(user: User): string {
  const fromProfile = user.displayName?.trim();
  if (fromProfile) return fromProfile;
  const fromEmail = user.email?.split('@')[0];
  return fromEmail && fromEmail.length > 0 ? fromEmail : 'User';
}

export async function upsertUserProfile(user: User): Promise<void> {
  await setDoc(
    doc(db, 'users', user.uid),
    {
      name: getDisplayName(user),
      email: user.email ?? '',
      photoURL: user.photoURL ?? null,
      lastSeen: serverTimestamp(),
      online: true,
    },
    { merge: true }
  );
}

export async function setPresence(uid: string, online: boolean): Promise<void> {
  await setDoc(doc(db, 'users', uid), { online, lastSeen: serverTimestamp() }, { merge: true });
}

export async function signInWithGoogle(): Promise<void> {
  const cred = await signInWithPopup(auth, googleProvider);
  await upsertUserProfile(cred.user);
}

export async function signUpWithEmail(name: string, email: string, password: string): Promise<void> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await upsertUserProfile(cred.user);
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await upsertUserProfile(cred.user);
}

export async function logout(): Promise<void> {
  const current = auth.currentUser;
  if (current) {
    try {
      await setPresence(current.uid, false);
    } catch {
      // ignore: logout must still succeed even if the presence update fails
    }
  }
  await signOut(auth);
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'ইমেইল ঠিকানাটি সঠিক নয়।';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'ইমেইল বা পাসওয়ার্ড ভুল।';
      case 'auth/email-already-in-use':
        return 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে।';
      case 'auth/weak-password':
        return 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'লগইন উইন্ডো বন্ধ করে দেওয়া হয়েছে।';
      case 'auth/popup-blocked':
        return 'ব্রাউজার পপআপ ব্লক করেছে। পপআপ অনুমতি দিয়ে আবার চেষ্টা করুন।';
      case 'auth/network-request-failed':
        return 'ইন্টারনেট সংযোগে সমস্যা হয়েছে।';
      case 'auth/too-many-requests':
        return 'অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
      case 'auth/operation-not-allowed':
        return 'Firebase Console-এ এই লগইন পদ্ধতি চালু করা নেই।';
      case 'auth/unauthorized-domain':
        return 'এই ডোমেইন Firebase Authorized domains-এ যোগ করা নেই।';
      default:
        return `সমস্যা হয়েছে (${error.code})।`;
    }
  }
  return 'অজানা সমস্যা হয়েছে। আবার চেষ্টা করুন।';
}
