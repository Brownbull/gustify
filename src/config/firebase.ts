import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth'
import {
  getFirestore,
  Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

const missingVars = requiredEnvVars.filter(
  (key) => !import.meta.env[key]
)

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase environment variables: ${missingVars.join(', ')}. ` +
    'Please check your .env file and ensure all VITE_FIREBASE_* variables are set.'
  )
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)

// Compute once at module level — depends only on static env vars
const useEmulators = (() => {
  const e2eMode = import.meta.env.VITE_E2E_MODE
  if (e2eMode === 'emulator') return true
  if (e2eMode === 'production') return false
  // Default: use emulators in dev, production otherwise
  return import.meta.env.DEV
})()

export const auth: Auth = getAuth(app)

// Firebase SDK v12+ has issues where connectFirestoreEmulator overrides experimentalForceLongPolling
// so we configure the emulator connection INSIDE initializeFirestore settings
function getFirestoreInstance(): Firestore {
  if (!useEmulators) {
    try {
      return initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)

      if (message.includes('failed-precondition')) {
        if (import.meta.env.DEV) {
          console.warn('[Firebase] Multiple tabs detected, using shared instance')
        }
        return getFirestore(app)
      }

      if (message.includes('unimplemented')) {
        if (import.meta.env.DEV) {
          console.warn('[Firebase] IndexedDB not supported, falling back to memory-only cache')
        }
        return getFirestore(app)
      }

      if (import.meta.env.DEV) {
        console.warn('[Firebase] Firestore initialization issue, using default instance:', e)
      }
      return getFirestore(app)
    }
  }

  // Emulator mode: configure both long polling AND emulator host in one call
  // to avoid connectFirestoreEmulator overriding the settings
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: false,
      host: 'localhost:8080',
      ssl: false,
    })
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('[Firebase] Firestore already initialized, falling back to existing instance', e)
    }
    return getFirestore(app)
  }
}

export const db: Firestore = getFirestoreInstance()

let emulatorsConnected = false

/**
 * Connect to Firebase emulators in development mode.
 * Called automatically on module load when useEmulators is true.
 * Safe to call multiple times — uses flag to prevent double-connection.
 *
 * NOTE: Firestore emulator is configured directly in initializeFirestore
 * to preserve the experimentalForceLongPolling setting (CORS fix).
 */
function connectToEmulators(): void {
  if (emulatorsConnected) return
  if (!useEmulators) return

  try {
    connectAuthEmulator(auth, 'http://localhost:9099')
    emulatorsConnected = true

    if (import.meta.env.DEV) {
      console.log('[Firebase] Connected to emulators (Auth:9099) - Firestore configured separately')
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[Firebase] Emulator connection issue:', error)
    }
  }
}

connectToEmulators()
