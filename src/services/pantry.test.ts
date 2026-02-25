import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CanonicalIngredient } from '@/types/ingredient'

const mockGetDocs = vi.fn()
const mockSetDoc = vi.fn()
const mockDeleteDoc = vi.fn()
const mockDoc = vi.fn()
const mockCollection = vi.fn()
const mockTimestampNow = vi.fn()
const mockTimestampFromDate = vi.fn()

vi.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  Timestamp: {
    now: () => mockTimestampNow(),
    fromDate: (d: Date) => mockTimestampFromDate(d),
  },
}))

vi.mock('@/config/firebase', () => ({
  db: {},
}))

import { addToPantry, addPreparedToPantry, getUserPantry, removePantryItem } from './pantry'

beforeEach(() => {
  vi.clearAllMocks()
})

const tomato: CanonicalIngredient = {
  id: 'tomato',
  names: { es: 'Tomate', en: 'Tomato' },
  category: 'Vegetable',
  icon: '🍅',
  defaultUnit: 'kg',
  shelfLifeDays: 7,
  substitutions: ['bell_pepper'],
}

describe('addToPantry', () => {
  it('writes to the correct path with merge', async () => {
    mockDoc.mockReturnValue('doc-ref')
    mockSetDoc.mockResolvedValue(undefined)
    mockTimestampNow.mockReturnValue({ seconds: 1000 })
    mockTimestampFromDate.mockReturnValue({ seconds: 1604 })

    await addToPantry('user-1', 'tomato', tomato, 'tx-99')

    expect(mockDoc).toHaveBeenCalledWith({}, 'users/user-1/pantry', 'tomato')
    expect(mockSetDoc).toHaveBeenCalledWith(
      'doc-ref',
      {
        canonicalId: 'tomato',
        name: 'Tomate',
        quantity: 1,
        unit: 'kg',
        purchasedAt: { seconds: 1000 },
        estimatedExpiry: { seconds: 1604 },
        status: 'available',
        sourceTransactionId: 'tx-99',
      },
      { merge: true },
    )
  })

  it('omits sourceTransactionId when not provided', async () => {
    mockDoc.mockReturnValue('doc-ref')
    mockSetDoc.mockResolvedValue(undefined)
    mockTimestampNow.mockReturnValue({ seconds: 1000 })
    mockTimestampFromDate.mockReturnValue({ seconds: 1604 })

    await addToPantry('user-1', 'tomato', tomato)

    const writtenData = mockSetDoc.mock.calls[0][1]
    expect(writtenData).not.toHaveProperty('sourceTransactionId')
  })

  it('calculates expiry based on shelfLifeDays', async () => {
    vi.useFakeTimers()
    const now = new Date('2026-03-01T12:00:00Z')
    vi.setSystemTime(now)

    mockDoc.mockReturnValue('doc-ref')
    mockSetDoc.mockResolvedValue(undefined)
    mockTimestampNow.mockReturnValue({ seconds: 1000 })
    mockTimestampFromDate.mockImplementation((d: Date) => ({
      seconds: Math.floor(d.getTime() / 1000),
    }))

    const rice: CanonicalIngredient = {
      id: 'rice',
      names: { es: 'Arroz', en: 'Rice' },
      category: 'Grain',
      icon: '🍚',
      defaultUnit: 'kg',
      shelfLifeDays: 365,
      substitutions: [],
    }

    await addToPantry('user-1', 'rice', rice)

    const expectedExpiry = new Date(now.getTime() + 365 * 86_400_000)
    expect(mockTimestampFromDate).toHaveBeenCalledWith(expectedExpiry)

    vi.useRealTimers()
  })

  it('propagates error when setDoc fails', async () => {
    mockDoc.mockReturnValue('doc-ref')
    mockSetDoc.mockRejectedValue(new Error('permission-denied'))
    mockTimestampNow.mockReturnValue({ seconds: 1000 })
    mockTimestampFromDate.mockReturnValue({ seconds: 1604 })

    await expect(
      addToPantry('user-1', 'tomato', tomato),
    ).rejects.toThrow('permission-denied')
  })
})

