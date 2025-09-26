import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, type Ref } from 'vue'
import RecipeForm from '../RecipeForm.vue'
import RecipeSelector from '@/components/common/RecipeSelector.vue'
import BuildingSelector from '@/components/common/BuildingSelector.vue'
import RecipeDisplay from '../RecipeDisplay.vue'
import { VBtn, VTextField, VAlert } from 'vuetify/components'
import {
  expectElementExists,
  expectElementNotExists,
  expectElementText,
  expectProps,
  clickElement,
  emitEvent,
} from '@/__tests__/vue-test-helpers'
import type { RecipeEntry } from '@/types/factory'

vi.mock('@/composables/useStores', async () => {
  const { mockUseStores } = await import('@/__tests__/fixtures/composables')
  return mockUseStores
})

import type { ItemOption } from '@/types/data'

// Mock interface that matches how the real composable works
interface MockForm {
  selectedRecipe: Ref<ItemOption | undefined>
  buildingCount: Ref<number>
  selectedBuilding: Ref<ItemOption | undefined>
  productionBuildings: Ref<string[]>
  displayError: Ref<string>
  errorMessage: Ref<string>
  isValid: Ref<boolean>
  selectedRecipes: Ref<RecipeEntry[]>
  recipeKeys: string[]
  reset: () => void
  changeRecipe: (recipe: ItemOption | undefined) => void
  setError: (error: string) => void
  clearError: () => void
  addRecipe: () => void
  removeRecipe: (index: number) => void
}

// Create reactive refs that persist across calls
const mockSelectedRecipe = ref<ItemOption | undefined>(undefined)
const mockBuildingCount = ref(1)
const mockSelectedBuilding = ref<ItemOption | undefined>(undefined)
const mockSelectedRecipes = ref<RecipeEntry[]>([])
const mockProductionBuildings = ref<string[]>([])
const mockErrorMessage = ref('')
const mockIsValid = ref(false)
const mockDisplayError = ref('')
const mockReset = vi.fn()
const mockChangeRecipe = vi.fn()
const mockSetError = vi.fn()
const mockClearError = vi.fn()
const mockAddRecipe = vi.fn()
const mockRemoveRecipe = vi.fn()

const mockForm: MockForm = {
  selectedRecipe: mockSelectedRecipe,
  buildingCount: mockBuildingCount,
  selectedBuilding: mockSelectedBuilding,
  productionBuildings: mockProductionBuildings,
  displayError: mockDisplayError,
  errorMessage: mockErrorMessage,
  isValid: mockIsValid,
  get selectedRecipes() {
    return mockSelectedRecipes
  },
  get recipeKeys() {
    return mockSelectedRecipes.value.map((entry) => entry.recipe)
  },
  reset: mockReset,
  changeRecipe: mockChangeRecipe,
  setError: mockSetError,
  clearError: mockClearError,
  addRecipe: mockAddRecipe,
  removeRecipe: mockRemoveRecipe,
}

vi.mock('../composables/useRecipeInputForm', () => ({
  useRecipeInputForm: vi.fn(() => mockForm),
}))

