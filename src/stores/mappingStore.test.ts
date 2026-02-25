import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Timestamp } from 'firebase/firestore'
import type { ExtractedItem } from '@/services/gastify-transactions'
import type { ItemMapping } from '@/types/item-mapping'
import type { CanonicalIngredient } from '@/types/ingredient'

const mockGetUserTransactions = vi.fn()
const mockExtractCookingItems = vi.fn()
const mockGetUnmappedItems = vi.fn()
const mockGetAllMappings = vi.fn()
const mockCreateMapping = vi.fn()
const mockAddToPantry = vi.fn()
const mockAddPreparedToPantry = vi.fn()
const mockGetCanonicalIngredient = vi.fn()

vi.mock('@/services/gastify-transactions', () => ({
  getUserTransactions: (...args: unknown[]) => mockGetUserTransactions(...args),
  extractCookingItems: (...args: unknown[]) => mockExtractCookingItems(...args),
  getUnmappedItems: (...args: unknown[]) => mockGetUnmappedItems(...args),
}))

vi.mock('@/services/item-mappings', () => ({
  getAllMappings: (...args: unknown[]) => mockGetAllMappings(...args),
  createMapping: (...args: unknown[]) => mockCreateMapping(...args),
}))

vi.mock('@/services/pantry', () => ({
  addToPantry: (...args: unknown[]) => mockAddToPantry(...args),
  addPreparedToPantry: (...args: unknown[]) => mockAddPreparedToPantry(...args),
}))

vi.mock('@/services/ingredients', () => ({
  getCanonicalIngredient: (...args: unknown[]) => mockGetCanonicalIngredient(...args),
}))

import { useMappingStore } from './mappingStore'

beforeEach(() => {
  vi.clearAllMocks()
  // Reset store state between tests
  useMappingStore.setState({
    unmappedItems: [],
    skippedItems: [],
    mappedCount: 0,
    preparedCount: 0,
    autoResolvedCount: 0,
    loading: false,
    saving: false,
    error: null,
    selectedItem: null,
  })
})

const tomato: CanonicalIngredient = {
  id: 'tomato',
  names: { es: 'Tomate', en: 'Tomato' },
  category: 'Vegetable',
  icon: '🍅',
  defaultUnit: 'kg',
  shelfLifeDays: 7,
  substitutions: [],
}

const sampleItem: ExtractedItem = {
  originalName: 'Tomate Cherry',
  normalizedName: 'tomate cherry',
  qty: 1,
  category: 'Produce',
  transactionId: 'tx-1',
  date: '2026-02-20',
  merchant: 'Jumbo',
}

const sampleItem2: ExtractedItem = {
  originalName: 'Arroz Largo',
  normalizedName: 'arroz largo',
  qty: 1,
  category: 'Pantry',
  transactionId: 'tx-1',
  date: '2026-02-20',
  merchant: 'Jumbo',
}

