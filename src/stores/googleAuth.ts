import { defineStore } from 'pinia'
import { googleApiClient } from '@/services/googleApiClient'

/**
 * Google Authentication Store
 *
 * Manages OAuth token state for Google Drive integration.
 * Persisted to localStorage to maintain authentication across sessions.
 * Orchestrates authentication operations with googleApiClient service.
 */
const TOKEN_REFRESH_CHECK_INTERVAL_MS = 30000 // Check every 30 seconds
/**
 * Refresh well ahead of expiry. Browsers throttle timers in background tabs to
 * roughly once a minute (and harder still on battery), so a narrow window is
 * routinely missed entirely and the token dies while the tab sits idle.
 */
const TOKEN_REFRESH_BUFFER_MS = 600000 // Refresh if expiring within 10 minutes

/**
 * Stable reference so repeated registration is a no-op, and so the store is
 * resolved when the event fires rather than captured at registration time.
 */
const handleVisibilityChange = () => {
  if (document.visibilityState !== 'visible') return

  const store = useGoogleAuthStore()
  if (store.accessToken) {
    void store.checkAndRefreshToken()
  }
}

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

    /**
     * Account to hint on silent refresh. Survives token expiry (unlike
     * userEmail) so a re-auth still targets the account the user picked
     * originally instead of failing on an ambiguous account choice.
     */
    lastSignedInEmail: null as string | null,

    /**
     * Interval ID for token refresh checker
     */
    _refreshIntervalId: null as ReturnType<typeof setInterval> | null,
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

      // Check if we need to refresh now
      await this.checkAndRefreshToken()

      // Start periodic token refresh checker
      this.startTokenRefreshChecker()
      this.watchForForegroundReturn()
    },

    /**
     * Refresh as soon as the tab is foregrounded again.
     *
     * The periodic checker cannot be relied on while the tab is hidden, so a
     * token that lapsed in the background would otherwise stay broken until the
     * next tick - long enough for the user's first action to fail.
     */
    watchForForegroundReturn(): void {
      if (typeof document === 'undefined') return

      document.addEventListener('visibilitychange', handleVisibilityChange)
    },

    /**
     * Check if token needs refresh and refresh if necessary
     */
    async checkAndRefreshToken(): Promise<void> {
      const now = Date.now()
      const needsRefresh = this.expiresAt === null || now > this.expiresAt - TOKEN_REFRESH_BUFFER_MS

      if (needsRefresh) {
        console.log('[GoogleAuth] Token expired/expiring soon, attempting refresh...')
        try {
          await this.refreshToken()
          console.log('[GoogleAuth] Token refresh succeeded')
        } catch (error) {
          console.warn('[GoogleAuth] Token refresh failed:', error)
          // Refreshes start well before expiry, so a failure here usually leaves
          // a perfectly usable token behind. Only sign the user out once it has
          // actually lapsed - otherwise a single network blip ends the session.
          if (this.isTokenExpired) {
            this.clearToken()
          }
        }
      } else if (this.accessToken) {
        // Token still valid - sync to gapi client
        googleApiClient.setAccessToken(this.accessToken)
      }
    },

    /**
     * Start periodic token refresh checker
     */
    startTokenRefreshChecker(): void {
      // Clear any existing interval
      if (this._refreshIntervalId) {
        clearInterval(this._refreshIntervalId)
      }

      this._refreshIntervalId = setInterval(() => {
        if (this.accessToken && this.expiresAt) {
          const now = Date.now()
          const expiresIn = this.expiresAt - now
          if (expiresIn < TOKEN_REFRESH_BUFFER_MS) {
            console.log(
              `[GoogleAuth] Token expiring in ${Math.round(expiresIn / 1000)}s, refreshing...`,
            )
            this.checkAndRefreshToken()
          }
        }
      }, TOKEN_REFRESH_CHECK_INTERVAL_MS)
    },

    /**
     * Sign in with Google OAuth
     * Opens OAuth consent flow and stores the token
     */
    async signIn(): Promise<void> {
      const result = await googleApiClient.signInWithGoogle(this.lastSignedInEmail ?? undefined)
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
      // Deliberate sign-out, so drop the hint too - the user may be switching accounts
      this.lastSignedInEmail = null
    },

    /**
     * Refresh the access token
     */
    async refreshToken(): Promise<void> {
      const result = await googleApiClient.refreshToken(this.lastSignedInEmail ?? undefined)
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
      this.lastSignedInEmail = email
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

  persist: {
    pick: ['accessToken', 'expiresAt', 'userEmail', 'lastSignedInEmail'],
  },
})
