<script setup lang="ts">
import { computed, ref } from 'vue'

import { getStores } from '@/composables/useStores'
import {
  getGlobalSyncStatus,
  getGlobalSyncTooltip,
  getSyncStatusColor,
  getSyncStatusIcon,
} from '@/utils/cloudSync'

const { factoryStore, googleAuthStore, cloudSyncStore } = getStores()
const showImportExport = ref(false)
const initialTab = ref<'export' | 'import' | 'cloud'>('export')

const syncBadge = computed(() => {
  const status = getGlobalSyncStatus(factoryStore.factories)
  const isAuthenticated = googleAuthStore.isAuthenticated
  const autoSyncEnabled = cloudSyncStore.autoSync.enabled

  return {
    color: autoSyncEnabled ? getSyncStatusColor(status) : 'info',
    icon: getSyncStatusIcon(status),
    tooltip: isAuthenticated
      ? autoSyncEnabled
        ? getGlobalSyncTooltip(status, isAuthenticated)
        : 'Signed in - configure backups in Cloud Sync tab'
      : 'Connect to Google Drive',
    show: isAuthenticated,
  }
})

const handleSyncIconClick = () => {
  initialTab.value = 'cloud'
  showImportExport.value = true
}

const handleImportExportClick = () => {
  initialTab.value = 'export'
  showImportExport.value = true
}
</script>

<template>
  <v-app-bar>
    <v-app-bar-title class="d-flex align-center" style="flex: 0 1 auto; min-width: 0">
      <span class="text-truncate me-2">
        <span class="d-none d-md-inline">Factory Production Tracker</span>
        <span class="d-inline d-md-none">Factory Tracker</span>
      </span>
      <v-chip v-if="factoryStore.selected" size="small" color="info" class="flex-shrink-0">
        <span class="text-truncate">{{ factoryStore.selected }}</span>
      </v-chip>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <!-- Cloud Sync Indicator -->
    <v-tooltip :text="syncBadge.tooltip" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" @click="handleSyncIconClick" class="me-2">
          <!-- Not authenticated: Google icon -->
          <v-icon v-if="!syncBadge.show">mdi-google-drive</v-icon>

          <!-- Authenticated: Cloud with status indicator -->
          <v-badge v-else :color="syncBadge.color" dot offset-x="6" offset-y="6">
            <v-icon>mdi-cloud</v-icon>
          </v-badge>
        </v-btn>
      </template>
    </v-tooltip>

    <v-btn
      @click="handleImportExportClick"
      variant="outlined"
      class="me-2 show-import-export"
      color="secondary"
    >
      <v-icon icon="mdi-database-export" />
      <span class="d-none d-sm-inline ms-2">Import/Export</span>
    </v-btn>

    <ThemeSwitcher />

    <ImportExportModal v-model="showImportExport" :initial-tab="initialTab" />
  </v-app-bar>
</template>
