import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRecipeStore } from './recipeStore'
import { usePantryStore } from './pantryStore'
import type { StoredRecipe } from '@/types/recipe'
import type { EnrichedPantryItem } from '@/types/pantry'
import { Timestamp } from 'firebase/firestore'

// Mock recipe service
const mockSubscribeToRecipes = vi.fn()
vi.mock('@/services/recipes', () => ({
  subscribeToRecipes: (...args: unknown[]) => mockSubscribeToRecipes(...args),
}))

// Mock pantryStore
vi.mock('@/stores/pantryStore', () => ({
  usePantryStore: {
    getState: vi.fn(() => ({ items: [] })),
  },
}))

// Mock firebase config (needed by pantryStore import chain)
vi.mock('@/config/firebase', () => ({
  db: {},
}))

const MOCK_RECIPES: StoredRecipe[] = [
  {
    id: 'recipe-1',
    name: 'Arroz con Pollo',
    description: 'Clásico chileno',
    cuisine: 'Chilena',
    techniques: ['hervir', 'saltear'],
    complexity: 2,
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    ingredients: [
      { name: 'Arroz', quantity: 2, unit: 'taza', canonicalId: 'rice' },
      { name: 'Pechuga de pollo', quantity: 500, unit: 'g', canonicalId: 'chicken_breast' },
      { name: 'Cebolla', quantity: 1, unit: 'unidad', canonicalId: 'onion' },
    ],
    steps: [
      { order: 1, instruction: 'Cortar el pollo' },
      { order: 2, instruction: 'Cocinar el arroz' },
    ],
  },
  {
    id: 'recipe-2',
    name: 'Pasta al Pesto',
    description: 'Pasta italiana',
    cuisine: 'Italiana',
    techniques: ['hervir'],
    complexity: 1,
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    ingredients: [
      { name: 'Pasta', quantity: 250, unit: 'g', canonicalId: 'pasta' },
      { name: 'Albahaca', quantity: 30, unit: 'g', canonicalId: 'basil' },
    ],
    steps: [{ order: 1, instruction: 'Hervir la pasta' }],
  },
  {
    id: 'recipe-3',
    name: 'Ceviche Peruano',
    description: 'Pescado fresco marinado en limon',
    cuisine: 'Peruana',
    techniques: ['marinar', 'cortar'],
    complexity: 4,
    prepTime: 30,
    cookTime: 0,
    servings: 4,
    ingredients: [
      { name: 'Pescado', quantity: 500, unit: 'g', canonicalId: 'fish' },
      { name: 'Limon', quantity: 6, unit: 'unidad', canonicalId: 'lemon' },
      { name: 'Cebolla', quantity: 1, unit: 'unidad', canonicalId: 'onion' },
    ],
    steps: [{ order: 1, instruction: 'Cortar el pescado en cubos' }],
  },
]

function makePantryItem(overrides: Partial<EnrichedPantryItem> = {}): EnrichedPantryItem {
  return {
    id: 'test-1',
    canonicalId: 'rice',
    name: 'Arroz',
    quantity: 1,
    unit: 'kg',
    purchasedAt: Timestamp.now(),
    estimatedExpiry: Timestamp.fromDate(new Date(Date.now() + 7 * 86400000)),
    status: 'available',
    icon: '🍚',
    category: 'Grain',
    expiryStatus: 'fresh',
    ...overrides,
  }
}

