import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { GastifyTransaction, GastifyTransactionItem } from '@/types/gastify'
import { COOKING_CATEGORIES, normalizeItemName } from '@/types/item-mapping'
import type { ItemMapping } from '@/types/item-mapping'

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined

export interface ExtractedItem {
  originalName: string
  normalizedName: string
  qty: number
  category: string
  transactionId: string
  date: string
  merchant: string
}

function docToTransaction(d: QueryDocumentSnapshot<DocumentData>): GastifyTransaction {
  return { ...d.data(), id: d.id } as GastifyTransaction
}

/**
 * Reads the user's Gastify transactions from the shared Firebase project.
 * Path: artifacts/{projectId}/users/{userId}/transactions
 */
export async function getUserTransactions(
  userId: string,
): Promise<GastifyTransaction[]> {
  if (!PROJECT_ID) {
    throw new Error('VITE_FIREBASE_PROJECT_ID is not set')
  }
  const colPath = `artifacts/${PROJECT_ID}/users/${userId}/transactions`
  const q = query(
    collection(db, colPath),
    orderBy('date', 'desc'),
    limit(50),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(docToTransaction)
}

/**
 * Flattens all items from transactions, filters to cooking-related categories,
 * and deduplicates by normalized name (keeping the first occurrence).
 */
export function extractCookingItems(
  transactions: GastifyTransaction[],
): ExtractedItem[] {
  const seen = new Set<string>()
  const result: ExtractedItem[] = []

  for (const tx of transactions) {
    for (const item of tx.items) {
      if (!isCookingItem(item)) continue

      const normalized = normalizeItemName(item.name)
      if (seen.has(normalized)) continue

      seen.add(normalized)
      result.push({
        originalName: item.name,
        normalizedName: normalized,
        qty: item.qty ?? 1,
        category: item.category ?? '',
        transactionId: tx.id,
        date: tx.date,
        merchant: tx.merchant,
      })
    }
  }

  return result
}

/**
 * Filters out items that already have a mapping in the provided Map.
 */
export function getUnmappedItems(
  items: ExtractedItem[],
  mappings: Map<string, ItemMapping>,
): ExtractedItem[] {
  return items.filter((item) => !mappings.has(item.normalizedName))
}

function isCookingItem(item: GastifyTransactionItem): boolean {
  if (!item.category) return false
  return (COOKING_CATEGORIES as readonly string[]).includes(item.category)
}
