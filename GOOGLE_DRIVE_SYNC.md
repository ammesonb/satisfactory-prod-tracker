# Google Drive Sync Implementation Plan

## Overview

This document outlines the implementation plan for adding Google Drive cloud sync functionality to the Satisfactory Production Tracker. The feature enables users to backup and restore their factory configurations to Google Drive with automatic sync capabilities.

## Feature Requirements

### Core Functionality
- **Per-factory backup**: Each factory is saved as an individual `.sptrak` file
- **Namespace organization**: Group backups into namespaces (folders in Drive)
- **Auto-sync**: Automatic backup of selected factories on changes
- **Conflict detection**: UUID-based instance tracking with timestamp validation
- **Visual status indicators**: Per-factory and global sync status
- **Multi-device support**: Detect and resolve conflicts across devices

### User Interface Components
1. **Cloud Sync Tab** in Import/Export Modal
2. **Header sync indicator** (icon + status)
3. **Factory drawer status badges** (per-factory indicators)
4. **Namespace selector** (autocomplete component)
5. **Conflict resolution modal**

## Architecture

### 1. Cloud Sync Store (`src/stores/cloudSync.ts`)

#### State
```typescript
interface CloudSyncState {
  // Authentication
  // CLAUDE: this should be computed based on access token presence and validity of expiry
  isAuthenticated: boolean
  accessToken: string | null
  tokenExpiry: number | null

  // Instance identification
  instanceId: string  // UUID generated on first auth
  displayId?: string // A user-configurable display ID to help with conflict resolution

  // Auto-sync configuration
  // CLAUDE: this should be a real type
  autoSync: {
    enabled: boolean
    namespace: string
    selectedFactories: string[]  // Factory names to auto-backup
  }

  // Prevent auto-save during bulk operations (namespace changes, etc.)
  autoSyncSuspended: boolean

  // Sync status tracking (per factory)
  // CLAUDE: this should be a real type, referenced here
  factoryStatus: Record<string, {
    // CLAUDE: these options should be an enum
    status: 'clean' | 'dirty' | 'saving' | 'conflict' | 'error'
    lastSynced: string | null  // ISO timestamp
    lastError: string | null
  }>

  // Conflict tracking
  conflicts: Array<{
    factoryName: string
    cloudTimestamp: string
    cloudInstanceId: string
    cloudDisplayId: string
    localTimestamp: string
  }>

  // Error state
  finalGlobalError: {
    message: string
    timestamp: string
  } | null
}
```

#### Actions
```typescript
actions: {
  // Authentication
  authenticate(): Promise<void>
  refreshToken(): Promise<void>
  signOut(): void

  // Auto-sync management
  enableAutoSync(namespace: string, factories: string[]): void
  disableAutoSync(): void
  changeNamespace(newNamespace: string): Promise<void>
  addFactoryToAutoSync(factoryName: string): void
  removeFactoryFromAutoSync(factoryName: string): void

  // Backup/Restore operations
  backupFactory(namespace: string, factoryName: string): Promise<void>
  restoreFactory(namespace: string, filename: string, importAlias?: string): Promise<void>
  listBackups(namespace?: string): Promise<CloudFile[]>  // default to currently-configured namespace
  deleteBackup(namespace: string, filename: string): Promise<void>

  // Sync operations
  performAutoSave(): Promise<void>
  checkForConflicts(): Promise<void>
  resolveConflict(factoryName: string, resolution: 'cloud' | 'local'): Promise<void>

  // Status management
  setFactoryStatus(factoryName: string, status: FactoryStatus): void
  markFactoryDirty(factoryName: string): void
  clearFactoryError(factoryName: string): void
}
```

#### Getters
```typescript
getters: {
  isConfigured: (state) => state.isAuthenticated && state.instanceId !== null
  hasConflicts: (state) => state.conflicts.length > 0
  globalSyncStatus: (state) => {
    // Aggregate all factory statuses into single global state
    // Priority: error > conflict > saving > dirty > clean
  }
  availableNamespaces: (state) => {
    // Cached list of namespace folders from Drive
  }
}
```

### 2. File Format (`.sptrak`)

Each factory file contains:

```typescript
interface SptrakFile {
  metadata: {
    version: string  // "1.0"
    instanceId: string  // UUID of device that created/last modified
    lastModified: string  // ISO timestamp
    factoryName: string
    namespace: string
  }
  factory: Factory  // Existing Factory type from types/factory.ts
}
```

### 3. Google Drive Integration (`src/composables/useGoogleDrive.ts`)

```typescript
interface GoogleDriveComposable {
  // Authentication
  initGoogleAuth(): Promise<void>
  signInWithGoogle(): Promise<void>
  signOut(): Promise<void>

  // File operations
  uploadFile(
    filename: string,
    content: string,
    folderId: string
  ): Promise<string>  // Returns fileId

  downloadFile(fileId: string): Promise<string>
  deleteFile(fileId: string): Promise<void>

  listFiles(
    folderId?: string,
    query?: string
  ): Promise<GoogleDriveFile[]>

  // Folder operations
  createFolder(
    name: string,
    parentId?: string
  ): Promise<string>  // Returns folderId

  findOrCreateFolder(
    path: string[]
  ): Promise<string>  // Returns folderId of final folder

  // Utility
  getFileMetadata(fileId: string): Promise<GoogleDriveFile>
}
```

### 4. Auto-Save Implementation

**Strategy**: Watch factory store mutations with debounced saves

