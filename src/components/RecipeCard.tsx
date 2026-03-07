import type { RankedRecipe } from '@/stores/recipeStore'
import { getMatchColorClass } from '@/lib/matchColor'
import { COMPLEXITY_LABELS } from '@/lib/recipe-constants'
import { sanitizeText } from '@/lib/sanitize'

interface RecipeCardProps {
  recipe: RankedRecipe
  onSelect: (recipe: RankedRecipe) => void
}

export default function RecipeCard({ recipe, onSelect }: RecipeCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(recipe)}
      className="w-full rounded-xl border border-primary/10 bg-surface-light p-4 text-left transition-shadow hover:shadow-md"
      data-testid="recipe-card"
    >
      {/* Top row: name + match badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-primary-dark">{sanitizeText(recipe.name)}</h3>
          <p className="mt-0.5 text-xs text-primary-dark/50">{sanitizeText(recipe.cuisine)}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${getMatchColorClass(recipe.pantryMatchPct)}`}
        >
          {recipe.pantryMatchPct}%
        </span>
      </div>

      {/* Description */}
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-primary-dark/60">
        {sanitizeText(recipe.description)}
      </p>

      {/* Meta row */}
      <div className="mt-3 flex items-center gap-3 text-[11px] text-primary-dark/50">
        {/* Complexity */}
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

        <span className="text-primary/20">|</span>

        {/* Time */}
        <span>{recipe.prepTime + recipe.cookTime} min</span>

        <span className="text-primary/20">|</span>

        {/* Ingredient count */}
        <span>
          {recipe.ingredients.length} ing.
        </span>
      </div>
    </button>
  )
}
