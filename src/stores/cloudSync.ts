import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

import type { CloudSyncState, GoogleDriveFile } from '@/types/cloudSync'

export const useCloudSyncStore = defineStore('cloudSync', {
  state: (): CloudSyncState => ({
    // Authentication
    accessToken: null,
    tokenExpiry: null,

    // Instance identification - generate UUID on first initialization
    instanceId: uuidv4(),
    displayId: undefined,

    // Auto-sync configuration
    autoSync: {
      enabled: false,
      namespace: '',
      selectedFactories: [], // Arrays serialize fine for pinia persist, and we need ordering for UI consistency
    },

    // Prevent auto-save during bulk operations
    autoSyncSuspended: false,

    // Error state
    finalGlobalError: null,
  }),

  getters: {
    /**
     * Check if user is authenticated based on token presence and validity
     */
    isAuthenticated: (state): boolean => {
      if (!state.accessToken || !state.tokenExpiry) {
        return false
      }
      return Date.now() < state.tokenExpiry
    },

    /**
     * Check if cloud sync is fully configured (authenticated and has instance ID)
     */
    isConfigured: (state): boolean => {
      return !!state.accessToken && !!state.instanceId
    },

    /**
     * Check if a specific factory is selected for auto-sync
     */
    isFactoryAutoSynced: (state) => {
      // CLAUDE: when implementing auto-sync, let's decide if this should be on the factory too
      // Pros: more co-located properties
      // Cons: this store cares about sync enrollment, factory does not
      return (factoryName: string): boolean => {
        return state.autoSync.selectedFactories.includes(factoryName)
      }
    },
  },

  actions: {
    // ========================================
    // Authentication Actions (Phase 2)
    // ========================================

    async authenticate(): Promise<void> {
      // To be implemented in Phase 2
      throw new Error('Not implemented')
    },

    async refreshToken(): Promise<void> {
      // To be implemented in Phase 2
      throw new Error('Not implemented')
    },

    signOut(): void {
      this.accessToken = null
      this.tokenExpiry = null
    },

    // ========================================
    // Auto-Sync Management Actions (Phase 4)
    // ========================================

    enableAutoSync(namespace: string, factories: string[]): void {
      this.autoSync.enabled = true
      this.autoSync.namespace = namespace
      this.autoSync.selectedFactories = [...factories]
    },

    disableAutoSync(): void {
      this.autoSync.enabled = false
      // Keep namespace and selectedFactories so user can toggle on/off without losing selections
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async changeNamespace(newNamespace: string): Promise<void> {
      // To be implemented in Phase 4
      throw new Error('Not implemented')
    },

    addFactoryToAutoSync(factoryName: string): void {
      if (!this.autoSync.selectedFactories.includes(factoryName)) {
        this.autoSync.selectedFactories.push(factoryName)
      }
    },

    removeFactoryFromAutoSync(factoryName: string): void {
      const index = this.autoSync.selectedFactories.indexOf(factoryName)
      if (index !== -1) {
        this.autoSync.selectedFactories.splice(index, 1)
      }
    },

    // ========================================
    // Backup/Restore Operations (Phase 3)
    // ========================================

    // CLAUDE: these actually seem stateless, right? just interactions with factory store or cloud stores
    // CLAUDE: that means they really should be a composable, right?
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async backupFactory(namespace: string, factoryName: string): Promise<void> {
      // To be implemented in Phase 3
      // CLAUDE: most of the functionality for this probably belong on the factory and/or in a utility
      throw new Error('Not implemented')
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async restoreFactory(namespace: string, filename: string, importAlias?: string): Promise<void> {
      // To be implemented in Phase 3
      // CLAUDE: most of the functionality for this probably belong on the factory and/or in a utility
      throw new Error('Not implemented')
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async listBackups(namespace?: string): Promise<GoogleDriveFile[]> {
      // To be implemented in Phase 3
      throw new Error('Not implemented')
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async deleteBackup(namespace: string, filename: string): Promise<void> {
      // To be implemented in Phase 3
      throw new Error('Not implemented')
    },

    // ========================================
    // Sync Operations (Phase 4)
    // ========================================

    // CLAUDE: also a composable right, since this interacts with factory store to get sptrak, backup to cloud?
    async performAutoSave(): Promise<void> {
      // To be implemented in Phase 4
      throw new Error('Not implemented')
    },

    // CLAUDE: conflict resolution also seems like a composable, since it is comparing/writing data only
    async checkForConflicts(): Promise<void> {
      // To be implemented in Phase 4
      throw new Error('Not implemented')
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async resolveConflict(factoryName: string, resolution: 'cloud' | 'local'): Promise<void> {
      // To be implemented in Phase 4
      throw new Error('Not implemented')
    },

    // ========================================
    // Global Error Management (Phase 1)
    // ========================================

    setGlobalError(message: string): void {
      this.finalGlobalError = {
        message,
        timestamp: new Date().toISOString(),
      }
    },

    clearGlobalError(): void {
      this.finalGlobalError = null
    },

    suspendAutoSync(): void {
      this.autoSyncSuspended = true
    },

    resumeAutoSync(): void {
      this.autoSyncSuspended = false
    },

    setDisplayId(displayId: string): void {
      this.displayId = displayId
    },
  },

  persist: true,
})
