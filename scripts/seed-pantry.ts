/**
 * Seeds pantry items for Bob Cómodo (test user) in staging Firestore.
 * Creates items with varied expiry states: fresh, expiring-soon, expired.
 * Usage: npx tsx scripts/seed-pantry.ts
 */
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
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

const adminAuth = getAuth(app)
const adminDb = getFirestore(app)

const DAY_MS = 86_400_000

// Items to seed with different expiry offsets (days from now)
// Positive = future (fresh/expiring), negative = past (expired)
const PANTRY_ITEMS = [
  // Fresh items (>3 days until expiry)
  { canonicalId: 'eggs', name: 'Huevos', quantity: 12, unit: 'units', expiryDays: 18, purchasedDays: -3 },
  { canonicalId: 'rice', name: 'Arroz', quantity: 2, unit: 'kg', expiryDays: 350, purchasedDays: -5 },
  { canonicalId: 'pasta', name: 'Pasta', quantity: 1, unit: 'kg', expiryDays: 300, purchasedDays: -10 },
  { canonicalId: 'onion', name: 'Cebolla', quantity: 3, unit: 'units', expiryDays: 25, purchasedDays: -5 },
  { canonicalId: 'garlic', name: 'Ajo', quantity: 1, unit: 'units', expiryDays: 20, purchasedDays: -10 },
  { canonicalId: 'olive_oil', name: 'Aceite de oliva', quantity: 1, unit: 'lt', expiryDays: 180, purchasedDays: -30 },
  { canonicalId: 'salt', name: 'Sal', quantity: 1, unit: 'kg', expiryDays: 700, purchasedDays: -60 },

  // Expiring soon (1-3 days until expiry)
  { canonicalId: 'chicken_breast', name: 'Pechuga de pollo', quantity: 0.5, unit: 'kg', expiryDays: 1, purchasedDays: -2 },
  { canonicalId: 'milk', name: 'Leche', quantity: 1, unit: 'lt', expiryDays: 2, purchasedDays: -5 },
  { canonicalId: 'tomato', name: 'Tomate', quantity: 4, unit: 'units', expiryDays: 3, purchasedDays: -4 },

  // Expired
  { canonicalId: 'ground_beef', name: 'Carne molida', quantity: 0.5, unit: 'kg', expiryDays: -1, purchasedDays: -3 },
  { canonicalId: 'avocado', name: 'Palta', quantity: 2, unit: 'units', expiryDays: -2, purchasedDays: -6 },

  // Prepared food item
  { canonicalId: 'prepared_pizza_congelada', name: 'Pizza congelada', quantity: 1, unit: 'unidad', expiryDays: 85, purchasedDays: -5, type: 'prepared' as const },
]

async function main() {
  // Resolve Bob's UID
  const bobEmail = 'bob@boletapp.test'
  let uid: string
  try {
    const userRecord = await adminAuth.getUserByEmail(bobEmail)
    uid = userRecord.uid
    console.log(`Found Bob Cómodo: ${uid} (${bobEmail})\n`)
  } catch (e: any) {
    console.error(`ERROR: User not found for ${bobEmail}. Run e2e:seed first.`)
    process.exit(1)
  }

  const now = Date.now()
  const batch = adminDb.batch()

  for (const item of PANTRY_ITEMS) {
    const docRef = adminDb.collection('users').doc(uid).collection('pantry').doc(item.canonicalId)
    const data: Record<string, unknown> = {
      canonicalId: item.canonicalId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      purchasedAt: Timestamp.fromDate(new Date(now + item.purchasedDays * DAY_MS)),
      estimatedExpiry: Timestamp.fromDate(new Date(now + item.expiryDays * DAY_MS)),
      status: 'available',
    }
    if (item.type) {
      data.type = item.type
    }
    batch.set(docRef, data, { merge: true })

    const statusLabel = item.expiryDays <= 0 ? 'EXPIRED' : item.expiryDays <= 3 ? 'EXPIRING' : 'FRESH'
    console.log(`  ${statusLabel.padEnd(8)} ${item.name} (${item.quantity} ${item.unit}, expires in ${item.expiryDays}d)`)
  }

  await batch.commit()
  console.log(`\nDone. ${PANTRY_ITEMS.length} pantry items seeded for Bob Cómodo (${uid}).`)
  process.exit(0)
}

main().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})
