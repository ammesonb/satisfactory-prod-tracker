import { vi } from 'vitest'

// Mock drive client
const mockDriveFiles = {
  get: vi.fn(),
  list: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
}

// Mock gapi client
export const mockGapi = {
  client: {
    setToken: vi.fn(),
    drive: {
      files: mockDriveFiles,
    },
  },
}

// Mock token client (GIS OAuth)
export const mockTokenClient = {
  callback: null as ((response: unknown) => void) | null,
  requestAccessToken: vi.fn(),
}

// Mock Google OAuth
export const mockGoogleAuth = {
  revoke: vi.fn(),
}

// Setup global declarations
declare global {
  var gapi: typeof mockGapi
  var google: { accounts: { oauth2: typeof mockGoogleAuth } }
}

// Export mockDriveFiles for easier access in tests
export { mockDriveFiles }