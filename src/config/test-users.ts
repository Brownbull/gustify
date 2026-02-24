/**
 * Browser-safe test user display data for the dev-only test user menu.
 * Full user definitions (with Firestore docs) live in e2e/fixtures/test-users.ts.
 */
export const DEV_TEST_USERS = [
  { key: 'principiante', name: 'Ana Principiante', tier: 'Principiante', dishes: 3 },
  { key: 'comodo', name: 'Bruno Cómodo', tier: 'Cómodo', dishes: 15 },
  { key: 'aventurero', name: 'Carla Aventurera', tier: 'Aventurero', dishes: 42 },
  { key: 'avanzado', name: 'Diego Avanzado', tier: 'Avanzado', dishes: 120 },
] as const

export type DevTestUserKey = (typeof DEV_TEST_USERS)[number]['key']