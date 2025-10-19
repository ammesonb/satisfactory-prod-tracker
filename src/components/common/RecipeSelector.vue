<script setup lang="ts">
import { computed } from 'vue'

import { getStores } from '@/composables/useStores'
import type { ItemOption } from '@/types/data'
import type { DisplayConfig, IconConfig } from '@/types/ui'
import { recipesToOptions } from '@/utils/recipes'

interface Props {
  modelValue?: ItemOption
  excludeKeys?: string[]
  disabled?: boolean
  displayConfig?: Partial<DisplayConfig>
  iconConfig?: Partial<IconConfig>
}

const props = withDefaults(defineProps<Props>(), {
  excludeKeys: () => [],
  displayConfig: () => ({ placeholder: 'Search for a recipe...', label: 'Recipe' }),
})

defineEmits<{
  'update:modelValue': [value: ItemOption | undefined]
}>()

const { dataStore } = getStores()

// Convert recipes to ItemOption format
const allRecipes = computed<ItemOption[]>(() =>
  recipesToOptions(dataStore.recipes, dataStore.getRecipeDisplayName, props.excludeKeys).map(
    (option) => ({
      value: option.value,
      name: option.title,
      icon: dataStore.getIcon(option.value),
      type: 'recipe' as const,
    }),
  ),
)
</script>

<template>
  <GameDataSelector
    :model-value="props.modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :items="allRecipes"
    :disabled="props.disabled"
    :display-config="props.displayConfig"
    :icon-config="props.iconConfig"
  />
</template>
