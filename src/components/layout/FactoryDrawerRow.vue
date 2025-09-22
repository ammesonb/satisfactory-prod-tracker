<script setup lang="ts">
import { ref } from 'vue'
import type { Factory } from '@/types/factory'
import { getIconURL } from '@/logistics/images'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'

interface Props {
  factory: Factory
  rail: boolean
  selected: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['select', 'delete'])

const showDeleteConfirm = ref(false)

const handleDelete = () => {
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  emit('delete', props.factory.name)
}
</script>

<template>
  <v-list-item
    @click="emit('select')"
    :title="props.rail ? undefined : props.factory.name"
    :active="props.selected"
  >
    <template #prepend>
      <v-img :src="getIconURL(props.factory.icon, 64)" width="32" height="32" class="mr-1" />
    </template>
    <template #append>
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
