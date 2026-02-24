import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetDocs = vi.fn()
const mockGetDoc = vi.fn()
const mockDoc = vi.fn()
const mockCollection = vi.fn()
const mockQuery = vi.fn()
const mockWhere = vi.fn()

vi.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  where: (...args: unknown[]) => mockWhere(...args),
}))

vi.mock('@/config/firebase', () => ({
  db: {},
}))

import {
  getCanonicalIngredients,
  getCanonicalIngredient,
  getIngredientsByCategory,
} from './ingredients'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getCanonicalIngredients', () => {
  it('returns all ingredients from Firestore', async () => {
    const mockDocs = [
      { id: 'tomato', data: () => ({ names: { es: 'Tomate', en: 'Tomato' }, category: 'Vegetable' }) },
      { id: 'rice', data: () => ({ names: { es: 'Arroz', en: 'Rice' }, category: 'Grain' }) },
    ]
    mockCollection.mockReturnValue('collection-ref')
    mockGetDocs.mockResolvedValue({ docs: mockDocs })

    const result = await getCanonicalIngredients()

    expect(mockCollection).toHaveBeenCalledWith({}, 'canonicalIngredients')
    expect(mockGetDocs).toHaveBeenCalledWith('collection-ref')
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ id: 'tomato', names: { es: 'Tomate', en: 'Tomato' }, category: 'Vegetable' })
    expect(result[1]).toEqual({ id: 'rice', names: { es: 'Arroz', en: 'Rice' }, category: 'Grain' })
  })

  it('returns empty array when no ingredients exist', async () => {
    mockCollection.mockReturnValue('collection-ref')
    mockGetDocs.mockResolvedValue({ docs: [] })

    const result = await getCanonicalIngredients()

    expect(result).toEqual([])
  })

  it('propagates error when getDocs fails', async () => {
    mockCollection.mockReturnValue('collection-ref')
    mockGetDocs.mockRejectedValue(new Error('firestore-unavailable'))

    await expect(getCanonicalIngredients()).rejects.toThrow('firestore-unavailable')
  })
})

describe('getCanonicalIngredient', () => {
  it('returns the ingredient when it exists', async () => {
    mockDoc.mockReturnValue('doc-ref')
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: 'tomato',
      data: () => ({ names: { es: 'Tomate', en: 'Tomato' }, category: 'Vegetable' }),
    })

    const result = await getCanonicalIngredient('tomato')

    expect(mockDoc).toHaveBeenCalledWith({}, 'canonicalIngredients', 'tomato')
    expect(mockGetDoc).toHaveBeenCalledWith('doc-ref')
    expect(result).toEqual({ id: 'tomato', names: { es: 'Tomate', en: 'Tomato' }, category: 'Vegetable' })
  })

  it('returns null when ingredient does not exist', async () => {
    mockDoc.mockReturnValue('doc-ref')
    mockGetDoc.mockResolvedValue({
      exists: () => false,
    })

    const result = await getCanonicalIngredient('nonexistent')

    expect(result).toBeNull()
  })

  it('propagates error when getDoc fails', async () => {
    mockDoc.mockReturnValue('doc-ref')
    mockGetDoc.mockRejectedValue(new Error('permission-denied'))

    await expect(getCanonicalIngredient('tomato')).rejects.toThrow('permission-denied')
  })
})

describe('getIngredientsByCategory', () => {
  it('returns ingredients matching the category', async () => {
    const mockDocs = [
      { id: 'cilantro', data: () => ({ names: { es: 'Cilantro', en: 'Cilantro' }, category: 'Herb' }) },
      { id: 'parsley', data: () => ({ names: { es: 'Perejil', en: 'Parsley' }, category: 'Herb' }) },
    ]
    mockCollection.mockReturnValue('collection-ref')
    mockWhere.mockReturnValue('where-clause')
    mockQuery.mockReturnValue('query-ref')
    mockGetDocs.mockResolvedValue({ docs: mockDocs })

    const result = await getIngredientsByCategory('Herb')

    expect(mockWhere).toHaveBeenCalledWith('category', '==', 'Herb')
    expect(mockQuery).toHaveBeenCalledWith('collection-ref', 'where-clause')
    expect(mockGetDocs).toHaveBeenCalledWith('query-ref')
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('cilantro')
    expect(result[1].id).toBe('parsley')
  })

  it('returns empty array when no ingredients match the category', async () => {
    mockCollection.mockReturnValue('collection-ref')
    mockWhere.mockReturnValue('where-clause')
    mockQuery.mockReturnValue('query-ref')
    mockGetDocs.mockResolvedValue({ docs: [] })

    const result = await getIngredientsByCategory('Other')

    expect(result).toEqual([])
  })

  it('propagates error when query fails', async () => {
    mockCollection.mockReturnValue('collection-ref')
    mockWhere.mockReturnValue('where-clause')
    mockQuery.mockReturnValue('query-ref')
    mockGetDocs.mockRejectedValue(new Error('firestore-unavailable'))

    await expect(getIngredientsByCategory('Protein')).rejects.toThrow('firestore-unavailable')
  })
})
