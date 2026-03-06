import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { SEED_RECIPES } from './data/seed-recipes.js'
import { RecipeSchema } from '../src/types/recipe.js'
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

async function seedRecipes() {
  console.log('Seeding recipes into staging Firestore...\n')
  console.log(`Total seed recipes: ${SEED_RECIPES.length}\n`)

  // Check existing recipes for idempotency
  const existingSnapshot = await adminDb.collection('recipes').get()
  const existingIds = new Set(existingSnapshot.docs.map((doc) => doc.id))

  const newRecipes = SEED_RECIPES.filter((r) => !existingIds.has(r.id))
  const skippedCount = SEED_RECIPES.length - newRecipes.length

  if (skippedCount > 0) {
    console.log(`  Skipping ${skippedCount} already-existing recipes.`)
  }

  if (newRecipes.length === 0) {
    console.log('\nAll recipes already exist. Nothing to seed.')
    return
  }

  // Validate all recipes against Zod schema before writing
  const invalid: string[] = []
  for (const recipe of newRecipes) {
    const result = RecipeSchema.safeParse(recipe)
    if (!result.success) {
      invalid.push(`  "${recipe.name}" (${recipe.id}): ${result.error.message}`)
    }
  }
  if (invalid.length > 0) {
    console.error(`\nSchema validation failed for ${invalid.length} recipe(s):\n${invalid.join('\n')}`)
    process.exit(1)
  }

  console.log(`  Writing ${newRecipes.length} new recipes...\n`)

  const BATCH_SIZE = 500
  let batchCount = 0
  let batch = adminDb.batch()
  let inBatch = 0
  let errorCount = 0

  for (const recipe of newRecipes) {
    const docRef = adminDb.collection('recipes').doc(recipe.id)
    const { id: _id, ...docData } = recipe

    batch.set(docRef, {
      ...docData,
      createdAt: Timestamp.now(),
    })
    inBatch++

    if (inBatch >= BATCH_SIZE) {
      try {
        await batch.commit()
        batchCount++
        console.log(`  Batch ${batchCount} committed (${inBatch} docs)`)
      } catch (e) {
        errorCount += inBatch
        console.error(`  ERROR committing batch ${batchCount + 1} (${inBatch} docs):`, e)
      }
      batch = adminDb.batch()
      inBatch = 0
    }
  }

  if (inBatch > 0) {
    try {
      await batch.commit()
      batchCount++
      console.log(`  Batch ${batchCount} committed (${inBatch} docs)`)
    } catch (e) {
      errorCount += inBatch
      console.error(`  ERROR committing batch ${batchCount + 1} (${inBatch} docs):`, e)
    }
  }

  console.log(`\n--- Summary ---`)
  console.log(`Seeded: ${newRecipes.length - errorCount} new recipes`)
  console.log(`Skipped: ${skippedCount} existing recipes`)
  if (errorCount > 0) {
    console.log(`Errors: ${errorCount}`)
  }
  console.log(`Batches: ${batchCount}`)
}

seedRecipes()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
