<script setup lang="ts">
import { useCloudSyncTab } from '@/components/modals/cloud-sync/useCloudSyncTab'

const {
  error,
  availableFactories,
  availableNamespaces,
  conflictedFactories,
  googleAuthStore,
  cloudSyncStore,
  canSync,
  backupFiles,
  loadingBackups,
  authenticate,
  backupFactory,
  restoreBackup,
  deleteBackup,
  refreshBackups,
  signOut,
  toggleAutoSync,
  clearError,
  resolveConflictKeepLocal,
  resolveConflictUseCloud,
  getFactorySyncStatus,
} = useCloudSyncTab()
</script>

<template>
  <div class="mt-3">
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-3"
      closable
      @click:close="clearError"
    >
      {{ error }}
    </v-alert>

    <CloudAuth v-if="!googleAuthStore.isAuthenticated" @authenticate="authenticate" />

    <template v-else>
      <SignedInUser :email="googleAuthStore.userEmail ?? ''" @sign-out="signOut" />

      <!-- Sync Configuration -->
      <v-card>
        <v-card-text>
          <v-text-field
            v-model="cloudSyncStore.displayId"
            label="Device Name"
            hint="A friendly name to identify this device in sync conflicts"
            placeholder="e.g. Gaming PC, Laptop"
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-laptop"
            persistent-hint
            class="mb-4"
          />

          <NamespaceSelector
            v-model="cloudSyncStore.autoSync.namespace"
            :available-namespaces="availableNamespaces"
            label="Namespace"
            hint="Select or create a namespace to organize your backups"
            @blur="refreshBackups"
          />

          <SyncConflicts
            :conflicts="conflictedFactories"
            class="mt-4"
            @keep-local="resolveConflictKeepLocal"
            @use-cloud="resolveConflictUseCloud"
          />

          <template v-if="canSync">
            <!-- Factory Selection with Backup Now buttons -->
            <div class="mt-4">
              <FactorySelector
                v-model="cloudSyncStore.autoSync.selectedFactories"
                :factories="availableFactories"
                title="Factories to Sync"
              >
                <template #subtitle="{ factory }">
                  <span :class="`text-${getFactorySyncStatus(factory).color}`">
                    {{ getFactorySyncStatus(factory).text }}
                  </span>
                </template>
                <template #row-actions="{ factory }">
                  <v-btn
                    size="small"
                    variant="text"
                    color="primary"
                    @click.stop="backupFactory(factory)"
                  >
                    Backup Now
                  </v-btn>
                </template>
              </FactorySelector>
            </div>

            <!-- Auto-Sync Toggle -->
            <div class="d-flex align-center justify-space-between mt-3">
              <div>
                <div class="text-body-1">Auto-Sync</div>
                <div class="text-caption text-medium-emphasis">
                  Automatically save selected factories after 10 seconds of inactivity
                </div>
              </div>
              <v-switch
                :model-value="cloudSyncStore.autoSync.enabled"
                color="primary"
                hide-details
                density="compact"
                :disabled="cloudSyncStore.autoSync.selectedFactories.length === 0"
                @update:model-value="toggleAutoSync"
              />
            </div>
          </template>

          <v-alert v-else type="info" variant="tonal" class="mt-4">
            Select a namespace to configure sync
          </v-alert>
        </v-card-text>
      </v-card>

      <!-- Available Backups -->
      <v-card v-if="canSync" class="mt-3">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Cloud Backups</span>
          <v-btn
            icon="mdi-refresh"
            variant="text"
            size="small"
            :loading="loadingBackups"
            @click="refreshBackups"
          />
        </v-card-title>
        <v-card-text>
          <BackupList
            :backups="backupFiles"
            :loading="loadingBackups"
            @restore="restoreBackup"
            @delete="deleteBackup"
            @refresh="refreshBackups"
          />
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>
