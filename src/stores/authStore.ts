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
}

export const useAuthStore = create<AuthState>((set) => {
  subscribeToAuth(async (user) => {
    if (user) {
      try {
        await ensureUserProfile(user)
      } catch (e) {
        if (import.meta.env.DEV) {
          console.warn('[Auth] Failed to ensure user profile:', e)
        }
      }
      set({ user, loading: false, error: null })
    } else {
      set({ user: null, loading: false, error: null })
    }
  })

  return {
    user: null,
    loading: true,
    error: null,

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
      try {
        await signOutUser()
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Error desconocido'
        set({ error: message })
      }
    },
  }
})
