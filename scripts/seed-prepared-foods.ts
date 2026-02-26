import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { CANONICAL_PREPARED_FOODS } from './data/canonical-prepared-foods.js'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const serviceAccountPath = path.resolve(__dirname, '../.keys/gastify/serviceAccountKey.staging.json')
const serviceAccount = require(serviceAccountPath)

const app = initializeApp({
  credential: cert(serviceAccount),
})

const adminDb = getFirestore(app)

async function seedPreparedFoods() {
  console.log('Seeding canonical prepared foods into staging Firestore...\n')
  console.log(`Total prepared foods: ${CANONICAL_PREPARED_FOODS.length}\n`)

  const BATCH_SIZE = 500
  let batchCount = 0
  let batch = adminDb.batch()
  let inBatch = 0

  for (const food of CANONICAL_PREPARED_FOODS) {
    const docRef = adminDb.collection('canonicalPreparedFoods').doc(food.id)

    // Omit id from document body — document ID is the id
    const { id: _id, ...docData } = food

    batch.set(docRef, docData, { merge: true })
    inBatch++

    if (inBatch >= BATCH_SIZE) {
      await batch.commit()
      batchCount++
      console.log(`  Batch ${batchCount} committed (${inBatch} docs)`)
      batch = adminDb.batch()
      inBatch = 0
    }
  }

  if (inBatch > 0) {
    await batch.commit()
    batchCount++
    console.log(`  Batch ${batchCount} committed (${inBatch} docs)`)
  }

  console.log(`\nDone. ${CANONICAL_PREPARED_FOODS.length} canonical prepared foods seeded in ${batchCount} batch(es).`)
}

seedPreparedFoods()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
