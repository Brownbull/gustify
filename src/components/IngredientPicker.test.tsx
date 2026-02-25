import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { CanonicalIngredient } from '@/types/ingredient'

const mockGetCanonicalIngredients = vi.fn()

vi.mock('@/services/ingredients', () => ({
  getCanonicalIngredients: () => mockGetCanonicalIngredients(),
}))

import IngredientPicker from './IngredientPicker'

const sampleIngredients: CanonicalIngredient[] = [
  {
    id: 'tomato',
    names: { es: 'Tomate', en: 'Tomato' },
    category: 'Vegetable',
    icon: '🍅',
    defaultUnit: 'kg',
    shelfLifeDays: 7,
    substitutions: [],
  },
  {
    id: 'rice',
    names: { es: 'Arroz', en: 'Rice' },
    category: 'Grain',
    icon: '🍚',
    defaultUnit: 'kg',
    shelfLifeDays: 365,
    substitutions: [],
  },
  {
    id: 'chicken',
    names: { es: 'Pollo', en: 'Chicken' },
    category: 'Protein',
    icon: '🍗',
    defaultUnit: 'kg',
    shelfLifeDays: 3,
    substitutions: [],
  },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetCanonicalIngredients.mockResolvedValue(sampleIngredients)
})

describe('IngredientPicker', () => {
  it('shows category headers after loading, all collapsed by default', async () => {
    render(
      <IngredientPicker
        onSelect={vi.fn()}
        onSkip={vi.fn()}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(screen.getByText('Proteínas')).toBeInTheDocument()
    })
    expect(screen.getByText('Verduras')).toBeInTheDocument()
    expect(screen.getByText('Cereales')).toBeInTheDocument()

    // Individual ingredients should NOT be visible (collapsed)
    expect(screen.queryByText('Tomate')).not.toBeInTheDocument()
    expect(screen.queryByText('Arroz')).not.toBeInTheDocument()
    expect(screen.queryByText('Pollo')).not.toBeInTheDocument()
  })

  it('expands a category when header is clicked', async () => {
    const user = userEvent.setup()

    render(
      <IngredientPicker
        onSelect={vi.fn()}
        onSkip={vi.fn()}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(screen.getByText('Verduras')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Verduras'))

    expect(screen.getByText('Tomate')).toBeInTheDocument()
    // Other categories remain collapsed
    expect(screen.queryByText('Arroz')).not.toBeInTheDocument()
    expect(screen.queryByText('Pollo')).not.toBeInTheDocument()
  })

  it('collapses a category when expanded header is clicked again', async () => {
    const user = userEvent.setup()

    render(
      <IngredientPicker
        onSelect={vi.fn()}
        onSkip={vi.fn()}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(screen.getByText('Verduras')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Verduras'))
    expect(screen.getByText('Tomate')).toBeInTheDocument()

    await user.click(screen.getByText('Verduras'))
    expect(screen.queryByText('Tomate')).not.toBeInTheDocument()
  })

  it('shows flat filtered list when searching', async () => {
    const user = userEvent.setup()

    render(
      <IngredientPicker
        onSelect={vi.fn()}
        onSkip={vi.fn()}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(screen.getByText('Verduras')).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Buscar ingrediente...'), 'arroz')

    // Matching ingredient visible
    expect(screen.getByText('Arroz')).toBeInTheDocument()
    // Non-matching hidden
    expect(screen.queryByText('Tomate')).not.toBeInTheDocument()
    expect(screen.queryByText('Pollo')).not.toBeInTheDocument()
    // Category headers hidden during search
    expect(screen.queryByText('Verduras')).not.toBeInTheDocument()
    expect(screen.queryByText('Cereales')).not.toBeInTheDocument()
  })

  it('returns to accordion view when search is cleared', async () => {
    const user = userEvent.setup()

    render(
      <IngredientPicker
        onSelect={vi.fn()}
        onSkip={vi.fn()}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(screen.getByText('Verduras')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Buscar ingrediente...')
    await user.type(searchInput, 'arroz')
    expect(screen.queryByText('Verduras')).not.toBeInTheDocument()

    await user.clear(searchInput)
    expect(screen.getByText('Verduras')).toBeInTheDocument()
    expect(screen.getByText('Cereales')).toBeInTheDocument()
  })

  it('selects ingredient and confirms with Asignar from expanded category', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <IngredientPicker
        onSelect={onSelect}
        onSkip={vi.fn()}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(screen.getByText('Verduras')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Verduras'))
    await user.click(screen.getByText('Tomate'))

    // Not confirmed yet
    expect(onSelect).not.toHaveBeenCalled()
    // Asignar button appears with ingredient name
    expect(screen.getByRole('button', { name: /Asignar.*Tomate/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Asignar.*Tomate/ }))
    expect(onSelect).toHaveBeenCalledWith(sampleIngredients[0])
  })

  it('selects ingredient and confirms with Asignar from search results', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <IngredientPicker
        onSelect={onSelect}
        onSkip={vi.fn()}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(screen.getByText('Verduras')).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Buscar ingrediente...'), 'tomate')
    await user.click(screen.getByText('Tomate'))

    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /Asignar.*Tomate/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Asignar.*Tomate/ }))
    expect(onSelect).toHaveBeenCalledWith(sampleIngredients[0])
  })

  it('does not show Asignar button when no ingredient is selected', async () => {
    render(
      <IngredientPicker
        onSelect={vi.fn()}
        onSkip={vi.fn()}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(screen.getByText('Verduras')).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /Asignar/ })).not.toBeInTheDocument()
  })

  it('clears selection when search term changes', async () => {
    const user = userEvent.setup()

    render(
      <IngredientPicker
        onSelect={vi.fn()}
        onSkip={vi.fn()}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(screen.getByText('Verduras')).toBeInTheDocument()
    })

    // Select an ingredient via search
    await user.type(screen.getByPlaceholderText('Buscar ingrediente...'), 'tomate')
    await user.click(screen.getByText('Tomate'))
    expect(screen.getByRole('button', { name: /Asignar.*Tomate/ })).toBeInTheDocument()

    // Change search → selection cleared
    await user.type(screen.getByPlaceholderText('Buscar ingrediente...'), 'x')
    expect(screen.queryByRole('button', { name: /Asignar/ })).not.toBeInTheDocument()
  })

  it('calls onSkip when Omitir button is clicked', async () => {
    const user = userEvent.setup()
    const onSkip = vi.fn()

    render(
      <IngredientPicker
        onSelect={vi.fn()}
        onSkip={onSkip}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(screen.getByText('Omitir')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Omitir'))

    expect(onSkip).toHaveBeenCalledOnce()
  })

  it('renders Comida preparada button when onMarkPrepared is provided', async () => {
    render(
      <IngredientPicker
        onSelect={vi.fn()}
        onSkip={vi.fn()}
        onMarkPrepared={vi.fn()}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(screen.getByText(/Comida preparada/)).toBeInTheDocument()
    })
  })

  it('does not render Comida preparada button when onMarkPrepared is not provided', async () => {
    render(
      <IngredientPicker
        onSelect={vi.fn()}
        onSkip={vi.fn()}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(screen.getByText('Omitir')).toBeInTheDocument()
    })
    expect(screen.queryByText(/Comida preparada/)).not.toBeInTheDocument()
  })

  it('calls onMarkPrepared when Comida preparada button is clicked', async () => {
    const user = userEvent.setup()
    const onMarkPrepared = vi.fn()

    render(
      <IngredientPicker
        onSelect={vi.fn()}
        onSkip={vi.fn()}
        onMarkPrepared={onMarkPrepared}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(screen.getByText(/Comida preparada/)).toBeInTheDocument()
    })

    await user.click(screen.getByText(/Comida preparada/))

    expect(onMarkPrepared).toHaveBeenCalledOnce()
  })

  it('renders error message when loading fails', async () => {
    mockGetCanonicalIngredients.mockRejectedValue(new Error('network'))

    render(
      <IngredientPicker
        onSelect={vi.fn()}
        onSkip={vi.fn()}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(
        screen.getByText('Error al cargar ingredientes'),
      ).toBeInTheDocument()
    })
  })
})
