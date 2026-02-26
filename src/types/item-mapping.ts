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

/** Prefix for unknown ingredient IDs in pantry */
export const UNKNOWN_INGREDIENT_PREFIX = 'unknown_ing_'

/** Prefix for unknown prepared food IDs in pantry */
export const UNKNOWN_PREPARED_PREFIX = 'unknown_prep_'

/** Default shelf life in days for unknown ingredients (conservative) */
export const UNKNOWN_INGREDIENT_SHELF_LIFE_DAYS = 7

/** Generates a pantry document ID for an unknown ingredient. */
export function unknownIngredientId(normalizedName: string): string {
  return `${UNKNOWN_INGREDIENT_PREFIX}${normalizedName.replace(/\s+/g, '_')}`
}

/** Generates a pantry document ID for an unknown prepared food. */
export function unknownPreparedId(normalizedName: string): string {
  return `${UNKNOWN_PREPARED_PREFIX}${normalizedName.replace(/\s+/g, '_')}`
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
 * Lowercases, trims whitespace, collapses multiple spaces to one,
 * and replaces '/' with ' ' (slashes are invalid in Firestore doc IDs).
 * Throws on empty input.
 */
export function normalizeItemName(name: string): string {
  const normalized = name.toLowerCase().trim().replace(/\//g, ' ').replace(/\s+/g, ' ')
  if (!normalized) {
    throw new Error('Invalid item name')
  }
  return normalized
}
