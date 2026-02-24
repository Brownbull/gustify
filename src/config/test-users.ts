/**
 * Browser-safe test user display data for the dev/staging test user menu.
 * Full user definitions (with Firestore docs) live in e2e/fixtures/test-users.ts.
 */
export const DEV_TEST_USERS = [
  { key: 'principiante', name: 'Ana Principiante', tier: 'Principiante', dishes: 3, email: 'test-principiante@gustify-e2e.com' },
  { key: 'comodo', name: 'Bruno Cómodo', tier: 'Cómodo', dishes: 15, email: 'test-comodo@gustify-e2e.com' },
  { key: 'aventurero', name: 'Carla Aventurera', tier: 'Aventurero', dishes: 42, email: 'test-aventurero@gustify-e2e.com' },
  { key: 'avanzado', name: 'Diego Avanzado', tier: 'Avanzado', dishes: 120, email: 'test-avanzado@gustify-e2e.com' },
] as const

export const TEST_USER_PASSWORD = 'gustify-staging-test-2026'

export type DevTestUserKey = (typeof DEV_TEST_USERS)[number]['key']