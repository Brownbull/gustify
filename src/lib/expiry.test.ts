import { describe, it, expect } from 'vitest'
import { computeExpiryStatus, formatRelativeExpiry } from './expiry'

function mockTimestamp(ms: number) {
  return { toMillis: () => ms } as import('firebase/firestore').Timestamp
}

describe('computeExpiryStatus', () => {
  const now = new Date('2026-02-25T12:00:00Z')
  const nowMs = now.getTime()

  it('returns "expired" when expiry is in the past', () => {
    const yesterday = mockTimestamp(nowMs - 86_400_000)
    expect(computeExpiryStatus(yesterday, now)).toBe('expired')
  })

  it('returns "expired" when expiry is exactly now', () => {
    const exact = mockTimestamp(nowMs)
    expect(computeExpiryStatus(exact, now)).toBe('expired')
  })

  it('returns "expiring-soon" when expiry is within 3 days', () => {
    const in2Days = mockTimestamp(nowMs + 2 * 86_400_000)
    expect(computeExpiryStatus(in2Days, now)).toBe('expiring-soon')
  })

  it('returns "expiring-soon" when expiry is exactly 3 days away', () => {
    const in3Days = mockTimestamp(nowMs + 3 * 86_400_000)
    expect(computeExpiryStatus(in3Days, now)).toBe('expiring-soon')
  })

  it('returns "fresh" when expiry is more than 3 days away', () => {
    const in4Days = mockTimestamp(nowMs + 4 * 86_400_000)
    expect(computeExpiryStatus(in4Days, now)).toBe('fresh')
  })

  it('returns "expiring-soon" when expiry is 1 millisecond from now', () => {
    const almostNow = mockTimestamp(nowMs + 1)
    expect(computeExpiryStatus(almostNow, now)).toBe('expiring-soon')
  })

  it('returns "fresh" when expiry is 3 days + 1 ms away', () => {
    const justOverThree = mockTimestamp(nowMs + 3 * 86_400_000 + 1)
    expect(computeExpiryStatus(justOverThree, now)).toBe('fresh')
  })
})

describe('formatRelativeExpiry', () => {
  it('returns relative day strings', () => {
    const now = Date.now()
    expect(formatRelativeExpiry(mockTimestamp(now))).toBe('hoy')
    expect(formatRelativeExpiry(mockTimestamp(now + 86_400_000))).toBe('mañana')
    expect(formatRelativeExpiry(mockTimestamp(now - 86_400_000))).toBe('ayer')
    expect(formatRelativeExpiry(mockTimestamp(now + 5 * 86_400_000))).toBe('en 5 días')
    expect(formatRelativeExpiry(mockTimestamp(now - 3 * 86_400_000))).toBe('hace 3 días')
  })
})
