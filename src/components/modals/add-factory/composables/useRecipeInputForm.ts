import { ref, computed } from 'vue'
import { type ItemOption } from '@/types/data'
import { isPositiveNumber } from '@/utils/validation'
import type { RecipeEntry } from '@/types/factory'
import { useDataStore } from '@/stores'

export function useRecipeInputForm() {
  const selectedRecipe = ref<ItemOption | undefined>()
  const buildingCount = ref<number>(1)
  const selectedBuilding = ref<ItemOption | undefined>()
  const errorMessage = ref<string>('')
  const dataStore = useDataStore()

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

  const productionBuildings = computed(() => {
    return selectedRecipe.value
      ? dataStore.getRecipeProductionBuildings(selectedRecipe.value.value)
      : []
  })

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

  const toRecipeEntry = (): RecipeEntry => {
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

  const selectedRecipes = ref<RecipeEntry[]>([])
  const recipeKeys = computed(() => selectedRecipes.value.map((entry) => entry.recipe))

  const addRecipe = () => {
    selectedRecipes.value.push(toRecipeEntry())
    reset()
  }

  const removeRecipe = (index: number) => {
    selectedRecipes.value.splice(index, 1)
  }

  return {
    selectedRecipe,
    buildingCount,
    productionBuildings,
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
    selectedRecipes,
    recipeKeys,
    addRecipe,
    removeRecipe,
  }
}
