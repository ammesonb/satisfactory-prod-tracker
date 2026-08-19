import { vi } from 'vitest'
import { ref } from 'vue'

// Mock functions for useCloudBackup composable
export const mockCanSync = ref(true)
export const mockBackupFactory = vi.fn()
export const mockRestoreFactory = vi.fn()
export const mockListBackups = vi.fn()
export const mockDeleteBackup = vi.fn()
export const mockFindCloudFile = vi.fn()
export const mockDownloadSptrakFile = vi.fn()
export const mockDetectConflict = vi.fn()
export const mockRenameBackup = vi.fn()

export const mockUseCloudBackup = vi.fn(() => ({
  canSync: mockCanSync,
  backupFactory: mockBackupFactory,
  restoreFactory: mockRestoreFactory,
  listBackups: mockListBackups,
  deleteBackup: mockDeleteBackup,
  findCloudFile: mockFindCloudFile,
  downloadSptrakFile: mockDownloadSptrakFile,
  detectConflict: mockDetectConflict,
  renameBackup: mockRenameBackup,
}))
