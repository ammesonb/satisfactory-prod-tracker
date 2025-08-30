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
    units: isFluidMaterial ? 'm³/min' : 'items/min',
    capacities: isFluidMaterial ? PIPELINE_CAPACITIES : BELT_CAPACITIES,
    itemNames: isFluidMaterial ? PIPELINE_ITEM_NAMES : BELT_ITEM_NAMES,
  }
})
</script>

<template>
  <v-card class="pa-2" min-width="200">
    <v-card-text class="pa-1">
      <!-- Transport capacity table -->
      <v-table density="compact" class="transport-table">
        <tbody>
          <tr>
            <template v-for="(buildingCount, index) in buildingCounts" :key="index">
              <td class="text-center pa-1">
                <div class="d-flex flex-column align-center">
                  <CachedIcon
                    :icon="data.buildings[transportConfig.itemNames[index]]?.icon ?? ''"
                    :size="32"
                  />
                  <div class="text-caption text-medium-emphasis mt-1">
                    {{ buildingCount }} &times; MK{{ index + 1 }}
                  </div>
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>
