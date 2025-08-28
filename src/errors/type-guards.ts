import type { UserFriendlyError } from '@/types/errors'

/**
 * Type guard to check if an error implements the UserFriendlyError interface
 * Provides better type safety than loose object checks
 */
export const isUserFriendlyError = (error: unknown): error is UserFriendlyError => {
  return (
    error instanceof Error &&
    error !== null &&
    typeof error === 'object' &&
    'showError' in error &&
    typeof (error as unknown as UserFriendlyError).showError === 'function'
  )
}
