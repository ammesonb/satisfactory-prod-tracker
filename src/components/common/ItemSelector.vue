<script setup lang="ts">
import { computed } from 'vue'

import { getStores } from '@/composables/useStores'
import type { ItemOption } from '@/types/data'
import type { DisplayConfig, IconConfig } from '@/types/ui'
import { buildingsToOptions } from '@/utils/buildings'
import { itemsToOptions } from '@/utils/items'

interface Props {
  modelValue?: ItemOption
  disabled?: boolean
  includeBuildings?: boolean
  displayConfig?: Partial<DisplayConfig>
  iconConfig?: Partial<IconConfig>
}

const props = withDefaults(defineProps<Props>(), {
  includeBuildings: true,
  displayConfig: () => ({ placeholder: 'Search for an item...' }),
  iconConfig: () => ({}) as IconConfig,
})

defineEmits<{
  'update:modelValue': [value: ItemOption | undefined]
}>()

const { dataStore } = getStores()

// Get all available items and buildings with icons
const allItems = computed<ItemOption[]>(() => {
  const options = [...itemsToOptions(dataStore.items)]
  if (props.includeBuildings) {
    options.push(...buildingsToOptions(dataStore.buildings))
  }
  return options.sort((a, b) => a.name.localeCompare(b.name))
})

// Merge showType with includeBuildings logic
const displayConfig = computed(() => ({
  ...props.displayConfig,
  showType: props.includeBuildings,
}))
</script>

<template>
  <GameDataSelector
    :model-value="props.modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :items="allItems"
    :disabled="props.disabled"
    :display-config="displayConfig"
    :icon-config="props.iconConfig"
  />
</template>

<style scoped>
.icon-image {
  border-radius: 4px;
  object-fit: contain;
  /* Force browser to cache images more aggressively */
  image-rendering: auto;
}
</style>
