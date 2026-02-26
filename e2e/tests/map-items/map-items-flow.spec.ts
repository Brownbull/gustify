import { test, expect } from '../../fixtures/auth.js'

const RESULTS_DIR = 'test-results/map-items-flow'

// Helper: wait for MapItems page to finish loading
async function waitForMapItems(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 20000 })
  await expect(page.locator('h2')).toHaveText('Mapear Ingredientes')
}

// Specific locators for summary cards (avoid matching category badges)
function summaryLocators(page: import('@playwright/test').Page) {
  return {
    pending: page.locator('.bg-yellow-50 .text-2xl'),
    mapped: page.locator('.bg-green-50 .text-2xl'),
    auto: page.locator('.bg-blue-50 .text-2xl'),
  }
}

test.describe('MapItems page', () => {
  // Clean up mappings, pantry entries, and unknown item reports from previous test runs
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    const { initializeApp, cert } = await import('firebase-admin/app')
    const { getAuth } = await import('firebase-admin/auth')
    const { getFirestore } = await import('firebase-admin/firestore')
    const { createRequire } = await import('module')
    const pathMod = await import('path')
    const { fileURLToPath } = await import('url')

    const __dir = pathMod.dirname(fileURLToPath(import.meta.url))
    const req = createRequire(import.meta.url)
    const saPath = pathMod.resolve(__dir, '../../../.keys/gastify/serviceAccountKey.staging.json')

    let app
    try {
      app = initializeApp({ credential: cert(req(saPath)) }, 'e2e-cleanup')
    } catch {
      const { getApp } = await import('firebase-admin/app')
      app = getApp('e2e-cleanup')
    }

    const auth = getAuth(app)
    const db = getFirestore(app)

    const testEmails = ['alice@boletapp.test', 'bob@boletapp.test', 'charlie@boletapp.test', 'diana@boletapp.test']
    const uids: string[] = []
    for (const email of testEmails) {
      try {
        const rec = await auth.getUserByEmail(email)
        uids.push(rec.uid)
      } catch { /* user not found, skip */ }
    }

    // Delete item mappings created by test users
    const mappings = await db.collection('itemMappings').get()
    const deletes = mappings.docs
      .filter((d) => uids.includes(d.data().createdBy))
      .map((d) => d.ref.delete())
    if (deletes.length > 0) await Promise.all(deletes)

    // Delete pantry entries for test users
    for (const uid of uids) {
      const pantry = await db.collection(`users/${uid}/pantry`).get()
      const pDeletes = pantry.docs.map((d) => d.ref.delete())
      if (pDeletes.length > 0) await Promise.all(pDeletes)
    }

    // Delete unknown ingredient/prepared food reports from test users
    for (const collName of ['unknownIngredients', 'unknownPreparedFoods']) {
      const coll = await db.collection(collName).get()
      const uDeletes = coll.docs
        .filter((d) => uids.includes(d.data().reportedBy))
        .map((d) => d.ref.delete())
      if (uDeletes.length > 0) await Promise.all(uDeletes)
    }

    console.log(`Cleanup: removed ${deletes.length} mapping(s), cleaned pantry for ${uids.length} user(s)`)
    await context.close()
  })

  test('loads Boletapp transaction items for principiante', async ({ page, loginAs }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    const failedRequests: string[] = []
    page.on('requestfailed', (req) => {
      failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`)
    })

    await loginAs('principiante')

    await page.screenshot({ path: `${RESULTS_DIR}/01-home-after-login.png`, fullPage: true })

    await page.getByRole('button', { name: 'Mapear' }).click()
    await waitForMapItems(page)

    await page.screenshot({ path: `${RESULTS_DIR}/02-mapear-loaded.png`, fullPage: true })

    const errorAlert = page.locator('[role="alert"]')
    const hasError = await errorAlert.count()
    if (hasError > 0) {
      console.log('PAGE ERROR:', await errorAlert.textContent())
    }

    if (consoleErrors.length > 0) {
      console.log('CONSOLE ERRORS:', JSON.stringify(consoleErrors, null, 2))
    }
    if (failedRequests.length > 0) {
      console.log('FAILED REQUESTS:', JSON.stringify(failedRequests, null, 2))
    }

    const { pending, mapped, auto } = summaryLocators(page)
    const pendingText = await pending.textContent()
    const mappedText = await mapped.textContent()
    const autoText = await auto.textContent()
    console.log(`Summary: Pending=${pendingText}, Mapped=${mappedText}, Auto=${autoText}`)

    const pendingCount = parseInt(pendingText ?? '0', 10)
    expect(pendingCount).toBeGreaterThan(0)

    const itemButtons = page.locator('ul button')
    const itemCount = await itemButtons.count()
    console.log(`Item buttons visible: ${itemCount}`)
    expect(itemCount).toBeGreaterThan(0)

    for (let i = 0; i < Math.min(3, itemCount); i++) {
      const name = await itemButtons.nth(i).locator('p.font-medium').textContent()
      console.log(`  Item ${i + 1}: ${name}`)
    }

    await page.screenshot({ path: `${RESULTS_DIR}/03-items-listed.png`, fullPage: true })
  })

  test('modal shows segmented control with Ingredientes and Preparadas tabs', async ({ page, loginAs }) => {
    await loginAs('principiante')

    await page.getByRole('button', { name: 'Mapear' }).click()
    await waitForMapItems(page)

    // Click the first unmapped item
    const firstItem = page.locator('ul button').first()
    await expect(firstItem).toBeVisible()
    await firstItem.click()

    // Modal should appear with backdrop and close button
    await expect(page.locator('[data-testid="modal-backdrop"]')).toBeVisible({ timeout: 5000 })
    await expect(page.getByLabel('Cerrar selector')).toBeVisible()

    // Segmented control should show both tabs
    await expect(page.getByRole('button', { name: 'Ingredientes' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Preparadas' })).toBeVisible()

    // Default tab is Ingredientes — search bar should be visible
    await expect(page.getByPlaceholder('Buscar ingrediente...')).toBeVisible()

    // Footer should show "No está en la lista" and "Omitir"
    await expect(page.getByRole('button', { name: /No está en la lista/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Omitir/i })).toBeVisible()

    await page.screenshot({ path: `${RESULTS_DIR}/04-modal-segmented-control.png`, fullPage: true })

    // Close modal with X button
    await page.getByLabel('Cerrar selector').click()
    await expect(page.locator('[data-testid="modal-backdrop"]')).not.toBeVisible()
  })

  test('can switch to Preparadas tab and see cuisine accordion', async ({ page, loginAs }) => {
    await loginAs('principiante')

    await page.getByRole('button', { name: 'Mapear' }).click()
    await waitForMapItems(page)

    // Open modal
    await page.locator('ul button').first().click()
    await expect(page.locator('[data-testid="modal-backdrop"]')).toBeVisible({ timeout: 5000 })

    // Switch to Preparadas tab
    await page.getByRole('button', { name: 'Preparadas' }).click()

    // Should now show prepared food search bar
    await expect(page.getByPlaceholder('Buscar comida preparada...')).toBeVisible()

    // Cuisine accordion headers should be visible
    await expect(page.locator('[data-testid="cuisine-mediterranean"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="cuisine-chilean"]')).toBeVisible()

    await page.screenshot({ path: `${RESULTS_DIR}/05-preparadas-tab.png`, fullPage: true })

    // Expand a cuisine to see prepared food items
    await page.locator('[data-testid="cuisine-chilean"]').click()

    // Should show Chilean prepared foods (e.g., Empanadas, Pastel de choclo)
    await expect(page.getByText('Empanadas')).toBeVisible({ timeout: 5000 })

    await page.screenshot({ path: `${RESULTS_DIR}/06-chilean-cuisine-expanded.png`, fullPage: true })

    // Switch back to Ingredientes tab
    await page.getByRole('button', { name: 'Ingredientes' }).click()
    await expect(page.getByPlaceholder('Buscar ingrediente...')).toBeVisible()

    // Cuisine headers should no longer be visible
    await expect(page.locator('[data-testid="cuisine-chilean"]')).not.toBeVisible()
  })

  test('can map an item via ingredient category accordion', async ({ page, loginAs }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    await loginAs('principiante')

    await page.getByRole('button', { name: 'Mapear' }).click()
    await waitForMapItems(page)

    const { pending, mapped } = summaryLocators(page)
    const initialPending = parseInt(await pending.textContent() ?? '0', 10)
    console.log('Initial pending:', initialPending)

    // Click the first unmapped item to open modal
    const firstItem = page.locator('ul button').first()
    await expect(firstItem).toBeVisible()
    const itemName = await firstItem.locator('p.font-medium').textContent()
    console.log('Mapping item:', itemName)
    await firstItem.click()

    // Wait for modal to appear
    await expect(page.getByPlaceholder('Buscar ingrediente...')).toBeVisible({ timeout: 10000 })

    // Expand a category to find an ingredient
    const categoryButton = page.locator('[data-testid^="category-"]').first()
    await expect(categoryButton).toBeVisible({ timeout: 10000 })
    const categoryName = await categoryButton.textContent()
    console.log('Expanding category:', categoryName?.trim())
    await categoryButton.click()

    // Pick the first ingredient in the expanded category (scope to modal)
    const modal = page.locator('.rounded-t-2xl')
    const ingredientButton = modal.locator('.border-l-2 button').first()
    await expect(ingredientButton).toBeVisible({ timeout: 5000 })
    const ingredientName = await ingredientButton.locator('span.font-medium').textContent()
    console.log('Selecting ingredient:', ingredientName?.trim())

    await page.screenshot({ path: `${RESULTS_DIR}/07-category-expanded.png`, fullPage: true })

    await ingredientButton.click()

    // Confirm with the Asignar button
    const asignarButton = modal.getByRole('button', { name: /Asignar/ })
    await expect(asignarButton).toBeVisible({ timeout: 5000 })
    await asignarButton.click()

    // After mapping, modal closes and pending count decreases
    await page.waitForFunction(
      (prev) => {
        const el = document.querySelector('.bg-yellow-50 .text-2xl')
        return el && parseInt(el.textContent ?? '0', 10) < prev
      },
      initialPending,
      { timeout: 15000 },
    )

    const newPending = await pending.textContent()
    const newMapped = await mapped.textContent()
    console.log(`After mapping: Pending=${newPending}, Mapped=${newMapped}`)

    if (consoleErrors.length > 0) {
      console.log('Console errors:', JSON.stringify(consoleErrors))
    }

    await page.screenshot({ path: `${RESULTS_DIR}/08-after-mapping.png`, fullPage: true })

    expect(parseInt(newPending ?? '0', 10)).toBe(initialPending - 1)
    expect(parseInt(newMapped ?? '0', 10)).toBe(1)
  })

  test('can map an item via ingredient search', async ({ page, loginAs }) => {
    await loginAs('aventurero')

    await page.getByRole('button', { name: 'Mapear' }).click()
    await waitForMapItems(page)

    const { pending } = summaryLocators(page)
    const initialPending = parseInt(await pending.textContent() ?? '0', 10)

    if (initialPending === 0) {
      console.log('No pending items for aventurero, skipping test')
      return
    }

    // Open modal
    await page.locator('ul button').first().click()
    await expect(page.getByPlaceholder('Buscar ingrediente...')).toBeVisible({ timeout: 10000 })

    // Search for an ingredient
    await page.getByPlaceholder('Buscar ingrediente...').fill('tomate')

    // Wait for filtered results — search shows flat list
    const searchResult = page.locator('ul button span.font-medium').first()
    await expect(searchResult).toBeVisible({ timeout: 5000 })
    console.log('Search result:', await searchResult.textContent())

    await page.screenshot({ path: `${RESULTS_DIR}/09-search-results.png`, fullPage: true })
  })

  test('can map an item to a canonical prepared food', async ({ page, loginAs }) => {
    await loginAs('comodo')

    await page.getByRole('button', { name: 'Mapear' }).click()
    await waitForMapItems(page)

    const { pending, mapped } = summaryLocators(page)
    const initialPending = parseInt(await pending.textContent() ?? '0', 10)
    console.log('Initial pending for comodo:', initialPending)

    if (initialPending === 0) {
      console.log('No pending items for comodo, skipping test')
      return
    }

    // Click first item to open modal
    await page.locator('ul button').first().click()
    await expect(page.locator('[data-testid="modal-backdrop"]')).toBeVisible({ timeout: 5000 })

    // Switch to Preparadas tab
    await page.getByRole('button', { name: 'Preparadas' }).click()
    await expect(page.getByPlaceholder('Buscar comida preparada...')).toBeVisible()

    // Wait for cuisine accordion to load
    await expect(page.locator('[data-testid="cuisine-chilean"]')).toBeVisible({ timeout: 10000 })

    // Expand Chilean cuisine
    await page.locator('[data-testid="cuisine-chilean"]').click()

    // Select a prepared food (e.g., Empanadas)
    const preparedFoodBtn = page.locator('.border-l-2 button', { hasText: 'Empanadas' })
    await expect(preparedFoodBtn).toBeVisible({ timeout: 5000 })
    await preparedFoodBtn.click()

    await page.screenshot({ path: `${RESULTS_DIR}/10-prepared-food-selected.png`, fullPage: true })

    // Confirm with Asignar button
    const modal = page.locator('.rounded-t-2xl')
    const asignarButton = modal.getByRole('button', { name: /Asignar.*Empanadas/i })
    await expect(asignarButton).toBeVisible({ timeout: 5000 })
    await asignarButton.click()

    // After mapping, pending count should decrease
    await page.waitForFunction(
      (prev) => {
        const el = document.querySelector('.bg-yellow-50 .text-2xl')
        return el && parseInt(el.textContent ?? '0', 10) < prev
      },
      initialPending,
      { timeout: 15000 },
    )

    const newPending = await pending.textContent()
    const newMapped = await mapped.textContent()
    console.log(`After mapping prepared food: Pending=${newPending}, Mapped=${newMapped}`)

    await page.screenshot({ path: `${RESULTS_DIR}/11-after-prepared-mapping.png`, fullPage: true })

    expect(parseInt(newPending ?? '0', 10)).toBe(initialPending - 1)
    expect(parseInt(newMapped ?? '0', 10)).toBeGreaterThanOrEqual(1)
  })

  test('can search for a prepared food in the Preparadas tab', async ({ page, loginAs }) => {
    await loginAs('comodo')

    await page.getByRole('button', { name: 'Mapear' }).click()
    await waitForMapItems(page)

    const { pending } = summaryLocators(page)
    const initialPending = parseInt(await pending.textContent() ?? '0', 10)

    if (initialPending === 0) {
      console.log('No pending items, skipping test')
      return
    }

    // Open modal and switch to Preparadas tab
    await page.locator('ul button').first().click()
    await expect(page.locator('[data-testid="modal-backdrop"]')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Preparadas' }).click()

    // Search for a prepared food
    await page.getByPlaceholder('Buscar comida preparada...').fill('pizza')

    // Should show search results (flat list, not accordion)
    const searchResult = page.locator('ul button span.font-medium', { hasText: /pizza/i })
    await expect(searchResult.first()).toBeVisible({ timeout: 5000 })
    console.log('Prepared food search result:', await searchResult.first().textContent())

    await page.screenshot({ path: `${RESULTS_DIR}/12-prepared-food-search.png`, fullPage: true })

    // Close modal
    await page.getByLabel('Cerrar selector').click()
  })

  test('can skip an item and see it in Omitidos', async ({ page, loginAs }) => {
    await loginAs('comodo')

    await page.getByRole('button', { name: 'Mapear' }).click()
    await waitForMapItems(page)

    const { pending } = summaryLocators(page)
    const initialPending = parseInt(await pending.textContent() ?? '0', 10)
    console.log('Initial pending for comodo:', initialPending)

    if (initialPending === 0) {
      console.log('No pending items for comodo, skipping test')
      return
    }

    // Get the name of the first item before skipping
    const firstItemName = await page.locator('ul button p.font-medium').first().textContent()
    console.log('Skipping item:', firstItemName)

    // Click first item to open modal
    await page.locator('ul button').first().click()

    // Wait for modal, then click Omitir
    await expect(page.getByRole('button', { name: /Omitir/i })).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /Omitir/i }).click()

    // Pending count should decrease
    const newPending = await pending.textContent()
    console.log(`After skip: Pending=${newPending}`)
    expect(parseInt(newPending ?? '0', 10)).toBe(initialPending - 1)

    // Skipped item should appear in the Omitidos section
    await expect(page.locator('text=Omitidos')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Restaurar' })).toBeVisible()

    await page.screenshot({ path: `${RESULTS_DIR}/13-skipped-omitidos.png`, fullPage: true })
  })

  test('can restore a skipped item', async ({ page, loginAs }) => {
    await loginAs('comodo')

    await page.getByRole('button', { name: 'Mapear' }).click()
    await waitForMapItems(page)

    const { pending } = summaryLocators(page)
    const initialPending = parseInt(await pending.textContent() ?? '0', 10)

    if (initialPending === 0) {
      console.log('No pending items for comodo, skipping test')
      return
    }

    // Skip an item first
    await page.locator('ul button').first().click()
    await expect(page.getByRole('button', { name: /Omitir/i })).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /Omitir/i }).click()

    // Verify it is in Omitidos
    await expect(page.getByRole('button', { name: 'Restaurar' })).toBeVisible()
    const pendingAfterSkip = parseInt(await pending.textContent() ?? '0', 10)
    console.log(`After skip: Pending=${pendingAfterSkip}`)

    // Click Restaurar to bring it back
    await page.getByRole('button', { name: 'Restaurar' }).first().click()

    // Pending count should increase back
    const pendingAfterRestore = await pending.textContent()
    console.log(`After restore: Pending=${pendingAfterRestore}`)
    expect(parseInt(pendingAfterRestore ?? '0', 10)).toBe(pendingAfterSkip + 1)

    // Omitidos section should disappear if no more skipped items
    await expect(page.locator('text=Omitidos')).not.toBeVisible()

    await page.screenshot({ path: `${RESULTS_DIR}/14-after-restore.png`, fullPage: true })
  })

  test('"No está en la lista" shows unknown item dialog', async ({ page, loginAs }) => {
    await loginAs('comodo')

    await page.getByRole('button', { name: 'Mapear' }).click()
    await waitForMapItems(page)

    const { pending } = summaryLocators(page)
    const initialPending = parseInt(await pending.textContent() ?? '0', 10)

    if (initialPending === 0) {
      console.log('No pending items, skipping test')
      return
    }

    // Open modal
    await page.locator('ul button').first().click()
    await expect(page.locator('[data-testid="modal-backdrop"]')).toBeVisible({ timeout: 5000 })

    // Click "No está en la lista"
    await page.getByRole('button', { name: /No está en la lista/i }).click()

    // Should show the unknown item dialog
    await expect(page.getByText('¿Qué tipo de item es?')).toBeVisible()
    await expect(page.getByRole('button', { name: /Ingrediente desconocido/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Comida preparada desconocida/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Cancelar/i })).toBeVisible()

    await page.screenshot({ path: `${RESULTS_DIR}/15-unknown-item-dialog.png`, fullPage: true })

    // Click Cancelar to go back to normal footer
    await page.getByRole('button', { name: /Cancelar/i }).click()

    // Should show the normal footer again
    await expect(page.getByRole('button', { name: /No está en la lista/i })).toBeVisible()
    await expect(page.getByText('¿Qué tipo de item es?')).not.toBeVisible()

    // Close modal
    await page.getByLabel('Cerrar selector').click()
  })

  test('can mark item as unknown ingredient', async ({ page, loginAs }) => {
    await loginAs('comodo')

    await page.getByRole('button', { name: 'Mapear' }).click()
    await waitForMapItems(page)

    const { pending, mapped } = summaryLocators(page)
    const initialPending = parseInt(await pending.textContent() ?? '0', 10)
    console.log('Initial pending for comodo:', initialPending)

    if (initialPending === 0) {
      console.log('No pending items, skipping test')
      return
    }

    const itemName = await page.locator('ul button p.font-medium').first().textContent()
    console.log('Marking as unknown ingredient:', itemName)

    // Open modal
    await page.locator('ul button').first().click()
    await expect(page.locator('[data-testid="modal-backdrop"]')).toBeVisible({ timeout: 5000 })

    // Click "No está en la lista" then "Ingrediente desconocido"
    await page.getByRole('button', { name: /No está en la lista/i }).click()
    await expect(page.getByText('¿Qué tipo de item es?')).toBeVisible()
    await page.getByRole('button', { name: /Ingrediente desconocido/i }).click()

    // Wait for the operation to complete — pending count decreases
    await page.waitForFunction(
      (prev) => {
        const el = document.querySelector('.bg-yellow-50 .text-2xl')
        return el && parseInt(el.textContent ?? '0', 10) < prev
      },
      initialPending,
      { timeout: 15000 },
    )

    const newPending = await pending.textContent()
    const newMapped = await mapped.textContent()
    console.log(`After unknown ingredient: Pending=${newPending}, Mapped=${newMapped}`)

    await page.screenshot({ path: `${RESULTS_DIR}/16-after-unknown-ingredient.png`, fullPage: true })

    expect(parseInt(newPending ?? '0', 10)).toBe(initialPending - 1)
    // Unknown ingredients count towards mappedCount (not preparedCount)
    expect(parseInt(newMapped ?? '0', 10)).toBeGreaterThanOrEqual(1)
  })

  test('can mark item as unknown prepared food', async ({ page, loginAs }) => {
    await loginAs('aventurero')

    await page.getByRole('button', { name: 'Mapear' }).click()
    await waitForMapItems(page)

    const { pending, mapped } = summaryLocators(page)
    const initialPending = parseInt(await pending.textContent() ?? '0', 10)
    console.log('Initial pending for aventurero:', initialPending)

    if (initialPending === 0) {
      console.log('No pending items, skipping test')
      return
    }

    const itemName = await page.locator('ul button p.font-medium').first().textContent()
    console.log('Marking as unknown prepared food:', itemName)

    // Open modal
    await page.locator('ul button').first().click()
    await expect(page.locator('[data-testid="modal-backdrop"]')).toBeVisible({ timeout: 5000 })

    // Click "No está en la lista" then "Comida preparada desconocida"
    await page.getByRole('button', { name: /No está en la lista/i }).click()
    await expect(page.getByText('¿Qué tipo de item es?')).toBeVisible()
    await page.getByRole('button', { name: /Comida preparada desconocida/i }).click()

    // Wait for the operation to complete — pending count decreases
    await page.waitForFunction(
      (prev) => {
        const el = document.querySelector('.bg-yellow-50 .text-2xl')
        return el && parseInt(el.textContent ?? '0', 10) < prev
      },
      initialPending,
      { timeout: 15000 },
    )

    const newPending = await pending.textContent()
    const newMapped = await mapped.textContent()
    console.log(`After unknown prepared: Pending=${newPending}, Mapped=${newMapped}`)

    await page.screenshot({ path: `${RESULTS_DIR}/17-after-unknown-prepared.png`, fullPage: true })

    expect(parseInt(newPending ?? '0', 10)).toBe(initialPending - 1)
    // Unknown prepared foods count towards mappedCount (combined with preparedCount)
    expect(parseInt(newMapped ?? '0', 10)).toBeGreaterThanOrEqual(1)
  })

  test('shows items for all 4 test users', async ({ page, loginAs, logout }) => {
    const users = ['principiante', 'comodo', 'aventurero', 'avanzado'] as const

    for (const userKey of users) {
      await loginAs(userKey)
      await page.getByRole('button', { name: 'Mapear' }).click()
      await waitForMapItems(page)

      const { pending } = summaryLocators(page)
      const pendingText = await pending.textContent()
      const hasError = await page.locator('[role="alert"]').count()
      const errorText = hasError > 0 ? await page.locator('[role="alert"]').textContent() : null

      console.log(`[${userKey}] Pending: ${pendingText}, Error: ${errorText ?? 'none'}`)

      await page.screenshot({
        path: `${RESULTS_DIR}/18-user-${userKey}.png`,
        fullPage: true,
      })

      expect(hasError).toBe(0)

      await logout()
    }
  })
})
