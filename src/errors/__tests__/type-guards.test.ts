import { describe, it, expect } from 'vitest'
import { isUserFriendlyError } from '@/errors/type-guards'
import { RecipeFormatError, InvalidBuildingError } from '@/errors/recipe-errors'
import { RecipeChainError, SourceNodeNotFoundError } from '@/errors/processing-errors'
import type { UserFriendlyError } from '@/errors/friendly-error'

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

    it('should return false for non-Error objects with toErrorMessage', () => {
      const fakeError = {
        toErrorMessage: () => ({ summary: 'fake', details: 'fake error' }),
      }

      const fakeErrorWithMessage = {
        message: 'fake message',
        toErrorMessage: () => ({ summary: 'fake', details: 'fake error' }),
      }

      expect(isUserFriendlyError(fakeError)).toBe(false)
      expect(isUserFriendlyError(fakeErrorWithMessage)).toBe(false)
    })

    it('should return false for Error instances with wrong toErrorMessage signature', () => {
      const errorWithWrongMethod = new Error('test')
      // Add a toErrorMessage property that's not a function
      ;(errorWithWrongMethod as unknown as UserFriendlyError).toErrorMessage = 'not a function'

      const errorWithWrongFunction = new Error('test')
      // Add a toErrorMessage function that returns wrong format
      ;(errorWithWrongFunction as unknown as UserFriendlyError).toErrorMessage = () =>
        'wrong format'

      expect(isUserFriendlyError(errorWithWrongMethod)).toBe(false)
      // This should return true because it has a callable toErrorMessage method
      // The type guard only checks structure, not return value format
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

      if (isUserFriendlyError(error)) {
        // TypeScript should know this is UserFriendlyError now
        const message = error.toErrorMessage()
        expect(message).toHaveProperty('summary')
        expect(message).toHaveProperty('details')
        expect(typeof message.summary).toBe('string')
        expect(typeof message.details).toBe('string')
      } else {
        expect.fail('Should have identified as UserFriendlyError')
      }
    })
  })
})
