import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Get all possible auth tokens
    const authToken = request.cookies.get('auth-token')?.value;
    const localStorageToken = request.headers.get('x-auth-token');
    
    // Check if any token exists
    const hasToken = authToken || localStorageToken;

    console.log('[Middleware] Request path:', request.nextUrl.pathname);
    console.log('[Middleware] Request protocol:', request.nextUrl.protocol);
    console.log('[Middleware] Auth token from cookie:', authToken);
    console.log('[Middleware] Auth token from header:', localStorageToken);
    console.log('[Middleware] Has token:', hasToken);
    console.log('[Middleware] All cookies:', request.cookies.toString());


    // Home page redirect
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }


    // Check if the request is for the dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!hasToken) {
            console.log('[Middleware] No token found, redirecting to sign-in');
            // Add cache-busting parameter to prevent caching issues
            const signInUrl = new URL('/login', request.url);
            signInUrl.searchParams.set('t', Date.now().toString());
            return NextResponse.redirect(signInUrl);
        }

        try {
            // You can add additional token validation here if needed
            console.log('[Middleware] Token found, allowing access to dashboard');
            const response = NextResponse.next();
            // Ensure the token is included in the response
            if (authToken) {
                response.cookies.set('auth-token', authToken, {
                    path: '/',
                    secure: request.nextUrl.protocol === 'https:',
                    sameSite: 'lax',
                    maxAge: 86400 // 24 hours
                });
            }
            return response;
        } catch (error) {
            console.log('[Middleware] Error validating token:', error);
            // If token is invalid, redirect to sign-in with cache-busting
            const signInUrl = new URL('/login', request.url);
            signInUrl.searchParams.set('t', Date.now().toString());
            return NextResponse.redirect(signInUrl);
        }
    }

    // Allow access to sign-in and register pages
    if (request.nextUrl.pathname.startsWith('/login') || 
        request.nextUrl.pathname.startsWith('/register')) {
        if (hasToken) {
            console.log('[Middleware] User already authenticated, redirecting to dashboard');
            // If user is already authenticated, redirect to dashboard with cache-busting
            const dashboardUrl = new URL('/dashboard', request.url);
            dashboardUrl.searchParams.set('t', Date.now().toString());
            return NextResponse.redirect(dashboardUrl);
        }
    }

    return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
    matcher: [
        '/',
        '/dashboard/:path*',
        '/login',
        '/register'
    ]
}; 