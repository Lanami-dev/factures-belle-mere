'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAccessPassword } from '@/lib/config'
import { createSessionToken, SESSION_COOKIE } from '@/lib/auth'

export type LoginState = { error?: string }

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get('password') ?? '')

  let expected: string
  try {
    expected = getAccessPassword()
  } catch (err) {
    return { error: "Configuration serveur invalide. Contactez Mélissa." }
  }

  if (password !== expected) {
    // Petit délai pour limiter le brute-force basique.
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { error: "Mot de passe incorrect." }
  }

  const token = await createSessionToken()
  cookies().set(SESSION_COOKIE.name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_COOKIE.maxAge
  })

  redirect('/')
}
