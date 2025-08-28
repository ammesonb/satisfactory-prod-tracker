<script setup lang="ts">
import { computed } from 'vue'
import { useErrorStore } from '@/stores/errors'

const errorStore = useErrorStore()

const showDialog = computed({
  get: () => errorStore.show,
  set: (value: boolean) => {
    if (!value) {
      errorStore.hide()
    }
  },
})

const getIcon = () => {
  switch (errorStore.level) {
    case 'error':
      return 'mdi-alert-circle'
    case 'warning':
      return 'mdi-alert'
    case 'info':
      return 'mdi-information'
    default:
      return 'mdi-alert-circle'
  }
}

const getColor = () => {
  switch (errorStore.level) {
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    default:
      return 'error'
  }
}
</script>

<template>
  <v-dialog v-model="showDialog" max-width="500px">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon :icon="getIcon()" :color="getColor()" class="mr-2" />
        {{ errorStore.summary }}
      </v-card-title>
      <v-card-text v-if="errorStore.details">
        <p>{{ errorStore.details }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="errorStore.hide()">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
