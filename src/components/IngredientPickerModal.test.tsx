import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ExtractedItem } from '@/services/gastify-transactions'

// Mock IngredientPicker and PreparedFoodPicker to keep tests focused on modal behavior
vi.mock('./IngredientPicker', () => ({
  default: ({ onSelect }: { onSelect: (ing: unknown) => void }) => (
    <div data-testid="ingredient-picker">
      <button onClick={() => onSelect({ id: 'tomato' })}>Select</button>
    </div>
  ),
}))

vi.mock('./PreparedFoodPicker', () => ({
  default: ({ onSelect }: { onSelect: (pf: unknown) => void }) => (
    <div data-testid="prepared-food-picker">
      <button onClick={() => onSelect({ id: 'pizza' })}>Select Prepared</button>
    </div>
  ),
}))

import IngredientPickerModal from './IngredientPickerModal'

const sampleItem: ExtractedItem = {
  originalName: 'Tomate Cherry',
  normalizedName: 'tomate cherry',
  qty: 1,
  category: 'Produce',
  transactionId: 'tx-1',
  date: '2026-02-20',
  merchant: 'Jumbo',
}

const defaultProps = {
  item: sampleItem,
  onSelect: vi.fn(),
  onSelectPreparedFood: vi.fn(),
  onSkip: vi.fn(),
  onMarkUnknownIngredient: vi.fn(),
  onMarkUnknownPrepared: vi.fn(),
  onClose: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('IngredientPickerModal', () => {
  it('renders item name and ingredient picker', () => {
    render(<IngredientPickerModal {...defaultProps} />)

    expect(screen.getByText('Tomate Cherry')).toBeInTheDocument()
    expect(screen.getByText('Asignar ingrediente para:')).toBeInTheDocument()
    expect(screen.getByTestId('ingredient-picker')).toBeInTheDocument()
  })

  it('calls onClose when X button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<IngredientPickerModal {...defaultProps} onClose={onClose} />)

    await user.click(screen.getByLabelText('Cerrar selector'))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<IngredientPickerModal {...defaultProps} onClose={onClose} />)

    await user.click(screen.getByTestId('modal-backdrop'))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()

    render(<IngredientPickerModal {...defaultProps} onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose when clicking inside the modal panel', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<IngredientPickerModal {...defaultProps} onClose={onClose} />)

    await user.click(screen.getByText('Tomate Cherry'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('locks body scroll when mounted and restores on unmount', () => {
    const { unmount } = render(<IngredientPickerModal {...defaultProps} />)

    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).toBe('')
  })
})
