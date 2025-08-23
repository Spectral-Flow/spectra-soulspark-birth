import { describe, it, expect } from 'vitest'
import { BRAND, DEMO_PROPERTY, formatDate } from '../packages/core/src'

describe('Elysia Demo Core', () => {
  it('should have correct branding', () => {
    expect(BRAND.name).toBe('Elysia')
    expect(BRAND.tagline).toBe('Your community. Your connection. Your concierge.')
  })

  it('should have demo property info', () => {
    expect(DEMO_PROPERTY.name).toBe('The Meridian Apartments')
    expect(DEMO_PROPERTY.phone).toBe('(555) 123-4567')
  })

  it('should format dates correctly', () => {
    const testDate = new Date('2024-07-15T14:00:00')
    const formatted = formatDate(testDate)
    expect(formatted).toContain('2024')
  })
})