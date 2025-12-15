import { computed } from 'vue'

import { useGoogleDrive } from '@/composables/useGoogleDrive'
import { getStores } from '@/composables/useStores'
import {
  CLOUD_SYNC_ERRORS,
  FactorySyncStatus,
  type ConflictInfo,
  type GoogleDriveFile,
  type SptrakFile,
} from '@/types/cloudSync'
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

  const canSync = computed(
    () => googleAuthStore.isAuthenticated && !!cloudSyncStore.autoSync.namespace,
  )

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

    const factory = factoryStore.factories[factoryName]
    if (!factory) {
      throw new Error(CLOUD_SYNC_ERRORS.FACTORY_NOT_FOUND(factoryName))
    }

    factoryStore.setSyncStatus(factoryName, FactorySyncStatus.SAVING)
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

  /**
   * Find a cloud backup file by factory name
   *
   * @param namespace - Namespace (folder) containing the backup
   * @param factoryName - Name of the factory
   * @returns File metadata if found, null otherwise
   */
  async function findCloudFile(
    namespace: string,
    factoryName: string,
  ): Promise<GoogleDriveFile | null> {
    if (!googleAuthStore.isAuthenticated) {
      throw new Error(CLOUD_SYNC_ERRORS.NOT_AUTHENTICATED)
    }

    const filename = generateSptrakFilename(factoryName)

    try {
      const folderId = await googleDrive.ensureFolderPath(['SatisProdTrak', namespace])
      const files = await googleDrive.listFiles(folderId, `name='${filename}'`)
      return files.length > 0 ? files[0] : null
    } catch {
      return null
    }
  }

  /**
   * Download and parse a .sptrak file from cloud
   *
   * @param namespace - Namespace (folder) containing the backup
   * @param factoryName - Name of the factory
   * @returns Parsed SptrakFile if found, null otherwise
   */
  async function downloadSptrakFile(
    namespace: string,
    factoryName: string,
  ): Promise<SptrakFile | null> {
    const file = await findCloudFile(namespace, factoryName)
    if (!file) return null

    try {
      const content = await googleDrive.downloadFile(file.id)
      return deserializeSptrak(content)
    } catch (error) {
      console.error(`[CloudBackup] Error downloading ${factoryName}:`, error)
      return null
    }
  }

  /**
   * Detect if there's a conflict between local and cloud versions
   *
   * Optimized to avoid full file download when possible:
   * 1. If cloud file doesn't exist -> no conflict
   * 2. If cloud modifiedTime <= local lastSynced -> no conflict (cloud is same/older)
   *    - Technically could hit race conditions if two devices simultaneously auto-syncing changes on one account.
   *    - This is not supported yet, as it would require live-syncing between two devices.
   * 3. Only download file if cloud is newer, to check instanceId
   *
   * @param namespace - Namespace (folder) containing the backup
   * @param factoryName - Name of the factory to check
   * @returns ConflictInfo if conflict detected, null otherwise
   */
  async function detectConflict(
    namespace: string,
    factoryName: string,
  ): Promise<ConflictInfo | null> {
    const file = await findCloudFile(namespace, factoryName)
    if (!file) return null // No cloud file, no conflict

    const factory = factoryStore.factories[factoryName]
    if (!factory) {
      throw new Error(CLOUD_SYNC_ERRORS.FACTORY_NOT_FOUND(factoryName))
    }

    const localLastSynced = factory.syncStatus?.lastSynced

    // Quick check: if cloud hasn't changed since our last sync, no conflict
    // This avoids downloading the file in the common case
    if (localLastSynced && new Date(file.modifiedTime) <= new Date(localLastSynced)) {
      return null
    }

    // Cloud is newer - must download to check instanceId
    const sptrakFile = await downloadSptrakFile(namespace, factoryName)
    if (!sptrakFile) return null

    if (sptrakFile.metadata.instanceId === cloudSyncStore.instanceId) {
      return null // Same device made the change, safe to overwrite
    }

    // Different device, cloud is newer = CONFLICT
    return {
      factoryName,
      cloudTimestamp: sptrakFile.metadata.lastModified,
      cloudInstanceId: sptrakFile.metadata.instanceId,
      cloudDisplayId: sptrakFile.metadata.displayId ?? 'Unknown Device',
      localTimestamp: localLastSynced ?? 'Never synced',
    }
  }

  /**
   * Rename a backup file in Google Drive
   *
   * @param namespace - Namespace (folder) containing the backup
   * @param oldFactoryName - Current factory name
   * @param newFactoryName - New factory name
   */
  async function renameBackup(
    namespace: string,
    oldFactoryName: string,
    newFactoryName: string,
  ): Promise<void> {
    const file = await findCloudFile(namespace, oldFactoryName)
    if (!file) return // No cloud file to rename

    const newFilename = generateSptrakFilename(newFactoryName)
    await googleDrive.renameFile(file.id, newFilename)
  }

  return {
    canSync,
    backupFactory,
    restoreFactory,
    listBackups,
    deleteBackup,
    findCloudFile,
    downloadSptrakFile,
    detectConflict,
    renameBackup,
  }
}

export type CloudBackupComposable = ReturnType<typeof useCloudBackup>
