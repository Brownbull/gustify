import { create } from 'zustand'
import type { CanonicalIngredient, IngredientCategory } from '@/types/ingredient'
import type { PantryItem, EnrichedPantryItem } from '@/types/pantry'
import { subscribeToPantry } from '@/services/pantry'
import { getCanonicalIngredients } from '@/services/ingredients'
import { computeExpiryStatus } from '@/lib/expiry'
import { PREPARED_FOOD_ICON } from '@/types/item-mapping'

const EXPIRY_ORDER = { expired: 0, 'expiring-soon': 1, fresh: 2 } as const

interface PantryState {
  items: EnrichedPantryItem[]
  loading: boolean
  error: string | null
  activeFilter: IngredientCategory | 'all'

  subscribe: (userId: string) => void
  unsubscribe: () => void
  setFilter: (filter: IngredientCategory | 'all') => void
}

let _unsubscribe: (() => void) | null = null
let _ingredientMap: Map<string, CanonicalIngredient> | null = null

function enrichItems(items: PantryItem[]): EnrichedPantryItem[] {
  const map = _ingredientMap
  return items
    .map((item): EnrichedPantryItem => {
      const isPrepared = item.type === 'prepared'
      const canonical = map?.get(item.canonicalId)

      return {
        ...item,
        icon: isPrepared ? PREPARED_FOOD_ICON : (canonical?.icon ?? '📦'),
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

  subscribe: async (userId: string) => {
    // Guard against double subscription
    if (_unsubscribe) return

    set({ loading: true, error: null })

    try {
      // Fetch canonical ingredients first to build the enrichment map
      if (!_ingredientMap) {
        const ingredients = await getCanonicalIngredients()
        _ingredientMap = new Map(ingredients.map((i) => [i.id, i]))
      }

      // Then attach the real-time listener
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
    if (_unsubscribe) {
      _unsubscribe()
      _unsubscribe = null
    }
  },

  setFilter: (filter) => set({ activeFilter: filter }),
}))
