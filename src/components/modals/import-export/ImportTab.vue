<script setup lang="ts">
import { getStores } from '@/composables/useStores'
import { asFactory, type Factory } from '@/types/factory'
import { ref, watch } from 'vue'

const emit = defineEmits<{
  error: [message: string]
  success: []
}>()

const { factoryStore } = getStores()
const selectedFactories = ref<string[]>([])
const importData = ref('')
const importFactories = ref<Record<string, Factory>>({})
const fileInput = ref<HTMLInputElement>()

const importFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    importData.value = text
  } catch (err) {
    emit('error', `Failed to read from clipboard: ${err}`)
  }
}

const importFromFile = () => {
  fileInput.value?.click()
}

const handleFileImport = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    importData.value = (e.target?.result as string) || ''
  }
  reader.readAsText(file)
}

// Watch importData and parse automatically
watch(importData, () => {
  selectedFactories.value = []
  importFactories.value = {}

  if (!importData.value.trim()) {
    return
  }

  let data: Record<string, Factory>
  try {
    data = JSON.parse(importData.value)

    if (!data || typeof data !== 'object') {
      emit('error', 'Import data must be an object')
      return
    }
  } catch (err) {
    emit('error', `Invalid JSON format: ${err}`)
    return
  }

  try {
    const factories: Record<string, Factory> = {}
    for (const [name, factoryData] of Object.entries(data)) {
      factories[name] = asFactory(factoryData)
    }
    importFactories.value = factories

    // Reset file input on successful parsing
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (err) {
    emit('error', err instanceof Error ? err.message : `Import failed: ${err}`)
  }
})

const performImport = () => {
  if (selectedFactories.value.length === 0) {
    emit('error', 'Please select at least one factory to import')
    return
  }

  try {
    factoryStore.importFactories(
      selectedFactories.value.reduce(
        (factories, name) => {
          return {
            ...factories,
            [name]: importFactories.value[name],
          }
        },
        {} as Record<string, Factory>,
      ),
    )
    emit('success')
  } catch (err) {
    emit('error', err instanceof Error ? err.message : `Import failed: ${err}`)
  }
}
</script>

<template>
  <div>
    <!-- Import Source Buttons -->
    <div class="d-flex gap-2 mb-4">
      <v-btn @click="importFromClipboard" variant="outlined" class="flex-grow-1">
        <v-icon icon="mdi-content-paste" class="me-2" />
        From Clipboard
      </v-btn>
      <v-btn @click="importFromFile" variant="outlined" class="flex-grow-1">
        <v-icon icon="mdi-file-upload" class="me-2" />
        Upload File
      </v-btn>
    </div>

    <!-- Show factories if data is parsed -->
    <div v-if="Object.keys(importFactories).length > 0">
      <FactorySelector
        v-model="selectedFactories"
        :factories="Object.values(importFactories)"
        title="Select Factories to Import"
      />

      <!-- Import Actions -->
      <v-card variant="outlined" class="mt-4 pa-4">
        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="text-subtitle-2 mb-1">Import Selected Factories</div>
            <div class="text-caption text-medium-emphasis">
              {{ selectedFactories.length }} factor{{
                selectedFactories.length === 1 ? 'y' : 'ies'
              }}
              selected
            </div>
          </div>
          <v-btn
            color="secondary"
            @click="performImport"
            :disabled="selectedFactories.length === 0"
            size="small"
          >
            <v-icon icon="mdi-import" class="me-1" />
            Import
          </v-btn>
        </div>
      </v-card>
    </div>

    <!-- Show message if no data -->
    <v-card v-else variant="outlined" class="pa-4 text-center">
      <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-database-plus</v-icon>
      <p class="text-grey">Use the buttons above to load factory data</p>
    </v-card>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileImport"
    />
  </div>
</template>
