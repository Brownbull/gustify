import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import RecipeFilters from './RecipeFilters'

// Mock the recipe store
const mockSetSearchQuery = vi.fn()
const mockSetCuisineFilter = vi.fn()
const mockSetComplexityFilter = vi.fn()
const mockClearFilters = vi.fn()

let mockStoreState = {
  searchQuery: '',
  cuisineFilter: null as string | null,
  complexityFilter: null as [number, number] | null,
  setSearchQuery: mockSetSearchQuery,
  setCuisineFilter: mockSetCuisineFilter,
  setComplexityFilter: mockSetComplexityFilter,
  clearFilters: mockClearFilters,
}

vi.mock('@/stores/recipeStore', () => ({
  useRecipeStore: (selector: (s: typeof mockStoreState) => unknown) => selector(mockStoreState),
}))

const CUISINES = ['Chilena', 'Italiana', 'Peruana']

describe('RecipeFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockStoreState = {
      searchQuery: '',
      cuisineFilter: null,
      complexityFilter: null,
      setSearchQuery: mockSetSearchQuery,
      setCuisineFilter: mockSetCuisineFilter,
      setComplexityFilter: mockSetComplexityFilter,
      clearFilters: mockClearFilters,
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders search bar with placeholder', () => {
    render(<RecipeFilters cuisines={CUISINES} />)
    expect(screen.getByPlaceholderText('Buscar recetas...')).toBeInTheDocument()
  })

  it('renders cuisine pills', () => {
    render(<RecipeFilters cuisines={CUISINES} />)
    expect(screen.getByText('Chilena')).toBeInTheDocument()
    expect(screen.getByText('Italiana')).toBeInTheDocument()
    expect(screen.getByText('Peruana')).toBeInTheDocument()
  })

  it('renders complexity segmented control', () => {
    render(<RecipeFilters cuisines={CUISINES} />)
    expect(screen.getByText('Todas')).toBeInTheDocument()
    expect(screen.getByText('Facil')).toBeInTheDocument()
    expect(screen.getByText('Media')).toBeInTheDocument()
    expect(screen.getByText('Dificil')).toBeInTheDocument()
  })

  it('calls setSearchQuery with debounce on typing', () => {
    render(<RecipeFilters cuisines={CUISINES} />)
    const input = screen.getByPlaceholderText('Buscar recetas...')

    fireEvent.change(input, { target: { value: 'pollo' } })

    // Should not be called immediately (debounce)
    expect(mockSetSearchQuery).not.toHaveBeenCalled()

    // After debounce
    act(() => { vi.advanceTimersByTime(300) })
    expect(mockSetSearchQuery).toHaveBeenCalledWith('pollo')
  })

  it('calls setCuisineFilter on cuisine pill click', () => {
    render(<RecipeFilters cuisines={CUISINES} />)
    fireEvent.click(screen.getByText('Chilena'))
    expect(mockSetCuisineFilter).toHaveBeenCalledWith('Chilena')
  })

  it('deselects cuisine when clicking active cuisine', () => {
    mockStoreState.cuisineFilter = 'Chilena'
    render(<RecipeFilters cuisines={CUISINES} />)
    fireEvent.click(screen.getByText('Chilena'))
    expect(mockSetCuisineFilter).toHaveBeenCalledWith(null)
  })

  it('calls setComplexityFilter on complexity button click', () => {
    render(<RecipeFilters cuisines={CUISINES} />)
    fireEvent.click(screen.getByText('Facil'))
    expect(mockSetComplexityFilter).toHaveBeenCalledWith([1, 2])
  })

  it('calls setComplexityFilter(null) when clicking Todas', () => {
    render(<RecipeFilters cuisines={CUISINES} />)
    fireEvent.click(screen.getByText('Todas'))
    expect(mockSetComplexityFilter).toHaveBeenCalledWith(null)
  })

  it('does not show clear button when no filters active', () => {
    render(<RecipeFilters cuisines={CUISINES} />)
    expect(screen.queryByText('Limpiar filtros')).not.toBeInTheDocument()
  })

  it('shows clear button when search query is active', () => {
    mockStoreState.searchQuery = 'pollo'
    render(<RecipeFilters cuisines={CUISINES} />)
    expect(screen.getByText('Limpiar filtros')).toBeInTheDocument()
  })

  it('calls clearFilters on clear button click', () => {
    mockStoreState.searchQuery = 'pollo'
    render(<RecipeFilters cuisines={CUISINES} />)
    fireEvent.click(screen.getByText('Limpiar filtros'))
    expect(mockClearFilters).toHaveBeenCalledTimes(1)
  })
})
