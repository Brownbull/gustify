import { doc, setDoc, updateDoc, increment, Timestamp, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { normalizeItemName } from '@/types/item-mapping'

/**
 * Reports an unknown ingredient. Creates the doc if first time,
 * or increments the counter if already reported by any user.
 */
export async function reportUnknownIngredient(
  itemName: string,
  userId: string,
): Promise<void> {
  const normalized = normalizeItemName(itemName)
  const ref = doc(db, 'unknownIngredients', normalized)
  const existing = await getDoc(ref)

  if (existing.exists()) {
    await updateDoc(ref, {
      count: increment(1),
      lastReportedAt: Timestamp.now(),
    })
  } else {
    await setDoc(ref, {
      name: itemName,
      normalizedName: normalized,
      count: 1,
      reportedBy: userId,
      createdAt: Timestamp.now(),
      lastReportedAt: Timestamp.now(),
    })
  }
}

/**
 * Reports an unknown prepared food. Creates the doc if first time,
 * or increments the counter if already reported by any user.
 */
export async function reportUnknownPreparedFood(
  itemName: string,
  userId: string,
): Promise<void> {
  const normalized = normalizeItemName(itemName)
  const ref = doc(db, 'unknownPreparedFoods', normalized)
  const existing = await getDoc(ref)

  if (existing.exists()) {
    await updateDoc(ref, {
      count: increment(1),
      lastReportedAt: Timestamp.now(),
    })
  } else {
    await setDoc(ref, {
      name: itemName,
      normalizedName: normalized,
      count: 1,
      reportedBy: userId,
      createdAt: Timestamp.now(),
      lastReportedAt: Timestamp.now(),
    })
  }
}
