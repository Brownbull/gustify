import { test, expect } from '../../fixtures/auth.js'

const RESULTS_DIR = 'test-results/recipe-detail-nav'

test.describe('Bottom Navigation (React Router)', () => {
  test('renders 4 nav links with correct routes', async ({ page, loginAs }) => {
    await loginAs('principiante')

    const nav = page.locator('[data-testid="bottom-nav"]')
    await expect(nav).toBeVisible()

    // All 4 tabs present as links
    await expect(page.locator('[data-testid="nav-inicio"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-despensa"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-recetas"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-mapear"]')).toBeVisible()

    // Correct href attributes
    await expect(page.locator('[data-testid="nav-inicio"]')).toHaveAttribute('href', '/')
    await expect(page.locator('[data-testid="nav-despensa"]')).toHaveAttribute('href', '/pantry')
    await expect(page.locator('[data-testid="nav-recetas"]')).toHaveAttribute('href', '/recipes')
    await expect(page.locator('[data-testid="nav-mapear"]')).toHaveAttribute('href', '/map-items')

    await page.screenshot({ path: `${RESULTS_DIR}/01-bottom-nav.png`, fullPage: true })
  })

  test('navigates between views via bottom nav', async ({ page, loginAs }) => {
    await loginAs('principiante')

    // Start at home — Inicio should be active
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Tu compañero de cocina')).toBeVisible()

    // Navigate to Recetas
    await page.locator('[data-testid="nav-recetas"]').click()
    await expect(page).toHaveURL('/recipes')

    await page.screenshot({ path: `${RESULTS_DIR}/02-nav-to-recipes.png`, fullPage: true })

    // Navigate to Despensa
    await page.locator('[data-testid="nav-despensa"]').click()
    await expect(page).toHaveURL('/pantry')

    // Navigate to Mapear
    await page.locator('[data-testid="nav-mapear"]').click()
    await expect(page).toHaveURL('/map-items')

    // Navigate back to Inicio
    await page.locator('[data-testid="nav-inicio"]').click()
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Tu compañero de cocina')).toBeVisible()
  })
})

