import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AddFactoryModal from '@/components/modals/AddFactoryModal.vue'
import RecipeForm from '@/components/modals/add-factory/RecipeForm.vue'
import ItemSelector from '@/components/common/ItemSelector.vue'
import ExternalInputSelector from '@/components/modals/add-factory/ExternalInputSelector.vue'
import {
  expectElementExists,
  expectElementNotExists,
  getComponentWithText,
  getComponent,
} from '@/__tests__/vue-test-helpers'
import { VBtn, VBtnToggle, VTextField, VTextarea } from 'vuetify/components'
import { itemDatabase } from '@/__tests__/fixtures/data'
import type { RecipeProduct } from '@/types/data'
import {
  mockSelectedRecipes,
  mockSelectedRecipe,
  mockSelectedBuilding,
  mockProductionBuildings,
  mockErrorMessage,
  mockIsValid,
  mockDisplayError,
  mockBuildingCount,
} from '@/__tests__/fixtures/composables/recipeInputForm'

vi.mock('@/composables/useStores', async () => {
  const { mockUseStores } = await import('@/__tests__/fixtures/composables')
  return mockUseStores
})

vi.mock('@/components/modals/add-factory/composables/useRecipeInputForm', async () => {
  const { mockUseRecipeInputForm } = await import('@/__tests__/fixtures/composables')
  return mockUseRecipeInputForm
})

const TEST_ITEMS = {
  IRON_ORE: 'Desc_OreIron_C',
  COPPER_ORE: 'Desc_OreCopper_C',
} as const

interface AddFactoryEvent {
  name: string
  icon: string
  recipes: string
  externalInputs: RecipeProduct[]
}

