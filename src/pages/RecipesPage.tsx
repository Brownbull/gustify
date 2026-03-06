import { useEffect, useState } from 'react'
import { useRecipeStore, type RankedRecipe } from '@/stores/recipeStore'
import { usePantryStore } from '@/stores/pantryStore'
import RecipeCard from '@/components/RecipeCard'
import ErrorBoundary from '@/components/ErrorBoundary'
import { getMatchColorClass } from '@/lib/matchColor'
import type { StoredRecipe } from '@/types/recipe'

interface RecipesPageProps {
  onNavigateToPantry: () => void
}

export default function RecipesPage({ onNavigateToPantry }: RecipesPageProps) {
  const pantryItems = usePantryStore((s) => s.items)
  const pantryLoading = usePantryStore((s) => s.loading)
  const loading = useRecipeStore((s) => s.loading)
  const error = useRecipeStore((s) => s.error)
  const subscribe = useRecipeStore((s) => s.subscribe)
  const unsubscribe = useRecipeStore((s) => s.unsubscribe)
  const getRankedRecipes = useRecipeStore((s) => s.getRankedRecipes)

  const [selectedRecipe, setSelectedRecipe] = useState<RankedRecipe | null>(null)

  useEffect(() => {
    subscribe()
    return () => unsubscribe()
  }, [subscribe, unsubscribe])

  const rankedRecipes = getRankedRecipes()
  const hasPantryItems = pantryItems.length > 0

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6" data-testid="recipe-loading-state">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        <p className="text-sm text-primary-dark/60">Cargando recetas...</p>
      </div>
    )
  }

  // Error state
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

  // Empty state
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-primary-dark">Recetas</h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {rankedRecipes.length}
          </span>
        </div>
        {!pantryLoading && !hasPantryItems && (
          <button
            type="button"
            onClick={onNavigateToPantry}
            className="text-xs font-medium text-primary underline"
          >
            Agregar despensa
          </button>
        )}
      </div>

      <ErrorBoundary>
        <div className="flex-1 overflow-y-auto px-4 pb-4" data-testid="recipe-list">
          <div className="space-y-3">
            {rankedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={setSelectedRecipe}
              />
            ))}
          </div>
        </div>
      </ErrorBoundary>

      {/* Recipe detail modal (basic, full detail is Story 1.5) */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  )
}

function RecipeDetailModal({
  recipe,
  onClose,
}: {
  recipe: StoredRecipe & { pantryMatchPct: number }
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-surface-light pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-primary/20" />
        </div>

        <div className="px-4 pb-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-primary-dark">{recipe.name}</h3>
              <p className="text-sm text-primary-dark/50">{recipe.cuisine}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${getMatchColorClass(recipe.pantryMatchPct)}`}
            >
              {recipe.pantryMatchPct}% match
            </span>
          </div>

          <p className="mt-2 text-sm text-primary-dark/60">{recipe.description}</p>

          {/* Meta */}
          <div className="mt-3 flex gap-4 text-xs text-primary-dark/50">
            <span>Prep: {recipe.prepTime} min</span>
            <span>Coccion: {recipe.cookTime} min</span>
            <span>{recipe.servings} porciones</span>
          </div>

          {/* Ingredients */}
          <h4 className="mt-4 text-sm font-semibold text-primary-dark">Ingredientes</h4>
          <ul className="mt-2 space-y-1.5">
            {recipe.ingredients.map((ing) => (
              <li
                key={ing.canonicalId ?? ing.name}
                className="flex items-center gap-2 text-sm text-primary-dark"
              >
                {ing.quantity} {ing.unit} {ing.name}
              </li>
            ))}
          </ul>

          {/* Steps */}
          <h4 className="mt-4 text-sm font-semibold text-primary-dark">Pasos</h4>
          <ol className="mt-2 space-y-2">
            {recipe.steps.map((step) => (
              <li key={step.order} className="flex gap-3 text-sm text-primary-dark/70">
                <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {step.order}
                </span>
                <span className="leading-relaxed">{step.instruction}</span>
              </li>
            ))}
          </ol>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl border border-primary/20 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
