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
  error: null,
  selectedItem: null,

  loadItems: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const transactions = await getUserTransactions(userId)
      const mappings = await getAllMappings()
      const cookingItems = extractCookingItems(transactions)
      const unmapped = getUnmappedItems(cookingItems, mappings)

      // Auto-resolve: items that have existing mappings get added to pantry silently
      const autoResolved = cookingItems.filter(
        (item) => mappings.has(item.normalizedName),
      )

      let resolved = 0
      for (const item of autoResolved) {
        const mapping = mappings.get(item.normalizedName)!
        const ingredient = await getCanonicalIngredient(mapping.canonicalId)
        if (ingredient) {
          await addToPantry(userId, mapping.canonicalId, ingredient, item.transactionId)
          resolved++
        }
      }

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
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error desconocido'
      set({ error: message })
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
