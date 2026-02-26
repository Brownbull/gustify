import { create } from 'zustand'
import type { CanonicalIngredient } from '@/types/ingredient'
import type { CanonicalPreparedFood } from '@/types/prepared-food'
import type { ExtractedItem } from '@/services/gastify-transactions'
import {
  getUserTransactions,
  extractCookingItems,
  getUnmappedItems,
} from '@/services/gastify-transactions'
import { getAllMappings } from '@/services/item-mappings'
import { createMapping } from '@/services/item-mappings'
import {
  addToPantry,
  addPreparedToPantry,
  addCanonicalPreparedToPantry,
  addUnknownIngredientToPantry,
  addUnknownPreparedToPantry,
} from '@/services/pantry'
import { getCanonicalIngredient } from '@/services/ingredients'
import { preparedFoodId, unknownIngredientId, unknownPreparedId } from '@/types/item-mapping'
import { reportUnknownIngredient, reportUnknownPreparedFood } from '@/services/unknown-items'

interface MappingState {
  unmappedItems: ExtractedItem[]
  skippedItems: ExtractedItem[]
  mappedCount: number
  preparedCount: number
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
  mapPreparedFood: (
    item: ExtractedItem,
    preparedFood: CanonicalPreparedFood,
    userId: string,
  ) => Promise<void>
  markPrepared: (item: ExtractedItem, userId: string) => Promise<void>
  markUnknownIngredient: (item: ExtractedItem, userId: string) => Promise<void>
  markUnknownPrepared: (item: ExtractedItem, userId: string) => Promise<void>
  skipItem: (item: ExtractedItem) => void
  restoreItem: (item: ExtractedItem) => void
  setSelectedItem: (item: ExtractedItem | null) => void
  clearError: () => void
}

export const useMappingStore = create<MappingState>((set, get) => ({
  unmappedItems: [],
  skippedItems: [],
  mappedCount: 0,
  preparedCount: 0,
  autoResolvedCount: 0,
  loading: false,
  saving: false,
  error: null,
  selectedItem: null,

  loadItems: async (userId: string) => {
    if (get().loading) return
    set({ loading: true, mappedCount: 0, preparedCount: 0, skippedItems: [], error: null })
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
          if (mapping.type === 'prepared') {
            await addPreparedToPantry(
              userId,
              item.originalName,
              item.normalizedName,
              item.transactionId,
            )
            resolved++
          } else {
            const ingredient = await getCanonicalIngredient(mapping.canonicalId)
            if (ingredient) {
              await addToPantry(userId, mapping.canonicalId, ingredient, item.transactionId)
              resolved++
            }
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

  mapPreparedFood: async (
    item: ExtractedItem,
    preparedFood: CanonicalPreparedFood,
    userId: string,
  ) => {
    if (get().saving) return
    set({ saving: true })
    try {
      await createMapping(item.originalName, preparedFood.id, userId, 'prepared')
      await addCanonicalPreparedToPantry(userId, preparedFood, item.transactionId)

      const state = get()
      set({
        unmappedItems: state.unmappedItems.filter(
          (i) => i.normalizedName !== item.normalizedName,
        ),
        preparedCount: state.preparedCount + 1,
        selectedItem: null,
        saving: false,
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error desconocido'
      set({ error: message, saving: false })
    }
  },

  markPrepared: async (item: ExtractedItem, userId: string) => {
    if (get().saving) return
    set({ saving: true })
    try {
      const docId = preparedFoodId(item.normalizedName)
      await createMapping(item.originalName, docId, userId, 'prepared')
      await addPreparedToPantry(
        userId,
        item.originalName,
        item.normalizedName,
        item.transactionId,
      )

      const state = get()
      set({
        unmappedItems: state.unmappedItems.filter(
          (i) => i.normalizedName !== item.normalizedName,
        ),
        preparedCount: state.preparedCount + 1,
        selectedItem: null,
        saving: false,
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error desconocido'
      set({ error: message, saving: false })
    }
  },

  markUnknownIngredient: async (item: ExtractedItem, userId: string) => {
    if (get().saving) return
    set({ saving: true })
    try {
      const docId = unknownIngredientId(item.normalizedName)
      await createMapping(item.originalName, docId, userId)
      await addUnknownIngredientToPantry(
        userId,
        item.originalName,
        item.normalizedName,
        item.transactionId,
      )
      await reportUnknownIngredient(item.originalName, userId)

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

  markUnknownPrepared: async (item: ExtractedItem, userId: string) => {
    if (get().saving) return
    set({ saving: true })
    try {
      const docId = unknownPreparedId(item.normalizedName)
      await createMapping(item.originalName, docId, userId, 'prepared')
      await addUnknownPreparedToPantry(
        userId,
        item.originalName,
        item.normalizedName,
        item.transactionId,
      )
      await reportUnknownPreparedFood(item.originalName, userId)

      const state = get()
      set({
        unmappedItems: state.unmappedItems.filter(
          (i) => i.normalizedName !== item.normalizedName,
        ),
        preparedCount: state.preparedCount + 1,
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
      skippedItems: [...state.skippedItems, item],
      selectedItem: null,
    })
  },

  restoreItem: (item: ExtractedItem) => {
    const state = get()
    set({
      skippedItems: state.skippedItems.filter(
        (i) => i.normalizedName !== item.normalizedName,
      ),
      unmappedItems: [...state.unmappedItems, item],
    })
  },

  setSelectedItem: (item: ExtractedItem | null) => {
    set({ selectedItem: item })
  },

  clearError: () => {
    set({ error: null })
  },
}))
