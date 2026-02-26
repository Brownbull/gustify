import { create } from 'zustand'
import type { CanonicalIngredient, IngredientCategory } from '@/types/ingredient'
import type { CanonicalPreparedFood } from '@/types/prepared-food'
import type { PantryItem, EnrichedPantryItem, ExpiryStatus, PreparedFoodCuisine } from '@/types/pantry'
import { subscribeToPantry } from '@/services/pantry'
import { getCanonicalIngredients } from '@/services/ingredients'
import { getCanonicalPreparedFoods } from '@/services/prepared-foods'
import { computeExpiryStatus } from '@/lib/expiry'
import { PREPARED_FOOD_ICON } from '@/types/item-mapping'

const EXPIRY_ORDER = { expired: 0, 'expiring-soon': 1, fresh: 2 } as const

interface PantryState {
  items: EnrichedPantryItem[]
  loading: boolean
  error: string | null
  activeFilter: IngredientCategory | 'all'
  expiryFilter: ExpiryStatus | 'all'
  activeTab: 'ingredients' | 'prepared'
  cuisineFilter: PreparedFoodCuisine | 'all'

  subscribe: (userId: string) => void
  unsubscribe: () => void
  setFilter: (filter: IngredientCategory | 'all') => void
  setExpiryFilter: (filter: ExpiryStatus | 'all') => void
  setActiveTab: (tab: 'ingredients' | 'prepared') => void
  setCuisineFilter: (filter: PreparedFoodCuisine | 'all') => void
}

let _unsubscribe: (() => void) | null = null
let _ingredientMap: Map<string, CanonicalIngredient> | null = null
let _preparedFoodMap: Map<string, CanonicalPreparedFood> | null = null
let _subscribingUserId: string | null = null

function enrichItems(items: PantryItem[]): EnrichedPantryItem[] {
  const ingMap = _ingredientMap
  const pfMap = _preparedFoodMap
  return items
    .map((item): EnrichedPantryItem => {
      const isPrepared = item.type === 'prepared'
      const canonical = ingMap?.get(item.canonicalId)
      const preparedFood = pfMap?.get(item.canonicalId)

      return {
        ...item,
        icon: isPrepared
          ? (preparedFood?.icon ?? PREPARED_FOOD_ICON)
          : (canonical?.icon ?? '📦'),
        category: isPrepared ? 'Other' : (canonical?.category ?? 'Other'),
        expiryStatus: computeExpiryStatus(item.estimatedExpiry),
      }
    })
    .sort((a, b) => {
      const orderDiff = EXPIRY_ORDER[a.expiryStatus] - EXPIRY_ORDER[b.expiryStatus]
      if (orderDiff !== 0) return orderDiff
      return a.name.localeCompare(b.name, 'es')
    })
}

export const usePantryStore = create<PantryState>((set) => ({
  items: [],
  loading: true,
  error: null,
  activeFilter: 'all',
  expiryFilter: 'all',
  activeTab: 'ingredients',
  cuisineFilter: 'all',

  subscribe: async (userId: string) => {
    // Guard against double subscription
    if (_unsubscribe) return

    _subscribingUserId = userId
    set({ loading: true, error: null })

    try {
      // Fetch canonical data to build enrichment maps
      if (!_ingredientMap || !_preparedFoodMap) {
        const [ingredients, preparedFoods] = await Promise.all([
          _ingredientMap ? [] : getCanonicalIngredients(),
          _preparedFoodMap ? [] : getCanonicalPreparedFoods(),
        ])
        if (!_ingredientMap) _ingredientMap = new Map(ingredients.map((i) => [i.id, i]))
        if (!_preparedFoodMap) _preparedFoodMap = new Map(preparedFoods.map((pf) => [pf.id, pf]))
      }

      // Bail if unsubscribe was called while we were fetching
      if (_subscribingUserId !== userId) return

      // Attach the real-time listener
      _unsubscribe = subscribeToPantry(
        userId,
        (items) => {
          set({ items: enrichItems(items), loading: false, error: null })
        },
        (error) => {
          set({ error: error.message, loading: false })
        },
      )
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error al cargar despensa',
        loading: false,
      })
    }
  },

  unsubscribe: () => {
    _subscribingUserId = null
    if (_unsubscribe) {
      _unsubscribe()
      _unsubscribe = null
    }
  },

  setFilter: (filter) => set({ activeFilter: filter }),
  setExpiryFilter: (filter) => set({ expiryFilter: filter }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setCuisineFilter: (filter) => set({ cuisineFilter: filter }),
}))
