export function getMatchColorClass(pct: number): string {
  if (pct >= 80) return 'bg-green-100 text-green-700'
  if (pct >= 50) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}
