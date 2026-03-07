import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock firebase/firestore
const mockOnSnapshot = vi.fn()
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
  query: vi.fn((...args: unknown[]) => args),
  limit: vi.fn((n: number) => n),
}))

// Mock firebase config
vi.mock('@/config/firebase', () => ({
  db: {},
}))

import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { getAllRecipes, getRecipeById, subscribeToRecipes } from './recipes'

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

    it('returns null for empty recipeId', async () => {
      const recipe = await getRecipeById('')

      expect(recipe).toBeNull()
      expect(getDoc).not.toHaveBeenCalled()
    })
  })

  describe('runtime validation', () => {
    it('getAllRecipes filters out invalid docs and logs errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const invalidDoc = makeMockDoc('bad-recipe', { description: 'missing name field' })
      const validDoc = makeMockDoc('good-recipe', mockRecipeData)
      vi.mocked(getDocs).mockResolvedValue(makeMockSnapshot([invalidDoc, validDoc]) as never)

      const recipes = await getAllRecipes()

      expect(consoleSpy).toHaveBeenCalledWith(
        '[recipes] Invalid recipe doc',
        'bad-recipe',
        expect.arrayContaining([expect.objectContaining({ code: expect.any(String) })]),
      )
      expect(recipes).toHaveLength(1)
      expect(recipes[0].id).toBe('good-recipe')

      consoleSpy.mockRestore()
    })

    it('getAllRecipes returns valid docs with id from doc.id', async () => {
      const mockDocs = [makeMockDoc('recipe-abc', mockRecipeData)]
      vi.mocked(getDocs).mockResolvedValue(makeMockSnapshot(mockDocs) as never)

      const recipes = await getAllRecipes()

      expect(recipes).toHaveLength(1)
      expect(recipes[0].id).toBe('recipe-abc')
      expect(recipes[0].name).toBe('Empanadas de Pino')
    })

    it('getAllRecipes with mix of valid and invalid docs returns only valid ones', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const docs = [
        makeMockDoc('invalid-1', { name: 'No steps or ingredients' }),
        makeMockDoc('valid-1', mockRecipeData),
        makeMockDoc('invalid-2', { complexity: 'not-a-number' }),
        makeMockDoc('valid-2', { ...mockRecipeData, name: 'Cazuela' }),
      ]
      vi.mocked(getDocs).mockResolvedValue(makeMockSnapshot(docs) as never)

      const recipes = await getAllRecipes()

      expect(consoleSpy).toHaveBeenCalledTimes(2)
      expect(recipes).toHaveLength(2)
      expect(recipes.map((r) => r.id)).toEqual(['valid-1', 'valid-2'])

      consoleSpy.mockRestore()
    })

    it('getRecipeById returns null and logs error for invalid doc', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const invalidDoc = makeMockDoc('bad-recipe', { description: 'missing required fields' })
      vi.mocked(getDoc).mockResolvedValue(invalidDoc as never)

      const recipe = await getRecipeById('bad-recipe')

      expect(consoleSpy).toHaveBeenCalledWith(
        '[recipes] Invalid recipe doc',
        'bad-recipe',
        expect.arrayContaining([expect.objectContaining({ code: expect.any(String) })]),
      )
      expect(recipe).toBeNull()

      consoleSpy.mockRestore()
    })

    it('getRecipeById returns validated recipe with id from snapshot.id', async () => {
      const mockDoc = makeMockDoc('recipe-xyz', mockRecipeData)
      vi.mocked(getDoc).mockResolvedValue(mockDoc as never)

      const recipe = await getRecipeById('recipe-xyz')

      expect(recipe).not.toBeNull()
      expect(recipe!.id).toBe('recipe-xyz')
      expect(recipe!.name).toBe('Empanadas de Pino')
      expect(recipe!.complexity).toBe(3)
    })
  })

  describe('error propagation', () => {
    it('propagates Firestore errors from getAllRecipes', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore unavailable'))

      await expect(getAllRecipes()).rejects.toThrow('Firestore unavailable')
    })

    it('propagates Firestore errors from getRecipeById', async () => {
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore unavailable'))

      await expect(getRecipeById('recipe-1')).rejects.toThrow('Firestore unavailable')
    })
  })

  // TD-1-3 Task 1.5: subscribeToRecipes service tests
  describe('subscribeToRecipes', () => {
    it('filters invalid docs and passes only valid recipes to callback', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const callback = vi.fn()

      mockOnSnapshot.mockImplementation((
        _query: unknown,
        onNext: (snapshot: { docs: ReturnType<typeof makeMockDoc>[] }) => void,
      ) => {
        onNext({
          docs: [
            makeMockDoc('valid-1', mockRecipeData),
            makeMockDoc('invalid-1', { description: 'missing name' }),
            makeMockDoc('valid-2', { ...mockRecipeData, name: 'Cazuela' }),
          ],
        })
        return vi.fn() // unsubscribe
      })

      subscribeToRecipes(callback)

      expect(callback).toHaveBeenCalledTimes(1)
      const recipes = callback.mock.calls[0][0]
      expect(recipes).toHaveLength(2)
      expect(recipes[0].id).toBe('valid-1')
      expect(recipes[1].id).toBe('valid-2')
      expect(consoleSpy).toHaveBeenCalledWith(
        '[recipes] Invalid recipe doc',
        'invalid-1',
        expect.any(Array),
      )

      consoleSpy.mockRestore()
    })

    it('calls onError callback on Firestore error', () => {
      const callback = vi.fn()
      const onError = vi.fn()

      mockOnSnapshot.mockImplementation((
        _query: unknown,
        _onNext: unknown,
        onErr: (error: Error) => void,
      ) => {
        onErr(new Error('Permission denied'))
        return vi.fn()
      })

      subscribeToRecipes(callback, onError)

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Permission denied' }))
      expect(callback).not.toHaveBeenCalled()
    })

    it('returns an unsubscribe function', () => {
      const mockUnsub = vi.fn()
      mockOnSnapshot.mockReturnValue(mockUnsub)

      const unsub = subscribeToRecipes(vi.fn())

      expect(unsub).toBe(mockUnsub)
    })
  })
})
