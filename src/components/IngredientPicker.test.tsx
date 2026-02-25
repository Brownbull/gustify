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
    defaultUnit: 'kg',
    shelfLifeDays: 7,
    substitutions: [],
  },
  {
    id: 'rice',
    names: { es: 'Arroz', en: 'Rice' },
    category: 'Grain',
    defaultUnit: 'kg',
    shelfLifeDays: 365,
    substitutions: [],
  },
  {
    id: 'chicken',
    names: { es: 'Pollo', en: 'Chicken' },
    category: 'Protein',
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
  it('displays the item name being mapped', async () => {
    render(
      <IngredientPicker
        itemName="Tomate Cherry"
        onSelect={vi.fn()}
        onSkip={vi.fn()}
      />,
      { wrapper: createWrapper() },
    )

    expect(screen.getByText('Tomate Cherry')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument()
    })
  })

  it('shows all ingredients after loading', async () => {
    render(
      <IngredientPicker
        itemName="Test"
        onSelect={vi.fn()}
        onSkip={vi.fn()}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument()
    })
    expect(screen.getByText('Arroz')).toBeInTheDocument()
    expect(screen.getByText('Pollo')).toBeInTheDocument()
  })

  it('filters ingredients by search term', async () => {
    const user = userEvent.setup()

    render(
      <IngredientPicker
        itemName="Test"
        onSelect={vi.fn()}
        onSkip={vi.fn()}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Buscar ingrediente...'), 'arroz')

    expect(screen.getByText('Arroz')).toBeInTheDocument()
    expect(screen.queryByText('Tomate')).not.toBeInTheDocument()
    expect(screen.queryByText('Pollo')).not.toBeInTheDocument()
  })

  it('calls onSelect when an ingredient is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <IngredientPicker
        itemName="Test"
        onSelect={onSelect}
        onSkip={vi.fn()}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Tomate'))

    expect(onSelect).toHaveBeenCalledWith(sampleIngredients[0])
  })

  it('calls onSkip when Omitir button is clicked', async () => {
    const user = userEvent.setup()
    const onSkip = vi.fn()

    render(
      <IngredientPicker
        itemName="Test"
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

  it('renders error message when loading fails', async () => {
    mockGetCanonicalIngredients.mockRejectedValue(new Error('network'))

    render(
      <IngredientPicker
        itemName="Test"
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
