import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { TEST_USERS, TEST_USER_PASSWORD, type TestUser } from '../fixtures/test-users.js'
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

async function seedUser(key: string, userData: TestUser) {
  // Look up existing Boletapp user by email
  let uid: string
  try {
    const userRecord = await adminAuth.getUserByEmail(userData.email)
    uid = userRecord.uid
    console.log(`  Found auth user ${uid} for ${userData.email}`)
  } catch (e: any) {
    if (e.code === 'auth/user-not-found') {
      console.error(`  ERROR: Auth user not found for ${userData.email}`)
      console.error(`  Run Boletapp's staging seed first: cd ../boletapp && npm run staging:seed`)
      return
    }
    throw e
  }

  // Set known password so dev test menu can use email/password login
  await adminAuth.updateUser(uid, {
    password: TEST_USER_PASSWORD,
    displayName: userData.displayName,
    photoURL: userData.photoURL,
  })
  console.log(`  Updated auth user ${uid} with Gustify display name and password`)

  // Write Gustify cooking profile to Firestore
  const docRef = adminDb.collection('users').doc(uid)
  const docData = {
    ...userData.firestoreDoc,
    profile: {
      ...userData.firestoreDoc.profile,
      createdAt: Timestamp.now(),
    },
  }
  await docRef.set(docData, { merge: true })
  console.log(`  Firestore doc users/${uid} written`)
}

async function main() {
  console.log('Seeding Gustify test users (using Boletapp staging accounts)...\n')

  for (const [key, userData] of Object.entries(TEST_USERS)) {
    console.log(`[${key}]`)
    await seedUser(key, userData)
    console.log()
  }

  console.log('Done. All test users seeded.')
  process.exit(0)
}

main().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})
