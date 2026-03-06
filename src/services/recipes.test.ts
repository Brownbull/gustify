import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
}))

// Mock firebase config
vi.mock('@/config/firebase', () => ({
  db: {},
}))

import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { getAllRecipes, getRecipeById } from './recipes'

const mockRecipeData = {
  name: 'Empanadas de Pino',
  description: 'Classic Chilean empanadas',
  cuisine: 'Chilena',
  techniques: ['hornear'],
  complexity: 3,
  prepTime: 60,
  cookTime: 25,
  servings: 12,
  ingredients: [{ name: 'Carne molida', quantity: 500, unit: 'g' }],
  steps: [{ order: 1, instruction: 'Preparar el pino' }],
}

function makeMockDoc(id: string, data: Record<string, unknown>) {
  return {
    id,
    data: () => data,
    exists: () => true,
  }
}

function makeMockSnapshot(docs: ReturnType<typeof makeMockDoc>[]) {
  return { docs }
}

describe('Recipe Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // AC-3: Recipe Service Reads from Firestore
  describe('getAllRecipes', () => {
    it('returns all recipes with id from doc.id', async () => {
      const mockDocs = [
        makeMockDoc('recipe-1', mockRecipeData),
        makeMockDoc('recipe-2', { ...mockRecipeData, name: 'Cazuela' }),
      ]
      vi.mocked(getDocs).mockResolvedValue(makeMockSnapshot(mockDocs) as never)

      const recipes = await getAllRecipes()

      expect(recipes).toHaveLength(2)
      expect(recipes[0].id).toBe('recipe-1')
      expect(recipes[0].name).toBe('Empanadas de Pino')
      expect(recipes[1].id).toBe('recipe-2')
      expect(recipes[1].name).toBe('Cazuela')
    })

    it('returns empty array when no recipes exist', async () => {
      vi.mocked(getDocs).mockResolvedValue(makeMockSnapshot([]) as never)

      const recipes = await getAllRecipes()

      expect(recipes).toEqual([])
    })

    it('uses recipes collection path', async () => {
      vi.mocked(getDocs).mockResolvedValue(makeMockSnapshot([]) as never)

      await getAllRecipes()

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'recipes')
    })
  })

  describe('getRecipeById', () => {
    it('returns recipe when found', async () => {
      const mockDoc = makeMockDoc('recipe-1', mockRecipeData)
      vi.mocked(getDoc).mockResolvedValue(mockDoc as never)

      const recipe = await getRecipeById('recipe-1')

      expect(recipe).not.toBeNull()
      expect(recipe!.id).toBe('recipe-1')
      expect(recipe!.name).toBe('Empanadas de Pino')
    })

    it('returns null when recipe not found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
        id: 'nonexistent',
        data: () => undefined,
      } as never)

      const recipe = await getRecipeById('nonexistent')

      expect(recipe).toBeNull()
    })

    it('uses recipes collection path with recipeId', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
        id: 'test-id',
        data: () => undefined,
      } as never)

      await getRecipeById('test-id')

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'recipes', 'test-id')
    })
  })
})
