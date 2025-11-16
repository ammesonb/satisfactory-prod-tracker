import { vi } from 'vitest'
import { ref } from 'vue'

// Create reactive refs that persist across calls for key properties
export const mockAccessToken = ref<string | null>(null)
export const mockExpiresAt = ref<number | null>(null)
export const mockUserEmail = ref<string | null>(null)

// Mock functions for getters - can be controlled in tests
export const mockIsAuthenticated = vi.fn(() => false)
export const mockIsTokenExpired = vi.fn(() => true)

// Explicit vi.fn() for all methods
export const mockSetToken = vi.fn((accessToken: string, expiresAt: number) => {
  mockAccessToken.value = accessToken
  mockExpiresAt.value = expiresAt
})

export const mockSetUserEmail = vi.fn((email: string) => {
  mockUserEmail.value = email
})

export const mockClearToken = vi.fn(() => {
  mockAccessToken.value = null
  mockExpiresAt.value = null
  mockUserEmail.value = null
})

export const mockGoogleAuthStore = {
  // State
  get accessToken() {
    return mockAccessToken.value
  },
  get expiresAt() {
    return mockExpiresAt.value
  },
  get userEmail() {
    return mockUserEmail.value
  },

  // Getters - use vi.fn() so tests can control return values
  get isAuthenticated() {
    return mockIsAuthenticated()
  },
  get isTokenExpired() {
    return mockIsTokenExpired()
  },

  // Actions
  setToken: mockSetToken,
  setUserEmail: mockSetUserEmail,
  clearToken: mockClearToken,
}
