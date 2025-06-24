import { describe, it, expect } from 'vitest'

// Simple utility functions for testing
export function formatDate(date: Date): string {
  return date.toLocaleDateString()
}

export function validateNote(content: string): boolean {
  return content.trim().length > 0
}

describe('Utility Functions', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-01')
    const formatted = formatDate(date)
    expect(formatted).toBeDefined()
    expect(typeof formatted).toBe('string')
  })

  it('should validate notes correctly', () => {
    expect(validateNote('Valid note')).toBe(true)
    expect(validateNote('   ')).toBe(false)
    expect(validateNote('')).toBe(false)
    expect(validateNote('  Valid note  ')).toBe(true)
  })
})