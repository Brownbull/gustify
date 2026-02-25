import { test, expect } from '../../fixtures/auth.js'

const RESULTS_DIR = 'test-results/auth-dev-test-user-menu'

const TEST_USERS = [
  { key: 'principiante', name: 'Alice Principiante', tier: 'Principiante' },
  { key: 'comodo', name: 'Bob Cómodo', tier: 'Cómodo' },
  { key: 'aventurero', name: 'Charlie Aventurero', tier: 'Aventurero' },
  { key: 'avanzado', name: 'Diana Avanzada', tier: 'Avanzado' },
] as const

test.describe('Dev test user menu', () => {
  test('shows Test Users chip on login page', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('button', { name: /iniciar sesión con google/i }),
    ).toBeVisible({ timeout: 15000 })

    const chip = page.getByRole('button', { name: 'Test Users' })
    await expect(chip).toBeVisible()

    await page.screenshot({
      path: `${RESULTS_DIR}/01-chip-visible.png`,
      fullPage: true,
    })
  })

  test('expands to show all 4 test users', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('button', { name: /iniciar sesión con google/i }),
    ).toBeVisible({ timeout: 15000 })

    // Open the menu
    await page.getByRole('button', { name: 'Test Users' }).click()

    // Verify all 4 users are listed (use button role to avoid strict mode on partial text)
    for (const user of TEST_USERS) {
      await expect(
        page.getByRole('button', { name: new RegExp(user.name) }),
      ).toBeVisible()
    }

    // Verify close button
    await expect(page.getByRole('button', { name: 'cerrar' })).toBeVisible()

    await page.screenshot({
      path: `${RESULTS_DIR}/02-menu-expanded.png`,
      fullPage: true,
    })
  })

  for (const user of TEST_USERS) {
    test(`logs in as ${user.name} (${user.tier})`, async ({ page, logout }) => {
      await page.goto('/')
      await expect(
        page.getByRole('button', { name: /iniciar sesión con google/i }),
      ).toBeVisible({ timeout: 15000 })

      // Open menu and click the user
      await page.getByRole('button', { name: 'Test Users' }).click()
      await page.getByText(user.name).click()

      // Should sign in — "Salir" button confirms auth propagated
      await expect(
        page.getByRole('button', { name: 'Salir' }),
      ).toBeVisible({ timeout: 15000 })

      // Google login button should be gone
      await expect(
        page.getByRole('button', { name: /iniciar sesión con google/i }),
      ).not.toBeVisible()

      await page.screenshot({
        path: `${RESULTS_DIR}/03-logged-in-${user.key}.png`,
        fullPage: true,
      })

      // Sign out to clean up for next test
      await logout()
    })
  }
})
