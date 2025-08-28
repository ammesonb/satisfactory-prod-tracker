<script setup lang="ts">
import { ref } from 'vue'
import { useFactoryStore } from '@/stores/factory'
import FactoryRow from './FactoryRow.vue'

const collapsed = ref(true)
const factoryStore = useFactoryStore()
</script>

<template>
  <v-navigation-drawer expand-on-hover permanent v-model:rail="collapsed" :rail-width="64">
    <v-list v-if="factoryStore.hasFactories">
      <FactoryRow
        v-for="factory in factoryStore.factoryList"
        :key="factory.name"
        :factory="factory"
        @select="factoryStore.setSelectedFactory(factory.name)"
      />
    </v-list>
    <v-list v-else>
      <v-list-item prepend-icon="mdi-information-outline" title="No factories added yet" />
    </v-list>
  </v-navigation-drawer>
</template>
