import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { component, element } from '@/__tests__/vue-test-helpers'
import type { ItemOption, RecipeProduct } from '@/types/data'

import ItemSelector from '@/components/common/ItemSelector.vue'
import ExternalInputItem from '@/components/modals/add-factory/ExternalInputItem.vue'
import ExternalInputSelector from '@/components/modals/add-factory/ExternalInputSelector.vue'
import {
  VBtn,
  VChip,
  VExpansionPanel,
  VExpansionPanels,
  VIcon,
  VTextField,
} from 'vuetify/components'

// Mock composables with centralized fixtures
vi.mock('@/composables/useStores', async () => {
  const { mockUseStores } = await import('@/__tests__/fixtures/composables')
  return mockUseStores
})

describe('ExternalInputSelector Integration', () => {
  const IRON_ORE = 'Desc_OreIron_C'
  const COPPER_ORE = 'Desc_OreCopper_C'

  const mockIronOreOption: ItemOption = {
    value: IRON_ORE,
    name: 'Iron Ore',
    icon: 'desc-oreiron-c',
    type: 'item',
  }

  const mockCopperOreOption: ItemOption = {
    value: COPPER_ORE,
    name: 'Copper Ore',
    icon: 'desc-orecopper-c',
    type: 'item',
  }

  const defaultProps = {
    modelValue: [] as RecipeProduct[],
  }

  const createWrapper = (props = {}) => {
    return mount(ExternalInputSelector, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          ItemSelector: {
            name: 'ItemSelector',
            props: ['modelValue', 'placeholder', 'includeBuildings'],
            template: '<div data-testid="item-selector">Item Selector</div>',
            emits: ['update:modelValue'],
          },
          VExpansionPanels: {
            name: 'VExpansionPanels',
            template: '<div><slot /></div>',
          },
          VExpansionPanel: {
            name: 'VExpansionPanel',
            template:
              '<div><div><slot name="title" /></div><div><slot name="text" /></div><div><slot /></div></div>',
          },
          VExpansionPanelTitle: {
            name: 'VExpansionPanelTitle',
            template: '<div><slot /></div>',
          },
          VExpansionPanelText: {
            name: 'VExpansionPanelText',
            template: '<div><slot /></div>',
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering and Structure', () => {
    it('renders expansion panel with correct title and icon', () => {
      const wrapper = createWrapper()

      component(wrapper, VExpansionPanels).assert()
      component(wrapper, VExpansionPanel).assert()
      component(wrapper, VExpansionPanel).assert({ text: 'External Inputs' })
      component(wrapper, ExternalInputSelector).assert({ text: 'External Inputs' })
    })

    it('shows item count chip when inputs exist', () => {
      const existingInputs: RecipeProduct[] = [
        { item: IRON_ORE, amount: 100 },
        { item: COPPER_ORE, amount: 50 },
      ]
      const wrapper = createWrapper({ modelValue: existingInputs })

      component(wrapper, VChip).assert({ exists: true, text: '2' })
    })

    it('hides count chip when no inputs exist', () => {
      component(createWrapper(), VChip).assert({ exists: false })
    })
  })

  describe('Form Elements', () => {
    it('renders Add button that is initially disabled', () => {
      const wrapper = createWrapper()

      component(wrapper, VBtn).assert({ text: 'Add', props: { disabled: true } })
    })

    it('enables Add button when item is selected', async () => {
      const wrapper = createWrapper()

      await component(wrapper, ItemSelector).emit('update:modelValue', mockIronOreOption)
      component(wrapper, VBtn).assert({ props: { disabled: false } })
    })
  })

  describe('Adding External Inputs', () => {
    it('adds new external input when Add button is clicked', async () => {
      const wrapper = createWrapper()

      await component(wrapper, ItemSelector).emit('update:modelValue', mockIronOreOption)

      await component(wrapper, VTextField).getComponent().setValue(150)
      await component(wrapper, VBtn).click()

      const emittedEvents = wrapper.emitted('update:modelValue')
      expect(emittedEvents).toHaveLength(1)
      expect(emittedEvents?.[0][0]).toEqual([{ item: IRON_ORE, amount: 150 }])
    })

    it('accumulates quantity when adding same item multiple times', async () => {
      const existingInputs: RecipeProduct[] = [{ item: IRON_ORE, amount: 100 }]
      const wrapper = createWrapper({ modelValue: existingInputs })

      await component(wrapper, ItemSelector).emit('update:modelValue', mockIronOreOption)

      await component(wrapper, VTextField).getComponent().setValue(50)
      await component(wrapper, VBtn).click()

      const emittedEvents = wrapper.emitted('update:modelValue')
      expect(emittedEvents).toHaveLength(1)
      expect(emittedEvents?.[0][0]).toEqual([
        { item: IRON_ORE, amount: 150 }, // 100 + 50
      ])
    })

    it('resets form after adding input', async () => {
      const wrapper = createWrapper()

      await component(wrapper, ItemSelector).emit('update:modelValue', mockIronOreOption)

      await component(wrapper, VTextField).getComponent().setValue(200)
      await component(wrapper, VBtn).click()

      component(wrapper, VBtn).assert({ props: { disabled: true } })
      component(wrapper, VTextField).assert({ props: { modelValue: 1 } })
    })
  })

  describe('External Input List', () => {
    it('displays list of external inputs when inputs exist', () => {
      const existingInputs: RecipeProduct[] = [
        { item: IRON_ORE, amount: 100 },
        { item: COPPER_ORE, amount: 50 },
      ]
      const wrapper = createWrapper({ modelValue: existingInputs })

      element(wrapper, 'h4').assert({ text: 'Added External Inputs:' })

      const inputItems = component(wrapper, ExternalInputItem).assert({ count: 2 }).getComponents()

      expect(inputItems[0].props()).toEqual({ item: IRON_ORE, amount: 100 })
      expect(inputItems[1].props()).toEqual({ item: COPPER_ORE, amount: 50 })
    })

    it('removes external input when remove event is emitted', async () => {
      const existingInputs: RecipeProduct[] = [
        { item: IRON_ORE, amount: 100 },
        { item: COPPER_ORE, amount: 50 },
      ]
      const wrapper = createWrapper({ modelValue: existingInputs })

      // Emit remove event from first ExternalInputItem
      const firstInputItem = wrapper.findAllComponents(ExternalInputItem)[0]
      await firstInputItem.vm.$emit('remove')
      const emittedEvents = wrapper.emitted('update:modelValue')
      expect(emittedEvents).toHaveLength(1)
      expect(emittedEvents?.[0][0]).toEqual([{ item: COPPER_ORE, amount: 50 }])
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no external inputs exist', () => {
      const wrapper = createWrapper()

      component(wrapper, VIcon).assert()
      // Empty state shows different text - check for the actual empty state messages
      component(wrapper, ExternalInputSelector).assert({
        text: ['No external inputs added yet', 'Select an item above to add external inputs'],
      })
    })

    it('hides empty state when external inputs exist', () => {
      const existingInputs: RecipeProduct[] = [{ item: IRON_ORE, amount: 100 }]
      const wrapper = createWrapper({ modelValue: existingInputs })

      const emptyStateText = wrapper.text()
      expect(emptyStateText).not.toContain('No external inputs added yet')
      expect(emptyStateText).not.toContain('Select an item above to add external inputs')
    })
  })

  describe('User Interaction Flow', () => {
    it('handles complete add-and-remove workflow', async () => {
      const wrapper = createWrapper()
      // Step 1: Add first item
      await component(wrapper, ItemSelector).emit('update:modelValue', mockIronOreOption)

      await component(wrapper, VTextField).getComponent().setValue(100)
      await component(wrapper, VBtn).click()

      // Verify first item was added
      expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual([
        { item: IRON_ORE, amount: 100 },
      ])

      // Step 2: Simulate component receiving the new modelValue
      await wrapper.setProps({
        modelValue: [{ item: IRON_ORE, amount: 100 }],
      })

      // Step 3: Add second item

      await component(wrapper, ItemSelector).emit('update:modelValue', mockCopperOreOption)
      await component(wrapper, VTextField).getComponent().setValue(50)
      await component(wrapper, VBtn).click()

      // Verify second item was added
      expect(wrapper.emitted('update:modelValue')?.[1][0]).toEqual([
        { item: IRON_ORE, amount: 100 },
        { item: COPPER_ORE, amount: 50 },
      ])

      // Step 4: Simulate component receiving updated modelValue
      await wrapper.setProps({
        modelValue: [
          { item: IRON_ORE, amount: 100 },
          { item: COPPER_ORE, amount: 50 },
        ],
      })

      // Step 5: Remove first item
      const inputItems = wrapper.findAllComponents(ExternalInputItem)
      await inputItems[0].vm.$emit('remove')

      // Verify first item was removed
      expect(wrapper.emitted('update:modelValue')?.[2][0]).toEqual([
        { item: COPPER_ORE, amount: 50 },
      ])
    })
  })
})
