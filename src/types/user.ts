import { Timestamp } from 'firebase/firestore'

export interface UserProfile {
  name: string
  email: string
  photoUrl: string
  createdAt: Timestamp
}

export type ProficiencyTier = 'Principiante' | 'Cómodo' | 'Aventurero' | 'Avanzado'

export interface CookingProfile {
  dietPrefs: string[]
  allergies: string[]
  proficiencyTier: ProficiencyTier
  avgComplexity: number
  dishesCooked: number
  cookedCuisines: string[]
  cookedTechniques: string[]
  cookedIngredients: string[]
}

export interface UserSettings {
  locale: string
  currency: string
  theme: 'light' | 'dark'
}

export interface UserDocument {
  profile: UserProfile
  cookingProfile: CookingProfile
  settings: UserSettings
}
