import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export function GET(request: NextRequest) {
  cookies().delete('auth-token')
  return NextResponse.redirect(new URL('/auth/login', request.url))
}