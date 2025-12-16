import { computed, onMounted, ref } from 'vue'

import { useBackupManager } from '@/composables/useBackupManager'
import { useCloudBackup } from '@/composables/useCloudBackup'
import { useGoogleDrive } from '@/composables/useGoogleDrive'
import { getStores } from '@/composables/useStores'
import type { ConflictInfo, GoogleDriveFile } from '@/types/cloudSync'
import type { Factory } from '@/types/factory'
import { generateSptrakFilename } from '@/utils/sptrak'
import { getFactorySyncTooltip, getSyncStatusColor } from '@/utils/cloudSync'

export function useCloudSyncTab() {
  const { googleAuthStore, cloudSyncStore, factoryStore } = getStores()
  const backupManager = useBackupManager()
  const cloudBackup = useCloudBackup()
  const googleDrive = useGoogleDrive()
  const error = ref<string | null>(null)
  const availableNamespaces = ref<string[]>([])

  const availableFactories = computed(() => factoryStore.factoryList)

  const conflictedFactories = computed(() =>
    factoryStore.factoryList.filter(
      (f): f is Factory & { conflict: ConflictInfo } => f.conflict !== undefined,
    ),
  )

  onMounted(async () => {
    if (googleAuthStore.isAuthenticated) {
      await fetchNamespaces()
    }
    if (cloudBackup.canSync.value) {
      await refreshBackups()
    }
  })

  async function fetchNamespaces() {
    try {
      const rootFolder = await googleDrive.findOrCreateFolder('SatisProdTrak')
      const folders = await googleDrive.listFolders(rootFolder)
      availableNamespaces.value = folders.map((f) => f.name)
    } catch (err) {
      console.warn('Failed to fetch namespaces:', err)
    }
  }

  async function authenticate() {
    try {
      await cloudSyncStore.authenticate()
      await fetchNamespaces()
      if (cloudSyncStore.autoSync.namespace) {
        await refreshBackups()
      }
    } catch (err) {
      error.value = `Authentication failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
  }

  async function backupFactory(factory: Factory) {
    try {
      await cloudBackup.backupFactory(cloudSyncStore.autoSync.namespace, factory.name)
      await refreshBackups()
    } catch (err) {
      error.value = `Backup failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
  }

  async function restoreBackup(backup: GoogleDriveFile, importAlias?: string) {
    try {
      await backupManager.restoreBackup(backup, importAlias)
    } catch (err) {
      error.value = `Restore failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
  }

  async function deleteBackup(backup: GoogleDriveFile) {
    if (!confirm(`Delete backup "${backup.name}"? This cannot be undone.`)) {
      return
    }

    try {
      await backupManager.deleteBackup(backup)
    } catch (err) {
      error.value = `Delete failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
  }

  async function refreshBackups() {
    try {
      await backupManager.refreshBackupList()
    } catch (err) {
      error.value = `Failed to load backups: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
  }

  function signOut() {
    try {
      cloudSyncStore.signOut()
    } catch (err) {
      error.value = `Sign out failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
  }

  function toggleAutoSync(enabled: boolean | null) {
    if (enabled) {
      cloudSyncStore.enableAutoSync(
        cloudSyncStore.autoSync.namespace,
        cloudSyncStore.autoSync.selectedFactories,
      )
    } else {
      cloudSyncStore.disableAutoSync()
    }
  }

  function clearError() {
    error.value = null
  }

  async function resolveConflictKeepLocal(factoryName: string) {
    try {
      // this just saves the factory, other conflict checking happens at higher level composables
      await cloudBackup.backupFactory(cloudSyncStore.autoSync.namespace, factoryName)
      factoryStore.clearSyncConflict(factoryName)
      await refreshBackups()
    } catch (err) {
      error.value = `Failed to resolve conflict: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
  }

  async function resolveConflictUseCloud(factoryName: string) {
    try {
      const filename = generateSptrakFilename(factoryName)
      await cloudBackup.restoreFactory(
        cloudSyncStore.autoSync.namespace,
        filename,
        factoryName,
        true, // overwrite existing
      )
      factoryStore.clearSyncConflict(factoryName)
    } catch (err) {
      error.value = `Failed to resolve conflict: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
  }

  function getFactorySyncStatus(factory: Factory) {
    const isAutoSynced = cloudSyncStore.autoSync.selectedFactories.includes(factory.name)
    const status = factory.syncStatus?.status
    const hasEverSynced = !!factory.syncStatus?.lastSynced

    if (!isAutoSynced) {
      return { text: 'Not auto-synced', color: 'grey' }
    }

    if (!hasEverSynced && !status) {
      return { text: 'Never synced', color: 'grey' }
    }

    return {
      text: getFactorySyncTooltip(status, googleAuthStore.isAuthenticated),
      color: status ? getSyncStatusColor(status) : 'grey',
    }
  }

  return {
    // State
    error,
    availableFactories,
    availableNamespaces,
    conflictedFactories,

    // From stores/composables
    googleAuthStore,
    cloudSyncStore,
    canSync: cloudBackup.canSync,
    backupFiles: backupManager.backupFiles,
    loadingBackups: backupManager.loadingBackups,

    // Actions
    authenticate,
    backupFactory,
    restoreBackup,
    deleteBackup,
    refreshBackups,
    signOut,
    toggleAutoSync,
    clearError,
    resolveConflictKeepLocal,
    resolveConflictUseCloud,
    getFactorySyncStatus,
  }
}
