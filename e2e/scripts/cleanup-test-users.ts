import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { TEST_USERS } from '../fixtures/test-users.js'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const serviceAccountPath = path.resolve(__dirname, '../../.keys/gastify/serviceAccountKey.staging.json')
const serviceAccount = require(serviceAccountPath)

const app = initializeApp({
  credential: cert(serviceAccount),
})

const adminAuth = getAuth(app)
const adminDb = getFirestore(app)

async function cleanupUser(key: string, email: string) {
  // Look up UID by email
  let uid: string
  try {
    const userRecord = await adminAuth.getUserByEmail(email)
    uid = userRecord.uid
    console.log(`  Found auth user ${uid} for ${email}`)
  } catch (e: any) {
    if (e.code === 'auth/user-not-found') {
      console.log(`  Auth user for ${email} not found, skipping`)
      return
    }
    throw e
  }

  // Only delete Gustify Firestore doc — do NOT delete Auth user (shared with Boletapp)
  try {
    await adminDb.collection('users').doc(uid).delete()
    console.log(`  Firestore doc users/${uid} deleted`)
  } catch (e) {
    console.log(`  Firestore doc users/${uid} delete failed:`, e)
  }

  console.log(`  Auth user preserved (shared with Boletapp)`)
}

async function main() {
  console.log('Cleaning up Gustify test user data from staging Firebase...\n')

  for (const [key, userData] of Object.entries(TEST_USERS)) {
    console.log(`[${key}]`)
    await cleanupUser(key, userData.email)
    console.log()
  }

  console.log('Done. Gustify Firestore docs removed, Auth users preserved.')
  process.exit(0)
}

main().catch((e) => {
  console.error('Cleanup failed:', e)
  process.exit(1)
})
