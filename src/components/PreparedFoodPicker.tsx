import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { CanonicalPreparedFood } from '@/types/prepared-food'
import type { PreparedFoodCuisine } from '@/types/pantry'
import { getCanonicalPreparedFoods } from '@/services/prepared-foods'
import { CUISINE_COLORS, CUISINE_META, CUISINE_ORDER } from '@/lib/cuisines'

interface PreparedFoodPickerProps {
  onSelect: (preparedFood: CanonicalPreparedFood) => void
}

// Cuisines to show in the accordion (exclude 'unclassified' — only for user-facing pantry items)
const PICKER_CUISINE_ORDER = CUISINE_ORDER.filter((c) => c !== 'unclassified')

export default function PreparedFoodPicker({
  onSelect,
}: PreparedFoodPickerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCuisines, setExpandedCuisines] = useState<Set<PreparedFoodCuisine>>(new Set())
  const [selectedFood, setSelectedFood] = useState<CanonicalPreparedFood | null>(null)

  const {
    data: preparedFoods = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['canonicalPreparedFoods'],
    queryFn: getCanonicalPreparedFoods,
    staleTime: Infinity,
  })

  const filtered = useMemo(
    () => {
      if (!searchTerm) return preparedFoods
      const term = searchTerm.toLowerCase()
      return preparedFoods.filter(
        (pf) =>
          pf.names.es.toLowerCase().includes(term) ||
          pf.names.en.toLowerCase().includes(term),
      )
    },
    [preparedFoods, searchTerm],
  )

  const grouped = useMemo(() => {
    const map = new Map<PreparedFoodCuisine, CanonicalPreparedFood[]>()
    for (const pf of preparedFoods) {
      const list = map.get(pf.cuisine) ?? []
      list.push(pf)
      map.set(pf.cuisine, list)
    }
    return map
  }, [preparedFoods])

  function toggleCuisine(cuisine: PreparedFoodCuisine) {
    setExpandedCuisines((prev) => {
      const next = new Set(prev)
      if (next.has(cuisine)) next.delete(cuisine)
      else next.add(cuisine)
      return next
    })
  }

  const isSearching = searchTerm.length > 0

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setSelectedFood(null) }}
        placeholder="Buscar comida preparada..."
        className="mx-4 mb-3 rounded-md border border-primary/20 bg-surface-light px-3 py-2 text-sm text-primary-dark placeholder:text-primary-dark/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <p className="py-4 text-center text-sm text-red-500">
          Error al cargar comidas preparadas
        </p>
      ) : isSearching ? (
        <ul className="flex-1 space-y-1 overflow-y-auto px-4">
          {filtered.length === 0 && (
            <li className="py-4 text-center text-sm text-primary-dark/50">
              Sin resultados
            </li>
          )}
          {filtered.map((pf) => (
            <li key={pf.id}>
              <button
                type="button"
                onClick={() => setSelectedFood(pf)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-surface ${selectedFood?.id === pf.id ? 'ring-2 ring-primary bg-primary/5' : ''}`}
              >
                <span className="text-lg leading-none">{pf.icon}</span>
                <span className="flex-1 font-medium text-primary-dark">
                  {pf.names.es}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${CUISINE_COLORS[pf.cuisine] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {CUISINE_META[pf.cuisine].label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1 space-y-1 overflow-y-auto px-4">
          {PICKER_CUISINE_ORDER.map((cuisine) => {
            const items = grouped.get(cuisine)
            if (!items || items.length === 0) return null
            const meta = CUISINE_META[cuisine]
            const isExpanded = expandedCuisines.has(cuisine)
            return (
              <div key={cuisine}>
                <button
                  type="button"
                  onClick={() => toggleCuisine(cuisine)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface ${CUISINE_COLORS[cuisine] ?? 'bg-gray-100 text-gray-700'}`}
                  data-testid={`cuisine-${cuisine}`}
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
                    {items.map((pf) => (
                      <li key={pf.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedFood(pf)}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-surface ${selectedFood?.id === pf.id ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                        >
                          <span className="text-lg leading-none">{pf.icon}</span>
                          <span className="flex-1 font-medium text-primary-dark">
                            {pf.names.es}
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

      <div className="shrink-0 px-4 pb-2">
        {selectedFood && (
          <button
            type="button"
            onClick={() => onSelect(selectedFood)}
            className="mt-3 w-full rounded-md bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Asignar: {selectedFood.icon} {selectedFood.names.es}
          </button>
        )}
      </div>
    </div>
  )
}
