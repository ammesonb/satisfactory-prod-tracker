<script setup lang="ts">
import { getStores } from '@/composables/useStores'
import { ref } from 'vue'

const emit = defineEmits<{
  error: [message: string]
}>()

const { factoryStore } = getStores()
const selectedFactories = ref<string[]>([])

const exportToClipboard = async () => {
  if (selectedFactories.value.length === 0) {
    emit('error', 'Please select at least one factory to export')
    return
  }

  try {
    const factories = factoryStore.exportFactories(selectedFactories.value)
    const jsonString = JSON.stringify(factories, null, 2)
    await navigator.clipboard.writeText(jsonString)
  } catch (err) {
    emit('error', `Failed to copy to clipboard: ${err}`)
  }
}

const exportToFile = () => {
  if (selectedFactories.value.length === 0) {
    emit('error', 'Please select at least one factory to export')
    return
  }

  try {
    const factories = JSON.stringify(factoryStore.exportFactories(selectedFactories.value), null, 2)
    const url = URL.createObjectURL(new Blob([factories], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `satisfactory-tracker-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    emit('error', `Failed to export to file: ${err}`)
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
            @click="exportToClipboard"
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
            @click="exportToFile"
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
