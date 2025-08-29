<script setup lang="ts">
import { useFactoryStore } from '@/stores/factory'

const factoryStore = useFactoryStore()
</script>

<template>
  <v-app-bar>
    <v-app-bar-title>
      Factory Production Tracker
      <v-chip v-if="factoryStore.selected" size="small" color="info" class="ms-2">
        {{ factoryStore.selected }}
      </v-chip>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <ThemeSwitcher />
  </v-app-bar>
</template>
