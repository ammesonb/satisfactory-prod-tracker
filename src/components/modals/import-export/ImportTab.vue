<script setup lang="ts">
import { getStores } from '@/composables/useStores'
import { useDataShare } from '@/composables/useDataShare'
import { parseFactoriesFromJson, type Factory } from '@/types/factory'
import { ref } from 'vue'

const emit = defineEmits<{
  error: [message: string]
  success: []
}>()

const { factoryStore } = getStores()
const { importFromClipboard, importFromFile, handleFileImport, fileInput } = useDataShare()
const selectedFactories = ref<string[]>([])
const factoriesToImport = ref<Record<string, Factory>>({})

const importFactories = async (loader: () => Promise<string>) => {
  selectedFactories.value = []
  factoriesToImport.value = {}

  try {
    factoriesToImport.value = parseFactoriesFromJson(await loader())

    // Reset file input on successful parsing
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (err) {
    emit('error', err instanceof Error ? err.message : `Import failed: ${err}`)
  }
}

const handleFileChange = async (event: Event) => {
  await importFactories(() => handleFileImport(event))
}

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
            [name]: factoriesToImport.value[name],
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
      <v-btn @click="importFactories(importFromClipboard)" variant="outlined" class="flex-grow-1">
        <v-icon icon="mdi-content-paste" class="me-2" />
        From Clipboard
      </v-btn>
      <v-btn @click="importFromFile" variant="outlined" class="flex-grow-1">
        <v-icon icon="mdi-file-upload" class="me-2" />
        Upload File
      </v-btn>
    </div>

    <!-- Show factories if data is parsed -->
    <div v-if="Object.keys(factoriesToImport).length > 0">
      <FactorySelector
        v-model="selectedFactories"
        :factories="Object.values(factoriesToImport)"
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
      @change="handleFileChange"
    />
  </div>
</template>
