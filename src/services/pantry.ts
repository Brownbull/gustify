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
import {
  PREPARED_FOOD_SHELF_LIFE_DAYS,
  PREPARED_FOOD_UNIT,
  preparedFoodId,
} from '@/types/item-mapping'

function pantryPath(userId: string): string {
  return `users/${userId}/pantry`
}

function docToPantryItem(d: QueryDocumentSnapshot<DocumentData>): PantryItem {
  return { id: d.id, ...d.data() } as PantryItem
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
 * Adds a prepared food item to the user's pantry.
 * Uses the original item name as display name and a generated ID as doc key.
 */
export async function addPreparedToPantry(
  userId: string,
  itemName: string,
  normalizedName: string,
  sourceTransactionId?: string,
): Promise<void> {
  const docId = preparedFoodId(normalizedName)
  const expiryMs = Date.now() + PREPARED_FOOD_SHELF_LIFE_DAYS * 86_400_000
  const data: Record<string, unknown> = {
    canonicalId: docId,
    name: itemName,
    quantity: 1,
    unit: PREPARED_FOOD_UNIT,
    purchasedAt: Timestamp.now(),
    estimatedExpiry: Timestamp.fromDate(new Date(expiryMs)),
    status: 'available',
    type: 'prepared',
  }

  if (sourceTransactionId) {
    data.sourceTransactionId = sourceTransactionId
  }

  await setDoc(doc(db, pantryPath(userId), docId), data, { merge: true })
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
