import { GOOGLE_API_URLS, GOOGLE_DRIVE_SCOPES, GOOGLE_USER_SCOPES } from '@/constants/googleDrive'

/**
 * Google API configuration from environment variables
 */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY

/**
 * Global references loaded via script tags in index.html
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const google: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const gapi: any

/**
 * Singleton class for managing Google API client initialization
 * Ensures the Drive API is initialized exactly once and shared across all consumers
 */
class GoogleApiClient {
  private static instance: GoogleApiClient | null = null
  private isInitialized = false
  private initializationPromise: Promise<void> | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private tokenClient: any = null

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): GoogleApiClient {
    if (!GoogleApiClient.instance) {
      GoogleApiClient.instance = new GoogleApiClient()
    }
    return GoogleApiClient.instance
  }

  /**
   * Initialize the Google API client and token client
   * This method is idempotent - safe to call multiple times
   * Subsequent calls will return the existing initialization promise
   */
  async initialize(
    onTokenReceived: (accessToken: string, expiresIn: number) => void,
  ): Promise<void> {
    // Return immediately if already initialized
    if (this.isInitialized) {
      return
    }

    // Return existing promise if initialization is in progress
    if (this.initializationPromise) {
      return this.initializationPromise
    }

    // Start initialization
    this.initializationPromise = this.performInitialization(onTokenReceived)
    return this.initializationPromise
  }

  /**
   * Handle OAuth token response
   * Centralizes token processing logic for both initialization and sign-in
   */
  private handleTokenResponse(
    response: { access_token?: string; expires_in?: number; error?: string },
    onSuccess: (accessToken: string, expiresAt: number) => void,
  ): void {
    if (response.error) {
      throw new Error(`OAuth error: ${response.error}`)
    }

    if (!response.access_token) {
      throw new Error('No access token received from Google')
    }

    const expiresAt = Date.now() + (response.expires_in || 3600) * 1000
    this.setAccessToken(response.access_token)
    onSuccess(response.access_token, expiresAt)
  }

  /**
   * Perform the actual initialization
   */
  private async performInitialization(
    onTokenReceived: (accessToken: string, expiresIn: number) => void,
  ): Promise<void> {
    // Check if libraries are loaded
    if (typeof google === 'undefined') {
      throw new Error(
        'Google Identity Services library not loaded. Ensure the GSI script is included in index.html',
      )
    }
    if (typeof gapi === 'undefined') {
      throw new Error(
        'Google API library (gapi) not loaded. Ensure the script is included in index.html',
      )
    }

    // Validate configuration
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Missing VITE_GOOGLE_CLIENT_ID environment variable')
    }
    if (!GOOGLE_API_KEY) {
      throw new Error('Missing VITE_GOOGLE_API_KEY environment variable')
    }

    // Initialize gapi.client (for Drive API calls)
    await new Promise<void>((resolve, reject) => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: [GOOGLE_API_URLS.DRIVE_DISCOVERY_DOC],
          })
          resolve()
        } catch (error) {
          reject(new Error(`Failed to initialize Google API client: ${error}`))
        }
      })
    })

    // Initialize token client (modern GIS approach for OAuth)
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: `${GOOGLE_DRIVE_SCOPES.DRIVE_FILE} ${GOOGLE_USER_SCOPES.EMAIL}`,
      callback: (response: { access_token: string; expires_in: number }) => {
        try {
          this.handleTokenResponse(response, (accessToken, expiresAt) => {
            onTokenReceived(accessToken, Math.floor((expiresAt - Date.now()) / 1000))
          })
        } catch (error) {
          console.error('Token callback error:', error)
        }
      },
    })

    this.isInitialized = true
  }

  /**
   * Get the token client (throws if not initialized)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTokenClient(): any {
    if (!this.tokenClient) {
      throw new Error('Google API not initialized. Call initialize() first.')
    }
    return this.tokenClient
  }

  /**
   * Get the gapi.client.drive instance (throws if not initialized)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDriveClient(): any {
    if (!this.isInitialized || typeof gapi === 'undefined' || !gapi.client?.drive) {
      throw new Error('Google Drive API not initialized. Call initialize() first.')
    }
    return gapi.client.drive
  }

  /**
   * Set the access token for the current session
   */
  setAccessToken(accessToken: string): void {
    if (typeof gapi !== 'undefined' && gapi.client) {
      gapi.client.setToken({ access_token: accessToken })
    }
  }

  /**
   * Clear the access token
   */
  clearAccessToken(): void {
    if (typeof gapi !== 'undefined' && gapi.client) {
      gapi.client.setToken(null)
    }
  }

  /**
   * Check if the client is initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized
  }

  /**
   * Get the google global object (for OAuth operations)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getGoogleAuth(): any {
    if (typeof google === 'undefined') {
      throw new Error('Google Identity Services library not loaded')
    }
    return google.accounts.oauth2
  }

  // ========================================
  // Authentication Methods
  // ========================================

  /**
   * Sign in with Google OAuth
   * Opens OAuth consent flow
   *
   * @returns Access token and expiry timestamp
   */
  async signInWithGoogle(): Promise<{
    accessToken: string
    expiresAt: number
  }> {
    const tokenClient = this.getTokenClient()

    return new Promise((resolve, reject) => {
      try {
        // Override callback for this specific sign-in
        tokenClient.callback = (response: {
          access_token: string
          expires_in: number
          error?: string
        }) => {
          try {
            this.handleTokenResponse(response, (accessToken, expiresAt) => {
              resolve({ accessToken, expiresAt })
            })
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error during sign-in'
            reject(new Error(`Google sign-in failed: ${errorMessage}`))
          }
        }

        // Request access token
        tokenClient.requestAccessToken({ prompt: '' })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error during Google sign-in'
        reject(new Error(`Google sign-in failed: ${errorMessage}`))
      }
    })
  }

  /**
   * Sign out from Google OAuth
   * Revokes access token
   *
   * @param accessToken - The access token to revoke
   */
  async signOut(accessToken: string): Promise<void> {
    if (accessToken) {
      const googleAuth = this.getGoogleAuth()
      return new Promise<void>((resolve) => {
        googleAuth.revoke(accessToken, () => {
          this.clearAccessToken()
          resolve()
        })
      })
    }
  }

  /**
   * Silently refresh the access token without user interaction.
   * Uses prompt: 'none' which works if the user has an active Google session.
   * Throws if silent refresh fails (user must re-authenticate).
   *
   * @returns New access token and expiry timestamp
   */
  async silentRefresh(): Promise<{
    accessToken: string
    expiresAt: number
  }> {
    const tokenClient = this.getTokenClient()

    return new Promise((resolve, reject) => {
      // Set up error handler for when popup is needed but blocked
      tokenClient.error_callback = (error: { type: string; message?: string }) => {
        reject(
          new Error(
            `Silent refresh failed: ${error.type} - ${error.message || 'User interaction required'}`,
          ),
        )
      }

      tokenClient.callback = (response: {
        access_token: string
        expires_in: number
        error?: string
      }) => {
        try {
          this.handleTokenResponse(response, (accessToken, expiresAt) => {
            resolve({ accessToken, expiresAt })
          })
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error during silent refresh'
          reject(new Error(`Silent refresh failed: ${errorMessage}`))
        }
      }

      // Request token silently - no UI shown if user has active Google session
      console.log('[GoogleApiClient] Requesting token with prompt: none')
      tokenClient.requestAccessToken({ prompt: 'none' })
    })
  }

  /**
   * Refresh the access token.
   * Attempts silent refresh first (no UI if user has active Google session).
   *
   * @returns New access token and expiry timestamp
   * @throws Error if silent refresh fails (caller should clear auth state)
   */
  async refreshToken(): Promise<{
    accessToken: string
    expiresAt: number
  }> {
    return this.silentRefresh()
  }

  /**
   * Fetch user information (email) from Google
   * Requires email scope to be granted
   *
   * @param accessToken - The access token
   * @returns User email address
   */
  async getUserInfo(accessToken: string): Promise<{ email: string }> {
    if (!accessToken) {
      throw new Error('Not authenticated. Sign in first.')
    }

    const response = await fetch(GOOGLE_API_URLS.USER_INFO, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`)
    }

    const data = await response.json()
    return { email: data.email }
  }
}

// Export singleton instance
export const googleApiClient = GoogleApiClient.getInstance()
