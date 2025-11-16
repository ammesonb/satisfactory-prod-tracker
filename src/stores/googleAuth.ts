import { defineStore } from 'pinia'
import { googleApiClient } from '@/services/googleApiClient'

/**
 * Google Authentication Store
 *
 * Manages OAuth token state for Google Drive integration.
 * Persisted to localStorage to maintain authentication across sessions.
 * Orchestrates authentication operations with googleApiClient service.
 */
export const useGoogleAuthStore = defineStore('googleAuth', {
  state: () => ({
    /**
     * Access token from Google OAuth
     */
    accessToken: null as string | null,

    /**
     * Token expiry timestamp (milliseconds since epoch)
     */
    expiresAt: null as number | null,

    /**
     * User's email address
     */
    userEmail: null as string | null,
  }),

  getters: {
    /**
     * Check if user has a valid access token
     * Includes a 5-second buffer to prevent mid-flight request failures
     */
    isAuthenticated(): boolean {
      return this.accessToken !== null && !this.isTokenExpired
    },

    /**
     * Check if token is expired (or about to expire)
     */
    isTokenExpired(): boolean {
      const TOKEN_EXPIRY_BUFFER_MS = 5000 // 5 seconds
      return this.expiresAt === null || Date.now() > this.expiresAt - TOKEN_EXPIRY_BUFFER_MS
    },
  },

  actions: {
    /**
     * Initialize Google API client
     * Should be called once at app startup
     */
    async initialize(): Promise<void> {
      await googleApiClient.initialize((accessToken: string, expiresIn: number) => {
        this.setToken(accessToken, Date.now() + expiresIn * 1000)
      })

      // If we already have a valid token, set it on the client
      if (this.accessToken && this.isAuthenticated) {
        googleApiClient.setAccessToken(this.accessToken)
      }
    },

    /**
     * Sign in with Google OAuth
     * Opens OAuth consent flow and stores the token
     */
    async signIn(): Promise<void> {
      const result = await googleApiClient.signInWithGoogle()
      this.setToken(result.accessToken, result.expiresAt)

      // Fetch and store user email
      try {
        const userInfo = await googleApiClient.getUserInfo(result.accessToken)
        this.setUserEmail(userInfo.email)
      } catch (error) {
        console.warn('Failed to fetch user info:', error)
      }
    },

    /**
     * Sign out from Google OAuth
     * Revokes the token and clears state
     */
    async signOut(): Promise<void> {
      if (this.accessToken) {
        await googleApiClient.signOut(this.accessToken)
      }
      this.clearToken()
    },

    /**
     * Refresh the access token
     */
    async refreshToken(): Promise<void> {
      const result = await googleApiClient.refreshToken()
      this.setToken(result.accessToken, result.expiresAt)
    },

    /**
     * Set authentication token and expiry
     */
    setToken(accessToken: string, expiresAt: number): void {
      this.accessToken = accessToken
      this.expiresAt = expiresAt
    },

    /**
     * Set user email address
     */
    setUserEmail(email: string): void {
      this.userEmail = email
    },

    /**
     * Clear authentication token and user info
     */
    clearToken(): void {
      this.accessToken = null
      this.expiresAt = null
      this.userEmail = null
    },
  },

  persist: true,
})