describe('loadItems', () => {
  it('loads transactions, computes unmapped items, and auto-resolves mapped ones', async () => {
    const mappings = new Map<string, ItemMapping>([
      ['leche', { canonicalId: 'milk', source: 'Leche', normalizedSource: 'leche', createdBy: 'user-1', createdAt: {} as Timestamp }],
    ])

    mockGetUserTransactions.mockResolvedValue([{ id: 'tx-1' }])
    mockGetAllMappings.mockResolvedValue(mappings)
    mockExtractCookingItems.mockReturnValue([
      sampleItem,
      { ...sampleItem2, normalizedName: 'leche', originalName: 'Leche' },
    ])
    mockGetUnmappedItems.mockReturnValue([sampleItem])
    mockGetCanonicalIngredient.mockResolvedValue(tomato)
    mockAddToPantry.mockResolvedValue(undefined)

    await useMappingStore.getState().loadItems('user-1')

    const state = useMappingStore.getState()
    expect(state.unmappedItems).toHaveLength(1)
    expect(state.unmappedItems[0].normalizedName).toBe('tomate cherry')
    expect(state.autoResolvedCount).toBe(1)
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('sets loading to true during load', async () => {
    mockGetUserTransactions.mockImplementation(
      () => new Promise(() => {}), // never resolves
    )
    mockGetAllMappings.mockResolvedValue(new Map())

    useMappingStore.getState().loadItems('user-1')

    // Check immediately (promise hasn't resolved)
    expect(useMappingStore.getState().loading).toBe(true)
  })

  it('sets error on failure', async () => {
    mockGetUserTransactions.mockRejectedValue(new Error('network-error'))

    await useMappingStore.getState().loadItems('user-1')

    const state = useMappingStore.getState()
    expect(state.error).toBe('network-error')
    expect(state.loading).toBe(false)
  })

  it('resets skippedItems on reload', async () => {
    useMappingStore.setState({ skippedItems: [sampleItem] })

    mockGetUserTransactions.mockResolvedValue([])
    mockGetAllMappings.mockResolvedValue(new Map())
    mockExtractCookingItems.mockReturnValue([])
    mockGetUnmappedItems.mockReturnValue([])

    await useMappingStore.getState().loadItems('user-1')

    expect(useMappingStore.getState().skippedItems).toEqual([])
  })
})

describe('mapItem', () => {
  it('creates mapping, adds to pantry, and removes from unmapped list', async () => {
    useMappingStore.setState({ unmappedItems: [sampleItem, sampleItem2] })
    mockCreateMapping.mockResolvedValue(undefined)
    mockAddToPantry.mockResolvedValue(undefined)

    await useMappingStore
      .getState()
      .mapItem(sampleItem, 'tomato', tomato, 'user-1')

    expect(mockCreateMapping).toHaveBeenCalledWith(
      'Tomate Cherry',
      'tomato',
      'user-1',
    )
    expect(mockAddToPantry).toHaveBeenCalledWith(
      'user-1',
      'tomato',
      tomato,
      'tx-1',
    )

    const state = useMappingStore.getState()
    expect(state.unmappedItems).toHaveLength(1)
    expect(state.unmappedItems[0].normalizedName).toBe('arroz largo')
    expect(state.mappedCount).toBe(1)
    expect(state.selectedItem).toBeNull()
  })

  it('sets error on failure', async () => {
    useMappingStore.setState({ unmappedItems: [sampleItem] })
    mockCreateMapping.mockRejectedValue(new Error('write-failed'))

    await useMappingStore
      .getState()
      .mapItem(sampleItem, 'tomato', tomato, 'user-1')

    expect(useMappingStore.getState().error).toBe('write-failed')
  })
})

describe('markPrepared', () => {
  const preparedItem: ExtractedItem = {
    originalName: 'Pizza congelada',
    normalizedName: 'pizza congelada',
    qty: 1,
    category: 'Frozen Foods',
    transactionId: 'tx-5',
    date: '2026-02-20',
    merchant: 'Lider',
  }

  it('creates mapping with type prepared, adds to pantry, and removes from list', async () => {
    useMappingStore.setState({ unmappedItems: [preparedItem, sampleItem] })
    mockCreateMapping.mockResolvedValue(undefined)
    mockAddPreparedToPantry.mockResolvedValue(undefined)

    await useMappingStore.getState().markPrepared(preparedItem, 'user-1')

    expect(mockCreateMapping).toHaveBeenCalledWith(
      'Pizza congelada',
      'prepared_pizza_congelada',
      'user-1',
      'prepared',
    )
    expect(mockAddPreparedToPantry).toHaveBeenCalledWith(
      'user-1',
      'Pizza congelada',
      'pizza congelada',
      'tx-5',
    )

    const state = useMappingStore.getState()
    expect(state.unmappedItems).toHaveLength(1)
    expect(state.unmappedItems[0].normalizedName).toBe('tomate cherry')
    expect(state.preparedCount).toBe(1)
    expect(state.selectedItem).toBeNull()
  })

  it('sets error on failure', async () => {
    useMappingStore.setState({ unmappedItems: [preparedItem] })
    mockCreateMapping.mockRejectedValue(new Error('write-failed'))

    await useMappingStore.getState().markPrepared(preparedItem, 'user-1')

    expect(useMappingStore.getState().error).toBe('write-failed')
  })

  it('is no-op when saving is true', async () => {
    useMappingStore.setState({ unmappedItems: [preparedItem], saving: true })

    await useMappingStore.getState().markPrepared(preparedItem, 'user-1')

    expect(mockCreateMapping).not.toHaveBeenCalled()
  })
})

describe('loadItems auto-resolve for prepared', () => {
  it('auto-resolves prepared food mappings via addPreparedToPantry', async () => {
    const mappings = new Map<string, ItemMapping>([
      ['pizza congelada', {
        canonicalId: 'prepared_pizza_congelada',
        source: 'Pizza congelada',
        normalizedSource: 'pizza congelada',
        createdBy: 'user-1',
        createdAt: {} as Timestamp,
        type: 'prepared',
      }],
    ])

    const pizzaItem: ExtractedItem = {
      originalName: 'Pizza congelada',
      normalizedName: 'pizza congelada',
      qty: 1,
      category: 'Frozen Foods',
      transactionId: 'tx-10',
      date: '2026-02-20',
      merchant: 'Lider',
    }

    mockGetUserTransactions.mockResolvedValue([{ id: 'tx-10' }])
    mockGetAllMappings.mockResolvedValue(mappings)
    mockExtractCookingItems.mockReturnValue([pizzaItem])
    mockGetUnmappedItems.mockReturnValue([])
    mockAddPreparedToPantry.mockResolvedValue(undefined)

    await useMappingStore.getState().loadItems('user-1')

    expect(mockAddPreparedToPantry).toHaveBeenCalledWith(
      'user-1',
      'Pizza congelada',
      'pizza congelada',
      'tx-10',
    )
    expect(mockGetCanonicalIngredient).not.toHaveBeenCalled()
    expect(useMappingStore.getState().autoResolvedCount).toBe(1)
  })
})

describe('skipItem', () => {
  it('moves item from unmapped to skipped list without creating a mapping', () => {
    useMappingStore.setState({
      unmappedItems: [sampleItem, sampleItem2],
      selectedItem: sampleItem,
    })

    useMappingStore.getState().skipItem(sampleItem)

    const state = useMappingStore.getState()
    expect(state.unmappedItems).toHaveLength(1)
    expect(state.unmappedItems[0].normalizedName).toBe('arroz largo')
    expect(state.skippedItems).toHaveLength(1)
    expect(state.skippedItems[0].normalizedName).toBe('tomate cherry')
    expect(state.selectedItem).toBeNull()
    expect(mockCreateMapping).not.toHaveBeenCalled()
  })
})

describe('restoreItem', () => {
  it('moves item from skipped back to unmapped list', () => {
    useMappingStore.setState({
      unmappedItems: [sampleItem2],
      skippedItems: [sampleItem],
    })

    useMappingStore.getState().restoreItem(sampleItem)

    const state = useMappingStore.getState()
    expect(state.skippedItems).toHaveLength(0)
    expect(state.unmappedItems).toHaveLength(2)
    expect(state.unmappedItems[1].normalizedName).toBe('tomate cherry')
  })

  it('does not affect other skipped items', () => {
    useMappingStore.setState({
      unmappedItems: [],
      skippedItems: [sampleItem, sampleItem2],
    })

    useMappingStore.getState().restoreItem(sampleItem)

    const state = useMappingStore.getState()
    expect(state.skippedItems).toHaveLength(1)
    expect(state.skippedItems[0].normalizedName).toBe('arroz largo')
  })
})

describe('setSelectedItem', () => {
  it('sets the selected item', () => {
    useMappingStore.getState().setSelectedItem(sampleItem)
    expect(useMappingStore.getState().selectedItem).toBe(sampleItem)
  })

  it('clears the selected item with null', () => {
    useMappingStore.setState({ selectedItem: sampleItem })
    useMappingStore.getState().setSelectedItem(null)
    expect(useMappingStore.getState().selectedItem).toBeNull()
  })
})

describe('clearError', () => {
  it('clears the error state', () => {
    useMappingStore.setState({ error: 'some-error' })
    useMappingStore.getState().clearError()
    expect(useMappingStore.getState().error).toBeNull()
  })
})
