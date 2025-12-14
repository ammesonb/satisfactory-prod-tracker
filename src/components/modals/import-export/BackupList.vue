<script setup lang="ts">
import type { GoogleDriveFile } from '@/types/cloudSync'

defineProps<{
  backups: GoogleDriveFile[]
  loading: boolean
}>()

const emit = defineEmits<{
  restore: [backup: GoogleDriveFile, importAlias?: string]
  delete: [backup: GoogleDriveFile]
  refresh: []
}>()
</script>

<template>
  <div class="mt-4">
    <div class="d-flex justify-space-between align-center mb-2">
      <div class="text-subtitle-2">Available Backups</div>
      <v-btn size="small" color="success" @click="emit('refresh')" :loading="loading">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </div>

    <v-card variant="outlined" max-height="400" style="overflow-y: auto">
      <v-list v-if="backups.length > 0">
        <FactoryBackupEntry
          v-for="backup in backups"
          :key="backup.id"
          :backup="backup"
          @restore="(importAlias?: string) => emit('restore', backup, importAlias)"
          @delete="emit('delete', backup)"
        />
      </v-list>

      <div v-else class="pa-4 text-center text-medium-emphasis no-backups">
        No backups found in this namespace
      </div>
    </v-card>
  </div>
</template>
