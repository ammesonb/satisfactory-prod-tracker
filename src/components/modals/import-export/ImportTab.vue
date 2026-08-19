<script setup lang="ts">
import { computed, ref } from 'vue'

import { useDataShare } from '@/composables/useDataShare'
import { getStores } from '@/composables/useStores'
import { parseFactoriesFromJson, type Factory } from '@/types/factory'

const emit = defineEmits<{
  error: [message: string]
  success: []
}>()

const { factoryStore, cloudSyncStore } = getStores()
const { importFromClipboard, importFromFile, handleFileImport, fileInput } = useDataShare()
const selectedFactories = ref<string[]>([])
const factoriesToImport = ref<Record<string, Factory>>({})
const autoSyncImported = ref(false)
// Track renamed factories: original name -> new name
const importAliases = ref<Record<string, string>>({})

// Get the effective name for a factory (alias or original)
const getEffectiveName = (originalName: string) => {
  return importAliases.value[originalName] || originalName
}

// Check if a factory name has a conflict
const hasConflict = (originalName: string) => {
  const effectiveName = getEffectiveName(originalName)
  return !!factoryStore.factories[effectiveName]
}

// Check if any selected factory has a conflict
const hasSelectedConflicts = computed(() => {
  return selectedFactories.value.some((name) => hasConflict(name))
})

// Handle factory rename
const handleRename = (originalName: string, newName: string) => {
  if (newName === originalName) {
    delete importAliases.value[originalName]
  } else {
    importAliases.value[originalName] = newName
  }
}

const importFactories = async (loader: () => Promise<string>) => {
  selectedFactories.value = []
  factoriesToImport.value = {}
  importAliases.value = {}

  try {
    const data = await loader()
    if (!data || data.trim() === '') {
      emit('error', 'Clipboard is empty or contains no data')
      return
    }
    factoriesToImport.value = parseFactoriesFromJson(data)

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

  if (hasSelectedConflicts.value) {
    emit('error', 'Please resolve name conflicts before importing')
    return
  }

  try {
    factoryStore.importFactories(
      selectedFactories.value.reduce(
        (factories, originalName) => {
          const effectiveName = getEffectiveName(originalName)
          const factory = { ...factoriesToImport.value[originalName], name: effectiveName }
          return {
            ...factories,
            [effectiveName]: factory,
          }
        },
        {} as Record<string, Factory>,
      ),
    )

    if (autoSyncImported.value) {
      selectedFactories.value.forEach((originalName) => {
        const effectiveName = getEffectiveName(originalName)
        cloudSyncStore.addFactoryToAutoSync(effectiveName)
      })
    }

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
      >
        <template #subtitle="{ factory }">
          <span v-if="hasConflict(factory.name)" class="text-warning">
            <v-icon icon="mdi-alert" size="small" class="me-1" />
            Name conflict - rename to import
          </span>
          <span v-else-if="importAliases[factory.name]" class="text-success">
            Will import as "{{ importAliases[factory.name] }}"
          </span>
        </template>
        <template #row-actions="{ factory }">
          <v-btn
            v-if="hasConflict(factory.name)"
            size="small"
            variant="text"
            color="warning"
            @click.stop="handleRename(factory.name, factory.name + ' (imported)')"
          >
            <v-icon icon="mdi-pencil" class="me-1" />
            Rename
          </v-btn>
        </template>
      </FactorySelector>

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
              <span v-if="hasSelectedConflicts" class="text-warning">
                ({{ selectedFactories.filter((n) => hasConflict(n)).length }} with conflicts)
              </span>
            </div>
          </div>
          <v-btn
            color="secondary"
            @click="performImport"
            :disabled="selectedFactories.length === 0 || hasSelectedConflicts"
            size="small"
          >
            <v-icon icon="mdi-import" class="me-1" />
            Import
          </v-btn>
        </div>
        <v-checkbox
          v-if="cloudSyncStore.autoSync.enabled"
          v-model="autoSyncImported"
          label="Auto-sync imported factories"
          :hide-details="true"
          density="compact"
          class="mt-2"
        />
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
