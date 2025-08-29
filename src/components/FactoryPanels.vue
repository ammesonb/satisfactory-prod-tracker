<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFactoryStore } from '@/stores/factory'
import FactoryFloor from '@/components/FactoryFloor.vue'
import FloorEditModal from '@/components/FloorEditModal.vue'
import FactoryFloorsToolbar from '@/components/FactoryFloorsToolbar.vue'

const factoryStore = useFactoryStore()
const expandedFloors = ref<boolean[]>([])
const showEditModal = ref(false)
const editFloorIndices = ref<number[]>([])

const updateExpandedFloor = (index: number, expanded: boolean) => {
  if (expandedFloors.value.length <= index) {
    expandedFloors.value = [
      ...expandedFloors.value,
      ...Array(index - expandedFloors.value.length + 1).fill(false),
    ]
  }
  expandedFloors.value[index] = expanded
}

const openEditModal = (floorIndex: number) => {
  editFloorIndices.value = [floorIndex]
  showEditModal.value = true
}

const openMassEditModal = () => {
  if (factoryStore.currentFactory) {
    editFloorIndices.value = factoryStore.currentFactory.floors.map((_, index) => index)
    showEditModal.value = true
  }
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
  <div v-if="factoryStore.selected">
    <FactoryFloorsToolbar @edit-all-floors="openMassEditModal" />

    <v-expansion-panels multiple variant="accordion">
      <FactoryFloor
        v-for="(floor, index) in factoryStore.currentFactory.floors"
        :key="index"
        :floor="floor"
        :floorNumber="index + 1"
        :expand-floor="expandedFloors[index] || false"
        @update:expand-floor="updateExpandedFloor(index, $event)"
        @edit-floor="openEditModal"
      />
    </v-expansion-panels>

    <FloorEditModal
      v-model:show="showEditModal"
      :factory-name="factoryStore.selected"
      :floor-indices="editFloorIndices"
    />
  </div>
</template>
