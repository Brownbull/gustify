import { create } from 'zustand'
import { subscribeToRecipes } from '@/services/recipes'
import { usePantryStore } from '@/stores/pantryStore'
import { computePantryMatchPct } from '@/lib/pantryMatch'
import type { StoredRecipe } from '@/types/recipe'

export interface RankedRecipe extends StoredRecipe {
  pantryMatchPct: number
}

interface RecipeState {
  recipes: StoredRecipe[]
  loading: boolean
  error: string | null

  // Filter state
  searchQuery: string
  cuisineFilter: string | null
  complexityFilter: [number, number] | null

  subscribe: () => void
  unsubscribe: () => void
  getRankedRecipes: () => RankedRecipe[]
  getFilteredRecipes: () => RankedRecipe[]

  // Filter actions
  setSearchQuery: (query: string) => void
  setCuisineFilter: (cuisine: string | null) => void
  setComplexityFilter: (range: [number, number] | null) => void
  clearFilters: () => void
}

// Singleton listener — only one subscription active at a time.
// The guard in subscribe() silently skips if already subscribed.
let _unsubscribe: (() => void) | null = null
let _rankedCache: { key: string; result: RankedRecipe[] } | null = null

/** Sanitize search input: truncate to 100 chars, strip regex special chars, lowercase + trim */
export function sanitizeSearch(raw: string): string {
  return raw.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '').toLowerCase().trim()
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  loading: true,
  error: null,

  // Filter state
  searchQuery: '',
  cuisineFilter: null,
  complexityFilter: null,

  // Filter actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCuisineFilter: (cuisine) => set({ cuisineFilter: cuisine }),
  setComplexityFilter: (range) => set({ complexityFilter: range }),
  clearFilters: () => set({ searchQuery: '', cuisineFilter: null, complexityFilter: null }),

  subscribe: () => {
    if (_unsubscribe) return

    set({ loading: true, error: null })

    _unsubscribe = subscribeToRecipes(
      (recipes) => {
        set({ recipes, loading: false, error: null })
      },
      (error) => {
        set({ error: error.message, loading: false })
      },
    )
  },

  unsubscribe: () => {
    if (_unsubscribe) {
      _unsubscribe()
      _unsubscribe = null
    }
  },

  getRankedRecipes: () => {
    const { recipes } = get()
    const pantryItems = usePantryStore.getState().items

    // Cache key: recipe ids + pantry ids. Recompute only when either changes.
    const cacheKey = recipes.map((r) => r.id).join('\0') + '|' + pantryItems.map((p) => p.canonicalId).join('\0')
    if (_rankedCache?.key === cacheKey) return _rankedCache.result

    const pantryCanonicalIds = new Set(pantryItems.map((p) => p.canonicalId))
    const pantryNamesLower = new Set(pantryItems.map((p) => p.name.toLowerCase()))

    const result = recipes
      .map((recipe) => ({
        ...recipe,
        pantryMatchPct: computePantryMatchPct(recipe, pantryCanonicalIds, pantryNamesLower),
      }))
      .sort((a, b) => b.pantryMatchPct - a.pantryMatchPct)

    _rankedCache = { key: cacheKey, result }
    return result
  },

  getFilteredRecipes: () => {
    const { searchQuery, cuisineFilter, complexityFilter } = get()
    const ranked = get().getRankedRecipes()

    const query = sanitizeSearch(searchQuery)

    return ranked.filter((recipe) => {
      // Text search: match name, description, or ingredient names
      if (query) {
        const nameLower = recipe.name.toLowerCase()
        const descLower = recipe.description.toLowerCase()
        const ingredientMatch = recipe.ingredients.some(
          (ing) => ing.name.toLowerCase().includes(query),
        )
        if (!nameLower.includes(query) && !descLower.includes(query) && !ingredientMatch) {
          return false
        }
      }

      // Cuisine filter
      if (cuisineFilter && recipe.cuisine !== cuisineFilter) {
        return false
      }

      // Complexity filter
      if (complexityFilter) {
        const [min, max] = complexityFilter
        if (recipe.complexity < min || recipe.complexity > max) {
          return false
        }
      }

      return true
    })
  },
}))
