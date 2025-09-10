<script setup lang="ts">
import { computed } from 'vue'
import { getStores } from '@/composables/useStores'
import { buildingsToOptions } from '@/utils/buildings'
import { type ItemOption } from '@/types/data'
import GameDataSelector from '@/components/common/GameDataSelector.vue'

interface Props {
  modelValue?: ItemOption
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search for a building...',
})

const emit = defineEmits<{
  'update:modelValue': [value: ItemOption | undefined]
}>()

const { dataStore } = getStores()

// Get all buildings as ItemOptions
const allBuildings = computed<ItemOption[]>(() => buildingsToOptions(dataStore.buildings))

const selectedBuilding = computed<ItemOption | undefined>(() =>
  props.modelValue
    ? allBuildings.value.find((building) => building.value === props.modelValue?.value)
    : undefined,
)

const updateValue = (value: ItemOption | undefined) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <GameDataSelector
    :model-value="selectedBuilding"
    @update:model-value="updateValue"
    :items="allBuildings"
    :disabled="props.disabled"
    :clearable="true"
    :display-config="{
      showType: false,
      variant: 'outlined',
      density: 'default',
      placeholder: props.placeholder,
      hideDetails: true,
    }"
  />
</template>
