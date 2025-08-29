<script setup lang="ts">
import { useFactoryStore } from '@/stores/factory'

const emit = defineEmits<{
  'edit-all-floors': []
}>()

const factoryStore = useFactoryStore()
</script>

<template>
  <v-card flat class="mb-4">
    <v-card-text class="d-flex align-center py-2">
      <v-spacer />
      <v-btn
        variant="outlined"
        prepend-icon="mdi-pencil-box-multiple"
        @click="emit('edit-all-floors')"
        :disabled="!factoryStore.currentFactory || factoryStore.currentFactory.floors.length === 0"
      >
        Edit Floors
      </v-btn>
    </v-card-text>
  </v-card>
</template>
