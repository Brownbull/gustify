import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ExtractedItem } from '@/services/gastify-transactions'

const mockLoadItems = vi.fn()
const mockMapItem = vi.fn()
const mockMapPreparedFood = vi.fn()
const mockMarkUnknownIngredient = vi.fn()
const mockMarkUnknownPrepared = vi.fn()
const mockSkipItem = vi.fn()
const mockRestoreItem = vi.fn()
const mockSetSelectedItem = vi.fn()
const mockClearError = vi.fn()

// Mock IngredientPickerModal (replaces inline picker)
vi.mock('@/components/IngredientPickerModal', () => ({
  default: ({ item, onSelect, onSelectPreparedFood, onSkip, onMarkUnknownIngredient, onMarkUnknownPrepared, onClose }: {
    item: { originalName: string }
    onSelect: (ing: unknown) => void
    onSelectPreparedFood: (pf: unknown) => void
    onSkip: () => void
    onMarkUnknownIngredient: () => void
    onMarkUnknownPrepared: () => void
    onClose: () => void
  }) => (
    <div data-testid="ingredient-picker-modal">
      <span>{item.originalName}</span>
      <button onClick={() => onSelect({ id: 'tomato', names: { es: 'Tomate' } })}>
        Select Tomato
      </button>
      <button onClick={() => onSelectPreparedFood({ id: 'pizza', names: { es: 'Pizza' } })}>
        Select Prepared
      </button>
      <button onClick={onMarkUnknownIngredient}>Ingrediente desconocido</button>
      <button onClick={onMarkUnknownPrepared}>Comida preparada desconocida</button>
      <button onClick={onSkip}>Omitir</button>
      <button onClick={onClose}>Cerrar</button>
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
    skippedItems: [],
    mappedCount: 0,
    preparedCount: 0,
    autoResolvedCount: 0,
    loading: false,
    saving: false,
    error: null,
    selectedItem: null,
    loadItems: mockLoadItems,
    mapItem: mockMapItem,
    mapPreparedFood: mockMapPreparedFood,
    markUnknownIngredient: mockMarkUnknownIngredient,
    markUnknownPrepared: mockMarkUnknownPrepared,
    skipItem: mockSkipItem,
    restoreItem: mockRestoreItem,
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

  it('shows empty state when no unmapped or skipped items', () => {
    render(<MapItemsPage />)
    expect(screen.getByText('No hay items nuevos para mapear')).toBeInTheDocument()
  })

  it('does not show empty state when only skipped items exist', () => {
    storeState = {
      ...storeState,
      skippedItems: [sampleItem],
    }

    render(<MapItemsPage />)
    expect(screen.queryByText('No hay items nuevos para mapear')).not.toBeInTheDocument()
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

  it('shows combined mappedCount + preparedCount in Mapeados summary', () => {
    storeState = {
      ...storeState,
      unmappedItems: [sampleItem],
      mappedCount: 3,
      preparedCount: 2,
      autoResolvedCount: 1,
    }

    render(<MapItemsPage />)

    expect(screen.getByText('5')).toBeInTheDocument() // 3 mapped + 2 prepared
    expect(screen.getByText('Mapeados')).toBeInTheDocument()
  })

  it('shows modal when an item is selected', () => {
    storeState = {
      ...storeState,
      unmappedItems: [sampleItem],
      selectedItem: sampleItem,
    }

    render(<MapItemsPage />)

    expect(screen.getByTestId('ingredient-picker-modal')).toBeInTheDocument()
  })

  it('does not show modal when no item is selected', () => {
    storeState = {
      ...storeState,
      unmappedItems: [sampleItem],
    }

    render(<MapItemsPage />)

    expect(screen.queryByTestId('ingredient-picker-modal')).not.toBeInTheDocument()
  })

  it('calls mapPreparedFood via modal', async () => {
    const user = userEvent.setup()
    storeState = {
      ...storeState,
      unmappedItems: [sampleItem],
      selectedItem: sampleItem,
    }

    render(<MapItemsPage />)

    await user.click(screen.getByText('Select Prepared'))
    expect(mockMapPreparedFood).toHaveBeenCalledWith(
      sampleItem,
      { id: 'pizza', names: { es: 'Pizza' } },
      'test-user',
    )
  })

  it('shows Omitidos section when items are skipped', () => {
    storeState = {
      ...storeState,
      skippedItems: [sampleItem],
    }

    render(<MapItemsPage />)

    expect(screen.getByText('Omitidos (1)')).toBeInTheDocument()
    expect(screen.getByText('Tomate Cherry')).toBeInTheDocument()
    expect(screen.getByText('Restaurar')).toBeInTheDocument()
  })

  it('does not show Omitidos section when no items are skipped', () => {
    storeState = {
      ...storeState,
      unmappedItems: [sampleItem],
    }

    render(<MapItemsPage />)

    expect(screen.queryByText(/Omitidos/)).not.toBeInTheDocument()
  })

  it('calls restoreItem when Restaurar button is clicked', async () => {
    const user = userEvent.setup()
    storeState = {
      ...storeState,
      skippedItems: [sampleItem],
    }

    render(<MapItemsPage />)

    await user.click(screen.getByText('Restaurar'))
    expect(mockRestoreItem).toHaveBeenCalledWith(sampleItem)
  })
})