```typescript
// In cloudSync store setup
let saveTimer: number | null = null
// ten second minimum interval, to allow for possible flurries of activity
const DEBOUNCE_MS = 10000
// CLAUDE: let's make this a backoff instead of a fixed time, e.g. one second, two seconds, five seconds
// CLAUDE: I made it into an array, which should be indexable by retry count. This also implicitly captures MAX_RETRY_COUNT
const RETRY_DELAY_MS = [500, 2000, 5000, 10000, 20000]

factoryStore.$subscribe((mutation, state) => {
  if (!autoSync.enabled || !isAuthenticated || autoSyncSuspended) return

  // Determine which factories changed
  const changedFactories = detectChangedFactories(mutation)

  // Mark affected factories as dirty
  changedFactories
    .filter(name => autoSync.selectedFactories.includes(name))
    .forEach(name => markFactoryDirty(name))

  // Clear existing timer
  if (saveTimer) clearTimeout(saveTimer)

  // Set new debounced save
  saveTimer = setTimeout(async () => {
    await performAutoSave()
  }, DEBOUNCE_MS)
})
```

**Retry Logic**:
```typescript
async function performAutoSave(): Promise<void> {
  // Guard against executing if conditions changed
  if (!autoSync.enabled || !isAuthenticated || conflicts.length > 0 || autoSyncSuspended) {
    return
  }

  const dirtyFactories = Object.entries(factoryStatus)
    .filter(([name, status]) =>
      status.status === 'dirty' &&
      autoSync.selectedFactories.includes(name)
    )
    .map(([name, _]) => name)

  for (const factoryName of dirtyFactories) {
    await performAutoSaveWithRetry(factoryName, 0)
  }
}

async function performAutoSaveWithRetry(
  factoryName: string,
  attempt: number = 0
): Promise<void> {
  try {
    // Check for conflicts before saving
    const conflictInfo = await detectConflict(autoSync.namespace, factoryName)
    if (conflictInfo) {
      // Conflict detected - disable auto-sync and add to conflicts
      conflicts.push({
        factoryName,
        cloudTimestamp: conflictInfo.cloudTimestamp,
        cloudInstanceId: conflictInfo.cloudInstanceId,
        cloudDisplayId: conflictInfo.cloudDisplayId,
        localTimestamp: factoryStatus[factoryName]?.lastSynced || 'never'
      })
      setFactoryStatus(factoryName, 'conflict')
      disableAutoSync()
      showConflictResolutionModal()
      return
    }

    setFactoryStatus(factoryName, 'saving')
    await backupFactory(autoSync.namespace, factoryName)
    setFactoryStatus(factoryName, 'clean')
  } catch (error) {
    if (attempt < RETRY_DELAY_MS.length) {
      // Retry with backoff
      await delay(RETRY_DELAY_MS[attempt])
      return performAutoSaveWithRetry(factoryName, attempt + 1)
    }

    // Max retries exhausted - store error and disable auto-sync
    finalGlobalError = {
      message: `Failed to auto-save ${factoryName}: ${error.message}`,
      timestamp: new Date().toISOString()
    }
    setFactoryStatus(factoryName, 'error')
    disableAutoSync()

    // Show error modal
    errorStore.error()
      .title('Auto-Sync Failed')
      .body(() => h('p', finalGlobalError.message))
      .show()
  }
}
```

### 5. Conflict Detection

**Unified Conflict Detection Helper**:
```typescript
interface ConflictInfo {
  cloudTimestamp: string
  cloudInstanceId: string
  cloudDisplayId: string
}

async function detectConflict(
  namespace: string,
  factoryName: string
): Promise<ConflictInfo | null> {
  const cloudFile = await findCloudFile(namespace, factoryName)
  if (!cloudFile) return null  // No conflict if no cloud file exists

  const cloudData = await downloadFile(cloudFile.id)
  const parsed: SptrakFile = JSON.parse(cloudData)
  const localLastSync = factoryStatus[factoryName]?.lastSynced

  // No conflict if cloud file is from this instance
  if (parsed.metadata.instanceId === instanceId) {
    return null
  }

  // Conflict if cloud is newer than our last sync (or we never synced)
  if (!localLastSync ||
      new Date(parsed.metadata.lastModified) > new Date(localLastSync)) {
    return {
      cloudTimestamp: parsed.metadata.lastModified,
      cloudInstanceId: parsed.metadata.instanceId,
      cloudDisplayId: parsed.metadata.displayId
    }
  }

  return null
}
```

**On App Load**:
```typescript
async function checkForConflictsOnLoad(): Promise<void> {
  if (!isAuthenticated || !autoSync.enabled) return

  for (const factoryName of autoSync.selectedFactories) {
    const conflictInfo = await detectConflict(autoSync.namespace, factoryName)

    if (conflictInfo) {
      conflicts.push({
        factoryName,
        cloudTimestamp: conflictInfo.cloudTimestamp,
        cloudInstanceId: conflictInfo.cloudInstanceId,
        cloudDisplayId: conflictInfo.cloudDisplayId,
        localTimestamp: factoryStatus[factoryName]?.lastSynced || 'never'
      })
      setFactoryStatus(factoryName, 'conflict')
    }
  }

  if (conflicts.length > 0) {
    // Disable auto-sync until conflicts resolved
    autoSync.enabled = false
    // Show conflict modal
    showConflictResolutionModal()
  }
}
```

### 6. Namespace Change Flow

