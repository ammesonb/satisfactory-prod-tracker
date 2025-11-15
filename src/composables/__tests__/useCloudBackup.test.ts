import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useCloudBackup } from '@/composables/useCloudBackup'
import { CLOUD_SYNC_ERRORS, FactorySyncStatus } from '@/types/cloudSync'
import type { Factory } from '@/types/factory'

// Mock the dependencies
vi.mock('@/composables/useGoogleDrive', async () => {
  const { mockUseGoogleDrive } = await import('@/__tests__/fixtures/composables/useGoogleDrive')
  return {
    useGoogleDrive: () => mockUseGoogleDrive,
  }
})

vi.mock('@/stores/cloudSync', async () => {
  const { mockCloudSyncStore } = await import('@/__tests__/fixtures/composables/cloudSyncStore')
  return {
    useCloudSyncStore: () => mockCloudSyncStore,
  }
})

vi.mock('@/stores/factory', async () => {
  const { mockFactoryStore } = await import('@/__tests__/fixtures/composables/factoryStore')
  return {
    useFactoryStore: () => mockFactoryStore,
  }
})

// Import mocks after setting up mocks
import { mockUseGoogleDrive } from '@/__tests__/fixtures/composables/useGoogleDrive'
import { mockCloudSyncStore, mockIsAuthenticated } from '@/__tests__/fixtures/composables/cloudSyncStore'
import { mockFactoryStore, mockFactories } from '@/__tests__/fixtures/composables/factoryStore'

