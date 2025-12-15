import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useAutoSync } from '@/composables/useAutoSync'
import { FactorySyncStatus } from '@/types/cloudSync'

vi.mock('@/composables/useCloudBackup', async () => {
  const { mockUseCloudBackup } = await import('@/__tests__/fixtures/composables/useCloudBackup')
  return {
    useCloudBackup: mockUseCloudBackup,
  }
})

vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return {
    getStores: mockGetStores,
  }
})

import {
  mockBackupFactory,
  mockDetectConflict,
} from '@/__tests__/fixtures/composables/useCloudBackup'
import { mockCloudSyncStore } from '@/__tests__/fixtures/composables/cloudSyncStore'
import { mockIsAuthenticated } from '@/__tests__/fixtures/composables/googleAuthStore'
import {
  mockFactories,
  mockSetSyncError,
  mockSetSyncConflict,
} from '@/__tests__/fixtures/composables/factoryStore'
import type { Factory } from '@/types/factory'

function createTestFactory(
  name: string,
  syncStatus?: FactorySyncStatus,
  lastSynced?: string,
): Factory {
  return {
    name,
    icon: 'test-icon',
    floors: [],
    recipeLinks: {},
    syncStatus: syncStatus
      ? {
          status: syncStatus,
          lastSynced: lastSynced ?? null,
          lastError: null,
        }
      : undefined,
  }
}

