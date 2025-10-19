import { describe, expect, it, vi } from 'vitest'

import { memoize, memoizeSimple } from '@/utils/cache'

describe('cache utilities', () => {
  // Helper to create a mock function that tracks calls
  const createTrackedFunction = <TArgs extends unknown[], TReturn>(
    implementation: (...args: TArgs) => TReturn,
  ) => {
    const mockFn = vi.fn(implementation)
    return mockFn
  }

  // Helper to verify cache behavior
  const expectCacheBehavior = <TArgs extends unknown[], TReturn>(
    memoizedFn: (...args: TArgs) => TReturn,
    mockFn: ReturnType<typeof createTrackedFunction<TArgs, TReturn>>,
    firstArgs: TArgs,
    firstExpected: TReturn,
    secondArgs: TArgs,
    secondExpected: TReturn,
  ) => {
    // First call should invoke the original function
    const result1 = memoizedFn(...firstArgs)
    expect(result1).toBe(firstExpected)
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith(...firstArgs)

    // Second call with same args should return cached result
    const result2 = memoizedFn(...firstArgs)
    expect(result2).toBe(firstExpected)
    expect(mockFn).toHaveBeenCalledTimes(1) // Still only called once

    // Third call with different args should invoke the original function again
    const result3 = memoizedFn(...secondArgs)
    expect(result3).toBe(secondExpected)
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith(...secondArgs)
  }

  describe('memoize', () => {
    describe('basic functionality', () => {
      it('should cache results based on arguments', () => {
        const mockFn = createTrackedFunction((x: number, y: number) => x + y)
        const memoizedFn = memoize(mockFn)

        expectCacheBehavior(
          memoizedFn,
          mockFn,
          [1, 2], // firstArgs
          3, // firstExpected
          [2, 3], // secondArgs
          5, // secondExpected
        )
      })

      it('should handle single argument functions', () => {
        const mockFn = createTrackedFunction((x: number) => x * 2)
        const memoizedFn = memoize(mockFn)

        expectCacheBehavior(
          memoizedFn,
          mockFn,
          [5], // firstArgs
          10, // firstExpected
          [10], // secondArgs
          20, // secondExpected
        )
      })

      it('should handle no argument functions', () => {
        let counter = 0
        const mockFn = createTrackedFunction(() => ++counter)
        const memoizedFn = memoize(mockFn)

        const result1 = memoizedFn()
        expect(result1).toBe(1)
        expect(mockFn).toHaveBeenCalledTimes(1)

        const result2 = memoizedFn()
        expect(result2).toBe(1) // Should return cached result
        expect(mockFn).toHaveBeenCalledTimes(1)
      })

      it('should handle functions returning different types', () => {
        const mockFn = createTrackedFunction((prefix: string, num: number) => `${prefix}${num}`)
        const memoizedFn = memoize(mockFn)

        expectCacheBehavior(
          memoizedFn,
          mockFn,
          ['test', 1], // firstArgs
          'test1', // firstExpected
          ['prefix', 2], // secondArgs
          'prefix2', // secondExpected
        )
      })
    })

    describe('custom key generator', () => {
      it('should use custom key generator when provided', () => {
        const mockFn = createTrackedFunction((obj: { id: number; name: string }) => obj.id * 2)
        const memoizedFn = memoize(mockFn, (obj) => obj.id.toString())

        const obj1 = { id: 1, name: 'first' }
        const obj2 = { id: 1, name: 'different name' } // Same ID, different name
        const obj3 = { id: 2, name: 'second' }

        // First call
        const result1 = memoizedFn(obj1)
        expect(result1).toBe(2)
        expect(mockFn).toHaveBeenCalledTimes(1)

        // Second call with same ID should return cached result
        const result2 = memoizedFn(obj2)
        expect(result2).toBe(2) // Cached result, not recalculated
        expect(mockFn).toHaveBeenCalledTimes(1)

        // Third call with different ID should call function
        const result3 = memoizedFn(obj3)
        expect(result3).toBe(4)
        expect(mockFn).toHaveBeenCalledTimes(2)
      })

      it('should handle complex key generation scenarios', () => {
        const mockFn = createTrackedFunction(
          (dataStore: Record<string, unknown>, objectName: string) =>
            `${Object.keys(dataStore).length}-${objectName}`,
        )
        const memoizedFn = memoize(mockFn, (_dataStore, objectName) => objectName)

        const store1 = { item1: 'data1' }
        const store2 = { item1: 'data1', item2: 'data2' } // Different store, same key

        const result1 = memoizedFn(store1, 'test')
        expect(result1).toBe('1-test')
        expect(mockFn).toHaveBeenCalledTimes(1)

        // Different store but same object name should return cached result
        const result2 = memoizedFn(store2, 'test')
        expect(result2).toBe('1-test') // Cached result
        expect(mockFn).toHaveBeenCalledTimes(1)

        // Different object name should call function
        const result3 = memoizedFn(store1, 'other')
        expect(result3).toBe('1-other')
        expect(mockFn).toHaveBeenCalledTimes(2)
      })
    })

    describe('edge cases', () => {
      it('should handle null and undefined arguments with different cache keys', () => {
        const mockFn = createTrackedFunction((value: unknown) => `result-${String(value)}`)
        const memoizedFn = memoize(mockFn)

        // Test null - JSON.stringify([null]) = "[null]"
        const nullResult1 = memoizedFn(null)
        expect(nullResult1).toBe('result-null')
        expect(mockFn).toHaveBeenCalledTimes(1)

        // Test undefined - JSON.stringify([undefined]) = "[null]" (same as null!)
        // This is a limitation of JSON.stringify - undefined becomes null in arrays
        const undefinedResult1 = memoizedFn(undefined)
        expect(undefinedResult1).toBe('result-null') // Will return cached null result
        expect(mockFn).toHaveBeenCalledTimes(1) // Still 1, because cache key collision

        // Test with custom key generator to avoid collision
        const mockFn2 = createTrackedFunction((value: unknown) => `result-${String(value)}`)
        const memoizedFn2 = memoize(mockFn2, (value) => `key-${String(value)}`)

        const nullResult2 = memoizedFn2(null)
        expect(nullResult2).toBe('result-null')
        expect(mockFn2).toHaveBeenCalledTimes(1)

        const undefinedResult2 = memoizedFn2(undefined)
        expect(undefinedResult2).toBe('result-undefined')
        expect(mockFn2).toHaveBeenCalledTimes(2) // Called twice with custom key generator
      })

      it('should handle functions that throw errors', () => {
        const mockFn = createTrackedFunction((shouldThrow: boolean) => {
          if (shouldThrow) {
            throw new Error('Test error')
          }
          return 'success'
        })
        const memoizedFn = memoize(mockFn)

        // First call that throws should not be cached
        expect(() => memoizedFn(true)).toThrow('Test error')
        expect(mockFn).toHaveBeenCalledTimes(1)

        // Calling again with same args should call function again (not cached)
        expect(() => memoizedFn(true)).toThrow('Test error')
        expect(mockFn).toHaveBeenCalledTimes(2)

        // Successful call should be cached
        const result = memoizedFn(false)
        expect(result).toBe('success')
        expect(mockFn).toHaveBeenCalledTimes(3)

        // Second successful call should return cached result
        const result2 = memoizedFn(false)
        expect(result2).toBe('success')
        expect(mockFn).toHaveBeenCalledTimes(3) // Still 3, cached
      })

      it('should handle complex object arguments', () => {
        const mockFn = createTrackedFunction(
          (obj: Record<string, unknown>) => Object.keys(obj).length,
        )
        const memoizedFn = memoize(mockFn)

        const obj1 = { a: 1, b: 2 }
        const obj2 = { a: 1, b: 2 } // Same content, different object
        const obj3 = { a: 1, b: 2, c: 3 } // Different content

        const result1 = memoizedFn(obj1)
        expect(result1).toBe(2)
        expect(mockFn).toHaveBeenCalledTimes(1)

        // Same content should return cached result
        const result2 = memoizedFn(obj2)
        expect(result2).toBe(2)
        expect(mockFn).toHaveBeenCalledTimes(1)

        // Different content should call function
        const result3 = memoizedFn(obj3)
        expect(result3).toBe(3)
        expect(mockFn).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('memoizeSimple', () => {
    describe('basic functionality', () => {
      it('should cache results for string arguments', () => {
        const mockFn = createTrackedFunction((str: string) => str.toUpperCase())
        const memoizedFn = memoizeSimple(mockFn)

        expectCacheBehavior(
          memoizedFn,
          mockFn,
          ['hello'], // firstArgs
          'HELLO', // firstExpected
          ['world'], // secondArgs
          'WORLD', // secondExpected
        )
      })

      it('should cache results for number arguments', () => {
        const mockFn = createTrackedFunction((num: number) => num * num)
        const memoizedFn = memoizeSimple(mockFn)

        expectCacheBehavior(
          memoizedFn,
          mockFn,
          [5], // firstArgs
          25, // firstExpected
          [10], // secondArgs
          100, // secondExpected
        )
      })

      it('should use primitive values as cache keys directly', () => {
        const mockFn = createTrackedFunction((key: string) => `processed-${key}`)
        const memoizedFn = memoizeSimple(mockFn)

        // These should each create separate cache entries
        const result1 = memoizedFn('a')
        const result2 = memoizedFn('b')
        const result3 = memoizedFn('a') // Should use cached result

        expect(result1).toBe('processed-a')
        expect(result2).toBe('processed-b')
        expect(result3).toBe('processed-a')
        expect(mockFn).toHaveBeenCalledTimes(2) // Only called for 'a' and 'b'
      })
    })

    describe('edge cases', () => {
      it('should handle empty string and zero', () => {
        const stringMockFn = createTrackedFunction((str: string) => `[${str}]`)
        const stringMemoized = memoizeSimple(stringMockFn)

        const numberMockFn = createTrackedFunction((num: number) => num + 1)
        const numberMemoized = memoizeSimple(numberMockFn)

        // Empty string
        const result1 = stringMemoized('')
        expect(result1).toBe('[]')
        expect(stringMockFn).toHaveBeenCalledTimes(1)

        const result2 = stringMemoized('')
        expect(result2).toBe('[]')
        expect(stringMockFn).toHaveBeenCalledTimes(1) // Cached

        // Zero
        const result3 = numberMemoized(0)
        expect(result3).toBe(1)
        expect(numberMockFn).toHaveBeenCalledTimes(1)

        const result4 = numberMemoized(0)
        expect(result4).toBe(1)
        expect(numberMockFn).toHaveBeenCalledTimes(1) // Cached
      })

      it('should handle functions that return different types', () => {
        const mockFn = createTrackedFunction((key: string) => {
          if (key === 'number') return 42
          if (key === 'string') return 'text'
          if (key === 'object') return { data: true }
          return null
        })
        const memoizedFn = memoizeSimple(mockFn)

        const result1 = memoizedFn('number')
        const result2 = memoizedFn('string')
        const result3 = memoizedFn('object')
        const result4 = memoizedFn('number') // Should be cached

        expect(result1).toBe(42)
        expect(result2).toBe('text')
        expect(result3).toEqual({ data: true })
        expect(result4).toBe(42)
        expect(mockFn).toHaveBeenCalledTimes(3) // 'number' result was cached
      })
    })
  })

  describe('memoize vs memoizeSimple comparison', () => {
    it('should behave similarly for primitive single arguments', () => {
      const implementation = (x: number) => x * 3

      const mockFn1 = createTrackedFunction(implementation)
      const mockFn2 = createTrackedFunction(implementation)

      const memoized = memoize(mockFn1)
      const memoizedSimple = memoizeSimple(mockFn2)

      // Both should cache the same way for single primitive arguments
      const input = 7
      const expected = 21

      const result1 = memoized(input)
      const result2 = memoizedSimple(input)

      expect(result1).toBe(expected)
      expect(result2).toBe(expected)
      expect(mockFn1).toHaveBeenCalledTimes(1)
      expect(mockFn2).toHaveBeenCalledTimes(1)

      // Second calls should both use cache
      const result3 = memoized(input)
      const result4 = memoizedSimple(input)

      expect(result3).toBe(expected)
      expect(result4).toBe(expected)
      expect(mockFn1).toHaveBeenCalledTimes(1) // Still 1, cached
      expect(mockFn2).toHaveBeenCalledTimes(1) // Still 1, cached
    })
  })
})
