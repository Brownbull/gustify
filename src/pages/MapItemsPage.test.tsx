import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ExtractedItem } from '@/services/gastify-transactions'

const mockLoadItems = vi.fn()
const mockMapItem = vi.fn()
const mockSkipItem = vi.fn()
const mockSetSelectedItem = vi.fn()
const mockClearError = vi.fn()

// Mock IngredientPicker to avoid deeply nested async loading
vi.mock('@/components/IngredientPicker', () => ({
  default: ({ itemName, onSelect, onSkip }: { itemName: string; onSelect: (ing: unknown) => void; onSkip: () => void }) => (
    <div data-testid="ingredient-picker">
      <span>{itemName}</span>
      <button onClick={() => onSelect({ id: 'tomato', names: { es: 'Tomate' } })}>
        Select Tomato
      </button>
      <button onClick={onSkip}>Omitir</button>
    </div>
  ),
}))

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
  transactionId: 'tx-2',
  date: '2026-02-19',
  merchant: 'Lider',
}

// Store state defaults
let storeState: Record<string, unknown> = {}

vi.mock('@/stores/mappingStore', () => ({
  useMappingStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector(storeState),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ user: { uid: 'test-user' } }),
}))

import MapItemsPage from './MapItemsPage'

beforeEach(() => {
  vi.clearAllMocks()
  storeState = {
    unmappedItems: [],
    mappedCount: 0,
    autoResolvedCount: 0,
    loading: false,
    saving: false,
    error: null,
    selectedItem: null,
    loadItems: mockLoadItems,
    mapItem: mockMapItem,
    skipItem: mockSkipItem,
    setSelectedItem: mockSetSelectedItem,
    clearError: mockClearError,
  }
})

describe('MapItemsPage', () => {
  it('shows loading spinner while loading', () => {
    storeState = { ...storeState, loading: true }
    render(<MapItemsPage />)
    expect(screen.getByText('Cargando transacciones...')).toBeInTheDocument()
  })

  it('shows error state with retry button', async () => {
    const user = userEvent.setup()
    storeState = { ...storeState, error: 'Something broke' }

    render(<MapItemsPage />)

    expect(screen.getByText('Something broke')).toBeInTheDocument()

    await user.click(screen.getByText('Reintentar'))
    expect(mockClearError).toHaveBeenCalled()
    expect(mockLoadItems).toHaveBeenCalledWith('test-user')
  })

  it('shows empty state when no unmapped items', () => {
    render(<MapItemsPage />)
    expect(screen.getByText('No hay items nuevos para mapear')).toBeInTheDocument()
  })

  it('renders unmapped items with summary counts', () => {
    storeState = {
      ...storeState,
      unmappedItems: [sampleItem, sampleItem2],
      mappedCount: 3,
      autoResolvedCount: 5,
    }

    render(<MapItemsPage />)

    expect(screen.getByText('2')).toBeInTheDocument() // pending
    expect(screen.getByText('3')).toBeInTheDocument() // mapped
    expect(screen.getByText('5')).toBeInTheDocument() // auto-resolved
    expect(screen.getByText('Tomate Cherry')).toBeInTheDocument()
    expect(screen.getByText('Arroz Largo')).toBeInTheDocument()
  })

  it('shows IngredientPicker when an item is selected', async () => {
    storeState = {
      ...storeState,
      unmappedItems: [sampleItem],
      selectedItem: sampleItem,
    }

    render(<MapItemsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('ingredient-picker')).toBeInTheDocument()
    })
  })
})
