<script setup lang="ts">
import type { ConflictInfo } from '@/types/cloudSync'
import type { Factory } from '@/types/factory'

type ConflictedFactory = Factory & { conflict: ConflictInfo }

defineProps<{
  conflicts: ConflictedFactory[]
}>()

const emit = defineEmits<{
  keepLocal: [factoryName: string]
  useCloud: [factoryName: string]
}>()

function formatTimestamp(timestamp: string | number): string {
  if (timestamp === 'Never synced') {
    return 'Never synced'
  }
  return new Date(timestamp).toLocaleString()
}
</script>

<template>
  <v-card v-if="conflicts.length > 0" color="warning" variant="tonal">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-alert</v-icon>
      Sync Conflicts Detected
    </v-card-title>
    <v-card-text>
      <p class="mb-3">
        The following factories have conflicts between local and cloud versions. Choose which
        version to keep:
      </p>
      <div v-for="factory in conflicts" :key="factory.name" class="mb-3">
        <div class="d-flex align-center mb-1">
          <v-icon color="warning" size="small" class="mr-2">mdi-alert-circle</v-icon>
          <span class="text-body-1 font-weight-medium">{{ factory.name }}</span>
        </div>
        <div class="text-caption text-medium-emphasis ml-7 mb-2">
          <div>Local: {{ formatTimestamp(factory.conflict.localTimestamp) }}</div>
          <div>
            Cloud: {{ factory.conflict.cloudDisplayId }} ({{
              formatTimestamp(factory.conflict.cloudTimestamp)
            }})
          </div>
        </div>
        <div class="d-flex ml-7 ga-2">
          <v-btn
            size="small"
            variant="outlined"
            color="primary"
            @click="emit('keepLocal', factory.name)"
          >
            Keep Local
          </v-btn>
          <v-btn
            size="small"
            variant="outlined"
            color="secondary"
            @click="emit('useCloud', factory.name)"
          >
            Use Cloud
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
