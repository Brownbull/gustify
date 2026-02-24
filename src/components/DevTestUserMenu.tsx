import { useState } from 'react'
import { signInWithCustomToken, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { DEV_TEST_USERS, TEST_USER_PASSWORD, type DevTestUserKey } from '@/config/test-users'

const TIER_COLORS: Record<string, string> = {
  Principiante: 'bg-green-100 text-green-800',
  'Cómodo': 'bg-blue-100 text-blue-800',
  Aventurero: 'bg-orange-100 text-orange-800',
  Avanzado: 'bg-purple-100 text-purple-800',
}

export default function DevTestUserMenu() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<DevTestUserKey | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(userKey: DevTestUserKey) {
    setLoading(userKey)
    setError(null)

    const user = DEV_TEST_USERS.find((u) => u.key === userKey)!

    try {
      if (import.meta.env.DEV) {
        // Local dev server: use custom token via Vite middleware
        const res = await fetch(`/__dev/auth-token/${userKey}`)
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: res.statusText }))
          throw new Error(body.error || `HTTP ${res.status}`)
        }
        const { token } = await res.json()
        await signInWithCustomToken(auth, token)
      } else {
        // Staging hosted: use email/password
        await signInWithEmailAndPassword(auth, user.email, TEST_USER_PASSWORD)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(null)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-opacity hover:bg-primary"
      >
        Test Users
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-64 rounded-lg border border-primary/20 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-primary/10 px-3 py-2">
        <span className="text-xs font-semibold text-primary-dark">
          Dev — Test Users
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          cerrar
        </button>
      </div>

      <div className="p-2 space-y-1">
        {DEV_TEST_USERS.map((user) => (
          <button
            key={user.key}
            type="button"
            onClick={() => handleLogin(user.key)}
            disabled={loading !== null}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface disabled:opacity-50"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-800 truncate">
                {user.name}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-block rounded px-1 py-0.5 text-[10px] font-medium ${TIER_COLORS[user.tier] ?? ''}`}>
                  {user.tier}
                </span>
                <span className="text-[10px] text-gray-400">
                  {user.dishes} platos
                </span>
              </div>
            </div>
            {loading === user.key && (
              <span className="text-xs text-gray-400 animate-pulse">...</span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="border-t border-red-100 px-3 py-2">
          <p className="text-[10px] text-red-600 break-words">{error}</p>
        </div>
      )}
    </div>
  )
}
