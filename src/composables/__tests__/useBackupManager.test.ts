import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useBackupManager } from '@/composables/useBackupManager'
import type { GoogleDriveFile } from '@/types/cloudSync'

// Mock dependencies
vi.mock('@/composables/useCloudBackup', async () => {
  const { mockUseCloudBackup } = await import('@/__tests__/fixtures/composables/useCloudBackup')
  return {
    useCloudBackup: () => mockUseCloudBackup,
  }
})

vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return {
    getStores: mockGetStores,
  }
})

// Import mocks after setting up mocks
import { mockUseCloudBackup } from '@/__tests__/fixtures/composables/useCloudBackup'
import { mockCloudSyncStore } from '@/__tests__/fixtures/composables/cloudSyncStore'

describe('useBackupManager', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Reset mock state
    mockCloudSyncStore.autoSync.namespace = 'TestNamespace'
    mockCloudSyncStore.autoSync.enabled = true
    mockUseCloudBackup.listBackups.mockResolvedValue([])
  })

  describe('state initialization', () => {
    it('initializes with empty state', () => {
      const manager = useBackupManager()

      expect(manager.loadingBackups.value).toBe(false)
      expect(manager.backupFiles.value).toEqual([])
      expect(manager.selectedFactoriesForBackup.value).toEqual([])
    })
  })

  describe('canBackup computed', () => {
    it('returns false when no namespace set', () => {
      mockCloudSyncStore.autoSync.namespace = ''
      const manager = useBackupManager()

      manager.selectedFactoriesForBackup.value = ['Factory1']

      expect(manager.canBackup.value).toBe(false)
    })

    it('returns false when no factories selected', () => {
      mockCloudSyncStore.autoSync.namespace = 'TestNamespace'
      const manager = useBackupManager()

      manager.selectedFactoriesForBackup.value = []

      expect(manager.canBackup.value).toBe(false)
    })

    it('returns true when namespace set and factories selected', () => {
      mockCloudSyncStore.autoSync.namespace = 'TestNamespace'
      const manager = useBackupManager()

      manager.selectedFactoriesForBackup.value = ['Factory1']

      expect(manager.canBackup.value).toBe(true)
    })
  })

  describe('performBackup', () => {
    it('throws error when no factories selected', async () => {
      const manager = useBackupManager()

      await expect(manager.performBackup()).rejects.toThrow(
        'Please select at least one factory to backup',
      )
    })

    it('backs up single factory', async () => {
      mockUseCloudBackup.backupFactory.mockResolvedValue(undefined)
      mockUseCloudBackup.listBackups.mockResolvedValue([])

      const manager = useBackupManager()
      manager.selectedFactoriesForBackup.value = ['Factory1']

      await manager.performBackup()

      expect(mockUseCloudBackup.backupFactory).toHaveBeenCalledTimes(1)
      expect(mockUseCloudBackup.backupFactory).toHaveBeenCalledWith('TestNamespace', 'Factory1')
      expect(manager.selectedFactoriesForBackup.value).toEqual([])
    })

    it('backs up multiple factories sequentially', async () => {
      mockUseCloudBackup.backupFactory.mockResolvedValue(undefined)
      mockUseCloudBackup.listBackups.mockResolvedValue([])

      const manager = useBackupManager()
      manager.selectedFactoriesForBackup.value = ['Factory1', 'Factory2', 'Factory3']

      await manager.performBackup()

      expect(mockUseCloudBackup.backupFactory).toHaveBeenCalledTimes(3)
      expect(mockUseCloudBackup.backupFactory).toHaveBeenNthCalledWith(
        1,
        'TestNamespace',
        'Factory1',
      )
      expect(mockUseCloudBackup.backupFactory).toHaveBeenNthCalledWith(
        2,
        'TestNamespace',
        'Factory2',
      )
      expect(mockUseCloudBackup.backupFactory).toHaveBeenNthCalledWith(
        3,
        'TestNamespace',
        'Factory3',
      )
    })

    it('clears selection after successful backup', async () => {
      mockUseCloudBackup.backupFactory.mockResolvedValue(undefined)
      mockUseCloudBackup.listBackups.mockResolvedValue([])

      const manager = useBackupManager()
      manager.selectedFactoriesForBackup.value = ['Factory1']

      await manager.performBackup()

      expect(manager.selectedFactoriesForBackup.value).toEqual([])
    })

    it('refreshes backup list after backup', async () => {
      const mockBackups: GoogleDriveFile[] = [
        {
          id: 'file-1',
          name: 'Factory1.sptrak',
          mimeType: 'application/json',
          modifiedTime: '2023-01-01',
          createdTime: '2023-01-01',
        },
      ]
      mockUseCloudBackup.backupFactory.mockResolvedValue(undefined)
      mockUseCloudBackup.listBackups.mockResolvedValue(mockBackups)

      const manager = useBackupManager()
      manager.selectedFactoriesForBackup.value = ['Factory1']

      await manager.performBackup()

      expect(mockUseCloudBackup.listBackups).toHaveBeenCalledWith('TestNamespace')
      expect(manager.backupFiles.value).toEqual(mockBackups)
    })
  })

  describe('restoreBackup', () => {
    it('calls cloudBackup.restoreFactory with correct parameters', async () => {
      mockUseCloudBackup.restoreFactory.mockResolvedValue(undefined)

      const backup: GoogleDriveFile = {
        id: 'file-1',
        name: 'Factory1.sptrak',
        mimeType: 'application/json',
        modifiedTime: '2023-01-01',
        createdTime: '2023-01-01',
      }

      const manager = useBackupManager()
      await manager.restoreBackup(backup)

      expect(mockUseCloudBackup.restoreFactory).toHaveBeenCalledWith(
        'TestNamespace',
        'Factory1.sptrak',
      )
    })
  })

  describe('deleteBackup', () => {
    it('deletes backup and refreshes list', async () => {
      const mockBackups: GoogleDriveFile[] = [
        {
          id: 'file-2',
          name: 'Factory2.sptrak',
          mimeType: 'application/json',
          modifiedTime: '2023-01-02',
          createdTime: '2023-01-02',
        },
      ]
      mockUseCloudBackup.deleteBackup.mockResolvedValue(undefined)
      mockUseCloudBackup.listBackups.mockResolvedValue(mockBackups)

      const backup: GoogleDriveFile = {
        id: 'file-1',
        name: 'Factory1.sptrak',
        mimeType: 'application/json',
        modifiedTime: '2023-01-01',
        createdTime: '2023-01-01',
      }

      const manager = useBackupManager()
      await manager.deleteBackup(backup)

      expect(mockUseCloudBackup.deleteBackup).toHaveBeenCalledWith(
        'TestNamespace',
        'Factory1.sptrak',
      )
      expect(mockUseCloudBackup.listBackups).toHaveBeenCalledWith('TestNamespace')
      expect(manager.backupFiles.value).toEqual(mockBackups)
    })
  })

  describe('refreshBackupList', () => {
    it('returns empty array when no namespace set', async () => {
      mockCloudSyncStore.autoSync.namespace = ''
      const manager = useBackupManager()

      await manager.refreshBackupList()

      expect(manager.backupFiles.value).toEqual([])
      expect(mockUseCloudBackup.listBackups).not.toHaveBeenCalled()
    })

    it('sets loading state during refresh', async () => {
      const mockBackups: GoogleDriveFile[] = [
        {
          id: 'file-1',
          name: 'Factory1.sptrak',
          mimeType: 'application/json',
          modifiedTime: '2023-01-01',
          createdTime: '2023-01-01',
        },
      ]

      let loadingDuringCall = false
      mockUseCloudBackup.listBackups.mockImplementation(async () => {
        loadingDuringCall = manager.loadingBackups.value
        return mockBackups
      })

      const manager = useBackupManager()

      expect(manager.loadingBackups.value).toBe(false)
      const promise = manager.refreshBackupList()
      expect(manager.loadingBackups.value).toBe(true)
      await promise
      expect(loadingDuringCall).toBe(true)
      expect(manager.loadingBackups.value).toBe(false)
    })

    it('populates backupFiles with results', async () => {
      const mockBackups: GoogleDriveFile[] = [
        {
          id: 'file-1',
          name: 'Factory1.sptrak',
          mimeType: 'application/json',
          modifiedTime: '2023-01-01',
          createdTime: '2023-01-01',
        },
        {
          id: 'file-2',
          name: 'Factory2.sptrak',
          mimeType: 'application/json',
          modifiedTime: '2023-01-02',
          createdTime: '2023-01-02',
        },
      ]
      mockUseCloudBackup.listBackups.mockResolvedValue(mockBackups)

      const manager = useBackupManager()
      await manager.refreshBackupList()

      expect(manager.backupFiles.value).toEqual(mockBackups)
      expect(mockUseCloudBackup.listBackups).toHaveBeenCalledWith('TestNamespace')
    })

    it('clears backupFiles and rethrows on error', async () => {
      const error = new Error('Network error')
      mockUseCloudBackup.listBackups.mockRejectedValue(error)

      const manager = useBackupManager()
      manager.backupFiles.value = [
        {
          id: 'file-1',
          name: 'Factory1.sptrak',
          mimeType: 'application/json',
          modifiedTime: '2023-01-01',
          createdTime: '2023-01-01',
        },
      ]

      await expect(manager.refreshBackupList()).rejects.toThrow('Network error')
      expect(manager.backupFiles.value).toEqual([])
    })

    it('resets loading state on error', async () => {
      mockUseCloudBackup.listBackups.mockRejectedValue(new Error('Network error'))

      const manager = useBackupManager()

      expect(manager.loadingBackups.value).toBe(false)
      await expect(manager.refreshBackupList()).rejects.toThrow('Network error')
      expect(manager.loadingBackups.value).toBe(false)
    })
  })

  describe('error handling', () => {
    it('propagates errors from backupFactory', async () => {
      const error = new Error('Backup failed')
      mockUseCloudBackup.backupFactory.mockRejectedValue(error)

      const manager = useBackupManager()
      manager.selectedFactoriesForBackup.value = ['Factory1']

      await expect(manager.performBackup()).rejects.toThrow('Backup failed')
    })

    it('propagates errors from restoreFactory', async () => {
      const error = new Error('Restore failed')
      mockUseCloudBackup.restoreFactory.mockRejectedValue(error)

      const backup: GoogleDriveFile = {
        id: 'file-1',
        name: 'Factory1.sptrak',
        mimeType: 'application/json',
        modifiedTime: '2023-01-01',
        createdTime: '2023-01-01',
      }

      const manager = useBackupManager()

      await expect(manager.restoreBackup(backup)).rejects.toThrow('Restore failed')
    })

    it('propagates errors from deleteBackup', async () => {
      const error = new Error('Delete failed')
      mockUseCloudBackup.deleteBackup.mockRejectedValue(error)

      const backup: GoogleDriveFile = {
        id: 'file-1',
        name: 'Factory1.sptrak',
        mimeType: 'application/json',
        modifiedTime: '2023-01-01',
        createdTime: '2023-01-01',
      }

      const manager = useBackupManager()

      await expect(manager.deleteBackup(backup)).rejects.toThrow('Delete failed')
    })
  })
})