import type { Timestamp } from 'firebase/firestore'

export interface PantryItem {
  canonicalId: string
  name: string
  quantity: number
  unit: string
  purchasedAt: Timestamp
  estimatedExpiry: Timestamp
  sourceTransactionId?: string
  status: 'available' | 'low' | 'expired'
}
