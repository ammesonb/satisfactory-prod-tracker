import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useCloudBackup } from '@/composables/useCloudBackup'
import { CLOUD_SYNC_ERRORS, FactorySyncStatus } from '@/types/cloudSync'
import type { GoogleDriveFile } from '@/types/cloudSync'
import type { Factory } from '@/types/factory'

// Mock the dependencies
vi.mock('@/composables/useGoogleDrive', async () => {
  const { mockUseGoogleDrive } = await import('@/__tests__/fixtures/composables/useGoogleDrive')
  return {
    useGoogleDrive: () => mockUseGoogleDrive,
  }
})

vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return {
    getStores: mockGetStores,
  }
})

// Import mocks after setting up mocks
import { mockUseGoogleDrive, mockRenameFile } from '@/__tests__/fixtures/composables/useGoogleDrive'
import { mockCloudSyncStore } from '@/__tests__/fixtures/composables/cloudSyncStore'
import { mockFactories } from '@/__tests__/fixtures/composables/factoryStore'
import { mockIsAuthenticated } from '@/__tests__/fixtures/composables/googleAuthStore'

describe('useCloudBackup', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Reset mock state
    mockIsAuthenticated.mockReturnValue(true)
    mockFactories.value = {}
    mockCloudSyncStore.instanceId = 'test-instance-123'
    mockCloudSyncStore.displayId = 'Test Device'
  })

  describe('backupFactory', () => {
    it('throws error when not authenticated', async () => {
      mockIsAuthenticated.mockReturnValue(false)
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

      expect(factory.syncStatus?.status).toBe(FactorySyncStatus.CLEAN)
      expect(factory.syncStatus?.lastSynced).toBeTruthy()
    })
  })

  describe('restoreFactory', () => {
    it('throws error when not authenticated', async () => {
      mockIsAuthenticated.mockReturnValue(false)
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
      mockUseGoogleDrive.listFiles.mockResolvedValue([{ id: 'file-123' } as GoogleDriveFile])
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

    it('uses importAlias when provided', async () => {
      mockFactories.value = {}
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([{ id: 'file-123' } as GoogleDriveFile])
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

      const factories = mockFactories.value as Record<string, Factory>
      expect(factories.NewName).toBeDefined()
      expect(factories.OriginalName).toBeUndefined()
      expect(factories.NewName.name).toBe('NewName')
      expect(factories.NewName.syncStatus?.status).toBe(FactorySyncStatus.CLEAN)
      expect(factories.NewName.syncStatus?.lastSynced).toBe('2023-01-01T00:00:00Z')
    })
  })

  describe('listBackups', () => {
    it('throws error when not authenticated', async () => {
      mockIsAuthenticated.mockReturnValue(false)
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
      expect(mockUseGoogleDrive.listFiles).toHaveBeenCalledWith(
        'folder-123',
        "name contains '.sptrak'",
      )
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
      mockIsAuthenticated.mockReturnValue(false)
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
      mockUseGoogleDrive.listFiles.mockResolvedValue([{ id: 'file-789' } as GoogleDriveFile])
      mockUseGoogleDrive.deleteFile.mockResolvedValue(undefined)

      const cloudBackup = useCloudBackup()
      await cloudBackup.deleteBackup('Save1', 'test.sptrak')

      expect(mockUseGoogleDrive.deleteFile).toHaveBeenCalledWith('file-789')
    })
  })

  describe('findCloudFile', () => {
    it('throws error when not authenticated', async () => {
      mockIsAuthenticated.mockReturnValue(false)
      const cloudBackup = useCloudBackup()

      await expect(cloudBackup.findCloudFile('Save1', 'MyFactory')).rejects.toThrow(
        CLOUD_SYNC_ERRORS.NOT_AUTHENTICATED,
      )
    })

    it('returns null when file not found', async () => {
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([])

      const cloudBackup = useCloudBackup()
      const result = await cloudBackup.findCloudFile('Save1', 'MyFactory')

      expect(result).toBeNull()
      expect(mockUseGoogleDrive.listFiles).toHaveBeenCalledWith(
        'folder-123',
        "name='MyFactory.sptrak'",
      )
    })

    it('returns file when found', async () => {
      const mockFile: GoogleDriveFile = {
        id: 'file-123',
        name: 'MyFactory.sptrak',
        mimeType: 'application/json',
        modifiedTime: '2023-01-01T00:00:00Z',
        createdTime: '2023-01-01T00:00:00Z',
      }
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([mockFile])

      const cloudBackup = useCloudBackup()
      const result = await cloudBackup.findCloudFile('Save1', 'MyFactory')

      expect(result).toEqual(mockFile)
    })

    it('returns null when folder path throws', async () => {
      mockUseGoogleDrive.ensureFolderPath.mockRejectedValue(new Error('Folder not found'))

      const cloudBackup = useCloudBackup()
      const result = await cloudBackup.findCloudFile('Save1', 'MyFactory')

      expect(result).toBeNull()
    })
  })

  describe('downloadSptrakFile', () => {
    it('returns null when file not found', async () => {
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([])

      const cloudBackup = useCloudBackup()
      const result = await cloudBackup.downloadSptrakFile('Save1', 'MyFactory')

      expect(result).toBeNull()
    })

    it('returns parsed sptrak file when found', async () => {
      const mockFile: GoogleDriveFile = {
        id: 'file-123',
        name: 'MyFactory.sptrak',
        mimeType: 'application/json',
        modifiedTime: '2023-01-01T00:00:00Z',
        createdTime: '2023-01-01T00:00:00Z',
      }
      const sptrakContent = {
        metadata: {
          version: '1.0',
          instanceId: 'instance-abc',
          displayId: 'Other Device',
          lastModified: '2023-01-01T00:00:00Z',
          factoryName: 'MyFactory',
          namespace: 'Save1',
        },
        factory: {
          name: 'MyFactory',
          icon: 'icon.png',
          floors: [],
          recipeLinks: {},
        },
      }
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([mockFile])
      mockUseGoogleDrive.downloadFile.mockResolvedValue(JSON.stringify(sptrakContent))

      const cloudBackup = useCloudBackup()
      const result = await cloudBackup.downloadSptrakFile('Save1', 'MyFactory')

      expect(result).toEqual(sptrakContent)
    })

    it('returns null when download fails', async () => {
      const mockFile: GoogleDriveFile = {
        id: 'file-123',
        name: 'MyFactory.sptrak',
        mimeType: 'application/json',
        modifiedTime: '2023-01-01T00:00:00Z',
        createdTime: '2023-01-01T00:00:00Z',
      }
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([mockFile])
      mockUseGoogleDrive.downloadFile.mockRejectedValue(new Error('Download failed'))

      const cloudBackup = useCloudBackup()
      const result = await cloudBackup.downloadSptrakFile('Save1', 'MyFactory')

      expect(result).toBeNull()
    })
  })

  describe('detectConflict', () => {
    it('returns null when no cloud file exists', async () => {
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([])

      const factory: Factory = {
        name: 'MyFactory',
        icon: 'icon.png',
        floors: [],
        recipeLinks: {},
      }
      mockFactories.value = { MyFactory: factory }

      const cloudBackup = useCloudBackup()
      const result = await cloudBackup.detectConflict('Save1', 'MyFactory')

      expect(result).toBeNull()
    })

    it('throws error when factory not found locally', async () => {
      const mockFile: GoogleDriveFile = {
        id: 'file-123',
        name: 'MyFactory.sptrak',
        mimeType: 'application/json',
        modifiedTime: '2023-01-01T00:00:00Z',
        createdTime: '2023-01-01T00:00:00Z',
      }
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([mockFile])
      mockFactories.value = {}

      const cloudBackup = useCloudBackup()

      await expect(cloudBackup.detectConflict('Save1', 'MyFactory')).rejects.toThrow(
        CLOUD_SYNC_ERRORS.FACTORY_NOT_FOUND('MyFactory'),
      )
    })

    it('returns null when cloud file is older than lastSynced', async () => {
      const mockFile: GoogleDriveFile = {
        id: 'file-123',
        name: 'MyFactory.sptrak',
        mimeType: 'application/json',
        modifiedTime: '2023-01-01T00:00:00Z',
        createdTime: '2023-01-01T00:00:00Z',
      }
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([mockFile])

      const factory: Factory = {
        name: 'MyFactory',
        icon: 'icon.png',
        floors: [],
        recipeLinks: {},
        syncStatus: {
          status: FactorySyncStatus.CLEAN,
          lastSynced: '2023-01-02T00:00:00Z', // Newer than cloud
          lastError: null,
        },
      }
      mockFactories.value = { MyFactory: factory }

      const cloudBackup = useCloudBackup()
      const result = await cloudBackup.detectConflict('Save1', 'MyFactory')

      expect(result).toBeNull()
      expect(mockUseGoogleDrive.downloadFile).not.toHaveBeenCalled()
    })

    it('returns null when cloud file is from same instance', async () => {
      const mockFile: GoogleDriveFile = {
        id: 'file-123',
        name: 'MyFactory.sptrak',
        mimeType: 'application/json',
        modifiedTime: '2023-01-02T00:00:00Z',
        createdTime: '2023-01-01T00:00:00Z',
      }
      const sptrakContent = {
        metadata: {
          version: '1.0',
          instanceId: 'test-instance-123', // Same as mockCloudSyncStore.instanceId
          displayId: 'Test Device',
          lastModified: '2023-01-02T00:00:00Z',
          factoryName: 'MyFactory',
          namespace: 'Save1',
        },
        factory: {
          name: 'MyFactory',
          icon: 'icon.png',
          floors: [],
          recipeLinks: {},
        },
      }
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([mockFile])
      mockUseGoogleDrive.downloadFile.mockResolvedValue(JSON.stringify(sptrakContent))

      const factory: Factory = {
        name: 'MyFactory',
        icon: 'icon.png',
        floors: [],
        recipeLinks: {},
        syncStatus: {
          status: FactorySyncStatus.CLEAN,
          lastSynced: '2023-01-01T00:00:00Z', // Older than cloud
          lastError: null,
        },
      }
      mockFactories.value = { MyFactory: factory }

      const cloudBackup = useCloudBackup()
      const result = await cloudBackup.detectConflict('Save1', 'MyFactory')

      expect(result).toBeNull()
    })

    it('returns conflict info when cloud is newer from different instance', async () => {
      const mockFile: GoogleDriveFile = {
        id: 'file-123',
        name: 'MyFactory.sptrak',
        mimeType: 'application/json',
        modifiedTime: '2023-01-02T00:00:00Z',
        createdTime: '2023-01-01T00:00:00Z',
      }
      const sptrakContent = {
        metadata: {
          version: '1.0',
          instanceId: 'other-instance-456', // Different from mockCloudSyncStore.instanceId
          displayId: 'Other Device',
          lastModified: '2023-01-02T00:00:00Z',
          factoryName: 'MyFactory',
          namespace: 'Save1',
        },
        factory: {
          name: 'MyFactory',
          icon: 'icon.png',
          floors: [],
          recipeLinks: {},
        },
      }
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([mockFile])
      mockUseGoogleDrive.downloadFile.mockResolvedValue(JSON.stringify(sptrakContent))

      const factory: Factory = {
        name: 'MyFactory',
        icon: 'icon.png',
        floors: [],
        recipeLinks: {},
        syncStatus: {
          status: FactorySyncStatus.DIRTY,
          lastSynced: '2023-01-01T00:00:00Z',
          lastError: null,
        },
      }
      mockFactories.value = { MyFactory: factory }

      const cloudBackup = useCloudBackup()
      const result = await cloudBackup.detectConflict('Save1', 'MyFactory')

      expect(result).toEqual({
        factoryName: 'MyFactory',
        cloudTimestamp: '2023-01-02T00:00:00Z',
        cloudInstanceId: 'other-instance-456',
        cloudDisplayId: 'Other Device',
        localTimestamp: '2023-01-01T00:00:00Z',
      })
    })

    it('downloads file to check when factory has never synced', async () => {
      const mockFile: GoogleDriveFile = {
        id: 'file-123',
        name: 'MyFactory.sptrak',
        mimeType: 'application/json',
        modifiedTime: '2023-01-02T00:00:00Z',
        createdTime: '2023-01-01T00:00:00Z',
      }
      const sptrakContent = {
        metadata: {
          version: '1.0',
          instanceId: 'other-instance-456',
          displayId: 'Other Device',
          lastModified: '2023-01-02T00:00:00Z',
          factoryName: 'MyFactory',
          namespace: 'Save1',
        },
        factory: {
          name: 'MyFactory',
          icon: 'icon.png',
          floors: [],
          recipeLinks: {},
        },
      }
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([mockFile])
      mockUseGoogleDrive.downloadFile.mockResolvedValue(JSON.stringify(sptrakContent))

      const factory: Factory = {
        name: 'MyFactory',
        icon: 'icon.png',
        floors: [],
        recipeLinks: {},
        // No syncStatus - never synced
      }
      mockFactories.value = { MyFactory: factory }

      const cloudBackup = useCloudBackup()
      const result = await cloudBackup.detectConflict('Save1', 'MyFactory')

      expect(mockUseGoogleDrive.downloadFile).toHaveBeenCalled()
      expect(result).not.toBeNull()
      expect(result?.localTimestamp).toBe('Never synced')
    })
  })

  describe('renameBackup', () => {
    it('does nothing when cloud file does not exist', async () => {
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([])

      const cloudBackup = useCloudBackup()
      await cloudBackup.renameBackup('Save1', 'OldFactory', 'NewFactory')

      expect(mockRenameFile).not.toHaveBeenCalled()
    })

    it('renames file when it exists', async () => {
      const mockFile: GoogleDriveFile = {
        id: 'file-123',
        name: 'OldFactory.sptrak',
        mimeType: 'application/json',
        modifiedTime: '2023-01-01T00:00:00Z',
        createdTime: '2023-01-01T00:00:00Z',
      }
      mockUseGoogleDrive.ensureFolderPath.mockResolvedValue('folder-123')
      mockUseGoogleDrive.listFiles.mockResolvedValue([mockFile])
      mockRenameFile.mockResolvedValue(undefined)

      const cloudBackup = useCloudBackup()
      await cloudBackup.renameBackup('Save1', 'OldFactory', 'NewFactory')

      expect(mockRenameFile).toHaveBeenCalledWith('file-123', 'NewFactory.sptrak')
    })
  })
})
