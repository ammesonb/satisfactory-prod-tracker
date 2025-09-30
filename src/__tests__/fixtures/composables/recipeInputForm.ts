import { vi } from 'vitest'
import { ref, computed, type Ref } from 'vue'
import { createUnwrapProxy } from '@/__tests__/vue-test-helpers'
import type { RecipeEntry } from '@/types/factory'
import type { ItemOption } from '@/types/data'

export const mockSelectedRecipe: Ref<ItemOption | undefined> = ref(undefined)
export const mockBuildingCount = ref(1)
export const mockSelectedBuilding: Ref<ItemOption | undefined> = ref(undefined)
export const mockSelectedRecipes = ref<RecipeEntry[]>([])
export const mockProductionBuildings = ref<string[]>([])
export const mockErrorMessage = ref('')
export const mockIsValid = ref(false)
export const mockDisplayError = ref('')
export const mockReset = vi.fn()
export const mockChangeRecipe: (recipe: ItemOption) => void = vi.fn()
export const mockSetError = vi.fn()
export const mockClearError = vi.fn()
export const mockAddRecipe = vi.fn()
export const mockRemoveRecipe = vi.fn()
export const mockRecipeKeysRef = computed(() =>
  mockSelectedRecipes.value.map((entry) => entry.recipe),
)

export const mockUseRecipeInputForm = {
  useRecipeInputForm: vi.fn(() => ({
    selectedRecipe: mockSelectedRecipe,
    buildingCount: mockBuildingCount,
    selectedBuilding: mockSelectedBuilding,
    productionBuildings: mockProductionBuildings,
    displayError: mockDisplayError,
    errorMessage: mockErrorMessage,
    isValid: mockIsValid,
    selectedRecipes: createUnwrapProxy(mockSelectedRecipes),
    recipeKeys: createUnwrapProxy(mockRecipeKeysRef),
    reset: mockReset,
    changeRecipe: mockChangeRecipe,
    setError: mockSetError,
    clearError: mockClearError,
    addRecipe: mockAddRecipe,
    removeRecipe: mockRemoveRecipe,
  })),
}
