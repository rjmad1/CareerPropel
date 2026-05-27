import { isSafeObjectKey, hasOwnSafe } from '@/lib/security/objectGuards'

describe('objectGuards', () => {
  describe('isSafeObjectKey', () => {
    it('returns true for safe string keys', () => {
      expect(isSafeObjectKey('safeKey')).toBe(true)
      expect(isSafeObjectKey('name')).toBe(true)
    })

    it('returns true for number keys', () => {
      expect(isSafeObjectKey(123)).toBe(true)
      expect(isSafeObjectKey(0)).toBe(true)
    })

    it('returns true for symbol keys', () => {
      expect(isSafeObjectKey(Symbol('test'))).toBe(true)
    })

    it('returns false for blocked keys', () => {
      expect(isSafeObjectKey('__proto__')).toBe(false)
      expect(isSafeObjectKey('constructor')).toBe(false)
      expect(isSafeObjectKey('prototype')).toBe(false)
    })
  })

  describe('hasOwnSafe', () => {
    const safeObj = {
      safeKey: 'value',
      __proto__: { inherited: 'yes' },
    }

    it('returns true if the object has its own safe key', () => {
      expect(hasOwnSafe(safeObj, 'safeKey')).toBe(true)
    })

    it('returns false for inherited keys', () => {
      // 'toString' is inherited from Object.prototype
      expect(hasOwnSafe(safeObj, 'toString')).toBe(false)
    })

    it('returns false for missing keys', () => {
      expect(hasOwnSafe(safeObj, 'missingKey')).toBe(false)
    })

    it('returns false for blocked prototype keys', () => {
      expect(hasOwnSafe(safeObj, '__proto__')).toBe(false)
      expect(hasOwnSafe(safeObj, 'constructor')).toBe(false)
      expect(hasOwnSafe(safeObj, 'prototype')).toBe(false)
    })
  })
})
