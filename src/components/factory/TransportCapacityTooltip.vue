<script setup lang="ts">
import { computed } from 'vue'
import {
  isFluid,
  BELT_CAPACITIES,
  PIPELINE_CAPACITIES,
  BELT_ITEM_NAMES,
  PIPELINE_ITEM_NAMES,
} from '@/logistics/constants'
import { useDataStore } from '@/stores/data'

const props = defineProps<{
  material: string
  buildingCounts: number[]
}>()

const data = useDataStore()

const transportConfig = computed(() => {
  const isFluidMaterial = isFluid(props.material)
  return {
    title: isFluidMaterial ? 'Pipeline Capacity' : 'Belt Capacity',
    units: isFluidMaterial ? 'm³/min' : 'items/min',
    capacities: isFluidMaterial ? PIPELINE_CAPACITIES : BELT_CAPACITIES,
    itemNames: isFluidMaterial ? PIPELINE_ITEM_NAMES : BELT_ITEM_NAMES,
  }
})
</script>

<template>
  <v-card class="pa-2" min-width="200">
    <v-card-title class="text-body-2 pa-1">{{ transportConfig.title }}</v-card-title>

    <v-card-text class="pa-1">
      <!-- Transport tier icons row -->
      <div class="d-flex align-center justify-center mb-2">
        <template v-for="(buildingCount, index) in buildingCounts" :key="index">
          <CachedIcon
            :icon="data.buildings[transportConfig.itemNames[index]]?.icon ?? ''"
            :size="24"
            :title="`MK${index + 1}: ${transportConfig.capacities[index]} ${transportConfig.units}`"
          />
          <span v-if="index < buildingCounts.length - 1" class="mx-1">-</span>
        </template>
      </div>

      <!-- Building counts row -->
      <div class="d-flex align-center justify-center text-caption">
        <template v-for="(buildingCount, index) in buildingCounts" :key="`count-${index}`">
          <span class="text-center" style="width: 24px">{{ buildingCount }}</span>
          <span v-if="index < buildingCounts.length - 1" class="mx-1 opacity-0">-</span>
        </template>
      </div>
    </v-card-text>
  </v-card>
</template>
