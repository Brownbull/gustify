export const TEST_USER_PASSWORD = 'gustify-staging-test-2026'

export interface TestUser {
  email: string
  displayName: string
  photoURL: string
  firestoreDoc: {
    profile: {
      name: string
      email: string
      photoUrl: string
    }
    cookingProfile: {
      dietPrefs: string[]
      allergies: string[]
      proficiencyTier: 'Principiante' | 'Cómodo' | 'Aventurero' | 'Avanzado'
      avgComplexity: number
      dishesCooked: number
      cookedCuisines: string[]
      cookedTechniques: string[]
      cookedIngredients: string[]
    }
    settings: {
      locale: string
      currency: string
      theme: 'light' | 'dark'
    }
  }
}

export const TEST_USERS = {
  principiante: {
    email: 'alice@boletapp.test',
    displayName: 'Alice Principiante',
    photoURL: 'https://ui-avatars.com/api/?name=Alice+P&background=4a7c59&color=fff',
    firestoreDoc: {
      profile: {
        name: 'Alice Principiante',
        email: 'alice@boletapp.test',
        photoUrl: 'https://ui-avatars.com/api/?name=Alice+P&background=4a7c59&color=fff',
      },
      cookingProfile: {
        dietPrefs: [],
        allergies: [],
        proficiencyTier: 'Principiante' as const,
        avgComplexity: 1.5,
        dishesCooked: 3,
        cookedCuisines: ['Chilena'],
        cookedTechniques: ['Hervir'],
        cookedIngredients: ['pollo', 'arroz', 'tomate'],
      },
      settings: { locale: 'es', currency: 'CLP', theme: 'light' as const },
    },
  },

  comodo: {
    email: 'bob@boletapp.test',
    displayName: 'Bob Cómodo',
    photoURL: 'https://ui-avatars.com/api/?name=Bob+C&background=5b8fa8&color=fff',
    firestoreDoc: {
      profile: {
        name: 'Bob Cómodo',
        email: 'bob@boletapp.test',
        photoUrl: 'https://ui-avatars.com/api/?name=Bob+C&background=5b8fa8&color=fff',
      },
      cookingProfile: {
        dietPrefs: ['Sin gluten'],
        allergies: ['Mariscos'],
        proficiencyTier: 'Cómodo' as const,
        avgComplexity: 2.5,
        dishesCooked: 15,
        cookedCuisines: ['Chilena', 'Italiana', 'Mexicana'],
        cookedTechniques: ['Hervir', 'Saltear', 'Hornear'],
        cookedIngredients: [
          'pollo', 'arroz', 'tomate', 'cebolla', 'ajo',
          'pasta', 'queso', 'pimiento',
        ],
      },
      settings: { locale: 'es', currency: 'CLP', theme: 'light' as const },
    },
  },

  aventurero: {
    email: 'charlie@boletapp.test',
    displayName: 'Charlie Aventurero',
    photoURL: 'https://ui-avatars.com/api/?name=Charlie+A&background=e8a87c&color=fff',
    firestoreDoc: {
      profile: {
        name: 'Charlie Aventurero',
        email: 'charlie@boletapp.test',
        photoUrl: 'https://ui-avatars.com/api/?name=Charlie+A&background=e8a87c&color=fff',
      },
      cookingProfile: {
        dietPrefs: [],
        allergies: [],
        proficiencyTier: 'Aventurero' as const,
        avgComplexity: 3.4,
        dishesCooked: 42,
        cookedCuisines: ['Chilena', 'Italiana', 'Mexicana', 'Japonesa', 'India'],
        cookedTechniques: ['Hervir', 'Saltear', 'Hornear', 'Glasear', 'Wok', 'Guisar'],
        cookedIngredients: [
          'pollo', 'arroz', 'tomate', 'cebolla', 'ajo', 'pasta', 'queso',
          'pimiento', 'jengibre', 'soja', 'curry', 'coco', 'cilantro',
          'limón', 'aguacate', 'champiñones', 'espinaca', 'garbanzos',
          'lentejas', 'salmón',
        ],
      },
      settings: { locale: 'es', currency: 'CLP', theme: 'dark' as const },
    },
  },

  avanzado: {
    email: 'diana@boletapp.test',
    displayName: 'Diana Avanzada',
    photoURL: 'https://ui-avatars.com/api/?name=Diana+A&background=35593f&color=fff',
    firestoreDoc: {
      profile: {
        name: 'Diana Avanzada',
        email: 'diana@boletapp.test',
        photoUrl: 'https://ui-avatars.com/api/?name=Diana+A&background=35593f&color=fff',
      },
      cookingProfile: {
        dietPrefs: ['Vegetariano'],
        allergies: [],
        proficiencyTier: 'Avanzado' as const,
        avgComplexity: 4.3,
        dishesCooked: 120,
        cookedCuisines: [
          'Chilena', 'Italiana', 'Mexicana', 'Japonesa', 'India',
          'Tailandesa', 'Francesa', 'Medio Oriente',
        ],
        cookedTechniques: [
          'Hervir', 'Saltear', 'Hornear', 'Glasear', 'Wok', 'Guisar',
          'Confitar', 'Deglasear', 'Emulsionar', 'Reducir',
        ],
        cookedIngredients: [
          'pollo', 'arroz', 'tomate', 'cebolla', 'ajo', 'pasta', 'queso',
          'pimiento', 'jengibre', 'soja', 'curry', 'coco', 'cilantro',
          'limón', 'aguacate', 'champiñones', 'espinaca', 'garbanzos',
          'lentejas', 'salmón', 'tofu', 'miso', 'tahini', 'berenjenas',
          'calabacín', 'remolacha', 'alcachofa', 'trufa', 'azafrán',
          'cardamomo', 'comino', 'pimentón', 'nueces', 'almendras',
          'sésamo', 'tamarindo', 'lemongrass', 'galangal', 'shiitake',
          'enoki',
        ],
      },
      settings: { locale: 'es', currency: 'CLP', theme: 'light' as const },
    },
  },
} satisfies Record<string, TestUser>

export type TestUserKey = keyof typeof TEST_USERS
