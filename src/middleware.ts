// This file is disabled for static export
// Middleware cannot be used with "output: export"

/*
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  try {
    // Refresh session if expired - this updates the cookies
    const { data: { session } } = await supabase.auth.getSession();
    
    // Log session status for debugging
    console.log('Middleware session check:', session ? 'Active session' : 'No session');
  } catch (error) {
    console.error('Middleware session error:', error);
  }
  
  return res;
}

// Apply middleware to all routes that need authentication
export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/checkout/:path*',
    '/api/protected/:path*'
  ],
};
*/
