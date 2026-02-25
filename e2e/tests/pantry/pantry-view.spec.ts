import { test, expect } from '../../fixtures/auth.js'
import type { Page } from '@playwright/test'

const RESULTS_DIR = 'test-results/pantry-view'
const DAY_MS = 86_400_000

// Pantry items to seed for Bob Cómodo — varied expiry states + prepared food
const SEED_ITEMS = [
  // Fresh (>3 days)
  { canonicalId: 'eggs', name: 'Huevos', quantity: 12, unit: 'units', expiryDays: 18, purchasedDays: -3 },
  { canonicalId: 'rice', name: 'Arroz', quantity: 2, unit: 'kg', expiryDays: 350, purchasedDays: -5 },
  { canonicalId: 'onion', name: 'Cebolla', quantity: 3, unit: 'units', expiryDays: 25, purchasedDays: -5 },
  { canonicalId: 'olive_oil', name: 'Aceite de oliva', quantity: 1, unit: 'lt', expiryDays: 180, purchasedDays: -30 },
  // Expiring soon (1-3 days)
  { canonicalId: 'chicken_breast', name: 'Pechuga de pollo', quantity: 0.5, unit: 'kg', expiryDays: 1, purchasedDays: -2 },
  { canonicalId: 'milk', name: 'Leche', quantity: 1, unit: 'lt', expiryDays: 2, purchasedDays: -5 },
  // Expired
  { canonicalId: 'ground_beef', name: 'Carne molida', quantity: 0.5, unit: 'kg', expiryDays: -1, purchasedDays: -3 },
  { canonicalId: 'avocado', name: 'Palta', quantity: 2, unit: 'units', expiryDays: -2, purchasedDays: -6 },
  // Prepared food
  { canonicalId: 'prepared_pizza_congelada', name: 'Pizza congelada', quantity: 1, unit: 'unidad', expiryDays: 85, purchasedDays: -5, type: 'prepared' as const },
]

async function waitForPantry(page: Page) {
  await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 20000 })
}

