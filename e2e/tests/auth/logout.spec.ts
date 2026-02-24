import { test, expect } from '../../fixtures/auth.js'

const RESULTS_DIR = 'test-results/auth-logout'

test.describe('Logout', () => {
  test('clicking Salir signs out and returns to login page', async ({
    page,
    loginAs,
  }) => {
    await loginAs('comodo')

    // Verify we're authenticated
    await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible()

    await page.screenshot({
      path: `${RESULTS_DIR}/01-authenticated-comodo.png`,
      fullPage: true,
    })

    // Click sign out
    await page.getByRole('button', { name: 'Salir' }).click()

    // Should return to login page
    await expect(
      page.getByRole('button', { name: /iniciar sesión con google/i }),
    ).toBeVisible({ timeout: 10000 })

    // Main app header should not be visible
    await expect(page.getByRole('button', { name: 'Salir' })).not.toBeVisible()

    await page.screenshot({
      path: `${RESULTS_DIR}/02-after-logout.png`,
      fullPage: true,
    })
  })
})
