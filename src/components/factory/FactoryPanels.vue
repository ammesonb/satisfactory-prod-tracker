<script setup lang="ts">
import { ref } from 'vue'
import { useFactoryStore } from '@/stores/factory'
import { useFloorNavigation } from '@/composables/useFloorNavigation'

const factoryStore = useFactoryStore()
const { expandedFloors } = useFloorNavigation()
const showEditModal = ref(false)
const editFloorIndices = ref<number[]>([])

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
</script>

<template>
  <div v-if="factoryStore.selected">
    <FactoryFloorsToolbar @edit-all-floors="openMassEditModal" />

    <v-expansion-panels v-model="expandedFloors" multiple variant="accordion">
      <FactoryFloor
        v-for="(floor, index) in factoryStore.currentFactory.floors"
        :key="index"
        :floor="floor"
        :floorNumber="index + 1"
        :expanded="expandedFloors.includes(index)"
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
