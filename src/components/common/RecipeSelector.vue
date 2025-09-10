<script setup lang="ts">
import { computed } from 'vue'
import { getStores } from '@/composables/useStores'
import { recipesToOptions } from '@/utils/recipes'
import { type ItemOption } from '@/types/data'
import GameDataSelector from '@/components/common/GameDataSelector.vue'

interface Props {
  modelValue?: ItemOption
  placeholder?: string
  disabled?: boolean
  excludeKeys?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search for a recipe...',
  excludeKeys: () => [],
})

const emit = defineEmits<{
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

const selectedRecipe = computed<ItemOption | undefined>(() =>
  props.modelValue
    ? allRecipes.value.find((recipe) => recipe.value === props.modelValue?.value)
    : undefined,
)

const updateValue = (value: ItemOption | undefined) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <GameDataSelector
    :model-value="selectedRecipe"
    @update:model-value="updateValue"
    :items="allRecipes"
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
