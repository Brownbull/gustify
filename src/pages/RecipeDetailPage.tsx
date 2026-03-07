import { useParams, Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useRecipeStore } from '@/stores/recipeStore'
import { usePantryStore } from '@/stores/pantryStore'
import { getRecipeById } from '@/services/recipes'
import { COMPLEXITY_LABELS } from '@/lib/recipe-constants'
import { sanitizeText } from '@/lib/sanitize'
import type { StoredRecipe } from '@/types/recipe'

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const recipes = useRecipeStore((s) => s.recipes)
  const pantryItems = usePantryStore((s) => s.items)
  const [recipe, setRecipe] = useState<StoredRecipe | null | undefined>(undefined)

  useEffect(() => {
    if (!id) {
      setRecipe(null)
      return
    }

    // Try store first
    const fromStore = recipes.find((r) => r.id === id)
    if (fromStore) {
      setRecipe(fromStore)
      return
    }

    // Fallback: fetch by ID
    let cancelled = false
    getRecipeById(id)
      .then((result) => {
        if (!cancelled) setRecipe(result)
      })
      .catch(() => {
        if (!cancelled) setRecipe(null)
      })
    return () => { cancelled = true }
  }, [id, recipes])

  // Build pantry lookup for availability indicators (must be before early returns)
  const pantryLookup = useMemo(() => {
    const canonicalIds = new Set(pantryItems.map((p) => p.canonicalId))
    const namesLower = new Set(pantryItems.map((p) => p.name.toLowerCase()))
    return { canonicalIds, namesLower }
  }, [pantryItems])

  // Loading state
  if (recipe === undefined) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6" data-testid="recipe-detail-loading">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        <p className="text-sm text-primary-dark/60">Cargando receta...</p>
      </div>
    )
  }

  // Not found state
  if (!recipe) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center" data-testid="recipe-not-found">
        <span className="text-5xl">🔍</span>
        <h2 className="text-lg font-semibold text-primary-dark">Receta no encontrada</h2>
        <p className="max-w-xs text-sm text-primary-dark/60">
          La receta que buscas no existe o fue eliminada.
        </p>
        <Link
          to="/recipes"
          className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Ver recetas
        </Link>
      </div>
    )
  }

  function hasIngredient(ing: { canonicalId?: string; name: string }): boolean {
    if (ing.canonicalId && pantryLookup.canonicalIds.has(ing.canonicalId)) return true
    return pantryLookup.namesLower.has(ing.name.toLowerCase())
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto" data-testid="recipe-detail">
      {/* Back link */}
      <div className="px-4 pt-4">
        <Link to="/recipes" className="text-sm text-primary hover:underline">
          ← Recetas
        </Link>
      </div>

      <div className="px-4 pb-6">
        {/* Header */}
        <div className="mt-3" data-testid="recipe-header">
          <h2 className="text-xl font-bold text-primary-dark">{sanitizeText(recipe.name)}</h2>
          <p className="mt-1 text-sm text-primary-dark/60">{sanitizeText(recipe.description)}</p>

          {/* Meta */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-primary-dark/50">
            <span>{sanitizeText(recipe.cuisine)}</span>
            <span className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    i < recipe.complexity ? 'bg-primary' : 'bg-primary/20'
                  }`}
                />
              ))}
              <span className="ml-0.5">{COMPLEXITY_LABELS[recipe.complexity]}</span>
            </span>
            <span>Prep: {recipe.prepTime} min</span>
            <span>Coccion: {recipe.cookTime} min</span>
            <span>{recipe.servings} porciones</span>
          </div>

          {/* Techniques */}
          {recipe.techniques.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {recipe.techniques.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {sanitizeText(tech)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Ingredients */}
        <h3 className="mt-6 text-sm font-semibold text-primary-dark">Ingredientes</h3>
        <ul className="mt-2 space-y-1.5" data-testid="recipe-ingredients">
          {recipe.ingredients.map((ing, idx) => {
            const available = hasIngredient(ing)
            return (
              <li
                key={ing.canonicalId ?? `${ing.name}-${idx}`}
                className="flex items-center gap-2 text-sm text-primary-dark"
              >
                <span
                  className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                    available ? 'bg-green-500' : 'bg-red-400'
                  }`}
                  aria-label={available ? 'Disponible' : 'Faltante'}
                />
                {ing.quantity} {sanitizeText(ing.unit)} {sanitizeText(ing.name)}
              </li>
            )
          })}
        </ul>

        {/* Steps */}
        <h3 className="mt-6 text-sm font-semibold text-primary-dark">Pasos</h3>
        <ol className="mt-2 space-y-3" data-testid="recipe-steps">
          {recipe.steps.map((step) => (
            <li key={step.order} className="flex gap-3 text-sm text-primary-dark/70">
              <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {step.order}
              </span>
              <span className="leading-relaxed">{sanitizeText(step.instruction)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
