import {
  mockBuildingCount,
  mockDisplayError,
  mockErrorMessage,
  mockIsValid,
  mockProductionBuildings,
  mockSelectedBuilding,
  mockSelectedRecipe,
  mockSelectedRecipes,
} from '@/__tests__/fixtures/composables/recipeInputForm'
import { itemDatabase } from '@/__tests__/fixtures/data'
import { component } from '@/__tests__/vue-test-helpers'
import type { RecipeProduct } from '@/types/data'
import { mount, VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ItemSelector from '@/components/common/ItemSelector.vue'
import AddFactoryModal from '@/components/modals/AddFactoryModal.vue'
import ExternalInputSelector from '@/components/modals/add-factory/ExternalInputSelector.vue'
import RecipeForm from '@/components/modals/add-factory/RecipeForm.vue'
import { VBtn, VBtnToggle, VTextarea, VTextField } from 'vuetify/components'

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

const TEST_ITEM = {
  IRON: {
    value: TEST_ITEMS.IRON_ORE,
    label: itemDatabase[TEST_ITEMS.IRON_ORE].name,
    icon: itemDatabase[TEST_ITEMS.IRON_ORE].icon,
  },
  COPPER: {
    value: TEST_ITEMS.COPPER_ORE,
    label: itemDatabase[TEST_ITEMS.COPPER_ORE].name,
    icon: itemDatabase[TEST_ITEMS.COPPER_ORE].icon,
  },
}

interface AddFactoryEvent {
  name: string
  icon: string
  recipes: string
  externalInputs: RecipeProduct[]
}

const setTextFieldValue = (wrapper: VueWrapper, value: string) => {
  const textField = component(wrapper, VTextField).match(
    (field) => field.props('label') === 'Factory name',
  )
  textField.assert()
  textField.getComponent().setValue(value)
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
      component(createWrapper(), VTextField).assert()
    })

    it('does not render when modelValue is false', () => {
      component(createWrapper({ modelValue: false }), VTextField).assert({ exists: false })
    })

    it('emits update:modelValue when dialog is closed', async () => {
      const wrapper = createWrapper()
      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Cancel'))
        .click()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
    })
  })

  describe('Form Fields', () => {
    it('renders factory name input field', () => {
      component(createWrapper(), VTextField).assert()
    })

    it('renders ItemSelector for factory icon', () => {
      component(createWrapper(), ItemSelector).assert()
    })

    it('renders input mode toggle with Recipe Builder and Import options', () => {
      component(createWrapper(), VBtnToggle).assert()

      component(createWrapper(), VBtn)
        .match((btn) => btn.text().includes('Recipe Builder'))
        .assert()
      component(createWrapper(), VBtn)
        .match((btn) => btn.text().includes('Import from Satisfactory Tools'))
        .assert()
    })

    it('renders ExternalInputSelector', () => {
      component(createWrapper(), ExternalInputSelector).assert()
    })
  })

  describe('Input Mode Toggle', () => {
    it('shows RecipeForm by default in recipe mode', () => {
      component(createWrapper(), RecipeForm).assert()
    })

    it('does not show textarea in recipe mode', () => {
      component(createWrapper(), VTextarea).assert({ exists: false })
    })

    it('shows textarea when switched to import mode', async () => {
      const wrapper = createWrapper()
      await component(wrapper, VBtnToggle).emit('update:modelValue', 'import')

      component(wrapper, VTextarea).assert()
    })

    it('hides RecipeForm when switched to import mode', async () => {
      const wrapper = createWrapper()
      await component(wrapper, VBtnToggle).emit('update:modelValue', 'import')

      component(wrapper, RecipeForm).assert({ exists: false })
    })

    it('shows help icon in import mode', async () => {
      const wrapper = createWrapper()
      await component(wrapper, VBtnToggle).emit('update:modelValue', 'import')

      component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-help-circle-outline')
        .assert()
    })

    it('does not show help icon in recipe mode', () => {
      component(createWrapper(), VBtn)
        .match((btn) => btn.props('icon') === 'mdi-help-circle-outline')
        .assert({ exists: false })
    })
  })

  describe('Form Validation', () => {
    it('disables Add Factory button when name is empty', () => {
      component(createWrapper(), VBtn)
        .match((btn) => btn.text().includes('Add Factory'))
        .match((btn) => btn.props('disabled') === true)
        .assert()
    })

    it('disables Add Factory button when item is not selected', async () => {
      const wrapper = createWrapper()
      setTextFieldValue(wrapper, 'Test Factory')
      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Add Factory'))
        .match((btn) => btn.props('disabled') === true)
        .assert()
    })

    it('disables Add Factory button when recipes/recipeList is empty', async () => {
      const wrapper = createWrapper()
      setTextFieldValue(wrapper, 'Test Factory')

      await component(wrapper, ItemSelector).emit('update:modelValue', TEST_ITEM.IRON)

      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Add Factory'))
        .assert({ props: { disabled: true } })
    })

    it('enables Add Factory button when all required fields are filled in recipe mode', async () => {
      const wrapper = createWrapper()
      setTextFieldValue(wrapper, 'Test Factory')

      await component(wrapper, ItemSelector).emit('update:modelValue', TEST_ITEM.IRON)

      await component(wrapper, RecipeForm).emit('change', [
        { recipe: 'Recipe_IronIngot_C', building: 'Build_SmelterMk1_C', count: 2 },
      ])

      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Add Factory'))
        .assert({ props: { disabled: false } })
    })

    it('enables Add Factory button when all required fields are filled in import mode', async () => {
      const wrapper = createWrapper()
      setTextFieldValue(wrapper, 'Test Factory')

      await component(wrapper, ItemSelector).emit('update:modelValue', TEST_ITEM.IRON)

      await component(wrapper, VBtnToggle).emit('update:modelValue', 'import')

      component(wrapper, VTextarea)
        .getComponent()
        .setValue('"Recipe_IronIngot_C@1.0#Build_SmelterMk1_C": "2"')

      await wrapper.vm.$nextTick()

      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Add Factory'))
        .assert({ props: { disabled: false } })
    })
  })

  describe('Factory Creation', () => {
    it('emits add-factory event with correct data in recipe mode', async () => {
      const wrapper = createWrapper()
      setTextFieldValue(wrapper, 'Iron Production')

      await component(wrapper, ItemSelector).emit('update:modelValue', TEST_ITEM.IRON)

      await component(wrapper, RecipeForm).emit('change', [
        { recipe: 'Recipe_IronIngot_C', building: 'Build_SmelterMk1_C', count: 2 },
        { recipe: 'Recipe_IronPlate_C', building: 'Build_ConstructorMk1_C', count: 3 },
      ])

      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Add Factory'))
        .click()

      expect(wrapper.emitted('add-factory')).toBeTruthy()
      const emittedFactory = wrapper.emitted('add-factory')![0][0] as AddFactoryEvent
      expect(emittedFactory.name).toBe('Iron Production')
      expect(emittedFactory.icon).toBe(TEST_ITEM.IRON.icon)
      expect(emittedFactory.recipes).toContain('Recipe_IronIngot_C@1.0#Build_SmelterMk1_C')
      expect(emittedFactory.recipes).toContain('Recipe_IronPlate_C@1.0#Build_ConstructorMk1_C')
    })

    it('emits add-factory event with correct data in import mode', async () => {
      const wrapper = createWrapper()
      setTextFieldValue(wrapper, 'Imported Factory')

      await component(wrapper, ItemSelector).emit('update:modelValue', TEST_ITEM.COPPER)

      await component(wrapper, VBtnToggle).emit('update:modelValue', 'import')

      const recipesText = '"Recipe_CopperIngot_C@1.0#Build_SmelterMk1_C": "4"'
      component(wrapper, VTextarea).getComponent().setValue(recipesText)

      await wrapper.vm.$nextTick()

      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Add Factory'))
        .click()

      expect(wrapper.emitted('add-factory')).toBeTruthy()
      const emittedFactory = wrapper.emitted('add-factory')![0][0] as AddFactoryEvent
      expect(emittedFactory.name).toBe('Imported Factory')
      expect(emittedFactory.icon).toBe(TEST_ITEM.COPPER.icon)
      expect(emittedFactory.recipes).toBe(recipesText)
    })

    it('includes external inputs in emitted factory data', async () => {
      const wrapper = createWrapper()
      setTextFieldValue(wrapper, 'Factory with Imports')

      await component(wrapper, ItemSelector).emit('update:modelValue', TEST_ITEM.IRON)

      await component(wrapper, RecipeForm).emit('change', [
        { recipe: 'Recipe_IronIngot_C', building: 'Build_SmelterMk1_C', count: 2 },
      ])

      const testExternalInputs = [{ item: TEST_ITEMS.IRON_ORE, rate: 60, isInput: true }]

      await component(wrapper, ExternalInputSelector).emit('update:modelValue', testExternalInputs)

      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Add Factory'))
        .click()

      const emittedFactory = wrapper.emitted('add-factory')![0][0] as AddFactoryEvent
      expect(emittedFactory.externalInputs).toEqual(testExternalInputs)
    })
  })

  describe('Form Reset', () => {
    it('clears form when Cancel is clicked', async () => {
      const wrapper = createWrapper()
      setTextFieldValue(wrapper, 'Test Factory')

      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Cancel'))
        .click()

      // After clear, form should be reset
      // Check by creating a new wrapper and verifying Add button is disabled
      const newWrapper = createWrapper()
      component(newWrapper, VBtn)
        .match((btn) => btn.text().includes('Add Factory'))
        .match((btn) => btn.props('disabled') === true)
        .assert()
    })

    it('resets input mode to recipe when form is cleared', async () => {
      const wrapper = createWrapper()

      await component(wrapper, VBtnToggle).emit('update:modelValue', 'import')

      component(wrapper, VTextarea).assert()

      // Cancel to clear form
      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Cancel'))
        .click()

      await wrapper.setProps({ modelValue: true })

      component(wrapper, RecipeForm).assert()
      component(wrapper, VTextarea).assert({ exists: false })
    })

    it('closes modal and clears form after successful factory addition', async () => {
      const wrapper = createWrapper()
      setTextFieldValue(wrapper, 'Test Factory')

      await component(wrapper, ItemSelector).emit('update:modelValue', TEST_ITEM.IRON)

      await component(wrapper, RecipeForm).emit('change', [
        { recipe: 'Recipe_IronIngot_C', building: 'Build_SmelterMk1_C', count: 2 },
      ])

      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Add Factory'))
        .click()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
    })
  })

  describe('Help Documentation', () => {
    it('opens help wiki when help button is clicked in import mode', async () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
      const wrapper = createWrapper()

      await component(wrapper, VBtnToggle).emit('update:modelValue', 'import')

      component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-help-circle-outline')
        .click()

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://github.com/ammesonb/satisfactory-prod-tracker/wiki/Import-from-Satisfactory-Tools',
        '_blank',
      )

      windowOpenSpy.mockRestore()
    })
  })
})
