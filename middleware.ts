import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for auth callback route
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  // Get access and refresh tokens from cookies
  const access_token = request.cookies.get('access_token')
  const refresh_token = request.cookies.get('refresh_token')
  
  // If either token is missing
  if (!access_token || !refresh_token) {
    // Prepare login URL with redirect parameter
    const currentUrl = request.url
    const loginUrl = new URL('https://companion.scaler.com/login')
    loginUrl.searchParams.set('redirectUrl', currentUrl)

    // Create response and set redirect URL cookie
    const response = NextResponse.redirect(loginUrl)
    response.cookies.set('redirectUrl', currentUrl, {
      secure: true,
      sameSite: 'none',
      path: '/'
    })
    
    return response
  }

  // If tokens exist, continue to the requested page
  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Add paths that require authentication
    '/((?!api|_next/static|_next/image|favicon.ico|login|auth/callback).*)',
  ],
}
