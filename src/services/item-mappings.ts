import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { ItemMapping } from '@/types/item-mapping'
import { normalizeItemName } from '@/types/item-mapping'

const COLLECTION = 'itemMappings'

function docToMapping(d: QueryDocumentSnapshot<DocumentData>): [string, ItemMapping] {
  return [d.id, { ...d.data() } as ItemMapping]
}

/**
 * Reads all item mappings from Firestore.
 * Returns a Map keyed by document ID (the normalized source name).
 */
export async function getAllMappings(): Promise<Map<string, ItemMapping>> {
  const snapshot = await getDocs(collection(db, COLLECTION))
  return new Map(snapshot.docs.map(docToMapping))
}

/**
 * Reads a single item mapping by normalized name.
 */
export async function getMapping(
  normalizedName: string,
): Promise<ItemMapping | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, normalizedName))
  if (!snapshot.exists()) return null
  return snapshot.data() as ItemMapping
}

/**
 * Creates a new item mapping. Uses the normalized source name as the document ID
 * so lookups are O(1) and duplicates are naturally prevented.
 */
export async function createMapping(
  source: string,
  canonicalId: string,
  userId: string,
): Promise<void> {
  const normalized = normalizeItemName(source)
  await setDoc(doc(db, COLLECTION, normalized), {
    canonicalId,
    source,
    normalizedSource: normalized,
    createdBy: userId,
    createdAt: Timestamp.now(),
  })
}
