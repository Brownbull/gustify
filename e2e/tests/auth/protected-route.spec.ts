import { test, expect } from '../../fixtures/auth.js'

const RESULTS_DIR = 'test-results/auth-protected-routes'

test.describe('Protected routes', () => {
  test('unauthenticated user sees login page', async ({ page }) => {
    await page.goto('/')

    // Should show login page, not app content
    await expect(
      page.getByRole('button', { name: /iniciar sesión con google/i }),
    ).toBeVisible({ timeout: 15000 })

    // "Salir" button should not exist
    await expect(page.getByRole('button', { name: 'Salir' })).not.toBeVisible()

    await page.screenshot({
      path: `${RESULTS_DIR}/01-unauthenticated-redirect.png`,
      fullPage: true,
    })
  })

  test('authenticated user sees app content', async ({ page, loginAs }) => {
    await loginAs('aventurero')

    // Should show app header with sign-out
    await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible()

    // Should show main content
    await expect(page.getByText('Tu compañero de cocina')).toBeVisible()

    await page.screenshot({
      path: `${RESULTS_DIR}/02-authenticated-aventurero.png`,
      fullPage: true,
    })
  })

  test('each proficiency tier user can authenticate', async ({
    page,
    loginAs,
    logout,
  }) => {
    const tiers = ['principiante', 'comodo', 'aventurero', 'avanzado'] as const
    let step = 1

    for (const userKey of tiers) {
      await loginAs(userKey)
      await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible()

      await page.screenshot({
        path: `${RESULTS_DIR}/03-tier-${String(step).padStart(2, '0')}-${userKey}.png`,
        fullPage: true,
      })

      await logout()
      await expect(
        page.getByRole('button', { name: /iniciar sesión con google/i }),
      ).toBeVisible()
      step++
    }
  })
})
