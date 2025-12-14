import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

import type { CloudSyncState } from '@/types/cloudSync'
import { useGoogleAuthStore } from '@/stores/googleAuth'

export const useCloudSyncStore = defineStore('cloudSync', {
  state: (): CloudSyncState => ({
    // Instance identification - will be set on first initialization or loaded from persistence
    instanceId: '',
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
      // Ensure instance ID is set before any cloud operations
      this.initializeInstanceId()

      const googleAuthStore = useGoogleAuthStore()

      // Sign in with Google OAuth
      await googleAuthStore.signIn()
    },

    async refreshAuth(): Promise<void> {
      const googleAuthStore = useGoogleAuthStore()

      // Refresh token via googleAuthStore
      await googleAuthStore.refreshToken()
    },

    async signOut(): Promise<void> {
      const googleAuthStore = useGoogleAuthStore()

      // Sign out via googleAuthStore (clears token and user info)
      await googleAuthStore.signOut()
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

    /**
     * Initialize instance ID if not already set
     * Should be called once when the app starts
     */
    initializeInstanceId(): void {
      if (!this.instanceId) {
        this.instanceId = uuidv4()
      }
    },
  },

  persist: true,
})
