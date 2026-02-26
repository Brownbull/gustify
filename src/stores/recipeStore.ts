import { create } from 'zustand'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { suggestRecipes } from '@/services/gemini'
import type { Recipe, GeminiRecipe, NoveltyBadge } from '@/types/recipe'
import type { EnrichedPantryItem } from '@/types/pantry'
import type { CookingProfile } from '@/types/user'

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

/**
 * Compute pantry match: how many recipe ingredients are available in the pantry.
 */
function computePantryMatch(
  recipeIngredients: GeminiRecipe['ingredients'],
  pantryNames: Set<string>,
): { ingredients: Recipe['ingredients']; matchPct: number } {
  const enriched = recipeIngredients.map((ing) => ({
    name: ing.name,
    quantity: ing.quantity,
    unit: ing.unit,
    inPantry: pantryNames.has(ing.name.toLowerCase()),
  }))
  const available = enriched.filter((i) => i.inPantry).length
  const matchPct = enriched.length > 0 ? Math.round((available / enriched.length) * 100) : 0
  return { ingredients: enriched, matchPct }
}

/**
 * Determine novelty badges by comparing recipe attributes against the user's cooking profile.
 */
function computeNoveltyBadges(
  recipe: GeminiRecipe,
  profile: CookingProfile,
): NoveltyBadge[] {
  const badges: NoveltyBadge[] = []

  if (!profile.cookedCuisines.some((c) => c.toLowerCase() === recipe.cuisine.toLowerCase())) {
    badges.push({ type: 'cuisine', label: recipe.cuisine })
  }

  for (const tech of recipe.techniques) {
    if (!profile.cookedTechniques.some((t) => t.toLowerCase() === tech.toLowerCase())) {
      badges.push({ type: 'technique', label: tech })
      break
    }
  }

  return badges
}

function enrichRecipe(
  raw: GeminiRecipe,
  pantryNames: Set<string>,
  profile: CookingProfile,
): Recipe {
  const { ingredients, matchPct } = computePantryMatch(raw.ingredients, pantryNames)
  const noveltyBadges = computeNoveltyBadges(raw, profile)

  return {
    id: generateId(),
    name: raw.name,
    description: raw.description,
    cuisine: raw.cuisine,
    techniques: raw.techniques,
    complexity: raw.complexity,
    prepTime: raw.prepTime,
    cookTime: raw.cookTime,
    servings: raw.servings,
    ingredients,
    steps: raw.steps,
    pantryMatchPct: matchPct,
    noveltyBadges,
  }
}

interface RecipeState {
  recipes: Recipe[]
  loading: boolean
  error: string | null

  fetchSuggestions: (userId: string, pantryItems: EnrichedPantryItem[]) => Promise<void>
  clearRecipes: () => void
}

export const useRecipeStore = create<RecipeState>((set) => ({
  recipes: [],
  loading: false,
  error: null,

  fetchSuggestions: async (userId, pantryItems) => {
    set({ loading: true, error: null })
    try {
      // Fetch user's cooking profile from Firestore
      const userSnap = await getDoc(doc(db, 'users', userId))
      const userData = userSnap.data()
      const cookingProfile: CookingProfile = userData?.cookingProfile ?? {
        dietPrefs: [],
        allergies: [],
        proficiencyTier: 'Principiante' as const,
        avgComplexity: 0,
        dishesCooked: 0,
        cookedCuisines: [],
        cookedTechniques: [],
        cookedIngredients: [],
      }

      // Build request from pantry items + profile
      const response = await suggestRecipes({
        pantryItems: pantryItems
          .filter((item) => item.expiryStatus !== 'expired')
          .map((item) => ({
            canonicalId: item.canonicalId,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
          })),
        dietPrefs: cookingProfile.dietPrefs,
        allergies: cookingProfile.allergies,
        proficiencyTier: cookingProfile.proficiencyTier,
        avgComplexity: cookingProfile.avgComplexity,
      })

      // Build a set of pantry ingredient names (lowercase) for matching
      const pantryNames = new Set(pantryItems.map((p) => p.name.toLowerCase()))

      // Enrich Gemini recipes with pantry match % and novelty badges
      const recipes = response.recipes
        .map((raw) => enrichRecipe(raw, pantryNames, cookingProfile))
        .sort((a, b) => b.pantryMatchPct - a.pantryMatchPct)

      set({ recipes, loading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error al generar sugerencias',
        loading: false,
      })
    }
  },

  clearRecipes: () => set({ recipes: [], error: null }),
}))
