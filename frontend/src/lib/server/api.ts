import { cookies } from 'next/headers'

export interface ApiEnvelope<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Server-side fetch helper used by Server Components to talk to the backend.
 * It forwards the user's cookies (including the auth token) to the backend so
 * authentication works exactly like a same-origin request.
 */
export async function apiGet<T = unknown>(path: string): Promise<ApiEnvelope<T> | null> {
  try {
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:4000'
    const cookie = (await cookies()).toString()
    const res = await fetch(`${backendUrl}${path}`, {
      headers: cookie ? { cookie } : {},
      cache: 'no-store',
    })
    const json = (await res.json()) as ApiEnvelope<T>
    return json
  } catch (error) {
    console.error(`[apiGet] Request to ${path} failed:`, error)
    return null
  }
}