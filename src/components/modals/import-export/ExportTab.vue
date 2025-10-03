<script setup lang="ts">
import { getStores } from '@/composables/useStores'
import { useDataShare } from '@/composables/useDataShare'
import { ref } from 'vue'

const emit = defineEmits<{
  error: [message: string]
}>()

const { factoryStore } = getStores()
const { exportToClipboard, exportToFile } = useDataShare()
const selectedFactories = ref<string[]>([])

const exportFactories = async (exporter: (data: string) => void) => {
  if (selectedFactories.value.length === 0) {
    emit('error', 'Please select at least one factory to export')
    return
  }

  try {
    await exporter(JSON.stringify(factoryStore.exportFactories(selectedFactories.value)))
  } catch (err) {
    emit('error', `Failed to export factories: ${err}`)
  }
}
</script>

<template>
  <div>
    <FactorySelector
      v-model="selectedFactories"
      :factories="factoryStore.factoryList"
      title="Select Factories to Export"
    />

    <!-- Export Actions -->
    <v-card variant="outlined" class="mt-4 pa-4">
      <div class="d-flex align-center justify-space-between">
        <div>
          <div class="text-subtitle-2 mb-1">
            Export {{ selectedFactories.length }} Factor{{
              selectedFactories.length === 1 ? 'y' : 'ies'
            }}
          </div>
        </div>
        <div class="d-flex gap-3">
          <v-btn
            color="secondary"
            @click="exportFactories(exportToClipboard)"
            :disabled="selectedFactories.length === 0"
            variant="outlined"
            size="small"
            class="mr-2"
          >
            <v-icon icon="mdi-content-copy" class="me-2" />
            Clipboard
          </v-btn>
          <v-btn
            color="secondary"
            @click="exportFactories(exportToFile)"
            :disabled="selectedFactories.length === 0"
            size="small"
          >
            <v-icon icon="mdi-download" class="me-1" />
            File
          </v-btn>
        </div>
      </div>
    </v-card>
  </div>
</template>
