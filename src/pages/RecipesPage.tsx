import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { usePantryStore } from '@/stores/pantryStore'
import { useRecipeStore } from '@/stores/recipeStore'
import RecipeCard from '@/components/RecipeCard'
import type { Recipe } from '@/types/recipe'

interface RecipesPageProps {
  onNavigateToPantry: () => void
}

export default function RecipesPage({ onNavigateToPantry }: RecipesPageProps) {
  const user = useAuthStore((s) => s.user)
  const pantryItems = usePantryStore((s) => s.items)
  const pantryLoading = usePantryStore((s) => s.loading)
  const recipes = useRecipeStore((s) => s.recipes)
  const loading = useRecipeStore((s) => s.loading)
  const error = useRecipeStore((s) => s.error)
  const fetchSuggestions = useRecipeStore((s) => s.fetchSuggestions)

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  const nonExpiredItems = pantryItems.filter((i) => i.expiryStatus !== 'expired')
  const hasPantryItems = nonExpiredItems.length > 0

  function handleGenerate() {
    if (!user || !hasPantryItems) return
    fetchSuggestions(user.uid, pantryItems)
  }

  // Empty pantry state
  if (!pantryLoading && !hasPantryItems && recipes.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-5xl">🍳</span>
        <h2 className="text-lg font-semibold text-primary-dark">Sin ingredientes</h2>
        <p className="max-w-xs text-sm text-primary-dark/60">
          Agrega ingredientes a tu despensa para recibir sugerencias de recetas personalizadas.
        </p>
        <button
          type="button"
          onClick={onNavigateToPantry}
          className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Ir a Despensa
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-primary-dark">Recetas</h2>
          {recipes.length > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {recipes.length}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Generate button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !hasPantryItems}
          className="mb-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          data-testid="generate-recipes-btn"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generando sugerencias...
            </span>
          ) : recipes.length > 0 ? (
            'Generar nuevas sugerencias'
          ) : (
            'Generar sugerencias'
          )}
        </button>

        {/* Pantry summary */}
        {hasPantryItems && recipes.length === 0 && !loading && (
          <p className="mb-4 text-center text-xs text-primary-dark/50">
            {nonExpiredItems.length} ingredientes disponibles en tu despensa
          </p>
        )}

        {/* Error state */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={handleGenerate}
              className="mt-2 text-xs font-medium text-red-600 underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Recipe list */}
        {recipes.length > 0 && (
          <div className="space-y-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={setSelectedRecipe}
              />
            ))}
          </div>
        )}

        {/* Recipe detail modal (basic, full detail is Issue #10) */}
        {selectedRecipe && (
          <RecipeDetailModal
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
          />
        )}
      </div>
    </div>
  )
}

function RecipeDetailModal({
  recipe,
  onClose,
}: {
  recipe: Recipe
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
              className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
                recipe.pantryMatchPct >= 80
                  ? 'bg-green-100 text-green-700'
                  : recipe.pantryMatchPct >= 50
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
              }`}
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
            {recipe.ingredients.map((ing, i) => (
              <li
                key={i}
                className={`flex items-center gap-2 text-sm ${
                  ing.inPantry ? 'text-primary-dark' : 'text-primary-dark/40'
                }`}
              >
                <span className={`inline-block h-2 w-2 rounded-full ${
                  ing.inPantry ? 'bg-green-500' : 'bg-red-400'
                }`} />
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
