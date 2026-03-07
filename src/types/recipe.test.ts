import { describe, it, expect } from 'vitest'
import { RecipeSchema, StoredRecipeDocSchema } from './recipe'

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

  // AC-2 extended: reject other missing required fields
  describe('rejects other missing required fields', () => {
    it('rejects missing id', () => {
      const { id, ...noId } = validRecipe
      const result = RecipeSchema.safeParse(noId)
      expect(result.success).toBe(false)
    })

    it('rejects missing description', () => {
      const { description, ...noDesc } = validRecipe
      const result = RecipeSchema.safeParse(noDesc)
      expect(result.success).toBe(false)
    })

    it('rejects missing techniques', () => {
      const { techniques, ...noTech } = validRecipe
      const result = RecipeSchema.safeParse(noTech)
      expect(result.success).toBe(false)
    })

    it('rejects missing complexity', () => {
      const { complexity, ...noComp } = validRecipe
      const result = RecipeSchema.safeParse(noComp)
      expect(result.success).toBe(false)
    })

    it('rejects missing prepTime', () => {
      const { prepTime, ...noPrepTime } = validRecipe
      const result = RecipeSchema.safeParse(noPrepTime)
      expect(result.success).toBe(false)
    })

    it('rejects missing cookTime', () => {
      const { cookTime, ...noCookTime } = validRecipe
      const result = RecipeSchema.safeParse(noCookTime)
      expect(result.success).toBe(false)
    })

    it('rejects missing servings', () => {
      const { servings, ...noServings } = validRecipe
      const result = RecipeSchema.safeParse(noServings)
      expect(result.success).toBe(false)
    })

    it('rejects empty techniques array', () => {
      const result = RecipeSchema.safeParse({ ...validRecipe, techniques: [] })
      expect(result.success).toBe(false)
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

    it('rejects negative prepTime', () => {
      const result = RecipeSchema.safeParse({ ...validRecipe, prepTime: -1 })
      expect(result.success).toBe(false)
    })

    it('rejects negative cookTime', () => {
      const result = RecipeSchema.safeParse({ ...validRecipe, cookTime: -1 })
      expect(result.success).toBe(false)
    })

    it('rejects non-integer complexity', () => {
      const result = RecipeSchema.safeParse({ ...validRecipe, complexity: 2.5 })
      expect(result.success).toBe(false)
    })

    it('accepts prepTime 0', () => {
      const result = RecipeSchema.safeParse({ ...validRecipe, prepTime: 0 })
      expect(result.success).toBe(true)
    })

    it('accepts cookTime 0', () => {
      const result = RecipeSchema.safeParse({ ...validRecipe, cookTime: 0 })
      expect(result.success).toBe(true)
    })
  })

  describe('ingredient validation', () => {
    it('rejects ingredient with empty name', () => {
      const result = RecipeSchema.safeParse({
        ...validRecipe,
        ingredients: [{ name: '', quantity: 1, unit: 'g' }],
      })
      expect(result.success).toBe(false)
    })

    it('rejects ingredient with zero quantity', () => {
      const result = RecipeSchema.safeParse({
        ...validRecipe,
        ingredients: [{ name: 'Salt', quantity: 0, unit: 'g' }],
      })
      expect(result.success).toBe(false)
    })

    it('rejects ingredient with negative quantity', () => {
      const result = RecipeSchema.safeParse({
        ...validRecipe,
        ingredients: [{ name: 'Salt', quantity: -1, unit: 'g' }],
      })
      expect(result.success).toBe(false)
    })

    it('rejects ingredient with empty unit', () => {
      const result = RecipeSchema.safeParse({
        ...validRecipe,
        ingredients: [{ name: 'Salt', quantity: 1, unit: '' }],
      })
      expect(result.success).toBe(false)
    })
  })

  describe('step validation', () => {
    it('rejects step with non-positive order', () => {
      const result = RecipeSchema.safeParse({
        ...validRecipe,
        steps: [{ order: 0, instruction: 'Do something' }],
      })
      expect(result.success).toBe(false)
    })

    it('rejects step with empty instruction', () => {
      const result = RecipeSchema.safeParse({
        ...validRecipe,
        steps: [{ order: 1, instruction: '' }],
      })
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

describe('StoredRecipeDocSchema', () => {
  // Build a valid doc body — all fields from validRecipe MINUS id
  const { id, ...validDocBody } = {
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

  it('parses a valid doc body (all required fields except id)', () => {
    const result = StoredRecipeDocSchema.safeParse(validDocBody)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Empanadas de Pino')
      expect(result.data.ingredients).toHaveLength(2)
    }
  })

  it('parsed result does not contain an id field', () => {
    const result = StoredRecipeDocSchema.safeParse(validDocBody)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty('id')
    }
  })

  it('rejects doc body missing required name field', () => {
    const { name, ...noName } = validDocBody
    const result = StoredRecipeDocSchema.safeParse(noName)
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0])
      expect(fields).toContain('name')
    }
  })

  it('strips unknown fields rather than rejecting them', () => {
    const withExtra = { ...validDocBody, unknownField: 'should be stripped' }
    const result = StoredRecipeDocSchema.safeParse(withExtra)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty('unknownField')
    }
  })

  it('strips id field when present in doc body', () => {
    const withId = { ...validDocBody, id: 'should-be-stripped' }
    const result = StoredRecipeDocSchema.safeParse(withId)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty('id')
    }
  })
})
