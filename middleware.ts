import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;
  
  // Check if the user has an authentication cookie
  const isAuthenticated = request.cookies.has('fastapiusersauth');
  
  // Define public paths that don't need authentication
  const isPublicPath = path === '/login' || path === '/register' || path === '/logout' || path === '/';

  // If user is on a public path but is authenticated, redirect to dashboard
  // Exclude the logout page and homepage from this rule
  if (isPublicPath && isAuthenticated && path !== '/logout' && path !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is trying to access a protected path without authentication
  if (!isPublicPath && !isAuthenticated && !path.startsWith('/api/')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

// Define which paths this middleware will run on
export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes
    // - Static files (images, js, css)
    // - Favicon, etc.
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.svg).*)',
  ],
}; 