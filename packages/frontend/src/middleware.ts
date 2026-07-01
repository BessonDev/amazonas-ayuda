import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rutasPublicas = ['/admin/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('access_token')?.value

  if (pathname.startsWith('/admin') && !rutasPublicas.includes(pathname)) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  if (pathname === '/admin/login' && accessToken) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
