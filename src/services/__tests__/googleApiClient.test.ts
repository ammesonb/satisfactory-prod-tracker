import { beforeEach, describe, expect, it, vi } from 'vitest'

// Setup global mocks before importing googleApiClient
const mockGapi = {
  load: vi.fn(),
  client: {
    init: vi.fn(),
    setToken: vi.fn(),
    drive: {
      files: {
        create: vi.fn(),
        list: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
      },
    },
  },
}

const mockTokenClient = {
  callback: null as ((response: unknown) => void) | null,
  requestAccessToken: vi.fn(),
}

const mockGoogleAuth = {
  initTokenClient: vi.fn(() => mockTokenClient),
  revoke: vi.fn(),
}

global.gapi = mockGapi as never
global.google = { accounts: { oauth2: mockGoogleAuth } } as never
global.fetch = vi.fn()

// Import after setting up globals and env mocks
import { googleApiClient } from '@/services/googleApiClient'

describe('googleApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTokenClient.callback = null
  })

  describe('signInWithGoogle', () => {
    beforeEach(async () => {
      mockGapi.load.mockImplementation((_module: string, callback: () => void) => {
        callback()
      })
      mockGapi.client.init.mockResolvedValue(undefined)
      await googleApiClient.initialize(() => {})
    })

    it('requests access token and returns credentials', async () => {
      mockTokenClient.requestAccessToken.mockImplementation(() => {
        // Simulate OAuth callback
        mockTokenClient.callback!({
          access_token: 'signin-token',
          expires_in: 7200,
        })
      })

      const beforeCall = Date.now()
      const result = await googleApiClient.signInWithGoogle()
      const afterCall = Date.now()

      expect(result.accessToken).toBe('signin-token')
      expect(result.expiresAt).toBeGreaterThanOrEqual(beforeCall + 7200 * 1000)
      expect(result.expiresAt).toBeLessThanOrEqual(afterCall + 7200 * 1000)
    })

    it('rejects when OAuth returns error', async () => {
      mockTokenClient.requestAccessToken.mockImplementation(() => {
        mockTokenClient.callback!({
          error: 'access_denied',
        })
      })

      await expect(googleApiClient.signInWithGoogle()).rejects.toThrow('access_denied')
    })

    it('rejects when no access token received', async () => {
      mockTokenClient.requestAccessToken.mockImplementation(() => {
        mockTokenClient.callback!({
          expires_in: 3600,
        })
      })

      await expect(googleApiClient.signInWithGoogle()).rejects.toThrow(
        'No access token received from Google',
      )
    })
  })

  describe('signOut', () => {
    beforeEach(async () => {
      mockGapi.load.mockImplementation((_module: string, callback: () => void) => {
        callback()
      })
      mockGapi.client.init.mockResolvedValue(undefined)
      await googleApiClient.initialize(() => {})
    })

    it('revokes access token', async () => {
      mockGoogleAuth.revoke.mockImplementation((_token: string, callback: () => void) => {
        callback()
      })

      await googleApiClient.signOut('active-token')

      expect(mockGoogleAuth.revoke).toHaveBeenCalledWith('active-token', expect.any(Function))
    })

    it('does nothing when token is empty', async () => {
      await googleApiClient.signOut('')

      expect(mockGoogleAuth.revoke).not.toHaveBeenCalled()
    })
  })

  describe('refreshToken', () => {
    beforeEach(async () => {
      mockGapi.load.mockImplementation((_module: string, callback: () => void) => {
        callback()
      })
      mockGapi.client.init.mockResolvedValue(undefined)
      await googleApiClient.initialize(() => {})
    })

    it('requests new access token silently with prompt: none', async () => {
      mockTokenClient.requestAccessToken.mockImplementation((options: { prompt: string }) => {
        expect(options.prompt).toBe('none')
        mockTokenClient.callback!({
          access_token: 'refreshed-token',
          expires_in: 3600,
        })
      })

      const result = await googleApiClient.refreshToken()

      expect(result.accessToken).toBe('refreshed-token')
      expect(mockTokenClient.requestAccessToken).toHaveBeenCalledWith({ prompt: 'none' })
    })

    it('rejects when silent refresh fails', async () => {
      mockTokenClient.requestAccessToken.mockImplementation(() => {
        mockTokenClient.callback!({
          error: 'interaction_required',
        })
      })

      await expect(googleApiClient.refreshToken()).rejects.toThrow('interaction_required')
    })
  })

  describe('getUserInfo', () => {
    beforeEach(async () => {
      mockGapi.load.mockImplementation((_module: string, callback: () => void) => {
        callback()
      })
      mockGapi.client.init.mockResolvedValue(undefined)
      await googleApiClient.initialize(() => {})
    })

    it('fetches user email from Google API', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ email: 'user@example.com' }),
      } as Response)

      const result = await googleApiClient.getUserInfo('test-token')

      expect(result.email).toBe('user@example.com')
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('userinfo'),
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer test-token',
          },
        }),
      )
    })

    it('throws error when not authenticated', async () => {
      await expect(googleApiClient.getUserInfo('')).rejects.toThrow('Not authenticated')
    })

    it('throws error on fetch failure', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        statusText: 'Unauthorized',
      } as Response)

      await expect(googleApiClient.getUserInfo('invalid-token')).rejects.toThrow('Unauthorized')
    })
  })

  describe('getTokenClient', () => {
    it('returns token client after initialization', async () => {
      mockGapi.load.mockImplementation((_module: string, callback: () => void) => {
        callback()
      })
      mockGapi.client.init.mockResolvedValue(undefined)

      await googleApiClient.initialize(() => {})

      const tokenClient = googleApiClient.getTokenClient()
      expect(tokenClient).toBeDefined()
    })
  })

  describe('getGoogleAuth', () => {
    it('returns google auth object', () => {
      const auth = googleApiClient.getGoogleAuth()
      expect(auth).toBe(mockGoogleAuth)
    })

    it('throws error when google is not loaded', () => {
      const originalGoogle = global.google
      global.google = undefined as never

      expect(() => googleApiClient.getGoogleAuth()).toThrow(
        'Google Identity Services library not loaded',
      )

      global.google = originalGoogle
    })
  })
})
