import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root to /en
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/en';
    return NextResponse.redirect(url);
  }

  // Redirect paths without locale prefix to /en (but not root)
  if (pathname !== '/' && !pathname.startsWith('/en/') && !pathname.startsWith('/hi/') && pathname !== '/en' && pathname !== '/hi') {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.delete('X-Powered-By');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|static|.*\\..*).*)']
};
