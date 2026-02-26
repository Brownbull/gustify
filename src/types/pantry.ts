import type { Timestamp } from 'firebase/firestore'
import type { IngredientCategory } from './ingredient'

export type PantryItemType = 'ingredient' | 'prepared'

export type ExpiryStatus = 'fresh' | 'expiring-soon' | 'expired'

export type PreparedFoodCuisine =
  | 'mediterranean'
  | 'chinese'
  | 'indian'
  | 'peruvian'
  | 'chilean'
  | 'other'
  | 'unclassified'

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
  cuisine?: PreparedFoodCuisine
}

export interface EnrichedPantryItem extends PantryItem {
  icon: string
  category: IngredientCategory
  expiryStatus: ExpiryStatus
}
