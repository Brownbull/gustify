import { describe, it, expect } from 'vitest'
import { normalizeItemName, COOKING_CATEGORIES } from './item-mapping'

describe('normalizeItemName', () => {
  it('lowercases the input', () => {
    expect(normalizeItemName('Tomate Cherry')).toBe('tomate cherry')
  })

  it('trims leading and trailing whitespace', () => {
    expect(normalizeItemName('  arroz  ')).toBe('arroz')
  })

  it('collapses multiple spaces to one', () => {
    expect(normalizeItemName('leche   entera   larga   vida')).toBe(
      'leche entera larga vida',
    )
  })

  it('handles a combination of trim + collapse + lowercase', () => {
    expect(normalizeItemName('  Pechuga  De  Pollo  ')).toBe(
      'pechuga de pollo',
    )
  })

  it('returns empty string for empty input', () => {
    expect(normalizeItemName('')).toBe('')
  })

  it('returns empty string for whitespace-only input', () => {
    expect(normalizeItemName('   ')).toBe('')
  })

  it('handles single word without modification needed', () => {
    expect(normalizeItemName('manzana')).toBe('manzana')
  })

  it('handles tabs and mixed whitespace', () => {
    expect(normalizeItemName('pan\t  blanco')).toBe('pan blanco')
  })
})

describe('COOKING_CATEGORIES', () => {
  it('contains the expected categories', () => {
    expect(COOKING_CATEGORIES).toContain('Produce')
    expect(COOKING_CATEGORIES).toContain('Meat & Seafood')
    expect(COOKING_CATEGORIES).toContain('Bakery')
    expect(COOKING_CATEGORIES).toContain('Dairy & Eggs')
    expect(COOKING_CATEGORIES).toContain('Pantry')
    expect(COOKING_CATEGORIES).toContain('Frozen Foods')
    expect(COOKING_CATEGORIES).toHaveLength(6)
  })
})