```typescript
async function changeNamespace(newNamespace: string): Promise<void> {
  // Check for unsaved changes
  const dirtyFactories = Object.entries(factoryStatus)
    .filter(([_, status]) => status.status === 'dirty')
    .map(([name, _]) => name)

  if (dirtyFactories.length > 0) {
    // Show confirmation modal
    const confirmed = await showConfirmationModal({
      title: 'Unsaved Changes',
      message: `You have unsaved changes in: ${dirtyFactories.join(', ')}. These changes will be lost if not backed up. Continue?`,
      confirmText: 'Change Namespace',
      cancelText: 'Cancel'
    })

    if (!confirmed) return
  }

  // Disable auto-sync and suspend auto-save
  const wasEnabled = autoSync.enabled
  disableAutoSync()
  autoSyncSuspended = true

  // Cancel any pending saves
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }

  // Clear any in-flight requests
  await cancelPendingSaves()

  // Load factory data from new namespace
  const availableBackups = await listBackups(newNamespace)

  if (availableBackups.length > 0) {
    // Prompt user to load factories from new namespace
    // CLAUDE: users may want to select which factories to load. default to all, but we'll likely need the FactorySelector included here somehow. Perhaps some of the ImportTab components could be reused?
    const shouldLoad = await showConfirmationModal({
      title: 'Load Factories from Namespace?',
      message: `Found ${availableBackups.length} backup(s) in "${newNamespace}". Load these factories?`,
      confirmText: 'Load Factories',
      cancelText: 'Keep Current Factories'
    })

    if (shouldLoad) {
      // Clear current factories
      factoryStore.factories = {}

      // Load all factories from new namespace
      for (const backup of availableBackups) {
        await restoreFactory(newNamespace, backup.name)
      }
    }
  }

  // Update namespace
  autoSync.namespace = newNamespace

  // Clear all status (fresh start in new namespace)
  factoryStatus = {}

  // Re-enable auto-save
  autoSyncSuspended = false

  // Re-enable auto-sync if it was enabled
  // CLAUDE: won't selected factories here be out of sync with the namespace?
  // CLAUDE: we can probably just set them to whichever factories were selected for import
  if (wasEnabled && autoSync.selectedFactories.length > 0) {
    enableAutoSync(newNamespace, autoSync.selectedFactories)
  }
}
```

## Component Implementation

CLAUDE: I will want to look at all these as they are created, since it is hard to visualize on the HTML tags alone.
### 1. Cloud Sync Tab (`src/components/modals/import-export/CloudSyncTab.vue`)

```vue
<template>
  <div>
    <!-- Authentication Section -->
    <v-card v-if="!cloudSyncStore.isAuthenticated" variant="outlined" class="pa-4 mb-4">
      <div class="text-center">
        <v-icon size="64" color="primary" class="mb-2">mdi-google-drive</v-icon>
        <h3 class="mb-2">Connect to Google Drive</h3>
        <p class="text-grey mb-4">
          Backup your factories to Google Drive and sync across devices
        </p>
        <v-btn color="primary" @click="cloudSyncStore.authenticate()">
          <v-icon class="mr-2">mdi-google</v-icon>
          Sign in with Google
        </v-btn>
      </div>
    </v-card>

    <!-- Auto-Sync Configuration -->
    <v-card v-if="cloudSyncStore.isAuthenticated" variant="outlined" class="mb-4">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-sync" class="me-2" />
        Auto-Sync Configuration
      </v-card-title>

      <v-card-text>
        <!-- Namespace Selector -->
        <NamespaceSelector
          v-model="autoSyncNamespace"
          label="Sync Namespace"
          hint="Organize your factories by game, save, or playthrough"
          :disabled="cloudSyncStore.autoSync.enabled"
        />

        <!-- Factory Selection -->
        <div class="mt-4">
          <FactorySelector
            v-model="selectedFactoriesForSync"
            :factories="factoryStore.factoryList"
            title="Factories to Auto-Backup"
          />
        </div>

        <!-- Auto-Sync Toggle -->
        <div class="d-flex align-center justify-space-between mt-4">
          <div>
            <div class="text-subtitle-2">Enable Auto-Sync</div>
            <div class="text-caption text-medium-emphasis">
              Automatically backup changes to Google Drive
            </div>
          </div>
          <v-switch
            v-model="cloudSyncStore.autoSync.enabled"
            color="primary"
            :disabled="!canEnableAutoSync"
            @update:model-value="handleAutoSyncToggle"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Backup/Restore Section -->
    <v-card v-if="cloudSyncStore.isAuthenticated" variant="outlined">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-cloud-upload" class="me-2" />
        Backup & Restore
      </v-card-title>

      <v-card-text>
        <!-- Namespace Selector (independent from auto-sync) -->
        <NamespaceSelector
          v-model="backupRestoreNamespace"
          label="Browse Namespace"
        />

        <!-- Available Backups List -->
        <div class="mt-4">
          <div class="d-flex justify-space-between align-center mb-2">
            <div class="text-subtitle-2">Available Backups</div>
            <v-btn
              size="small"
              variant="outlined"
              @click="refreshBackupList"
              :loading="loadingBackups"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </div>

          <v-card variant="outlined" max-height="400" style="overflow-y: auto">
            <v-list v-if="backupFiles.length > 0">
              <v-list-item
                v-for="backup in backupFiles"
                :key="backup.id"
              >
                <template v-slot:prepend>
                  <v-icon icon="mdi-cloud-outline" />
                </template>

                <v-list-item-title>{{ backup.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  Last modified: {{ formatTimestamp(backup.modifiedTime) }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <div class="d-flex gap-2">
                    <v-btn
                      size="small"
                      variant="outlined"
                      @click="handleRestore(backup)"
                    >
                      <v-icon class="mr-1">mdi-download</v-icon>
                      Restore
                    </v-btn>
                    <v-btn
                      size="small"
                      variant="text"
                      color="error"
                      @click="handleDelete(backup)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-list>

            <div v-else class="pa-4 text-center text-grey">
              No backups found in this namespace
            </div>
          </v-card>
        </div>

        <!-- Manual Backup -->
        <div class="mt-4">
          <div class="text-subtitle-2 mb-2">Manual Backup</div>
          <FactorySelector
            v-model="selectedFactoriesForBackup"
            :factories="factoryStore.factoryList"
            title="Select Factories to Backup"
          />
          <v-btn
            color="primary"
            class="mt-2"
            :disabled="selectedFactoriesForBackup.length === 0"
            @click="performManualBackup"
          >
            <v-icon class="mr-2">mdi-cloud-upload</v-icon>
            Backup Selected Factories
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Conflicts Section -->
    <v-card
      v-if="cloudSyncStore.hasConflicts"
      variant="outlined"
      color="warning"
      class="mt-4"
    >
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-alert" class="me-2" />
        Sync Conflicts Detected
      </v-card-title>

      <v-card-text>
        <p class="mb-2">
          The following factories have conflicts between local and cloud versions:
        </p>

        <v-list>
          <v-list-item
            v-for="conflict in cloudSyncStore.conflicts"
            :key="conflict.factoryName"
          >
            <v-list-item-title>{{ conflict.factoryName }}</v-list-item-title>
            <v-list-item-subtitle>
              Cloud: {{ formatTimestamp(conflict.cloudTimestamp) }} |
              Local: {{ formatTimestamp(conflict.localTimestamp) }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <div class="d-flex gap-2">
                <v-btn
                  size="small"
                  variant="outlined"
                  @click="resolveConflict(conflict.factoryName, 'cloud')"
                >
                  Use Cloud
                </v-btn>
                <v-btn
                  size="small"
                  variant="outlined"
                  @click="resolveConflict(conflict.factoryName, 'local')"
                >
                  Use Local
                </v-btn>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </div>
</template>
```

