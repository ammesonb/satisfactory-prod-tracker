import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGapi = {
  load: vi.fn(),
  client: {
    init: vi.fn(),
    drive: {
      files: {
        get: vi.fn(),
        list: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
    },
  },
  auth2: {
    getAuthInstance: vi.fn(),
  },
  auth: {
    getToken: vi.fn(),
  },
}

const mockAuthInstance = {
  isSignedIn: { get: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
  currentUser: { get: vi.fn() },
}

const mockUser = {
  getAuthResponse: vi.fn(),
  reloadAuthResponse: vi.fn(),
}

declare global {
  var gapi: typeof mockGapi
}

global.gapi = mockGapi
global.fetch = vi.fn()

import { useGoogleDrive } from '@/composables/useGoogleDrive'

describe('useGoogleDrive', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGapi.load.mockImplementation((_apis, callback) => callback())
    mockGapi.client.init.mockResolvedValue(undefined)
    mockGapi.auth2.getAuthInstance.mockReturnValue(mockAuthInstance)
    mockAuthInstance.isSignedIn.get.mockReturnValue(false)
    mockGapi.auth.getToken.mockReturnValue({ access_token: 'test-token' })
  })

  describe('initGoogleAuth', () => {
    it('should initialize and load gapi', async () => {
      const googleDrive = useGoogleDrive()
      await googleDrive.initGoogleAuth()

      expect(mockGapi.load).toHaveBeenCalledWith('client:auth2', expect.any(Function))
      expect(mockGapi.client.init).toHaveBeenCalled()
    })

    it('should reject on initialization failure', async () => {
      mockGapi.client.init.mockRejectedValue(new Error('Init failed'))
      const googleDrive = useGoogleDrive()

      await expect(googleDrive.initGoogleAuth()).rejects.toThrow('Init failed')
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when user is signed in', () => {
      mockAuthInstance.isSignedIn.get.mockReturnValue(true)
      const googleDrive = useGoogleDrive()

      expect(googleDrive.isAuthenticated()).toBe(true)
    })

    it('should return false when not signed in', () => {
      mockAuthInstance.isSignedIn.get.mockReturnValue(false)
      const googleDrive = useGoogleDrive()

      expect(googleDrive.isAuthenticated()).toBe(false)
    })

    it('should handle missing gapi gracefully', () => {
      const orig = global.gapi
      // @ts-expect-error - Testing undefined case
      global.gapi = undefined
      const googleDrive = useGoogleDrive()

      expect(googleDrive.isAuthenticated()).toBe(false)
      global.gapi = orig
    })
  })

  describe('signInWithGoogle', () => {
    it('should return access token on successful sign in', async () => {
      mockUser.getAuthResponse.mockReturnValue({
        access_token: 'token123',
        expires_at: 999999,
      })
      mockAuthInstance.signIn.mockResolvedValue(mockUser)
      const googleDrive = useGoogleDrive()

      const result = await googleDrive.signInWithGoogle()

      expect(result.accessToken).toBe('token123')
      expect(result.expiresAt).toBe(999999)
    })
  })

  describe('uploadFile', () => {
    it('should upload and return file ID', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'file-abc' }),
      } as Response)
      const googleDrive = useGoogleDrive()

      const fileId = await googleDrive.uploadFile('test.sptrak', '{}')

      expect(fileId).toBe('file-abc')
    })

    it('should throw on upload failure', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        statusText: 'Forbidden',
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

  describe('signOut', () => {
    it('should call auth instance signOut', async () => {
      const googleDrive = useGoogleDrive()

      await googleDrive.signOut()

      expect(mockAuthInstance.signOut).toHaveBeenCalled()
    })
  })

  describe('refreshToken', () => {
    it('should reload auth response and return new token', async () => {
      mockUser.reloadAuthResponse.mockResolvedValue({
        access_token: 'new-token-789',
        expires_at: 777777,
      })
      mockAuthInstance.currentUser.get.mockReturnValue(mockUser)
      const googleDrive = useGoogleDrive()

      const result = await googleDrive.refreshToken()

      expect(result.accessToken).toBe('new-token-789')
      expect(result.expiresAt).toBe(777777)
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
