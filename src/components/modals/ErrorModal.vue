<script setup lang="ts">
import { computed } from 'vue'

import { getStores } from '@/composables/useStores'

const { errorStore } = getStores()

const showDialog = computed({
  get: () => errorStore.show,
  set: (value: boolean) => {
    if (!value) {
      errorStore.hide()
    }
  },
})
</script>

<template>
  <v-dialog v-model="showDialog" max-width="500px">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon :icon="errorStore.icon" :color="errorStore.color" class="mr-2" />
        {{ errorStore.summary }}
      </v-card-title>
      <v-card-text v-if="errorStore.bodyContent">
        <component :is="errorStore.bodyContent" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="errorStore.hide()">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
