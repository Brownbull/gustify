import { create } from 'zustand'
import type { User } from 'firebase/auth'
import {
  signInWithGoogle,
  signOutUser,
  ensureUserProfile,
  subscribeToAuth,
} from '@/services/auth'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  _unsubscribe: (() => void) | null
}

const ensuredUids = new Set<string>()

export const useAuthStore = create<AuthState>((set) => {
  const unsubscribe = subscribeToAuth((user) => {
    if (user) {
      set({ user, loading: false, error: null })

      if (!ensuredUids.has(user.uid)) {
        ensuredUids.add(user.uid)
        ensureUserProfile(user).catch((e) => {
          ensuredUids.delete(user.uid)
          if (import.meta.env.DEV) {
            console.warn('[Auth] Failed to ensure user profile:', e)
          }
        })
      }
    } else {
      set({ user: null, loading: false, error: null })
    }
  })

  return {
    user: null,
    loading: true,
    error: null,
    _unsubscribe: unsubscribe,

    signIn: async () => {
      set({ error: null })
      try {
        await signInWithGoogle()
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Error desconocido'
        set({ error: message })
      }
    },

    signOut: async () => {
      set({ error: null })
      try {
        await signOutUser()
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Error desconocido'
        set({ error: message })
      }
    },
  }
})
