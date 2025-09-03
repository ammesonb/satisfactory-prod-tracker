import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExternalInputSelector from '@/components/common/ExternalInputSelector.vue'
import { itemDatabase } from '@/__tests__/fixtures/data'
import type { RecipeProduct } from '@/types/data'
import { setComponentDataAndTick, getVmProperty } from '@/__tests__/componentStubs'

// Component property constants
const COMPONENT_PROPS = {
  SELECTED_ITEM: 'selectedItem',
} as const

// Import the component test setup
import '@/components/__tests__/component-setup'

describe('ExternalInputSelector', () => {
  const mockProps = {
    modelValue: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper function to mount component and expand panel
  const setupComponent = async (props: { modelValue: RecipeProduct[] } = mockProps) => {
    const wrapper = mount(ExternalInputSelector, { props })
    await wrapper.vm.$nextTick()

    // Expand the panel to access content
    const panelTitle = wrapper.find('.v-expansion-panel-title')
    await panelTitle.trigger('click')
    await wrapper.vm.$nextTick()

    return wrapper
  }

  // Helper functions for common UI interactions
  const getQuantityInput = (wrapper: ReturnType<typeof mount>) => {
    return wrapper.find('input[type="number"]')
  }

  const getAddButton = (wrapper: ReturnType<typeof mount>) => {
    // Try to find the Add button by various selectors
    const buttons = wrapper.findAll('button')
    const addButton = buttons.find((btn) => btn.text().includes('Add'))
    return addButton || buttons[buttons.length - 1] // Fallback to last button
  }

  const setItemSelection = async (
    wrapper: ReturnType<typeof mount>,
    item: typeof itemDatabase.Desc_IronIngot_C,
  ) => {
    await setComponentDataAndTick(wrapper, {
      selectedItem: {
        value: item.icon,
        title: item.name,
      },
    })
  }

  const getLastEmittedValue = (
    wrapper: ReturnType<typeof mount>,
    eventName = 'update:modelValue',
  ) => {
    const emitted = wrapper.emitted(eventName)
    if (!emitted) return null
    return emitted[emitted.length - 1][0]
  }

  const expectButtonDisabled = (button: ReturnType<ReturnType<typeof mount>['find']>) => {
    expect(button.exists()).toBe(true)
    expect(button.attributes('disabled')).toBeDefined()
  }

  const expectButtonEnabled = (button: ReturnType<ReturnType<typeof mount>['find']>) => {
    expect(button.exists()).toBe(true)
    expect(button.attributes('disabled')).toBeUndefined()
  }

  describe('Initial State', () => {
    it('expansion panel is collapsed initially', async () => {
      const wrapper = mount(ExternalInputSelector, {
        props: mockProps,
      })

      await wrapper.vm.$nextTick()

      // Panel content should not be visible when collapsed
      const emptyStateText = wrapper.text()
      expect(emptyStateText).not.toContain('No external inputs added yet')
      expect(emptyStateText).toContain('External Inputs') // Title should be visible
    })

    it('shows "No external inputs added yet" message when expanded', async () => {
      const wrapper = await setupComponent()

      const emptyStateText = wrapper.text()
      expect(emptyStateText).toContain('No external inputs added yet')
      expect(emptyStateText).toContain('Select an item above to add external inputs')
    })

    it('has Add button disabled by default when no item is selected', async () => {
      const wrapper = await setupComponent()
      const addButton = getAddButton(wrapper)
      expectButtonDisabled(addButton)
    })

    it('shows expansion panel with correct title and no badge initially', async () => {
      const wrapper = mount(ExternalInputSelector, {
        props: mockProps,
      })

      await wrapper.vm.$nextTick()

      const panelTitle = wrapper.text()
      expect(panelTitle).toContain('External Inputs')

      // Badge should not be present when no inputs
      const badge = wrapper.find('.v-chip')
      expect(badge.exists()).toBe(false)
    })
  })

  describe('Form Validation', () => {
    it('keeps Add button disabled when quantity is 0 or negative', async () => {
      const wrapper = await setupComponent()
      const quantityInput = getQuantityInput(wrapper)
      const addButton = getAddButton(wrapper)

      // Set invalid quantity
      await setItemSelection(wrapper, itemDatabase.Desc_IronIngot_C)
      await quantityInput.setValue('0')
      expectButtonDisabled(addButton)

      // Try negative quantity
      await quantityInput.setValue('-5')
      expectButtonDisabled(addButton)

      await quantityInput.setValue('1')
      expectButtonEnabled(addButton)
    })

    it('button remains disabled when no item is selected even with valid quantity', async () => {
      const wrapper = await setupComponent()
      const quantityInput = getQuantityInput(wrapper)
      const addButton = getAddButton(wrapper)

      // Set valid quantity but no item
      await quantityInput.setValue('5')
      expectButtonDisabled(addButton)
    })
  })

  describe('Adding External Inputs', () => {
    it('shows added input with correct icon, name, and quantity badge', async () => {
      const existingInputs = [
        {
          item: itemDatabase.Desc_IronIngot_C.icon,
          amount: 15,
        },
      ]

      const wrapper = await setupComponent({ modelValue: existingInputs })

      // Should show the input chip
      const inputChip = wrapper.find('.external-input-chip')
      expect(inputChip.exists()).toBe(true)

      // Should show correct text content
      expect(inputChip.text()).toContain(itemDatabase.Desc_IronIngot_C.name)

      // Should show quantity badge
      const badge = wrapper.find('.v-badge')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toContain('15')

      // Should show count badge in panel title
      const countChip = wrapper.find('.v-chip')
      expect(countChip.exists()).toBe(true)
      expect(countChip.text()).toContain('1')
    })

    it('emits update event when adding new input', async () => {
      const wrapper = await setupComponent()
      const quantityInput = getQuantityInput(wrapper)
      const addButton = getAddButton(wrapper)

      // Set valid form data
      await quantityInput.setValue('10')
      await setItemSelection(wrapper, itemDatabase.Desc_IronIngot_C)
      expectButtonEnabled(addButton)

      await addButton.trigger('click')

      // Should emit update:modelValue with new item
      const emittedValue = getLastEmittedValue(wrapper)
      expect(emittedValue).toEqual([
        {
          item: itemDatabase.Desc_IronIngot_C.icon,
          amount: 10,
        },
      ])
    })

    it('resets form after adding input', async () => {
      const wrapper = await setupComponent()
      const quantityInput = getQuantityInput(wrapper)
      const addButton = getAddButton(wrapper)

      // Set form data
      await quantityInput.setValue('20')
      await setItemSelection(wrapper, itemDatabase.Desc_IronIngot_C)
      expectButtonEnabled(addButton)

      await addButton.trigger('click')

      // Form should be reset
      expect(getVmProperty(wrapper, COMPONENT_PROPS.SELECTED_ITEM)).toBeUndefined()
      expect(getVmProperty(wrapper, 'quantity')).toBe(1)
    })
  })

  describe('Updating Existing Inputs', () => {
    it('overrides quantity when re-adding same item instead of adding duplicate', async () => {
      const existingInputs = [
        {
          item: itemDatabase.Desc_IronIngot_C.icon,
          amount: 10,
        },
      ]

      const wrapper = await setupComponent({ modelValue: existingInputs })
      const quantityInput = getQuantityInput(wrapper)
      const addButton = getAddButton(wrapper)

      // Set form to add same item with different quantity
      await quantityInput.setValue('25')
      await setItemSelection(wrapper, itemDatabase.Desc_IronIngot_C)
      expectButtonEnabled(addButton)

      await addButton.trigger('click')

      // Should emit update with single item having new quantity, not duplicate
      const lastEmit = getLastEmittedValue(wrapper)
      expect(lastEmit).toEqual([
        {
          item: itemDatabase.Desc_IronIngot_C.icon,
          amount: 25,
        },
      ])
      expect(lastEmit).toHaveLength(1) // Should still be only one item
    })
  })

  describe('Removing External Inputs', () => {
    it('removes input when close button is clicked', async () => {
      const existingInputs = [
        {
          item: itemDatabase.Desc_IronIngot_C.icon,
          amount: 10,
        },
        {
          item: itemDatabase.Desc_CopperIngot_C.icon,
          amount: 20,
        },
      ]

      const wrapper = await setupComponent({ modelValue: existingInputs })

      // Find and click the close button on first chip
      const closeButtons = wrapper.findAll('.v-chip__close')
      expect(closeButtons.length).toBeGreaterThan(0)

      await closeButtons[0].trigger('click')

      // Should emit update with first item removed
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      const lastEmit = emitted![emitted!.length - 1][0]
      expect(lastEmit).toEqual([
        {
          item: itemDatabase.Desc_CopperIngot_C.icon,
          amount: 20,
        },
      ])
    })

    it('shows empty state when no inputs exist', async () => {
      const wrapper = await setupComponent({ modelValue: [] })

      const emptyStateText = wrapper.text()
      expect(emptyStateText).toContain('No external inputs added yet')
    })
  })

  describe('Multiple Inputs', () => {
    it('displays multiple inputs with correct count badge', async () => {
      const multipleInputs = [
        {
          item: itemDatabase.Desc_IronIngot_C.icon,
          amount: 10,
        },
        {
          item: itemDatabase.Desc_CopperIngot_C.icon,
          amount: 15,
        },
        {
          item: itemDatabase.Desc_SteelIngot_C.icon,
          amount: 8,
        },
      ]

      const wrapper = await setupComponent({ modelValue: multipleInputs })

      // Should show count in panel title
      const countChip = wrapper.find('.v-chip')
      expect(countChip.text()).toContain('3')

      // Should show all input chips
      const inputChips = wrapper.findAll('.external-input-chip')
      expect(inputChips).toHaveLength(3)

      // Each chip should have correct content
      expect(wrapper.text()).toContain(itemDatabase.Desc_IronIngot_C.name)
      expect(wrapper.text()).toContain(itemDatabase.Desc_CopperIngot_C.name)
      expect(wrapper.text()).toContain(itemDatabase.Desc_SteelIngot_C.name)

      // Check individual quantity badges on each chip
      const badges = wrapper.findAll('.v-badge')
      expect(badges).toHaveLength(3)
      expect(badges[0].text()).toContain('10')
      expect(badges[1].text()).toContain('15')
      expect(badges[2].text()).toContain('8')
    })
  })

  describe('Accessibility and UX', () => {
    it('maintains proper input constraints', async () => {
      const wrapper = await setupComponent()

      const quantityInput = getQuantityInput(wrapper)
      expect(quantityInput.attributes('min')).toBe('0.1')
      expect(quantityInput.attributes('step')).toBe('0.1')
    })
  })
})
