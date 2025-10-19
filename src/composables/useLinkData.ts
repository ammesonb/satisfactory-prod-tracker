import { computed, type ComputedRef } from 'vue'

import { getStores } from '@/composables/useStores'
import {
  BELT_ITEM_NAMES,
  EXTERNAL_RECIPE,
  isFluid,
  PIPELINE_ITEM_NAMES,
} from '@/logistics/constants'
import { linkToString, type RecipeNode } from '@/logistics/graph-node'
import type { Material } from '@/types/factory'

export function useLinkData(link: ComputedRef<Material>, type: ComputedRef<'input' | 'output'>) {
  const { dataStore, factoryStore } = getStores()

  const linkId = computed(() => linkToString(link.value))

  const materialItem = computed(() => dataStore.items[link.value.material])

  const getItemContextSuffix = (source: string, type: 'input' | 'output'): string => {
    if (source === EXTERNAL_RECIPE) {
      return ''
    }

    return type === 'input' ? ' (Resource)' : ' Surplus'
  }

  const linkTarget = computed(() => (type.value === 'input' ? link.value.source : link.value.sink))

  const isRecipe = computed(() => linkTarget.value in dataStore.recipes)
  const targetRecipe = computed(() =>
    isRecipe.value ? factoryStore.getRecipeByName(linkTarget.value) : null,
  )

  const formatLinkDisplayName = (
    target: string,
    targetRecipe: RecipeNode | null,
    type: 'input' | 'output',
  ) => {
    // only empty for terminal states, where there is no input/output
    if (target === '') return ''

    if (targetRecipe?.batchNumber != null) {
      return dataStore.getRecipeDisplayName(target) + ` (Floor ${targetRecipe.batchNumber + 1})`
    }

    // otherwise, it is an item which:
    // - if an input, may come from an external input or be a natural resource
    // - if output, is surplus
    return dataStore.getItemDisplayName(target) + getItemContextSuffix(target, type)
  }

  const displayName = computed(() =>
    formatLinkDisplayName(linkTarget.value, targetRecipe.value, type.value),
  )

  const transportIcon = computed(() => {
    const transport = isFluid(link.value.material) ? PIPELINE_ITEM_NAMES[0] : BELT_ITEM_NAMES[0]
    return dataStore.buildings[transport]?.icon ?? ''
  })

  return {
    linkId,
    materialItem,
    linkTarget,
    isRecipe,
    targetRecipe,
    displayName,
    transportIcon,
  }
}
