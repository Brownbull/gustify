import type { Timestamp } from 'firebase/firestore'

export type PantryItemType = 'ingredient' | 'prepared'

export interface PantryItem {
  id: string
  canonicalId: string
  name: string
  quantity: number
  unit: string
  purchasedAt: Timestamp
  estimatedExpiry: Timestamp
  sourceTransactionId?: string
  status: 'available' | 'low' | 'expired'
  type?: PantryItemType
}