describe('useCloudBackup', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Reset mock state
    mockIsAuthenticated.value = true
    mockFactories.value = {}
    mockCloudSyncStore.instanceId = 'test-instance-123'
    mockCloudSyncStore.displayId = 'Test Device'
  })

  describe('backupFactory', () => {
    it('throws error when not authenticated', async () => {
      mockIsAuthenticated.value = false
      const cloudBackup = useCloudBackup()

      await expect(cloudBackup.backupFactory('Save1', 'MyFactory')).rejects.toThrow(
        CLOUD_SYNC_ERRORS.NOT_AUTHENTICATED,
      )
    })

    it('throws error when factory not found', async () => {
      const cloudBackup = useCloudBackup()

      await expect(cloudBackup.backupFactory('Save1', 'NonExistent')).rejects.toThrow(
        CLOUD_SYNC_ERRORS.FACTORY_NOT_FOUND('NonExistent'),
      )
    })

    it('uploads new file when factory does not exist in Drive', async () => {
      const factory: Factory = {
        name: 'MyFactory',
        icon: 'icon.png',
        floors: [],
        recipeLinks: {},
      }
      mockFactories.value = { MyFactory: factory }
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([])
      mockUseGoogleDrive.uploadFile.mockResolvedValue('file-456')

      const cloudBackup = useCloudBackup()
      await cloudBackup.backupFactory('Save1', 'MyFactory')

      expect(mockUseGoogleDrive.ensureFolderPath).toHaveBeenCalledWith(['SatisProdTrak', 'Save1'])
      expect(mockUseGoogleDrive.uploadFile).toHaveBeenCalled()
      expect(mockUseGoogleDrive.updateFile).not.toHaveBeenCalled()
      expect(factory.syncStatus?.status).toBe(FactorySyncStatus.CLEAN)
      expect(factory.syncStatus?.lastSynced).toBeTruthy()
    })

    it('updates existing file when factory exists in Drive', async () => {
      const factory: Factory = {
        name: 'MyFactory',
        icon: 'icon.png',
        floors: [],
        recipeLinks: {},
      }
      mockFactories.value = { MyFactory: factory }
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([
        {
          id: 'existing-file-789',
          name: 'MyFactory.sptrak',
          mimeType: 'application/json',
          modifiedTime: '2023-01-01',
          createdTime: '2023-01-01',
        },
      ])
      mockUseGoogleDrive.updateFile.mockResolvedValue(undefined)

      const cloudBackup = useCloudBackup()
      await cloudBackup.backupFactory('Save1', 'MyFactory')

      expect(mockUseGoogleDrive.updateFile).toHaveBeenCalledWith('existing-file-789', expect.any(String))
      expect(mockUseGoogleDrive.uploadFile).not.toHaveBeenCalled()
    })

    // CLAUDE: if this is true, then we should check it wherever applicable in other tests instead?
    it('always sets sync status after backup', async () => {
      const factory: Factory = {
        name: 'MyFactory',
        icon: 'icon.png',
        floors: [],
        recipeLinks: {},
        // No syncStatus initially
      }
      mockFactories.value = { MyFactory: factory }
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([])
      mockUseGoogleDrive.uploadFile.mockResolvedValue('file-456')

      const cloudBackup = useCloudBackup()
      await cloudBackup.backupFactory('Save1', 'MyFactory')

      expect(factory.syncStatus).toBeDefined()
      expect(factory.syncStatus?.status).toBe(FactorySyncStatus.CLEAN)
    })
  })

  describe('restoreFactory', () => {
    it('throws error when not authenticated', async () => {
      mockIsAuthenticated.value = false
      const cloudBackup = useCloudBackup()

      await expect(cloudBackup.restoreFactory('Save1', 'test.sptrak')).rejects.toThrow(
        CLOUD_SYNC_ERRORS.NOT_AUTHENTICATED,
      )
    })

    it('throws error when file not found', async () => {
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([])

      const cloudBackup = useCloudBackup()

      await expect(cloudBackup.restoreFactory('Save1', 'missing.sptrak')).rejects.toThrow(
        CLOUD_SYNC_ERRORS.FILE_NOT_FOUND('missing.sptrak'),
      )
    })

    it('throws error when factory name already exists', async () => {
      mockFactories.value = { ExistingFactory: {} as Factory }
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([{ id: 'file-123' } as any])
      mockUseGoogleDrive.downloadFile.mockResolvedValue(
        JSON.stringify({
          metadata: {
            version: '1.0',
            instanceId: 'other-instance',
            lastModified: '2023-01-01T00:00:00Z',
            factoryName: 'ExistingFactory',
            namespace: 'Save1',
          },
          factory: {
            name: 'ExistingFactory',
            icon: 'icon.png',
            floors: [],
            recipeLinks: {},
          },
        }),
      )

      const cloudBackup = useCloudBackup()

      await expect(cloudBackup.restoreFactory('Save1', 'test.sptrak')).rejects.toThrow(
        'A factory named "ExistingFactory" already exists',
      )
    })

    // CLAUDE: same with this, just check sync status elsewhere?
    it('restores factory with correct sync status', async () => {
      mockFactories.value = {}
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([{ id: 'file-123' } as any])
      mockUseGoogleDrive.downloadFile.mockResolvedValue(
        JSON.stringify({
          metadata: {
            version: '1.0',
            instanceId: 'other-instance',
            lastModified: '2023-01-01T00:00:00Z',
            factoryName: 'RestoredFactory',
            namespace: 'Save1',
          },
          factory: {
            name: 'RestoredFactory',
            icon: 'icon.png',
            floors: [],
            recipeLinks: {},
          },
        }),
      )

      const cloudBackup = useCloudBackup()
      await cloudBackup.restoreFactory('Save1', 'test.sptrak')

      const restored = mockFactories.value.RestoredFactory
      expect(restored).toBeDefined()
      expect(restored.syncStatus?.status).toBe(FactorySyncStatus.CLEAN)
      expect(restored.syncStatus?.lastSynced).toBe('2023-01-01T00:00:00Z')
    })

    it('uses importAlias when provided', async () => {
      mockFactories.value = {}
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([{ id: 'file-123' } as any])
      mockUseGoogleDrive.downloadFile.mockResolvedValue(
        JSON.stringify({
          metadata: {
            version: '1.0',
            instanceId: 'other-instance',
            lastModified: '2023-01-01T00:00:00Z',
            factoryName: 'OriginalName',
            namespace: 'Save1',
          },
          factory: {
            name: 'OriginalName',
            icon: 'icon.png',
            floors: [],
            recipeLinks: {},
          },
        }),
      )

      const cloudBackup = useCloudBackup()
      await cloudBackup.restoreFactory('Save1', 'test.sptrak', 'NewName')

      expect(mockFactories.value.NewName).toBeDefined()
      expect(mockFactories.value.OriginalName).toBeUndefined()
      expect(mockFactories.value.NewName.name).toBe('NewName')
    })
  })

  describe('listBackups', () => {
    it('throws error when not authenticated', async () => {
      mockIsAuthenticated.value = false
      const cloudBackup = useCloudBackup()

      await expect(cloudBackup.listBackups('Save1')).rejects.toThrow(
        CLOUD_SYNC_ERRORS.NOT_AUTHENTICATED,
      )
    })

    it('returns empty array when namespace is empty', async () => {
      const cloudBackup = useCloudBackup()
      const result = await cloudBackup.listBackups()

      expect(result).toEqual([])
    })

    it('returns empty array when folder does not exist', async () => {
      mockUseGoogleDrive.ensureFolderPath.mockRejectedValue(new Error('Folder not found'))

      const cloudBackup = useCloudBackup()
      const result = await cloudBackup.listBackups('Save1')

      expect(result).toEqual([])
    })

    it('returns list of sptrak files', async () => {
      const mockFiles = [
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
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue(mockFiles)

      const cloudBackup = useCloudBackup()
      const result = await cloudBackup.listBackups('Save1')

      expect(result).toEqual(mockFiles)
      expect(mockUseGoogleDrive.listFiles).toHaveBeenCalledWith('folder-123', "name contains '.sptrak'")
    })

    it('uses auto-sync namespace when not provided', async () => {
      mockCloudSyncStore.autoSync.namespace = 'AutoSyncNamespace'
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([])

      const cloudBackup = useCloudBackup()
      await cloudBackup.listBackups()

      expect(mockUseGoogleDrive.ensureFolderPath).toHaveBeenCalledWith([
        'SatisProdTrak',
        'AutoSyncNamespace',
      ])
    })
  })

  describe('deleteBackup', () => {
    it('throws error when not authenticated', async () => {
      mockIsAuthenticated.value = false
      const cloudBackup = useCloudBackup()

      await expect(cloudBackup.deleteBackup('Save1', 'test.sptrak')).rejects.toThrow(
        CLOUD_SYNC_ERRORS.NOT_AUTHENTICATED,
      )
    })

    it('throws error when file not found', async () => {
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([])

      const cloudBackup = useCloudBackup()

      await expect(cloudBackup.deleteBackup('Save1', 'missing.sptrak')).rejects.toThrow(
        CLOUD_SYNC_ERRORS.FILE_NOT_FOUND('missing.sptrak'),
      )
    })

    it('deletes file successfully', async () => {
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([{ id: 'file-789' } as any])
      mockUseGoogleDrive.deleteFile.mockResolvedValue(undefined)

      const cloudBackup = useCloudBackup()
      await cloudBackup.deleteBackup('Save1', 'test.sptrak')

      expect(mockUseGoogleDrive.deleteFile).toHaveBeenCalledWith('file-789')
    })
  })
})