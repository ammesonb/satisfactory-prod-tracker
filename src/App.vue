<script setup lang="ts">
import { useFactoryStore } from '@/stores/factory'
import { ref } from 'vue'
import GettingStarted from '@/components/GettingStarted.vue'

const factoryStore = useFactoryStore()
const showAddFactoryModal = ref(false)

const handleAddFactory = (factoryData: { name: string; icon: string; recipes: string }) => {
  factoryStore.addFactory(factoryData.name, factoryData.icon || 'default-icon', factoryData.recipes)
}
</script>

<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>Factory Production Tracker</v-app-bar-title>
    </v-app-bar>
    <FactoryDrawer />
    <v-main>
      <v-container>
        <p v-if="factoryStore.hasFactories && !factoryStore.selected">
          Select a factory from the sidebar to view its production chain.
        </p>
        <GettingStarted v-if="!factoryStore.hasFactories" />
      </v-container>
      <v-fab
        icon="mdi-plus"
        color="green"
        location="bottom end"
        app
        @click="showAddFactoryModal = true"
      />
    </v-main>

    <AddFactoryModal v-model="showAddFactoryModal" @add-factory="handleAddFactory" />
    <ErrorModal />
  </v-app>
</template>

<style scoped>
code {
  color: green;
}
</style>
