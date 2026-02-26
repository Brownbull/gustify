import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRecipeStore } from './recipeStore'
import type { EnrichedPantryItem } from '@/types/pantry'
import type { GeminiRecipe } from '@/types/recipe'
import { Timestamp } from 'firebase/firestore'

// Mock Firebase Firestore
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore')
  return {
    ...actual,
    doc: vi.fn(),
    getDoc: vi.fn().mockResolvedValue({
      data: () => ({
        cookingProfile: {
          dietPrefs: [],
          allergies: [],
          proficiencyTier: 'Principiante',
          avgComplexity: 1.5,
          dishesCooked: 3,
          cookedCuisines: ['Chilena'],
          cookedTechniques: ['hervir', 'saltear'],
          cookedIngredients: ['chicken_breast', 'rice'],
        },
      }),
    }),
  }
})

// Mock Firebase config
vi.mock('@/config/firebase', () => ({
  db: {},
}))

// Mock Gemini service
const mockSuggestRecipes = vi.fn()
vi.mock('@/services/gemini', () => ({
  suggestRecipes: (...args: unknown[]) => mockSuggestRecipes(...args),
}))

const MOCK_GEMINI_RECIPES: GeminiRecipe[] = [
  {
    name: 'Arroz con Pollo',
    description: 'Clásico arroz con pollo chileno',
    cuisine: 'Chilena',
    techniques: ['hervir', 'saltear'],
    complexity: 2,
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    ingredients: [
      { name: 'Arroz', quantity: 2, unit: 'taza' },
      { name: 'Pechuga de pollo', quantity: 500, unit: 'g' },
      { name: 'Cebolla', quantity: 1, unit: 'unidad' },
    ],
    steps: [
      { order: 1, instruction: 'Cortar el pollo en trozos', duration: 10 },
      { order: 2, instruction: 'Cocinar el arroz', duration: 20 },
    ],
  },
  {
    name: 'Pasta al Pesto',
    description: 'Pasta italiana con salsa pesto fresca',
    cuisine: 'Italiana',
    techniques: ['hervir', 'mezclar'],
    complexity: 2,
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    ingredients: [
      { name: 'Pasta', quantity: 250, unit: 'g' },
      { name: 'Albahaca', quantity: 30, unit: 'g' },
      { name: 'Ajo', quantity: 2, unit: 'dientes' },
    ],
    steps: [
      { order: 1, instruction: 'Hervir la pasta', duration: 10 },
      { order: 2, instruction: 'Mezclar con pesto', duration: 5 },
    ],
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
    // Reset store state
    useRecipeStore.setState({ recipes: [], loading: false, error: null })
    vi.clearAllMocks()
  })

  it('starts with empty state', () => {
    const state = useRecipeStore.getState()
    expect(state.recipes).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('fetches suggestions and enriches recipes', async () => {
    mockSuggestRecipes.mockResolvedValue({ recipes: MOCK_GEMINI_RECIPES })

    const pantryItems: EnrichedPantryItem[] = [
      makePantryItem({ name: 'Arroz', canonicalId: 'rice' }),
      makePantryItem({ id: 'test-2', name: 'Pechuga de pollo', canonicalId: 'chicken_breast' }),
      makePantryItem({ id: 'test-3', name: 'Cebolla', canonicalId: 'onion' }),
    ]

    await useRecipeStore.getState().fetchSuggestions('test-user', pantryItems)

    const state = useRecipeStore.getState()
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.recipes).toHaveLength(2)

    // First recipe should have higher match (Arroz con Pollo uses all 3 pantry items)
    const arrozConPollo = state.recipes.find((r) => r.name === 'Arroz con Pollo')
    expect(arrozConPollo).toBeDefined()
    expect(arrozConPollo!.pantryMatchPct).toBe(100) // all 3 ingredients in pantry

    // Italian recipe should have novelty badge for cuisine
    const pasta = state.recipes.find((r) => r.name === 'Pasta al Pesto')
    expect(pasta).toBeDefined()
    expect(pasta!.noveltyBadges).toContainEqual({ type: 'cuisine', label: 'Italiana' })
  })

  it('sorts recipes by pantry match descending', async () => {
    mockSuggestRecipes.mockResolvedValue({ recipes: MOCK_GEMINI_RECIPES })

    // Only have rice — Arroz con Pollo will match 1/3, Pasta 0/3
    const pantryItems: EnrichedPantryItem[] = [
      makePantryItem({ name: 'Arroz', canonicalId: 'rice' }),
    ]

    await useRecipeStore.getState().fetchSuggestions('test-user', pantryItems)

    const state = useRecipeStore.getState()
    expect(state.recipes[0].pantryMatchPct).toBeGreaterThanOrEqual(state.recipes[1].pantryMatchPct)
  })

  it('filters out expired pantry items from request', async () => {
    mockSuggestRecipes.mockResolvedValue({ recipes: [] })

    const pantryItems: EnrichedPantryItem[] = [
      makePantryItem({ name: 'Arroz', expiryStatus: 'fresh' }),
      makePantryItem({ id: 'test-2', name: 'Leche', expiryStatus: 'expired' }),
    ]

    await useRecipeStore.getState().fetchSuggestions('test-user', pantryItems)

    expect(mockSuggestRecipes).toHaveBeenCalledWith(
      expect.objectContaining({
        pantryItems: expect.arrayContaining([
          expect.objectContaining({ name: 'Arroz' }),
        ]),
      })
    )

    // Expired item should not be in the request
    const call = mockSuggestRecipes.mock.calls[0][0]
    expect(call.pantryItems).toHaveLength(1)
    expect(call.pantryItems[0].name).toBe('Arroz')
  })

  it('handles errors gracefully', async () => {
    mockSuggestRecipes.mockRejectedValue(new Error('API error'))

    await useRecipeStore.getState().fetchSuggestions('test-user', [
      makePantryItem(),
    ])

    const state = useRecipeStore.getState()
    expect(state.loading).toBe(false)
    expect(state.error).toBe('API error')
    expect(state.recipes).toEqual([])
  })

  it('sets loading state during fetch', async () => {
    let resolvePromise: (v: unknown) => void
    mockSuggestRecipes.mockReturnValue(
      new Promise((resolve) => { resolvePromise = resolve })
    )

    const fetchPromise = useRecipeStore.getState().fetchSuggestions('test-user', [
      makePantryItem(),
    ])

    // Should be loading
    expect(useRecipeStore.getState().loading).toBe(true)

    // Resolve
    resolvePromise!({ recipes: [] })
    await fetchPromise

    expect(useRecipeStore.getState().loading).toBe(false)
  })

  it('clearRecipes resets state', () => {
    useRecipeStore.setState({
      recipes: [{ id: '1', name: 'Test' } as any],
      error: 'some error',
    })

    useRecipeStore.getState().clearRecipes()

    const state = useRecipeStore.getState()
    expect(state.recipes).toEqual([])
    expect(state.error).toBeNull()
  })

  it('detects technique novelty badges', async () => {
    const recipesWithNewTechnique: GeminiRecipe[] = [{
      ...MOCK_GEMINI_RECIPES[0],
      techniques: ['hornear'], // user hasn't baked before
    }]
    mockSuggestRecipes.mockResolvedValue({ recipes: recipesWithNewTechnique })

    await useRecipeStore.getState().fetchSuggestions('test-user', [makePantryItem()])

    const state = useRecipeStore.getState()
    const recipe = state.recipes[0]
    expect(recipe.noveltyBadges).toContainEqual({ type: 'technique', label: 'hornear' })
  })

  it('does not add cuisine badge for already-cooked cuisines', async () => {
    // User has cooked Chilean food already
    mockSuggestRecipes.mockResolvedValue({ recipes: [MOCK_GEMINI_RECIPES[0]] })

    await useRecipeStore.getState().fetchSuggestions('test-user', [makePantryItem()])

    const state = useRecipeStore.getState()
    const recipe = state.recipes[0]
    const cuisineBadges = recipe.noveltyBadges.filter((b) => b.type === 'cuisine')
    expect(cuisineBadges).toHaveLength(0) // Chilena already cooked
  })
})
