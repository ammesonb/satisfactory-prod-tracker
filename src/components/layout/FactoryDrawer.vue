<script setup lang="ts">
import { ref, computed } from 'vue'
import { getStores } from '@/composables/useStores'
import { useFloorNavigation } from '@/composables/useFloorNavigation'
import { useRecipeStatus } from '@/composables/useRecipeStatus'
import type { Factory } from '@/types/factory'

const collapsed = ref(true)
const { factoryStore } = getStores()
const { initializeExpansion } = useFloorNavigation()
const { isRecipeComplete } = useRecipeStatus()
const searchQuery = ref('')

const filteredFactories = computed(() => {
  if (!searchQuery.value) {
    return factoryStore.factoryList
  }

  const query = searchQuery.value.toLowerCase()
  return factoryStore.factoryList.filter((factory) => factory.name.toLowerCase().includes(query))
})

const selectFactory = (factory: Factory) => {
  factoryStore.setSelectedFactory(factory.name)
  initializeExpansion(isRecipeComplete)
}
</script>

<template>
  <v-navigation-drawer expand-on-hover permanent v-model:rail="collapsed" :rail-width="64">
    <div v-if="factoryStore.hasFactories" class="pa-3 pb-2">
      <v-text-field
        v-if="!collapsed"
        v-model="searchQuery"
        placeholder="Search factories..."
        prepend-inner-icon="mdi-magnify"
        density="compact"
        hide-details
        clearable
      />
      <div v-else class="d-flex justify-center mt-2 mb-1">
        <v-icon icon="mdi-magnify" size="24" :color="searchQuery ? 'primary' : 'default'" />
      </div>
    </div>

    <v-list v-if="factoryStore.hasFactories">
      <FactoryDrawerRow
        v-for="factory in filteredFactories"
        :key="factory.name"
        :factory="factory"
        :rail="collapsed"
        :selected="factoryStore.selected === factory.name"
        @select="selectFactory(factory)"
        @delete="factoryStore.removeFactory"
      />
    </v-list>
    <v-list v-else>
      <v-list-item prepend-icon="mdi-information-outline" title="No factories added yet" />
    </v-list>
  </v-navigation-drawer>
</template>
