import { ref, computed } from 'vue'
import { type ItemOption } from '@/types/data'
import { isPositiveNumber } from '@/utils/validation'
import type { IDataStore } from '@/types/stores'
import type { RecipeEntry } from '@/types/factory'

export function useRecipeInputForm() {
  const selectedRecipe = ref<ItemOption | undefined>()
  const buildingCount = ref<number>(1)
  const selectedBuilding = ref<ItemOption | undefined>()
  const errorMessage = ref<string>('')

  const reset = () => {
    selectedRecipe.value = undefined
    selectedBuilding.value = undefined
    buildingCount.value = 1
    errorMessage.value = ''
  }

  const changeRecipe = (recipe: ItemOption | undefined) => {
    selectedRecipe.value = recipe
    selectedBuilding.value = undefined
  }

  const validationError = computed((): string | null => {
    // Don't show validation errors until user starts interacting
    if (!selectedRecipe.value) return null

    if (!selectedBuilding.value)
      return `Please select a building to produce ${selectedRecipe.value.name}`
    if (!buildingCount.value) return `Please enter production count of ${selectedRecipe.value.name}`
    if (!isPositiveNumber(buildingCount.value))
      return `Production count of ${selectedRecipe.value.name} must be a positive number`
    return null
  })

  const displayError = computed(() => {
    return errorMessage.value || validationError.value || ''
  })

  const setError = (message: string) => {
    errorMessage.value = message
  }

  const clearError = () => {
    errorMessage.value = ''
  }

  const isValid = computed(() => selectedRecipe.value !== undefined && !validationError.value)

  const toRecipeEntry = (dataStore: IDataStore): RecipeEntry => {
    if (!isValid.value) {
      throw new Error(validationError.value ?? 'Form validation failed')
    }

    return {
      recipe: selectedRecipe.value!.value,
      building: selectedBuilding.value!.value,
      count: buildingCount.value,
      icon: dataStore.getIcon(selectedBuilding.value!.value),
    }
  }

  return {
    selectedRecipe,
    buildingCount,
    selectedBuilding,
    displayError,
    reset,
    changeRecipe,
    errorMessage,
    validationError,
    setError,
    clearError,
    isValid,
    toRecipeEntry,
  }
}
