<script setup lang="ts">
import type { GoogleDriveFile } from '@/types/cloudSync'

defineProps<{
  backups: GoogleDriveFile[]
  loading: boolean
}>()

const emit = defineEmits<{
  restore: [backup: GoogleDriveFile]
  delete: [backup: GoogleDriveFile]
  refresh: []
}>()

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString()
}
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
        <v-list-item v-for="backup in backups" :key="backup.id">
          <template v-slot:prepend>
            <v-icon icon="mdi-cloud-outline" />
          </template>

          <v-list-item-title>{{ backup.name }}</v-list-item-title>
          <v-list-item-subtitle>
            Last modified: {{ formatTimestamp(backup.modifiedTime) }}
          </v-list-item-subtitle>

          <template v-slot:append>
            <div class="d-flex gap-2">
              <v-btn size="small" color="secondary" @click="emit('restore', backup)">
                <v-icon class="mr-1">mdi-download</v-icon>
                Restore
              </v-btn>
              <v-btn size="small" variant="text" color="error" @click="emit('delete', backup)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>

      <div v-else class="pa-4 text-center text-medium-emphasis no-backups">
        No backups found in this namespace
      </div>
    </v-card>
  </div>
</template>
