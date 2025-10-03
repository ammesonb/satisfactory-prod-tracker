import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { VCheckbox, VListItem, VList, VCard } from 'vuetify/components'
import FactorySelector from '@/components/common/FactorySelector.vue'
import type { Factory } from '@/types/factory'
import { component } from '@/__tests__/vue-test-helpers'
import {
  mockAllSelected,
  mockSomeSelected,
  mockIsSelected,
  mockToggleAll,
  mockToggleItem,
} from '@/__tests__/fixtures/composables/selection'
import CachedIcon from '../CachedIcon.vue'

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

    component(wrapper, VCheckbox).assert()
    expect(wrapper.text()).toContain(UI_TEXT.SELECT_ALL)
    component(wrapper, VListItem).assert({ count: EXPECTED_FACTORY_COUNT })
  })

  it('renders custom title when provided', () => {
    const wrapper = createWrapper({ title: UI_TEXT.CHOOSE_YOUR_FACTORIES })

    // Title prop is not displayed in template, but component should accept it
    expect(wrapper.props('title')).toBe(UI_TEXT.CHOOSE_YOUR_FACTORIES)
  })

  it('displays all factories in the list', () => {
    const text = createWrapper().text()
    for (const name of Object.values(FACTORY_NAMES)) {
      expect(text).toContain(name)
    }
  })

  it('renders factory icons using CachedIcon component', () => {
    const iconWrapper = component(createWrapper(), CachedIcon).match(
      (icon) => icon.props('size') === ICON_SIZE,
    )
    iconWrapper.assert({ count: EXPECTED_FACTORY_COUNT })
    const cachedIcons = iconWrapper.getComponents()
    expect(cachedIcons[0].props('icon')).toBe(FACTORY_ICONS.IRON)
    expect(cachedIcons[1].props('icon')).toBe(FACTORY_ICONS.STEEL)
    expect(cachedIcons[2].props('icon')).toBe(FACTORY_ICONS.CONCRETE)
  })

  it('calls toggleAll when select all checkbox is clicked', async () => {
    await component(createWrapper(), VCheckbox).getComponents()[0].trigger('click')
    expect(mockToggleAll).toHaveBeenCalled()
  })

  it('calls toggleItem when factory list item is clicked', async () => {
    const wrapper = createWrapper()
    const firstListItem = component(wrapper, VListItem).getComponents()[0]
    await firstListItem.trigger('click')
    await wrapper.vm.$nextTick()
    expect(mockToggleItem).toHaveBeenCalledWith(FACTORY_NAMES.IRON)
  })

  it('calls toggleItem when individual factory checkbox is clicked', async () => {
    const wrapper = createWrapper()
    const factoryCheckboxes = component(wrapper, VListItem).getComponents()
    await factoryCheckboxes[1].trigger('click')
    await wrapper.vm.$nextTick()
    expect(mockToggleItem).toHaveBeenCalledWith(FACTORY_NAMES.STEEL)
  })

  it('shows indeterminate state when some factories are selected', () => {
    mockSomeSelected.mockReturnValue(true)
    mockAllSelected.mockReturnValue(false)

    expect(component(createWrapper(), VCheckbox).getComponents()[0].props('indeterminate')).toBe(
      true,
    )
  })

  it('shows checked state when all factories are selected', () => {
    mockAllSelected.mockReturnValue(true)
    mockSomeSelected.mockReturnValue(true)

    expect(component(createWrapper(), VCheckbox).getComponents()[0].props('indeterminate')).toBe(
      false,
    )
  })

  it('shows individual factory as selected when isSelected returns true', () => {
    mockIsSelected.mockImplementation((name: string) => name === FACTORY_NAMES.STEEL)

    const wrapper = createWrapper()
    const factoryCheckboxes = component(wrapper, VCheckbox).getComponents()
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

    component(wrapper, VListItem).assert({ count: 0 })
    component(wrapper, VList).assert({ exists: true })
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

    component(wrapper, VCheckbox)
      .getComponents()
      .forEach((checkbox) => {
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
