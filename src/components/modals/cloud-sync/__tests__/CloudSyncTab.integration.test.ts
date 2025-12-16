import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { component } from '@/__tests__/vue-test-helpers'
import {
  mockBackupFiles,
  mockDeleteBackup,
  mockLoadingBackups,
  mockRefreshBackupList,
  mockRestoreBackup,
} from '@/__tests__/fixtures/composables/useBackupManager'
import {
  mockBackupFactory,
  mockCanSync,
  mockRestoreFactory,
} from '@/__tests__/fixtures/composables/useCloudBackup'
import {
  mockFindOrCreateFolder,
  mockListFolders,
} from '@/__tests__/fixtures/composables/useGoogleDrive'
import type { GoogleDriveFile } from '@/types/cloudSync'
import type { Factory } from '@/types/factory'

import CloudAuth from '@/components/modals/cloud-sync/CloudAuth.vue'
import CloudSyncTab from '@/components/modals/cloud-sync/CloudSyncTab.vue'
import BackupList from '@/components/modals/cloud-sync/BackupList.vue'
import SignedInUser from '@/components/modals/cloud-sync/SignedInUser.vue'
import FactorySelector from '@/components/common/FactorySelector.vue'
import NamespaceSelector from '@/components/common/NamespaceSelector.vue'
import { VAlert, VBtn, VSwitch } from 'vuetify/components'

const mockAuthenticate = vi.fn()
const mockSignOut = vi.fn()
const mockEnableAutoSync = vi.fn()
const mockDisableAutoSync = vi.fn()

const mockGoogleAuthStore = {
  isAuthenticated: false,
  userEmail: '',
}

const mockCloudSyncStore = {
  autoSync: {
    namespace: '',
    enabled: false,
    selectedFactories: [] as string[],
  },
  authenticate: mockAuthenticate,
  signOut: mockSignOut,
  enableAutoSync: mockEnableAutoSync,
  disableAutoSync: mockDisableAutoSync,
}

const mockClearSyncConflict = vi.fn()

const mockFactoryStore: {
  factoryList: Factory[]
  clearSyncConflict: typeof mockClearSyncConflict
} = {
  factoryList: [
    { name: 'Iron Factory', icon: 'Desc_IronIngot_C', floors: [], recipeLinks: {} },
    { name: 'Steel Factory', icon: 'Desc_SteelIngot_C', floors: [], recipeLinks: {} },
  ],
  clearSyncConflict: mockClearSyncConflict,
}

vi.mock('@/composables/useStores', () => ({
  getStores: () => ({
    googleAuthStore: mockGoogleAuthStore,
    cloudSyncStore: mockCloudSyncStore,
    factoryStore: mockFactoryStore,
  }),
}))

vi.mock('@/composables/useBackupManager', async () => {
  const { mockUseBackupManager } = await import('@/__tests__/fixtures/composables/useBackupManager')
  return { useBackupManager: mockUseBackupManager }
})

vi.mock('@/composables/useCloudBackup', async () => {
  const { mockUseCloudBackup } = await import('@/__tests__/fixtures/composables/useCloudBackup')
  return { useCloudBackup: mockUseCloudBackup }
})

vi.mock('@/composables/useGoogleDrive', async () => {
  const { mockUseGoogleDrive } = await import('@/__tests__/fixtures/composables/useGoogleDrive')
  return { useGoogleDrive: () => mockUseGoogleDrive }
})

global.confirm = vi.fn(() => true)

