import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecipeStore, sanitizeSearch } from '@/stores/recipeStore'
import { usePantryStore } from '@/stores/pantryStore'
import RecipeCard from '@/components/RecipeCard'
import RecipeFilters from '@/components/RecipeFilters'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function RecipesPage() {
  const navigate = useNavigate()
  const pantryItems = usePantryStore((s) => s.items)
  const pantryLoading = usePantryStore((s) => s.loading)
  const loading = useRecipeStore((s) => s.loading)
  const error = useRecipeStore((s) => s.error)
  const subscribe = useRecipeStore((s) => s.subscribe)
  const unsubscribe = useRecipeStore((s) => s.unsubscribe)
  const getRankedRecipes = useRecipeStore((s) => s.getRankedRecipes)
  const getFilteredRecipes = useRecipeStore((s) => s.getFilteredRecipes)
  const searchQuery = useRecipeStore((s) => s.searchQuery)
  const cuisineFilter = useRecipeStore((s) => s.cuisineFilter)
  const complexityFilter = useRecipeStore((s) => s.complexityFilter)

  useEffect(() => {
    subscribe()
    return () => unsubscribe()
  }, [subscribe, unsubscribe])

  const rankedRecipes = getRankedRecipes()
  const filteredRecipes = getFilteredRecipes()
  const hasPantryItems = pantryItems.length > 0
  const hasActiveFilters = sanitizeSearch(searchQuery) !== '' || cuisineFilter !== null || complexityFilter !== null

  const cuisines = useMemo(
    () => [...new Set(rankedRecipes.map((r) => r.cuisine))].sort(),
    [rankedRecipes],
  )

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6" data-testid="recipe-loading-state">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        <p className="text-sm text-primary-dark/60">Cargando recetas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center" data-testid="recipe-error-state">
        <p className="text-sm text-red-600">Error al cargar recetas. Intenta de nuevo.</p>
        <button
          type="button"
          onClick={() => {
            unsubscribe()
            subscribe()
          }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (rankedRecipes.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center" data-testid="recipe-empty-state">
        <span className="text-5xl">📖</span>
        <h2 className="text-lg font-semibold text-primary-dark">Sin recetas</h2>
        <p className="max-w-xs text-sm text-primary-dark/60">
          Aun no hay recetas disponibles. Pronto se agregaran nuevas recetas al catalogo.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-primary-dark">Recetas</h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {hasActiveFilters ? `${filteredRecipes.length}/${rankedRecipes.length}` : rankedRecipes.length}
          </span>
        </div>
        {!pantryLoading && !hasPantryItems && (
          <button
            type="button"
            onClick={() => navigate('/pantry')}
            className="text-xs font-medium text-primary underline"
          >
            Agregar despensa
          </button>
        )}
      </div>

      <RecipeFilters cuisines={cuisines} />

      <ErrorBoundary>
        {filteredRecipes.length === 0 && hasActiveFilters ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center" data-testid="recipe-no-results">
            <span className="text-3xl">🔍</span>
            <p className="text-sm text-primary-dark/60">No se encontraron recetas</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 pb-4" data-testid="recipe-list">
            <div className="space-y-3">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={(r) => navigate(`/recipes/${r.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </ErrorBoundary>
    </div>
  )
}
