import { describe, it, expect } from 'vitest'
import { computePantryMatchPct } from './pantryMatch'
import type { StoredRecipe } from '@/types/recipe'

function makeRecipe(ingredientNames: string[]): StoredRecipe {
  return {
    id: 'test',
    name: 'Test Recipe',
    description: 'test',
    cuisine: 'Chilena',
    techniques: ['hervir'],
    complexity: 2,
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    ingredients: ingredientNames.map((name) => ({
      name,
      quantity: 1,
      unit: 'unidad',
    })),
    steps: [{ order: 1, instruction: 'Cook' }],
  }
}

describe('computePantryMatchPct', () => {
  it('returns 100% when all ingredients match by canonicalId', () => {
    const recipe: StoredRecipe = {
      ...makeRecipe([]),
      ingredients: [
        { name: 'Arroz', quantity: 1, unit: 'taza', canonicalId: 'rice' },
        { name: 'Pollo', quantity: 500, unit: 'g', canonicalId: 'chicken' },
      ],
    }
    const pantryIds = new Set(['rice', 'chicken'])
    const pantryNames = new Set(['arroz', 'pollo'])

    expect(computePantryMatchPct(recipe, pantryIds, pantryNames)).toBe(100)
  })

  it('returns 0% when no ingredients match', () => {
    const recipe = makeRecipe(['Salmón', 'Eneldo'])
    const pantryIds = new Set(['rice'])
    const pantryNames = new Set(['arroz'])

    expect(computePantryMatchPct(recipe, pantryIds, pantryNames)).toBe(0)
  })

  it('returns correct percentage for partial match', () => {
    const recipe: StoredRecipe = {
      ...makeRecipe([]),
      ingredients: [
        { name: 'Arroz', quantity: 2, unit: 'taza', canonicalId: 'rice' },
        { name: 'Cebolla', quantity: 1, unit: 'unidad', canonicalId: 'onion' },
        { name: 'Ajo', quantity: 2, unit: 'dientes', canonicalId: 'garlic' },
        { name: 'Pimiento', quantity: 1, unit: 'unidad', canonicalId: 'bell_pepper' },
      ],
    }
    // Only rice and onion in pantry
    const pantryIds = new Set(['rice', 'onion'])
    const pantryNames = new Set(['arroz', 'cebolla'])

    expect(computePantryMatchPct(recipe, pantryIds, pantryNames)).toBe(50)
  })

  it('matches by normalized name when canonicalId is missing', () => {
    const recipe = makeRecipe(['Arroz', 'Cebolla'])
    const pantryIds = new Set<string>()
    const pantryNames = new Set(['arroz'])

    expect(computePantryMatchPct(recipe, pantryIds, pantryNames)).toBe(50)
  })

  it('prefers canonicalId match over name match', () => {
    const recipe: StoredRecipe = {
      ...makeRecipe([]),
      ingredients: [
        { name: 'White Rice', quantity: 1, unit: 'cup', canonicalId: 'rice' },
      ],
    }
    const pantryIds = new Set(['rice'])
    const pantryNames = new Set<string>()

    expect(computePantryMatchPct(recipe, pantryIds, pantryNames)).toBe(100)
  })

  it('returns 0 for recipe with no ingredients', () => {
    const recipe: StoredRecipe = { ...makeRecipe([]), ingredients: [] }
    expect(computePantryMatchPct(recipe, new Set(), new Set())).toBe(0)
  })

  it('rounds to nearest integer', () => {
    const recipe = makeRecipe(['A', 'B', 'C'])
    const pantryIds = new Set<string>()
    const pantryNames = new Set(['a']) // 1/3 = 33.33...

    expect(computePantryMatchPct(recipe, pantryIds, pantryNames)).toBe(33)
  })
})
