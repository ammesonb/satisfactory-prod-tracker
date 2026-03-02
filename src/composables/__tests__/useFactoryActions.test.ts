import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useFactoryActions } from '@/composables/useFactoryActions'

vi.mock('@/composables/useCloudBackup')
vi.mock('@/composables/useStores')

// Import mocks after setting up mocks
import { mockDeleteBackup, mockRenameBackup } from '@/__tests__/fixtures/composables/useCloudBackup'
import { mockCloudSyncStore } from '@/__tests__/fixtures/composables/cloudSyncStore'
import {
  mockAddFactory,
  mockRemoveFactory,
  mockRenameFactory,
} from '@/__tests__/fixtures/composables/factoryStore'
import { mockErrorBuilder, mockErrorShow } from '@/__tests__/fixtures/composables/errorStore'

describe('useFactoryActions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Reset mock state
    mockCloudSyncStore.namespace = 'TestNamespace'
    mockCloudSyncStore.autoSync.enabled = true
    mockErrorShow.value = false
  })

  describe('addFactory', () => {
    it('calls factoryStore.addFactory with correct parameters', () => {
      const actions = useFactoryActions()

      actions.addFactory('Test Factory', 'icon.png', 'recipes', [])

      expect(mockAddFactory).toHaveBeenCalledWith('Test Factory', 'icon.png', 'recipes', [])
    })

    it('does not add to auto-sync when addToAutoSync is false', () => {
      const actions = useFactoryActions()

      actions.addFactory('Test Factory', 'icon.png', 'recipes', [], false)

      expect(mockCloudSyncStore.addFactoryToAutoSync).not.toHaveBeenCalled()
    })

    it('does not add to auto-sync when auto-sync is disabled', () => {
      mockCloudSyncStore.autoSync.enabled = false
      const actions = useFactoryActions()

      actions.addFactory('Test Factory', 'icon.png', 'recipes', [], true)

      expect(mockCloudSyncStore.addFactoryToAutoSync).not.toHaveBeenCalled()
    })

    it('adds to auto-sync when addToAutoSync is true and auto-sync is enabled', () => {
      mockCloudSyncStore.autoSync.enabled = true
      const actions = useFactoryActions()

      actions.addFactory('Test Factory', 'icon.png', 'recipes', [], true)

      expect(mockCloudSyncStore.addFactoryToAutoSync).toHaveBeenCalledWith('Test Factory')
    })
  })

  describe('renameFactory', () => {
    it('calls factoryStore.renameFactory with correct parameters', async () => {
      mockRenameBackup.mockResolvedValue(undefined)
      const actions = useFactoryActions()

      await actions.renameFactory('Old Name', 'New Name')

      expect(mockRenameFactory).toHaveBeenCalledWith('Old Name', 'New Name')
    })

    it('updates auto-sync list with new factory name', async () => {
      mockRenameBackup.mockResolvedValue(undefined)
      const actions = useFactoryActions()

      await actions.renameFactory('Old Name', 'New Name')

      expect(mockCloudSyncStore.updateFactoryNameInAutoSync).toHaveBeenCalledWith(
        'Old Name',
        'New Name',
      )
    })

    it('renames cloud backup file', async () => {
      mockRenameBackup.mockResolvedValue(undefined)
      const actions = useFactoryActions()

      await actions.renameFactory('Old Name', 'New Name')

      expect(mockRenameBackup).toHaveBeenCalledWith('TestNamespace', 'Old Name', 'New Name')
    })

    it('does not show error when cloud backup not found', async () => {
      mockRenameBackup.mockRejectedValue(new Error('File not found'))
      const actions = useFactoryActions()

      await actions.renameFactory('Old Name', 'New Name')

      expect(mockErrorBuilder).not.toHaveBeenCalled()
      expect(mockErrorShow.value).toBe(false)
    })

    it('shows error when cloud backup rename fails with other error', async () => {
      mockRenameBackup.mockRejectedValue(new Error('Network error'))
      const actions = useFactoryActions()

      await actions.renameFactory('Old Name', 'New Name')

      expect(mockErrorBuilder).toHaveBeenCalled()
    })

    it('still updates local state when cloud backup rename fails', async () => {
      mockRenameBackup.mockRejectedValue(new Error('Network error'))
      const actions = useFactoryActions()

      await actions.renameFactory('Old Name', 'New Name')

      expect(mockRenameFactory).toHaveBeenCalledWith('Old Name', 'New Name')
      expect(mockCloudSyncStore.updateFactoryNameInAutoSync).toHaveBeenCalledWith(
        'Old Name',
        'New Name',
      )
    })
  })

  describe('deleteFactory', () => {
    it('calls factoryStore.removeFactory', async () => {
      const actions = useFactoryActions()

      await actions.deleteFactory('Test Factory', false)

      expect(mockRemoveFactory).toHaveBeenCalledWith('Test Factory')
    })

    it('removes factory from auto-sync list', async () => {
      const actions = useFactoryActions()

      await actions.deleteFactory('Test Factory', false)

      expect(mockCloudSyncStore.removeFactoryFromAutoSync).toHaveBeenCalledWith('Test Factory')
    })

    it('does not delete cloud backup when deleteCloudBackups is false', async () => {
      const actions = useFactoryActions()

      await actions.deleteFactory('Test Factory', false)

      expect(mockDeleteBackup).not.toHaveBeenCalled()
    })

    it('deletes cloud backup when deleteCloudBackups is true', async () => {
      mockDeleteBackup.mockResolvedValue(undefined)
      const actions = useFactoryActions()

      await actions.deleteFactory('Test Factory', true)

      expect(mockDeleteBackup).toHaveBeenCalledWith('TestNamespace', 'Test Factory.sptrak')
    })

    it('does not show error when cloud backup not found', async () => {
      mockDeleteBackup.mockRejectedValue(new Error('File not found'))
      const actions = useFactoryActions()

      await actions.deleteFactory('Test Factory', true)

      expect(mockErrorBuilder).not.toHaveBeenCalled()
      expect(mockErrorShow.value).toBe(false)
    })

    it('shows error when cloud backup delete fails with other error', async () => {
      mockDeleteBackup.mockRejectedValue(new Error('Network error'))
      const actions = useFactoryActions()

      await actions.deleteFactory('Test Factory', true)

      expect(mockErrorBuilder).toHaveBeenCalled()
    })

    it('still removes local factory when cloud backup delete fails', async () => {
      mockDeleteBackup.mockRejectedValue(new Error('Network error'))
      const actions = useFactoryActions()

      await actions.deleteFactory('Test Factory', true)

      expect(mockCloudSyncStore.removeFactoryFromAutoSync).toHaveBeenCalledWith('Test Factory')
      expect(mockRemoveFactory).toHaveBeenCalledWith('Test Factory')
    })
  })
})
