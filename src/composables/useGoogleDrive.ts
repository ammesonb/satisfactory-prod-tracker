import {
  CONTENT_TYPES,
  GOOGLE_DRIVE_API_URLS,
  GOOGLE_DRIVE_FIELDS,
  GOOGLE_DRIVE_MIME_TYPES,
  GOOGLE_DRIVE_QUERY_OPERATORS,
  GOOGLE_DRIVE_SCOPES,
  HTTP_HEADERS,
} from '@/constants/googleDrive'
import type { GoogleDriveFile } from '@/types/cloudSync'

/**
 * Google API configuration from environment variables
 */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY

/**
 * Global reference to gapi (loaded via script tag in index.html)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const gapi: any

/**
 * Pure Google Drive API composable
 *
 * This composable is a thin wrapper around the Google Drive API.
 * It handles OAuth authentication and basic file/folder operations.
 */
export function useGoogleDrive() {
  // ========================================
  // Google API Client Initialization
  // ========================================

  /**
   * Initialize the Google API client
   * Must be called before any other operations
   */
  async function initGoogleAuth(): Promise<void> {
    return new Promise((resolve, reject) => {
      gapi.load('client:auth2', async () => {
        try {
          await gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            clientId: GOOGLE_CLIENT_ID,
            discoveryDocs: [GOOGLE_DRIVE_API_URLS.DISCOVERY_DOC],
            scope: GOOGLE_DRIVE_SCOPES.DRIVE_FILE,
          })
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  // ========================================
  // Authentication
  // ========================================

  /**
   * Check if user is currently authenticated
   *
   * @returns True if user is signed in with valid token
   */
  function isAuthenticated(): boolean {
    try {
      if (typeof gapi === 'undefined' || !gapi.auth2) {
        return false
      }
      const authInstance = gapi.auth2.getAuthInstance()
      return authInstance && authInstance.isSignedIn.get()
    } catch {
      return false
    }
  }

  /**
   * Sign in with Google OAuth
   * Opens OAuth consent flow in popup/redirect
   *
   * @returns Access token and expiry timestamp
   */
  async function signInWithGoogle(): Promise<{
    accessToken: string
    expiresAt: number
  }> {
    const authInstance = gapi.auth2.getAuthInstance()
    const user = await authInstance.signIn()
    const authResponse = user.getAuthResponse(true)

    return {
      accessToken: authResponse.access_token,
      expiresAt: authResponse.expires_at,
    }
  }

  /**
   * Sign out from Google OAuth
   * Revokes access token
   */
  async function signOut(): Promise<void> {
    const authInstance = gapi.auth2.getAuthInstance()
    await authInstance.signOut()
  }

  /**
   * Refresh the access token
   *
   * @returns New access token and expiry timestamp
   */
  async function refreshToken(): Promise<{
    accessToken: string
    expiresAt: number
  }> {
    const authInstance = gapi.auth2.getAuthInstance()
    const user = authInstance.currentUser.get()
    const authResponse = await user.reloadAuthResponse()

    return {
      accessToken: authResponse.access_token,
      expiresAt: authResponse.expires_at,
    }
  }

  // ========================================
  // File Operations
  // ========================================

  /**
   * Upload a file to Google Drive
   *
   * @param filename - Name of the file (e.g., "Main Base.sptrak")
   * @param content - File content as string (JSON)
   * @param folderId - Parent folder ID (optional)
   * @returns File ID of the uploaded file
   */
  async function uploadFile(filename: string, content: string, folderId?: string): Promise<string> {
    const metadata: Record<string, unknown> = {
      name: filename,
      mimeType: GOOGLE_DRIVE_MIME_TYPES.JSON,
    }

    if (folderId) {
      metadata.parents = [folderId]
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: CONTENT_TYPES.JSON }))
    form.append('file', new Blob([content], { type: CONTENT_TYPES.JSON }))

    const response = await fetch(`${GOOGLE_DRIVE_API_URLS.UPLOAD_BASE}?uploadType=multipart`, {
      method: 'POST',
      headers: {
        Authorization: HTTP_HEADERS.AUTHORIZATION_BEARER(gapi.auth.getToken().access_token),
      },
      body: form,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.id
  }

  /**
   * Download a file from Google Drive
   *
   * @param fileId - Google Drive file ID
   * @returns File content as string
   */
  async function downloadFile(fileId: string): Promise<string> {
    const response = await gapi.client.drive.files.get({
      fileId,
      alt: 'media',
    })
    return response.body
  }

  /**
   * Delete a file from Google Drive
   *
   * @param fileId - Google Drive file ID
   */
  async function deleteFile(fileId: string): Promise<void> {
    await gapi.client.drive.files.delete({
      fileId,
    })
  }

  /**
   * List files in a folder
   *
   * @param folderId - Folder ID (optional, defaults to root)
   * @param query - Search query (optional, e.g., "name contains '.sptrak'")
   * @returns Array of file metadata
   */
  async function listFiles(folderId?: string, query?: string): Promise<GoogleDriveFile[]> {
    const queries: string[] = [GOOGLE_DRIVE_QUERY_OPERATORS.NOT_TRASHED]

    if (query) {
      queries.push(query)
    }

    if (folderId) {
      queries.push(GOOGLE_DRIVE_QUERY_OPERATORS.IN_PARENTS(folderId))
    }

    const response = await gapi.client.drive.files.list({
      q: GOOGLE_DRIVE_QUERY_OPERATORS.AND(...queries),
      fields: GOOGLE_DRIVE_FIELDS.FILE_LIST_BASIC,
      pageSize: 1000,
    })

    return response.result.files.map((file: { [key: string]: unknown }) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      modifiedTime: file.modifiedTime,
      createdTime: file.createdTime,
      size: file.size,
    }))
  }

  /**
   * Get metadata for a specific file
   *
   * @param fileId - Google Drive file ID
   * @returns File metadata
   */
  async function getFileMetadata(fileId: string): Promise<GoogleDriveFile> {
    const response = await gapi.client.drive.files.get({
      fileId,
      fields: GOOGLE_DRIVE_FIELDS.FILE_BASIC,
    })

    const file = response.result
    return {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      modifiedTime: file.modifiedTime,
      createdTime: file.createdTime,
      size: file.size,
    }
  }

  /**
   * Update/replace an existing file
   *
   * @param fileId - Google Drive file ID
   * @param content - New file content as string
   */
  async function updateFile(fileId: string, content: string): Promise<void> {
    const response = await fetch(
      `${GOOGLE_DRIVE_API_URLS.UPLOAD_BASE}/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: HTTP_HEADERS.AUTHORIZATION_BEARER(gapi.auth.getToken().access_token),
          [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
        },
        body: content,
      },
    )

    if (!response.ok) {
      throw new Error(`Update failed: ${response.statusText}`)
    }
  }

  // ========================================
  // Folder Operations
  // ========================================

  /**
   * Create a folder in Google Drive
   *
   * @param name - Folder name
   * @param parentId - Parent folder ID (optional)
   * @returns Folder ID
   */
  async function createFolder(name: string, parentId?: string): Promise<string> {
    const metadata: Record<string, unknown> = {
      name,
      mimeType: GOOGLE_DRIVE_MIME_TYPES.FOLDER,
    }

    if (parentId) {
      metadata.parents = [parentId]
    }

    const response = await gapi.client.drive.files.create({
      resource: metadata,
      fields: GOOGLE_DRIVE_FIELDS.FILE_ID_ONLY,
    })

    return response.result.id
  }

  /**
   * Find a folder by name, or create it if it doesn't exist
   *
   * @param name - Folder name
   * @param parentId - Parent folder ID (optional)
   * @returns Folder ID
   */
  async function findOrCreateFolder(name: string, parentId?: string): Promise<string> {
    const queries = [
      GOOGLE_DRIVE_QUERY_OPERATORS.NAME_EQUALS(name),
      GOOGLE_DRIVE_QUERY_OPERATORS.MIME_TYPE_EQUALS(GOOGLE_DRIVE_MIME_TYPES.FOLDER),
      GOOGLE_DRIVE_QUERY_OPERATORS.NOT_TRASHED,
    ]

    if (parentId) {
      queries.push(GOOGLE_DRIVE_QUERY_OPERATORS.IN_PARENTS(parentId))
    }

    const response = await gapi.client.drive.files.list({
      q: GOOGLE_DRIVE_QUERY_OPERATORS.AND(...queries),
      fields: 'files(id)',
      pageSize: 1,
    })

    // Return existing folder if found
    if (response.result.files && response.result.files.length > 0) {
      return response.result.files[0].id
    }

    // Create new folder if not found
    return createFolder(name, parentId)
  }

  /**
   * Navigate a path of folders, creating them if they don't exist
   *
   * @param path - Array of folder names (e.g., ['SatisProdTrak', 'Main Game'])
   * @returns Final folder ID
   */
  async function ensureFolderPath(path: string[]): Promise<string> {
    let currentFolderId: string | undefined = undefined

    for (const folderName of path) {
      currentFolderId = await findOrCreateFolder(folderName, currentFolderId)
    }

    if (!currentFolderId) {
      throw new Error('Failed to create folder path')
    }

    return currentFolderId
  }

  /**
   * List all folders in a parent folder
   *
   * @param parentId - Parent folder ID (optional, defaults to root)
   * @returns Array of folder metadata
   */
  async function listFolders(parentId?: string): Promise<GoogleDriveFile[]> {
    return listFiles(
      parentId,
      GOOGLE_DRIVE_QUERY_OPERATORS.MIME_TYPE_EQUALS(GOOGLE_DRIVE_MIME_TYPES.FOLDER),
    )
  }

  // ========================================
  // Return public API
  // ========================================

  return {
    // Initialization
    initGoogleAuth,

    // Authentication
    isAuthenticated,
    signInWithGoogle,
    signOut,
    refreshToken,

    // File operations
    uploadFile,
    downloadFile,
    deleteFile,
    listFiles,
    getFileMetadata,
    updateFile,

    // Folder operations
    createFolder,
    findOrCreateFolder,
    ensureFolderPath,
    listFolders,
  }
}
