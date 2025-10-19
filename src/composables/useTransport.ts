import { computed } from 'vue'

import { getStores } from '@/composables/useStores'
import {
  BELT_CAPACITIES,
  BELT_ITEM_NAMES,
  isFluid,
  PIPELINE_CAPACITIES,
  PIPELINE_ITEM_NAMES,
} from '@/logistics/constants'
import { calculateTransportCapacity, type RecipeNode } from '@/logistics/graph-node'
import type { Material } from '@/types/factory'

export const useTransport = (
  recipe: RecipeNode,
  link: Material,
  type: 'input' | 'output',
  isHovered?: boolean,
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
    if (!isHovered) return []

    const recipeLink = (type === 'input' ? recipe.inputs : recipe.outputs).find(
      (recipeLink) => recipeLink.material === link.material,
    )
    if (!recipeLink) return []

    return calculateTransportCapacity(link.material, recipeLink.amount, recipe.recipe.count)
  })

  return {
    isFluidMaterial,
    capacities,
    transportItems,
    buildingCounts,
  }
}
