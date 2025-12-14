import { describe, expect, it } from 'vitest'

import { makeConflict, makeFactory, makeSyncStatus } from '@/__tests__/fixtures/data/factory'
import { FactorySyncStatus } from '@/types/cloudSync'
import type { Factory } from '@/types/factory'
import {
  FACTORY_STATUS_TOOLTIPS,
  GLOBAL_STATUS_TOOLTIPS,
  STATUS_COLORS,
  STATUS_ICONS,
  getFactorySyncTooltip,
  getGlobalSyncStatus,
  getGlobalSyncTooltip,
  getSyncStatusColor,
  getSyncStatusIcon,
  hasConflicts,
} from '@/utils/cloudSync'

// Test factories with different sync statuses
const TEST_FACTORIES = {
  noStatus: makeFactory('No Status Factory', []),
  clean: makeFactory('Clean Factory', [], {
    syncStatus: makeSyncStatus(FactorySyncStatus.CLEAN),
  }),
  dirty: makeFactory('Dirty Factory', [], {
    syncStatus: makeSyncStatus(FactorySyncStatus.DIRTY),
  }),
  saving: makeFactory('Saving Factory', [], {
    syncStatus: makeSyncStatus(FactorySyncStatus.SAVING),
  }),
  conflict: makeFactory('Conflict Factory', [], {
    syncStatus: makeSyncStatus(FactorySyncStatus.CONFLICT),
    conflict: makeConflict(),
  }),
  error: makeFactory('Error Factory', [], {
    syncStatus: makeSyncStatus(FactorySyncStatus.ERROR, { lastError: 'Test error' }),
  }),
}

