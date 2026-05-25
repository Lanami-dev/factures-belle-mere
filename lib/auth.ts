// Auth maison avec Web Crypto API.
// Edge-compatible (middleware) ET Node-compatible (server actions / API routes).
// Pas de dépendance externe, on signe juste un cookie avec HMAC-SHA256.

const COOKIE_NAME = 'mbf_session'
const SESSION_DURATION_DAYS = 30

function base64UrlEncode(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(input: string): string {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  return atob(input.replace(/-/g, '+').replace(/_/g, '/') + pad)
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function getSessionSecret(): string {
  const secret = process.env.MBFACTURE_SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("MBFACTURE_SESSION_SECRET manquant ou trop court (32+ caractères) dans le .env racine.")
  }
  return secret
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return bufferToBase64Url(signature)
}

export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({
    iat: Date.now(),
    exp: Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  })
  const encoded = base64UrlEncode(payload)
  const signature = await sign(encoded)
  return `${encoded}.${signature}`
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [encoded, signature] = parts

  let expected: string
  try {
    expected = await sign(encoded)
  } catch {
    return false
  }

  // Comparaison à temps constant pour éviter les attaques par timing.
  if (signature.length !== expected.length) return false
  let result = 0
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  if (result !== 0) return false

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as { exp?: number }
    if (!payload.exp || payload.exp < Date.now()) return false
    return true
  } catch {
    return false
  }
}

export const SESSION_COOKIE = {
  name: COOKIE_NAME,
  maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60
}
