import type { StoredRecipe } from '@/types/recipe'

/**
 * Compute pantry match percentage for a recipe.
 * Matches by canonicalId first, falls back to normalized ingredient name.
 */
export function computePantryMatchPct(
  recipe: StoredRecipe,
  pantryCanonicalIds: Set<string>,
  pantryNamesLower: Set<string>,
): number {
  const { ingredients } = recipe
  if (ingredients.length === 0) return 0

  // Match by canonicalId first; fall back to normalized name for seeded
  // recipes that may lack canonicalIds. Name-based matching is a heuristic
  // and may produce false positives for common short names.
  let matched = 0
  for (const ing of ingredients) {
    if (ing.canonicalId && pantryCanonicalIds.has(ing.canonicalId)) {
      matched++
    } else if (pantryNamesLower.has(ing.name.toLowerCase())) {
      matched++
    }
  }

  return Math.round((matched / ingredients.length) * 100)
}