### 2. Namespace Selector (`src/components/common/NamespaceSelector.vue`)

```vue
<template>
  <v-autocomplete
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :items="availableNamespaces"
    :label="label"
    :hint="hint"
    :disabled="disabled"
    :rules="namespaceRules"
    persistent-hint
    clearable
  >
    <template v-slot:prepend>
      <v-icon>mdi-folder</v-icon>
    </template>

    <template v-slot:append>
      <v-tooltip text="Create new namespace">
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-plus"
            size="x-small"
            variant="text"
            v-bind="props"
            @click="showCreateNamespace = true"
          />
        </template>
      </v-tooltip>
    </template>
  </v-autocomplete>

  <!-- Create Namespace Dialog -->
  <v-dialog v-model="showCreateNamespace" max-width="400">
    <v-card>
      <v-card-title>Create Namespace</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="newNamespace"
          label="Namespace Name"
          :rules="namespaceRules"
          hint="Use to organize factories by game, save, or playthrough"
          persistent-hint
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="showCreateNamespace = false">Cancel</v-btn>
        <v-btn
          color="primary"
          @click="createNamespace"
          :disabled="!isValidNamespace(newNamespace)"
        >
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
// Validation rules for Google Drive folder names
const namespaceRules = [
  (v: string) => !!v || 'Namespace is required',
  (v: string) => v !== '.' && v !== '..' || 'Invalid folder name', // CLAUDE: should this be 'cannot be just dots'? that would be sensible I think
  (v: string) => !v.includes('/') || 'Cannot contain forward slash',
  (v: string) => v.trim().length > 0 || 'Cannot be empty or only spaces',
  (v: string) => new Blob([v]).size <= 255 || 'Name too long (max 255 bytes)',
]
</script>
```

### 3. Header Sync Indicator (`src/components/layout/AppBar.vue`)

Add to existing AppBar component:

```vue
<template>
  <!-- Existing AppBar content -->

  <!-- Cloud Sync Indicator (next to Import/Export button) -->
  <v-tooltip :text="syncTooltipText" location="bottom">
    <template v-slot:activator="{ props }">
      <v-btn
        icon
        v-bind="props"
        @click="handleSyncIconClick"
      >
        <!-- Not authenticated: Google icon -->
        <v-icon v-if="!cloudSyncStore.isAuthenticated">
          mdi-google-drive
        </v-icon>

        <!-- Authenticated: Cloud with status indicator --> // CLAUDE: this should probably be a separate component for reuse
        <v-badge
          v-else
          :color="syncStatusColor"
          :icon="syncStatusIcon"
          overlap
        >
          <v-icon>mdi-cloud</v-icon>
        </v-badge>
      </v-btn>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
const syncStatusColor = computed(() => {
  const status = cloudSyncStore.globalSyncStatus
  switch (status) { // CLAUDE: should this be configured in the store/composable for easier re-use?
    case 'clean': return 'success'
    case 'dirty': return 'info'
    case 'saving': return 'info'
    case 'conflict': return 'warning'
    case 'error': return 'error'
    default: return 'grey'
  }
})

const syncStatusIcon = computed(() => {
  const status = cloudSyncStore.globalSyncStatus
  switch (status) {  // CLAUDE: this too
    case 'clean': return 'mdi-check'
    case 'dirty': return 'mdi-circle' // Small dot
    case 'saving': return 'mdi-loading' // Spinning
    case 'conflict': return 'mdi-alert'
    case 'error': return 'mdi-close'
    default: return ''
  }
})

const syncTooltipText = computed(() => {
  if (!cloudSyncStore.isAuthenticated) {
    return 'Connect to Google Drive'
  }
  const status = cloudSyncStore.globalSyncStatus // CLAUDE: these could be a store/composable getter/function, taking an "all" boolean that is true for header, false for individual factory
  switch (status) {
    case 'clean': return 'All factories synced'
    case 'dirty': return 'Changes pending backup'
    case 'saving': return 'Syncing to Google Drive...'
    case 'conflict': return 'Sync conflicts detected'
    case 'error': return 'Sync error - click for details'
    default: return 'Cloud sync'
  }
})

const handleSyncIconClick = () => {
  // Open Import/Export modal to Cloud Sync tab
  showImportExportModal.value = true
  importExportModalTab.value = 'cloudSync'
}
</script>
```

