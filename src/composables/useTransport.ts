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

  const recipeLink = computed(() => {
    return (type === 'input' ? recipe.inputs : recipe.outputs).find(
      (recipeLink) =>
        recipeLink.material === link.material &&
        recipeLink.source === link.source &&
        recipeLink.sink === link.sink,
    )
  })

  const buildingCounts = computed(() => {
    // Only calculate when hovered to improve performance
    if (!toValue(isHovered)) return []

    if (!recipeLink.value) return []

    return calculateTransportCapacity(link.material, recipeLink.value.amount, recipe.recipe.count)
  })

  const minimumUsableTier = computed(() => {
    // If recipe link not found, default to tier 0
    if (!recipeLink.value) return 0

    // Find the minimum tier that can handle this amount
    for (let idx = 0; idx < capacities.value.length; idx++) {
      if (recipeLink.value.amount <= capacities.value[idx] + ZERO_THRESHOLD) {
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
