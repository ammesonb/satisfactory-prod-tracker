import type { Factory } from '@/types/factory'
import { FactorySyncStatus } from '@/types/cloudSync'

const STATUS_COLORS: Record<FactorySyncStatus, string> = {
  [FactorySyncStatus.CLEAN]: 'success',
  [FactorySyncStatus.DIRTY]: 'purple',
  [FactorySyncStatus.SAVING]: 'info',
  [FactorySyncStatus.CONFLICT]: 'warning',
  [FactorySyncStatus.ERROR]: 'error',
}

const STATUS_ICONS: Record<FactorySyncStatus, string> = {
  [FactorySyncStatus.CLEAN]: 'mdi-check',
  [FactorySyncStatus.DIRTY]: 'mdi-circle',
  [FactorySyncStatus.SAVING]: 'mdi-loading',
  [FactorySyncStatus.CONFLICT]: 'mdi-alert',
  [FactorySyncStatus.ERROR]: 'mdi-close',
}

const GLOBAL_STATUS_TOOLTIPS: Record<FactorySyncStatus, string> = {
  [FactorySyncStatus.CLEAN]: 'All factories synced',
  [FactorySyncStatus.DIRTY]: 'Changes pending backup',
  [FactorySyncStatus.SAVING]: 'Syncing to Google Drive...',
  [FactorySyncStatus.CONFLICT]: 'Sync conflicts detected',
  [FactorySyncStatus.ERROR]: 'Sync error - click for details',
}

const FACTORY_STATUS_TOOLTIPS: Record<FactorySyncStatus, string> = {
  [FactorySyncStatus.CLEAN]: 'Synced',
  [FactorySyncStatus.DIRTY]: 'Changes pending',
  [FactorySyncStatus.SAVING]: 'Syncing...',
  [FactorySyncStatus.CONFLICT]: 'Conflict detected',
  [FactorySyncStatus.ERROR]: 'Sync error',
}

/**
 * Calculate global sync status by aggregating all factory statuses.
 * Priority: error > conflict > saving > dirty > clean
 *
 * This is a pure function with no side effects.
 */
export function getGlobalSyncStatus(factories: Record<string, Factory>): FactorySyncStatus {
  const statuses = Object.values(factories)
    .map((f) => f.syncStatus?.status)
    .filter((status): status is FactorySyncStatus => status !== undefined)

  if (statuses.length === 0) {
    return FactorySyncStatus.CLEAN
  }

  // Check in priority order
  if (statuses.includes(FactorySyncStatus.ERROR)) return FactorySyncStatus.ERROR
  if (statuses.includes(FactorySyncStatus.CONFLICT)) return FactorySyncStatus.CONFLICT
  if (statuses.includes(FactorySyncStatus.SAVING)) return FactorySyncStatus.SAVING
  if (statuses.includes(FactorySyncStatus.DIRTY)) return FactorySyncStatus.DIRTY

  return FactorySyncStatus.CLEAN
}

/**
 * Check if any factories have unresolved conflicts
 */
export function hasConflicts(factories: Record<string, Factory>): boolean {
  return Object.values(factories).some((f) => f.conflict !== undefined)
}

/**
 * Get Vuetify color for a sync status
 */
export function getSyncStatusColor(status: FactorySyncStatus): string {
  return STATUS_COLORS[status] || 'grey'
}

/**
 * Get Material Design Icon name for a sync status
 */
export function getSyncStatusIcon(status: FactorySyncStatus): string {
  return STATUS_ICONS[status] || ''
}

/**
 * Get tooltip text for global sync status
 */
export function getGlobalSyncTooltip(status: FactorySyncStatus, isAuthenticated: boolean): string {
  if (!isAuthenticated) {
    return 'Connect to Google Drive'
  }
  return GLOBAL_STATUS_TOOLTIPS[status] || 'Cloud sync'
}

/**
 * Get tooltip text for factory sync status
 */
export function getFactorySyncTooltip(
  status: FactorySyncStatus | undefined,
  isAuthenticated: boolean,
): string {
  if (!isAuthenticated) {
    return 'Connect to Google Drive'
  }
  if (!status) {
    return 'Not synced'
  }
  return FACTORY_STATUS_TOOLTIPS[status] || 'Unknown status'
}
