<script setup lang="ts">
import { ref } from 'vue'

import { getStores } from '@/composables/useStores'

interface Props {
  name: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  rename: [oldName: string, newName: string]
  delete: []
}>()

const { factoryStore } = getStores()

const isEditingName = ref(false)
const editedName = ref('')

const startEdit = () => {
  editedName.value = props.name
  isEditingName.value = true
}

const finishEdit = () => {
  const trimmed = editedName.value.trim()
  if (!trimmed) {
    isEditingName.value = false
    return
  }

  if (trimmed !== props.name) {
    // Check for name conflict
    if (factoryStore.factories[trimmed]) {
      // Don't close the input, just show error via text field
      return
    }
    emit('rename', props.name, trimmed)
  }
  isEditingName.value = false
}

const cancelEdit = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isEditingName.value = false
  }
}

const hasNameConflict = (name: string) => {
  return name.trim() !== props.name && !!factoryStore.factories[name.trim()]
}
</script>

<template>
  <div class="factory-name">
    <v-text-field
      v-if="isEditingName"
      v-model="editedName"
      density="compact"
      hide-details="auto"
      autofocus
      :error="hasNameConflict(editedName)"
      :error-messages="
        hasNameConflict(editedName) ? 'A factory with this name already exists' : undefined
      "
      @blur="finishEdit"
      @keydown.enter="finishEdit"
      @keydown.esc="cancelEdit"
      @click.stop
    />
    <span v-else>{{ name }}</span>

    <v-btn
      icon="mdi-pencil"
      size="small"
      variant="text"
      color="secondary"
      @click.stop="startEdit"
    />
    <v-btn
      icon="mdi-delete"
      size="small"
      variant="text"
      color="error"
      @click.stop="emit('delete')"
    />
  </div>
</template>

<style scoped>
.factory-name {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
