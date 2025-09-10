<script setup lang="ts">
import { computed } from 'vue'
import { getStores } from '@/composables/useStores'
import { buildingsToOptions } from '@/utils/buildings'
import { type ItemOption } from '@/types/data'
import type { IconConfig, DisplayConfig } from '@/types/ui'

interface Props {
  modelValue?: ItemOption
  disabled?: boolean
  filterKeys?: string[]
  displayConfig?: Partial<DisplayConfig>
  iconConfig?: Partial<IconConfig>
}

const props = withDefaults(defineProps<Props>(), {
  displayConfig: () => ({ placeholder: 'Search for a building...' }),
})

defineEmits<{
  'update:modelValue': [value: ItemOption | undefined]
}>()

const { dataStore } = getStores()

// Get buildings as ItemOptions, optionally filtered
const allBuildings = computed<ItemOption[]>(() => {
  const buildings = buildingsToOptions(dataStore.buildings)

  if (props.filterKeys && props.filterKeys.length > 0) {
    return buildings.filter((building) => props.filterKeys!.includes(building.value))
  }

  return buildings
})
</script>

<template>
  <GameDataSelector
    :model-value="props.modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :items="allBuildings"
    :disabled="props.disabled"
    :display-config="props.displayConfig"
    :icon-config="props.iconConfig"
  />
</template>
