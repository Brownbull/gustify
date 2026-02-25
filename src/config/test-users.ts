/**
 * Browser-safe test user display data for the dev/staging test user menu.
 * Full user definitions (with Firestore docs) live in e2e/fixtures/test-users.ts.
 * Users are shared with Boletapp staging — UIDs are resolved by email at runtime.
 */
export const DEV_TEST_USERS = [
  { key: 'principiante', name: 'Alice Principiante', tier: 'Principiante', dishes: 3, email: 'alice@boletapp.test' },
  { key: 'comodo', name: 'Bob Cómodo', tier: 'Cómodo', dishes: 15, email: 'bob@boletapp.test' },
  { key: 'aventurero', name: 'Charlie Aventurero', tier: 'Aventurero', dishes: 42, email: 'charlie@boletapp.test' },
  { key: 'avanzado', name: 'Diana Avanzada', tier: 'Avanzado', dishes: 120, email: 'diana@boletapp.test' },
] as const

export const TEST_USER_PASSWORD = 'gustify-staging-test-2026'

export type DevTestUserKey = (typeof DEV_TEST_USERS)[number]['key']
