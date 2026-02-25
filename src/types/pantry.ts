import type { Timestamp } from 'firebase/firestore'
import type { IngredientCategory } from './ingredient'

export type PantryItemType = 'ingredient' | 'prepared'

export type ExpiryStatus = 'fresh' | 'expiring-soon' | 'expired'

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

export interface EnrichedPantryItem extends PantryItem {
  icon: string
  category: IngredientCategory
  expiryStatus: ExpiryStatus
}
