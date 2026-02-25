import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ExtractedItem } from '@/services/gastify-transactions'
import type { CanonicalIngredient } from '@/types/ingredient'
import IngredientPicker from './IngredientPicker'

interface IngredientPickerModalProps {
  item: ExtractedItem
  onSelect: (ingredient: CanonicalIngredient) => void
  onSkip: () => void
  onMarkPrepared: () => void
  onClose: () => void
}

export default function IngredientPickerModal({
  item,
  onSelect,
  onSkip,
  onMarkPrepared,
  onClose,
}: IngredientPickerModalProps) {
  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        data-testid="modal-backdrop"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className="fixed inset-x-0 bottom-0 top-4 z-50 flex flex-col rounded-t-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-primary/10 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-primary-dark/60">
              Asignar ingrediente para:
            </p>
            <p className="truncate font-medium text-primary-dark">
              {item.originalName}
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar selector"
            onClick={onClose}
            className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-primary-dark/40 transition-colors hover:bg-surface hover:text-primary-dark"
          >
            &#10005;
          </button>
        </div>

        {/* Picker body */}
        <div className="flex flex-1 flex-col overflow-hidden pt-3">
          <IngredientPicker
            onSelect={onSelect}
            onSkip={onSkip}
            onMarkPrepared={onMarkPrepared}
          />
        </div>
      </div>
    </>,
    document.body,
  )
}
