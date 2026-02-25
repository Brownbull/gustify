import { test as base, type Page } from '@playwright/test'
import { initializeApp, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { TEST_USERS, type TestUserKey } from './test-users.js'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Singleton admin app — initialized once per test worker
let adminApp: App | null = null
let adminAuth: Auth | null = null
let adminDb: Firestore | null = null

function getAdminApp(): App {
  if (!adminApp) {
    const serviceAccountPath = path.resolve(
      __dirname,
      '../../.keys/gastify/serviceAccountKey.staging.json',
    )
    adminApp = initializeApp(
      { credential: cert(require(serviceAccountPath)) },
      'e2e-test-runner',
    )
  }
  return adminApp
}

function getAdminAuth(): Auth {
  if (!adminAuth) {
    adminAuth = getAuth(getAdminApp())
  }
  return adminAuth
}

function getAdminDb(): Firestore {
  if (!adminDb) {
    adminDb = getFirestore(getAdminApp())
  }
  return adminDb
}

// Cache resolved UIDs per worker to avoid repeated lookups
const uidCache = new Map<TestUserKey, string>()

async function resolveUid(auth: Auth, userKey: TestUserKey): Promise<string> {
  const cached = uidCache.get(userKey)
  if (cached) return cached

  const user = TEST_USERS[userKey]
  const userRecord = await auth.getUserByEmail(user.email)
  uidCache.set(userKey, userRecord.uid)
  return userRecord.uid
}

async function loginAsTestUser(page: Page, userKey: TestUserKey): Promise<void> {
  const auth = getAdminAuth()
  const uid = await resolveUid(auth, userKey)

  // Generate custom token for this test user
  const customToken = await auth.createCustomToken(uid)

  // Navigate to the app (loads Firebase JS SDK)
  await page.goto('/')

  // Wait for the E2E bridge to be ready
  await page.waitForFunction(
    () => typeof (window as any).__GUSTIFY_SIGN_IN__ === 'function',
    { timeout: 15000 },
  )

  // Sign in with the custom token via the bridge
  await page.evaluate(
    (token: string) => (window as any).__GUSTIFY_SIGN_IN__(token),
    customToken,
  )

  // Wait for auth state to propagate through Zustand → ProtectedRoute → UserHeader
  await page.waitForSelector('button:has-text("Salir")', { timeout: 15000 })
}

async function logoutUser(page: Page): Promise<void> {
  await page.evaluate(() => (window as any).__GUSTIFY_SIGN_OUT__())

  // Wait for login page to appear
  await page.waitForSelector('text=Iniciar sesión con Google', { timeout: 10000 })
}

/**
 * Deletes all item mappings and pantry entries created by test users.
 * Ensures E2E mapping tests start from a clean state across runs.
 */
async function cleanupTestUserData(): Promise<void> {
  const auth = getAdminAuth()
  const db = getAdminDb()

  // Resolve all test user UIDs
  const uids: string[] = []
  for (const key of Object.keys(TEST_USERS) as TestUserKey[]) {
    const uid = await resolveUid(auth, key)
    uids.push(uid)
  }

  // Delete item mappings created by test users
  const mappingsSnapshot = await db.collection('itemMappings').get()
  const mappingDeletes: Promise<FirebaseFirestore.WriteResult>[] = []
  for (const doc of mappingsSnapshot.docs) {
    const data = doc.data()
    if (uids.includes(data.createdBy)) {
      mappingDeletes.push(doc.ref.delete())
    }
  }
  if (mappingDeletes.length > 0) {
    await Promise.all(mappingDeletes)
    console.log(`  Cleaned up ${mappingDeletes.length} item mapping(s)`)
  }

  // Delete pantry entries for test users
  for (const uid of uids) {
    const pantrySnapshot = await db.collection(`users/${uid}/pantry`).get()
    const pantryDeletes = pantrySnapshot.docs.map((d) => d.ref.delete())
    if (pantryDeletes.length > 0) {
      await Promise.all(pantryDeletes)
      console.log(`  Cleaned up ${pantryDeletes.length} pantry item(s) for ${uid}`)
    }
  }
}

// Extended Playwright fixture with auth helpers
export const test = base.extend<{
  loginAs: (userKey: TestUserKey) => Promise<void>
  logout: () => Promise<void>
  cleanupTestData: () => Promise<void>
}>({
  loginAs: async ({ page }, use) => {
    await use((userKey: TestUserKey) => loginAsTestUser(page, userKey))
  },
  logout: async ({ page }, use) => {
    await use(() => logoutUser(page))
  },
  cleanupTestData: async ({}, use) => {
    await use(() => cleanupTestUserData())
  },
})

export { expect } from '@playwright/test'
