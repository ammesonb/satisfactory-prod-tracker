<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDataStore } from '@/stores/data'
import { type RecipeProduct } from '@/types/data'
import { useFactoryStore } from '@/stores/factory'
import { useRecipeStatus } from '@/composables/useRecipeStatus'
import { useFloorNavigation } from '@/composables/useFloorNavigation'

const dataStore = useDataStore()
const factoryStore = useFactoryStore()
const showAddFactoryModal = ref(false)

const handleAddFactory = (factoryData: {
  name: string
  icon: string
  recipes: string
  externalInputs: RecipeProduct[]
}) => {
  factoryStore.addFactory(
    factoryData.name,
    factoryData.icon || 'default-icon',
    factoryData.recipes,
    factoryData.externalInputs,
  )
}

onMounted(() => {
  if (!(factoryStore.selected in factoryStore.factories)) {
    factoryStore.selected = ''
  }

  dataStore.loadData()
  useFloorNavigation().initializeExpansion(useRecipeStatus().isRecipeComplete)
})
</script>

<template>
  <v-app>
    <LoadingScreen v-if="dataStore.isLoading" />
    <template v-else>
      <AppBar />
      <FactoryDrawer />
      <v-main>
        <v-container>
          <p
            v-if="
              factoryStore.hasFactories && (!factoryStore.selected || !factoryStore.currentFactory)
            "
          >
            Select a factory from the sidebar to view its production chain.
          </p>
          <GettingStarted v-if="!factoryStore.hasFactories" />
          <FactoryPanels v-if="factoryStore.currentFactory" />
        </v-container>
        <!-- Grouped FABs -->
        <div class="fab-container">
          <FloatingNav v-if="factoryStore.selected" />
          <v-fab icon="mdi-plus" color="secondary" @click="showAddFactoryModal = true" />
        </div>
      </v-main>

      <AddFactoryModal v-model="showAddFactoryModal" @add-factory="handleAddFactory" />
    </template>
    <ErrorModal />
  </v-app>
</template>

<style scoped>
code {
  color: green;
}

.fab-container {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 1000;
}

@media (min-width: 1440px) {
  .fab-container {
    bottom: 1rem;
    right: 1rem;
    gap: 1rem;
  }
}

@media (max-width: 600px) {
  .fab-container {
    bottom: 0.75rem;
    right: 0.75rem;
    gap: 0.5rem;
  }
}
</style>
