import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { component } from '@/__tests__/vue-test-helpers'
import {
  mockBackupFiles,
  mockCanBackup,
  mockDeleteBackup,
  mockLoadingBackups,
  mockPerformBackup,
  mockRefreshBackupList,
  mockRestoreBackup,
  mockSelectedFactoriesForBackup,
} from '@/__tests__/fixtures/composables/useBackupManager'
import type { GoogleDriveFile } from '@/types/cloudSync'

import CloudAuth from '@/components/modals/import-export/CloudAuth.vue'
import CloudSyncTab from '@/components/modals/import-export/CloudSyncTab.vue'
import BackupList from '@/components/modals/import-export/BackupList.vue'
import ManualBackup from '@/components/modals/import-export/ManualBackup.vue'
import NamespaceSelector from '@/components/common/NamespaceSelector.vue'
import { VAlert, VBtn } from 'vuetify/components'

const mockAuthenticate = vi.fn()
const mockSignOut = vi.fn()

const mockGoogleAuthStore = {
  isAuthenticated: false,
  userEmail: '',
}

const mockCloudSyncStore = {
  autoSync: {
    namespace: '',
  },
  authenticate: mockAuthenticate,
  signOut: mockSignOut,
}

const mockFactoryStore = {
  factoryList: [],
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

// Mock window.confirm
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
    mockBackupFiles.value = []
    mockLoadingBackups.value = false
    mockCanBackup.value = false
    mockSelectedFactoriesForBackup.value = []
  })

  describe('Authentication State', () => {
    it('shows CloudAuth when not authenticated', () => {
      mockGoogleAuthStore.isAuthenticated = false

      const wrapper = createWrapper()

      component(wrapper, CloudAuth).assert()
    })

    it('shows signed in section when authenticated', () => {
      mockGoogleAuthStore.isAuthenticated = true
      mockGoogleAuthStore.userEmail = 'test@example.com'

      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Signed in as')
      expect(wrapper.text()).toContain('test@example.com')
      component(wrapper, CloudAuth).assert({ exists: false })
    })

    it('shows sign out button when authenticated', () => {
      mockGoogleAuthStore.isAuthenticated = true

      const wrapper = createWrapper()

      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Sign Out'))
        .assert()
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

    it('calls signOut when sign out button clicked', async () => {
      mockGoogleAuthStore.isAuthenticated = true

      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Sign Out'))
        .click()

      expect(mockSignOut).toHaveBeenCalled()
    })

    it('displays error when sign out fails', async () => {
      mockGoogleAuthStore.isAuthenticated = true
      mockSignOut.mockImplementation(() => {
        throw new Error('Sign out failed')
      })

      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Sign Out'))
        .click()

      expect(wrapper.text()).toContain('Sign out failed: Sign out failed')
      component(wrapper, VAlert).assert()
    })
  })

  describe('Namespace Handling', () => {
    it('shows namespace selector when authenticated', () => {
      mockGoogleAuthStore.isAuthenticated = true

      const wrapper = createWrapper()

      component(wrapper, NamespaceSelector).assert()
    })

    it('shows info alert when no namespace selected', () => {
      mockGoogleAuthStore.isAuthenticated = true
      mockCloudSyncStore.autoSync.namespace = ''

      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Please select or create a namespace')
    })

    it('hides backup components when no namespace selected', () => {
      mockGoogleAuthStore.isAuthenticated = true
      mockCloudSyncStore.autoSync.namespace = ''

      const wrapper = createWrapper()

      component(wrapper, BackupList).assert({ exists: false })
      component(wrapper, ManualBackup).assert({ exists: false })
    })

    it('shows backup components when namespace is selected', () => {
      mockGoogleAuthStore.isAuthenticated = true
      mockCloudSyncStore.autoSync.namespace = 'test-namespace'

      const wrapper = createWrapper()

      component(wrapper, BackupList).assert()
      component(wrapper, ManualBackup).assert()
    })
  })

  describe('Backup Operations', () => {
    beforeEach(() => {
      mockGoogleAuthStore.isAuthenticated = true
      mockCloudSyncStore.autoSync.namespace = 'test-namespace'
    })

    it('calls performBackup when ManualBackup emits backup', async () => {
      const wrapper = createWrapper()

      await component(wrapper, ManualBackup).emit('backup')
      await flushPromises()

      expect(mockPerformBackup).toHaveBeenCalled()
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

    it('calls refreshBackupList when BackupList emits refresh', async () => {
      const wrapper = createWrapper()

      await component(wrapper, BackupList).emit('refresh')
      await flushPromises()

      expect(mockRefreshBackupList).toHaveBeenCalled()
    })

    it('calls refreshBackupList when namespace selector loses focus', async () => {
      const wrapper = createWrapper()

      await component(wrapper, NamespaceSelector).emit('blur')
      await flushPromises()

      expect(mockRefreshBackupList).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      mockGoogleAuthStore.isAuthenticated = true
      mockCloudSyncStore.autoSync.namespace = 'test-namespace'
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

    it('displays error when backup fails', async () => {
      mockPerformBackup.mockRejectedValue(new Error('Backup failed'))

      const wrapper = createWrapper()

      await component(wrapper, ManualBackup).emit('backup')
      await flushPromises()

      expect(wrapper.text()).toContain('Backup failed: Backup failed')
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
      mockPerformBackup.mockRejectedValue(new Error('Test error'))

      const wrapper = createWrapper()

      await component(wrapper, ManualBackup).emit('backup')
      await flushPromises()

      component(wrapper, VAlert).assert()

      await component(wrapper, VAlert).emit('click:close')

      component(wrapper, VAlert).assert({ exists: false })
    })
  })
})
