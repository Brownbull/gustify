import type { Timestamp } from 'firebase/firestore'

export interface ItemMapping {
  canonicalId: string
  source: string
  normalizedSource: string
  createdBy: string
  createdAt: Timestamp
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