describe('addPreparedToPantry', () => {
  it('writes to the correct path with type prepared', async () => {
    mockDoc.mockReturnValue('doc-ref')
    mockSetDoc.mockResolvedValue(undefined)
    mockTimestampNow.mockReturnValue({ seconds: 1000 })
    mockTimestampFromDate.mockReturnValue({ seconds: 8776000 })

    await addPreparedToPantry('user-1', 'Pizza congelada', 'pizza congelada', 'tx-50')

    expect(mockDoc).toHaveBeenCalledWith(
      {},
      'users/user-1/pantry',
      'prepared_pizza_congelada',
    )
    expect(mockSetDoc).toHaveBeenCalledWith(
      'doc-ref',
      {
        canonicalId: 'prepared_pizza_congelada',
        name: 'Pizza congelada',
        quantity: 1,
        unit: 'unidad',
        purchasedAt: { seconds: 1000 },
        estimatedExpiry: { seconds: 8776000 },
        status: 'available',
        type: 'prepared',
        sourceTransactionId: 'tx-50',
      },
      { merge: true },
    )
  })

  it('omits sourceTransactionId when not provided', async () => {
    mockDoc.mockReturnValue('doc-ref')
    mockSetDoc.mockResolvedValue(undefined)
    mockTimestampNow.mockReturnValue({ seconds: 1000 })
    mockTimestampFromDate.mockReturnValue({ seconds: 8776000 })

    await addPreparedToPantry('user-1', 'Helado', 'helado')

    const writtenData = mockSetDoc.mock.calls[0][1]
    expect(writtenData).not.toHaveProperty('sourceTransactionId')
    expect(writtenData.type).toBe('prepared')
  })

  it('uses 90-day shelf life', async () => {
    vi.useFakeTimers()
    const now = new Date('2026-03-01T12:00:00Z')
    vi.setSystemTime(now)

    mockDoc.mockReturnValue('doc-ref')
    mockSetDoc.mockResolvedValue(undefined)
    mockTimestampNow.mockReturnValue({ seconds: 1000 })
    mockTimestampFromDate.mockImplementation((d: Date) => ({
      seconds: Math.floor(d.getTime() / 1000),
    }))

    await addPreparedToPantry('user-1', 'Pizza', 'pizza')

    const expectedExpiry = new Date(now.getTime() + 90 * 86_400_000)
    expect(mockTimestampFromDate).toHaveBeenCalledWith(expectedExpiry)

    vi.useRealTimers()
  })

  it('propagates error when setDoc fails', async () => {
    mockDoc.mockReturnValue('doc-ref')
    mockSetDoc.mockRejectedValue(new Error('permission-denied'))
    mockTimestampNow.mockReturnValue({ seconds: 1000 })
    mockTimestampFromDate.mockReturnValue({ seconds: 8776000 })

    await expect(
      addPreparedToPantry('user-1', 'Pizza', 'pizza'),
    ).rejects.toThrow('permission-denied')
  })
})

describe('getUserPantry', () => {
  it('reads all pantry items for the user', async () => {
    const mockDocs = [
      {
        id: 'tomato',
        data: () => ({
          canonicalId: 'tomato',
          name: 'Tomate',
          quantity: 1,
          unit: 'kg',
          status: 'available',
        }),
      },
    ]
    mockCollection.mockReturnValue('collection-ref')
    mockGetDocs.mockResolvedValue({ docs: mockDocs })

    const result = await getUserPantry('user-1')

    expect(mockCollection).toHaveBeenCalledWith({}, 'users/user-1/pantry')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('tomato')
    expect(result[0].canonicalId).toBe('tomato')
  })

  it('returns empty array when pantry is empty', async () => {
    mockCollection.mockReturnValue('collection-ref')
    mockGetDocs.mockResolvedValue({ docs: [] })

    const result = await getUserPantry('user-1')

    expect(result).toEqual([])
  })

  it('propagates error when getDocs fails', async () => {
    mockCollection.mockReturnValue('collection-ref')
    mockGetDocs.mockRejectedValue(new Error('firestore-unavailable'))

    await expect(getUserPantry('user-1')).rejects.toThrow('firestore-unavailable')
  })
})

describe('removePantryItem', () => {
  it('deletes the correct document', async () => {
    mockDoc.mockReturnValue('doc-ref')
    mockDeleteDoc.mockResolvedValue(undefined)

    await removePantryItem('user-1', 'tomato')

    expect(mockDoc).toHaveBeenCalledWith({}, 'users/user-1/pantry', 'tomato')
    expect(mockDeleteDoc).toHaveBeenCalledWith('doc-ref')
  })

  it('propagates error when deleteDoc fails', async () => {
    mockDoc.mockReturnValue('doc-ref')
    mockDeleteDoc.mockRejectedValue(new Error('permission-denied'))

    await expect(removePantryItem('user-1', 'tomato')).rejects.toThrow(
      'permission-denied',
    )
  })
})
