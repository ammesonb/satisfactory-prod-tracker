<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  show: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirm Action',
  message: 'Are you sure you want to proceed?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:show': [value: boolean]
}>()

const handleConfirm = () => {
  emit('confirm')
  emit('update:show', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:show', false)
}

const showDialog = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})
</script>

<template>
  <v-dialog v-model="showDialog" max-width="400px">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-help-circle" color="warning" class="mr-2" />
        {{ props.title }}
      </v-card-title>
      <v-card-text>
        {{ props.message }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="handleCancel">{{ props.cancelText }}</v-btn>
        <v-btn @click="handleConfirm" color="error">{{ props.confirmText }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