### 4. Factory Drawer Status Badges (`src/components/layout/FactoryDrawer.vue`)

Modify existing factory list items:

```vue
<template>
  <v-list-item
    v-for="factory in factoryStore.factoryList"
    :key="factory.name"
    @click="selectFactory(factory.name)"
  >
    <template v-slot:prepend>
      <v-badge
        v-if="cloudSyncStore.isAuthenticated"
        :color="getFactorySyncColor(factory.name)"
        :icon="getFactorySyncIcon(factory.name)"
        :dot="!isDrawerExpanded"
        overlap
        offset-x="8"
        offset-y="8"
      >
        <CachedIcon :icon="factory.icon" :size="24" />
      </v-badge>
      <CachedIcon v-else :icon="factory.icon" :size="24" />
    </template>

    <!-- Rest of list item content -->
  </v-list-item>
</template>

<script setup lang="ts">
const getFactorySyncColor = (factoryName: string) => {
  const status = cloudSyncStore.factoryStatus[factoryName]?.status
  if (!status || !cloudSyncStore.autoSync.selectedFactories.includes(factoryName)) {
    return 'grey-lighten-2'
  }
  switch (status) {
    case 'clean': return 'success'
    case 'dirty': return 'info'
    case 'saving': return 'info'
    case 'conflict': return 'warning'
    case 'error': return 'error'
    default: return 'grey'
  }
}

const getFactorySyncIcon = (factoryName: string) => {
  if (!isDrawerExpanded.value) return undefined // Use dot for collapsed

  const status = cloudSyncStore.factoryStatus[factoryName]?.status
  switch (status) {
    case 'clean': return 'mdi-check'
    case 'dirty': return 'mdi-circle'
    case 'saving': return 'mdi-loading'
    case 'conflict': return 'mdi-alert'
    case 'error': return 'mdi-close'
    default: return undefined
  }
}
</script>
```

### 5. New Factory Prompt

Add to factory store after `addFactory()` and `importFactories()`:

```typescript
// In factory store
addFactory(name: string, icon: string, recipes: string, externalInputs: RecipeProduct[]) {
  // ... existing implementation ...

  // Check if auto-sync is enabled
  const cloudSyncStore = useCloudSyncStore()
  if (cloudSyncStore.autoSync.enabled) {
    // Prompt user to add to auto-sync
    // CLAUDE: alternatively, a simple toggle on the dialog to see if they want to add to auto-sync
    nextTick(() => {
      cloudSyncStore.promptAddFactoryToAutoSync(name)
    })
  }
}
```

In cloud sync store:

```typescript
async promptAddFactoryToAutoSync(factoryName: string): Promise<void> {
  const confirmed = await showConfirmationModal({
    title: 'Add to Auto-Sync?',
    message: `Include "${factoryName}" in automatic cloud backups?`,
    confirmText: 'Add to Auto-Sync',
    cancelText: 'Skip'
  })

  if (confirmed) {
    this.addFactoryToAutoSync(factoryName)
    // Immediately trigger backup
    await this.backupFactory(this.autoSync.namespace, factoryName)
  }
}
```

### 6. Restore Factory Modal (`src/components/modals/RestoreFactoryModal.vue`)

```vue
<template>
  <v-dialog v-model="show" max-width="500">
    <v-card>
      <v-card-title>Restore Factory</v-card-title>

      <v-card-text>
        <p class="mb-4">
          Restoring: <strong>{{ cloudFileName }}</strong>
        </p>

        <v-text-field
          v-model="newFactoryName"
          label="Factory Name"
          :error="hasNameConflict"
          :error-messages="nameConflictMessage"
          hint="Rename if a factory with this name already exists"
          persistent-hint
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="show = false">Cancel</v-btn>
        <v-btn
          color="primary"
          @click="handleRestore"
          :disabled="hasNameConflict || !newFactoryName"
        >
          Restore
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const hasNameConflict = computed(() => {
  return (
    newFactoryName.value !== originalName &&
    factoryStore.factories[newFactoryName.value] !== undefined
  )
})

const nameConflictMessage = computed(() => {
  return hasNameConflict.value
    ? `A factory named "${newFactoryName.value}" already exists`
    : ''
})
</script>
```

## Implementation Phases

Implementation is broken into logical phases that build on each other. Tests should be written alongside implementation, not deferred to the end.

**Testing Classification**:
- **Unit Tests**: Pure logic tests without HTML rendering (stores, composables, utilities)
- **Integration Tests**: Component tests requiring full Vue interactions and HTML rendering

NOTE: integration tests should NOT be fully testing store/composable capabilities, e.g. "each status".
Just test ONE status, and leave that to the unit tests.

### Phase 1: Base Data Structures & Store

**Goal**: Set up foundational state management and data formats.

