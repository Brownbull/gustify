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

let _unsubscribe: (() => void) | null = null

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

    const pantryCanonicalIds = new Set(pantryItems.map((p) => p.canonicalId))
    const pantryNamesLower = new Set(pantryItems.map((p) => p.name.toLowerCase()))

    return recipes
      .map((recipe) => ({
        ...recipe,
        pantryMatchPct: computePantryMatchPct(recipe, pantryCanonicalIds, pantryNamesLower),
      }))
      .sort((a, b) => b.pantryMatchPct - a.pantryMatchPct)
  },
}))
