import { useState, useEffect, useRef } from 'react'
import { useRecipeStore } from '@/stores/recipeStore'

interface RecipeFiltersProps {
  cuisines: string[]
}

const COMPLEXITY_OPTIONS: { label: string; value: [number, number] | null }[] = [
  { label: 'Todas', value: null },
  { label: 'Facil', value: [1, 2] },
  { label: 'Media', value: [3, 3] },
  { label: 'Dificil', value: [4, 5] },
]

export default function RecipeFilters({ cuisines }: RecipeFiltersProps) {
  const searchQuery = useRecipeStore((s) => s.searchQuery)
  const cuisineFilter = useRecipeStore((s) => s.cuisineFilter)
  const complexityFilter = useRecipeStore((s) => s.complexityFilter)
  const setSearchQuery = useRecipeStore((s) => s.setSearchQuery)
  const setCuisineFilter = useRecipeStore((s) => s.setCuisineFilter)
  const setComplexityFilter = useRecipeStore((s) => s.setComplexityFilter)
  const clearFilters = useRecipeStore((s) => s.clearFilters)

  const [localSearch, setLocalSearch] = useState(searchQuery)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync localSearch when store clears
  useEffect(() => {
    if (searchQuery === '' && localSearch !== '') {
      setLocalSearch('')
    }
  }, [searchQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value)
    }, 300)
  }

  const hasActiveFilters = searchQuery !== '' || cuisineFilter !== null || complexityFilter !== null

  return (
    <div className="space-y-3 px-4 pt-2 pb-1" data-testid="recipe-filters">
      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar recetas..."
          className="w-full rounded-lg border border-primary/20 bg-surface-light py-2 pr-9 pl-3 text-sm text-primary-dark placeholder:text-primary-dark/40 focus:border-primary focus:outline-none"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => handleSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-dark/40 hover:text-primary-dark"
            aria-label="Limpiar busqueda"
          >
            ✕
          </button>
        )}
      </div>

      {/* Cuisine pills */}
      {cuisines.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1" data-testid="cuisine-filters">
          {cuisines.map((cuisine) => (
            <button
              key={cuisine}
              type="button"
              onClick={() => setCuisineFilter(cuisineFilter === cuisine ? null : cuisine)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                cuisineFilter === cuisine
                  ? 'bg-primary text-white'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      )}

      {/* Complexity segmented control */}
      <div className="flex rounded-lg bg-primary/5 p-0.5" data-testid="complexity-filters">
        {COMPLEXITY_OPTIONS.map((opt) => {
          const isActive =
            opt.value === null
              ? complexityFilter === null
              : complexityFilter?.[0] === opt.value[0] && complexityFilter?.[1] === opt.value[1]

          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => setComplexityFilter(opt.value)}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-primary-dark/50 hover:text-primary-dark/70'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-xs font-medium text-primary underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
