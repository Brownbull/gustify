import type { Timestamp } from 'firebase/firestore'
import type { ExpiryStatus } from '@/types/pantry'

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

export function computeExpiryStatus(
  estimatedExpiry: Timestamp,
  now: Date = new Date(),
): ExpiryStatus {
  const expiryMs = estimatedExpiry.toMillis()
  const nowMs = now.getTime()

  if (expiryMs <= nowMs) return 'expired'
  if (expiryMs - nowMs <= THREE_DAYS_MS) return 'expiring-soon'
  return 'fresh'
}

export function formatRelativeExpiry(estimatedExpiry: Timestamp): string {
  const diffMs = estimatedExpiry.toMillis() - Date.now()
  const diffDays = Math.round(diffMs / 86_400_000)

  if (diffDays === 0) return 'hoy'
  if (diffDays === 1) return 'mañana'
  if (diffDays === -1) return 'ayer'
  if (diffDays > 0) return `en ${diffDays} días`
  return `hace ${Math.abs(diffDays)} días`
}
