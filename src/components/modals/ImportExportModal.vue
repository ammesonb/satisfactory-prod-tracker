<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { getStores } from '@/composables/useStores'

const props = defineProps<{
  initialTab?: 'export' | 'import' | 'cloud'
}>()

const { factoryStore } = getStores()
const isOpen = defineModel<boolean>({ default: false })
const activeTab = ref<'export' | 'import' | 'cloud'>('export')
const error = ref('')

const defaultTab = computed(() => (factoryStore.hasFactories ? 'export' : 'import'))

// When modal opens with initialTab prop, switch to that tab
watch(
  () => isOpen.value,
  (newValue) => {
    if (newValue && props.initialTab) {
      activeTab.value = props.initialTab
    }
  },
)

const clearError = () => {
  error.value = ''
}

const handleError = (message: string) => {
  error.value = message
}

const handleImportSuccess = () => {
  isOpen.value = false
}

const resetModal = () => {
  error.value = ''
  activeTab.value = defaultTab.value
}

// Reset when modal closes
const handleModalChange = (value: boolean) => {
  if (!value) {
    resetModal()
  }
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="800px" @update:model-value="handleModalChange">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-database-export" class="me-2" />
        Import/Export Factories
        <v-spacer />
        <v-btn icon @click="isOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Error Banner -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mx-4 mb-0"
        closable
        @click:close="clearError"
      >
        {{ error }}
      </v-alert>

      <v-tabs v-model="activeTab" color="secondary">
        <v-tab value="export">
          <v-icon icon="mdi-export" class="me-2" />
          Export
        </v-tab>
        <v-tab value="import">
          <v-icon icon="mdi-import" class="me-2" />
          Import
        </v-tab>
        <v-tab value="cloud">
          <v-icon icon="mdi-cloud" class="me-2" />
          Cloud Sync
        </v-tab>
      </v-tabs>

      <v-card-text class="pt-0">
        <v-window v-model="activeTab">
          <!-- Export Tab -->
          <v-window-item value="export">
            <ExportTab @error="handleError" />
          </v-window-item>

          <!-- Import Tab -->
          <v-window-item value="import">
            <ImportTab @error="handleError" @success="handleImportSuccess" class="mt-3" />
          </v-window-item>

          <!-- Cloud Sync Tab -->
          <v-window-item value="cloud">
            <CloudSyncTab @error="handleError" />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
