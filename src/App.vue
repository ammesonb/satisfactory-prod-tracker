<script setup lang="ts">
import FactoryDrawer from './FactoryDrawer.vue'
import { useFactoryStore } from '@/stores/factory'

const factoryStore = useFactoryStore()
</script>

<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>Factory Production Tracker</v-app-bar-title>
    </v-app-bar>
    <FactoryDrawer />
    <v-main>
      <v-container>
        <p v-if="factoryStore.factories.length > 0 && !factoryStore.selected">
          Select a factory from the sidebar to view its production chain.
        </p>
        <p v-if="factoryStore.factories.length === 0">
          Please add a factory using the + button below.
        </p>
      </v-container>
      <v-fab icon="mdi-plus" color="green" location="bottom end" app />
    </v-main>
  </v-app>
</template>

<style scoped></style>
