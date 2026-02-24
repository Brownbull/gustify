import { test, expect } from '../../fixtures/auth.js'

const RESULTS_DIR = 'test-results/auth-login'

test.describe('Login page', () => {
  test('displays branding and sign-in button in Spanish', async ({ page }) => {
    await page.goto('/')

    // Wait for the page to settle (loading state → login page)
    await expect(
      page.getByRole('button', { name: /iniciar sesión con google/i }),
    ).toBeVisible({ timeout: 15000 })

    // Branding
    await expect(page.locator('h1')).toHaveText('Gustify')
    await expect(page.getByText('Tu compañero de cocina')).toBeVisible()

    // Footer
    await expect(page.getByText('Khujta AI')).toBeVisible()

    await page.screenshot({
      path: `${RESULTS_DIR}/01-login-page-branding.png`,
      fullPage: true,
    })
  })

  test('authenticates with custom token and shows main app', async ({
    page,
    loginAs,
  }) => {
    await loginAs('principiante')

    await page.screenshot({
      path: `${RESULTS_DIR}/02-after-login-principiante.png`,
      fullPage: true,
    })

    // Should show the authenticated app content
    await expect(page.locator('header h1')).toHaveText('Gustify')
    await expect(page.getByText('Tu compañero de cocina')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible()

    // Login button should NOT be visible
    await expect(
      page.getByRole('button', { name: /iniciar sesión con google/i }),
    ).not.toBeVisible()
  })

  test('shows user avatar after login', async ({ page, loginAs }) => {
    await loginAs('principiante')

    const avatar = page.locator('header img')
    await expect(avatar).toBeVisible()

    await page.screenshot({
      path: `${RESULTS_DIR}/03-avatar-visible.png`,
      fullPage: true,
    })
  })
})
