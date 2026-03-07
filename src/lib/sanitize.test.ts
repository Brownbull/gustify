import { describe, it, expect } from 'vitest'
import { sanitizeText } from './sanitize'

describe('sanitizeText', () => {
  describe('plain text passthrough', () => {
    it('returns normal plain text unchanged', () => {
      expect(sanitizeText('Hello world')).toBe('Hello world')
    })

    it('returns Spanish text with accents unchanged', () => {
      expect(sanitizeText('Ñoquis con salsa de tomate y ají')).toBe(
        'Ñoquis con salsa de tomate y ají',
      )
    })

    it('returns text with é, á, ó, ú, ü unchanged', () => {
      expect(sanitizeText('Técnica básica: cocción al vapor')).toBe(
        'Técnica básica: cocción al vapor',
      )
    })
  })

  describe('HTML tag stripping', () => {
    it('strips <script> tags and their content leaving empty string', () => {
      expect(sanitizeText("<script>alert('xss')</script>")).toBe('')
    })

    it('strips <b> tags leaving inner text', () => {
      expect(sanitizeText('<b>bold</b>')).toBe('bold')
    })

    it('strips <img> tags with dangerous attributes leaving empty string', () => {
      expect(sanitizeText('<img src=x onerror=alert(1)>')).toBe('')
    })

    it('strips <a> tags leaving inner text', () => {
      expect(sanitizeText('<a href="javascript:void(0)">link</a>')).toBe('link')
    })

    it('strips nested HTML tags leaving only text content', () => {
      expect(sanitizeText('<div><p>safe text</p></div>')).toBe('safe text')
    })

    it('strips self-closing tags', () => {
      expect(sanitizeText('before<br/>after')).toBe('beforeafter')
    })
  })

  describe('HTML entity decoding attacks', () => {
    it('strips tags encoded with named entities (&lt; &gt;)', () => {
      expect(sanitizeText("&lt;script&gt;alert('xss')&lt;/script&gt;")).toBe('')
    })

    it('strips tags encoded with decimal numeric entities (&#60; &#62;)', () => {
      expect(sanitizeText('&#60;script&#62;alert(1)&#60;/script&#62;')).toBe('')
    })

    it('strips tags encoded with hex numeric entities (&#x3C; &#x3E;)', () => {
      expect(sanitizeText('&#x3C;script&#x3E;alert(1)&#x3C;/script&#x3E;')).toBe('')
    })

    it('decodes &amp; to & in plain text context', () => {
      expect(sanitizeText('salt &amp; pepper')).toBe('salt & pepper')
    })

    it('decodes &quot; to " in plain text context', () => {
      expect(sanitizeText('say &quot;hello&quot;')).toBe('say "hello"')
    })

    it("decodes &apos; to ' in plain text context", () => {
      expect(sanitizeText("it&apos;s delicious")).toBe("it's delicious")
    })
  })

  describe('maxLength option', () => {
    it('truncates output to maxLength when input exceeds it', () => {
      expect(sanitizeText('Hello world', { maxLength: 5 })).toBe('Hello')
    })

    it('is a no-op when input is shorter than maxLength', () => {
      expect(sanitizeText('Hi', { maxLength: 100 })).toBe('Hi')
    })

    it('is a no-op when input length equals maxLength', () => {
      expect(sanitizeText('Hello', { maxLength: 5 })).toBe('Hello')
    })

    it('applies maxLength after stripping tags', () => {
      expect(sanitizeText('<b>Hello world</b>', { maxLength: 5 })).toBe('Hello')
    })
  })

  describe('whitespace handling', () => {
    it('trims leading and trailing whitespace', () => {
      expect(sanitizeText('  hello  ')).toBe('hello')
    })

    it('returns empty string for whitespace-only input', () => {
      expect(sanitizeText('   ')).toBe('')
    })

    it('returns empty string for empty string input', () => {
      expect(sanitizeText('')).toBe('')
    })
  })

  describe('non-string input guard', () => {
    it('returns empty string for undefined input', () => {
      expect(sanitizeText(undefined as unknown as string)).toBe('')
    })

    it('returns empty string for null input', () => {
      expect(sanitizeText(null as unknown as string)).toBe('')
    })

    it('returns empty string for number input', () => {
      expect(sanitizeText(42 as unknown as string)).toBe('')
    })
  })
})
