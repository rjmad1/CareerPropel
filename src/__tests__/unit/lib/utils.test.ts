import { cn } from '@/lib/utils'

describe('cn (class name utility)', () => {
  it('joins multiple string classes', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz')
  })

  it('filters out undefined values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar')
  })

  it('filters out null values', () => {
    expect(cn('foo', null, 'bar')).toBe('foo bar')
  })

  it('filters out false values', () => {
    expect(cn('foo', false, 'bar')).toBe('foo bar')
  })

  it('filters out empty strings', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar')
  })

  it('returns empty string when all args are falsy', () => {
    expect(cn(undefined, null, false, '')).toBe('')
  })

  it('returns empty string with no arguments', () => {
    expect(cn()).toBe('')
  })

  it('handles a single class', () => {
    expect(cn('only-class')).toBe('only-class')
  })

  it('handles conditional classes via boolean expressions', () => {
    const isActive = true
    const isDisabled = false
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active')
  })

  it('preserves class order', () => {
    expect(cn('a', 'b', 'c', 'd')).toBe('a b c d')
  })

  it('handles classes with spaces within a single string', () => {
    expect(cn('foo bar', 'baz')).toBe('foo bar baz')
  })
})
