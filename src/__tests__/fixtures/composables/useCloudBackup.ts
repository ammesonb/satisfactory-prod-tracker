import { vi } from 'vitest'

// Mock functions for useCloudBackup composable
export const mockBackupFactory = vi.fn()
export const mockRestoreFactory = vi.fn()
export const mockListBackups = vi.fn()
export const mockDeleteBackup = vi.fn()

export const mockUseCloudBackup = {
  backupFactory: mockBackupFactory,
  restoreFactory: mockRestoreFactory,
  listBackups: mockListBackups,
  deleteBackup: mockDeleteBackup,
}
