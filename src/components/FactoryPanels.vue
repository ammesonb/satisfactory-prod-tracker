<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFactoryStore } from '@/stores/factory'
import FactoryFloor from '@/components/FactoryFloor.vue'

const factoryStore = useFactoryStore()
const expandedFloors = ref<boolean[]>([])

const updateExpandedFloor = (index: number, expanded: boolean) => {
  if (expandedFloors.value.length <= index) {
    expandedFloors.value = [
      ...expandedFloors.value,
      ...Array(index - expandedFloors.value.length + 1).fill(false),
    ]
  }
  expandedFloors.value[index] = expanded
}

watch(
  () => factoryStore.selected,
  () => {
    expandedFloors.value = factoryStore.currentFactory.floors.map(() => true)
  },
  { immediate: true },
)
</script>

<template>
  <v-expansion-panels v-if="factoryStore.selected" multiple variant="accordion">
    <FactoryFloor
      v-for="(floor, index) in factoryStore.currentFactory.floors"
      :key="index"
      :floor="floor"
      :floorNumber="index + 1"
      :expand-floor="expandedFloors[index] || false"
      @update:expand-floor="updateExpandedFloor(index, $event)"
    />
  </v-expansion-panels>
</template>
