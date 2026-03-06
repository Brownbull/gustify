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

  subscribe: () => void
  unsubscribe: () => void
  getRankedRecipes: () => RankedRecipe[]
}

// Singleton listener — only one subscription active at a time.
// The guard in subscribe() silently skips if already subscribed.
let _unsubscribe: (() => void) | null = null
let _rankedCache: { key: string; result: RankedRecipe[] } | null = null

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  loading: true,
  error: null,

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
    const cacheKey = recipes.map((r) => r.id).join(',') + '|' + pantryItems.map((p) => p.canonicalId).join(',')
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
}))
