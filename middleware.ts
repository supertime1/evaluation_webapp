import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't need authentication
  const isPublicPath = path === '/login' || path === '/register' || path === '/logout' || path === '/';
  
  // Apply middleware logic only for protected paths
  if (!isPublicPath && !path.startsWith('/api/')) {
    // Let the client-side auth check handle these routes
    // The client component will redirect if not authenticated
    // This avoids issues with cookies/tokens not being properly synced
    return NextResponse.next();
  }
  
  // For public paths, just continue
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