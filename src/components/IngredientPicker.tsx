import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { CanonicalIngredient } from '@/types/ingredient'
import { getCanonicalIngredients } from '@/services/ingredients'

interface IngredientPickerProps {
  itemName: string
  onSelect: (ingredient: CanonicalIngredient) => void
  onSkip: () => void
}

const CATEGORY_COLORS: Record<string, string> = {
  Protein: 'bg-red-100 text-red-700',
  Vegetable: 'bg-green-100 text-green-700',
  Fruit: 'bg-yellow-100 text-yellow-700',
  Grain: 'bg-amber-100 text-amber-700',
  Dairy: 'bg-blue-100 text-blue-700',
  Spice: 'bg-orange-100 text-orange-700',
  Herb: 'bg-emerald-100 text-emerald-700',
  Condiment: 'bg-purple-100 text-purple-700',
  Other: 'bg-gray-100 text-gray-700',
}

export default function IngredientPicker({
  itemName,
  onSelect,
  onSkip,
}: IngredientPickerProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const {
    data: ingredients = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['canonicalIngredients'],
    queryFn: getCanonicalIngredients,
    staleTime: Infinity,
  })

  const filtered = useMemo(
    () =>
      ingredients.filter((ing) => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return (
          ing.names.es.toLowerCase().includes(term) ||
          ing.names.en.toLowerCase().includes(term)
        )
      }),
    [ingredients, searchTerm],
  )

  return (
    <div className="rounded-lg border border-primary/20 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm text-primary-dark/60">
        Asignar ingrediente para:
      </p>
      <p className="mb-4 font-medium text-primary-dark">{itemName}</p>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar ingrediente..."
        className="mb-3 w-full rounded-md border border-primary/20 bg-surface-light px-3 py-2 text-sm text-primary-dark placeholder:text-primary-dark/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 py-4 text-center">
          Error al cargar ingredientes
        </p>
      ) : (
        <ul className="max-h-60 space-y-1 overflow-y-auto">
          {filtered.length === 0 && (
            <li className="py-4 text-center text-sm text-primary-dark/50">
              Sin resultados
            </li>
          )}
          {filtered.map((ing) => (
            <li key={ing.id}>
              <button
                type="button"
                onClick={() => onSelect(ing)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-surface"
              >
                <span className="flex-1 font-medium text-primary-dark">
                  {ing.names.es}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${CATEGORY_COLORS[ing.category] ?? CATEGORY_COLORS.Other}`}
                >
                  {ing.category}
                </span>
                <span className="text-xs text-primary-dark/40">
                  {ing.defaultUnit}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onSkip}
        className="mt-3 w-full rounded-md border border-primary/10 py-2 text-sm text-primary-dark/60 transition-colors hover:bg-surface hover:text-primary-dark"
      >
        Omitir
      </button>
    </div>
  )
}
