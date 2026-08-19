<script setup lang="ts">
defineProps<{
  email: string
}>()

const emit = defineEmits<{
  signOut: []
}>()
</script>

<template>
  <v-card variant="outlined" class="mb-3">
    <v-card-text class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon icon="mdi-account-circle" size="32" color="primary" class="me-3" />
        <div>
          <div class="text-body-2 text-medium-emphasis">Signed in as</div>
          <div class="text-body-1 font-weight-medium">{{ email }}</div>
        </div>
      </div>
      <v-btn variant="outlined" color="primary" @click="emit('signOut')">
        <v-icon class="me-1">mdi-logout</v-icon>
        Sign Out
      </v-btn>
    </v-card-text>
  </v-card>
</template>
