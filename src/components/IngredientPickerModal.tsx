import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ExtractedItem } from '@/services/gastify-transactions'
import type { CanonicalIngredient } from '@/types/ingredient'
import type { CanonicalPreparedFood } from '@/types/prepared-food'
import IngredientPicker from './IngredientPicker'
import PreparedFoodPicker from './PreparedFoodPicker'
import UnknownItemDialog from './UnknownItemDialog'

type PickerTab = 'ingredients' | 'prepared'

interface IngredientPickerModalProps {
  item: ExtractedItem
  onSelect: (ingredient: CanonicalIngredient) => void
  onSelectPreparedFood: (preparedFood: CanonicalPreparedFood) => void
  onSkip: () => void
  onMarkUnknownIngredient: () => void
  onMarkUnknownPrepared: () => void
  onClose: () => void
}

export default function IngredientPickerModal({
  item,
  onSelect,
  onSelectPreparedFood,
  onSkip,
  onMarkUnknownIngredient,
  onMarkUnknownPrepared,
  onClose,
}: IngredientPickerModalProps) {
  const [activeTab, setActiveTab] = useState<PickerTab>('ingredients')
  const [showUnknownDialog, setShowUnknownDialog] = useState(false)

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

        {/* Segmented Control */}
        <div className="shrink-0 px-4 pt-3">
          <div className="flex rounded-lg bg-surface-dark/50 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('ingredients')}
              className={`flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors ${
                activeTab === 'ingredients'
                  ? 'bg-white text-primary-dark shadow-sm'
                  : 'text-primary-dark/60 hover:text-primary-dark'
              }`}
            >
              Ingredientes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('prepared')}
              className={`flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors ${
                activeTab === 'prepared'
                  ? 'bg-white text-primary-dark shadow-sm'
                  : 'text-primary-dark/60 hover:text-primary-dark'
              }`}
            >
              Preparadas
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="flex flex-1 flex-col overflow-hidden pt-3">
          {activeTab === 'ingredients' ? (
            <IngredientPicker onSelect={onSelect} />
          ) : (
            <PreparedFoodPicker onSelect={onSelectPreparedFood} />
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-primary/10 px-4 py-3">
          {showUnknownDialog ? (
            <UnknownItemDialog
              onMarkUnknownIngredient={onMarkUnknownIngredient}
              onMarkUnknownPrepared={onMarkUnknownPrepared}
              onCancel={() => setShowUnknownDialog(false)}
            />
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowUnknownDialog(true)}
                className="flex-1 rounded-md border border-primary/20 bg-surface-light px-3 py-2.5 text-sm font-medium text-primary-dark transition-colors hover:bg-surface"
              >
                No está en la lista
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="rounded-md px-4 py-2.5 text-sm text-primary-dark/60 transition-colors hover:bg-surface hover:text-primary-dark"
              >
                Omitir
              </button>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  )
}
