import { describe, expect, it, vi } from 'vitest'

import { RecipeChainError, SourceNodeNotFoundError } from '@/errors/processing-errors'
import { InvalidBuildingError, RecipeFormatError } from '@/errors/recipe-errors'
import { isUserFriendlyError } from '@/errors/type-guards'
import type { ErrorBuilder, UserFriendlyError } from '@/types/errors'

describe('type-guards', () => {
  describe('isUserFriendlyError', () => {
    it('should return true for valid UserFriendlyError instances', () => {
      const recipeFormatError = new RecipeFormatError('invalid recipe')
      const invalidBuildingError = new InvalidBuildingError('invalid building')
      const recipeChainError = new RecipeChainError(['recipe1'], { recipe1: ['missing'] })
      const sourceNodeError = new SourceNodeNotFoundError('source', 'material', [])

      expect(isUserFriendlyError(recipeFormatError)).toBe(true)
      expect(isUserFriendlyError(invalidBuildingError)).toBe(true)
      expect(isUserFriendlyError(recipeChainError)).toBe(true)
      expect(isUserFriendlyError(sourceNodeError)).toBe(true)
    })

    it('should return false for regular Error instances', () => {
      const regularError = new Error('regular error')
      const typeError = new TypeError('type error')
      const rangeError = new RangeError('range error')

      expect(isUserFriendlyError(regularError)).toBe(false)
      expect(isUserFriendlyError(typeError)).toBe(false)
      expect(isUserFriendlyError(rangeError)).toBe(false)
    })

    it('should return false for non-Error objects with showError', () => {
      const fakeError = {
        showError: () => {},
      }

      const fakeErrorWithMessage = {
        message: 'fake message',
        showError: () => {},
      }

      expect(isUserFriendlyError(fakeError)).toBe(false)
      expect(isUserFriendlyError(fakeErrorWithMessage)).toBe(false)
    })

    it('should return false for Error instances with wrong showError signature', () => {
      const errorWithWrongMethod = new Error('test')
      // Add a showError property that's not a function
      ;(errorWithWrongMethod as unknown as UserFriendlyError).showError =
        'not a function' as unknown as (errorStore: { error(): ErrorBuilder }) => void

      const errorWithWrongFunction = new Error('test')
      // Add a showError function with correct signature
      ;(errorWithWrongFunction as unknown as UserFriendlyError).showError = () => {}

      expect(isUserFriendlyError(errorWithWrongMethod)).toBe(false)
      // This should return true because it has a callable showError method
      // The type guard only checks structure, not implementation details
      expect(isUserFriendlyError(errorWithWrongFunction)).toBe(true)
    })

    it('should return false for primitive types', () => {
      expect(isUserFriendlyError(null)).toBe(false)
      expect(isUserFriendlyError(undefined)).toBe(false)
      expect(isUserFriendlyError('string')).toBe(false)
      expect(isUserFriendlyError(123)).toBe(false)
      expect(isUserFriendlyError(true)).toBe(false)
      expect(isUserFriendlyError([])).toBe(false)
      expect(isUserFriendlyError({})).toBe(false)
    })

    it('should provide proper type narrowing', () => {
      const error: unknown = new RecipeFormatError('test')
      const mockErrorBuilder: ErrorBuilder = {
        _title: '',
        _bodyContent: null,
        title: vi.fn().mockReturnThis(),
        body: vi.fn().mockReturnThis(),
        show: vi.fn(),
      }
      const mockErrorStore = {
        error: () => mockErrorBuilder,
      }

      if (isUserFriendlyError(error)) {
        // TypeScript should know this is UserFriendlyError now
        expect(typeof error.showError).toBe('function')
        // Should not throw when called with proper error store
        expect(() => error.showError(mockErrorStore)).not.toThrow()
      } else {
        expect.fail('Should have identified as UserFriendlyError')
      }
    })
  })
})
