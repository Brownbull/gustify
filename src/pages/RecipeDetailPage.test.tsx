import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RecipeDetailPage from './RecipeDetailPage'

// Mock recipe store
const mockRecipes = [
  {
    id: 'recipe-1',
    name: 'Empanadas de Pino',
    description: 'Clasicas empanadas chilenas rellenas de pino.',
    cuisine: 'Chilena',
    cuisineTags: [],
    tags: [],
    techniques: ['hornear', 'picar'],
    complexity: 3,
    prepTime: 45,
    cookTime: 30,
    servings: 12,
    ingredients: [
      { name: 'Carne molida', quantity: 500, unit: 'g', canonicalId: 'carne-molida' },
      { name: 'Cebolla', quantity: 3, unit: 'unidades', canonicalId: 'cebolla' },
      { name: 'Aceitunas', quantity: 12, unit: 'unidades', canonicalId: 'aceitunas' },
    ],
    steps: [
      { order: 1, instruction: 'Picar la cebolla en cubos pequeños.' },
      { order: 2, instruction: 'Cocinar la carne con la cebolla.' },
      { order: 3, instruction: 'Rellenar las masas y hornear a 200°C.' },
    ],
  },
]

const mockPantryItems = [
  { canonicalId: 'carne-molida', name: 'Carne molida', quantity: 500, unit: 'g' },
  { canonicalId: 'cebolla', name: 'Cebolla', quantity: 3, unit: 'unidades' },
]

vi.mock('@/stores/recipeStore', () => ({
  useRecipeStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ recipes: mockRecipes }),
}))

vi.mock('@/stores/pantryStore', () => ({
  usePantryStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ items: mockPantryItems }),
}))

const mockGetRecipeById = vi.fn().mockResolvedValue(null)

vi.mock('@/services/recipes', () => ({
  getRecipeById: (...args: unknown[]) => mockGetRecipeById(...args),
}))

function renderWithRoute(recipeId: string) {
  return render(
    <MemoryRouter initialEntries={[`/recipes/${recipeId}`]}>
      <Routes>
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RecipeDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders recipe data when valid ID provided', async () => {
    renderWithRoute('recipe-1')

    await waitFor(() => {
      expect(screen.getByTestId('recipe-detail')).toBeInTheDocument()
    })

    expect(screen.getByText('Empanadas de Pino')).toBeInTheDocument()
    expect(screen.getByText(/Clasicas empanadas chilenas/)).toBeInTheDocument()
    expect(screen.getByText('Chilena')).toBeInTheDocument()
    expect(screen.getByText('Intermedio')).toBeInTheDocument()
    expect(screen.getByText('Prep: 45 min')).toBeInTheDocument()
    expect(screen.getByText('Coccion: 30 min')).toBeInTheDocument()
    expect(screen.getByText('12 porciones')).toBeInTheDocument()
  })

  it('renders ingredients with pantry availability', async () => {
    renderWithRoute('recipe-1')

    await waitFor(() => {
      expect(screen.getByTestId('recipe-ingredients')).toBeInTheDocument()
    })

    // All 3 ingredients rendered
    expect(screen.getByText(/Carne molida/)).toBeInTheDocument()
    expect(screen.getByText(/Cebolla/)).toBeInTheDocument()
    expect(screen.getByText(/Aceitunas/)).toBeInTheDocument()

    // Check green/red indicators exist
    const indicators = screen.getByTestId('recipe-ingredients').querySelectorAll('[aria-label]')
    const available = Array.from(indicators).filter((el) => el.getAttribute('aria-label') === 'Disponible')
    const missing = Array.from(indicators).filter((el) => el.getAttribute('aria-label') === 'Faltante')
    expect(available.length).toBe(2) // carne-molida + cebolla
    expect(missing.length).toBe(1) // aceitunas
  })

  it('renders sequential steps', async () => {
    renderWithRoute('recipe-1')

    await waitFor(() => {
      expect(screen.getByTestId('recipe-steps')).toBeInTheDocument()
    })

    expect(screen.getByText('Picar la cebolla en cubos pequeños.')).toBeInTheDocument()
    expect(screen.getByText('Cocinar la carne con la cebolla.')).toBeInTheDocument()
    expect(screen.getByText('Rellenar las masas y hornear a 200°C.')).toBeInTheDocument()
  })

  it('renders techniques as badges', async () => {
    renderWithRoute('recipe-1')

    await waitFor(() => {
      expect(screen.getByText('hornear')).toBeInTheDocument()
    })
    expect(screen.getByText('picar')).toBeInTheDocument()
  })

  it('shows not-found state for invalid ID', async () => {
    renderWithRoute('nonexistent-recipe')

    await waitFor(() => {
      expect(screen.getByTestId('recipe-not-found')).toBeInTheDocument()
    })

    expect(screen.getByText('Receta no encontrada')).toBeInTheDocument()
    expect(screen.getByText('Ver recetas')).toHaveAttribute('href', '/recipes')
  })

  it('shows back link to recipes', async () => {
    renderWithRoute('recipe-1')

    await waitFor(() => {
      expect(screen.getByTestId('recipe-detail')).toBeInTheDocument()
    })

    const backLink = screen.getByText('← Recetas')
    expect(backLink).toHaveAttribute('href', '/recipes')
  })

  it('shows loading state before recipe resolves', () => {
    mockGetRecipeById.mockReturnValue(new Promise(() => {})) // never resolves
    renderWithRoute('unknown-pending')

    expect(screen.getByTestId('recipe-detail-loading')).toBeInTheDocument()
    expect(screen.getByText('Cargando receta...')).toBeInTheDocument()
  })

  it('loads recipe via Firestore fallback when not in store', async () => {
    const firestoreRecipe = {
      ...mockRecipes[0],
      id: 'firestore-only',
      name: 'Cazuela de Ave',
    }
    mockGetRecipeById.mockResolvedValue(firestoreRecipe)

    renderWithRoute('firestore-only')

    await waitFor(() => {
      expect(screen.getByTestId('recipe-detail')).toBeInTheDocument()
    })
    expect(screen.getByText('Cazuela de Ave')).toBeInTheDocument()
    expect(mockGetRecipeById).toHaveBeenCalledWith('firestore-only')
  })

  it('shows not-found when Firestore fetch rejects', async () => {
    mockGetRecipeById.mockRejectedValue(new Error('Network error'))

    renderWithRoute('error-recipe')

    await waitFor(() => {
      expect(screen.getByTestId('recipe-not-found')).toBeInTheDocument()
    })
  })

  it('displays ingredient quantity and unit', async () => {
    renderWithRoute('recipe-1')

    await waitFor(() => {
      expect(screen.getByTestId('recipe-ingredients')).toBeInTheDocument()
    })

    expect(screen.getByText(/500 g Carne molida/)).toBeInTheDocument()
    expect(screen.getByText(/3 unidades Cebolla/)).toBeInTheDocument()
    expect(screen.getByText(/12 unidades Aceitunas/)).toBeInTheDocument()
  })

  it('renders steps in correct order', async () => {
    renderWithRoute('recipe-1')

    await waitFor(() => {
      expect(screen.getByTestId('recipe-steps')).toBeInTheDocument()
    })

    const stepItems = screen.getByTestId('recipe-steps').querySelectorAll('li')
    expect(stepItems).toHaveLength(3)
    expect(stepItems[0]).toHaveTextContent('Picar la cebolla en cubos pequeños.')
    expect(stepItems[1]).toHaveTextContent('Cocinar la carne con la cebolla.')
    expect(stepItems[2]).toHaveTextContent('Rellenar las masas y hornear a 200°C.')
  })
})
