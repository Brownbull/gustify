import { z } from 'zod'
import type { ProficiencyTier } from './user'

// --- Zod Schemas (stored shape in Firestore) ---

const RecipeIngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().nonnegative(),
  unit: z.string().min(1),
  canonicalId: z.string().optional(),
})

const RecipeStepSchema = z.object({
  order: z.number().int().positive(),
  instruction: z.string().min(1),
  duration: z.number().nonnegative().optional(),
})

export const RecipeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string(),
  cuisine: z.string().min(1),
  techniques: z.string().array().min(1),
  complexity: z.number().int().min(1).max(5),
  prepTime: z.number().nonnegative(),
  cookTime: z.number().nonnegative(),
  servings: z.number().int().min(1),
  ingredients: z.array(RecipeIngredientSchema).min(1),
  steps: z.array(RecipeStepSchema).min(1),
})

/** Stored recipe shape — validated by RecipeSchema, no client-side enrichment */
export type StoredRecipe = z.infer<typeof RecipeSchema>

// --- Client-enriched interfaces (not stored in Firestore) ---

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
