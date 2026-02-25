import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  Timestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { CanonicalIngredient } from '@/types/ingredient'
import type { PantryItem } from '@/types/pantry'

function pantryPath(userId: string): string {
  return `users/${userId}/pantry`
}

function docToPantryItem(d: QueryDocumentSnapshot<DocumentData>): PantryItem {
  return { ...d.data() } as PantryItem
}

/**
 * Adds or updates an ingredient in the user's pantry.
 * Uses merge so repeated purchases update the timestamp without losing other fields.
 */
export async function addToPantry(
  userId: string,
  canonicalId: string,
  ingredient: CanonicalIngredient,
  sourceTransactionId?: string,
): Promise<void> {
  const expiryMs = Date.now() + ingredient.shelfLifeDays * 86_400_000
  const data: Record<string, unknown> = {
    canonicalId,
    name: ingredient.names.es,
    quantity: 1,
    unit: ingredient.defaultUnit,
    purchasedAt: Timestamp.now(),
    estimatedExpiry: Timestamp.fromDate(new Date(expiryMs)),
    status: 'available',
  }

  if (sourceTransactionId) {
    data.sourceTransactionId = sourceTransactionId
  }

  await setDoc(
    doc(db, pantryPath(userId), canonicalId),
    data,
    { merge: true },
  )
}

/**
 * Reads all items in the user's pantry subcollection.
 */
export async function getUserPantry(
  userId: string,
): Promise<PantryItem[]> {
  const snapshot = await getDocs(collection(db, pantryPath(userId)))
  return snapshot.docs.map(docToPantryItem)
}

/**
 * Removes an ingredient from the user's pantry.
 */
export async function removePantryItem(
  userId: string,
  canonicalId: string,
): Promise<void> {
  await deleteDoc(doc(db, pantryPath(userId), canonicalId))
}
