// app/layout.tsx: root layout with global styles and AuthProvider
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'রিয়েল-টাইম চ্যাট',
  description: 'Next.js ও Firebase দিয়ে তৈরি রিয়েল-টাইম চ্যাট অ্যাপ',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
