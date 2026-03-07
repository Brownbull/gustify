// Matches full elements whose inner content must also be removed (e.g. <script>…</script>)
const DANGEROUS_ELEMENTS_PATTERN =
  /<(script|style|iframe|object|embed|svg|math)[^>]*>[\s\S]*?<\/\1>/gi

// Matches any remaining HTML/XML tag (opening, closing, self-closing)
const TAG_PATTERN = /<[^>]*>/g

const HTML_ENTITIES: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': "'",
}

function decodeEntities(input: string): string {
  // Decode named entities
  let result = input.replace(/&(?:lt|gt|amp|quot|apos);/g, (match) => HTML_ENTITIES[match] ?? match)

  // Decode hex numeric entities (&#xHH; or &#xHHHH;) with codepoint validation
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    const cp = parseInt(hex, 16)
    return cp >= 0 && cp <= 0x10FFFF ? String.fromCodePoint(cp) : '\uFFFD'
  })

  // Decode decimal numeric entities (&#NNN;) with codepoint validation
  result = result.replace(/&#(\d+);/g, (_, dec) => {
    const cp = parseInt(dec, 10)
    return cp >= 0 && cp <= 0x10FFFF ? String.fromCodePoint(cp) : '\uFFFD'
  })

  return result
}

function stripAllTags(input: string): string {
  // First remove dangerous full elements (script, style, etc.) including their content
  let result = input.replace(DANGEROUS_ELEMENTS_PATTERN, '')
  // Then strip any remaining tags
  result = result.replace(TAG_PATTERN, '')
  return result
}

export interface SanitizeOptions {
  maxLength?: number
}

/** Strips HTML tags and decodes entities, producing plain text safe for JSX interpolation.
 *  NOT safe for raw HTML concatenation — decoded characters are not re-escaped. */
export function sanitizeText(input: string, opts?: SanitizeOptions): string {
  if (typeof input !== 'string') return ''

  // Decode+strip loop: repeat until output stabilizes (handles multi-layer encoding)
  let result = input
  for (let i = 0; i < 5; i++) {
    const prev = result
    result = stripAllTags(result)
    result = decodeEntities(result)
    if (result === prev) break
  }
  // Final strip pass after last decode
  result = stripAllTags(result)

  // Step 4: Trim whitespace
  result = result.trim()

  // Step 5: Apply optional maxLength truncation
  if (opts?.maxLength !== undefined && result.length > opts.maxLength) {
    result = result.slice(0, opts.maxLength)
  }

  return result
}
