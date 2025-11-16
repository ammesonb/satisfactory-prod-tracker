<script setup lang="ts">
import { computed } from 'vue'

import { getStores } from '@/composables/useStores'

const selectedFactories = defineModel<string[]>({ default: [] })

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  backup: []
}>()

const { factoryStore } = getStores()

const availableFactories = computed(() => factoryStore.factoryList)
const canBackup = computed(() => selectedFactories.value.length > 0)
</script>

<template>
  <div class="mt-4">
    <div class="text-subtitle-2 mb-2">Manual Backup</div>
    <FactorySelector
      v-model="selectedFactories"
      :factories="availableFactories"
      title="Select Factories to Backup"
    />
    <v-btn color="primary" class="mt-2" :disabled="disabled || !canBackup" @click="emit('backup')">
      <v-icon class="mr-2">mdi-cloud-upload</v-icon>
      Backup {{ selectedFactories.length }} Factor{{ selectedFactories.length === 1 ? 'y' : 'ies' }}
    </v-btn>
  </div>
</template>
