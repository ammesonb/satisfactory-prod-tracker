<script setup lang="ts">
import { ref } from 'vue'

import { getStores } from '@/composables/useStores'

const { factoryStore } = getStores()
const showImportExport = ref(false)
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

    <v-btn
      @click="showImportExport = true"
      variant="outlined"
      class="me-2 show-import-export"
      color="secondary"
    >
      <v-icon icon="mdi-database-export" />
      <span class="d-none d-sm-inline ms-2">Import/Export</span>
    </v-btn>

    <ThemeSwitcher />

    <ImportExportModal v-model="showImportExport" />
  </v-app-bar>
</template>