describe('CloudSyncTab Integration', () => {
  const createWrapper = () => {
    return mount(CloudSyncTab)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(global.confirm).mockReturnValue(true)
    mockGoogleAuthStore.isAuthenticated = false
    mockGoogleAuthStore.userEmail = ''
    mockCloudSyncStore.autoSync.namespace = ''
    mockCloudSyncStore.autoSync.enabled = false
    mockCloudSyncStore.autoSync.selectedFactories = []
    mockBackupFiles.value = []
    mockLoadingBackups.value = false
    mockCanSync.value = false

    // Reset mock implementations to default resolved values
    mockRefreshBackupList.mockResolvedValue(undefined)
    mockBackupFactory.mockResolvedValue(undefined)
    mockRestoreFactory.mockResolvedValue(undefined)
    mockRestoreBackup.mockResolvedValue(undefined)
    mockDeleteBackup.mockResolvedValue(undefined)
    mockAuthenticate.mockResolvedValue(undefined)

    // Default mock for namespace fetching
    mockFindOrCreateFolder.mockResolvedValue('root-folder-id')
    mockListFolders.mockResolvedValue([])
  })

  describe('Authentication State', () => {
    it('shows CloudAuth when not authenticated', () => {
      mockGoogleAuthStore.isAuthenticated = false

      const wrapper = createWrapper()

      component(wrapper, CloudAuth).assert()
    })

    it('shows SignedInUser when authenticated', () => {
      mockGoogleAuthStore.isAuthenticated = true
      mockGoogleAuthStore.userEmail = 'test@example.com'

      const wrapper = createWrapper()

      component(wrapper, SignedInUser).assert({ props: { email: 'test@example.com' } })
      component(wrapper, CloudAuth).assert({ exists: false })
    })
  })

  describe('Authentication Handlers', () => {
    it('calls authenticate when CloudAuth emits authenticate', async () => {
      mockGoogleAuthStore.isAuthenticated = false

      const wrapper = createWrapper()

      await component(wrapper, CloudAuth).emit('authenticate')
      await flushPromises()

      expect(mockAuthenticate).toHaveBeenCalled()
    })

    it('calls signOut when SignedInUser emits sign-out', async () => {
      mockGoogleAuthStore.isAuthenticated = true

      const wrapper = createWrapper()

      await component(wrapper, SignedInUser).emit('signOut')

      expect(mockSignOut).toHaveBeenCalled()
    })

    it('displays error when authentication fails', async () => {
      mockGoogleAuthStore.isAuthenticated = false
      mockAuthenticate.mockRejectedValue(new Error('Auth failed'))

      const wrapper = createWrapper()

      await component(wrapper, CloudAuth).emit('authenticate')
      await flushPromises()

      expect(wrapper.text()).toContain('Authentication failed: Auth failed')
      component(wrapper, VAlert).assert()
    })

    it('displays error when sign out fails', async () => {
      mockGoogleAuthStore.isAuthenticated = true
      mockSignOut.mockImplementation(() => {
        throw new Error('Sign out failed')
      })

      const wrapper = createWrapper()

      await component(wrapper, SignedInUser).emit('signOut')

      expect(wrapper.text()).toContain('Sign out failed: Sign out failed')
    })
  })

  describe('Namespace Handling', () => {
    it('shows namespace selector when authenticated', () => {
      mockGoogleAuthStore.isAuthenticated = true

      const wrapper = createWrapper()

      component(wrapper, NamespaceSelector).assert()
    })

    it('shows info alert when canSync is false', () => {
      mockGoogleAuthStore.isAuthenticated = true
      mockCanSync.value = false

      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Select a namespace to configure sync')
    })

    it('hides sync components when canSync is false', () => {
      mockGoogleAuthStore.isAuthenticated = true
      mockCanSync.value = false

      const wrapper = createWrapper()

      component(wrapper, BackupList).assert({ exists: false })
      component(wrapper, FactorySelector).assert({ exists: false })
    })

    it('shows sync components when canSync is true', () => {
      mockGoogleAuthStore.isAuthenticated = true
      mockCanSync.value = true

      const wrapper = createWrapper()

      component(wrapper, BackupList).assert()
      component(wrapper, FactorySelector).assert()
    })

    it('calls refreshBackups when namespace selector loses focus', async () => {
      mockGoogleAuthStore.isAuthenticated = true

      const wrapper = createWrapper()

      await component(wrapper, NamespaceSelector).emit('blur')
      await flushPromises()

      expect(mockRefreshBackupList).toHaveBeenCalled()
    })

    it('fetches namespaces on mount when authenticated', async () => {
      mockGoogleAuthStore.isAuthenticated = true
      mockListFolders.mockResolvedValue([
        { id: '1', name: 'Save1', mimeType: 'folder', modifiedTime: '', createdTime: '' },
        { id: '2', name: 'Save2', mimeType: 'folder', modifiedTime: '', createdTime: '' },
      ])

      createWrapper()
      await flushPromises()

      expect(mockFindOrCreateFolder).toHaveBeenCalledWith('SatisProdTrak')
      expect(mockListFolders).toHaveBeenCalledWith('root-folder-id')
    })

    it('passes available namespaces to NamespaceSelector', async () => {
      mockGoogleAuthStore.isAuthenticated = true
      mockListFolders.mockResolvedValue([
        { id: '1', name: 'Save1', mimeType: 'folder', modifiedTime: '', createdTime: '' },
        { id: '2', name: 'Save2', mimeType: 'folder', modifiedTime: '', createdTime: '' },
      ])

      const wrapper = createWrapper()
      await flushPromises()

      component(wrapper, NamespaceSelector).assert({
        props: { availableNamespaces: ['Save1', 'Save2'] },
      })
    })

    it('fetches namespaces after authentication', async () => {
      mockGoogleAuthStore.isAuthenticated = false
      mockListFolders.mockResolvedValue([
        { id: '1', name: 'MyGame', mimeType: 'folder', modifiedTime: '', createdTime: '' },
      ])

      const wrapper = createWrapper()
      await flushPromises()

      // Not called yet since not authenticated
      expect(mockFindOrCreateFolder).not.toHaveBeenCalled()

      // Simulate successful authentication - the authenticate action sets isAuthenticated
      mockAuthenticate.mockImplementation(async () => {
        mockGoogleAuthStore.isAuthenticated = true
      })
      await component(wrapper, CloudAuth).emit('authenticate')
      await flushPromises()

      expect(mockFindOrCreateFolder).toHaveBeenCalledWith('SatisProdTrak')
      expect(mockListFolders).toHaveBeenCalled()
    })

    it('handles namespace fetch errors gracefully', async () => {
      mockGoogleAuthStore.isAuthenticated = true
      mockFindOrCreateFolder.mockRejectedValue(new Error('Network error'))

      const wrapper = createWrapper()
      await flushPromises()

      // Should not show error to user, just log warning
      expect(wrapper.text()).not.toContain('Network error')
      // NamespaceSelector should still render with empty list
      component(wrapper, NamespaceSelector).assert({
        props: { availableNamespaces: [] },
      })
    })
  })

  describe('Auto-Sync Toggle', () => {
    beforeEach(() => {
      mockGoogleAuthStore.isAuthenticated = true
      mockCanSync.value = true
    })

    it('shows auto-sync toggle when canSync is true', () => {
      const wrapper = createWrapper()

      component(wrapper, VSwitch).assert()
    })

    it('disables toggle when no factories selected', () => {
      mockCloudSyncStore.autoSync.selectedFactories = []

      const wrapper = createWrapper()

      component(wrapper, VSwitch).assert({ props: { disabled: true } })
    })

    it('enables toggle when factories are selected', () => {
      mockCloudSyncStore.autoSync.selectedFactories = ['Iron Factory']

      const wrapper = createWrapper()

      component(wrapper, VSwitch).assert({ props: { disabled: false } })
    })

    it('calls enableAutoSync when toggle turned on', async () => {
      mockCloudSyncStore.autoSync.selectedFactories = ['Iron Factory']
      mockCloudSyncStore.autoSync.namespace = 'test-namespace'

      const wrapper = createWrapper()

      await component(wrapper, VSwitch).emit('update:modelValue', true)
      await flushPromises()

      expect(mockEnableAutoSync).toHaveBeenCalledWith('test-namespace', ['Iron Factory'])
    })

    it('calls disableAutoSync when toggle turned off', async () => {
      mockCloudSyncStore.autoSync.selectedFactories = ['Iron Factory']

      const wrapper = createWrapper()

      await component(wrapper, VSwitch).emit('update:modelValue', false)
      await flushPromises()

      expect(mockDisableAutoSync).toHaveBeenCalled()
    })
  })

  describe('Backup Operations', () => {
    beforeEach(() => {
      mockGoogleAuthStore.isAuthenticated = true
      mockCanSync.value = true
    })

    it('calls restoreBackup when BackupList emits restore', async () => {
      const mockBackup: GoogleDriveFile = {
        id: 'backup-1',
        name: 'Test Backup',
        mimeType: 'application/json',
        modifiedTime: '2024-01-01T00:00:00Z',
        createdTime: '2024-01-01T00:00:00Z',
      }

      const wrapper = createWrapper()

      await component(wrapper, BackupList).emit('restore', mockBackup)
      await flushPromises()

      expect(mockRestoreBackup).toHaveBeenCalledWith(mockBackup, undefined)
    })

    it('calls deleteBackup when BackupList emits delete and user confirms', async () => {
      const mockBackup: GoogleDriveFile = {
        id: 'backup-1',
        name: 'Test Backup',
        mimeType: 'application/json',
        modifiedTime: '2024-01-01T00:00:00Z',
        createdTime: '2024-01-01T00:00:00Z',
      }

      const wrapper = createWrapper()

      await component(wrapper, BackupList).emit('delete', mockBackup)
      await flushPromises()

      expect(global.confirm).toHaveBeenCalledWith(
        'Delete backup "Test Backup"? This cannot be undone.',
      )
      expect(mockDeleteBackup).toHaveBeenCalledWith(mockBackup)
    })

    it('does not delete when user cancels confirmation', async () => {
      vi.mocked(global.confirm).mockReturnValue(false)
      const mockBackup: GoogleDriveFile = {
        id: 'backup-1',
        name: 'Test Backup',
        mimeType: 'application/json',
        modifiedTime: '2024-01-01T00:00:00Z',
        createdTime: '2024-01-01T00:00:00Z',
      }

      const wrapper = createWrapper()

      await component(wrapper, BackupList).emit('delete', mockBackup)
      await flushPromises()

      expect(mockDeleteBackup).not.toHaveBeenCalled()
    })

    it('calls refreshBackups when BackupList emits refresh', async () => {
      const wrapper = createWrapper()

      await component(wrapper, BackupList).emit('refresh')
      await flushPromises()

      expect(mockRefreshBackupList).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      mockGoogleAuthStore.isAuthenticated = true
      mockCanSync.value = true
    })

    it('displays error when restore fails', async () => {
      mockRestoreBackup.mockRejectedValue(new Error('Restore failed'))
      const mockBackup: GoogleDriveFile = {
        id: 'backup-1',
        name: 'Test',
        mimeType: 'application/json',
        modifiedTime: '2024-01-01T00:00:00Z',
        createdTime: '2024-01-01T00:00:00Z',
      }

      const wrapper = createWrapper()

      await component(wrapper, BackupList).emit('restore', mockBackup)
      await flushPromises()

      expect(wrapper.text()).toContain('Restore failed: Restore failed')
    })

    it('displays error when delete fails', async () => {
      mockDeleteBackup.mockRejectedValue(new Error('Delete failed'))
      const mockBackup: GoogleDriveFile = {
        id: 'backup-1',
        name: 'Test',
        mimeType: 'application/json',
        modifiedTime: '2024-01-01T00:00:00Z',
        createdTime: '2024-01-01T00:00:00Z',
      }

      const wrapper = createWrapper()

      await component(wrapper, BackupList).emit('delete', mockBackup)
      await flushPromises()
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Delete failed: Delete failed')
    })

    it('displays error when refresh fails', async () => {
      mockRefreshBackupList.mockRejectedValue(new Error('Refresh failed'))

      const wrapper = createWrapper()

      await component(wrapper, BackupList).emit('refresh')
      await flushPromises()

      expect(wrapper.text()).toContain('Failed to load backups: Refresh failed')
    })

    it('can close error alert', async () => {
      mockRefreshBackupList.mockRejectedValue(new Error('Test error'))

      const wrapper = createWrapper()

      await component(wrapper, BackupList).emit('refresh')
      await flushPromises()

      component(wrapper, VAlert).assert()

      await component(wrapper, VAlert).emit('click:close')

      component(wrapper, VAlert).assert({ exists: false })
    })
  })

  describe('Conflict Resolution', () => {
    const CONFLICTED_FACTORY_NAME = 'Iron Factory'
    const CONFLICTED_FACTORY_FILENAME = 'Iron_Factory.sptrak'
    const CLOUD_DEVICE_NAME = 'Work Laptop'
    const TEST_NAMESPACE = 'test-namespace'

    const conflictInfo = {
      factoryName: CONFLICTED_FACTORY_NAME,
      cloudTimestamp: '2024-01-15T10:30:00.000Z',
      cloudInstanceId: 'other-device-123',
      cloudDisplayId: CLOUD_DEVICE_NAME,
      localTimestamp: '2024-01-15T09:00:00.000Z',
    }

    const factoryWithConflict = {
      name: CONFLICTED_FACTORY_NAME,
      icon: 'Desc_IronIngot_C',
      floors: [],
      recipeLinks: {},
      conflict: conflictInfo,
    }

    beforeEach(() => {
      mockGoogleAuthStore.isAuthenticated = true
      mockCanSync.value = true
      mockCloudSyncStore.autoSync.namespace = TEST_NAMESPACE
    })

    it('shows conflict card when factories have conflicts', () => {
      mockFactoryStore.factoryList = [factoryWithConflict]

      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Sync Conflicts Detected')
      expect(wrapper.text()).toContain(CONFLICTED_FACTORY_NAME)
      expect(wrapper.text()).toContain(CLOUD_DEVICE_NAME)
    })

    it('hides conflict card when no conflicts', () => {
      mockFactoryStore.factoryList = [
        { name: CONFLICTED_FACTORY_NAME, icon: 'Desc_IronIngot_C', floors: [], recipeLinks: {} },
      ]

      const wrapper = createWrapper()

      expect(wrapper.text()).not.toContain('Sync Conflicts Detected')
    })

    it('shows Keep Local and Use Cloud buttons for each conflict', () => {
      mockFactoryStore.factoryList = [factoryWithConflict]

      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Keep Local')
      expect(wrapper.text()).toContain('Use Cloud')
    })

    it('calls backupFactory and clearSyncConflict when Keep Local clicked', async () => {
      mockFactoryStore.factoryList = [factoryWithConflict]
      mockBackupFactory.mockResolvedValue(undefined)

      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Keep Local'))
        .click()
      await flushPromises()

      expect(mockBackupFactory).toHaveBeenCalledWith(TEST_NAMESPACE, CONFLICTED_FACTORY_NAME)
      expect(mockClearSyncConflict).toHaveBeenCalledWith(CONFLICTED_FACTORY_NAME)
    })

    it('calls restoreFactory with overwrite and clearSyncConflict when Use Cloud clicked', async () => {
      mockFactoryStore.factoryList = [factoryWithConflict]
      mockRestoreFactory.mockResolvedValue(undefined)

      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Use Cloud'))
        .click()
      await flushPromises()

      expect(mockRestoreFactory).toHaveBeenCalledWith(
        TEST_NAMESPACE,
        CONFLICTED_FACTORY_FILENAME,
        CONFLICTED_FACTORY_NAME,
        true,
      )
      expect(mockClearSyncConflict).toHaveBeenCalledWith(CONFLICTED_FACTORY_NAME)
    })

    it('displays error when Keep Local fails', async () => {
      mockFactoryStore.factoryList = [factoryWithConflict]
      mockBackupFactory.mockRejectedValue(new Error('Backup failed'))

      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Keep Local'))
        .click()
      await flushPromises()

      expect(wrapper.text()).toContain('Failed to resolve conflict: Backup failed')
    })

    it('displays error when Use Cloud fails', async () => {
      mockFactoryStore.factoryList = [factoryWithConflict]
      mockRestoreFactory.mockRejectedValue(new Error('Restore failed'))

      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Use Cloud'))
        .click()
      await flushPromises()

      expect(wrapper.text()).toContain('Failed to resolve conflict: Restore failed')
    })

    it('displays local and cloud timestamps', () => {
      mockFactoryStore.factoryList = [factoryWithConflict]

      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Local:')
      expect(wrapper.text()).toContain('Cloud:')
    })

    it('shows "Never synced" for local timestamp when applicable', () => {
      mockFactoryStore.factoryList = [
        {
          ...factoryWithConflict,
          conflict: {
            ...conflictInfo,
            localTimestamp: 'Never synced',
          },
        },
      ]

      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Never synced')
    })
  })
})
