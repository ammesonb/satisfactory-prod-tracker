import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import { getStores } from '@/composables/useStores'
import {
  BELT_CAPACITIES,
  BELT_ITEM_NAMES,
  isFluid,
  PIPELINE_CAPACITIES,
  PIPELINE_ITEM_NAMES,
  ZERO_THRESHOLD,
} from '@/logistics/constants'
import { calculateTransportCapacity, type RecipeNode } from '@/logistics/graph-node'
import type { Material } from '@/types/factory'

export const useTransport = (
  recipe: RecipeNode,
  link: Material,
  type: 'input' | 'output',
  isHovered?: MaybeRefOrGetter<boolean>,
) => {
  const { dataStore } = getStores()

  const isFluidMaterial = computed(() => isFluid(link.material))
  const capacities = computed(() => (isFluidMaterial.value ? PIPELINE_CAPACITIES : BELT_CAPACITIES))
  const transportItems = computed(() =>
    (isFluidMaterial.value ? PIPELINE_ITEM_NAMES : BELT_ITEM_NAMES).map(
      (itemName) => dataStore.buildings[itemName],
    ),
  )

  const buildingCounts = computed(() => {
    // Only calculate when hovered to improve performance
    if (!toValue(isHovered)) return []

    return calculateTransportCapacity(link.material, link.amount, recipe.recipe.count)
  })

  const minimumUsableTier = computed(() => {
    // Find the minimum tier that can handle this amount
    for (let idx = 0; idx < capacities.value.length; idx++) {
      if (link.amount <= capacities.value[idx] + ZERO_THRESHOLD) {
        return idx
      }
    }

    // Amount exceeds all tiers, return highest tier
    return capacities.value.length - 1
  })

  return {
    isFluidMaterial,
    capacities,
    transportItems,
    buildingCounts,
    minimumUsableTier,
  }
}
