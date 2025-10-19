import {
  mockAddRecipe,
  mockBuildingCount,
  mockChangeRecipe,
  mockClearError,
  mockDisplayError,
  mockErrorMessage,
  mockIsValid,
  mockProductionBuildings,
  mockRemoveRecipe,
  mockSelectedBuilding,
  mockSelectedRecipe,
  mockSelectedRecipes,
} from '@/__tests__/fixtures/composables/recipeInputForm'
import { component } from '@/__tests__/vue-test-helpers'
import type { ItemOption } from '@/types/data'
import type { RecipeEntry } from '@/types/factory'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import BuildingSelector from '@/components/common/BuildingSelector.vue'
import RecipeSelector from '@/components/common/RecipeSelector.vue'
import RecipeDisplay from '@/components/modals/add-factory/RecipeDisplay.vue'
import RecipeForm from '@/components/modals/add-factory/RecipeForm.vue'
import { VAlert, VBtn, VTextField } from 'vuetify/components'

vi.mock('@/composables/useStores', async () => {
  const { mockUseStores } = await import('@/__tests__/fixtures/composables')
  return mockUseStores
})

vi.mock('@/components/modals/add-factory/composables/useRecipeInputForm', async () => {
  const { mockUseRecipeInputForm } = await import('@/__tests__/fixtures/composables')
  return mockUseRecipeInputForm
})

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

      component(wrapper, VBtn).assert({ text: 'Add Recipe', props: { disabled: true } })
    })

    it('passes building count value from form', () => {
      mockBuildingCount.value = 3.5

      component(createWrapper(), VTextField)
        .match((field) => field.props('label') === 'Building count')
        .assert({ exists: true, props: { modelValue: 3.5 } })
    })

    it('enables add button when form is valid', () => {
      mockIsValid.value = true

      component(createWrapper(), VBtn).assert({ props: { disabled: false } })
    })
  })

  describe('Error Handling & Alerts', () => {
    it('shows error alert when form has error', () => {
      mockDisplayError.value = 'Test error message'

      const wrapper = createWrapper()

      component(wrapper, VAlert).assert({ exists: true, text: 'Test error message' })
    })

    it('hides error alert when no error', () => {
      mockDisplayError.value = ''

      component(createWrapper(), VAlert).assert({ exists: false })
    })

    it('closes error alert when close button is clicked', async () => {
      mockDisplayError.value = 'Test error'
      mockErrorMessage.value = 'Test error' // Set errorMessage to make it closable

      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      await component(wrapper, VAlert).emit('click:close')

      component(wrapper, VAlert).assert({ props: { closable: true } })
      expect(mockClearError).toHaveBeenCalled()
    })

    it('shows non-closable error alert for validation errors', async () => {
      mockDisplayError.value = 'Validation error'
      mockErrorMessage.value = '' // Empty errorMessage makes it non-closable

      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      component(wrapper, VAlert).assert({ props: { closable: false } })
    })
  })

  describe('Component Props & Integration', () => {
    it('passes correct props to RecipeSelector', () => {
      mockSelectedRecipes.value = [mockRecipeEntry]

      const excludeKeys = createWrapper().findComponent(RecipeSelector).props('excludeKeys')

      // Check array content since proxies don't match in deep equality
      expect(Array.isArray(excludeKeys)).toBe(true)
      expect(excludeKeys ? Array.from(excludeKeys) : []).toEqual([mockRecipeEntry.recipe])
    })

    it('passes selected recipe value to RecipeSelector', () => {
      const testRecipe = {
        value: 'Recipe_IronIngot_C',
        name: 'Iron Ingot',
        icon: '',
        type: 'recipe',
      } as ItemOption
      mockSelectedRecipe.value = testRecipe

      component(createWrapper(), RecipeSelector).assert({ props: { modelValue: testRecipe } })
    })

    it('passes correct props to BuildingSelector', () => {
      const testBuildings = ['Build_SmelterMk1_C', 'Build_FoundryMk1_C']
      mockProductionBuildings.value = testBuildings

      component(createWrapper(), BuildingSelector).assert({
        props: {
          filterKeys: testBuildings,
          disabled: true,
        },
      })
    })

    it('enables BuildingSelector when recipe is selected', () => {
      mockSelectedRecipe.value = {
        value: 'Recipe_IronIngot_C',
        name: 'Iron Ingot',
        icon: 'iron-ingot',
        type: 'recipe',
      }

      component(createWrapper(), BuildingSelector).assert({ props: { disabled: false } })
    })

    it('passes selected building value to BuildingSelector', () => {
      const testBuilding = {
        value: 'Build_SmelterMk1_C',
        name: 'Smelter',
        icon: '',
        type: 'building',
      } as ItemOption
      mockSelectedBuilding.value = testBuilding

      component(createWrapper(), BuildingSelector).assert({ props: { modelValue: testBuilding } })
    })

    it('passes selectedRecipes to RecipeDisplay', () => {
      const testRecipes = [mockRecipeEntry]
      mockSelectedRecipes.value = testRecipes

      const recipes = createWrapper().findComponent(RecipeDisplay).props('recipes')

      // Check array content since proxies don't match in deep equality
      expect(Array.isArray(recipes)).toBe(true)
      expect(Array.from(recipes)).toEqual(testRecipes)
    })
  })

  describe('User Interactions', () => {
    it('handles recipe selection', async () => {
      const wrapper = createWrapper()

      await component(wrapper, RecipeSelector).emit('update:modelValue', {
        value: 'Recipe_IronIngot_C',
        name: 'Iron Ingot',
      })

      expect(mockChangeRecipe).toHaveBeenCalledWith({
        value: 'Recipe_IronIngot_C',
        name: 'Iron Ingot',
      })
    })

    it('handles building selection', async () => {
      const wrapper = createWrapper()

      await component(wrapper, BuildingSelector).emit('update:modelValue', {
        value: 'Build_SmelterMk1_C',
        name: 'Smelter',
      })

      expect(mockSelectedBuilding.value).toEqual({
        value: 'Build_SmelterMk1_C',
        name: 'Smelter',
      })
    })

    it('adds recipe when add button is clicked and form is valid', async () => {
      mockIsValid.value = true

      await component(createWrapper(), VBtn).click()

      expect(mockAddRecipe).toHaveBeenCalled()
    })

    it('does not add recipe when form is invalid', async () => {
      mockIsValid.value = false

      await component(createWrapper(), VBtn).click()

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
      await component(createWrapper(), RecipeDisplay).emit('remove', 0)

      expect(mockRemoveRecipe).toHaveBeenCalledWith(0)
    })

    it('handles recipe removal with correct index', async () => {
      await component(createWrapper(), RecipeDisplay).emit('remove', 2)

      expect(mockRemoveRecipe).toHaveBeenCalledWith(2)
    })
  })
})
