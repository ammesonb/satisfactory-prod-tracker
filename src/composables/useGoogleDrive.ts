import {
  GOOGLE_DRIVE_FIELDS,
  GOOGLE_DRIVE_MIME_TYPES,
  GOOGLE_DRIVE_QUERY_OPERATORS,
} from '@/constants/googleDrive'
import { googleApiClient } from '@/services/googleApiClient'
import { useGoogleAuthStore } from '@/stores/googleAuth'
import type { GoogleDriveFile } from '@/types/cloudSync'

/**
 * Pure Google Drive API composable
 *
 * This composable is a thin wrapper around the Google Drive API for file/folder operations.
 *
 * Authentication is handled by googleAuthStore (call googleAuthStore.initialize() at app startup).
 * This composable only provides Drive file and folder operations.
 */
export function useGoogleDrive() {
  const googleAuthStore = useGoogleAuthStore()

  // Ensure the API client has the current access token if available
  if (googleAuthStore.accessToken && googleAuthStore.isAuthenticated) {
    googleApiClient.setAccessToken(googleAuthStore.accessToken)
  }

  const getDriveClient = () => {
    return googleApiClient.getDriveClient()
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

    // Create empty file with metadata first
    const createResponse = await getDriveClient().files.create({
      resource: metadata,
      fields: GOOGLE_DRIVE_FIELDS.FILE_ID_ONLY,
    })

    const fileId = createResponse.result.id

    // Then update it with content
    await updateFile(fileId, content)

    return fileId
  }

  /**
   * Download a file from Google Drive
   *
   * @param fileId - Google Drive file ID
   * @returns File content as string
   */
  async function downloadFile(fileId: string): Promise<string> {
    const response = await getDriveClient().files.get({
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
    await getDriveClient().files.delete({
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

    const response = await getDriveClient().files.list({
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
    const response = await getDriveClient().files.get({
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
    if (!googleAuthStore.accessToken) {
      throw new Error('Not authenticated. Sign in first.')
    }

    // Use fetch with simple upload (uploadType=media in URL query string)
    // gapi.client doesn't handle media uploads properly in browser
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': GOOGLE_DRIVE_MIME_TYPES.JSON,
          Authorization: `Bearer ${googleAuthStore.accessToken}`,
        },
        body: content,
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to update file: ${response.statusText} - ${errorText}`)
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

    const response = await getDriveClient().files.create({
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

    const response = await getDriveClient().files.list({
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
