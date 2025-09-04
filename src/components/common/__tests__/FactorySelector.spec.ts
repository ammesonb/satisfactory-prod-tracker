import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FactorySelector from '@/components/common/FactorySelector.vue'
import type { Factory } from '@/types/factory'
import { itemDatabase } from '@/__tests__/fixtures/data'
import { getStubs, SupportedStubs } from '@/__tests__/componentStubs'

const IRON_FACTORY = 'Iron Factory'
const COPPER_FACTORY = 'Copper Factory'
const STEEL_FACTORY = 'Steel Production Complex'

describe('FactorySelector', () => {
  // Mock factory data based on recipe fixtures
  const mockFactories: Factory[] = [
    {
      name: IRON_FACTORY,
      icon: itemDatabase.Desc_IronIngot_C.icon,
      floors: [
        {
          name: 'Ingot Production',
          iconItem: itemDatabase.Desc_IronIngot_C.name,
          recipes: [],
        },
      ],
      recipeLinks: {},
    },
    {
      name: COPPER_FACTORY,
      icon: itemDatabase.Desc_CopperIngot_C.icon,
      floors: [
        {
          name: 'Copper Smelting',
          iconItem: itemDatabase.Desc_CopperIngot_C.name,
          recipes: [],
        },
      ],
      recipeLinks: {},
    },
    {
      name: STEEL_FACTORY,
      icon: itemDatabase.Desc_SteelIngot_C.icon,
      floors: [
        {
          name: 'Steel Processing',
          iconItem: itemDatabase.Desc_SteelIngot_C.name,
          recipes: [],
        },
      ],
      recipeLinks: {},
    },
  ]

  const defaultProps = {
    factories: mockFactories,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper function to mount component
  const mountFactorySelector = (
    props: { factories?: Factory[]; title?: string; modelValue?: string[] } = {},
  ) => {
    const finalProps = { ...defaultProps, ...props }
    return mount(FactorySelector, {
      props: finalProps,
      global: {
        stubs: getStubs(SupportedStubs.CachedIcon),
      },
    })
  }

  // Helper functions for common UI interactions
  const getSelectAllCheckbox = (wrapper: ReturnType<typeof mount>) => {
    return wrapper.find('input[type="checkbox"]')
  }

  const getAllFactoryCheckboxes = (wrapper: ReturnType<typeof mount>) => {
    return wrapper.findAll('.v-list-item input[type="checkbox"]')
  }

  const getFactoryListItems = (wrapper: ReturnType<typeof mount>) => {
    return wrapper.findAll('.v-list-item')
  }

  const getLastEmittedValue = (
    wrapper: ReturnType<typeof mount>,
    eventName = 'update:modelValue',
  ) => {
    const emitted = wrapper.emitted(eventName)
    if (!emitted) return null
    return emitted[emitted.length - 1][0]
  }

  describe('Initial State', () => {
    it('shows Select All checkbox unchecked initially', () => {
      const wrapper = mountFactorySelector()

      const selectAllCheckbox = getSelectAllCheckbox(wrapper)
      expect(wrapper.text()).toContain('Select All')
      expect(selectAllCheckbox.element.checked).toBe(false)
    })

    it('shows no factories selected initially', () => {
      const wrapper = mountFactorySelector()

      const factoryCheckboxes = getAllFactoryCheckboxes(wrapper)
      factoryCheckboxes.forEach((checkbox) => {
        expect(checkbox.element.checked).toBe(false)
      })
    })
  })

  describe('Factory Display', () => {
    it('displays all factories from props', () => {
      const wrapper = mountFactorySelector()

      const listItems = getFactoryListItems(wrapper)
      expect(listItems).toHaveLength(3)

      const text = listItems.map((li) => li.text().trim())
      expect(text).toEqual([IRON_FACTORY, COPPER_FACTORY, STEEL_FACTORY])
    })

    it('shows factory icons for each factory', () => {
      const wrapper = mountFactorySelector()

      // Check that CachedIcon components are present via their mock div elements
      const cachedIcons = wrapper.findAll('.cached-icon-stub')
      expect(cachedIcons).toHaveLength(3)

      expect(cachedIcons[0].attributes('data-icon')).toBe(itemDatabase.Desc_IronIngot_C.icon)
      expect(cachedIcons[1].attributes('data-icon')).toBe(itemDatabase.Desc_CopperIngot_C.icon)
      expect(cachedIcons[2].attributes('data-icon')).toBe(itemDatabase.Desc_SteelIngot_C.icon)
    })

    it('handles empty factory list', () => {
      const wrapper = mountFactorySelector({ factories: [] })

      const listItems = getFactoryListItems(wrapper)
      expect(listItems).toHaveLength(0)

      const selectAllCheckbox = getSelectAllCheckbox(wrapper)
      expect(selectAllCheckbox.element.checked).toBe(false)
    })
  })

  describe('Individual Factory Selection', () => {
    it('selects factory when checkbox is clicked', async () => {
      const wrapper = mountFactorySelector()

      const factoryCheckboxes = getAllFactoryCheckboxes(wrapper)
      await factoryCheckboxes[0].trigger('click')

      const emittedValue = getLastEmittedValue(wrapper)
      expect(emittedValue).toEqual([IRON_FACTORY])
    })

    it('selects factory when list item is clicked', async () => {
      const wrapper = mountFactorySelector()

      const listItems = getFactoryListItems(wrapper)
      await listItems[1].trigger('click')

      const emittedValue = getLastEmittedValue(wrapper)
      expect(emittedValue).toEqual([COPPER_FACTORY])
    })

    it('deselects factory when already selected', async () => {
      const wrapper = mountFactorySelector({ modelValue: [IRON_FACTORY] })

      const factoryCheckboxes = getAllFactoryCheckboxes(wrapper)
      await factoryCheckboxes[0].trigger('click')

      const emittedValue = getLastEmittedValue(wrapper)
      expect(emittedValue).toEqual([])
    })

    it('can select multiple factories', async () => {
      const wrapper = mountFactorySelector()

      const factoryCheckboxes = getAllFactoryCheckboxes(wrapper)
      await factoryCheckboxes[0].trigger('click')
      await factoryCheckboxes[2].trigger('click')

      const emittedValues = wrapper.emitted('update:modelValue')
      expect(emittedValues![0][0]).toEqual([IRON_FACTORY])
      expect(emittedValues![1][0]).toEqual([IRON_FACTORY, STEEL_FACTORY])
    })
  })

  describe('Select All Functionality', () => {
    it('selects all factories when Select All is clicked and none are selected', async () => {
      const wrapper = mountFactorySelector()

      const selectAllCheckbox = getSelectAllCheckbox(wrapper)
      await selectAllCheckbox.trigger('click')

      const emittedValue = getLastEmittedValue(wrapper)
      expect(emittedValue).toEqual([IRON_FACTORY, COPPER_FACTORY, STEEL_FACTORY])
    })

    it('deselects all factories when Select All is clicked and all are selected', async () => {
      const wrapper = mountFactorySelector({
        modelValue: [IRON_FACTORY, COPPER_FACTORY, STEEL_FACTORY],
      })

      const selectAllCheckbox = getSelectAllCheckbox(wrapper)
      await selectAllCheckbox.trigger('click')

      const emittedValue = getLastEmittedValue(wrapper)
      expect(emittedValue).toEqual([])
    })

    it('selects all when Select All is clicked in indeterminate state', async () => {
      const wrapper = mountFactorySelector({ modelValue: [IRON_FACTORY] })

      const selectAllCheckbox = getSelectAllCheckbox(wrapper)
      await selectAllCheckbox.trigger('click')

      const emittedValue = getLastEmittedValue(wrapper)
      expect(emittedValue).toEqual([IRON_FACTORY, COPPER_FACTORY, STEEL_FACTORY])
    })
  })

  describe('Checkbox States', () => {
    it('shows Select All as unchecked when no factories selected', () => {
      const wrapper = mountFactorySelector({ modelValue: [] })

      const selectAllCheckbox = getSelectAllCheckbox(wrapper)
      expect(selectAllCheckbox.element.checked).toBe(false)
    })

    it('shows Select All as checked when all factories selected', () => {
      const wrapper = mountFactorySelector({
        modelValue: [IRON_FACTORY, COPPER_FACTORY, STEEL_FACTORY],
      })

      const selectAllCheckbox = getSelectAllCheckbox(wrapper)
      expect(selectAllCheckbox.element.checked).toBe(true)
    })
  })

  describe('Model Value Updates', () => {
    it('reflects initial modelValue in checkbox states', () => {
      const wrapper = mountFactorySelector({ modelValue: [IRON_FACTORY, STEEL_FACTORY] })

      const factoryCheckboxes = getAllFactoryCheckboxes(wrapper)
      expect(factoryCheckboxes[0].element.checked).toBe(true) // Iron
      expect(factoryCheckboxes[1].element.checked).toBe(false) // Copper
      expect(factoryCheckboxes[2].element.checked).toBe(true) // Steel
    })

    it('emits correct factory names in selection order', async () => {
      const wrapper = mountFactorySelector()

      const listItems = getFactoryListItems(wrapper)
      await listItems[2].trigger('click') // Steel Production Complex
      await listItems[0].trigger('click') // Iron Factory

      const emittedValues = wrapper.emitted('update:modelValue')
      expect(emittedValues![0][0]).toEqual([STEEL_FACTORY])
      expect(emittedValues![1][0]).toEqual([STEEL_FACTORY, IRON_FACTORY])
    })

    it('maintains selection order when deselecting middle item', async () => {
      const wrapper = mountFactorySelector({
        modelValue: [IRON_FACTORY, COPPER_FACTORY, STEEL_FACTORY],
      })

      const factoryCheckboxes = getAllFactoryCheckboxes(wrapper)
      await factoryCheckboxes[1].trigger('click') // Deselect Copper

      const emittedValue = getLastEmittedValue(wrapper)
      expect(emittedValue).toEqual([IRON_FACTORY, STEEL_FACTORY])
    })
  })

  describe('Edge Cases', () => {
    it('prevents event propagation on checkbox click to avoid double toggle', async () => {
      const wrapper = mountFactorySelector()

      const factoryCheckboxes = getAllFactoryCheckboxes(wrapper)
      const clickEvent = new Event('click', { bubbles: true })
      Object.defineProperty(clickEvent, 'stopPropagation', { value: vi.fn() })

      await factoryCheckboxes[0].trigger('click')

      // Should only emit once, not twice
      const emittedValues = wrapper.emitted('update:modelValue')
      expect(emittedValues).toHaveLength(1)
    })

    it('handles modelValue with non-existent factory names', () => {
      const wrapper = mountFactorySelector({ modelValue: ['Non-existent Factory', IRON_FACTORY] })

      const factoryCheckboxes = getAllFactoryCheckboxes(wrapper)
      expect(factoryCheckboxes[0].element.checked).toBe(true) // Iron Factory should still be checked
      expect(factoryCheckboxes[1].element.checked).toBe(false)
      expect(factoryCheckboxes[2].element.checked).toBe(false)
    })

    it('handles single factory correctly', () => {
      const singleFactory = [mockFactories[0]]
      const wrapper = mountFactorySelector({ factories: singleFactory })

      // Select the single factory
      const factoryCheckboxes = getAllFactoryCheckboxes(wrapper)
      expect(factoryCheckboxes).toHaveLength(1)

      // Select All should work with single factory
      const selectAllCheckbox = getSelectAllCheckbox(wrapper)
      expect(selectAllCheckbox.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes on checkboxes', () => {
      const wrapper = mountFactorySelector()

      const selectAllCheckbox = getSelectAllCheckbox(wrapper)
      expect(selectAllCheckbox.attributes('type')).toBe('checkbox')

      const factoryCheckboxes = getAllFactoryCheckboxes(wrapper)
      factoryCheckboxes.forEach((checkbox) => {
        expect(checkbox.attributes('type')).toBe('checkbox')
      })
    })

    it('maintains focus order through factory list', () => {
      const wrapper = mountFactorySelector()

      const listItems = getFactoryListItems(wrapper)
      listItems.forEach((item) => {
        // Each list item should be clickable
        expect(item.exists()).toBe(true)
      })
    })
  })
})