describe('cloudSync utilities', () => {
  describe('getGlobalSyncStatus', () => {
    it('returns CLEAN when no factories exist', () => {
      expect(getGlobalSyncStatus({})).toBe(FactorySyncStatus.CLEAN)
    })

    it('returns CLEAN when all factories have no sync status', () => {
      const factories: Record<string, Factory> = {
        factory1: TEST_FACTORIES.noStatus,
        factory2: TEST_FACTORIES.noStatus,
      }
      expect(getGlobalSyncStatus(factories)).toBe(FactorySyncStatus.CLEAN)
    })

    it('returns CLEAN when all factories are clean', () => {
      const factories: Record<string, Factory> = {
        factory1: TEST_FACTORIES.clean,
        factory2: TEST_FACTORIES.clean,
      }
      expect(getGlobalSyncStatus(factories)).toBe(FactorySyncStatus.CLEAN)
    })

    it('prioritizes ERROR status over all others', () => {
      const factories: Record<string, Factory> = {
        factory1: TEST_FACTORIES.clean,
        factory2: TEST_FACTORIES.dirty,
        factory3: TEST_FACTORIES.error,
      }
      expect(getGlobalSyncStatus(factories)).toBe(FactorySyncStatus.ERROR)
    })

    it('prioritizes CONFLICT over SAVING, DIRTY, CLEAN', () => {
      const factories: Record<string, Factory> = {
        factory1: TEST_FACTORIES.saving,
        factory2: TEST_FACTORIES.conflict,
      }
      expect(getGlobalSyncStatus(factories)).toBe(FactorySyncStatus.CONFLICT)
    })

    it('prioritizes SAVING over DIRTY and CLEAN', () => {
      const factories: Record<string, Factory> = {
        factory1: TEST_FACTORIES.dirty,
        factory2: TEST_FACTORIES.saving,
        factory3: TEST_FACTORIES.clean,
      }
      expect(getGlobalSyncStatus(factories)).toBe(FactorySyncStatus.SAVING)
    })

    it('prioritizes DIRTY over CLEAN', () => {
      const factories: Record<string, Factory> = {
        factory1: TEST_FACTORIES.clean,
        factory2: TEST_FACTORIES.dirty,
      }
      expect(getGlobalSyncStatus(factories)).toBe(FactorySyncStatus.DIRTY)
    })
  })

  describe('hasConflicts', () => {
    it('returns false when no factories exist', () => {
      expect(hasConflicts({})).toBe(false)
    })

    it('returns false when no factories have conflicts', () => {
      const factories: Record<string, Factory> = {
        factory1: TEST_FACTORIES.clean,
        factory2: TEST_FACTORIES.dirty,
      }
      expect(hasConflicts(factories)).toBe(false)
    })

    it('returns true when at least one factory has a conflict', () => {
      const factories: Record<string, Factory> = {
        factory1: TEST_FACTORIES.clean,
        factory2: TEST_FACTORIES.conflict,
      }
      expect(hasConflicts(factories)).toBe(true)
    })
  })

  describe('getSyncStatusColor', () => {
    it('returns correct color for each status', () => {
      expect(getSyncStatusColor(FactorySyncStatus.CLEAN)).toBe(
        STATUS_COLORS[FactorySyncStatus.CLEAN],
      )
      expect(getSyncStatusColor(FactorySyncStatus.DIRTY)).toBe(
        STATUS_COLORS[FactorySyncStatus.DIRTY],
      )
      expect(getSyncStatusColor(FactorySyncStatus.SAVING)).toBe(
        STATUS_COLORS[FactorySyncStatus.SAVING],
      )
      expect(getSyncStatusColor(FactorySyncStatus.CONFLICT)).toBe(
        STATUS_COLORS[FactorySyncStatus.CONFLICT],
      )
      expect(getSyncStatusColor(FactorySyncStatus.ERROR)).toBe(
        STATUS_COLORS[FactorySyncStatus.ERROR],
      )
    })
  })

  describe('getSyncStatusIcon', () => {
    it('returns correct icon for each status', () => {
      expect(getSyncStatusIcon(FactorySyncStatus.CLEAN)).toBe(STATUS_ICONS[FactorySyncStatus.CLEAN])
      expect(getSyncStatusIcon(FactorySyncStatus.DIRTY)).toBe(STATUS_ICONS[FactorySyncStatus.DIRTY])
      expect(getSyncStatusIcon(FactorySyncStatus.SAVING)).toBe(
        STATUS_ICONS[FactorySyncStatus.SAVING],
      )
      expect(getSyncStatusIcon(FactorySyncStatus.CONFLICT)).toBe(
        STATUS_ICONS[FactorySyncStatus.CONFLICT],
      )
      expect(getSyncStatusIcon(FactorySyncStatus.ERROR)).toBe(STATUS_ICONS[FactorySyncStatus.ERROR])
    })
  })

  describe('getGlobalSyncTooltip', () => {
    it('returns connect message when not authenticated', () => {
      expect(getGlobalSyncTooltip(FactorySyncStatus.CLEAN, false)).toBe('Connect to Google Drive')
    })

    it('returns correct tooltip for each status when authenticated', () => {
      expect(getGlobalSyncTooltip(FactorySyncStatus.CLEAN, true)).toBe(
        GLOBAL_STATUS_TOOLTIPS[FactorySyncStatus.CLEAN],
      )
      expect(getGlobalSyncTooltip(FactorySyncStatus.DIRTY, true)).toBe(
        GLOBAL_STATUS_TOOLTIPS[FactorySyncStatus.DIRTY],
      )
      expect(getGlobalSyncTooltip(FactorySyncStatus.SAVING, true)).toBe(
        GLOBAL_STATUS_TOOLTIPS[FactorySyncStatus.SAVING],
      )
      expect(getGlobalSyncTooltip(FactorySyncStatus.CONFLICT, true)).toBe(
        GLOBAL_STATUS_TOOLTIPS[FactorySyncStatus.CONFLICT],
      )
      expect(getGlobalSyncTooltip(FactorySyncStatus.ERROR, true)).toBe(
        GLOBAL_STATUS_TOOLTIPS[FactorySyncStatus.ERROR],
      )
    })
  })

  describe('getFactorySyncTooltip', () => {
    it('returns connect message when not authenticated', () => {
      expect(getFactorySyncTooltip(FactorySyncStatus.CLEAN, false)).toBe('Connect to Google Drive')
      expect(getFactorySyncTooltip(undefined, false)).toBe('Connect to Google Drive')
    })

    it('returns not synced message when no status and authenticated', () => {
      expect(getFactorySyncTooltip(undefined, true)).toBe('Not synced')
    })

    it('returns correct tooltip for each status when authenticated', () => {
      expect(getFactorySyncTooltip(FactorySyncStatus.CLEAN, true)).toBe(
        FACTORY_STATUS_TOOLTIPS[FactorySyncStatus.CLEAN],
      )
      expect(getFactorySyncTooltip(FactorySyncStatus.DIRTY, true)).toBe(
        FACTORY_STATUS_TOOLTIPS[FactorySyncStatus.DIRTY],
      )
      expect(getFactorySyncTooltip(FactorySyncStatus.SAVING, true)).toBe(
        FACTORY_STATUS_TOOLTIPS[FactorySyncStatus.SAVING],
      )
      expect(getFactorySyncTooltip(FactorySyncStatus.CONFLICT, true)).toBe(
        FACTORY_STATUS_TOOLTIPS[FactorySyncStatus.CONFLICT],
      )
      expect(getFactorySyncTooltip(FactorySyncStatus.ERROR, true)).toBe(
        FACTORY_STATUS_TOOLTIPS[FactorySyncStatus.ERROR],
      )
    })
  })
})
