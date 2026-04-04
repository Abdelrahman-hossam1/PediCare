import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export interface TokenPayload extends JWTPayload {
  id: string
  email: string
  role: string
  sessionId?: string
}

function secretKey() {
  return new TextEncoder().encode(JWT_SECRET)
}

export async function signAuthToken(payload: TokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('3h')
    .sign(secretKey())
}

export async function verifyAuthToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey())
    // jose returns a generic JWTPayload; we validate the shape we need
    const id = typeof payload.id === 'string' ? payload.id : null
    const email = typeof payload.email === 'string' ? payload.email : null
    const role = typeof payload.role === 'string' ? payload.role : null
    const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId : undefined
    if (!id || !email || !role) return null
    return { id, email, role, sessionId }
  } catch {
    return null
  }
}

