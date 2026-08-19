<script setup lang="ts">
import { computed, ref } from 'vue'

import { getStores } from '@/composables/useStores'
import type { GoogleDriveFile } from '@/types/cloudSync'
import { extractFactoryNameFromFilename } from '@/utils/sptrak'

interface Props {
  backup: GoogleDriveFile
}

const props = defineProps<Props>()
const emit = defineEmits<{
  restore: [importAlias?: string]
  delete: []
}>()

const { factoryStore } = getStores()

const factoryName = computed(() => extractFactoryNameFromFilename(props.backup.name))
const importAlias = ref<string | undefined>(undefined)

const effectiveName = computed(() => importAlias.value || factoryName.value)

const hasNameConflict = computed(() => {
  return !!factoryStore.factories[effectiveName.value]
})

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString()
}

const handleRename = (_oldName: string, newName: string) => {
  importAlias.value = newName !== factoryName.value ? newName : undefined
}

const handleRestore = () => {
  if (hasNameConflict.value) return
  emit('restore', importAlias.value)
}
</script>

<template>
  <v-list-item>
    <template #prepend>
      <v-icon icon="mdi-cloud-outline" />
    </template>

    <template #title>
      <FactoryName
        :name="importAlias || factoryName"
        @rename="handleRename"
        @delete="emit('delete')"
      />
    </template>

    <template #subtitle> Last modified: {{ formatTimestamp(backup.modifiedTime) }} </template>

    <template #append>
      <v-btn size="small" color="secondary" @click="handleRestore" :disabled="hasNameConflict">
        <v-icon class="mr-1">mdi-download</v-icon>
        Restore
      </v-btn>
    </template>
  </v-list-item>
</template>
