<script setup lang="ts">
defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  authenticate: []
}>()
</script>

<template>
  <v-card variant="outlined" class="pa-4 mb-4">
    <div class="text-center">
      <v-icon size="64" color="primary" class="mb-2">mdi-google-drive</v-icon>
      <h3 class="mb-2">Connect to Google Drive</h3>
      <p class="text-medium-emphasis mb-4">
        Backup your factories to Google Drive and sync across devices
      </p>
      <v-btn color="primary" :loading="loading" @click="emit('authenticate')">
        <v-icon class="mr-2">mdi-google</v-icon>
        Sign in with Google
      </v-btn>
    </div>
  </v-card>
</template>