describe('useAutoSync', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.useFakeTimers()

    // Reset store state
    mockCloudSyncStore.autoSync.enabled = true
    mockCloudSyncStore.autoSync.namespace = 'TestNamespace'
    mockCloudSyncStore.autoSync.selectedFactories = []
    mockCloudSyncStore.autoSyncSuspended = false
    mockIsAuthenticated.mockReturnValue(true)

    mockFactories.value = {}

    mockBackupFactory.mockResolvedValue(undefined)
    mockDetectConflict.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('canAutoSync conditions', () => {
    it('does not schedule save when auto-sync is disabled', () => {
      mockCloudSyncStore.autoSync.enabled = false
      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY),
      }

      const autoSync = useAutoSync()
      autoSync.initialize()

      vi.advanceTimersByTime(15000)

      expect(mockBackupFactory).not.toHaveBeenCalled()
    })

    it('does not schedule save when auto-sync is suspended', () => {
      mockCloudSyncStore.autoSyncSuspended = true
      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY),
      }

      const autoSync = useAutoSync()
      autoSync.initialize()

      vi.advanceTimersByTime(15000)

      expect(mockBackupFactory).not.toHaveBeenCalled()
    })

    it('does not schedule save when not authenticated', () => {
      mockIsAuthenticated.mockReturnValue(false)
      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY),
      }

      const autoSync = useAutoSync()
      autoSync.initialize()

      vi.advanceTimersByTime(15000)

      expect(mockBackupFactory).not.toHaveBeenCalled()
    })

    it('does not schedule save when namespace is empty', () => {
      mockCloudSyncStore.autoSync.namespace = ''
      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY),
      }

      const autoSync = useAutoSync()
      autoSync.initialize()

      vi.advanceTimersByTime(15000)

      expect(mockBackupFactory).not.toHaveBeenCalled()
    })
  })

  describe('dirty factory detection', () => {
    it('only saves factories that are in selectedFactories', async () => {
      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY),
        Factory2: createTestFactory('Factory2', FactorySyncStatus.DIRTY),
      }

      const autoSync = useAutoSync()
      autoSync.initialize()
      autoSync.scheduleSave()

      await vi.advanceTimersByTimeAsync(15000)

      expect(mockBackupFactory).toHaveBeenCalledTimes(1)
      expect(mockBackupFactory).toHaveBeenCalledWith('TestNamespace', 'Factory1')
    })

    it('only saves factories with DIRTY status', async () => {
      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1', 'Factory2', 'Factory3']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY),
        Factory2: createTestFactory('Factory2', FactorySyncStatus.CLEAN),
        Factory3: createTestFactory('Factory3', FactorySyncStatus.CONFLICT),
      }

      const autoSync = useAutoSync()
      autoSync.initialize()
      autoSync.scheduleSave()

      await vi.advanceTimersByTimeAsync(15000)

      expect(mockBackupFactory).toHaveBeenCalledTimes(1)
      expect(mockBackupFactory).toHaveBeenCalledWith('TestNamespace', 'Factory1')
    })

    it('does not save when no factories are dirty', async () => {
      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.CLEAN),
      }

      const autoSync = useAutoSync()
      autoSync.initialize()
      autoSync.scheduleSave()

      await vi.advanceTimersByTimeAsync(15000)

      expect(mockBackupFactory).not.toHaveBeenCalled()
    })
  })

  describe('debouncing', () => {
    it('debounces multiple scheduleSave calls', async () => {
      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY),
      }

      const autoSync = useAutoSync()
      autoSync.initialize()

      autoSync.scheduleSave()
      vi.advanceTimersByTime(5000)
      autoSync.scheduleSave()
      vi.advanceTimersByTime(5000)
      autoSync.scheduleSave()

      await vi.advanceTimersByTimeAsync(15000)

      expect(mockBackupFactory).toHaveBeenCalledTimes(1)
    })

    it('waits full debounce period after last call', async () => {
      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY),
      }

      const autoSync = useAutoSync()
      autoSync.initialize()
      autoSync.scheduleSave()

      vi.advanceTimersByTime(9000)
      expect(mockBackupFactory).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(2000)
      expect(mockBackupFactory).toHaveBeenCalledTimes(1)
    })
  })

  describe('conflict detection', () => {
    it('checks for conflict before saving', async () => {
      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY),
      }

      const autoSync = useAutoSync()
      autoSync.initialize()
      autoSync.scheduleSave()

      await vi.advanceTimersByTimeAsync(15000)

      expect(mockDetectConflict).toHaveBeenCalledWith('TestNamespace', 'Factory1')
      expect(mockBackupFactory).toHaveBeenCalled()
    })

    it('sets conflict state and skips save when conflict detected', async () => {
      const conflictInfo = {
        factoryName: 'Factory1',
        cloudTimestamp: '2024-01-01T00:00:00Z',
        cloudInstanceId: 'other-instance',
        cloudDisplayId: 'Other Device',
        localTimestamp: '2024-01-01T00:00:00Z',
      }
      mockDetectConflict.mockResolvedValue(conflictInfo)

      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY),
      }

      const autoSync = useAutoSync()
      autoSync.initialize()
      autoSync.scheduleSave()

      await vi.advanceTimersByTimeAsync(15000)

      expect(mockSetSyncConflict).toHaveBeenCalledWith('Factory1', conflictInfo)
      expect(mockCloudSyncStore.setGlobalError).toHaveBeenCalled()
      expect(mockBackupFactory).not.toHaveBeenCalled()
    })

    it('skips conflict check if recently synced', async () => {
      const recentTime = new Date(Date.now() - 30000).toISOString() // 30 seconds ago
      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY, recentTime),
      }

      const autoSync = useAutoSync()
      autoSync.initialize()
      autoSync.scheduleSave()

      await vi.advanceTimersByTimeAsync(15000)

      expect(mockDetectConflict).not.toHaveBeenCalled()
      expect(mockBackupFactory).toHaveBeenCalled()
    })
  })

  describe('retry logic', () => {
    it('retries on failure with exponential backoff', async () => {
      mockBackupFactory
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined)

      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY),
      }

      const autoSync = useAutoSync()
      autoSync.initialize()
      autoSync.scheduleSave()

      // Initial debounce
      await vi.advanceTimersByTimeAsync(10000)
      expect(mockBackupFactory).toHaveBeenCalledTimes(1)

      // First retry after 500ms
      await vi.advanceTimersByTimeAsync(500)
      expect(mockBackupFactory).toHaveBeenCalledTimes(2)

      // Second retry after 2000ms
      await vi.advanceTimersByTimeAsync(2000)
      expect(mockBackupFactory).toHaveBeenCalledTimes(3)
    })

    it('sets error state after max retries', async () => {
      mockBackupFactory.mockRejectedValue(new Error('Persistent error'))

      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY),
      }

      const autoSync = useAutoSync()
      autoSync.initialize()
      autoSync.scheduleSave()

      // Initial + 5 retries
      await vi.advanceTimersByTimeAsync(10000) // debounce
      await vi.advanceTimersByTimeAsync(500) // retry 1
      await vi.advanceTimersByTimeAsync(2000) // retry 2
      await vi.advanceTimersByTimeAsync(5000) // retry 3
      await vi.advanceTimersByTimeAsync(10000) // retry 4
      await vi.advanceTimersByTimeAsync(20000) // retry 5

      expect(mockBackupFactory).toHaveBeenCalledTimes(6)
      expect(mockSetSyncError).toHaveBeenCalledWith('Factory1', 'Persistent error')
      expect(mockCloudSyncStore.setGlobalError).toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('clears debounce timer on cleanup', async () => {
      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY),
      }

      const autoSync = useAutoSync()
      autoSync.initialize()
      autoSync.scheduleSave()

      vi.advanceTimersByTime(5000)
      autoSync.cleanup()

      await vi.advanceTimersByTimeAsync(15000)

      expect(mockBackupFactory).not.toHaveBeenCalled()
    })
  })

  describe('multiple factories', () => {
    it('saves multiple dirty factories sequentially', async () => {
      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1', 'Factory2', 'Factory3']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY),
        Factory2: createTestFactory('Factory2', FactorySyncStatus.DIRTY),
        Factory3: createTestFactory('Factory3', FactorySyncStatus.DIRTY),
      }

      const autoSync = useAutoSync()
      autoSync.initialize()
      autoSync.scheduleSave()

      await vi.advanceTimersByTimeAsync(15000)

      expect(mockBackupFactory).toHaveBeenCalledTimes(3)
      expect(mockBackupFactory).toHaveBeenNthCalledWith(1, 'TestNamespace', 'Factory1')
      expect(mockBackupFactory).toHaveBeenNthCalledWith(2, 'TestNamespace', 'Factory2')
      expect(mockBackupFactory).toHaveBeenNthCalledWith(3, 'TestNamespace', 'Factory3')
    })

    it('stops saving if auto-sync becomes disabled mid-save', async () => {
      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1', 'Factory2', 'Factory3']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY),
        Factory2: createTestFactory('Factory2', FactorySyncStatus.DIRTY),
        Factory3: createTestFactory('Factory3', FactorySyncStatus.DIRTY),
      }

      mockBackupFactory.mockImplementation(async () => {
        // Disable auto-sync after first save
        mockCloudSyncStore.autoSync.enabled = false
      })

      const autoSync = useAutoSync()
      autoSync.initialize()
      autoSync.scheduleSave()

      await vi.advanceTimersByTimeAsync(15000)

      expect(mockBackupFactory).toHaveBeenCalledTimes(1)
    })
  })

  describe('guard conditions during save', () => {
    it('skips factory that no longer exists', async () => {
      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1', 'Factory2']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY),
      }

      const autoSync = useAutoSync()
      autoSync.initialize()
      autoSync.scheduleSave()

      await vi.advanceTimersByTimeAsync(15000)

      expect(mockBackupFactory).toHaveBeenCalledTimes(1)
      expect(mockBackupFactory).toHaveBeenCalledWith('TestNamespace', 'Factory1')
    })

    it('skips factory removed from selectedFactories during save', async () => {
      mockCloudSyncStore.autoSync.selectedFactories = ['Factory1', 'Factory2']
      mockFactories.value = {
        Factory1: createTestFactory('Factory1', FactorySyncStatus.DIRTY),
        Factory2: createTestFactory('Factory2', FactorySyncStatus.DIRTY),
      }

      mockBackupFactory.mockImplementation(async () => {
        // Remove Factory2 from selection after first save
        mockCloudSyncStore.autoSync.selectedFactories = ['Factory1']
      })

      const autoSync = useAutoSync()
      autoSync.initialize()
      autoSync.scheduleSave()

      await vi.advanceTimersByTimeAsync(15000)

      expect(mockBackupFactory).toHaveBeenCalledTimes(1)
    })
  })
})
