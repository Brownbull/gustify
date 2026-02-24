import { test as base, type Page } from '@playwright/test'
import { initializeApp, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { TEST_USERS, type TestUserKey } from './test-users.js'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Singleton admin app — initialized once per test worker
let adminApp: App | null = null
let adminAuth: Auth | null = null

function getAdminAuth(): Auth {
  if (!adminAuth) {
    const serviceAccountPath = path.resolve(
      __dirname,
      '../../.keys/gastify/serviceAccountKey.staging.json',
    )
    adminApp = initializeApp(
      { credential: cert(require(serviceAccountPath)) },
      'e2e-test-runner',
    )
    adminAuth = getAuth(adminApp)
  }
  return adminAuth
}

async function loginAsTestUser(page: Page, userKey: TestUserKey): Promise<void> {
  const user = TEST_USERS[userKey]
  const auth = getAdminAuth()

  // Generate custom token for this test user
  const customToken = await auth.createCustomToken(user.uid)

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

// Extended Playwright fixture with auth helpers
export const test = base.extend<{
  loginAs: (userKey: TestUserKey) => Promise<void>
  logout: () => Promise<void>
}>({
  loginAs: async ({ page }, use) => {
    await use((userKey: TestUserKey) => loginAsTestUser(page, userKey))
  },
  logout: async ({ page }, use) => {
    await use(() => logoutUser(page))
  },
})

export { expect } from '@playwright/test'
