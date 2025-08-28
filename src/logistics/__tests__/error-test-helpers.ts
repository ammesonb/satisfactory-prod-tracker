import { expect } from 'vitest'
import type { UserFriendlyError } from '@/errors/friendly-error'

/**
 * Helper function to test error throwing with detailed assertions
 * Reduces repetitive try/catch blocks in error tests
 */
export const expectErrorWithMessage = <T extends UserFriendlyError>(
  fn: () => void,
  ErrorClass: new (...args: unknown[]) => T,
  expectedProps: Partial<T>,
  expectedSummary?: string,
) => {
  // First, verify the error is thrown
  expect(fn).toThrow(ErrorClass)

  // Then test the error details
  try {
    fn()
    expect.fail(`Should have thrown ${ErrorClass.name}`)
  } catch (error) {
    expect(error).toBeInstanceOf(ErrorClass)

    // Check all expected properties
    Object.entries(expectedProps).forEach(([key, value]) => {
      expect((error as unknown as T)[key]).toEqual(value)
    })

    // Check error message if provided
    if (expectedSummary) {
      const errorMessage = (error as T).toErrorMessage()
      expect(errorMessage.summary).toBe(expectedSummary)
    }

    return error as T
  }
}

/**
 * Helper to test that a function throws a specific error type
 * and returns the error for additional assertions
 */
export const expectErrorOfType = <T extends Error>(
  fn: () => void,
  ErrorClass: new (...args: unknown[]) => T,
): T => {
  expect(fn).toThrow(ErrorClass)

  try {
    fn()
    expect.fail(`Should have thrown ${ErrorClass.name}`)
  } catch (error) {
    expect(error).toBeInstanceOf(ErrorClass)
    return error as T
  }
}
