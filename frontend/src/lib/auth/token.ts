import { jwtVerify } from 'jose'
import { UserRole } from '@/types'

export interface TokenPayload {
  userId: string
  username: string
  email: string
  name: string
  role: UserRole
}

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'your-super-secret-auth-key-min-32-chars-long'
)

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}