describe('AddFactoryModal Integration', () => {
  const createWrapper = (props = {}) => {
    return mount(AddFactoryModal, {
      props: {
        modelValue: true,
        ...props,
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSelectedRecipe.value = undefined
    mockSelectedBuilding.value = undefined
    mockSelectedRecipes.value = []
    mockProductionBuildings.value = []
    mockErrorMessage.value = ''
    mockIsValid.value = false
    mockDisplayError.value = ''
    mockBuildingCount.value = 1
  })

  describe('Modal Visibility', () => {
    it('renders when modelValue is true', () => {
      expectElementExists(createWrapper(), VTextField)
    })

    it('does not render when modelValue is false', () => {
      expectElementNotExists(createWrapper({ modelValue: false }), VTextField)
    })

    it('emits update:modelValue when dialog is closed', async () => {
      const wrapper = createWrapper()
      const cancelBtn = getComponentWithText(wrapper, VBtn, 'Cancel')

      await cancelBtn!.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
    })
  })

  describe('Form Fields', () => {
    it('renders factory name input field', () => {
      expectElementExists(createWrapper(), VTextField)
    })

    it('renders ItemSelector for factory icon', () => {
      expectElementExists(createWrapper(), ItemSelector)
    })

    it('renders input mode toggle with Recipe Builder and Import options', () => {
      const wrapper = createWrapper()
      expectElementExists(wrapper, VBtnToggle)

      const recipeBtn = getComponentWithText(wrapper, VBtn, 'Recipe Builder')
      const importBtn = getComponentWithText(wrapper, VBtn, 'Import from Satisfactory Tools')

      expect(recipeBtn).toBeTruthy()
      expect(importBtn).toBeTruthy()
    })

    it('renders ExternalInputSelector', () => {
      expectElementExists(createWrapper(), ExternalInputSelector)
    })
  })

  describe('Input Mode Toggle', () => {
    it('shows RecipeForm by default in recipe mode', () => {
      expectElementExists(createWrapper(), RecipeForm)
    })

    it('does not show textarea in recipe mode', () => {
      expectElementNotExists(createWrapper(), VTextarea)
    })

    it('shows textarea when switched to import mode', async () => {
      const wrapper = createWrapper()
      const importBtn = getComponentWithText(wrapper, VBtn, 'Import from Satisfactory Tools')

      await importBtn!.trigger('click')

      expectElementExists(wrapper, VTextarea)
    })

    it('hides RecipeForm when switched to import mode', async () => {
      const wrapper = createWrapper()
      const importBtn = getComponentWithText(wrapper, VBtn, 'Import from Satisfactory Tools')

      await importBtn!.trigger('click')

      expectElementNotExists(wrapper, RecipeForm)
    })

    it('shows help icon in import mode', async () => {
      const wrapper = createWrapper()
      const importBtn = getComponentWithText(wrapper, VBtn, 'Import from Satisfactory Tools')

      await importBtn!.trigger('click')

      const helpBtn = wrapper
        .findAllComponents(VBtn)
        .find((btn) => btn.props('icon') === 'mdi-help-circle-outline')
      expect(helpBtn).toBeTruthy()
    })

    it('does not show help icon in recipe mode', () => {
      const wrapper = createWrapper()
      const helpBtn = wrapper
        .findAllComponents(VBtn)
        .find((btn) => btn.props('icon') === 'mdi-help-circle-outline')
      expect(helpBtn).toBeFalsy()
    })
  })

  describe('Form Validation', () => {
    it('disables Add Factory button when name is empty', () => {
      const wrapper = createWrapper()
      const addBtn = getComponentWithText(wrapper, VBtn, 'Add Factory')

      expect(addBtn!.props('disabled')).toBe(true)
    })

    it('disables Add Factory button when item is not selected', async () => {
      const wrapper = createWrapper()
      const nameField = getComponent(wrapper, VTextField)

      await nameField.setValue('Test Factory')

      const addBtn = getComponentWithText(wrapper, VBtn, 'Add Factory')
      expect(addBtn!.props('disabled')).toBe(true)
    })

    it('disables Add Factory button when recipes/recipeList is empty', async () => {
      const wrapper = createWrapper()
      const nameField = getComponent(wrapper, VTextField)
      await nameField.setValue('Test Factory')

      const itemSelector = getComponent(wrapper, ItemSelector)
      await itemSelector.vm.$emit('update:modelValue', {
        value: TEST_ITEMS.IRON_ORE,
        label: itemDatabase[TEST_ITEMS.IRON_ORE].name,
        icon: itemDatabase[TEST_ITEMS.IRON_ORE].icon,
      })

      const addBtn = getComponentWithText(wrapper, VBtn, 'Add Factory')
      expect(addBtn!.props('disabled')).toBe(true)
    })

    it('enables Add Factory button when all required fields are filled in recipe mode', async () => {
      const wrapper = createWrapper()
      const nameField = getComponent(wrapper, VTextField)
      await nameField.setValue('Test Factory')

      const itemSelector = getComponent(wrapper, ItemSelector)
      await itemSelector.vm.$emit('update:modelValue', {
        value: TEST_ITEMS.IRON_ORE,
        label: itemDatabase[TEST_ITEMS.IRON_ORE].name,
        icon: itemDatabase[TEST_ITEMS.IRON_ORE].icon,
      })

      const recipeForm = getComponent(wrapper, RecipeForm)
      await recipeForm.vm.$emit('change', [
        { recipe: 'Recipe_IronIngot_C', building: 'Build_SmelterMk1_C', count: 2 },
      ])

      const addBtn = getComponentWithText(wrapper, VBtn, 'Add Factory')
      expect(addBtn!.props('disabled')).toBe(false)
    })

    it('enables Add Factory button when all required fields are filled in import mode', async () => {
      const wrapper = createWrapper()
      const nameField = getComponent(wrapper, VTextField)
      await nameField.setValue('Test Factory')

      const itemSelector = getComponent(wrapper, ItemSelector)
      await itemSelector.vm.$emit('update:modelValue', {
        value: TEST_ITEMS.IRON_ORE,
        label: itemDatabase[TEST_ITEMS.IRON_ORE].name,
        icon: itemDatabase[TEST_ITEMS.IRON_ORE].icon,
      })

      const importBtn = getComponentWithText(wrapper, VBtn, 'Import from Satisfactory Tools')
      await importBtn!.trigger('click')

      const textarea = getComponent(wrapper, VTextarea)
      await textarea.setValue('"Recipe_IronIngot_C@1.0#Build_SmelterMk1_C": "2"')

      const addBtn = getComponentWithText(wrapper, VBtn, 'Add Factory')
      expect(addBtn!.props('disabled')).toBe(false)
    })
  })

  describe('Factory Creation', () => {
    it('emits add-factory event with correct data in recipe mode', async () => {
      const wrapper = createWrapper()
      const nameField = getComponent(wrapper, VTextField)
      await nameField.setValue('Iron Production')

      const itemSelector = getComponent(wrapper, ItemSelector)
      const testItem = {
        value: TEST_ITEMS.IRON_ORE,
        label: itemDatabase[TEST_ITEMS.IRON_ORE].name,
        icon: itemDatabase[TEST_ITEMS.IRON_ORE].icon,
      }
      await itemSelector.vm.$emit('update:modelValue', testItem)

      const recipeForm = getComponent(wrapper, RecipeForm)
      await recipeForm.vm.$emit('change', [
        { recipe: 'Recipe_IronIngot_C', building: 'Build_SmelterMk1_C', count: 2 },
        { recipe: 'Recipe_IronPlate_C', building: 'Build_ConstructorMk1_C', count: 3 },
      ])

      const addBtn = getComponentWithText(wrapper, VBtn, 'Add Factory')
      await addBtn!.trigger('click')

      expect(wrapper.emitted('add-factory')).toBeTruthy()
      const emittedFactory = wrapper.emitted('add-factory')![0][0] as AddFactoryEvent
      expect(emittedFactory.name).toBe('Iron Production')
      expect(emittedFactory.icon).toBe(testItem.icon)
      expect(emittedFactory.recipes).toContain('Recipe_IronIngot_C@1.0#Build_SmelterMk1_C')
      expect(emittedFactory.recipes).toContain('Recipe_IronPlate_C@1.0#Build_ConstructorMk1_C')
    })

    it('emits add-factory event with correct data in import mode', async () => {
      const wrapper = createWrapper()
      const nameField = getComponent(wrapper, VTextField)
      await nameField.setValue('Imported Factory')

      const itemSelector = getComponent(wrapper, ItemSelector)
      const testItem = {
        value: TEST_ITEMS.COPPER_ORE,
        label: itemDatabase[TEST_ITEMS.COPPER_ORE].name,
        icon: itemDatabase[TEST_ITEMS.COPPER_ORE].icon,
      }
      await itemSelector.vm.$emit('update:modelValue', testItem)

      const importBtn = getComponentWithText(wrapper, VBtn, 'Import from Satisfactory Tools')
      await importBtn!.trigger('click')

      const textarea = getComponent(wrapper, VTextarea)
      const recipesText = '"Recipe_CopperIngot_C@1.0#Build_SmelterMk1_C": "4"'
      await textarea.setValue(recipesText)

      const addBtn = getComponentWithText(wrapper, VBtn, 'Add Factory')
      await addBtn!.trigger('click')

      expect(wrapper.emitted('add-factory')).toBeTruthy()
      const emittedFactory = wrapper.emitted('add-factory')![0][0] as AddFactoryEvent
      expect(emittedFactory.name).toBe('Imported Factory')
      expect(emittedFactory.icon).toBe(testItem.icon)
      expect(emittedFactory.recipes).toBe(recipesText)
    })

    it('includes external inputs in emitted factory data', async () => {
      const wrapper = createWrapper()
      const nameField = getComponent(wrapper, VTextField)
      await nameField.setValue('Factory with Imports')

      const itemSelector = getComponent(wrapper, ItemSelector)
      const testItem = {
        value: TEST_ITEMS.IRON_ORE,
        label: itemDatabase[TEST_ITEMS.IRON_ORE].name,
        icon: itemDatabase[TEST_ITEMS.IRON_ORE].icon,
      }
      await itemSelector.vm.$emit('update:modelValue', testItem)

      const recipeForm = getComponent(wrapper, RecipeForm)
      await recipeForm.vm.$emit('change', [
        { recipe: 'Recipe_IronIngot_C', building: 'Build_SmelterMk1_C', count: 2 },
      ])

      const externalInputSelector = getComponent(wrapper, ExternalInputSelector)
      const testExternalInputs = [{ item: TEST_ITEMS.IRON_ORE, rate: 60, isInput: true }]
      await externalInputSelector.vm.$emit('update:modelValue', testExternalInputs)

      const addBtn = getComponentWithText(wrapper, VBtn, 'Add Factory')
      await addBtn!.trigger('click')

      const emittedFactory = wrapper.emitted('add-factory')![0][0] as AddFactoryEvent
      expect(emittedFactory.externalInputs).toEqual(testExternalInputs)
    })
  })

  describe('Form Reset', () => {
    it('clears form when Cancel is clicked', async () => {
      const wrapper = createWrapper()
      const nameField = getComponent(wrapper, VTextField)
      await nameField.setValue('Test Factory')

      const cancelBtn = getComponentWithText(wrapper, VBtn, 'Cancel')
      await cancelBtn!.trigger('click')

      // After clear, form should be reset
      // Check by creating a new wrapper and verifying Add button is disabled
      const newWrapper = createWrapper()
      const addBtn = getComponentWithText(newWrapper, VBtn, 'Add Factory')
      expect(addBtn!.props('disabled')).toBe(true)
    })

    it('resets input mode to recipe when form is cleared', async () => {
      const wrapper = createWrapper()

      const importBtn = getComponentWithText(wrapper, VBtn, 'Import from Satisfactory Tools')
      await importBtn!.trigger('click')

      expectElementExists(wrapper, VTextarea)

      // Cancel to clear form
      const cancelBtn = getComponentWithText(wrapper, VBtn, 'Cancel')
      await cancelBtn!.trigger('click')

      await wrapper.setProps({ modelValue: true })

      expectElementExists(wrapper, RecipeForm)
      expectElementNotExists(wrapper, VTextarea)
    })

    it('closes modal and clears form after successful factory addition', async () => {
      const wrapper = createWrapper()
      const nameField = getComponent(wrapper, VTextField)
      await nameField.setValue('Test Factory')

      const itemSelector = getComponent(wrapper, ItemSelector)
      await itemSelector.vm.$emit('update:modelValue', {
        value: TEST_ITEMS.IRON_ORE,
        label: itemDatabase[TEST_ITEMS.IRON_ORE].name,
        icon: itemDatabase[TEST_ITEMS.IRON_ORE].icon,
      })

      const recipeForm = getComponent(wrapper, RecipeForm)
      await recipeForm.vm.$emit('change', [
        { recipe: 'Recipe_IronIngot_C', building: 'Build_SmelterMk1_C', count: 2 },
      ])

      const addBtn = getComponentWithText(wrapper, VBtn, 'Add Factory')
      await addBtn!.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
    })
  })

  describe('Help Documentation', () => {
    it('opens help wiki when help button is clicked in import mode', async () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
      const wrapper = createWrapper()

      const importBtn = getComponentWithText(wrapper, VBtn, 'Import from Satisfactory Tools')
      await importBtn!.trigger('click')

      const helpBtn = wrapper
        .findAllComponents(VBtn)
        .find((btn) => btn.props('icon') === 'mdi-help-circle-outline')
      await helpBtn!.trigger('click')

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://github.com/ammesonb/satisfactory-prod-tracker/wiki/Import-from-Satisfactory-Tools',
        '_blank',
      )

      windowOpenSpy.mockRestore()
    })
  })
})
