import type { ProficiencyTier } from './user'

export interface RecipeIngredient {
  canonicalId?: string
  name: string
  quantity: number
  unit: string
  inPantry: boolean
}

export interface RecipeStep {
  order: number
  instruction: string
  duration?: number
}

export type NoveltyType = 'cuisine' | 'technique' | 'ingredient'

export interface NoveltyBadge {
  type: NoveltyType
  label: string
}

export interface Recipe {
  id: string
  name: string
  description: string
  cuisine: string
  techniques: string[]
  complexity: number
  prepTime: number
  cookTime: number
  servings: number
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  pantryMatchPct: number
  noveltyBadges: NoveltyBadge[]
}

/** Raw recipe shape returned by Gemini (before client-side enrichment) */
export interface GeminiRecipe {
  name: string
  description: string
  cuisine: string
  techniques: string[]
  complexity: number
  prepTime: number
  cookTime: number
  servings: number
  ingredients: {
    name: string
    quantity: number
    unit: string
  }[]
  steps: {
    order: number
    instruction: string
    duration?: number
  }[]
}

export interface SuggestRecipesRequest {
  pantryItems: { canonicalId: string; name: string; quantity: number; unit: string }[]
  dietPrefs: string[]
  allergies: string[]
  proficiencyTier: ProficiencyTier
  avgComplexity: number
}

export interface SuggestRecipesResponse {
  recipes: GeminiRecipe[]
}
