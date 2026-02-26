import type { Recipe } from '@/types/recipe'

const COMPLEXITY_LABELS = ['', 'Muy fácil', 'Fácil', 'Intermedio', 'Avanzado', 'Experto']

const NOVELTY_ICONS: Record<string, string> = {
  cuisine: '\uD83C\uDF0D',
  technique: '\uD83D\uDD27',
  ingredient: '\uD83C\uDF31',
}

interface RecipeCardProps {
  recipe: Recipe
  onSelect: (recipe: Recipe) => void
}

export default function RecipeCard({ recipe, onSelect }: RecipeCardProps) {
  const availableCount = recipe.ingredients.filter((i) => i.inPantry).length
  const totalCount = recipe.ingredients.length

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
          <h3 className="truncate text-sm font-semibold text-primary-dark">{recipe.name}</h3>
          <p className="mt-0.5 text-xs text-primary-dark/50">{recipe.cuisine}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
            recipe.pantryMatchPct >= 80
              ? 'bg-green-100 text-green-700'
              : recipe.pantryMatchPct >= 50
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
          }`}
        >
          {recipe.pantryMatchPct}%
        </span>
      </div>

      {/* Description */}
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-primary-dark/60">
        {recipe.description}
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

        {/* Ingredients availability */}
        <span>
          {availableCount}/{totalCount} ing.
        </span>
      </div>

      {/* Novelty badges */}
      {recipe.noveltyBadges.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {recipe.noveltyBadges.map((badge) => (
            <span
              key={`${badge.type}-${badge.label}`}
              className="inline-flex items-center gap-0.5 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700"
            >
              {NOVELTY_ICONS[badge.type]} {badge.label}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
