import { initializeApp, getApps } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
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

export const auth: Auth = getAuth(app)

function getFirestoreInstance(): Firestore {
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

    if (import.meta.env.DEV) {
      console.warn('[Firebase] Firestore initialization issue, using default instance:', e)
    }
    return getFirestore(app)
  }
}

export const db: Firestore = getFirestoreInstance()

// E2E testing bridge — expose auth helpers for Playwright's page.evaluate()
// Double-gated: DEV mode + VITE_E2E_MODE env var. Tree-shaken in production builds.
if (import.meta.env.DEV && import.meta.env.VITE_E2E_MODE === 'true') {
  import('firebase/auth').then(({ signInWithCustomToken, signOut }) => {
    ;(window as any).__GUSTIFY_AUTH__ = auth
    ;(window as any).__GUSTIFY_SIGN_IN__ = (token: string) =>
      signInWithCustomToken(auth, token)
    ;(window as any).__GUSTIFY_SIGN_OUT__ = () => signOut(auth)
  })
}
