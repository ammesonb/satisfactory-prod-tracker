import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { VAutocomplete } from 'vuetify/components'
import type { SearchOptions, IconConfig, DisplayConfig } from '@/types/ui'
import type { ItemOption } from '@/types/data'
import {
  mockFilteredItems,
  mockSearchInput,
  mockUpdateSearch,
} from '@/__tests__/fixtures/composables/dataSearch'
import {
  expectElementExists,
  expectElementNotExists,
  emitEvent,
  expectProps,
} from '@/__tests__/vue-test-helpers'

import GameDataSelector from '@/components/common/GameDataSelector.vue'
import CachedIcon from '@/components/common/CachedIcon.vue'

vi.mock('@/composables/useDataSearch', async () => {
  const { mockUseDataSearch } = await import('@/__tests__/fixtures/composables/dataSearch')
  return { useDataSearch: mockUseDataSearch }
})

// Mock the image utility
vi.mock('@/logistics/images', () => ({
  getIconURL: vi.fn(
    (icon: string, size: number) => `https://example.com/icons/${icon}-${size}.png`,
  ),
}))

describe('GameDataSelector Integration', () => {
  // Test constants
  const ITEM_VALUES = {
    IRON_ORE: 'iron-ore',
    COPPER_ORE: 'copper-ore',
    IRON_INGOT: 'iron-ingot',
    CONSTRUCTOR: 'constructor',
  } as const

  const ITEM_NAMES = {
    IRON_ORE: 'Iron Ore',
    COPPER_ORE: 'Copper Ore',
    IRON_INGOT: 'Iron Ingot',
    CONSTRUCTOR: 'Constructor',
  } as const

  const ITEM_ICONS = {
    IRON_ORE: 'Desc_OreIron_C',
    COPPER_ORE: 'Desc_OreCopper_C',
    IRON_INGOT: 'Desc_IronIngot_C',
    CONSTRUCTOR: 'Build_ConstructorMk1_C',
  } as const

  const ITEM_TYPES = {
    ITEM: 'item',
    BUILDING: 'building',
  } as const

  const UI_TEXT = {
    DEFAULT_PLACEHOLDER: 'Search...',
    CUSTOM_PLACEHOLDER: 'Select an item...',
    LABEL: 'Choose Item',
  } as const

  const ICON_SIZES = {
    DEFAULT_SELECTED: 24,
    CUSTOM_SELECTED: 20,
    CUSTOM_DROPDOWN: 48,
  } as const

  const SEARCH_OPTIONS = {
    DEBOUNCE_MS: 300,
    MAX_RESULTS: 25,
    MAX_NO_SEARCH_RESULTS: 10,
    CUSTOM_MAX_RESULTS: 100,
  } as const

  const mockItems: ItemOption[] = [
    {
      value: ITEM_VALUES.IRON_ORE,
      name: ITEM_NAMES.IRON_ORE,
      icon: ITEM_ICONS.IRON_ORE,
      type: ITEM_TYPES.ITEM,
    },
    {
      value: ITEM_VALUES.COPPER_ORE,
      name: ITEM_NAMES.COPPER_ORE,
      icon: ITEM_ICONS.COPPER_ORE,
      type: ITEM_TYPES.ITEM,
    },
    {
      value: ITEM_VALUES.IRON_INGOT,
      name: ITEM_NAMES.IRON_INGOT,
      icon: ITEM_ICONS.IRON_INGOT,
      type: ITEM_TYPES.ITEM,
    },
    {
      value: ITEM_VALUES.CONSTRUCTOR,
      name: ITEM_NAMES.CONSTRUCTOR,
      icon: ITEM_ICONS.CONSTRUCTOR,
      type: ITEM_TYPES.BUILDING,
    },
  ]

  beforeEach(async () => {
    vi.resetAllMocks()
    // Reset reactive refs
    mockSearchInput.value = ''
    mockFilteredItems.value = []
  })

  const createWrapper = (props = {}) => {
    return mount(GameDataSelector, {
      props: {
        items: mockItems,
        ...props,
      },
    })
  }

  it('renders with default props', () => {
    const wrapper = createWrapper()

    expectElementExists(wrapper, VAutocomplete)
    expectProps(wrapper, VAutocomplete, {
      placeholder: UI_TEXT.DEFAULT_PLACEHOLDER,
      clearable: true,
      disabled: false,
    })
  })

  it('renders with custom display config', () => {
    const displayConfig: DisplayConfig = {
      placeholder: UI_TEXT.CUSTOM_PLACEHOLDER,
      variant: 'filled',
      density: 'compact',
      hideDetails: false,
      label: UI_TEXT.LABEL,
    }

    const wrapper = createWrapper({ displayConfig })

    expectProps(wrapper, VAutocomplete, {
      placeholder: UI_TEXT.CUSTOM_PLACEHOLDER,
      variant: 'filled',
      density: 'compact',
      hideDetails: false,
      label: UI_TEXT.LABEL,
    })
  })

  it('passes through disabled and clearable props', () => {
    const wrapper = createWrapper({
      disabled: true,
      clearable: false,
    })

    expectProps(wrapper, VAutocomplete, {
      disabled: true,
      clearable: false,
    })
  })

  it('calls useDataSearch composable with correct parameters', async () => {
    const searchOptions: SearchOptions = {
      debounceMs: SEARCH_OPTIONS.DEBOUNCE_MS,
      maxResults: SEARCH_OPTIONS.MAX_RESULTS,
      maxNoSearchResults: SEARCH_OPTIONS.MAX_NO_SEARCH_RESULTS,
    }

    const { useDataSearch } = await import('@/composables/useDataSearch')
    createWrapper({ searchOptions })

    expect(useDataSearch).toHaveBeenCalledWith(
      expect.any(Object), // toRef for items
      expect.any(Function), // matchesFn
      searchOptions,
    )
  })

  it('emits update:modelValue when selection changes', async () => {
    const wrapper = createWrapper()

    await emitEvent(wrapper, VAutocomplete, 'update:modelValue', mockItems[0])

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([mockItems[0]])
  })

  it('emits undefined when selection is cleared', async () => {
    const wrapper = createWrapper({ modelValue: mockItems[0] })

    await emitEvent(wrapper, VAutocomplete, 'update:modelValue', undefined)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([undefined])
  })

  it('calls updateSearch when search input changes', async () => {
    const wrapper = createWrapper()

    const SEARCH_TERM = 'iron'
    await emitEvent(wrapper, VAutocomplete, 'update:search', SEARCH_TERM)

    expect(mockUpdateSearch).toHaveBeenCalledWith(SEARCH_TERM)
  })

  it('displays selected item with icon when showIcons is enabled', () => {
    const iconConfig: IconConfig = {
      showIcons: true,
      selectedIconSize: ICON_SIZES.CUSTOM_SELECTED,
    }

    const wrapper = createWrapper({
      modelValue: mockItems[0],
      iconConfig,
    })

    expectElementExists(wrapper, CachedIcon)
    const cachedIcon = wrapper.findComponent(CachedIcon)
    expect(cachedIcon.props('icon')).toBe(ITEM_ICONS.IRON_ORE)
    expect(cachedIcon.props('size')).toBe(ICON_SIZES.CUSTOM_SELECTED)
  })

  it('does not display selected icon when showIcons is disabled', () => {
    const iconConfig: IconConfig = {
      showIcons: false,
    }

    const wrapper = createWrapper({
      modelValue: mockItems[0],
      iconConfig,
    })

    expectElementNotExists(wrapper, CachedIcon)
  })

  it('uses default icon sizes when not specified', () => {
    const wrapper = createWrapper({
      modelValue: mockItems[0],
    })

    const cachedIcon = wrapper.findComponent(CachedIcon)
    expect(cachedIcon.props('size')).toBe(ICON_SIZES.DEFAULT_SELECTED)
  })

  it('shows correct autocomplete configuration', () => {
    expectProps(createWrapper(), VAutocomplete, {
      itemTitle: 'name',
      itemValue: 'value',
      returnObject: true,
      noFilter: true,
    })
  })

  it('configures menu props correctly', () => {
    expectProps(createWrapper(), VAutocomplete, {
      menuProps: {
        closeOnContentClick: true,
      },
    })
  })

  it('handles empty filtered results from composable', () => {
    mockFilteredItems.value = []
    expectProps(createWrapper(), VAutocomplete, {
      items: [],
    })
  })

  it('passes through class prop', () => {
    expectProps(createWrapper({ class: 'custom-selector' }), VAutocomplete, {
      class: 'custom-selector',
    })
  })

  it('handles v-model binding correctly', async () => {
    const modelValue = ref<ItemOption | undefined>(undefined)
    const wrapper = mount(GameDataSelector, {
      props: {
        items: mockItems,
        modelValue: modelValue.value,
        'onUpdate:modelValue': (value: ItemOption | undefined) => {
          modelValue.value = value
        },
      },
    })

    // Test selection
    await emitEvent(wrapper, VAutocomplete, 'update:modelValue', mockItems[1])
    expect(modelValue.value).toEqual(mockItems[1])

    // Test clearing
    await emitEvent(wrapper, VAutocomplete, 'update:modelValue', undefined)
    expect(modelValue.value).toBeUndefined()
  })

  it('uses filtered items from composable', () => {
    const filteredItems = [mockItems[0], mockItems[2]]
    mockFilteredItems.value = filteredItems
    expectProps(createWrapper(), VAutocomplete, {
      items: filteredItems,
    })
  })

  it('passes search input from composable', () => {
    const SEARCH_VALUE = 'iron'
    mockSearchInput.value = SEARCH_VALUE

    expectProps(createWrapper(), VAutocomplete, {
      search: SEARCH_VALUE,
    })
  })

  it('displays item type chips when showType is enabled', () => {
    const displayConfig: DisplayConfig = {
      showType: true,
    }

    mockFilteredItems.value = mockItems
    const wrapper = createWrapper({ displayConfig })

    // The chips would be in the item template, but testing the config
    expect(wrapper.vm.displayConfig!.showType).toBe(true)
  })

  it('does not display item type chips by default', () => {
    const wrapper = createWrapper()

    expect(wrapper.vm.displayConfig!.showType).toBe(false)
  })

  it('merges icon config with defaults', () => {
    const iconConfig: IconConfig = {
      dropdownIconSize: ICON_SIZES.CUSTOM_DROPDOWN,
    }

    const wrapper = createWrapper({ iconConfig })

    expect(wrapper.vm.iconConfig).toEqual({
      showIcons: true, // default
      dropdownIconSize: ICON_SIZES.CUSTOM_DROPDOWN, // provided
      selectedIconSize: ICON_SIZES.DEFAULT_SELECTED, // default
    })
  })
})
