<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFactoryStore } from '@/stores/factory'

const collapsed = ref(true)
const factoryStore = useFactoryStore()
const searchQuery = ref('')

const filteredFactories = computed(() => {
  if (!searchQuery.value) {
    return factoryStore.factoryList
  }

  const query = searchQuery.value.toLowerCase()
  return factoryStore.factoryList.filter((factory) => factory.name.toLowerCase().includes(query))
})
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
        @select="factoryStore.setSelectedFactory(factory.name)"
        @delete="factoryStore.removeFactory"
      />
    </v-list>
    <v-list v-else>
      <v-list-item prepend-icon="mdi-information-outline" title="No factories added yet" />
    </v-list>
  </v-navigation-drawer>
</template>
