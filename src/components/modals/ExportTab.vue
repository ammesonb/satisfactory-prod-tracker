<script setup lang="ts">
import { useFactoryStore } from '@/stores/factory'
import { ref, computed } from 'vue'
import FactorySelector from '../common/FactorySelector.vue'

const emit = defineEmits<{
  error: [message: string]
}>()

const factoryStore = useFactoryStore()
const selectedFactories = ref<string[]>([])

const factoryList = computed(() => Object.values(factoryStore.factories))

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
      :factories="factoryList"
      title="Select Factories to Export"
    />

    <!-- Export Buttons -->
    <div class="d-flex gap-2">
      <v-btn
        color="success"
        @click="exportToClipboard"
        :disabled="selectedFactories.length === 0"
        variant="outlined"
        class="flex-grow-1"
      >
        <v-icon icon="mdi-content-copy" class="me-2" />
        Export to Clipboard
      </v-btn>
      <v-btn
        color="success"
        @click="exportToFile"
        :disabled="selectedFactories.length === 0"
        class="flex-grow-1"
      >
        <v-icon icon="mdi-download" class="me-2" />
        Export to File
      </v-btn>
    </div>
  </div>
</template>
