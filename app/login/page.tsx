'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { login, type LoginState } from './actions'

const initialState: LoginState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? 'Connexion...' : 'Se connecter'}
    </button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState)

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-anthracite mb-1">Mes factures</h1>
        <p className="text-sm text-pierre mb-6">Connexion à l'espace de Marion.</p>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-anthracite mb-1.5">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              className="input-field"
            />
          </div>

          {state.error && (
            <p className="text-sm text-terracotta">{state.error}</p>
          )}

          <SubmitButton />
        </form>
      </div>
    </main>
  )
}
