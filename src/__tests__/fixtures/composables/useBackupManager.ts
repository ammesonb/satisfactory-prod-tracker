import { ref } from 'vue'
import { vi } from 'vitest'

import type { GoogleDriveFile } from '@/types/cloudSync'

// Mock functions
export const mockPerformBackup = vi.fn()
export const mockRestoreBackup = vi.fn()
export const mockDeleteBackup = vi.fn()
export const mockRefreshBackupList = vi.fn()

// Mock state refs
export const mockLoadingBackups = ref(false)
export const mockBackupFiles = ref<GoogleDriveFile[]>([])
export const mockSelectedFactoriesForBackup = ref<string[]>([])
export const mockCanBackup = ref(false)

export const mockUseBackupManager = vi.fn(() => ({
  loadingBackups: mockLoadingBackups,
  backupFiles: mockBackupFiles,
  selectedFactoriesForBackup: mockSelectedFactoriesForBackup,
  canBackup: mockCanBackup,
  performBackup: mockPerformBackup,
  restoreBackup: mockRestoreBackup,
  deleteBackup: mockDeleteBackup,
  refreshBackupList: mockRefreshBackupList,
}))