**Implementation**:
- [ ] Create `cloudSync` store with complete state structure (TypeScript interfaces - no full function definitions yet)
- [ ] Add store getters for computed state (isAuthenticated, aggregated status, etc.)
- [ ] Create `.sptrak` file format serialization/deserialization utilities
- [ ] Add UUID instance tracking (generate on first use, persist)
- [ ] Implement per-factory status tracking in store

**Visual Indicators** (easy wins, implement early):
- [ ] Add header sync status icon with color/state computed from store
- [ ] Add factory drawer status badges (reuse same status logic)
- [ ] Add tooltips for all status states
- [ ] Implement status icon animations (spinning for "saving", etc.)

**Unit Tests** (write alongside - no HTML rendering):
- [ ] Store state initialization and TypeScript types
- [ ] Status tracking logic and aggregation
- [ ] File serialization/deserialization with validation
- [ ] UUID generation and persistence
- [ ] Store getters return correct computed values

**Integration Tests** (component tests with Vue):
- [ ] Header sync indicator component renders correct icon/color based on store state (NOTE: for this and following tests, as mentioned above, just test one state. Leave full "correctness" of conflict = danager, error = x, etc tests to unit tests.)
- [ ] Factory drawer badges render correctly
- [ ] Tooltips display proper text for each status

---

### Phase 2: Google Drive Integration

**Goal**: Establish connection to Google Drive with OAuth and basic file operations.

**Implementation**:
- [ ] Implement `useGoogleDrive` composable (pure API layer, no business logic)
- [ ] Add OAuth authentication flow (initGoogleAuth, signInWithGoogle, signOut)
- [ ] Implement file operations (uploadFile, downloadFile, deleteFile, listFiles, getFileMetadata)
- [ ] Implement folder operations (createFolder, findOrCreateFolder)
- [ ] Setup Google Drive folder structure (`SatisProdTrak/namespaces/`)
- [ ] Add `NamespaceSelector` component with autocomplete

**Store Actions** (connect composable to store):
- [ ] authenticate(), refreshToken(), signOut()
- [ ] Store authentication state (accessToken, tokenExpiry)

**Unit Tests** (write alongside - no HTML rendering):
- [ ] useGoogleDrive composable with mocked Google API responses
- [ ] File upload/download/delete logic with mocks
- [ ] Folder creation and navigation logic
- [ ] OAuth error handling
- [ ] Store authentication actions update state correctly

**Integration Tests** (component tests with Vue):
- [ ] NamespaceSelector component validation and autocomplete
- [ ] NamespaceSelector displays existing namespaces from store
- [ ] OAuth flow updates UI state correctly

**Manual Testing**:
- [ ] OAuth flow completes successfully in browser
- [ ] Namespace autocomplete shows existing namespaces
- [ ] Can create new namespaces
- [ ] Files upload/download correctly to/from Drive

---

### Phase 3: Manual Backup & Restore

**Goal**: Enable users to manually backup and restore factories without auto-sync complexity.

**Implementation**:
- [ ] Create `CloudSyncTab.vue` component in Import/Export modal (3rd tab)
- [ ] Implement manual backup functionality (single/multiple factories)
- [ ] Implement namespace browsing and selection
- [ ] Add backup file listing and metadata display
- [ ] Implement restore functionality with factory selection UI (reuse FactorySelector)
- [ ] Add name conflict detection on restore (prompt for rename if factory exists)
- [ ] Implement backup deletion

**Store Actions**:
- [ ] backupFactory(namespace, factoryName)
- [ ] restoreFactory(namespace, filename, importAlias?)
- [ ] listBackups(namespace)
- [ ] deleteBackup(namespace, filename)

**Unit Tests** (write alongside - no HTML rendering):
- [ ] Store backup/restore actions with mocked Drive operations
- [ ] Name conflict detection logic
- [ ] File listing and filtering logic
- [ ] Backup deletion validation

**Integration Tests** (component tests with Vue):
- [ ] CloudSyncTab component renders and handles user interactions
- [ ] Factory selection for backup (reuses FactorySelector component)
- [ ] Factory selection for restore with name conflict prompts
- [ ] File listing displays correctly with metadata
- [ ] Delete confirmation modal works

**Manual Testing**:
- [ ] Backup single/multiple factories to Drive
- [ ] Restore prompts for rename on conflict
- [ ] Delete backups from Drive
- [ ] Switch between namespaces
- [ ] Factory data integrity after restore

---

### Phase 4: Auto-Sync & Conflict Resolution

**Goal**: Add automatic syncing with multi-device conflict detection.

**Implementation**:
- [ ] Implement factory store watcher with debouncing (10s default)
- [ ] Add auto-sync configuration UI in CloudSyncTab (enable/disable, factory selection)
- [ ] Implement `performAutoSave()` with guard conditions (enabled, authenticated, no conflicts, not suspended)
- [ ] Add retry logic with exponential backoff on network errors
- [ ] Implement `autoSyncSuspended` flag for bulk operations
- [ ] Add conflict detection on app load (compare timestamps + instanceId)
- [ ] Add conflict detection before save (check cloud file metadata)
- [ ] Create conflict resolution modal/UI
- [ ] Implement namespace change flow with dirty state warning
- [ ] Add "include in auto-sync" prompt when creating new factory

**Store Actions**:
- [ ] enableAutoSync(namespace, factories)
- [ ] disableAutoSync()
- [ ] changeNamespace(newNamespace) with orchestration
- [ ] addFactoryToAutoSync(factoryName)
- [ ] removeFactoryFromAutoSync(factoryName)
- [ ] performAutoSave() with retry logic
- [ ] detectConflicts() and resolveConflict()

