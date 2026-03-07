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
}

function decodeEntities(input: string): string {
  // Decode named entities
  let result = input.replace(/&(?:lt|gt|amp|quot);/g, (match) => HTML_ENTITIES[match] ?? match)

  // Decode hex numeric entities (&#xHH; or &#xHHHH;)
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  )

  // Decode decimal numeric entities (&#NNN;)
  result = result.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))

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

export function sanitizeText(input: string, opts?: SanitizeOptions): string {
  if (typeof input !== 'string') return ''

  // Step 1: Remove dangerous elements (with content) and strip remaining tags
  let result = stripAllTags(input)

  // Step 2: Decode HTML entities
  result = decodeEntities(result)

  // Step 3: Re-strip any tags that survived entity decoding
  result = stripAllTags(result)

  // Step 4: Trim whitespace
  result = result.trim()

  // Step 5: Apply optional maxLength truncation
  if (opts?.maxLength !== undefined && result.length > opts.maxLength) {
    result = result.slice(0, opts.maxLength)
  }

  return result
}