test.describe('Pantry view', () => {
  // Seed pantry data for Bob before all tests
  test.beforeAll(async () => {
    const { initializeApp, cert } = await import('firebase-admin/app')
    const { getAuth } = await import('firebase-admin/auth')
    const { getFirestore, Timestamp } = await import('firebase-admin/firestore')
    const { createRequire } = await import('module')
    const pathMod = await import('path')
    const { fileURLToPath } = await import('url')

    const __dir = pathMod.dirname(fileURLToPath(import.meta.url))
    const req = createRequire(import.meta.url)
    const saPath = pathMod.resolve(__dir, '../../../.keys/gastify/serviceAccountKey.staging.json')

    let app
    try {
      app = initializeApp({ credential: cert(req(saPath)) }, 'pantry-seed')
    } catch {
      const { getApp } = await import('firebase-admin/app')
      app = getApp('pantry-seed')
    }

    const auth = getAuth(app)
    const db = getFirestore(app)

    // Resolve Bob's UID
    const bob = await auth.getUserByEmail('bob@boletapp.test')
    const uid = bob.uid

    // Clear existing pantry
    const existing = await db.collection(`users/${uid}/pantry`).get()
    const deletes = existing.docs.map((d) => d.ref.delete())
    if (deletes.length > 0) await Promise.all(deletes)

    // Seed items
    const now = Date.now()
    const batch = db.batch()
    for (const item of SEED_ITEMS) {
      const docRef = db.collection(`users/${uid}/pantry`).doc(item.canonicalId)
      const data: Record<string, unknown> = {
        canonicalId: item.canonicalId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        purchasedAt: Timestamp.fromDate(new Date(now + item.purchasedDays * DAY_MS)),
        estimatedExpiry: Timestamp.fromDate(new Date(now + item.expiryDays * DAY_MS)),
        status: 'available',
      }
      if ('type' in item && item.type) data.type = item.type
      batch.set(docRef, data)
    }
    await batch.commit()
    console.log(`Seeded ${SEED_ITEMS.length} pantry items for Bob (${uid})`)

    // Also clear Diana's pantry to ensure empty state test works
    const diana = await auth.getUserByEmail('diana@boletapp.test')
    const dianaPantry = await db.collection(`users/${diana.uid}/pantry`).get()
    const dianaDeletes = dianaPantry.docs.map((d) => d.ref.delete())
    if (dianaDeletes.length > 0) await Promise.all(dianaDeletes)
    console.log(`Cleared Diana's pantry (${diana.uid})`)
  })

  test('displays pantry items with expiry badges', async ({ page, loginAs }) => {
    await loginAs('comodo')

    await page.getByRole('button', { name: 'Despensa' }).click()
    await waitForPantry(page)

    await page.screenshot({ path: `${RESULTS_DIR}/01-pantry-loaded.png`, fullPage: true })

    // Verify the Ingredientes section header
    await expect(page.getByText('Ingredientes')).toBeVisible()

    // Verify expiry badges are present — all three types
    await expect(page.getByText('Vencido').first()).toBeVisible()
    await expect(page.getByText('Por vencer').first()).toBeVisible()
    await expect(page.getByText('Fresco').first()).toBeVisible()

    // Verify some known item names
    await expect(page.getByText('Huevos')).toBeVisible()
    await expect(page.getByText('Pechuga de pollo')).toBeVisible()
    await expect(page.getByText('Carne molida')).toBeVisible()
  })

  test('shows prepared food in separate section', async ({ page, loginAs }) => {
    await loginAs('comodo')

    await page.getByRole('button', { name: 'Despensa' }).click()
    await waitForPantry(page)

    // Verify the Comidas preparadas section header
    await expect(page.getByText('Comidas preparadas')).toBeVisible()

    // Pizza congelada should be in the prepared section
    await expect(page.getByText('Pizza congelada')).toBeVisible()

    await page.screenshot({ path: `${RESULTS_DIR}/02-prepared-section.png`, fullPage: true })
  })

  test('category chips filter the ingredient list', async ({ page, loginAs }) => {
    await loginAs('comodo')

    await page.getByRole('button', { name: 'Despensa' }).click()
    await waitForPantry(page)

    // Count items before filtering
    const allCards = page.locator('.rounded-lg.border')
    const initialCount = await allCards.count()
    console.log('Initial item count:', initialCount)

    // Click a category chip (e.g., Proteínas)
    const proteinChip = page.getByRole('button', { name: /Proteínas/i })
    await expect(proteinChip).toBeVisible()
    await proteinChip.click()

    await page.screenshot({ path: `${RESULTS_DIR}/03-filtered-by-protein.png`, fullPage: true })

    // Should show fewer ingredient items
    // Protein items: chicken_breast, eggs, ground_beef = 3
    // Plus pizza congelada in prepared section = 4 total cards
    const filteredCount = await allCards.count()
    console.log('Filtered item count:', filteredCount)
    expect(filteredCount).toBeLessThan(initialCount)

    // Click the same chip again to deselect
    await proteinChip.click()
    const resetCount = await allCards.count()
    expect(resetCount).toBe(initialCount)
  })

  test('expiry dropdown filters both sections', async ({ page, loginAs }) => {
    await loginAs('comodo')

    await page.getByRole('button', { name: 'Despensa' }).click()
    await waitForPantry(page)

    const dropdownTrigger = page.locator('[data-testid="expiry-dropdown-trigger"]')
    const dropdownMenu = page.locator('div.shadow-lg')

    // Open expiry dropdown and select "Vencido"
    await dropdownTrigger.click()
    await expect(dropdownMenu).toBeVisible()
    await dropdownMenu.getByRole('button', { name: 'Vencido' }).click()

    await page.screenshot({ path: `${RESULTS_DIR}/04-filtered-by-expired.png`, fullPage: true })

    // Should only show expired items (Carne molida, Palta)
    await expect(page.getByText('Carne molida')).toBeVisible()
    await expect(page.getByText('Palta')).toBeVisible()

    // Fresh items should not be visible
    await expect(page.getByText('Arroz')).not.toBeVisible()
    await expect(page.getByText('Huevos')).not.toBeVisible()

    // Reset filter — open dropdown and select "Todos"
    await dropdownTrigger.click()
    await expect(dropdownMenu).toBeVisible()
    await dropdownMenu.getByRole('button', { name: 'Todos' }).click()

    // All items should be visible again
    await expect(page.getByText('Arroz')).toBeVisible()
  })

  test('empty state shows for user with no pantry data', async ({ page, loginAs, logout }) => {
    await loginAs('avanzado')

    await page.getByRole('button', { name: 'Despensa' }).click()
    await waitForPantry(page)

    await page.screenshot({ path: `${RESULTS_DIR}/05-empty-state.png`, fullPage: true })

    // Should show empty state
    await expect(page.getByText('Tu despensa está vacía')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ir a Mapear' })).toBeVisible()

    // Click CTA should navigate to MapItems
    await page.getByRole('button', { name: 'Ir a Mapear' }).click()
    await expect(page.getByText('Mapear Ingredientes')).toBeVisible({ timeout: 20000 })

    await page.screenshot({ path: `${RESULTS_DIR}/06-navigate-to-map.png`, fullPage: true })
  })
})