**Unit Tests** (write alongside - no HTML rendering):
- [ ] Debouncing logic for auto-save
- [ ] Guard conditions prevent invalid saves
- [ ] Retry logic with exponential backoff
- [ ] Conflict detection algorithms (timestamp + UUID comparison)
- [ ] Namespace change orchestration (suspend → load → clear status → resume)
- [ ] autoSyncSuspended flag behavior during bulk operations

**Integration Tests** (component tests with Vue):
- [ ] Auto-sync enable/disable UI in CloudSyncTab
- [ ] Factory selection for auto-sync
- [ ] Conflict resolution modal displays correctly
- [ ] Namespace change warning modal
- [ ] New factory prompt for auto-sync inclusion
- [ ] Status indicators update reactively during auto-save cycle

**Manual Testing**:
- [ ] Enable/disable auto-sync
- [ ] Debouncing prevents excessive saves (verify Drive API calls)
- [ ] Retry logic works on simulated network failure
- [ ] Error modal shows after max retries
- [ ] Conflict detection on app load (multi-device scenario)
- [ ] Conflict detection before save
- [ ] Namespace change warns about unsaved changes
- [ ] New factory prompt appears when auto-sync enabled
- [ ] Status indicators update in real-time (dirty → saving → clean)

---

### Phase 5: Polish & Performance

**Goal**: Optimize, handle edge cases, and prepare for production.

**Implementation**:
- [ ] Performance optimization (rate limiting, caching namespace list, abort controllers)
- [ ] Error handling edge cases (quota exceeded, auth expired, network offline)
- [ ] Add loading states and animations polish
- [ ] Documentation updates (JSDoc comments, README)
- [ ] User guide/wiki article

**Unit Tests**:
- [ ] Rate limiting logic
- [ ] Cache invalidation strategies
- [ ] Abort controller cleanup

**Integration Tests** (comprehensive):
- [ ] All components work together smoothly
- [ ] Error states display helpful messages
- [ ] Loading states provide user feedback

**Manual Testing** (stress & edge cases):
- [ ] Stress testing (many factories, rapid changes)
- [ ] Network failure scenarios (offline mode, timeouts, interrupted uploads)
- [ ] Multi-device coordination stress test
- [ ] Rate limit handling (Google Drive quotas)
- [ ] Full end-to-end workflow verification
- [ ] Performance is acceptable with large datasets

## Testing Strategy

### Unit Tests

**cloudSync Store**:
- State initialization
- Authentication state management
- Status tracking logic
- Conflict detection algorithms
- Namespace validation

**useGoogleDrive Composable**:
- Mock Google API responses
- File upload/download/delete
- Folder creation and navigation
- Error handling

**Components**:
- `NamespaceSelector` validation
- `CloudSyncTab` user interactions
- `RestoreFactoryModal` conflict detection

### Integration Tests

**Backup/Restore Flow**:
1. Create factory locally
2. Backup to Drive
3. Delete local factory
4. Restore from Drive
5. Verify data integrity

**Auto-Sync Flow**:
1. Enable auto-sync
2. Modify factory (add recipe, toggle link)
3. Wait for debounce
4. Verify file updated in Drive
5. Verify status changes (dirty → saving → clean)

