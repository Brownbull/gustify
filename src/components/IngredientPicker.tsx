import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { CanonicalIngredient, IngredientCategory } from '@/types/ingredient'
import { getCanonicalIngredients } from '@/services/ingredients'

interface IngredientPickerProps {
  onSelect: (ingredient: CanonicalIngredient) => void
  onSkip: () => void
  onMarkPrepared?: () => void
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

const CATEGORY_META: Record<IngredientCategory, { label: string; icon: string }> = {
  Protein: { label: 'Prote\u00ednas', icon: '\uD83E\uDD69' },
  Vegetable: { label: 'Verduras', icon: '\uD83E\uDD6C' },
  Fruit: { label: 'Frutas', icon: '\uD83C\uDF4E' },
  Grain: { label: 'Cereales', icon: '\uD83C\uDF3E' },
  Dairy: { label: 'L\u00e1cteos', icon: '\uD83E\uDD5B' },
  Spice: { label: 'Especias', icon: '\uD83C\uDF36\uFE0F' },
  Herb: { label: 'Hierbas', icon: '\uD83C\uDF3F' },
  Condiment: { label: 'Condimentos', icon: '\uD83E\uDED2' },
  Other: { label: 'Otros', icon: '\uD83D\uDCE6' },
}

const CATEGORY_ORDER: IngredientCategory[] = [
  'Protein', 'Vegetable', 'Fruit', 'Grain', 'Dairy', 'Spice', 'Herb', 'Condiment', 'Other',
]

export default function IngredientPicker({
  onSelect,
  onSkip,
  onMarkPrepared,
}: IngredientPickerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<IngredientCategory>>(new Set())
  const [selectedIngredient, setSelectedIngredient] = useState<CanonicalIngredient | null>(null)

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
    () => {
      if (!searchTerm) return ingredients
      const term = searchTerm.toLowerCase()
      return ingredients.filter(
        (ing) =>
          ing.names.es.toLowerCase().includes(term) ||
          ing.names.en.toLowerCase().includes(term),
      )
    },
    [ingredients, searchTerm],
  )

  const grouped = useMemo(() => {
    const map = new Map<IngredientCategory, CanonicalIngredient[]>()
    for (const ing of ingredients) {
      const list = map.get(ing.category) ?? []
      list.push(ing)
      map.set(ing.category, list)
    }
    return map
  }, [ingredients])

  function toggleCategory(cat: IngredientCategory) {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const isSearching = searchTerm.length > 0

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setSelectedIngredient(null) }}
        placeholder="Buscar ingrediente..."
        className="mx-4 mb-3 rounded-md border border-primary/20 bg-surface-light px-3 py-2 text-sm text-primary-dark placeholder:text-primary-dark/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <p className="py-4 text-center text-sm text-red-500">
          Error al cargar ingredientes
        </p>
      ) : isSearching ? (
        <ul className="flex-1 space-y-1 overflow-y-auto px-4">
          {filtered.length === 0 && (
            <li className="py-4 text-center text-sm text-primary-dark/50">
              Sin resultados
            </li>
          )}
          {filtered.map((ing) => (
            <li key={ing.id}>
              <button
                type="button"
                onClick={() => setSelectedIngredient(ing)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-surface ${selectedIngredient?.id === ing.id ? 'ring-2 ring-primary bg-primary/5' : ''}`}
              >
                <span className="text-lg leading-none">{ing.icon}</span>
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
      ) : (
        <div className="flex-1 space-y-1 overflow-y-auto px-4">
          {CATEGORY_ORDER.map((cat) => {
            const items = grouped.get(cat)
            if (!items || items.length === 0) return null
            const meta = CATEGORY_META[cat]
            const isExpanded = expandedCategories.has(cat)
            return (
              <div key={cat}>
                <button
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.Other}`}
                  data-testid={`category-${cat}`}
                >
                  <span className="text-base leading-none">{meta.icon}</span>
                  <span className="flex-1 font-medium">{meta.label}</span>
                  <span className="text-xs opacity-70">({items.length})</span>
                  <span className={`text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                    &#9656;
                  </span>
                </button>
                {isExpanded && (
                  <ul className="ml-2 space-y-0.5 border-l-2 border-primary/10 pl-2">
                    {items.map((ing) => (
                      <li key={ing.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedIngredient(ing)}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-surface ${selectedIngredient?.id === ing.id ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                        >
                          <span className="text-lg leading-none">{ing.icon}</span>
                          <span className="flex-1 font-medium text-primary-dark">
                            {ing.names.es}
                          </span>
                          <span className="text-xs text-primary-dark/40">
                            {ing.defaultUnit}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="shrink-0 px-4 pb-4">
        {selectedIngredient && (
          <button
            type="button"
            onClick={() => onSelect(selectedIngredient)}
            className="mt-3 w-full rounded-md bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Asignar: {selectedIngredient.icon} {selectedIngredient.names.es}
          </button>
        )}

        {onMarkPrepared && (
          <button
            type="button"
            onClick={onMarkPrepared}
            className="mt-3 w-full rounded-md border border-amber-300 bg-amber-50 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
          >
            🍱 Comida preparada
          </button>
        )}

        <button
          type="button"
          onClick={onSkip}
          className="mt-2 w-full rounded-md border border-primary/10 py-2 text-sm text-primary-dark/60 transition-colors hover:bg-surface hover:text-primary-dark"
        >
          Omitir
        </button>
      </div>
    </div>
  )
}
