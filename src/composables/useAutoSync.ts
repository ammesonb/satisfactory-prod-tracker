import { onUnmounted, watch } from 'vue'

import { useCloudBackup } from '@/composables/useCloudBackup'
import { getStores } from '@/composables/useStores'
import { FactorySyncStatus, CLOUD_SYNC_ERRORS } from '@/types/cloudSync'

const DEBOUNCE_MS = 10000
const RETRY_DELAYS_MS = [500, 2000, 5000, 10000, 20000]
const RECENT_SYNC_THRESHOLD_MS = 60000

/**
 * Automatic cloud sync orchestration
 *
 * Watches for dirty factories and saves them to Google Drive
 * with debouncing and exponential backoff retry.
 */
export function useAutoSync() {
  const { cloudSyncStore, factoryStore, googleAuthStore } = getStores()
  const cloudBackup = useCloudBackup()

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let isInitialized = false

  function initialize(): void {
    if (isInitialized) return
    isInitialized = true

    watch(
      () => getDirtyFactories(),
      (dirtyFactories) => {
        if (dirtyFactories.length > 0) {
          scheduleSave()
        }
      },
    )
  }

  function cleanup(): void {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  function canAutoSync(): boolean {
    return (
      cloudSyncStore.autoSync.enabled &&
      !cloudSyncStore.autoSyncSuspended &&
      googleAuthStore.isAuthenticated &&
      cloudSyncStore.autoSync.namespace !== ''
    )
  }

  function getDirtyFactories(): string[] {
    if (!canAutoSync()) return []

    return cloudSyncStore.autoSync.selectedFactories.filter((name) => {
      const factory = factoryStore.factories[name]
      return factory?.syncStatus?.status === FactorySyncStatus.DIRTY
    })
  }

  function scheduleSave(): void {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(() => {
      debounceTimer = null
      void performAutoSave()
    }, DEBOUNCE_MS)
  }

  async function performAutoSave(): Promise<void> {
    const dirtyFactories = getDirtyFactories()

    for (const factoryName of dirtyFactories) {
      if (!canAutoSync()) break
      await saveFactoryWithRetry(factoryName)
    }
  }

  function wasRecentlySynced(factoryName: string): boolean {
    const lastSynced = factoryStore.factories[factoryName]?.syncStatus?.lastSynced
    if (!lastSynced) return false
    return Date.now() - new Date(lastSynced).getTime() < RECENT_SYNC_THRESHOLD_MS
  }

  /**
   * Check for conflicts and set conflict state if detected
   * @returns true if conflict was detected (caller should abort save)
   */
  async function checkConflict(factoryName: string): Promise<boolean> {
    if (wasRecentlySynced(factoryName)) return false

    const conflict = await cloudBackup.detectConflict(
      cloudSyncStore.autoSync.namespace,
      factoryName,
    )

    if (conflict) {
      factoryStore.setSyncConflict(factoryName, conflict)
      cloudSyncStore.setGlobalError(CLOUD_SYNC_ERRORS.CONFLICT_DETECTED(factoryName))
      return true
    }

    return false
  }

  async function saveFactoryWithRetry(factoryName: string, attempt = 0): Promise<void> {
    if (!factoryStore.factories[factoryName]) return
    if (!cloudSyncStore.autoSync.selectedFactories.includes(factoryName)) return

    try {
      if (await checkConflict(factoryName)) return
      await cloudBackup.backupFactory(cloudSyncStore.autoSync.namespace, factoryName)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (attempt < RETRY_DELAYS_MS.length) {
        await delay(RETRY_DELAYS_MS[attempt])
        return saveFactoryWithRetry(factoryName, attempt + 1)
      }

      factoryStore.setSyncError(factoryName, errorMessage)
      cloudSyncStore.setGlobalError(
        `Failed to save "${factoryName}" after ${RETRY_DELAYS_MS.length} attempts: ${errorMessage}`,
      )
    }
  }

  onUnmounted(cleanup)

  return {
    initialize,
    cleanup,
    scheduleSave,
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export type AutoSyncComposable = ReturnType<typeof useAutoSync>