**Conflict Resolution**:
1. Setup: Create factory on Device A, backup
2. Modify on Device A (don't sync)
3. Load on Device B, modify, sync
4. Return to Device A
5. Verify conflict detected
6. Test both resolution paths (cloud/local)

**Multi-Device Scenario**:
1. Device A: Create factories, enable auto-sync
2. Device B: Load app, detect backups, prompt to restore
3. Device B: Enable auto-sync, modify factories
4. Device A: Reload, detect conflicts
5. Resolve conflicts

### Manual Testing Checklist

- [ ] OAuth flow completes successfully
- [ ] Namespace autocomplete shows existing namespaces
- [ ] Can create new namespaces
- [ ] Factory backup creates `.sptrak` file in correct folder
- [ ] Restore prompts for rename on conflict
- [ ] Auto-sync enables/disables correctly
- [ ] Status indicators update in real-time
- [ ] Debouncing prevents excessive saves
- [ ] Retry logic works on network failure
- [ ] Error modal shows after max retries
- [ ] Conflict detection works on app load
- [ ] Conflict detection works before save
- [ ] Namespace change warns about unsaved changes
- [ ] New factory prompt appears when auto-sync enabled
- [ ] Multi-device conflict resolution
- [ ] Header icon shows correct state
- [ ] Factory badges show correct state
- [ ] Collapsed drawer shows colored dots

## Dependencies

### New NPM Packages

```json
{
  "dependencies": {
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@types/uuid": "^10.0.0"
  }
}
```

### Google API Setup

**Required APIs**:
- Google Drive API v3
- Google OAuth 2.0

**OAuth Scopes**:
```typescript
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file'  // Per-file access
]
```

**OAuth Configuration**:
1. Create project in Google Cloud Console
2. Enable Drive API
3. Configure OAuth consent screen
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized JavaScript origins
6. Add authorized redirect URIs

**Environment Variables** (`.env`):
```
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_API_KEY=your_api_key_here
```

## Google Drive Folder Structure

```
/SatisProdTrak/                    (Root app folder)
  ├─ Main Game/                    (Namespace)
  │   ├─ Main Base.sptrak
  │   ├─ Steel Factory.sptrak
  │   └─ Oil Processing.sptrak
  ├─ Experimental/                 (Namespace)
  │   ├─ Test Setup.sptrak
  │   └─ Nuclear Plant.sptrak
  └─ Multiplayer Server/           (Namespace)
      └─ Shared Factory.sptrak
```

## Security Considerations

1. **Token Storage**: OAuth tokens stored in Pinia with persistence (localStorage)
2. **Token Refresh**: Automatic refresh before expiry
3. **Scope Limitation**: Only request `drive.file` scope (app-created files only)
4. **No Server**: Pure client-side implementation (no backend token storage)
5. **HTTPS Required**: Google OAuth requires HTTPS in production
6. **Content Security Policy**: Add Google API domains to CSP headers

## Performance Considerations

1. **Debouncing**: 2.5s debounce on auto-save prevents excessive API calls
2. **Batch Operations**: When possible, batch multiple file operations
3. **Caching**: Cache namespace list and file metadata
4. **Rate Limiting**: Respect Google Drive API quotas (1000 requests/100 seconds/user)
5. **Lazy Loading**: Only load file contents when needed (use metadata for lists)
6. **Abort Controllers**: Cancel in-flight requests when switching namespaces

## Error Handling

### Common Error Scenarios

1. **Network Failure**:
   - Retry with exponential backoff (3 attempts)
   - Show error modal after final failure
   - Disable auto-sync to prevent repeated failures

2. **Authentication Expiry**:
   - Attempt token refresh automatically
   - If refresh fails, show re-authentication prompt
   - Preserve auto-sync configuration for after re-auth

3. **Quota Exceeded**:
   - Show specific error message about Drive quota
   - Suggest cleaning up old backups
   - Disable auto-sync until resolved

4. **Conflict Detection**:
   - Disable auto-sync immediately
   - Show conflict resolution modal
   - Prevent data loss with clear options

5. **File Not Found**:
   - Handle gracefully (file may have been deleted externally)
   - Remove from local tracking
   - Update UI to reflect missing backup

## Migration & Backwards Compatibility

### Initial Release
- No migration needed (new feature)
- Existing import/export continues to work unchanged
- Cloud sync is opt-in

### Future Enhancements
- File format versioning in metadata (`version: "1.0"`)
- Migration logic for future `.sptrak` format changes
- Backwards-compatible reading of older formats

## Documentation Requirements

### User-Facing Documentation
1. **Wiki Article**: "Cloud Sync with Google Drive" (see CLOUD_SYNC_WIKI.md)
2. **In-App Tooltips**: Context-sensitive help on all cloud sync features
3. **Setup Guide**: Step-by-step OAuth setup for first-time users

### Developer Documentation
1. **This Document**: Architecture and implementation plan
2. **API Reference**: Inline JSDoc for all cloud sync functions
3. **Testing Guide**: How to test cloud sync features locally

## Open Questions & Future Enhancements

### Open Questions
- **Q**: Should we support exporting to other cloud providers (Dropbox, OneDrive)?
  - **A**: Not in initial release, but architecture should allow for provider abstraction

- **Q**: Should we allow sharing `.sptrak` files with other users?
  - **A**: Future enhancement - would require Google Drive sharing permissions

- **Q**: Should we compress `.sptrak` files (gzip)?
  - **A**: Not initially - files are small and JSON is readable/debuggable

### Future Enhancements
1. **Backup History**: Keep multiple versions of each factory
2. **Backup Compression**: Reduce file size with gzip
3. **Selective Sync**: Choose which factories to sync per device
4. **Sync Settings**: Configurable debounce timing, retry attempts
5. **Cloud Provider Abstraction**: Support multiple cloud storage providers
6. **Offline Mode**: Queue changes while offline, sync when reconnected
7. **Sharing**: Share factories with other users via Drive sharing
8. **Export/Import Presets**: Save common external input configurations
9. **Backup Scheduling**: Scheduled backups (daily, weekly)
10. **Merge Conflicts**: Advanced 3-way merge for conflicts instead of choose-one

## Success Criteria

### Functional Requirements Met
- ✅ Users can authenticate with Google Drive
- ✅ Users can backup individual factories to Drive
- ✅ Users can restore factories from Drive with rename
- ✅ Users can enable auto-sync for selected factories
- ✅ Auto-sync triggers on factory changes with debouncing
- ✅ Conflicts are detected and resolved manually
- ✅ Visual indicators show sync status (header + drawer)
- ✅ Namespace organization works correctly
- ✅ Multi-device usage is supported with conflict handling

### Non-Functional Requirements Met
- ✅ No data loss in any scenario
- ✅ Performance impact is minimal (debouncing, caching)
- ✅ Error handling is comprehensive and user-friendly
- ✅ UI is intuitive and follows existing design patterns
- ✅ Code is well-tested (unit + integration)
- ✅ Documentation is complete and clear

### User Experience Goals
- ✅ Users feel confident their data is backed up
- ✅ Multi-device workflow is seamless
- ✅ Conflicts are rare and easy to resolve
- ✅ Visual feedback is clear and informative
- ✅ Setup process is straightforward

## Timeline Estimate

- **Phase 1**: Core Infrastructure - 1 week
- **Phase 2**: Manual Backup/Restore - 1 week
- **Phase 3**: Auto-Sync Core - 1 week
- **Phase 4**: Conflict Detection - 1 week
- **Phase 5**: Visual Indicators - 1 week
- **Phase 6**: Polish & Testing - 1 week

**Total Estimate**: 6 weeks for full implementation and testing

## Notes

- Implementation should follow existing codebase conventions (Composition API, TypeScript, etc.)
- All components should use Vuetify 3 components for consistency
- Testing should use existing Vitest setup
- Error handling should integrate with existing `errorStore`
- Status persistence uses existing `pinia-plugin-persistedstate`
