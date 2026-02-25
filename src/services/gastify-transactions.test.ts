import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GastifyTransaction } from '@/types/gastify'
import type { ItemMapping } from '@/types/item-mapping'
import type { Timestamp } from 'firebase/firestore'

const TEST_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'test-project'

const mockGetDocs = vi.fn()
const mockCollection = vi.fn()
const mockQuery = vi.fn()
const mockOrderBy = vi.fn()
const mockLimit = vi.fn()

vi.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  orderBy: (...args: unknown[]) => mockOrderBy(...args),
  limit: (...args: unknown[]) => mockLimit(...args),
}))

vi.mock('@/config/firebase', () => ({
  db: {},
}))

import {
  getUserTransactions,
  extractCookingItems,
  getUnmappedItems,
} from './gastify-transactions'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getUserTransactions', () => {
  it('reads transactions from the correct Firestore path', async () => {
    mockCollection.mockReturnValue('collection-ref')
    mockOrderBy.mockReturnValue('order-clause')
    mockLimit.mockReturnValue('limit-clause')
    mockQuery.mockReturnValue('query-ref')
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: 'tx-1',
          data: () => ({
            date: '2026-02-20',
            merchant: 'Jumbo',
            items: [],
            category: 'Groceries',
          }),
        },
      ],
    })

    const result = await getUserTransactions('user-123')

    expect(mockCollection).toHaveBeenCalledWith(
      {},
      `artifacts/${TEST_PROJECT_ID}/users/user-123/transactions`,
    )
    expect(mockOrderBy).toHaveBeenCalledWith('date', 'desc')
    expect(mockLimit).toHaveBeenCalledWith(50)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('tx-1')
    expect(result[0].merchant).toBe('Jumbo')
  })

  it('returns empty array when no transactions exist', async () => {
    mockCollection.mockReturnValue('collection-ref')
    mockOrderBy.mockReturnValue('order-clause')
    mockLimit.mockReturnValue('limit-clause')
    mockQuery.mockReturnValue('query-ref')
    mockGetDocs.mockResolvedValue({ docs: [] })

    const result = await getUserTransactions('user-123')

    expect(result).toEqual([])
  })

  it('propagates error when getDocs fails', async () => {
    mockCollection.mockReturnValue('collection-ref')
    mockOrderBy.mockReturnValue('order-clause')
    mockLimit.mockReturnValue('limit-clause')
    mockQuery.mockReturnValue('query-ref')
    mockGetDocs.mockRejectedValue(new Error('firestore-unavailable'))

    await expect(getUserTransactions('user-123')).rejects.toThrow(
      'firestore-unavailable',
    )
  })
})

describe('extractCookingItems', () => {
  const baseTx: GastifyTransaction = {
    id: 'tx-1',
    date: '2026-02-20',
    merchant: 'Jumbo',
    items: [],
    category: 'Groceries',
  }

  it('extracts items with cooking categories', () => {
    const transactions: GastifyTransaction[] = [
      {
        ...baseTx,
        items: [
          { name: 'Tomate', price: 500, category: 'Produce' },
          { name: 'Jabon', price: 300, category: 'Cleaning' },
          { name: 'Arroz', price: 800, category: 'Pantry' },
        ],
      },
    ]

    const result = extractCookingItems(transactions)

    expect(result).toHaveLength(2)
    expect(result[0].originalName).toBe('Tomate')
    expect(result[1].originalName).toBe('Arroz')
  })

  it('deduplicates by normalized name', () => {
    const transactions: GastifyTransaction[] = [
      {
        ...baseTx,
        items: [
          { name: 'Tomate Cherry', price: 500, category: 'Produce' },
          { name: 'tomate cherry', price: 600, category: 'Produce' },
        ],
      },
    ]

    const result = extractCookingItems(transactions)

    expect(result).toHaveLength(1)
    expect(result[0].originalName).toBe('Tomate Cherry')
  })

  it('skips items without a category', () => {
    const transactions: GastifyTransaction[] = [
      {
        ...baseTx,
        items: [{ name: 'Misterio', price: 100 }],
      },
    ]

    const result = extractCookingItems(transactions)

    expect(result).toHaveLength(0)
  })

  it('defaults qty to 1 when not provided', () => {
    const transactions: GastifyTransaction[] = [
      {
        ...baseTx,
        items: [{ name: 'Leche', price: 900, category: 'Dairy & Eggs' }],
      },
    ]

    const result = extractCookingItems(transactions)

    expect(result[0].qty).toBe(1)
  })

  it('returns empty array for empty transactions', () => {
    const result = extractCookingItems([])
    expect(result).toEqual([])
  })

  it('includes transaction metadata in extracted items', () => {
    const transactions: GastifyTransaction[] = [
      {
        ...baseTx,
        id: 'tx-99',
        date: '2026-01-15',
        merchant: 'Lider',
        items: [
          { name: 'Pan', price: 400, qty: 2, category: 'Bakery' },
        ],
      },
    ]

    const result = extractCookingItems(transactions)

    expect(result[0]).toEqual({
      originalName: 'Pan',
      normalizedName: 'pan',
      qty: 2,
      category: 'Bakery',
      transactionId: 'tx-99',
      date: '2026-01-15',
      merchant: 'Lider',
    })
  })
})

describe('getUnmappedItems', () => {
  it('filters out items that have a mapping', () => {
    const items = [
      { originalName: 'Tomate', normalizedName: 'tomate', qty: 1, category: 'Produce', transactionId: 'tx-1', date: '2026-02-20', merchant: 'Jumbo' },
      { originalName: 'Arroz', normalizedName: 'arroz', qty: 1, category: 'Pantry', transactionId: 'tx-1', date: '2026-02-20', merchant: 'Jumbo' },
    ]
    const mappings = new Map<string, ItemMapping>([
      ['tomate', { canonicalId: 'tomato', source: 'Tomate', normalizedSource: 'tomate', createdBy: 'user-1', createdAt: {} as Timestamp }],
    ])

    const result = getUnmappedItems(items, mappings)

    expect(result).toHaveLength(1)
    expect(result[0].normalizedName).toBe('arroz')
  })

  it('returns all items when no mappings exist', () => {
    const items = [
      { originalName: 'Tomate', normalizedName: 'tomate', qty: 1, category: 'Produce', transactionId: 'tx-1', date: '2026-02-20', merchant: 'Jumbo' },
    ]
    const mappings = new Map<string, ItemMapping>()

    const result = getUnmappedItems(items, mappings)

    expect(result).toHaveLength(1)
  })

  it('returns empty array when all items are mapped', () => {
    const items = [
      { originalName: 'Tomate', normalizedName: 'tomate', qty: 1, category: 'Produce', transactionId: 'tx-1', date: '2026-02-20', merchant: 'Jumbo' },
    ]
    const mappings = new Map<string, ItemMapping>([
      ['tomate', { canonicalId: 'tomato', source: 'Tomate', normalizedSource: 'tomate', createdBy: 'user-1', createdAt: {} as Timestamp }],
    ])

    const result = getUnmappedItems(items, mappings)

    expect(result).toEqual([])
  })
})
