import { vi } from 'vitest'

// Mock functions for useGoogleDrive composable (Drive operations only)
export const mockUploadFile = vi.fn()
export const mockDownloadFile = vi.fn()
export const mockDeleteFile = vi.fn()
export const mockListFiles = vi.fn()
export const mockGetFileMetadata = vi.fn()
export const mockUpdateFile = vi.fn()
export const mockCreateFolder = vi.fn()
export const mockFindOrCreateFolder = vi.fn()
export const mockEnsureFolderPath = vi.fn()
export const mockListFolders = vi.fn()
export const mockRenameFile = vi.fn()

export const mockUseGoogleDrive = {
  uploadFile: mockUploadFile,
  downloadFile: mockDownloadFile,
  deleteFile: mockDeleteFile,
  listFiles: mockListFiles,
  getFileMetadata: mockGetFileMetadata,
  updateFile: mockUpdateFile,
  createFolder: mockCreateFolder,
  findOrCreateFolder: mockFindOrCreateFolder,
  ensureFolderPath: mockEnsureFolderPath,
  listFolders: mockListFolders,
  renameFile: mockRenameFile,
}
