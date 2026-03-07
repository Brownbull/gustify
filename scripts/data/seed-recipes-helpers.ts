import type { StoredRecipe } from '../../src/types/recipe.js'
import type { IngredientCategory } from '../../src/types/ingredient.js'
import { CANONICAL_INGREDIENTS } from './canonical-ingredients.js'

// SeedRecipe requires source to be { type: 'seed' }
export type SeedRecipe = StoredRecipe & {
  source: { type: 'seed' }
  tags: string[]
  cuisineTags: string[]
  dietaryProfile: { dietsCompatible: string[] }
}

// All valid IngredientCategory values — compile error if type gains a new member
const INGREDIENT_CATEGORIES = [
  'Protein', 'Vegetable', 'Fruit', 'Grain',
  'Dairy', 'Spice', 'Herb', 'Condiment', 'Other',
] as const satisfies readonly IngredientCategory[]

// Derive lowercase recipe category from IngredientCategory (forward-compatible)
const CATEGORY_MAP: Record<IngredientCategory, string> = Object.fromEntries(
  INGREDIENT_CATEGORIES.map((c) => [c, c.toLowerCase()]),
) as Record<IngredientCategory, string>

// Build lookup: canonicalId -> recipe ingredient category
const CANONICAL_CATEGORY: Record<string, string> = {}
for (const c of CANONICAL_INGREDIENTS) {
  CANONICAL_CATEGORY[c.id] = CATEGORY_MAP[c.category] ?? 'other'
}

// Common pantry staple canonicalIds
const PANTRY_STAPLES = new Set([
  'salt',
  'vegetable_oil',
  'olive_oil',
  'black_pepper',
  'oregano',
  'cumin',
])

// Helper: auto-set category from canonical lookup, pantryItem for staples
export function ing(data: {
  name: string
  quantity: number
  unit: string
  canonicalId?: string
  category?: string
  optional?: boolean
  notes?: string
  freezeExclude?: boolean
  pantryItem?: boolean
}) {
  const result: Record<string, unknown> = { ...data }
  if (!result.category && data.canonicalId && CANONICAL_CATEGORY[data.canonicalId]) {
    result.category = CANONICAL_CATEGORY[data.canonicalId]
  }
  if (data.canonicalId && PANTRY_STAPLES.has(data.canonicalId)) {
    result.pantryItem = true
  }
  return result as SeedRecipe['ingredients'][number]
}

// Helper to build a recipe with source auto-set to 'seed'
export function recipe(data: Omit<SeedRecipe, 'source'>): SeedRecipe {
  return { ...data, source: { type: 'seed' as const } }
}
