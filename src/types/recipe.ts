import { z } from 'zod'
import type { ProficiencyTier } from './user'

// --- Ingredient Category Enum ---

export const IngredientCategory = z.enum([
  'protein',
  'vegetable',
  'fruit',
  'dairy',
  'fat',
  'spice',
  'herb',
  'condiment',
  'grain',
  'legume',
  'liquid',
  'other',
])
export type IngredientCategory = z.infer<typeof IngredientCategory>

// --- Zod Schemas (stored shape in Firestore) ---

export const RecipeIngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  canonicalId: z.string().optional(),
  category: IngredientCategory.optional(),
  optional: z.boolean().optional(),
  notes: z.string().optional(),
  freezeExclude: z.boolean().optional(),
  pantryItem: z.boolean().optional(),
})

const IngredientGroupSchema = z.object({
  groupName: z.string().min(1),
  items: z.array(RecipeIngredientSchema).min(1),
})

export const RecipeStepSchema = z.object({
  order: z.number().int().positive(),
  instruction: z.string().min(1),
  duration: z.number().nonnegative().optional(),
  technique: z.string().optional(),
  tip: z.string().optional(),
})

const CookingPhaseSchema = z.object({
  name: z.string().min(1),
  durationMinutes: z.number().nonnegative().optional(),
  isPausePoint: z.boolean().optional(),
  pausePointNotes: z.string().optional(),
  steps: z.array(RecipeStepSchema).min(1),
})

const SourceSchema = z.object({
  type: z.enum(['seed', 'ai_generated', 'manual', 'imported', 'adapted']),
  origin: z.string().optional(),
  aiModel: z.string().optional(),
})

const DietaryProfileSchema = z.object({
  dietsCompatible: z.array(z.string()).optional(),
  isLowSugar: z.boolean().optional(),
  estimatedCarbsPerServing: z.string().optional(),
})

const FreezingInfoSchema = z.object({
  isFreezable: z.boolean(),
  method: z.string().optional(),
  maxStorageMonths: z.number().int().optional(),
  freezeWithout: z
    .array(
      z.object({
        ingredient: z.string(),
        reason: z.string(),
        addAt: z.string(),
      }),
    )
    .optional(),
})

const ReheatingMethodSchema = z.object({
  method: z.enum(['water_bath', 'oven', 'stovetop', 'microwave']),
  temperature: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string(),
  postReheatSteps: z.array(z.string()).optional(),
})

const StorageInfoSchema = z.object({
  freezing: FreezingInfoSchema.optional(),
  reheating: z.array(ReheatingMethodSchema).optional(),
  freshAccompaniments: z
    .array(
      z.object({
        item: z.string(),
        notes: z.string().optional(),
      }),
    )
    .optional(),
})

const NutritionSchema = z.object({
  calories: z.number().optional(),
  proteinGrams: z.number().optional(),
  fatGrams: z.number().optional(),
  netCarbsGrams: z.number().optional(),
  fiberGrams: z.number().optional(),
  notes: z.string().optional(),
})

export const RecipeSchema = z.object({
  // Core identification
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().min(1),

  // Classification
  cuisine: z.string().min(1),
  cuisineTags: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  techniques: z.string().array().min(1),
  complexity: z.number().int().min(1).max(5),

  // Timing
  prepTime: z.number().nonnegative(),
  cookTime: z.number().nonnegative(),

  // Servings
  servings: z.number().int().min(1),
  portionWeightGrams: z.number().int().positive().optional(),

  // Ingredients (flat list — required for all recipes)
  ingredients: z.array(RecipeIngredientSchema).min(1),
  // Ingredient groups (optional structured grouping for rich recipes)
  ingredientGroups: z.array(IngredientGroupSchema).optional(),

  // Steps (flat list — required for all recipes)
  steps: z.array(RecipeStepSchema).min(1),
  // Phased method (optional structured cooking phases for rich recipes)
  method: z
    .object({
      phases: z.array(CookingPhaseSchema).min(1),
      timingCoordination: z.string().optional(),
      troubleshooting: z
        .array(z.object({ problem: z.string(), solution: z.string() }))
        .optional(),
    })
    .optional(),

  // Source tracking
  source: SourceSchema.optional(),

  // Dietary info
  dietaryProfile: DietaryProfileSchema.optional(),

  // Storage & reheating
  storage: StorageInfoSchema.optional(),

  // Nutrition
  nutritionPerServing: NutritionSchema.optional(),
})

/** Stored recipe shape — validated by RecipeSchema, no client-side enrichment */
export type StoredRecipe = z.infer<typeof RecipeSchema>

/** Stored recipe doc shape — omits `id` (Firestore stores it as doc.id, not in body).
 * Unknown fields are stripped (not rejected) to allow schema evolution. */
export const StoredRecipeDocSchema = RecipeSchema.omit({ id: true })
export type StoredRecipeDoc = z.infer<typeof StoredRecipeDocSchema>

// --- Client-enriched interfaces (not stored in Firestore) ---

export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema> & { inPantry: boolean }

export type RecipeStep = z.infer<typeof RecipeStepSchema>

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
  cuisineTags?: string[]
  tags?: string[]
  techniques: string[]
  complexity: number
  prepTime: number
  cookTime: number
  servings: number
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  pantryMatchPct: number
  noveltyBadges: NoveltyBadge[]
  source?: z.infer<typeof SourceSchema>
  dietaryProfile?: z.infer<typeof DietaryProfileSchema>
  storage?: z.infer<typeof StorageInfoSchema>
  nutritionPerServing?: z.infer<typeof NutritionSchema>
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
