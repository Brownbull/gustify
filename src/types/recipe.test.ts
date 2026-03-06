import { describe, it, expect } from 'vitest'
import { RecipeSchema } from './recipe'

const validRecipe = {
  id: 'test-recipe-1',
  name: 'Empanadas de Pino',
  description: 'Classic Chilean empanadas with beef filling',
  cuisine: 'Chilena',
  techniques: ['hornear', 'picar'],
  complexity: 3,
  prepTime: 60,
  cookTime: 25,
  servings: 12,
  ingredients: [
    { name: 'Carne molida', quantity: 500, unit: 'g' },
    { name: 'Cebolla', quantity: 3, unit: 'unidades', canonicalId: 'cebolla' },
  ],
  steps: [
    { order: 1, instruction: 'Preparar el pino con carne y cebolla', duration: 30 },
    { order: 2, instruction: 'Rellenar las masas y hornear' },
  ],
}

describe('RecipeSchema', () => {
  // AC-1: Zod Schema Validates Recipes
  it('validates a complete valid recipe', () => {
    const result = RecipeSchema.safeParse(validRecipe)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Empanadas de Pino')
      expect(result.data.ingredients).toHaveLength(2)
      expect(result.data.steps).toHaveLength(2)
    }
  })

  it('accepts ingredients without optional canonicalId', () => {
    const result = RecipeSchema.safeParse(validRecipe)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.ingredients[0].canonicalId).toBeUndefined()
      expect(result.data.ingredients[1].canonicalId).toBe('cebolla')
    }
  })

  it('accepts steps without optional duration', () => {
    const result = RecipeSchema.safeParse(validRecipe)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.steps[0].duration).toBe(30)
      expect(result.data.steps[1].duration).toBeUndefined()
    }
  })

  // AC-2: Zod Schema Rejects Invalid Recipes
  describe('rejects missing required fields', () => {
    it('rejects missing name', () => {
      const { name, ...noName } = validRecipe
      const result = RecipeSchema.safeParse(noName)
      expect(result.success).toBe(false)
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path[0])
        expect(fields).toContain('name')
      }
    })

    it('rejects missing ingredients', () => {
      const { ingredients, ...noIngredients } = validRecipe
      const result = RecipeSchema.safeParse(noIngredients)
      expect(result.success).toBe(false)
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path[0])
        expect(fields).toContain('ingredients')
      }
    })

    it('rejects missing steps', () => {
      const { steps, ...noSteps } = validRecipe
      const result = RecipeSchema.safeParse(noSteps)
      expect(result.success).toBe(false)
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path[0])
        expect(fields).toContain('steps')
      }
    })

    it('rejects missing cuisine', () => {
      const { cuisine, ...noCuisine } = validRecipe
      const result = RecipeSchema.safeParse(noCuisine)
      expect(result.success).toBe(false)
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path[0])
        expect(fields).toContain('cuisine')
      }
    })
  })

  // AC-4: Validation Edge Cases
  describe('boundary values', () => {
    it('rejects complexity 0', () => {
      const result = RecipeSchema.safeParse({ ...validRecipe, complexity: 0 })
      expect(result.success).toBe(false)
    })

    it('accepts complexity 1', () => {
      const result = RecipeSchema.safeParse({ ...validRecipe, complexity: 1 })
      expect(result.success).toBe(true)
    })

    it('accepts complexity 5', () => {
      const result = RecipeSchema.safeParse({ ...validRecipe, complexity: 5 })
      expect(result.success).toBe(true)
    })

    it('rejects complexity 6', () => {
      const result = RecipeSchema.safeParse({ ...validRecipe, complexity: 6 })
      expect(result.success).toBe(false)
    })

    it('rejects servings 0', () => {
      const result = RecipeSchema.safeParse({ ...validRecipe, servings: 0 })
      expect(result.success).toBe(false)
    })

    it('accepts servings 1', () => {
      const result = RecipeSchema.safeParse({ ...validRecipe, servings: 1 })
      expect(result.success).toBe(true)
    })

    it('rejects empty ingredients array', () => {
      const result = RecipeSchema.safeParse({ ...validRecipe, ingredients: [] })
      expect(result.success).toBe(false)
    })

    it('rejects empty steps array', () => {
      const result = RecipeSchema.safeParse({ ...validRecipe, steps: [] })
      expect(result.success).toBe(false)
    })
  })

  describe('string constraints', () => {
    it('rejects name longer than 200 characters', () => {
      const result = RecipeSchema.safeParse({ ...validRecipe, name: 'A'.repeat(201) })
      expect(result.success).toBe(false)
    })

    it('rejects empty name', () => {
      const result = RecipeSchema.safeParse({ ...validRecipe, name: '' })
      expect(result.success).toBe(false)
    })

    it('accepts name at exactly 200 characters', () => {
      const result = RecipeSchema.safeParse({ ...validRecipe, name: 'A'.repeat(200) })
      expect(result.success).toBe(true)
    })
  })
})
