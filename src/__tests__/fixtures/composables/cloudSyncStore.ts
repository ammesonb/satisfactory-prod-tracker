import { vi } from 'vitest'
import { ref } from 'vue'

// Create reactive refs that persist across calls for key properties
export const mockAutoSyncEnabled = ref(false)
export const mockAutoSyncNamespace = ref('')
export const mockSelectedFactories = ref<string[]>([])

// Explicit vi.fn() for all methods
export const mockIsFactoryAutoSynced = vi.fn((factoryName: string) => {
  return mockSelectedFactories.value.includes(factoryName)
})
export const mockAuthenticate = vi.fn()
export const mockRefreshAuth = vi.fn()
export const mockSignOut = vi.fn()
export const mockEnableAutoSync = vi.fn()
export const mockDisableAutoSync = vi.fn()
export const mockChangeNamespace = vi.fn()
export const mockAddFactoryToAutoSync = vi.fn()
export const mockRemoveFactoryFromAutoSync = vi.fn()
export const mockPerformAutoSave = vi.fn()
export const mockCheckForConflicts = vi.fn()
export const mockResolveConflict = vi.fn()
export const mockSetGlobalError = vi.fn()
export const mockClearGlobalError = vi.fn()
export const mockSuspendAutoSync = vi.fn()
export const mockResumeAutoSync = vi.fn()
export const mockSetDisplayId = vi.fn()
export const mockInitializeInstanceId = vi.fn()

export const mockCloudSyncStore = {
  // Getters
  isFactoryAutoSynced: mockIsFactoryAutoSynced,

  // State
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
  refreshAuth: mockRefreshAuth,
  signOut: mockSignOut,
  enableAutoSync: mockEnableAutoSync,
  disableAutoSync: mockDisableAutoSync,
  changeNamespace: mockChangeNamespace,
  addFactoryToAutoSync: mockAddFactoryToAutoSync,
  removeFactoryFromAutoSync: mockRemoveFactoryFromAutoSync,
  performAutoSave: mockPerformAutoSave,
  checkForConflicts: mockCheckForConflicts,
  resolveConflict: mockResolveConflict,
  setGlobalError: mockSetGlobalError,
  clearGlobalError: mockClearGlobalError,
  suspendAutoSync: mockSuspendAutoSync,
  resumeAutoSync: mockResumeAutoSync,
  setDisplayId: mockSetDisplayId,
  initializeInstanceId: mockInitializeInstanceId,
}
