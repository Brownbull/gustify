import { create } from 'zustand'
import type { CanonicalIngredient } from '@/types/ingredient'
import type { ExtractedItem } from '@/services/gastify-transactions'
import {
  getUserTransactions,
  extractCookingItems,
  getUnmappedItems,
} from '@/services/gastify-transactions'
import { getAllMappings } from '@/services/item-mappings'
import { createMapping } from '@/services/item-mappings'
import { addToPantry } from '@/services/pantry'
import { getCanonicalIngredient } from '@/services/ingredients'

interface MappingState {
  unmappedItems: ExtractedItem[]
  mappedCount: number
  autoResolvedCount: number
  loading: boolean
  saving: boolean
  error: string | null
  selectedItem: ExtractedItem | null
  loadItems: (userId: string) => Promise<void>
  mapItem: (
    item: ExtractedItem,
    canonicalId: string,
    ingredient: CanonicalIngredient,
    userId: string,
  ) => Promise<void>
  skipItem: (item: ExtractedItem) => void
  setSelectedItem: (item: ExtractedItem | null) => void
  clearError: () => void
}

export const useMappingStore = create<MappingState>((set, get) => ({
  unmappedItems: [],
  mappedCount: 0,
  autoResolvedCount: 0,
  loading: false,
  saving: false,
  error: null,
  selectedItem: null,

  loadItems: async (userId: string) => {
    if (get().loading) return
    set({ loading: true, mappedCount: 0, error: null })
    try {
      const [transactions, mappings] = await Promise.all([
        getUserTransactions(userId),
        getAllMappings(),
      ])
      const cookingItems = extractCookingItems(transactions)
      const unmapped = getUnmappedItems(cookingItems, mappings)

      // Auto-resolve: items that have existing mappings get added to pantry silently
      const autoResolved = cookingItems.filter(
        (item) => mappings.has(item.normalizedName),
      )

      let resolved = 0
      await Promise.all(
        autoResolved.map(async (item) => {
          const mapping = mappings.get(item.normalizedName)!
          const ingredient = await getCanonicalIngredient(mapping.canonicalId)
          if (ingredient) {
            await addToPantry(userId, mapping.canonicalId, ingredient, item.transactionId)
            resolved++
          }
        }),
      )

      set({
        unmappedItems: unmapped,
        autoResolvedCount: resolved,
        loading: false,
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error desconocido'
      set({ error: message, loading: false })
    }
  },

  mapItem: async (
    item: ExtractedItem,
    canonicalId: string,
    ingredient: CanonicalIngredient,
    userId: string,
  ) => {
    if (get().saving) return
    set({ saving: true })
    try {
      await createMapping(item.originalName, canonicalId, userId)
      await addToPantry(userId, canonicalId, ingredient, item.transactionId)

      const state = get()
      set({
        unmappedItems: state.unmappedItems.filter(
          (i) => i.normalizedName !== item.normalizedName,
        ),
        mappedCount: state.mappedCount + 1,
        selectedItem: null,
        saving: false,
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error desconocido'
      set({ error: message, saving: false })
    }
  },

  skipItem: (item: ExtractedItem) => {
    const state = get()
    set({
      unmappedItems: state.unmappedItems.filter(
        (i) => i.normalizedName !== item.normalizedName,
      ),
      selectedItem: null,
    })
  },

  setSelectedItem: (item: ExtractedItem | null) => {
    set({ selectedItem: item })
  },

  clearError: () => {
    set({ error: null })
  },
}))
