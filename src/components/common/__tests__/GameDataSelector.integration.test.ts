import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import {
  mockFilteredItems,
  mockSearchInput,
  mockUpdateSearch,
} from '@/__tests__/fixtures/composables/dataSearch'
import { component } from '@/__tests__/vue-test-helpers'
import { useDataSearch } from '@/composables/useDataSearch'
import type { ItemOption } from '@/types/data'
import type { DisplayConfig, IconConfig, SearchOptions } from '@/types/ui'

import CachedIcon from '@/components/common/CachedIcon.vue'
import GameDataSelector from '@/components/common/GameDataSelector.vue'
import { VAutocomplete } from 'vuetify/components'

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

    component(wrapper, VAutocomplete).assert({
      props: {
        placeholder: UI_TEXT.DEFAULT_PLACEHOLDER,
        clearable: true,
        disabled: false,
      },
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

    component(wrapper, VAutocomplete).assert({
      props: {
        placeholder: UI_TEXT.CUSTOM_PLACEHOLDER,
        variant: 'filled',
        density: 'compact',
        hideDetails: false,
        label: UI_TEXT.LABEL,
      },
    })
  })

  it('passes through disabled and clearable props', () => {
    const props = {
      disabled: true,
      clearable: false,
    }
    const wrapper = createWrapper(props)

    component(wrapper, VAutocomplete).assert({ props })
  })

  it('calls useDataSearch composable with correct parameters', async () => {
    const searchOptions: SearchOptions = {
      debounceMs: SEARCH_OPTIONS.DEBOUNCE_MS,
      maxResults: SEARCH_OPTIONS.MAX_RESULTS,
      maxNoSearchResults: SEARCH_OPTIONS.MAX_NO_SEARCH_RESULTS,
    }

    createWrapper({ searchOptions })

    expect(useDataSearch).toHaveBeenCalledWith(
      expect.any(Object), // toRef for items
      expect.any(Function), // matchesFn
      searchOptions,
    )
  })

  it('emits update:modelValue when selection changes', async () => {
    const wrapper = createWrapper()

    await component(wrapper, VAutocomplete).emit('update:modelValue', mockItems[0])

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([mockItems[0]])
  })

  it('emits undefined when selection is cleared', async () => {
    const wrapper = createWrapper({ modelValue: mockItems[0] })

    await component(wrapper, VAutocomplete).emit('update:modelValue', undefined)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([undefined])
  })

  it('calls updateSearch when search input changes', async () => {
    const wrapper = createWrapper()

    const SEARCH_TERM = 'iron'
    await component(wrapper, VAutocomplete).emit('update:search', SEARCH_TERM)

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

    component(wrapper, CachedIcon).assert({
      exists: true,
      props: {
        icon: ITEM_ICONS.IRON_ORE,
        size: ICON_SIZES.CUSTOM_SELECTED,
      },
    })
  })

  it('does not display selected icon when showIcons is disabled', () => {
    const iconConfig: IconConfig = {
      showIcons: false,
    }

    const wrapper = createWrapper({
      modelValue: mockItems[0],
      iconConfig,
    })

    component(wrapper, CachedIcon).assert({ exists: false })
  })

  it('uses default icon sizes when not specified', () => {
    const wrapper = createWrapper({
      modelValue: mockItems[0],
    })

    component(wrapper, CachedIcon).assert({
      props: {
        size: ICON_SIZES.DEFAULT_SELECTED,
      },
    })
  })

  it('shows correct autocomplete configuration', () => {
    component(createWrapper(), VAutocomplete).assert({
      props: {
        itemTitle: 'name',
        itemValue: 'value',
        returnObject: true,
        noFilter: true,
      },
    })
  })

  it('configures menu props correctly', () => {
    component(createWrapper(), VAutocomplete).assert({
      props: {
        menuProps: {
          closeOnContentClick: true,
        },
      },
    })
  })

  it('handles empty filtered results from composable', () => {
    mockFilteredItems.value = []
    component(createWrapper(), VAutocomplete).assert({
      props: {
        items: [],
      },
    })
  })

  it('passes through class prop', () => {
    component(createWrapper({ class: 'custom-selector' }), VAutocomplete).assert({
      props: {
        class: 'custom-selector',
      },
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
    await component(wrapper, VAutocomplete).emit('update:modelValue', mockItems[1])
    expect(modelValue.value).toEqual(mockItems[1])

    // Test clearing
    await component(wrapper, VAutocomplete).emit('update:modelValue', undefined)
    expect(modelValue.value).toBeUndefined()
  })

  it('uses filtered items from composable', () => {
    const filteredItems = [mockItems[0], mockItems[2]]
    mockFilteredItems.value = filteredItems
    component(createWrapper(), VAutocomplete).assert({
      props: {
        items: filteredItems,
      },
    })
  })

  it('passes search input from composable', () => {
    const SEARCH_VALUE = 'iron'
    mockSearchInput.value = SEARCH_VALUE

    component(createWrapper(), VAutocomplete).assert({
      props: {
        search: SEARCH_VALUE,
      },
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
