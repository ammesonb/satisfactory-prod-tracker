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
import { calculateTransportCapacity, type RecipeNode } from '@/logistics/graph-node'
import type { Material } from '@/types/factory'

const props = defineProps<{
  recipe: RecipeNode
  link: Material
  isHovered?: boolean
}>()

const data = useDataStore()

const buildingCounts = computed(() => {
  // Only calculate when hovered to improve performance
  if (!props.isHovered) return []

  return calculateTransportCapacity(
    props.link.material,
    props.link.amount,
    props.recipe.recipe.count,
  )
})

const transportConfig = computed(() => {
  const isFluidMaterial = isFluid(props.link.material)
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
