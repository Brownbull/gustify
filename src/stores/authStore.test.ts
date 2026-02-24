import { describe, it, expect, vi, beforeEach } from 'vitest'

let authCallback: ((user: any) => void) | null = null
const mockUnsubscribe = vi.fn()
const mockSignInWithGoogle = vi.fn()
const mockSignOutUser = vi.fn()
const mockEnsureUserProfile = vi.fn()

vi.mock('@/services/auth', () => ({
  subscribeToAuth: (cb: (user: any) => void) => {
    authCallback = cb
    return mockUnsubscribe
  },
  signInWithGoogle: (...args: unknown[]) => mockSignInWithGoogle(...args),
  signOutUser: (...args: unknown[]) => mockSignOutUser(...args),
  ensureUserProfile: (...args: unknown[]) => mockEnsureUserProfile(...args),
}))

let useAuthStore: any

beforeEach(async () => {
  vi.clearAllMocks()
  authCallback = null
  vi.resetModules()
  const mod = await import('./authStore')
  useAuthStore = mod.useAuthStore
})

describe('useAuthStore', () => {
  it('starts with loading true and user null', () => {
    const state = useAuthStore.getState()

    expect(state.loading).toBe(true)
    expect(state.user).toBeNull()
    expect(state.error).toBeNull()
  })

  it('sets user and loading false when auth callback fires with user', () => {
    const mockUser = { uid: '123', displayName: 'Test' }
    mockEnsureUserProfile.mockResolvedValue(undefined)

    authCallback!(mockUser)

    const state = useAuthStore.getState()
    expect(state.user).toBe(mockUser)
    expect(state.loading).toBe(false)
  })

  it('sets user null when auth callback fires with null', () => {
    authCallback!(null)

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.loading).toBe(false)
  })

  it('stores unsubscribe function', () => {
    const state = useAuthStore.getState()
    expect(state._unsubscribe).toBe(mockUnsubscribe)
  })

  it('signIn sets error on failure', async () => {
    mockSignInWithGoogle.mockRejectedValue(new Error('auth/popup-blocked'))

    await useAuthStore.getState().signIn()

    expect(useAuthStore.getState().error).toBe('auth/popup-blocked')
  })

  it('signIn clears previous error before attempting', async () => {
    mockSignInWithGoogle.mockRejectedValue(new Error('first-error'))
    await useAuthStore.getState().signIn()
    expect(useAuthStore.getState().error).toBe('first-error')

    mockSignInWithGoogle.mockResolvedValue({ user: { uid: '1' } })
    await useAuthStore.getState().signIn()
    expect(useAuthStore.getState().error).toBeNull()
  })

  it('signIn handles non-Error throws', async () => {
    mockSignInWithGoogle.mockRejectedValue('string error')

    await useAuthStore.getState().signIn()

    expect(useAuthStore.getState().error).toBe('Error desconocido')
  })

  it('signOut sets error on failure', async () => {
    mockSignOutUser.mockRejectedValue(new Error('network-error'))

    await useAuthStore.getState().signOut()

    expect(useAuthStore.getState().error).toBe('network-error')
  })

  it('signOut clears previous error before attempting', async () => {
    mockSignInWithGoogle.mockRejectedValue(new Error('first-error'))
    await useAuthStore.getState().signIn()
    expect(useAuthStore.getState().error).toBe('first-error')

    mockSignOutUser.mockResolvedValue(undefined)
    await useAuthStore.getState().signOut()
    expect(useAuthStore.getState().error).toBeNull()
  })
})
