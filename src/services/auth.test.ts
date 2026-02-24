import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSignInWithPopup = vi.fn()
const mockSignOut = vi.fn()
const mockOnAuthStateChanged = vi.fn()
const mockGetDoc = vi.fn()
const mockSetDoc = vi.fn()
const mockDoc = vi.fn()

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: (...args: unknown[]) => mockSignInWithPopup(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
}))

vi.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  Timestamp: { now: () => ({ seconds: 1000, nanoseconds: 0 }) },
}))

vi.mock('@/config/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}))

import {
  signInWithGoogle,
  signOutUser,
  ensureUserProfile,
  subscribeToAuth,
} from './auth'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('signInWithGoogle', () => {
  it('calls signInWithPopup and returns the user', async () => {
    const mockUser = { uid: '123', displayName: 'Test' }
    mockSignInWithPopup.mockResolvedValue({ user: mockUser })

    const user = await signInWithGoogle()

    expect(mockSignInWithPopup).toHaveBeenCalledOnce()
    expect(user).toBe(mockUser)
  })
})

describe('signInWithGoogle', () => {
  it('propagates error when popup fails', async () => {
    mockSignInWithPopup.mockRejectedValue(new Error('auth/popup-blocked'))

    await expect(signInWithGoogle()).rejects.toThrow('auth/popup-blocked')
  })
})

describe('signOutUser', () => {
  it('calls signOut', async () => {
    mockSignOut.mockResolvedValue(undefined)

    await signOutUser()

    expect(mockSignOut).toHaveBeenCalledOnce()
  })

  it('propagates error when sign-out fails', async () => {
    mockSignOut.mockRejectedValue(new Error('network-error'))

    await expect(signOutUser()).rejects.toThrow('network-error')
  })
})

describe('ensureUserProfile', () => {
  const mockUser = {
    uid: 'user-123',
    displayName: 'María García',
    email: 'maria@example.com',
    photoURL: 'https://example.com/photo.jpg',
  }

  it('skips creation if profile already exists', async () => {
    mockDoc.mockReturnValue('user-ref')
    mockGetDoc.mockResolvedValue({ exists: () => true })

    await ensureUserProfile(mockUser as any)

    expect(mockGetDoc).toHaveBeenCalledWith('user-ref')
    expect(mockSetDoc).not.toHaveBeenCalled()
  })

  it('creates profile with correct defaults for new user', async () => {
    mockDoc.mockReturnValue('user-ref')
    mockGetDoc.mockResolvedValue({ exists: () => false })
    mockSetDoc.mockResolvedValue(undefined)

    await ensureUserProfile(mockUser as any)

    expect(mockSetDoc).toHaveBeenCalledWith('user-ref', expect.objectContaining({
      profile: expect.objectContaining({
        name: 'María García',
        email: 'maria@example.com',
        photoUrl: 'https://example.com/photo.jpg',
      }),
      cookingProfile: expect.objectContaining({
        proficiencyTier: 'Principiante',
        avgComplexity: 0,
        dishesCooked: 0,
      }),
      settings: expect.objectContaining({
        locale: 'es',
        currency: 'CLP',
        theme: 'light',
      }),
    }))
  })

  it('propagates error when getDoc fails', async () => {
    mockDoc.mockReturnValue('user-ref')
    mockGetDoc.mockRejectedValue(new Error('firestore-unavailable'))

    await expect(ensureUserProfile(mockUser as any)).rejects.toThrow('firestore-unavailable')
  })

  it('propagates error when setDoc fails', async () => {
    mockDoc.mockReturnValue('user-ref')
    mockGetDoc.mockResolvedValue({ exists: () => false })
    mockSetDoc.mockRejectedValue(new Error('permission-denied'))

    await expect(ensureUserProfile(mockUser as any)).rejects.toThrow('permission-denied')
  })

  it('initializes all cooking profile arrays as empty', async () => {
    mockDoc.mockReturnValue('user-ref')
    mockGetDoc.mockResolvedValue({ exists: () => false })
    mockSetDoc.mockResolvedValue(undefined)

    await ensureUserProfile(mockUser as any)

    expect(mockSetDoc).toHaveBeenCalledWith('user-ref', expect.objectContaining({
      cookingProfile: expect.objectContaining({
        dietPrefs: [],
        allergies: [],
        cookedCuisines: [],
        cookedTechniques: [],
        cookedIngredients: [],
      }),
    }))
  })

  it('handles null displayName and email gracefully', async () => {
    const userWithNulls = { uid: 'u1', displayName: null, email: null, photoURL: null }
    mockDoc.mockReturnValue('user-ref')
    mockGetDoc.mockResolvedValue({ exists: () => false })
    mockSetDoc.mockResolvedValue(undefined)

    await ensureUserProfile(userWithNulls as any)

    expect(mockSetDoc).toHaveBeenCalledWith('user-ref', expect.objectContaining({
      profile: expect.objectContaining({
        name: '',
        email: '',
        photoUrl: '',
      }),
    }))
  })
})

describe('subscribeToAuth', () => {
  it('subscribes to onAuthStateChanged and returns unsubscribe fn', () => {
    const unsubscribe = vi.fn()
    mockOnAuthStateChanged.mockReturnValue(unsubscribe)
    const callback = vi.fn()

    const result = subscribeToAuth(callback)

    expect(mockOnAuthStateChanged).toHaveBeenCalledOnce()
    expect(result).toBe(unsubscribe)
  })
})