test.describe('Recipe Detail Page', () => {
  test('navigate from recipe list to detail and back', async ({ page, loginAs }) => {
    await loginAs('principiante')

    // Go to recipes
    await page.locator('[data-testid="nav-recetas"]').click()
    await expect(page).toHaveURL('/recipes')

    // Wait for recipes to load
    await page.waitForSelector('[data-testid="recipe-list"]', { timeout: 20000 })

    await page.screenshot({ path: `${RESULTS_DIR}/03-recipe-list.png`, fullPage: true })

    // Click first recipe card
    const firstCard = page.locator('[data-testid="recipe-card"]').first()
    const recipeName = await firstCard.locator('h3').textContent()
    await firstCard.click()

    // Should navigate to /recipes/:id
    await expect(page).toHaveURL(/\/recipes\/.+/)
    await expect(page.locator('[data-testid="recipe-detail"]')).toBeVisible({ timeout: 15000 })

    await page.screenshot({ path: `${RESULTS_DIR}/04-recipe-detail.png`, fullPage: true })

    // Recipe name should match
    if (recipeName) {
      await expect(page.getByText(recipeName)).toBeVisible()
    }

    // Back link should return to recipe list
    await page.getByText('← Recetas').click()
    await expect(page).toHaveURL('/recipes')
    await expect(page.locator('[data-testid="recipe-list"]')).toBeVisible()
  })

  test('recipe detail shows ingredients with pantry availability', async ({ page, loginAs }) => {
    await loginAs('principiante')

    // Navigate to recipes and open first one
    await page.locator('[data-testid="nav-recetas"]').click()
    await page.waitForSelector('[data-testid="recipe-list"]', { timeout: 20000 })
    await page.locator('[data-testid="recipe-card"]').first().click()
    await expect(page.locator('[data-testid="recipe-detail"]')).toBeVisible({ timeout: 15000 })

    // Ingredients section visible
    const ingredients = page.locator('[data-testid="recipe-ingredients"]')
    await expect(ingredients).toBeVisible()

    // Should have at least one ingredient
    const items = ingredients.locator('li')
    await expect(items.first()).toBeVisible()

    // Each ingredient should have a colored availability dot
    const dots = ingredients.locator('span[aria-label]')
    const dotCount = await dots.count()
    expect(dotCount).toBeGreaterThan(0)

    await page.screenshot({ path: `${RESULTS_DIR}/05-ingredients.png`, fullPage: true })
  })

  test('recipe detail shows sequential steps', async ({ page, loginAs }) => {
    await loginAs('principiante')

    await page.locator('[data-testid="nav-recetas"]').click()
    await page.waitForSelector('[data-testid="recipe-list"]', { timeout: 20000 })
    await page.locator('[data-testid="recipe-card"]').first().click()
    await expect(page.locator('[data-testid="recipe-detail"]')).toBeVisible({ timeout: 15000 })

    // Steps section visible
    const steps = page.locator('[data-testid="recipe-steps"]')
    await expect(steps).toBeVisible()

    // Should have at least one step with a number
    const stepItems = steps.locator('li')
    await expect(stepItems.first()).toBeVisible()

    await page.screenshot({ path: `${RESULTS_DIR}/06-steps.png`, fullPage: true })
  })

  test('recipe detail shows metadata (cuisine, complexity, time, servings)', async ({ page, loginAs }) => {
    await loginAs('principiante')

    await page.locator('[data-testid="nav-recetas"]').click()
    await page.waitForSelector('[data-testid="recipe-list"]', { timeout: 20000 })
    await page.locator('[data-testid="recipe-card"]').first().click()
    await expect(page.locator('[data-testid="recipe-detail"]')).toBeVisible({ timeout: 15000 })

    const header = page.locator('[data-testid="recipe-header"]')
    await expect(header).toBeVisible()

    // Should show timing info
    await expect(page.getByText(/Prep: \d+ min/)).toBeVisible()
    await expect(page.getByText(/Coccion: \d+ min/)).toBeVisible()
    await expect(page.getByText(/\d+ porciones/)).toBeVisible()

    await page.screenshot({ path: `${RESULTS_DIR}/07-metadata.png`, fullPage: true })
  })

  test('shows not-found for invalid recipe ID', async ({ page, loginAs }) => {
    await loginAs('principiante')

    // Navigate directly to an invalid recipe URL
    await page.goto('/recipes/nonexistent-recipe-id-12345')

    await expect(page.locator('[data-testid="recipe-not-found"]')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Receta no encontrada')).toBeVisible()

    // "Ver recetas" link should go back to /recipes
    const backLink = page.getByRole('link', { name: 'Ver recetas' })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', '/recipes')

    await page.screenshot({ path: `${RESULTS_DIR}/08-not-found.png`, fullPage: true })

    // Click back link
    await backLink.click()
    await expect(page).toHaveURL('/recipes')
  })

  test('direct URL navigation to recipe detail works', async ({ page, loginAs }) => {
    await loginAs('principiante')

    // First, get a valid recipe ID from the list
    await page.locator('[data-testid="nav-recetas"]').click()
    await page.waitForSelector('[data-testid="recipe-list"]', { timeout: 20000 })
    await page.locator('[data-testid="recipe-card"]').first().click()
    await expect(page).toHaveURL(/\/recipes\/.+/)

    // Capture the URL
    const recipeUrl = page.url()

    // Navigate away
    await page.locator('[data-testid="nav-inicio"]').click()
    await expect(page).toHaveURL('/')

    // Navigate back via direct URL
    await page.goto(recipeUrl)
    await expect(page.locator('[data-testid="recipe-detail"]')).toBeVisible({ timeout: 15000 })
  })

  test('catch-all route redirects to home', async ({ page, loginAs }) => {
    await loginAs('principiante')

    await page.goto('/some/unknown/route')
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Tu compañero de cocina')).toBeVisible()
  })
})
