<script setup lang="ts">
import { computed, ref } from 'vue'

import { useDataSearch } from '@/composables/useDataSearch'
import { useFloorNavigation } from '@/composables/useFloorNavigation'
import { useRecipeStatus } from '@/composables/useRecipeStatus'
import { getStores } from '@/composables/useStores'
import type { Factory } from '@/types/factory'

const collapsed = ref(true)
const { factoryStore } = getStores()
const { initializeExpansion } = useFloorNavigation()
const { isRecipeComplete } = useRecipeStatus()

const factoryList = computed(() => factoryStore.factoryList)
const {
  searchInput,
  filteredItems: filteredFactories,
  updateSearch,
} = useDataSearch(
  factoryList,
  (factory: Factory, query: string) => factory.name.toLowerCase().includes(query),
  { maxNoSearchResults: 40, maxResults: 20 },
)

const selectFactory = (factory: Factory) => {
  factoryStore.setSelectedFactory(factory.name)
  initializeExpansion(isRecipeComplete)
}

// Dynamic drawer width based on longest factory name
const drawerWidth = computed(() => {
  if (factoryList.value.length === 0) return 280 // Default minimum

  const longestName = factoryList.value.reduce(
    (max, factory) => Math.max(max, factory.name.length),
    0,
  )

  // Rough estimate: 8px per character + 160px for icon/buttons/padding
  const calculated = longestName * 8 + 160

  // Clamp between min (280px) and max (400px)
  return Math.min(Math.max(calculated, 280), 400)
})
</script>

<template>
  <v-navigation-drawer
    expand-on-hover
    permanent
    v-model:rail="collapsed"
    :rail-width="64"
    :width="drawerWidth"
  >
    <div v-if="factoryStore.hasFactories" class="pa-3 pb-2">
      <v-text-field
        v-if="!collapsed"
        :model-value="searchInput"
        @update:model-value="updateSearch"
        placeholder="Search factories..."
        prepend-inner-icon="mdi-magnify"
        density="compact"
        hide-details
        clearable
      />
      <div v-else class="d-flex justify-center mt-2 mb-1">
        <v-icon icon="mdi-magnify" size="24" :color="searchInput ? 'primary' : 'default'" />
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
        @rename="(oldName: string, newName: string) => factoryStore.renameFactory(oldName, newName)"
        @delete="factoryStore.removeFactory"
      />
    </v-list>
    <v-list v-else>
      <v-list-item
        class="no-factories"
        prepend-icon="mdi-information-outline"
        title="No factories added yet"
      />
    </v-list>
  </v-navigation-drawer>
</template>
