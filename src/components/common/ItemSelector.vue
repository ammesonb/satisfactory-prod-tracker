<script setup lang="ts">
import { computed } from 'vue'
import { getStores } from '@/composables/useStores'
import { type ItemOption } from '@/types/data'
import GameDataSelector from '@/components/common/GameDataSelector.vue'
import { itemsToOptions } from '@/utils/items'
import { buildingsToOptions } from '@/utils/buildings'

interface Props {
  modelValue?: ItemOption
  placeholder?: string
  disabled?: boolean
  includeBuildings?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search for an item...',
  includeBuildings: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: ItemOption | undefined]
}>()

const { dataStore } = getStores()

// Get all available items and buildings with icons
const allItems = computed<ItemOption[]>(() => {
  const options = itemsToOptions(dataStore.items)
  if (props.includeBuildings) {
    options.push(...buildingsToOptions(dataStore.buildings))
  }
  return options.sort((a, b) => a.name.localeCompare(b.name))
})

const selectedItem = computed<ItemOption | undefined>(() => {
  if (!props.modelValue) return undefined
  return allItems.value.find((item) => item.value === props.modelValue?.value)
})

const updateValue = (value: ItemOption | undefined) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <GameDataSelector
    :model-value="selectedItem"
    @update:model-value="updateValue"
    :items="allItems"
    :disabled="props.disabled"
    :clearable="true"
    :icon-config="{
      showIcons: true,
      dropdownIconSize: 32,
      selectedIconSize: 24,
    }"
    :display-config="{
      showType: props.includeBuildings,
      variant: 'outlined',
      density: 'default',
      placeholder: props.placeholder,
      hideDetails: true,
    }"
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
