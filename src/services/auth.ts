import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import type { UserDocument } from '@/types/user'

const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function signOutUser(): Promise<void> {
  await signOut(auth)
}

export async function ensureUserProfile(user: User): Promise<void> {
  const userRef = doc(db, 'users', user.uid)
  const snapshot = await getDoc(userRef)

  if (snapshot.exists()) return

  const newUser: UserDocument = {
    profile: {
      name: user.displayName ?? '',
      email: user.email ?? '',
      photoUrl: user.photoURL ?? '',
      createdAt: Timestamp.now(),
    },
    cookingProfile: {
      dietPrefs: [],
      allergies: [],
      proficiencyTier: 'Principiante',
      avgComplexity: 0,
      dishesCooked: 0,
      cookedCuisines: [],
      cookedTechniques: [],
      cookedIngredients: [],
    },
    settings: {
      locale: 'es',
      currency: 'CLP',
      theme: 'light',
    },
  }

  await setDoc(userRef, newUser)
}

export function subscribeToAuth(
  callback: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback)
}
