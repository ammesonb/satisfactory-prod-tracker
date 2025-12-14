import { useGoogleDrive } from '@/composables/useGoogleDrive'
import { getStores } from '@/composables/useStores'
import { CLOUD_SYNC_ERRORS, FactorySyncStatus, type GoogleDriveFile } from '@/types/cloudSync'
import {
  deserializeSptrak,
  generateSptrakFilename,
  isCompatibleVersion,
  serializeSptrak,
} from '@/utils/sptrak'

/**
 * Composable for cloud backup and restore operations
 *
 * This composable handles the business logic for backing up and restoring factories
 * to/from Google Drive. It's separate from the store to maintain separation of concerns:
 * - Store manages state (auth, config, etc.)
 * - Composable orchestrates operations (backup, restore, list, delete)
 */
export function useCloudBackup() {
  const { cloudSyncStore, factoryStore, googleAuthStore } = getStores()
  const googleDrive = useGoogleDrive()

  /**
   * Backup a factory to Google Drive
   *
   * @param namespace - Namespace (folder) to save the backup
   * @param factoryName - Name of the factory to backup
   */
  async function backupFactory(namespace: string, factoryName: string): Promise<void> {
    if (!googleAuthStore.isAuthenticated) {
      throw new Error(CLOUD_SYNC_ERRORS.NOT_AUTHENTICATED)
    }

    cloudSyncStore.initializeInstanceId()

    // Get factory from store
    const factory = factoryStore.factories[factoryName]
    if (!factory) {
      throw new Error(CLOUD_SYNC_ERRORS.FACTORY_NOT_FOUND(factoryName))
    }

    // Serialize factory to .sptrak format
    const sptrakContent = serializeSptrak(
      factory,
      cloudSyncStore.instanceId,
      namespace,
      cloudSyncStore.displayId,
    )
    const filename = generateSptrakFilename(factoryName)

    // Ensure namespace folder exists
    const folderId = await googleDrive.ensureFolderPath(['SatisProdTrak', namespace])

    // Check if file already exists (for update vs create)
    const existingFiles = await googleDrive.listFiles(folderId, `name='${filename}'`)

    if (existingFiles.length > 0) {
      // Update existing file
      // TODO: conflict handling here
      await googleDrive.updateFile(existingFiles[0].id, sptrakContent)
    } else {
      // Upload new file
      await googleDrive.uploadFile(filename, sptrakContent, folderId)
    }

    // Always set sync status - if we're backing up, we're tracking sync state
    factory.syncStatus = {
      status: FactorySyncStatus.CLEAN,
      lastSynced: new Date().toISOString(),
      lastError: null,
    }
  }

  /**
   * Restore a factory from Google Drive
   *
   * @param namespace - Namespace (folder) containing the backup
   * @param filename - Name of the .sptrak file
   * @param importAlias - Optional alias name if restoring with a different name
   */
  async function restoreFactory(
    namespace: string,
    filename: string,
    importAlias?: string,
  ): Promise<void> {
    if (!googleAuthStore.isAuthenticated) {
      throw new Error(CLOUD_SYNC_ERRORS.NOT_AUTHENTICATED)
    }

    // Find the folder
    const folderId = await googleDrive.ensureFolderPath(['SatisProdTrak', namespace])

    // Find the file
    const files = await googleDrive.listFiles(folderId, `name='${filename}'`)
    if (files.length === 0) {
      throw new Error(CLOUD_SYNC_ERRORS.FILE_NOT_FOUND(filename))
    }

    // Download and deserialize
    const content = await googleDrive.downloadFile(files[0].id)
    const sptrakFile = deserializeSptrak(content)

    // Check version compatibility
    if (!isCompatibleVersion(sptrakFile)) {
      throw new Error(
        `${CLOUD_SYNC_ERRORS.INVALID_SPTRAK_FORMAT}: Version ${sptrakFile.metadata.version} is not compatible with current version`,
      )
    }

    // Use alias name if provided, otherwise use original name
    const factoryName = importAlias || sptrakFile.factory.name

    // Check for name conflict
    if (factoryStore.factories[factoryName]) {
      throw new Error(`A factory named "${factoryName}" already exists`)
    }

    // Import the factory
    const factory = { ...sptrakFile.factory, name: factoryName }
    factoryStore.factories[factoryName] = factory

    // Set sync status to clean since we just loaded from cloud
    factory.syncStatus = {
      status: FactorySyncStatus.CLEAN,
      lastSynced: sptrakFile.metadata.lastModified,
      lastError: null,
    }
  }

  /**
   * List all backup files in a namespace
   *
   * @param namespace - Optional namespace to list (defaults to current auto-sync namespace)
   */
  async function listBackups(namespace?: string): Promise<GoogleDriveFile[]> {
    if (!googleAuthStore.isAuthenticated) {
      throw new Error(CLOUD_SYNC_ERRORS.NOT_AUTHENTICATED)
    }

    const targetNamespace = namespace || cloudSyncStore.autoSync.namespace

    if (!targetNamespace) {
      return []
    }

    // Try to find the folder - if it doesn't exist, return empty array
    try {
      const folderId = await googleDrive.ensureFolderPath(['SatisProdTrak', targetNamespace])
      const files = await googleDrive.listFiles(folderId, "name contains '.sptrak'")
      return files
    } catch (error) {
      console.error('[CloudBackup] Error listing backups:', error)
      return []
    }
  }

  /**
   * Delete a backup file from Google Drive
   *
   * @param namespace - Namespace (folder) containing the backup
   * @param filename - Name of the .sptrak file to delete
   */
  async function deleteBackup(namespace: string, filename: string): Promise<void> {
    if (!googleAuthStore.isAuthenticated) {
      throw new Error(CLOUD_SYNC_ERRORS.NOT_AUTHENTICATED)
    }

    // Find the folder
    const folderId = await googleDrive.ensureFolderPath(['SatisProdTrak', namespace])

    // Find the file
    const files = await googleDrive.listFiles(folderId, `name='${filename}'`)
    if (files.length === 0) {
      throw new Error(CLOUD_SYNC_ERRORS.FILE_NOT_FOUND(filename))
    }

    // Delete the file
    await googleDrive.deleteFile(files[0].id)
  }

  return {
    backupFactory,
    restoreFactory,
    listBackups,
    deleteBackup,
  }
}

export type CloudBackupComposable = ReturnType<typeof useCloudBackup>
