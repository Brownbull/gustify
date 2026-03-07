export type { SeedRecipe } from './seed-recipes-helpers.js'

import { soupsAndStews } from './seed-recipes-soups.js'
import { riceDishes, pastaDishes, salads, eggDishes } from './seed-recipes-mains.js'
import {
  grilledDishes,
  seafoodDishes,
  sandwiches,
  empanadas,
} from './seed-recipes-protein.js'
import {
  legumeDishes,
  desserts,
  dailyDishes,
  advancedDishes,
  internationalDishes,
} from './seed-recipes-other.js'

// ── Export all recipes ──────────────────────────────────────────────────────

export const SEED_RECIPES = [
  ...soupsAndStews,
  ...riceDishes,
  ...pastaDishes,
  ...salads,
  ...eggDishes,
  ...grilledDishes,
  ...seafoodDishes,
  ...sandwiches,
  ...empanadas,
  ...legumeDishes,
  ...desserts,
  ...dailyDishes,
  ...advancedDishes,
  ...internationalDishes,
]
