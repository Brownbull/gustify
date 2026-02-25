import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetDocs = vi.fn()
const mockGetDoc = vi.fn()
const mockSetDoc = vi.fn()
const mockDoc = vi.fn()
const mockCollection = vi.fn()
const mockTimestampNow = vi.fn()

vi.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  Timestamp: {
    now: () => mockTimestampNow(),
  },
}))

vi.mock('@/config/firebase', () => ({
  db: {},
}))

import { getAllMappings, getMapping, createMapping } from './item-mappings'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getAllMappings', () => {
  it('returns a Map keyed by document ID', async () => {
    const mockDocs = [
      {
        id: 'tomate',
        data: () => ({
          canonicalId: 'tomato',
          source: 'Tomate',
          normalizedSource: 'tomate',
          createdBy: 'user-1',
          createdAt: { seconds: 1000 },
        }),
      },
      {
        id: 'arroz',
        data: () => ({
          canonicalId: 'rice',
          source: 'Arroz',
          normalizedSource: 'arroz',
          createdBy: 'user-1',
          createdAt: { seconds: 1001 },
        }),
      },
    ]
    mockCollection.mockReturnValue('collection-ref')
    mockGetDocs.mockResolvedValue({ docs: mockDocs })

    const result = await getAllMappings()

    expect(mockCollection).toHaveBeenCalledWith({}, 'itemMappings')
    expect(result).toBeInstanceOf(Map)
    expect(result.size).toBe(2)
    expect(result.get('tomate')?.canonicalId).toBe('tomato')
    expect(result.get('arroz')?.canonicalId).toBe('rice')
  })

  it('returns empty Map when no mappings exist', async () => {
    mockCollection.mockReturnValue('collection-ref')
    mockGetDocs.mockResolvedValue({ docs: [] })

    const result = await getAllMappings()

    expect(result.size).toBe(0)
  })

  it('propagates error when getDocs fails', async () => {
    mockCollection.mockReturnValue('collection-ref')
    mockGetDocs.mockRejectedValue(new Error('firestore-unavailable'))

    await expect(getAllMappings()).rejects.toThrow('firestore-unavailable')
  })
})

describe('getMapping', () => {
  it('returns the mapping when it exists', async () => {
    mockDoc.mockReturnValue('doc-ref')
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        canonicalId: 'tomato',
        source: 'Tomate',
        normalizedSource: 'tomate',
        createdBy: 'user-1',
        createdAt: { seconds: 1000 },
      }),
    })

    const result = await getMapping('tomate')

    expect(mockDoc).toHaveBeenCalledWith({}, 'itemMappings', 'tomate')
    expect(result).not.toBeNull()
    expect(result!.canonicalId).toBe('tomato')
  })

  it('returns null when mapping does not exist', async () => {
    mockDoc.mockReturnValue('doc-ref')
    mockGetDoc.mockResolvedValue({
      exists: () => false,
    })

    const result = await getMapping('nonexistent')

    expect(result).toBeNull()
  })

  it('propagates error when getDoc fails', async () => {
    mockDoc.mockReturnValue('doc-ref')
    mockGetDoc.mockRejectedValue(new Error('permission-denied'))

    await expect(getMapping('tomate')).rejects.toThrow('permission-denied')
  })
})

describe('createMapping', () => {
  it('creates a mapping with normalized name as document ID', async () => {
    mockDoc.mockReturnValue('doc-ref')
    mockSetDoc.mockResolvedValue(undefined)
    mockTimestampNow.mockReturnValue({ seconds: 1234 })

    await createMapping('Tomate Cherry', 'tomato', 'user-1')

    expect(mockDoc).toHaveBeenCalledWith({}, 'itemMappings', 'tomate cherry')
    expect(mockSetDoc).toHaveBeenCalledWith('doc-ref', {
      canonicalId: 'tomato',
      source: 'Tomate Cherry',
      normalizedSource: 'tomate cherry',
      createdBy: 'user-1',
      createdAt: { seconds: 1234 },
    })
  })

  it('propagates error when setDoc fails', async () => {
    mockDoc.mockReturnValue('doc-ref')
    mockSetDoc.mockRejectedValue(new Error('permission-denied'))
    mockTimestampNow.mockReturnValue({ seconds: 1234 })

    await expect(createMapping('Tomate', 'tomato', 'user-1')).rejects.toThrow(
      'permission-denied',
    )
  })
})
