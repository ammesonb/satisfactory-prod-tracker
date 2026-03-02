import { h } from 'vue'

import { useCloudBackup } from '@/composables/useCloudBackup'
import { getStores } from '@/composables/useStores'
import type { RecipeProduct } from '@/types/data'

/**
 * Composable for orchestrating factory operations that span multiple stores.
 * Handles add, rename, and delete operations with their cloud sync side effects.
 */
export function useFactoryActions() {
  const { factoryStore, cloudSyncStore, errorStore } = getStores()
  const cloudBackup = useCloudBackup()

  /**
   * Add a new factory and optionally add it to the auto-sync list.
   */
  function addFactory(
    name: string,
    icon: string,
    recipes: string,
    externalInputs: RecipeProduct[],
    addToAutoSync = false,
  ): void {
    factoryStore.addFactory(name, icon, recipes, externalInputs)

    if (addToAutoSync && cloudSyncStore.autoSync.enabled) {
      cloudSyncStore.addFactoryToAutoSync(name)
    }
  }

  /**
   * Rename a factory and update all related state:
   * - Factory store (local data)
   * - Auto-sync list (if factory was in it)
   * - Cloud backup file (if it exists)
   */
  async function renameFactory(oldName: string, newName: string): Promise<void> {
    factoryStore.renameFactory(oldName, newName)
    cloudSyncStore.updateFactoryNameInAutoSync(oldName, newName)

    try {
      await cloudBackup.renameBackup(cloudSyncStore.namespace, oldName, newName)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      // File not found is expected - user may not have a cloud backup
      if (!message.toLowerCase().includes('not found')) {
        errorStore
          .error()
          .title('Failed to rename cloud backup')
          .body(() => h('p', message))
          .show()
      }
    }
  }

  /**
   * Delete a factory and clean up all related state:
   * - Cloud backup file (if requested and exists)
   * - Auto-sync list entry
   * - Factory store (local data)
   */
  async function deleteFactory(name: string, deleteCloudBackups: boolean): Promise<void> {
    if (deleteCloudBackups) {
      try {
        await cloudBackup.deleteBackup(cloudSyncStore.namespace, `${name}.sptrak`)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        // File not found is expected - user may not have a cloud backup
        if (!message.toLowerCase().includes('not found')) {
          errorStore
            .error()
            .title('Failed to delete cloud backup')
            .body(() => h('p', message))
            .show()
        }
      }
    }
    cloudSyncStore.removeFactoryFromAutoSync(name)
    factoryStore.removeFactory(name)
  }

  return {
    addFactory,
    renameFactory,
    deleteFactory,
  }
}
