<script setup lang="ts">
import { ref } from 'vue'

import { getIconURL } from '@/logistics/images'
import type { Factory } from '@/types/factory'

interface Props {
  factory: Factory
  rail: boolean
  selected: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['select', 'delete', 'rename'])

const showDeleteConfirm = ref(false)
const isEditingName = ref(false)
const editedName = ref('')

const handleDelete = () => {
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  emit('delete', props.factory.name)
}

const startEdit = () => {
  editedName.value = props.factory.name
  isEditingName.value = true
}

const finishEdit = () => {
  const trimmed = editedName.value.trim()
  if (trimmed && trimmed !== props.factory.name) {
    emit('rename', props.factory.name, trimmed)
  }
  isEditingName.value = false
}

const cancelEdit = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isEditingName.value = false
  }
}
</script>

<template>
  <v-list-item
    @click="!isEditingName && emit('select')"
    :active="props.selected"
  >
    <template #prepend>
      <FactorySyncBadge :factory="props.factory" :rail="props.rail">
        <v-img :src="getIconURL(props.factory.icon, 64)" width="32" height="32" class="mr-1" />
      </FactorySyncBadge>
    </template>

    <template #title v-if="!props.rail">
      <v-text-field
        v-if="isEditingName"
        v-model="editedName"
        density="compact"
        hide-details
        autofocus
        @blur="finishEdit"
        @keydown.enter="finishEdit"
        @keydown.esc="cancelEdit"
        @click.stop
      />
      <span v-else>{{ props.factory.name }}</span>
    </template>

    <template #append>
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
        @click.stop="handleDelete"
      />
    </template>
  </v-list-item>

  <ConfirmationModal
    v-model:show="showDeleteConfirm"
    title="Delete Factory"
    :message="`Are you sure you want to delete '${props.factory.name}'? This action cannot be undone.`"
    confirm-text="Delete"
    cancel-text="Cancel"
    @confirm="confirmDelete"
    @cancel="() => {}"
  />
</template>
