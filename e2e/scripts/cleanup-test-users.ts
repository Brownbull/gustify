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

async function deleteUser(key: string, uid: string) {
  try {
    await adminAuth.deleteUser(uid)
    console.log(`  Auth user ${uid} deleted`)
  } catch (e: any) {
    if (e.code === 'auth/user-not-found') {
      console.log(`  Auth user ${uid} not found, skipping`)
    } else {
      throw e
    }
  }

  try {
    await adminDb.collection('users').doc(uid).delete()
    console.log(`  Firestore doc users/${uid} deleted`)
  } catch (e) {
    console.log(`  Firestore doc users/${uid} delete failed:`, e)
  }
}

async function main() {
  console.log('Cleaning up test users from staging Firebase...\n')

  for (const [key, userData] of Object.entries(TEST_USERS)) {
    console.log(`[${key}]`)
    await deleteUser(key, userData.uid)
    console.log()
  }

  console.log('Done. All test users cleaned up.')
  process.exit(0)
}

main().catch((e) => {
  console.error('Cleanup failed:', e)
  process.exit(1)
})
