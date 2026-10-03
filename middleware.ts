// middleware.ts: redirects based on session cookie (real security is enforced by Firestore rules)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest): NextResponse {
  const hasSession = req.cookies.has('chat_session');
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/chat') && !hasSession) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  if (pathname === '/' && hasSession) {
    return NextResponse.redirect(new URL('/chat', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/chat/:path*'],
};
