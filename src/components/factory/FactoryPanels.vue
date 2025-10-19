<script setup lang="ts">
import { useFloorNavigation } from '@/composables/useFloorNavigation'
import { getStores } from '@/composables/useStores'

const { factoryStore } = getStores()
const { expandedFloors } = useFloorNavigation()
</script>

<template>
  <div v-if="factoryStore.currentFactory">
    <FactoryFloorsToolbar />

    <v-expansion-panels v-model="expandedFloors" multiple variant="accordion">
      <FactoryFloor
        v-for="(floor, index) in factoryStore.currentFactory.floors"
        :key="index"
        :floor="floor"
        :floorNumber="index + 1"
      />
    </v-expansion-panels>

    <FloorEditModal />
  </div>
</template>
