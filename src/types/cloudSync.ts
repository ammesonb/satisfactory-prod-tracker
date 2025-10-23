import type { Factory } from '@/types/factory'

/**
 * Sync status for an individual factory
 */
export enum FactorySyncStatus {
  CLEAN = 'clean',
  DIRTY = 'dirty',
  SAVING = 'saving',
  CONFLICT = 'conflict',
  ERROR = 'error',
}

/**
 * Status tracking information for a single factory
 */
export interface FactoryStatus {
  status: FactorySyncStatus
  lastSynced: string | null
  lastError: string | null
}

/**
 * Auto-sync configuration
 */
export interface AutoSyncConfig {
  enabled: boolean
  namespace: string
  selectedFactories: string[]
}

/**
 * Conflict information when cloud and local versions differ
 */
export interface ConflictInfo {
  factoryName: string
  cloudTimestamp: string
  cloudInstanceId: string
  cloudDisplayId: string
  localTimestamp: string
}

/**
 * Global error state for sync operations
 */
export interface GlobalSyncError {
  message: string
  timestamp: string
}

/**
 * File format for .sptrak files stored in Google Drive
 */
export interface SptrakFile {
  metadata: {
    version: string
    instanceId: string
    displayId?: string
    lastModified: string
    factoryName: string
    namespace: string
  }
  factory: Factory
}

/**
 * Google Drive file metadata
 */
export interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
  createdTime: string
  size?: string
}

/**
 * Cloud sync state for the store
 */
export interface CloudSyncState {
  // Authentication
  accessToken: string | null
  tokenExpiry: number | null

  // Instance identification
  instanceId: string
  displayId?: string

  // Auto-sync configuration
  autoSync: AutoSyncConfig

  // Prevent auto-save during bulk operations (namespace changes, etc.)
  autoSyncSuspended: boolean

  // Error state
  finalGlobalError: GlobalSyncError | null
}

// Error message constants
export const CLOUD_SYNC_ERRORS = {
  NOT_AUTHENTICATED: 'Not authenticated with Google Drive',
  INVALID_NAMESPACE: 'Invalid namespace name',
  FACTORY_NOT_FOUND: (name: string) => `Factory "${name}" not found`,
  FILE_NOT_FOUND: (filename: string) => `File "${filename}" not found`,
  INVALID_SPTRAK_FORMAT: 'Invalid .sptrak file format',
  CONFLICT_DETECTED: (name: string) => `Conflict detected for factory "${name}"`,
  AUTO_SYNC_DISABLED: 'Auto-sync is disabled',
  SYNC_IN_PROGRESS: 'Sync operation already in progress',
} as const
