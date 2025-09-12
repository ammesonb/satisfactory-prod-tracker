import { describe, it, expect } from 'vitest'
import { isPositiveNumber } from '../validation'

describe('validation utilities', () => {
  // Helper to test multiple cases efficiently
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expectPositiveNumber = (value: any, expected: boolean, description: string) => {
    it(`should return ${expected} for ${description}`, () => {
      expect(isPositiveNumber(value)).toBe(expected)
    })
  }

  // Helper to test edge cases that should be false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expectNotPositiveNumber = (value: any, description: string) => {
    expectPositiveNumber(value, false, description)
  }

  // Helper to test valid positive numbers
  const expectValidPositiveNumber = (value: number, description: string) => {
    expectPositiveNumber(value, true, description)
  }

  describe('isPositiveNumber', () => {
    describe('valid positive numbers', () => {
      expectValidPositiveNumber(1, 'integer 1')
      expectValidPositiveNumber(42, 'integer 42')
      expectValidPositiveNumber(0.1, 'decimal 0.1')
      expectValidPositiveNumber(0.5, 'decimal 0.5')
      expectValidPositiveNumber(1.5, 'decimal 1.5')
      expectValidPositiveNumber(3.14159, 'decimal 3.14159')
      expectValidPositiveNumber(999999, 'large integer 999999')
      expectValidPositiveNumber(Number.MAX_SAFE_INTEGER, 'Number.MAX_SAFE_INTEGER')
      expectValidPositiveNumber(Number.MIN_VALUE, 'Number.MIN_VALUE (smallest positive)')
    })

    describe('invalid numbers - zero and negative', () => {
      expectNotPositiveNumber(0, 'zero')
      expectNotPositiveNumber(-1, 'negative integer -1')
      expectNotPositiveNumber(-0.1, 'negative decimal -0.1')
      expectNotPositiveNumber(-42, 'negative integer -42')
      expectNotPositiveNumber(-999999, 'large negative integer')
      expectNotPositiveNumber(Number.MIN_SAFE_INTEGER, 'Number.MIN_SAFE_INTEGER')
    })

    describe('invalid numbers - special numeric values', () => {
      expectNotPositiveNumber(NaN, 'NaN')
      // Note: Infinity is actually > 0, so it passes the current validation
      // This documents the current behavior rather than expected behavior
      expectPositiveNumber(Infinity, true, 'Infinity (technically > 0)')
      expectNotPositiveNumber(-Infinity, '-Infinity')
    })

    describe('non-numeric types', () => {
      expectNotPositiveNumber('1', 'string "1"')
      expectNotPositiveNumber('42', 'string "42"')
      expectNotPositiveNumber('0.5', 'string "0.5"')
      expectNotPositiveNumber('', 'empty string')
      expectNotPositiveNumber('abc', 'non-numeric string')
      expectNotPositiveNumber(true, 'boolean true')
      expectNotPositiveNumber(false, 'boolean false')
      expectNotPositiveNumber(null, 'null')
      expectNotPositiveNumber(undefined, 'undefined')
      expectNotPositiveNumber({}, 'empty object')
      expectNotPositiveNumber({ value: 1 }, 'object with numeric property')
      expectNotPositiveNumber([], 'empty array')
      expectNotPositiveNumber([1], 'array with number')
      expectNotPositiveNumber(() => 1, 'function returning number')
    })

    describe('type coercion edge cases', () => {
      // These test that the function doesn't rely on JavaScript's type coercion
      expectNotPositiveNumber('1.5', 'numeric string that could be parsed')
      expectNotPositiveNumber(' 1 ', 'numeric string with whitespace')
      expectNotPositiveNumber('+1', 'string with plus sign')
      expectNotPositiveNumber('1e2', 'scientific notation string')
      expectNotPositiveNumber('0x1', 'hexadecimal string')
    })

    describe('comprehensive validation', () => {
      it('should validate type, NaN, and positivity in correct order', () => {
        // Test the complete validation logic
        const testCases: Array<[number | string | null, boolean, string]> = [
          // Valid cases
          [1, true, 'basic positive integer'],
          [0.001, true, 'very small positive decimal'],

          // Invalid type (should fail type check first)
          ['5', false, 'string that looks like number'],
          [null, false, 'null value'],

          // Valid type but NaN (should fail NaN check)
          [NaN, false, 'explicit NaN'],
          [Number('abc'), false, 'NaN from invalid parsing'],

          // Valid type and not NaN but not positive (should fail positivity check)
          [0, false, 'zero'],
          [-1, false, 'negative number'],
          [-0, false, 'negative zero'],
        ]

        testCases.forEach(([value, expected]) => {
          expect(isPositiveNumber(value as number)).toBe(expected)
        })
      })

      it('should handle edge cases with floating point precision', () => {
        // Very small positive numbers should still be valid
        expect(isPositiveNumber(Number.EPSILON)).toBe(true)
        expect(isPositiveNumber(1e-10)).toBe(true)
        expect(isPositiveNumber(1e-100)).toBe(true)

        // Numbers very close to zero but still positive
        expect(isPositiveNumber(0.000000001)).toBe(true)
      })
    })
  })
})
