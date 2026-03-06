import type { StoredRecipe } from '../../src/types/recipe.js'
import { CANONICAL_INGREDIENTS } from './canonical-ingredients.js'

// SeedRecipe requires source to be { type: 'seed' }
export type SeedRecipe = StoredRecipe & {
  source: { type: 'seed' }
  tags: string[]
  cuisineTags: string[]
  dietaryProfile: { dietsCompatible: string[] }
}

// Build lookup: canonicalId -> recipe IngredientCategory
const CANONICAL_CATEGORY: Record<string, string> = {}
for (const c of CANONICAL_INGREDIENTS) {
  const map: Record<string, string> = {
    Protein: 'protein',
    Vegetable: 'vegetable',
    Fruit: 'fruit',
    Dairy: 'dairy',
    Grain: 'grain',
    Spice: 'spice',
    Herb: 'herb',
    Condiment: 'condiment',
  }
  CANONICAL_CATEGORY[c.id] = map[c.category] || 'other'
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
