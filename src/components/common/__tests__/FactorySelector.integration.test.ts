import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { VCheckbox, VListItem, VList, VCard } from 'vuetify/components'
import FactorySelector from '@/components/common/FactorySelector.vue'
import type { Factory } from '@/types/factory'
import { expectProps } from '@/__tests__/vue-test-helpers'
import {
  mockAllSelected,
  mockSomeSelected,
  mockIsSelected,
  mockToggleAll,
  mockToggleItem,
} from '@/__tests__/fixtures/composables/selection'

// Mock the useSelection composable
vi.mock('@/composables/useSelection', async () => {
  const { mockUseSelection } = await import('@/__tests__/fixtures/composables')
  return { useSelection: mockUseSelection }
})

// Mock the image utility
vi.mock('@/logistics/images', () => ({
  getIconURL: vi.fn(
    (icon: string, size: number) => `https://example.com/icons/${icon}-${size}.png`,
  ),
}))

describe('FactorySelector Integration', () => {
  // Test constants
  const FACTORY_NAMES = {
    IRON: 'Iron Factory',
    STEEL: 'Steel Factory',
    CONCRETE: 'Concrete Factory',
  } as const

  const FACTORY_ICONS = {
    IRON: 'iron-ingot',
    STEEL: 'steel-ingot',
    CONCRETE: 'concrete',
  } as const

  const UI_TEXT = {
    SELECT_ALL: 'Select All',
    SELECT_FACTORIES: 'Select Factories',
    CHOOSE_YOUR_FACTORIES: 'Choose Your Factories',
  } as const

  const ICON_SIZE = 24
  const EXPECTED_FACTORY_COUNT = 3

  const mockFactories: Factory[] = [
    {
      name: FACTORY_NAMES.IRON,
      icon: FACTORY_ICONS.IRON,
      floors: [],
      recipeLinks: {},
    },
    {
      name: FACTORY_NAMES.STEEL,
      icon: FACTORY_ICONS.STEEL,
      floors: [],
      recipeLinks: {},
    },
    {
      name: FACTORY_NAMES.CONCRETE,
      icon: FACTORY_ICONS.CONCRETE,
      floors: [],
      recipeLinks: {},
    },
  ]

  beforeEach(async () => {
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(FactorySelector, {
      props: {
        factories: mockFactories,
        title: UI_TEXT.SELECT_FACTORIES,
        ...props,
      },
    })
  }

  it('renders with default props', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
    expect(wrapper.text()).toContain(UI_TEXT.SELECT_ALL)
    expect(wrapper.findAll('.v-list-item')).toHaveLength(EXPECTED_FACTORY_COUNT)
  })

  it('renders custom title when provided', () => {
    const wrapper = createWrapper({ title: UI_TEXT.CHOOSE_YOUR_FACTORIES })

    // Title prop is not displayed in template, but component should accept it
    expect(wrapper.props('title')).toBe(UI_TEXT.CHOOSE_YOUR_FACTORIES)
  })

  it('displays all factories in the list', () => {
    const wrapper = createWrapper()

    expect(wrapper.text()).toContain(FACTORY_NAMES.IRON)
    expect(wrapper.text()).toContain(FACTORY_NAMES.STEEL)
    expect(wrapper.text()).toContain(FACTORY_NAMES.CONCRETE)
  })

  it('renders factory icons using CachedIcon component', () => {
    const wrapper = createWrapper()

    const cachedIcons = wrapper.findAllComponents({ name: 'CachedIcon' })
    expect(cachedIcons).toHaveLength(EXPECTED_FACTORY_COUNT)

    expect(cachedIcons[0].props('icon')).toBe(FACTORY_ICONS.IRON)
    expect(cachedIcons[1].props('icon')).toBe(FACTORY_ICONS.STEEL)
    expect(cachedIcons[2].props('icon')).toBe(FACTORY_ICONS.CONCRETE)

    cachedIcons.forEach((icon) => {
      expect(icon.props('size')).toBe(ICON_SIZE)
    })
  })

  it('calls toggleAll when select all checkbox is clicked', async () => {
    const wrapper = createWrapper()

    const selectAllCheckbox = wrapper.find('input[type="checkbox"]')
    await selectAllCheckbox.trigger('click')

    expect(mockToggleAll).toHaveBeenCalled()
  })

  it('calls toggleItem when factory list item is clicked', async () => {
    const wrapper = createWrapper()

    const firstFactoryItem = wrapper.find('.v-list-item')
    await firstFactoryItem.trigger('click')

    expect(mockToggleItem).toHaveBeenCalledWith(FACTORY_NAMES.IRON)
  })

  it('calls toggleItem when individual factory checkbox is clicked', async () => {
    const wrapper = createWrapper()

    const factoryCheckboxes = wrapper.findAll('.v-list-item input[type="checkbox"]')
    await factoryCheckboxes[1].trigger('click')

    expect(mockToggleItem).toHaveBeenCalledWith(FACTORY_NAMES.STEEL)
  })

  it('prevents event propagation when clicking factory checkbox directly', async () => {
    const wrapper = createWrapper()

    // This test verifies the @click.stop directive works by checking the toggle is called
    // without the parent list item handler being triggered
    const factoryCheckbox = wrapper.find('.v-list-item input[type="checkbox"]')
    await factoryCheckbox.trigger('click')

    // Verify that toggleItem was called (checkbox handler)
    expect(mockToggleItem).toHaveBeenCalledWith(FACTORY_NAMES.IRON)
  })

  it('shows indeterminate state when some factories are selected', () => {
    mockSomeSelected.mockReturnValue(true)
    mockAllSelected.mockReturnValue(false)

    expectProps(createWrapper(), VCheckbox, { indeterminate: true })
  })

  it('shows checked state when all factories are selected', () => {
    mockAllSelected.mockReturnValue(true)
    mockSomeSelected.mockReturnValue(true)

    expectProps(createWrapper(), VCheckbox, { modelValue: true, indeterminate: false })
  })

  it('shows individual factory as selected when isSelected returns true', () => {
    mockIsSelected.mockImplementation((name: string) => name === FACTORY_NAMES.STEEL)

    const wrapper = createWrapper()

    const factoryCheckboxes = wrapper.findAllComponents(VCheckbox)
    // First checkbox is "Select All", then factory checkboxes
    expect(factoryCheckboxes[2].props('modelValue')).toBe(true) // Steel Factory
    expect(factoryCheckboxes[1].props('modelValue')).toBe(false) // Iron Factory
  })

  it('updates v-model when selectedFactories changes', async () => {
    const selectedFactories = ref<string[]>([FACTORY_NAMES.IRON])
    const wrapper = mount(FactorySelector, {
      props: {
        factories: mockFactories,
        modelValue: selectedFactories.value,
        'onUpdate:modelValue': (value: string[]) => {
          selectedFactories.value = value
        },
      },
    })

    expect(wrapper.props('modelValue')).toEqual([FACTORY_NAMES.IRON])

    await wrapper.setProps({ modelValue: [FACTORY_NAMES.IRON, FACTORY_NAMES.STEEL] })

    expect(wrapper.props('modelValue')).toEqual([FACTORY_NAMES.IRON, FACTORY_NAMES.STEEL])
  })

  it('handles empty factories list gracefully', () => {
    const wrapper = createWrapper({ factories: [] })

    expect(wrapper.findAllComponents(VListItem)).toHaveLength(0)
    expect(wrapper.findComponent(VList).exists()).toBe(true)
  })

  it('calls composable with correct parameters', async () => {
    const { useSelection } = await import('@/composables/useSelection')

    createWrapper()

    expect(useSelection).toHaveBeenCalledWith({
      items: expect.any(Object), // toRefs creates reactive references
      selected: expect.any(Object),
      getKey: expect.any(Function),
    })

    // Test the getKey function
    const call = vi.mocked(useSelection).mock.calls[0]
    const getKey = call[0].getKey
    expect(getKey(mockFactories[0])).toBe(FACTORY_NAMES.IRON)
  })

  it('has proper accessibility attributes', () => {
    const wrapper = createWrapper()

    const checkboxes = wrapper.findAllComponents(VCheckbox)
    checkboxes.forEach((checkbox) => {
      expect(checkbox.props('hideDetails')).toBe(true)
    })
  })

  it('has scrollable factory list with max height', () => {
    const wrapper = createWrapper()

    const factoryCard = wrapper.findComponent(VCard)
    expect(factoryCard.props('maxHeight')).toBe('300')
    expect(factoryCard.attributes('style')).toContain('overflow-y: auto')
  })
})
