import type { CanonicalPreparedFood } from '../../src/types/prepared-food.js'

const mediterranean: CanonicalPreparedFood[] = [
  { id: 'pizza_congelada', names: { es: 'Pizza congelada', en: 'Frozen pizza' }, cuisine: 'mediterranean', icon: '🍕', shelfLifeDays: 180 },
  { id: 'lasagna_congelada', names: { es: 'Lasaña congelada', en: 'Frozen lasagna' }, cuisine: 'mediterranean', icon: '🍝', shelfLifeDays: 180 },
  { id: 'hummus', names: { es: 'Hummus', en: 'Hummus' }, cuisine: 'mediterranean', icon: '🫘', shelfLifeDays: 14 },
  { id: 'falafel', names: { es: 'Falafel', en: 'Falafel' }, cuisine: 'mediterranean', icon: '🧆', shelfLifeDays: 5 },
]

const chinese: CanonicalPreparedFood[] = [
  { id: 'rollitos_primavera', names: { es: 'Rollitos primavera', en: 'Spring rolls' }, cuisine: 'chinese', icon: '🥟', shelfLifeDays: 90 },
  { id: 'arroz_frito', names: { es: 'Arroz frito', en: 'Fried rice' }, cuisine: 'chinese', icon: '🍚', shelfLifeDays: 3 },
  { id: 'wonton', names: { es: 'Wonton', en: 'Wonton' }, cuisine: 'chinese', icon: '🥟', shelfLifeDays: 90 },
  { id: 'chapsui', names: { es: 'Chapsui', en: 'Chop suey' }, cuisine: 'chinese', icon: '🥡', shelfLifeDays: 3 },
]

const indian: CanonicalPreparedFood[] = [
  { id: 'samosa', names: { es: 'Samosa', en: 'Samosa' }, cuisine: 'indian', icon: '🥟', shelfLifeDays: 90 },
  { id: 'naan', names: { es: 'Pan naan', en: 'Naan bread' }, cuisine: 'indian', icon: '🫓', shelfLifeDays: 7 },
  { id: 'curry_preparado', names: { es: 'Curry preparado', en: 'Prepared curry' }, cuisine: 'indian', icon: '🍛', shelfLifeDays: 5 },
]

const peruvian: CanonicalPreparedFood[] = [
  { id: 'ceviche', names: { es: 'Ceviche', en: 'Ceviche' }, cuisine: 'peruvian', icon: '🐟', shelfLifeDays: 1 },
  { id: 'causa', names: { es: 'Causa', en: 'Causa' }, cuisine: 'peruvian', icon: '🥔', shelfLifeDays: 3 },
  { id: 'aji_de_gallina', names: { es: 'Ají de gallina', en: 'Ají de gallina' }, cuisine: 'peruvian', icon: '🍗', shelfLifeDays: 3 },
]

const chilean: CanonicalPreparedFood[] = [
  { id: 'empanadas', names: { es: 'Empanadas', en: 'Empanadas' }, cuisine: 'chilean', icon: '🥟', shelfLifeDays: 90 },
  { id: 'pastel_de_choclo', names: { es: 'Pastel de choclo', en: 'Corn pie' }, cuisine: 'chilean', icon: '🌽', shelfLifeDays: 5 },
  { id: 'cazuela', names: { es: 'Cazuela', en: 'Cazuela' }, cuisine: 'chilean', icon: '🍲', shelfLifeDays: 3 },
  { id: 'completo', names: { es: 'Completo', en: 'Chilean hot dog' }, cuisine: 'chilean', icon: '🌭', shelfLifeDays: 1 },
  { id: 'sopaipillas', names: { es: 'Sopaipillas', en: 'Sopaipillas' }, cuisine: 'chilean', icon: '🫓', shelfLifeDays: 2 },
]

const other: CanonicalPreparedFood[] = [
  { id: 'sushi', names: { es: 'Sushi', en: 'Sushi' }, cuisine: 'other', icon: '🍣', shelfLifeDays: 1 },
  { id: 'hamburguesa', names: { es: 'Hamburguesa', en: 'Hamburger' }, cuisine: 'other', icon: '🍔', shelfLifeDays: 1 },
  { id: 'nuggets_pollo', names: { es: 'Nuggets de pollo', en: 'Chicken nuggets' }, cuisine: 'other', icon: '🍗', shelfLifeDays: 180 },
  { id: 'papas_fritas_congeladas', names: { es: 'Papas fritas congeladas', en: 'Frozen french fries' }, cuisine: 'other', icon: '🍟', shelfLifeDays: 365 },
  { id: 'tortilla_wrap', names: { es: 'Tortilla/Wrap', en: 'Tortilla/Wrap' }, cuisine: 'other', icon: '🌯', shelfLifeDays: 14 },
]

export const CANONICAL_PREPARED_FOODS: CanonicalPreparedFood[] = [
  ...mediterranean,
  ...chinese,
  ...indian,
  ...peruvian,
  ...chilean,
  ...other,
]
