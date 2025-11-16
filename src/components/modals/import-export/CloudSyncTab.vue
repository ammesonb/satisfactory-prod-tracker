<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useBackupManager } from '@/composables/useBackupManager'
import { getStores } from '@/composables/useStores'
import type { GoogleDriveFile } from '@/types/cloudSync'

const { googleAuthStore, cloudSyncStore } = getStores()
const backupManager = useBackupManager()
const error = ref<string | null>(null)

// Load backups on mount if namespace is already selected
onMounted(async () => {
  if (cloudSyncStore.autoSync.namespace && googleAuthStore.isAuthenticated) {
    await handleRefresh()
  }
})

// ========================================
// Event Handlers
// ========================================

const handleAuthenticate = async () => {
  try {
    await cloudSyncStore.authenticate()
    // Load backups after successful authentication if namespace is selected
    if (cloudSyncStore.autoSync.namespace) {
      await handleRefresh()
    }
  } catch (err) {
    error.value = `Authentication failed: ${err instanceof Error ? err.message : 'Unknown error'}`
  }
}

const handleBackup = async () => {
  try {
    await backupManager.performBackup()
  } catch (err) {
    error.value = `Backup failed: ${err instanceof Error ? err.message : 'Unknown error'}`
  }
}

const handleRestore = async (backup: GoogleDriveFile) => {
  try {
    await backupManager.restoreBackup(backup)
  } catch (err) {
    error.value = `Restore failed: ${err instanceof Error ? err.message : 'Unknown error'}`
  }
}

const handleDelete = async (backup: GoogleDriveFile) => {
  if (!confirm(`Delete backup "${backup.name}"? This cannot be undone.`)) {
    return
  }

  try {
    await backupManager.deleteBackup(backup)
  } catch (err) {
    error.value = `Delete failed: ${err instanceof Error ? err.message : 'Unknown error'}`
  }
}

const handleRefresh = async () => {
  try {
    await backupManager.refreshBackupList()
  } catch (err) {
    error.value = `Failed to load backups: ${err instanceof Error ? err.message : 'Unknown error'}`
  }
}

const handleSignOut = () => {
  try {
    cloudSyncStore.signOut()
  } catch (err) {
    error.value = `Sign out failed: ${err instanceof Error ? err.message : 'Unknown error'}`
  }
}
</script>

<template>
  <div class="mt-3">
    <!-- Authentication Section -->
    <CloudAuth v-if="!googleAuthStore.isAuthenticated" @authenticate="handleAuthenticate" />

    <!-- Signed In User Section -->
    <span v-else>
      <!-- Error Alert -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-3"
        closable
        @click:close="error = null"
      >
        {{ error }}
      </v-alert>

      <v-card variant="outlined" class="mb-3">
        <v-card-text class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="mdi-account-circle" size="32" color="primary" class="me-3" />
            <div>
              <div class="text-body-2 text-medium-emphasis">Signed in as</div>
              <div class="text-body-1 font-weight-medium">{{ googleAuthStore.userEmail }}</div>
            </div>
          </div>
          <v-btn variant="outlined" color="primary" @click="handleSignOut">
            <v-icon class="me-1">mdi-logout</v-icon>
            Sign Out
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Backup/Restore Section -->
      <v-card>
        <v-card-text>
          <!-- Namespace Selector -->
          <NamespaceSelector
            v-model="cloudSyncStore.autoSync.namespace"
            label="Browse Namespace"
            hint="Select or create a namespace to organize your backups"
            @blur="handleRefresh"
          />

          <!-- Available Backups List -->
          <BackupList
            v-if="cloudSyncStore.autoSync.namespace"
            :backups="backupManager.backupFiles.value"
            :loading="backupManager.loadingBackups.value"
            @restore="handleRestore"
            @delete="handleDelete"
            @refresh="handleRefresh"
          />

          <!-- Manual Backup -->
          <ManualBackup
            v-if="cloudSyncStore.autoSync.namespace"
            v-model="backupManager.selectedFactoriesForBackup.value"
            :disabled="!backupManager.canBackup.value"
            @backup="handleBackup"
          />

          <!-- Prompt to select namespace -->
          <v-alert
            v-if="!cloudSyncStore.autoSync.namespace"
            type="info"
            variant="tonal"
            class="mt-4"
          >
            Please select or create a namespace to view and manage your backups
          </v-alert>
        </v-card-text>
      </v-card>
    </span>

    <!-- Conflicts Section will be implemented in Phase 4 -->
  </div>
</template>
