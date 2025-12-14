import { vi } from 'vitest'

// Mock googleApiClient singleton with default implementations
export const mockGoogleApiClient = {
  // Initialization
  initialize: vi.fn().mockResolvedValue(undefined),
  getTokenClient: vi.fn().mockReturnValue({}),
  getDriveClient: vi.fn().mockReturnValue({}),
  setAccessToken: vi.fn().mockReturnValue(undefined),
  clearAccessToken: vi.fn().mockReturnValue(undefined),
  getIsInitialized: vi.fn().mockReturnValue(true),
  getGoogleAuth: vi.fn().mockReturnValue({}),

  // Authentication methods
  signInWithGoogle: vi.fn().mockResolvedValue({
    accessToken: 'test-token',
    expiresAt: Date.now() + 3600000,
  }),
  signOut: vi.fn().mockResolvedValue(undefined),
  refreshToken: vi.fn().mockResolvedValue({
    accessToken: 'refreshed-token',
    expiresAt: Date.now() + 3600000,
  }),
  getUserInfo: vi.fn().mockResolvedValue({ email: 'test@example.com' }),
}
