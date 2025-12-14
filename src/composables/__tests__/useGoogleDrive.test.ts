import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Mock the googleApiClient module
vi.mock('@/services/googleApiClient', async () => {
  const { mockGoogleApiClient } = await import('@/__tests__/fixtures/services/googleApiClient')
  return {
    googleApiClient: mockGoogleApiClient,
  }
})

// Setup global Google API mocks
import { mockGapi, mockTokenClient, mockGoogleAuth } from '@/__tests__/fixtures/services/googleApi'
import { mockGoogleApiClient } from '@/__tests__/fixtures/services/googleApiClient'

global.gapi = mockGapi
global.google = { accounts: { oauth2: mockGoogleAuth } }
global.fetch = vi.fn()

import { useGoogleDrive } from '@/composables/useGoogleDrive'
import { useGoogleAuthStore } from '@/stores/googleAuth'

describe('useGoogleDrive', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Setup default mock returns for googleApiClient
    mockGoogleApiClient.initialize.mockResolvedValue(undefined)
    mockGoogleApiClient.getTokenClient.mockReturnValue(mockTokenClient)
    mockGoogleApiClient.getDriveClient.mockReturnValue(mockGapi.client.drive)
    mockGoogleApiClient.getGoogleAuth.mockReturnValue(mockGoogleAuth)
    mockGoogleApiClient.getIsInitialized.mockReturnValue(true)
    mockGoogleApiClient.setAccessToken.mockReturnValue(undefined)
    mockTokenClient.callback = null

    // Setup googleAuthStore with mock token
    const googleAuthStore = useGoogleAuthStore()
    googleAuthStore.setToken('mock-token', Date.now() + 3600000)
  })

  describe('uploadFile', () => {
    it('should create file and update with content', async () => {
      // Mock file creation
      mockGapi.client.drive.files.create.mockResolvedValue({
        result: { id: 'file-abc' },
      })
      // Mock file update (fetch)
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
      } as Response)
      const googleDrive = useGoogleDrive()

      const fileId = await googleDrive.uploadFile('test.sptrak', '{}')

      expect(fileId).toBe('file-abc')
      expect(mockGapi.client.drive.files.create).toHaveBeenCalled()
      expect(fetch).toHaveBeenCalled()
    })

    it('should throw on update failure', async () => {
      mockGapi.client.drive.files.create.mockResolvedValue({
        result: { id: 'file-abc' },
      })
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        statusText: 'Forbidden',
        text: async () => 'Error details',
      } as Response)
      const googleDrive = useGoogleDrive()

      await expect(googleDrive.uploadFile('test.sptrak', '{}')).rejects.toThrow('Forbidden')
    })
  })

  describe('listFiles', () => {
    it('should return transformed file list', async () => {
      mockGapi.client.drive.files.list.mockResolvedValue({
        result: {
          files: [
            {
              id: '1',
              name: 'test.sptrak',
              mimeType: 'application/json',
              modifiedTime: '2023-01-01',
              createdTime: '2023-01-01',
              size: '100',
            },
          ],
        },
      })
      const googleDrive = useGoogleDrive()

      const files = await googleDrive.listFiles()

      expect(files).toHaveLength(1)
      expect(files[0].name).toBe('test.sptrak')
    })
  })

  describe('downloadFile', () => {
    it('should download and return file content', async () => {
      mockGapi.client.drive.files.get.mockResolvedValue({
        body: '{"test": "data"}',
      })
      const googleDrive = useGoogleDrive()

      const content = await googleDrive.downloadFile('file-123')

      expect(content).toBe('{"test": "data"}')
      expect(mockGapi.client.drive.files.get).toHaveBeenCalledWith({
        fileId: 'file-123',
        alt: 'media',
      })
    })
  })

  describe('deleteFile', () => {
    it('should delete file by ID', async () => {
      mockGapi.client.drive.files.delete.mockResolvedValue(undefined)
      const googleDrive = useGoogleDrive()

      await googleDrive.deleteFile('file-456')

      expect(mockGapi.client.drive.files.delete).toHaveBeenCalledWith({ fileId: 'file-456' })
    })
  })

  describe('getFileMetadata', () => {
    it('should return file metadata', async () => {
      mockGapi.client.drive.files.get.mockResolvedValue({
        result: {
          id: 'file-789',
          name: 'test.sptrak',
          mimeType: 'application/json',
          modifiedTime: '2023-01-01',
          createdTime: '2023-01-01',
          size: '500',
        },
      })
      const googleDrive = useGoogleDrive()

      const metadata = await googleDrive.getFileMetadata('file-789')

      expect(metadata.id).toBe('file-789')
      expect(metadata.name).toBe('test.sptrak')
    })
  })

  describe('updateFile', () => {
    it('should update file content', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
      } as Response)
      const googleDrive = useGoogleDrive()

      await googleDrive.updateFile('file-123', '{"updated": true}')

      expect(fetch).toHaveBeenCalled()
    })

    it('should throw on update failure', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
        text: async () => 'File not found',
      } as Response)
      const googleDrive = useGoogleDrive()

      await expect(googleDrive.updateFile('file-123', '{}')).rejects.toThrow('Not Found')
    })
  })

  describe('createFolder', () => {
    it('should create folder and return ID', async () => {
      mockGapi.client.drive.files.create.mockResolvedValue({
        result: { id: 'folder-abc' },
      })
      const googleDrive = useGoogleDrive()

      const folderId = await googleDrive.createFolder('NewFolder')

      expect(folderId).toBe('folder-abc')
    })
  })

  describe('findOrCreateFolder', () => {
    it('should return existing folder ID if found', async () => {
      mockGapi.client.drive.files.list.mockResolvedValue({
        result: { files: [{ id: 'existing-123' }] },
      })
      const googleDrive = useGoogleDrive()

      const folderId = await googleDrive.findOrCreateFolder('MyFolder')

      expect(folderId).toBe('existing-123')
      expect(mockGapi.client.drive.files.create).not.toHaveBeenCalled()
    })

    it('should create new folder if not found', async () => {
      mockGapi.client.drive.files.list.mockResolvedValue({
        result: { files: [] },
      })
      mockGapi.client.drive.files.create.mockResolvedValue({
        result: { id: 'new-456' },
      })
      const googleDrive = useGoogleDrive()

      const folderId = await googleDrive.findOrCreateFolder('MyFolder')

      expect(folderId).toBe('new-456')
      expect(mockGapi.client.drive.files.create).toHaveBeenCalled()
    })
  })

  describe('ensureFolderPath', () => {
    it('should create nested folder path', async () => {
      mockGapi.client.drive.files.list
        .mockResolvedValueOnce({ result: { files: [] } })
        .mockResolvedValueOnce({ result: { files: [] } })
      mockGapi.client.drive.files.create
        .mockResolvedValueOnce({ result: { id: 'root-folder' } })
        .mockResolvedValueOnce({ result: { id: 'child-folder' } })
      const googleDrive = useGoogleDrive()

      const folderId = await googleDrive.ensureFolderPath(['Parent', 'Child'])

      expect(folderId).toBe('child-folder')
      expect(mockGapi.client.drive.files.create).toHaveBeenCalledTimes(2)
    })

    it('should throw if path creation fails', async () => {
      const googleDrive = useGoogleDrive()

      await expect(googleDrive.ensureFolderPath([])).rejects.toThrow('Failed to create folder path')
    })
  })

  describe('listFolders', () => {
    it('should list folders using listFiles', async () => {
      mockGapi.client.drive.files.list.mockResolvedValue({
        result: {
          files: [
            {
              id: 'folder-1',
              name: 'Folder1',
              mimeType: 'application/vnd.google-apps.folder',
              modifiedTime: '2023-01-01',
              createdTime: '2023-01-01',
            },
          ],
        },
      })
      const googleDrive = useGoogleDrive()

      const folders = await googleDrive.listFolders()

      expect(folders).toHaveLength(1)
      expect(folders[0].name).toBe('Folder1')
    })
  })
})
