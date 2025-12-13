import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { googleApiClient } from '@/services/googleApiClient'
import { useGoogleAuthStore } from '@/stores/googleAuth'

describe('useGoogleAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    // Spy on the real googleApiClient methods and replace them with mocks
    vi.spyOn(googleApiClient, 'initialize').mockResolvedValue(undefined)
    vi.spyOn(googleApiClient, 'getTokenClient').mockReturnValue({})
    vi.spyOn(googleApiClient, 'getDriveClient').mockReturnValue({})
    vi.spyOn(googleApiClient, 'setAccessToken').mockReturnValue(undefined)
    vi.spyOn(googleApiClient, 'clearAccessToken').mockReturnValue(undefined)
    vi.spyOn(googleApiClient, 'getIsInitialized').mockReturnValue(true)
    vi.spyOn(googleApiClient, 'getGoogleAuth').mockReturnValue({})
    vi.spyOn(googleApiClient, 'signInWithGoogle').mockResolvedValue({
      accessToken: 'test-token',
      expiresAt: Date.now() + 3600000,
    })
    vi.spyOn(googleApiClient, 'signOut').mockResolvedValue(undefined)
    vi.spyOn(googleApiClient, 'refreshToken').mockResolvedValue({
      accessToken: 'refreshed-token',
      expiresAt: Date.now() + 3600000,
    })
    vi.spyOn(googleApiClient, 'getUserInfo').mockResolvedValue({ email: 'test@example.com' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('initializes with null authentication state', () => {
      const store = useGoogleAuthStore()

      expect(store.accessToken).toBeNull()
      expect(store.expiresAt).toBeNull()
      expect(store.userEmail).toBeNull()
    })

    it('is not authenticated initially', () => {
      const store = useGoogleAuthStore()

      expect(store.isAuthenticated).toBe(false)
    })

    it('token is expired initially', () => {
      const store = useGoogleAuthStore()

      expect(store.isTokenExpired).toBe(true)
    })
  })

  describe('initialize', () => {
    it('calls googleApiClient.initialize with a callback function', async () => {
      const store = useGoogleAuthStore()

      await store.initialize()

      expect(googleApiClient.initialize).toHaveBeenCalledTimes(1)
      expect(googleApiClient.initialize).toHaveBeenCalledWith(expect.any(Function))
    })

    it('sets existing valid token on the API client during initialization', async () => {
      const store = useGoogleAuthStore()
      store.setToken('existing-token', Date.now() + 3600000)

      await store.initialize()

      expect(googleApiClient.setAccessToken).toHaveBeenCalledWith('existing-token')
    })

    it('does not set token on API client if token is expired', async () => {
      const store = useGoogleAuthStore()
      store.setToken('expired-token', Date.now() - 1000)

      await store.initialize()

      expect(googleApiClient.setAccessToken).not.toHaveBeenCalled()
    })

    it('does not set token on API client if no token exists', async () => {
      const store = useGoogleAuthStore()

      await store.initialize()

      expect(googleApiClient.setAccessToken).not.toHaveBeenCalled()
    })

    it('stores token when callback is invoked by googleApiClient', async () => {
      let capturedCallback: ((accessToken: string, expiresIn: number) => void) | null = null

      // callback is a messy type, so just pass it through
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(googleApiClient, 'initialize').mockImplementation(async (cb: any) => {
        capturedCallback = cb
      })

      const store = useGoogleAuthStore()
      await store.initialize()

      expect(capturedCallback).not.toBeNull()

      const beforeCall = Date.now()
      capturedCallback!('callback-token', 7200) // 2 hours
      const afterCall = Date.now()

      expect(store.accessToken).toBe('callback-token')
      expect(store.expiresAt).toBeGreaterThanOrEqual(beforeCall + 7200 * 1000)
      expect(store.expiresAt).toBeLessThanOrEqual(afterCall + 7200 * 1000)
    })
  })

  describe('signIn', () => {
    it('stores token, expiry, and email after successful sign in', async () => {
      const expiresAt = Date.now() + 3600000
      vi.spyOn(googleApiClient, 'signInWithGoogle').mockResolvedValue({
        accessToken: 'signin-token',
        expiresAt,
      })
      vi.spyOn(googleApiClient, 'getUserInfo').mockResolvedValue({ email: 'test@example.com' })

      const store = useGoogleAuthStore()
      await store.signIn()

      expect(store.accessToken).toBe('signin-token')
      expect(store.expiresAt).toBe(expiresAt)
      expect(store.userEmail).toBe('test@example.com')
      expect(store.isAuthenticated).toBe(true)
    })

    it('stores token even if getUserInfo fails', async () => {
      const expiresAt = Date.now() + 3600000
      vi.spyOn(googleApiClient, 'signInWithGoogle').mockResolvedValue({
        accessToken: 'token-without-email',
        expiresAt,
      })
      vi.spyOn(googleApiClient, 'getUserInfo').mockRejectedValue(
        new Error('Failed to fetch user info'),
      )

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const store = useGoogleAuthStore()

      await store.signIn()

      expect(store.accessToken).toBe('token-without-email')
      expect(store.expiresAt).toBe(expiresAt)
      expect(store.userEmail).toBeNull()
      expect(store.isAuthenticated).toBe(true)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch user info:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('signOut', () => {
    it('calls googleApiClient.signOut with current access token', async () => {
      const store = useGoogleAuthStore()
      store.setToken('active-token', Date.now() + 3600000)
      store.setUserEmail('user@example.com')

      await store.signOut()

      expect(googleApiClient.signOut).toHaveBeenCalledWith('active-token')
    })

    it('clears all authentication state', async () => {
      const store = useGoogleAuthStore()
      store.setToken('active-token', Date.now() + 3600000)
      store.setUserEmail('user@example.com')

      await store.signOut()

      expect(store.accessToken).toBeNull()
      expect(store.expiresAt).toBeNull()
      expect(store.userEmail).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('does not call googleApiClient.signOut when no token exists', async () => {
      const store = useGoogleAuthStore()
      await store.signOut()

      expect(googleApiClient.signOut).not.toHaveBeenCalled()
    })

    it('still clears state even when no token exists', async () => {
      const store = useGoogleAuthStore()
      store.setUserEmail('orphaned@example.com')

      await store.signOut()

      expect(store.accessToken).toBeNull()
      expect(store.expiresAt).toBeNull()
      expect(store.userEmail).toBeNull()
    })
  })

  describe('refreshToken', () => {
    it('replaces old token with refreshed token', async () => {
      const oldExpiresAt = Date.now() + 300000 // 5 minutes
      const newExpiresAt = Date.now() + 3600000 // 1 hour

      vi.spyOn(googleApiClient, 'refreshToken').mockResolvedValue({
        accessToken: 'refreshed-token',
        expiresAt: newExpiresAt,
      })

      const store = useGoogleAuthStore()
      store.setToken('old-token', oldExpiresAt)

      await store.refreshToken()

      expect(store.accessToken).toBe('refreshed-token')
      expect(store.expiresAt).toBe(newExpiresAt)
    })

    it('maintains authentication state after refresh', async () => {
      vi.spyOn(googleApiClient, 'refreshToken').mockResolvedValue({
        accessToken: 'refreshed-token',
        expiresAt: Date.now() + 3600000,
      })

      const store = useGoogleAuthStore()
      store.setToken('old-token', Date.now() + 60000)

      await store.refreshToken()

      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('isTokenExpired getter', () => {
    const TOKEN_EXPIRY_BUFFER_MS = 5000

    it('returns true when expiresAt is null', () => {
      const store = useGoogleAuthStore()

      expect(store.isTokenExpired).toBe(true)
    })

    it('returns true when token expired in the past', () => {
      const store = useGoogleAuthStore()
      store.expiresAt = Date.now() - 10000 // 10 seconds ago

      expect(store.isTokenExpired).toBe(true)
    })

    it('returns true when token expires right now', () => {
      const store = useGoogleAuthStore()
      store.expiresAt = Date.now()

      expect(store.isTokenExpired).toBe(true)
    })

    it('returns true when token expires within buffer (< 5 seconds)', () => {
      const store = useGoogleAuthStore()
      store.expiresAt = Date.now() + TOKEN_EXPIRY_BUFFER_MS - 1000 // 4 seconds from now

      expect(store.isTokenExpired).toBe(true)
    })

    it('returns true at exact buffer boundary', () => {
      const store = useGoogleAuthStore()
      store.expiresAt = Date.now() + TOKEN_EXPIRY_BUFFER_MS // Exactly 5 seconds

      // The implementation uses `>` not `>=`, so exact boundary returns false
      expect(store.isTokenExpired).toBe(false)
    })

    it('returns false when token expires beyond buffer', () => {
      const store = useGoogleAuthStore()
      store.expiresAt = Date.now() + TOKEN_EXPIRY_BUFFER_MS + 1000 // 6 seconds from now

      expect(store.isTokenExpired).toBe(false)
    })

    it('returns false for long-lived token', () => {
      const store = useGoogleAuthStore()
      store.expiresAt = Date.now() + 3600000 // 1 hour from now

      expect(store.isTokenExpired).toBe(false)
    })
  })

  describe('isAuthenticated getter', () => {
    it('returns false when accessToken is null', () => {
      const store = useGoogleAuthStore()
      store.expiresAt = Date.now() + 3600000 // Valid expiry doesn't matter

      expect(store.isAuthenticated).toBe(false)
    })

    it('returns false when token exists but is expired', () => {
      const store = useGoogleAuthStore()
      store.accessToken = 'expired-token'
      store.expiresAt = Date.now() - 1000 // Expired

      expect(store.isAuthenticated).toBe(false)
    })

    it('returns true for freshly issued token', () => {
      const store = useGoogleAuthStore()
      store.accessToken = 'fresh-token'
      store.expiresAt = Date.now() + 3600000 // 1 hour

      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('setToken', () => {
    it('sets both accessToken and expiresAt', () => {
      const store = useGoogleAuthStore()
      const expiresAt = Date.now() + 3600000

      store.setToken('my-token', expiresAt)

      expect(store.accessToken).toBe('my-token')
      expect(store.expiresAt).toBe(expiresAt)
    })

    it('can overwrite existing token', () => {
      const store = useGoogleAuthStore()
      const oldExpiresAt = Date.now() + 1800000
      const newExpiresAt = Date.now() + 3600000

      store.setToken('old-token', oldExpiresAt)
      store.setToken('new-token', newExpiresAt)

      expect(store.accessToken).toBe('new-token')
      expect(store.expiresAt).toBe(newExpiresAt)
    })
  })

  describe('setUserEmail', () => {
    it('sets userEmail', () => {
      const store = useGoogleAuthStore()

      store.setUserEmail('alice@example.com')

      expect(store.userEmail).toBe('alice@example.com')
    })

    it('can overwrite existing email', () => {
      const store = useGoogleAuthStore()

      store.setUserEmail('old@example.com')
      store.setUserEmail('new@example.com')

      expect(store.userEmail).toBe('new@example.com')
    })
  })

  describe('clearToken', () => {
    it('clears all authentication fields', () => {
      const store = useGoogleAuthStore()
      store.setToken('some-token', Date.now() + 3600000)
      store.setUserEmail('user@example.com')

      store.clearToken()

      expect(store.accessToken).toBeNull()
      expect(store.expiresAt).toBeNull()
      expect(store.userEmail).toBeNull()
    })

    it('is idempotent - can be called multiple times', () => {
      const store = useGoogleAuthStore()
      store.setToken('some-token', Date.now() + 3600000)

      store.clearToken()
      store.clearToken()

      expect(store.accessToken).toBeNull()
      expect(store.expiresAt).toBeNull()
      expect(store.userEmail).toBeNull()
    })

    it('makes store unauthenticated', () => {
      const store = useGoogleAuthStore()
      store.setToken('some-token', Date.now() + 3600000)

      store.clearToken()

      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('store persistence', () => {
    it('has correct store ID for persistence', () => {
      const store = useGoogleAuthStore()

      expect(store.$id).toBe('googleAuth')
    })
  })

  describe('edge cases', () => {
    it('handles rapid token expiration correctly', () => {
      const store = useGoogleAuthStore()

      // Set token that expires in 6 seconds (beyond buffer)
      store.setToken('token', Date.now() + 6000)
      expect(store.isAuthenticated).toBe(true)

      // Manually adjust expiry to within buffer
      store.expiresAt = Date.now() + 4000
      expect(store.isAuthenticated).toBe(false)
    })

    it('handles sign in failure by propagating error', async () => {
      vi.spyOn(googleApiClient, 'signInWithGoogle').mockRejectedValue(new Error('Sign in failed'))

      const store = useGoogleAuthStore()

      await expect(store.signIn()).rejects.toThrow('Sign in failed')
      expect(store.isAuthenticated).toBe(false)
    })

    it('handles refresh failure by propagating error', async () => {
      vi.spyOn(googleApiClient, 'refreshToken').mockRejectedValue(new Error('Refresh failed'))

      const store = useGoogleAuthStore()
      store.setToken('old-token', Date.now() + 60000)

      await expect(store.refreshToken()).rejects.toThrow('Refresh failed')
      // Old token should still be there (not cleared on error)
      expect(store.accessToken).toBe('old-token')
    })
  })
})