describe('recipeStore', () => {
  beforeEach(() => {
    // Reset store including filter state
    useRecipeStore.setState({
      recipes: [],
      loading: true,
      error: null,
      searchQuery: '',
      cuisineFilter: null,
      complexityFilter: null,
    })
    // Reset the module-scoped _unsubscribe
    useRecipeStore.getState().unsubscribe()
    vi.clearAllMocks()
  })

  it('starts with loading state', () => {
    const state = useRecipeStore.getState()
    expect(state.recipes).toEqual([])
    expect(state.loading).toBe(true)
    expect(state.error).toBeNull()
  })

  describe('subscribe', () => {
    it('calls subscribeToRecipes and sets recipes on callback', () => {
      const mockUnsub = vi.fn()
      mockSubscribeToRecipes.mockImplementation((callback: (recipes: StoredRecipe[]) => void) => {
        callback(MOCK_RECIPES)
        return mockUnsub
      })

      useRecipeStore.getState().subscribe()

      expect(mockSubscribeToRecipes).toHaveBeenCalledTimes(1)
      const state = useRecipeStore.getState()
      expect(state.recipes).toHaveLength(3)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('sets error on subscription error callback', () => {
      mockSubscribeToRecipes.mockImplementation(
        (_cb: unknown, onError: (err: Error) => void) => {
          onError(new Error('Firestore error'))
          return vi.fn()
        },
      )

      useRecipeStore.getState().subscribe()

      const state = useRecipeStore.getState()
      expect(state.error).toBe('Firestore error')
      expect(state.loading).toBe(false)
    })

    it('does not double-subscribe', () => {
      mockSubscribeToRecipes.mockReturnValue(vi.fn())

      useRecipeStore.getState().subscribe()
      useRecipeStore.getState().subscribe()

      expect(mockSubscribeToRecipes).toHaveBeenCalledTimes(1)
    })
  })

  describe('unsubscribe', () => {
    it('calls the unsubscribe function from the listener', () => {
      const mockUnsub = vi.fn()
      mockSubscribeToRecipes.mockReturnValue(mockUnsub)

      useRecipeStore.getState().subscribe()
      useRecipeStore.getState().unsubscribe()

      expect(mockUnsub).toHaveBeenCalledTimes(1)
    })

    it('allows re-subscribing after unsubscribe', () => {
      mockSubscribeToRecipes.mockReturnValue(vi.fn())

      useRecipeStore.getState().subscribe()
      useRecipeStore.getState().unsubscribe()
      useRecipeStore.getState().subscribe()

      expect(mockSubscribeToRecipes).toHaveBeenCalledTimes(2)
    })
  })

  describe('getRankedRecipes', () => {
    it('sorts recipes by pantry match % descending', () => {
      useRecipeStore.setState({ recipes: MOCK_RECIPES })

      // Pantry has rice, chicken, onion
      // Arroz con Pollo: 3/3=100%, Ceviche: onion 1/3=33%, Pasta: 0/2=0%
      vi.mocked(usePantryStore.getState).mockReturnValue({
        items: [
          makePantryItem({ canonicalId: 'rice', name: 'Arroz' }),
          makePantryItem({ id: 'test-2', canonicalId: 'chicken_breast', name: 'Pechuga de pollo' }),
          makePantryItem({ id: 'test-3', canonicalId: 'onion', name: 'Cebolla' }),
        ],
      } as ReturnType<typeof usePantryStore.getState>)

      const ranked = useRecipeStore.getState().getRankedRecipes()

      expect(ranked[0].name).toBe('Arroz con Pollo')
      expect(ranked[0].pantryMatchPct).toBe(100)
      expect(ranked[2].name).toBe('Pasta al Pesto')
      expect(ranked[2].pantryMatchPct).toBe(0)
    })

    it('returns 0% match when pantry is empty', () => {
      useRecipeStore.setState({ recipes: MOCK_RECIPES })

      vi.mocked(usePantryStore.getState).mockReturnValue({
        items: [],
      } as unknown as ReturnType<typeof usePantryStore.getState>)

      const ranked = useRecipeStore.getState().getRankedRecipes()

      expect(ranked.every((r) => r.pantryMatchPct === 0)).toBe(true)
    })

    it('returns empty array when no recipes', () => {
      useRecipeStore.setState({ recipes: [] })

      const ranked = useRecipeStore.getState().getRankedRecipes()
      expect(ranked).toEqual([])
    })
  })

  describe('filter state', () => {
    it('initializes with empty filters', () => {
      const state = useRecipeStore.getState()
      expect(state.searchQuery).toBe('')
      expect(state.cuisineFilter).toBeNull()
      expect(state.complexityFilter).toBeNull()
    })

    it('setSearchQuery updates searchQuery', () => {
      useRecipeStore.getState().setSearchQuery('pollo')
      expect(useRecipeStore.getState().searchQuery).toBe('pollo')
    })

    it('setCuisineFilter updates cuisineFilter', () => {
      useRecipeStore.getState().setCuisineFilter('Chilena')
      expect(useRecipeStore.getState().cuisineFilter).toBe('Chilena')
    })

    it('setComplexityFilter updates complexityFilter', () => {
      useRecipeStore.getState().setComplexityFilter([1, 2])
      expect(useRecipeStore.getState().complexityFilter).toEqual([1, 2])
    })

    it('clearFilters resets all filters', () => {
      useRecipeStore.getState().setSearchQuery('test')
      useRecipeStore.getState().setCuisineFilter('Chilena')
      useRecipeStore.getState().setComplexityFilter([1, 2])

      useRecipeStore.getState().clearFilters()

      const state = useRecipeStore.getState()
      expect(state.searchQuery).toBe('')
      expect(state.cuisineFilter).toBeNull()
      expect(state.complexityFilter).toBeNull()
    })
  })

  describe('filteredRecipes', () => {
    beforeEach(() => {
      useRecipeStore.setState({ recipes: MOCK_RECIPES, loading: false })
      vi.mocked(usePantryStore.getState).mockReturnValue({
        items: [],
      } as unknown as ReturnType<typeof usePantryStore.getState>)
    })

    it('returns all ranked recipes when no filters active', () => {
      const result = useRecipeStore.getState().getFilteredRecipes()
      expect(result).toHaveLength(3)
    })

    it('filters by search query matching recipe name', () => {
      useRecipeStore.getState().setSearchQuery('pollo')
      const result = useRecipeStore.getState().getFilteredRecipes()
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Arroz con Pollo')
    })

    it('filters by search query matching description', () => {
      useRecipeStore.getState().setSearchQuery('italiana')
      const result = useRecipeStore.getState().getFilteredRecipes()
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Pasta al Pesto')
    })

    it('filters by search query matching ingredient name', () => {
      useRecipeStore.getState().setSearchQuery('albahaca')
      const result = useRecipeStore.getState().getFilteredRecipes()
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Pasta al Pesto')
    })

    it('search is case-insensitive', () => {
      useRecipeStore.getState().setSearchQuery('ARROZ')
      const result = useRecipeStore.getState().getFilteredRecipes()
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Arroz con Pollo')
    })

    it('filters by cuisine', () => {
      useRecipeStore.getState().setCuisineFilter('Italiana')
      const result = useRecipeStore.getState().getFilteredRecipes()
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Pasta al Pesto')
    })

    it('filters by complexity range', () => {
      useRecipeStore.getState().setComplexityFilter([4, 5])
      const result = useRecipeStore.getState().getFilteredRecipes()
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Ceviche Peruano')
    })

    it('applies combined filters with AND logic', () => {
      // Cebolla appears in recipe-1 (Chilena) and recipe-3 (Peruana)
      useRecipeStore.getState().setSearchQuery('cebolla')
      useRecipeStore.getState().setCuisineFilter('Chilena')
      const result = useRecipeStore.getState().getFilteredRecipes()
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Arroz con Pollo')
    })

    it('returns empty array when no recipes match', () => {
      useRecipeStore.getState().setSearchQuery('sushi')
      const result = useRecipeStore.getState().getFilteredRecipes()
      expect(result).toHaveLength(0)
    })

    it('sanitizes search: truncates to 100 chars', () => {
      const longQuery = 'a'.repeat(150)
      useRecipeStore.getState().setSearchQuery(longQuery)
      // Should not crash and should work with truncated query
      const result = useRecipeStore.getState().getFilteredRecipes()
      expect(result).toHaveLength(0) // no recipe matches 100 'a's
    })

    it('sanitizes search: strips regex special chars', () => {
      // 'pollo.*' → sanitized to 'pollo' (strips .*)  → matches Arroz con Pollo
      useRecipeStore.getState().setSearchQuery('pollo.*')
      const result = useRecipeStore.getState().getFilteredRecipes()
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Arroz con Pollo')
    })

    it('applies triple-filter combo (search + cuisine + complexity)', () => {
      // Only Arroz con Pollo matches: has "cebolla" ingredient, is Chilena, complexity 2
      useRecipeStore.getState().setSearchQuery('cebolla')
      useRecipeStore.getState().setCuisineFilter('Chilena')
      useRecipeStore.getState().setComplexityFilter([1, 2])
      const result = useRecipeStore.getState().getFilteredRecipes()
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Arroz con Pollo')
    })
  })
})
