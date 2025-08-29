<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFactoryStore } from '@/stores/factory'

const factoryStore = useFactoryStore()
const expandedFloors = ref<number[]>([])
const showEditModal = ref(false)
const editFloorIndices = ref<number[]>([])

watch(
  () => [factoryStore.selected, factoryStore.currentFactory?.recipeLinks],
  () => {
    if (factoryStore.currentFactory) {
      // only show floors with incomplete recipes by default
      expandedFloors.value = factoryStore.currentFactory.floors
        .map((floor, index) =>
          floor.recipes.some((recipe) => !factoryStore.recipeComplete(recipe)) ? index : undefined,
        )
        .filter((index): index is number => index !== undefined)
    } else {
      expandedFloors.value = []
    }
  },
  { immediate: true },
)

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
