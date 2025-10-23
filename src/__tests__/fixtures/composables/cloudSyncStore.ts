import { ref } from 'vue'
import { vi } from 'vitest'

// Create reactive refs that persist across calls for key properties
export const mockIsAuthenticated = ref(false)
export const mockAutoSyncEnabled = ref(false)
export const mockAutoSyncNamespace = ref('')
export const mockSelectedFactories = ref<string[]>([])

// Explicit vi.fn() for all methods
export const mockIsFactoryAutoSynced = vi.fn((factoryName: string) => {
  return mockSelectedFactories.value.includes(factoryName)
})
export const mockAuthenticate = vi.fn()
export const mockRefreshToken = vi.fn()
export const mockSignOut = vi.fn()
export const mockEnableAutoSync = vi.fn()
export const mockDisableAutoSync = vi.fn()
export const mockChangeNamespace = vi.fn()
export const mockAddFactoryToAutoSync = vi.fn()
export const mockRemoveFactoryFromAutoSync = vi.fn()
export const mockBackupFactory = vi.fn()
export const mockRestoreFactory = vi.fn()
export const mockListBackups = vi.fn()
export const mockDeleteBackup = vi.fn()
export const mockPerformAutoSave = vi.fn()
export const mockCheckForConflicts = vi.fn()
export const mockResolveConflict = vi.fn()
export const mockSetGlobalError = vi.fn()
export const mockClearGlobalError = vi.fn()
export const mockSuspendAutoSync = vi.fn()
export const mockResumeAutoSync = vi.fn()
export const mockSetDisplayId = vi.fn()

export const mockCloudSyncStore = {
  // Getters
  get isAuthenticated() {
    return mockIsAuthenticated.value
  },
  get isConfigured() {
    return mockIsAuthenticated.value
  },
  isFactoryAutoSynced: mockIsFactoryAutoSynced,

  // State
  accessToken: null,
  tokenExpiry: null,
  instanceId: 'test-instance-id',
  displayId: 'Test Device',
  autoSync: {
    enabled: mockAutoSyncEnabled.value,
    namespace: mockAutoSyncNamespace.value,
    selectedFactories: mockSelectedFactories.value,
  },
  autoSyncSuspended: false,
  finalGlobalError: null,

  // Actions
  authenticate: mockAuthenticate,
  refreshToken: mockRefreshToken,
  signOut: mockSignOut,
  enableAutoSync: mockEnableAutoSync,
  disableAutoSync: mockDisableAutoSync,
  changeNamespace: mockChangeNamespace,
  addFactoryToAutoSync: mockAddFactoryToAutoSync,
  removeFactoryFromAutoSync: mockRemoveFactoryFromAutoSync,
  backupFactory: mockBackupFactory,
  restoreFactory: mockRestoreFactory,
  listBackups: mockListBackups,
  deleteBackup: mockDeleteBackup,
  performAutoSave: mockPerformAutoSave,
  checkForConflicts: mockCheckForConflicts,
  resolveConflict: mockResolveConflict,
  setGlobalError: mockSetGlobalError,
  clearGlobalError: mockClearGlobalError,
  suspendAutoSync: mockSuspendAutoSync,
  resumeAutoSync: mockResumeAutoSync,
  setDisplayId: mockSetDisplayId,
}