describe('RecipeForm Integration', () => {
  const mockRecipeEntry: RecipeEntry = {
    recipe: 'Recipe_IronIngot_C',
    building: 'Build_SmelterMk1_C',
    count: 2,
    icon: 'build-smelter-mk1-c',
  }

  const createWrapper = () => {
    return mount(RecipeForm)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSelectedRecipe.value = undefined
    mockBuildingCount.value = 1
    mockSelectedBuilding.value = undefined
    mockProductionBuildings.value = []
    mockDisplayError.value = ''
    mockErrorMessage.value = ''
    mockIsValid.value = false
    mockSelectedRecipes.value = []
  })

  describe('Form Elements', () => {
    it('displays form elements correctly', () => {
      const wrapper = createWrapper()

      // Find the specific text field for building count
      const textFields = wrapper.findAllComponents(VTextField)
      const buildingCountField = textFields.find(
        (field) => field.props('label') === 'Building count',
      )

      expect(buildingCountField).toBeTruthy()
      expect(buildingCountField?.props()).toEqual(
        expect.objectContaining({
          label: 'Building count',
          type: 'number',
        }),
      )

      expectElementText(wrapper, VBtn, 'Add Recipe')
      expectProps(wrapper, VBtn, { disabled: true })
    })

    it('passes building count value from form', () => {
      mockBuildingCount.value = 3.5

      const textFields = createWrapper().findAllComponents(VTextField)
      const buildingCountField = textFields.find(
        (field) => field.props('label') === 'Building count',
      )

      expect(buildingCountField?.props('modelValue')).toBe(3.5)
    })

    it('enables add button when form is valid', () => {
      mockIsValid.value = true

      expectProps(createWrapper(), VBtn, { disabled: false })
    })
  })

  describe('Error Handling & Alerts', () => {
    it('shows error alert when form has error', () => {
      mockDisplayError.value = 'Test error message'

      const wrapper = createWrapper()

      expectElementExists(wrapper, VAlert)
      expectElementText(wrapper, VAlert, 'Test error message')
    })

    it('hides error alert when no error', () => {
      mockDisplayError.value = ''

      expectElementNotExists(createWrapper(), VAlert)
    })

    it('closes error alert when close button is clicked', async () => {
      mockDisplayError.value = 'Test error'
      mockErrorMessage.value = 'Test error' // Set errorMessage to make it closable

      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      await emitEvent(wrapper, VAlert, 'click:close')

      expectProps(wrapper, VAlert, { closable: true })
      expect(mockClearError).toHaveBeenCalled()
    })

    it('shows non-closable error alert for validation errors', async () => {
      mockDisplayError.value = 'Validation error'
      mockErrorMessage.value = '' // Empty errorMessage makes it non-closable

      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      expectProps(wrapper, VAlert, { closable: false })
    })
  })

  describe('Component Props & Integration', () => {
    it('passes correct props to RecipeSelector', () => {
      mockSelectedRecipes.value = [mockRecipeEntry]

      expectProps(createWrapper(), RecipeSelector, {
        excludeKeys: [mockRecipeEntry.recipe],
      })
    })

    it('passes selected recipe value to RecipeSelector', () => {
      const testRecipe = {
        value: 'Recipe_IronIngot_C',
        name: 'Iron Ingot',
        icon: '',
        type: 'recipe',
      } as ItemOption
      mockSelectedRecipe.value = testRecipe

      expectProps(createWrapper(), RecipeSelector, { modelValue: testRecipe })
    })

    it('passes correct props to BuildingSelector', () => {
      const testBuildings = ['Build_SmelterMk1_C', 'Build_FoundryMk1_C']
      mockProductionBuildings.value = testBuildings

      expectProps(createWrapper(), BuildingSelector, {
        filterKeys: testBuildings,
        disabled: true,
      })
    })

    it('enables BuildingSelector when recipe is selected', () => {
      mockForm.selectedRecipe.value = {
        value: 'Recipe_IronIngot_C',
        name: 'Iron Ingot',
        icon: 'iron-ingot',
        type: 'recipe',
      }

      expectProps(createWrapper(), BuildingSelector, { disabled: false })
    })

    it('passes selected building value to BuildingSelector', () => {
      const testBuilding = {
        value: 'Build_SmelterMk1_C',
        name: 'Smelter',
        icon: '',
        type: 'building',
      } as ItemOption
      mockSelectedBuilding.value = testBuilding

      expectProps(createWrapper(), BuildingSelector, { modelValue: testBuilding })
    })

    it('passes selectedRecipes to RecipeDisplay', () => {
      const testRecipes = [mockRecipeEntry]
      mockSelectedRecipes.value = testRecipes

      expectProps(createWrapper(), RecipeDisplay, {
        recipes: mockSelectedRecipes,
      })
    })
  })

  describe('User Interactions', () => {
    it('handles recipe selection', async () => {
      const wrapper = createWrapper()

      await emitEvent(wrapper, RecipeSelector, 'update:modelValue', {
        value: 'Recipe_IronIngot_C',
        name: 'Iron Ingot',
      })

      expect(mockForm.changeRecipe).toHaveBeenCalledWith({
        value: 'Recipe_IronIngot_C',
        name: 'Iron Ingot',
      })
    })

    it('handles building selection', async () => {
      const wrapper = createWrapper()

      await emitEvent(wrapper, BuildingSelector, 'update:modelValue', {
        value: 'Build_SmelterMk1_C',
        name: 'Smelter',
      })

      expect(mockForm.selectedBuilding.value).toEqual({
        value: 'Build_SmelterMk1_C',
        name: 'Smelter',
      })
    })

    it('adds recipe when add button is clicked and form is valid', async () => {
      mockIsValid.value = true

      await clickElement(createWrapper(), VBtn)

      expect(mockAddRecipe).toHaveBeenCalled()
    })

    it('does not add recipe when form is invalid', async () => {
      mockIsValid.value = false

      await clickElement(createWrapper(), VBtn)

      expect(mockAddRecipe).not.toHaveBeenCalled()
    })
  })

  describe('Recipe Management', () => {
    it('emits change event when selectedRecipes changes', async () => {
      const wrapper = createWrapper()
      const testRecipes = [mockRecipeEntry]

      // Change the selectedRecipes after component is mounted to trigger watcher
      mockSelectedRecipes.value = testRecipes
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('change')?.[0]).toEqual([testRecipes])
    })

    it('handles recipe removal from RecipeDisplay', async () => {
      await emitEvent(createWrapper(), RecipeDisplay, 'remove', 0)

      expect(mockForm.removeRecipe).toHaveBeenCalledWith(0)
    })

    it('handles recipe removal with correct index', async () => {
      await emitEvent(createWrapper(), RecipeDisplay, 'remove', 2)

      expect(mockForm.removeRecipe).toHaveBeenCalledWith(2)
    })
  })
})
