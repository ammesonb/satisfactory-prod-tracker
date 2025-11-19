import { computed, ref } from 'vue'

import { useCloudBackup } from '@/composables/useCloudBackup'
import { getStores } from '@/composables/useStores'
import type { GoogleDriveFile } from '@/types/cloudSync'

/**
 * Composable for managing cloud backup operations
 * Handles backup/restore operations, namespace management, and error states
 */
export function useBackupManager() {
  const { cloudSyncStore } = getStores()
  const cloudBackup = useCloudBackup()

  // ========================================
  // State
  // ========================================

  const loadingBackups = ref(false)
  const backupFiles = ref<GoogleDriveFile[]>([])
  const selectedFactoriesForBackup = ref<string[]>([])

  // ========================================
  // Computed
  // ========================================

  const canBackup = computed(
    () => !!cloudSyncStore.autoSync.namespace && selectedFactoriesForBackup.value.length > 0,
  )

  // ========================================
  // Backup Operations
  // ========================================

  async function performBackup(): Promise<void> {
    if (selectedFactoriesForBackup.value.length === 0) {
      throw new Error('Please select at least one factory to backup')
    }

    for (const factoryName of selectedFactoriesForBackup.value) {
      await cloudBackup.backupFactory(cloudSyncStore.autoSync.namespace, factoryName)
    }

    selectedFactoriesForBackup.value = []
    await refreshBackupList()
  }

  // ========================================
  // Restore Operations
  // ========================================

  async function restoreBackup(backup: GoogleDriveFile, importAlias?: string): Promise<void> {
    await cloudBackup.restoreFactory(cloudSyncStore.autoSync.namespace, backup.name, importAlias)
  }

  // ========================================
  // Delete Operations
  // ========================================

  async function deleteBackup(backup: GoogleDriveFile): Promise<void> {
    await cloudBackup.deleteBackup(cloudSyncStore.autoSync.namespace, backup.name)
    await refreshBackupList()
  }

  // ========================================
  // Backup List Management
  // ========================================

  async function refreshBackupList(): Promise<void> {
    if (!cloudSyncStore.autoSync.namespace) {
      backupFiles.value = []
      return
    }

    loadingBackups.value = true

    try {
      backupFiles.value = await cloudBackup.listBackups(cloudSyncStore.autoSync.namespace)
    } catch (err) {
      backupFiles.value = []
      throw err
    } finally {
      loadingBackups.value = false
    }
  }

  // ========================================
  // Return Public API
  // ========================================

  return {
    // State
    loadingBackups,
    backupFiles,
    selectedFactoriesForBackup,

    // Computed
    canBackup,

    // Actions
    performBackup,
    restoreBackup,
    deleteBackup,
    refreshBackupList,
  }
}
