<script setup lang="ts">
import { useFactoryStore } from '@/stores/factory'
import { onMounted, ref } from 'vue'
import { useDataStore } from './stores/data'

const dataStore = useDataStore()
const factoryStore = useFactoryStore()
const showAddFactoryModal = ref(false)

const handleAddFactory = (factoryData: { name: string; icon: string; recipes: string }) => {
  factoryStore.addFactory(factoryData.name, factoryData.icon || 'default-icon', factoryData.recipes)
}

onMounted(dataStore.loadData)
</script>

<template>
  <v-app>
    <AppBar />
    <FactoryDrawer />
    <v-main>
      <v-container>
        <p v-if="factoryStore.hasFactories && !factoryStore.selected">
          Select a factory from the sidebar to view its production chain.
        </p>
        <GettingStarted v-if="!factoryStore.hasFactories" />
        <FactoryPanels v-if="factoryStore.selected" />
      </v-container>
      <v-fab
        icon="mdi-plus"
        color="secondary"
        location="bottom end"
        app
        @click="showAddFactoryModal = true"
      />
      <FloatingNav v-if="factoryStore.selected" />
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
