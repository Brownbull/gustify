import type { Timestamp } from 'firebase/firestore'
import type { PantryItemType } from './pantry'

export interface ItemMapping {
  canonicalId: string
  source: string
  normalizedSource: string
  createdBy: string
  createdAt: Timestamp
  type?: PantryItemType
}

/** Prefix for prepared food IDs in pantry and item mappings */
export const PREPARED_FOOD_PREFIX = 'prepared_'

/** Default shelf life in days for prepared foods (frozen/packaged) */
export const PREPARED_FOOD_SHELF_LIFE_DAYS = 90

/** Default unit for prepared food pantry items */
export const PREPARED_FOOD_UNIT = 'unidad'

/** Icon for prepared food items */
export const PREPARED_FOOD_ICON = '🍱'

/**
 * Generates a pantry document ID for a prepared food item.
 * Uses the normalized item name to allow merge behavior
 * (same product purchased again updates the timestamp).
 */
export function preparedFoodId(normalizedName: string): string {
  return `${PREPARED_FOOD_PREFIX}${normalizedName.replace(/\s+/g, '_')}`
}

/**
 * Gastify transaction categories that contain cooking-related items.
 * Used to filter out non-food purchases (e.g. cleaning supplies, toiletries).
 */
export const COOKING_CATEGORIES = [
  'Produce',
  'Meat & Seafood',
  'Bakery',
  'Dairy & Eggs',
  'Pantry',
  'Frozen Foods',
] as const

export type CookingCategory = (typeof COOKING_CATEGORIES)[number]

/**
 * Normalizes a raw grocery item name for consistent lookup.
 * Lowercases, trims whitespace, and collapses multiple spaces to one.
 * Throws on empty or path-traversal input (names containing '/').
 */
export function normalizeItemName(name: string): string {
  const normalized = name.toLowerCase().trim().replace(/\s+/g, ' ')
  if (!normalized || normalized.includes('/')) {
    throw new Error('Invalid item name')
  }
  return normalized
}
