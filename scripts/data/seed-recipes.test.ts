import { describe, it, expect } from 'vitest'
import { RecipeSchema } from '../../src/types/recipe.js'
import { CANONICAL_INGREDIENTS } from './canonical-ingredients.js'
import { SEED_RECIPES } from './seed-recipes.js'

const canonicalIds = new Set(CANONICAL_INGREDIENTS.map((i) => i.id))

describe('seed-recipes data', () => {
  it('contains at least 50 recipes', () => {
    expect(SEED_RECIPES.length).toBeGreaterThanOrEqual(50)
  })

  it('has unique recipe ids', () => {
    const ids = SEED_RECIPES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has unique recipe names', () => {
    const names = SEED_RECIPES.map((r) => r.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('every recipe passes RecipeSchema validation', () => {
    for (const recipe of SEED_RECIPES) {
      const result = RecipeSchema.safeParse(recipe)
      if (!result.success) {
        throw new Error(
          `Recipe "${recipe.name}" (${recipe.id}) failed validation: ${result.error.message}`,
        )
      }
    }
  })

  it('canonicalId references are valid canonical ingredient ids', () => {
    for (const recipe of SEED_RECIPES) {
      for (const ingredient of recipe.ingredients) {
        if (ingredient.canonicalId) {
          expect(
            canonicalIds.has(ingredient.canonicalId),
            `Recipe "${recipe.name}" references unknown canonicalId "${ingredient.canonicalId}" for ingredient "${ingredient.name}"`,
          ).toBe(true)
        }
      }
    }
  })

  it('complexity distribution: ~15 at 1-2, ~20 at 3, ~15 at 4-5', () => {
    const low = SEED_RECIPES.filter((r) => r.complexity <= 2).length
    const mid = SEED_RECIPES.filter((r) => r.complexity === 3).length
    const high = SEED_RECIPES.filter((r) => r.complexity >= 4).length

    // Allow some flexibility: at least 10 in each bucket
    expect(low).toBeGreaterThanOrEqual(10)
    expect(mid).toBeGreaterThanOrEqual(10)
    expect(high).toBeGreaterThanOrEqual(10)
  })

  it('every recipe has at least one step', () => {
    for (const recipe of SEED_RECIPES) {
      expect(recipe.steps.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('steps are in sequential order starting from 1', () => {
    for (const recipe of SEED_RECIPES) {
      recipe.steps.forEach((step, idx) => {
        expect(step.order).toBe(idx + 1)
      })
    }
  })

  // --- New enrichment tests ---

  it('every recipe has source.type === "seed"', () => {
    for (const recipe of SEED_RECIPES) {
      expect(recipe.source).toBeDefined()
      expect(recipe.source!.type).toBe('seed')
    }
  })

  it('every recipe has tags array with at least 2 tags', () => {
    for (const recipe of SEED_RECIPES) {
      expect(
        Array.isArray(recipe.tags),
        `Recipe "${recipe.name}" is missing tags array`,
      ).toBe(true)
      expect(
        recipe.tags!.length,
        `Recipe "${recipe.name}" has fewer than 2 tags (has ${recipe.tags!.length})`,
      ).toBeGreaterThanOrEqual(2)
    }
  })

  it('every recipe has cuisineTags array', () => {
    for (const recipe of SEED_RECIPES) {
      expect(
        Array.isArray(recipe.cuisineTags),
        `Recipe "${recipe.name}" is missing cuisineTags array`,
      ).toBe(true)
      expect(
        recipe.cuisineTags!.length,
        `Recipe "${recipe.name}" has empty cuisineTags`,
      ).toBeGreaterThanOrEqual(1)
    }
  })

  it('all ingredients have a category set', () => {
    const validCategories = [
      'protein', 'vegetable', 'fruit', 'dairy', 'fat', 'spice',
      'herb', 'condiment', 'grain', 'legume', 'liquid', 'other',
    ]
    for (const recipe of SEED_RECIPES) {
      for (const ingredient of recipe.ingredients) {
        expect(
          ingredient.category,
          `Recipe "${recipe.name}" ingredient "${ingredient.name}" is missing category`,
        ).toBeDefined()
        expect(
          validCategories.includes(ingredient.category!),
          `Recipe "${recipe.name}" ingredient "${ingredient.name}" has invalid category "${ingredient.category}"`,
        ).toBe(true)
      }
    }
  })

  it('every recipe has dietaryProfile with dietsCompatible array', () => {
    for (const recipe of SEED_RECIPES) {
      expect(
        recipe.dietaryProfile,
        `Recipe "${recipe.name}" is missing dietaryProfile`,
      ).toBeDefined()
      expect(
        Array.isArray(recipe.dietaryProfile!.dietsCompatible),
        `Recipe "${recipe.name}" dietaryProfile is missing dietsCompatible array`,
      ).toBe(true)
      expect(
        recipe.dietaryProfile!.dietsCompatible!.length,
        `Recipe "${recipe.name}" has empty dietsCompatible`,
      ).toBeGreaterThanOrEqual(1)
    }
  })

  it('recipes with soup/stew tags have storage.freezing.isFreezable === true', () => {
    const freezableTags = ['sopa', 'guiso', 'estofado', 'legumbres']
    const freezableRecipes = SEED_RECIPES.filter((r) =>
      r.tags?.some((t) => freezableTags.includes(t)),
    )

    // Should have at least some freezable recipes
    expect(freezableRecipes.length).toBeGreaterThanOrEqual(8)

    for (const recipe of freezableRecipes) {
      expect(
        recipe.storage?.freezing?.isFreezable,
        `Recipe "${recipe.name}" has freezable tags but storage.freezing.isFreezable is not true`,
      ).toBe(true)
    }
  })

  it('pantryItem is true for common staples when they appear', () => {
    const pantryStapleIds = ['salt', 'vegetable_oil', 'olive_oil', 'black_pepper', 'oregano', 'cumin']
    for (const recipe of SEED_RECIPES) {
      for (const ingredient of recipe.ingredients) {
        if (ingredient.canonicalId && pantryStapleIds.includes(ingredient.canonicalId)) {
          expect(
            ingredient.pantryItem,
            `Recipe "${recipe.name}" ingredient "${ingredient.name}" (${ingredient.canonicalId}) should have pantryItem: true`,
          ).toBe(true)
        }
      }
    }
  })
})
