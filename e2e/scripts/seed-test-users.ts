import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { TEST_USERS, type TestUser } from '../fixtures/test-users.js'
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
  try {
    await adminAuth.getUser(userData.uid)
    console.log(`  Auth user ${userData.uid} already exists, updating...`)
    await adminAuth.updateUser(userData.uid, {
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
    })
  } catch (e: any) {
    if (e.code === 'auth/user-not-found') {
      console.log(`  Creating auth user ${userData.uid}...`)
      await adminAuth.createUser({
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
      })
    } else {
      throw e
    }
  }

  const docRef = adminDb.collection('users').doc(userData.uid)
  const docData = {
    ...userData.firestoreDoc,
    profile: {
      ...userData.firestoreDoc.profile,
      createdAt: Timestamp.now(),
    },
  }
  await docRef.set(docData, { merge: true })
  console.log(`  Firestore doc users/${userData.uid} written`)
}

async function main() {
  console.log('Seeding test users into staging Firebase...\n')

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
