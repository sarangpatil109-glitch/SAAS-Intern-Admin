import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-saas-intern');

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that do not require authentication
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  // Unauthenticated logic
  if (!token) {
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    if (
      pathname !== '/login' && 
      pathname !== '/admin/login' && 
      pathname !== '/register' && 
      pathname !== '/forgot-password'
    ) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;
    
    const isAuthPage = 
      pathname === '/login' || 
      pathname === '/admin/login' || 
      pathname === '/register' || 
      pathname === '/forgot-password';

    if (isAuthPage) {
      if (role === 'Admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else if (role === 'Sales Executive') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
      }
    }

    // Admin protecting rules
    if (pathname.startsWith('/admin')) {
      if (role === 'Sales Executive') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      if (role !== 'Admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }

    // Dashboard protecting rules
    if (pathname.startsWith('/dashboard')) {
      if (role === 'Admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      if (role !== 'Sales Executive') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
};
