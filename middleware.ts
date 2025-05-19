import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Get auth tokens if they exist
    const authCookie = request.cookies.get('fastapiusersauth')?.value;
    const hasToken = !!authCookie;

    // For the homepage, always redirect to login or dashboard
    if (request.nextUrl.pathname === '/') {
        if (hasToken) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // For dashboard, check if authenticated
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!hasToken) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // For login page, redirect to dashboard if already authenticated
    if (request.nextUrl.pathname === '/login' && hasToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
    matcher: [
        '/',
        '/login',
        '/dashboard/:path*'
    ]
}; 