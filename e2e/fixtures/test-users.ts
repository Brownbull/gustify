export interface TestUser {
  uid: string
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
    uid: 'test-principiante-001',
    email: 'test-principiante@gustify-e2e.com',
    displayName: 'Ana Principiante',
    photoURL: 'https://ui-avatars.com/api/?name=Ana+P&background=4a7c59&color=fff',
    firestoreDoc: {
      profile: {
        name: 'Ana Principiante',
        email: 'test-principiante@gustify-e2e.com',
        photoUrl: 'https://ui-avatars.com/api/?name=Ana+P&background=4a7c59&color=fff',
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
    uid: 'test-comodo-001',
    email: 'test-comodo@gustify-e2e.com',
    displayName: 'Bruno Cómodo',
    photoURL: 'https://ui-avatars.com/api/?name=Bruno+C&background=5b8fa8&color=fff',
    firestoreDoc: {
      profile: {
        name: 'Bruno Cómodo',
        email: 'test-comodo@gustify-e2e.com',
        photoUrl: 'https://ui-avatars.com/api/?name=Bruno+C&background=5b8fa8&color=fff',
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
    uid: 'test-aventurero-001',
    email: 'test-aventurero@gustify-e2e.com',
    displayName: 'Carla Aventurera',
    photoURL: 'https://ui-avatars.com/api/?name=Carla+A&background=e8a87c&color=fff',
    firestoreDoc: {
      profile: {
        name: 'Carla Aventurera',
        email: 'test-aventurero@gustify-e2e.com',
        photoUrl: 'https://ui-avatars.com/api/?name=Carla+A&background=e8a87c&color=fff',
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
    uid: 'test-avanzado-001',
    email: 'test-avanzado@gustify-e2e.com',
    displayName: 'Diego Avanzado',
    photoURL: 'https://ui-avatars.com/api/?name=Diego+A&background=35593f&color=fff',
    firestoreDoc: {
      profile: {
        name: 'Diego Avanzado',
        email: 'test-avanzado@gustify-e2e.com',
        photoUrl: 'https://ui-avatars.com/api/?name=Diego+A&background=35593f&color=fff',
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
