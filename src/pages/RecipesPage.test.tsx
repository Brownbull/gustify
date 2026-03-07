import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RecipesPage from './RecipesPage'
import type { RankedRecipe } from '@/stores/recipeStore'

// --- Mock stores ---

const mockSubscribe = vi.fn()
const mockUnsubscribe = vi.fn()
const mockGetRankedRecipes = vi.fn<() => RankedRecipe[]>(() => [])
const mockGetFilteredRecipes = vi.fn<() => RankedRecipe[]>(() => [])

let mockRecipeStoreState: Record<string, unknown> = {}

vi.mock('@/stores/recipeStore', () => ({
  useRecipeStore: (selector: (s: Record<string, unknown>) => unknown) => selector(mockRecipeStoreState),
  sanitizeSearch: (raw: string) => raw.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '').toLowerCase().trim(),
}))

let mockPantryStoreState: Record<string, unknown> = {}

vi.mock('@/stores/pantryStore', () => ({
  usePantryStore: (selector: (s: Record<string, unknown>) => unknown) => selector(mockPantryStoreState),
}))

// --- Mock child components ---
vi.mock('@/components/RecipeFilters', () => ({
  default: () => <div data-testid="recipe-filters" />,
}))

vi.mock('@/components/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// --- Test data ---

function makeRankedRecipe(overrides: Partial<RankedRecipe> = {}): RankedRecipe {
  return {
    id: 'recipe-1',
    name: 'Arroz con Pollo',
    description: 'Clasico chileno',
    cuisine: 'Chilena',
    techniques: ['hervir'],
    complexity: 2,
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    ingredients: [
      { name: 'Arroz', quantity: 2, unit: 'taza', canonicalId: 'rice' },
      { name: 'Pollo', quantity: 500, unit: 'g', canonicalId: 'chicken_breast' },
    ],
    steps: [{ order: 1, instruction: 'Cocinar' }],
    pantryMatchPct: 50,
    ...overrides,
  }
}

function setStoreState(overrides: Partial<{
  loading: boolean
  error: string | null
  searchQuery: string
  cuisineFilter: string | null
  complexityFilter: [number, number] | null
  recipes: RankedRecipe[]
  filteredRecipes: RankedRecipe[]
}> = {}) {
  const rankedRecipes = overrides.recipes ?? []
  const filteredRecipes = overrides.filteredRecipes ?? rankedRecipes
  mockGetRankedRecipes.mockReturnValue(rankedRecipes)
  mockGetFilteredRecipes.mockReturnValue(filteredRecipes)

  mockRecipeStoreState = {
    loading: false,
    error: null,
    searchQuery: '',
    cuisineFilter: null,
    complexityFilter: null,
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe,
    getRankedRecipes: mockGetRankedRecipes,
    getFilteredRecipes: mockGetFilteredRecipes,
    ...overrides,
  }

  mockPantryStoreState = {
    items: [],
    loading: false,
  }
}

describe('RecipesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setStoreState({ loading: true })
  })

  // AC-1: Loading state
  it('renders loading spinner when loading is true', () => {
    setStoreState({ loading: true })
    render(<RecipesPage />)

    expect(screen.getByTestId('recipe-loading-state')).toBeInTheDocument()
    expect(screen.getByText('Cargando recetas...')).toBeInTheDocument()
  })

  // AC-2: Empty state
  it('renders empty state when no recipes exist', () => {
    setStoreState({ loading: false, recipes: [] })
    render(<RecipesPage />)

    expect(screen.getByTestId('recipe-empty-state')).toBeInTheDocument()
    expect(screen.getByText('Sin recetas')).toBeInTheDocument()
  })

  // AC-3: Error state
  it('renders error state with retry button when error exists', () => {
    setStoreState({ loading: false, error: 'Firestore error' })
    render(<RecipesPage />)

    expect(screen.getByTestId('recipe-error-state')).toBeInTheDocument()
    expect(screen.getByText('Reintentar')).toBeInTheDocument()
  })

  it('retry button calls unsubscribe then subscribe', () => {
    setStoreState({ loading: false, error: 'Firestore error' })
    render(<RecipesPage />)

    fireEvent.click(screen.getByText('Reintentar'))

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
    expect(mockSubscribe).toHaveBeenCalled()
    // Verify order: unsubscribe called before the subscribe triggered by retry
    const unsubOrder = mockUnsubscribe.mock.invocationCallOrder[0]
    // subscribe is called both on mount (useEffect) and on retry click
    const subscribeOrders = mockSubscribe.mock.invocationCallOrder
    const retrySubscribeOrder = subscribeOrders[subscribeOrders.length - 1]
    expect(unsubOrder).toBeLessThan(retrySubscribeOrder)
  })

  // AC-4: Zero results with active filters
  it('renders no-results state when filters active but no matches', () => {
    const recipes = [makeRankedRecipe()]
    setStoreState({ loading: false, searchQuery: 'sushi', recipes, filteredRecipes: [] })

    render(<RecipesPage />)

    expect(screen.getByTestId('recipe-no-results')).toBeInTheDocument()
    expect(screen.getByText('No se encontraron recetas')).toBeInTheDocument()
  })

  // AC-5: Recipe list renders in ranked order
  it('renders recipe cards in descending match % order', () => {
    const recipes = [
      makeRankedRecipe({ id: 'r1', name: 'High Match', pantryMatchPct: 90 }),
      makeRankedRecipe({ id: 'r2', name: 'Mid Match', pantryMatchPct: 50 }),
      makeRankedRecipe({ id: 'r3', name: 'Low Match', pantryMatchPct: 10 }),
    ]

    setStoreState({ loading: false, recipes })

    render(<RecipesPage />)

    expect(screen.getByTestId('recipe-list')).toBeInTheDocument()
    const cards = screen.getAllByTestId('recipe-card')
    expect(cards).toHaveLength(3)

    // Cards should appear in the order returned by getFilteredRecipes (which is ranked order)
    expect(cards[0]).toHaveTextContent('High Match')
    expect(cards[1]).toHaveTextContent('Mid Match')
    expect(cards[2]).toHaveTextContent('Low Match')
  })

  // subscribe/unsubscribe lifecycle
  it('calls subscribe on mount and unsubscribe on unmount', () => {
    setStoreState({ loading: true })
    const { unmount } = render(<RecipesPage />)

    expect(mockSubscribe).toHaveBeenCalledTimes(1)

    unmount()
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })

  // Recipe count display
  it('shows recipe count badge when recipes loaded', () => {
    const recipes = [
      makeRankedRecipe({ id: 'r1', name: 'Recipe 1' }),
      makeRankedRecipe({ id: 'r2', name: 'Recipe 2' }),
    ]
    setStoreState({ loading: false, recipes })

    render(<RecipesPage />)

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  // Filter count display
  it('shows filtered/total count when filters active', () => {
    const allRecipes = [
      makeRankedRecipe({ id: 'r1', name: 'Recipe 1' }),
      makeRankedRecipe({ id: 'r2', name: 'Recipe 2' }),
      makeRankedRecipe({ id: 'r3', name: 'Recipe 3' }),
    ]
    setStoreState({ loading: false, searchQuery: 'Recipe 1', recipes: allRecipes, filteredRecipes: [allRecipes[0]] })

    render(<RecipesPage />)

    expect(screen.getByText('1/3')).toBeInTheDocument()
  })

  // Navigation to recipe detail
  it('navigates to recipe detail on card click', () => {
    const recipes = [makeRankedRecipe({ id: 'test-recipe-1' })]
    setStoreState({ loading: false, recipes })

    render(<RecipesPage />)

    fireEvent.click(screen.getByTestId('recipe-card'))
    expect(mockNavigate).toHaveBeenCalledWith('/recipes/test-recipe-1')
  })
})
