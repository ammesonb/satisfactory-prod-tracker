import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import ItemSelector from '@/components/common/ItemSelector.vue'
import GameDataSelector from '@/components/common/GameDataSelector.vue'
import type { DisplayConfig, IconConfig } from '@/types/ui'
import type { ItemOption, Item, Building } from '@/types/data'
import type { IDataStore } from '@/types/stores'

// Mock the useStores composable
const mockDataStore = {
  items: [
    {
      name: 'Iron Ore',
      icon: 'Desc_OreIron_C',
      type: 'item',
    },
    {
      name: 'Copper Ore',
      icon: 'Desc_OreCopper_C',
      type: 'item',
    },
    {
      name: 'Iron Ingot',
      icon: 'Desc_IronIngot_C',
      type: 'item',
    },
  ],
  buildings: [
    {
      name: 'Constructor',
      icon: 'Build_ConstructorMk1_C',
      type: 'building',
    },
    {
      name: 'Assembler',
      icon: 'Build_AssemblerMk1_C',
      type: 'building',
    },
  ],
} as unknown as Partial<IDataStore>

vi.mock('@/composables/useStores', () => ({
  getStores: vi.fn(() => ({
    dataStore: mockDataStore,
  })),
}))

// Mock the utility functions
vi.mock('@/utils/items', () => ({
  itemsToOptions: vi.fn((items: Record<string, Item>) =>
    Object.entries(items)
      .filter(([, item]) => item.icon)
      .map(([key, item]) => ({
        value: key,
        name: item.name,
        icon: item.icon!,
        type: 'item' as const,
      })),
  ),
}))

vi.mock('@/utils/buildings', () => ({
  buildingsToOptions: vi.fn((buildings: Record<string, Building>) =>
    Object.entries(buildings)
      .filter(([, building]) => building.icon)
      .map(([key, building]) => ({
        value: key,
        name: building.name,
        icon: building.icon!,
        type: 'building' as const,
      })),
  ),
}))

describe('ItemSelector Integration', () => {
  // Test constants
  const DEFAULT_PLACEHOLDER = 'Search for an item...'
  const CUSTOM_PLACEHOLDER = 'Select an item...'
  const CUSTOM_LABEL = 'Choose Item'

  const EXPECTED_ITEM_COUNT = 3
  const EXPECTED_BUILDING_COUNT = 2
  const EXPECTED_TOTAL_COUNT = EXPECTED_ITEM_COUNT + EXPECTED_BUILDING_COUNT

  const ITEM_NAMES = {
    IRON_ORE: 'Iron Ore',
    COPPER_ORE: 'Copper Ore',
    IRON_INGOT: 'Iron Ingot',
  } as const

  const ICON_SIZES = {
    DEFAULT: 24,
    CUSTOM: 32,
  } as const

  const mockSelectedItem: ItemOption = {
    value: 'iron-ore',
    name: ITEM_NAMES.IRON_ORE,
    icon: 'Desc_OreIron_C',
    type: 'item',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(ItemSelector, {
      props: {
        ...props,
      },
    })
  }

  it('renders GameDataSelector component', () => {
    const wrapper = createWrapper()

    const gameDataSelector = wrapper.findComponent(GameDataSelector)
    expect(gameDataSelector.exists()).toBe(true)
  })

  it('passes through modelValue to GameDataSelector', () => {
    const wrapper = createWrapper({ modelValue: mockSelectedItem })
    const gameDataSelector = wrapper.findComponent(GameDataSelector)

    expect(gameDataSelector.props('modelValue')).toEqual(mockSelectedItem)
  })

  it('passes through disabled prop to GameDataSelector', () => {
    const wrapper = createWrapper({ disabled: true })
    const gameDataSelector = wrapper.findComponent(GameDataSelector)

    expect(gameDataSelector.props('disabled')).toBe(true)
  })

  it('uses default placeholder when no displayConfig provided', () => {
    const wrapper = createWrapper()
    const gameDataSelector = wrapper.findComponent(GameDataSelector)

    expect(gameDataSelector.props('displayConfig')).toEqual({
      placeholder: DEFAULT_PLACEHOLDER,
      showType: true, // includeBuildings default
    })
  })

  it('merges custom displayConfig with defaults', () => {
    const displayConfig: Partial<DisplayConfig> = {
      placeholder: CUSTOM_PLACEHOLDER,
      label: CUSTOM_LABEL,
      variant: 'filled',
    }

    const wrapper = createWrapper({ displayConfig })
    const gameDataSelector = wrapper.findComponent(GameDataSelector)

    expect(gameDataSelector.props('displayConfig')).toEqual({
      placeholder: CUSTOM_PLACEHOLDER,
      label: CUSTOM_LABEL,
      variant: 'filled',
      showType: true, // includeBuildings default
    })
  })

  it('passes through iconConfig to GameDataSelector', () => {
    const iconConfig: Partial<IconConfig> = {
      selectedIconSize: ICON_SIZES.CUSTOM,
      showIcons: false,
    }

    const wrapper = createWrapper({ iconConfig })
    const gameDataSelector = wrapper.findComponent(GameDataSelector)

    expect(gameDataSelector.props('iconConfig')).toEqual(iconConfig)
  })

  it('includes both items and buildings by default', async () => {
    const wrapper = createWrapper()
    const gameDataSelector = wrapper.findComponent(GameDataSelector)

    const items = gameDataSelector.props('items')
    expect(items).toHaveLength(EXPECTED_TOTAL_COUNT)

    // Check that items are sorted alphabetically
    const itemNames = items.map((item: ItemOption) => item.name)
    const sortedNames = [...itemNames].sort()
    expect(itemNames).toEqual(sortedNames)
  })

  it('excludes buildings when includeBuildings is false', () => {
    const wrapper = createWrapper({ includeBuildings: false })
    const gameDataSelector = wrapper.findComponent(GameDataSelector)

    const items = gameDataSelector.props('items')
    expect(items).toHaveLength(EXPECTED_ITEM_COUNT)

    // Verify only items are included
    items.forEach((item: ItemOption) => {
      expect(item.type).toBe('item')
    })
  })

  it('sets showType to false when includeBuildings is false', () => {
    const wrapper = createWrapper({ includeBuildings: false })
    const gameDataSelector = wrapper.findComponent(GameDataSelector)

    expect(gameDataSelector.props('displayConfig')!.showType).toBe(false)
  })

  it('sets showType to true when includeBuildings is true', () => {
    const wrapper = createWrapper({ includeBuildings: true })
    const gameDataSelector = wrapper.findComponent(GameDataSelector)

    expect(gameDataSelector.props('displayConfig')!.showType).toBe(true)
  })

  it('overrides custom showType with includeBuildings value', () => {
    const displayConfig: Partial<DisplayConfig> = {
      showType: false, // This will be overridden
    }

    const wrapper = createWrapper({
      includeBuildings: true,
      displayConfig,
    })
    const gameDataSelector = wrapper.findComponent(GameDataSelector)

    // includeBuildings should override custom showType
    expect(gameDataSelector.props('displayConfig')!.showType).toBe(true)
  })

  it('emits update:modelValue when GameDataSelector emits update:modelValue', async () => {
    const wrapper = createWrapper()
    const gameDataSelector = wrapper.findComponent(GameDataSelector)

    await gameDataSelector.vm.$emit('update:modelValue', mockSelectedItem)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([mockSelectedItem])
  })

  it('emits undefined when selection is cleared', async () => {
    const wrapper = createWrapper({ modelValue: mockSelectedItem })
    const gameDataSelector = wrapper.findComponent(GameDataSelector)

    await gameDataSelector.vm.$emit('update:modelValue', undefined)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([undefined])
  })

  it('handles v-model binding correctly', async () => {
    const modelValue = ref<ItemOption | undefined>(undefined)
    const wrapper = mount(ItemSelector, {
      props: {
        modelValue: modelValue.value,
        'onUpdate:modelValue': (value: ItemOption | undefined) => {
          modelValue.value = value
        },
      },
    })

    const gameDataSelector = wrapper.findComponent(GameDataSelector)

    // Test selection
    await gameDataSelector.vm.$emit('update:modelValue', mockSelectedItem)
    expect(modelValue.value).toEqual(mockSelectedItem)

    // Test clearing
    await gameDataSelector.vm.$emit('update:modelValue', undefined)
    expect(modelValue.value).toBeUndefined()
  })

  it('calls itemsToOptions utility with correct data', async () => {
    const { itemsToOptions } = await import('@/utils/items')
    createWrapper()

    expect(itemsToOptions).toHaveBeenCalledWith(mockDataStore.items)
  })

  it('calls buildingsToOptions utility when includeBuildings is true', async () => {
    const { buildingsToOptions } = await import('@/utils/buildings')
    createWrapper({ includeBuildings: true })

    expect(buildingsToOptions).toHaveBeenCalledWith(mockDataStore.buildings)
  })

  it('does not call buildingsToOptions when includeBuildings is false', async () => {
    const { buildingsToOptions } = await import('@/utils/buildings')
    createWrapper({ includeBuildings: false })

    expect(buildingsToOptions).not.toHaveBeenCalled()
  })

  it('sorts combined items and buildings alphabetically', () => {
    const wrapper = createWrapper()
    const gameDataSelector = wrapper.findComponent(GameDataSelector)

    const items = gameDataSelector.props('items')
    const names = items.map((item: ItemOption) => item.name)

    // Verify the names are in alphabetical order
    for (let i = 0; i < names.length - 1; i++) {
      expect(names[i].localeCompare(names[i + 1])).toBeLessThanOrEqual(0)
    }
  })

  it('maintains item type information', () => {
    const wrapper = createWrapper()
    const gameDataSelector = wrapper.findComponent(GameDataSelector)

    const items = gameDataSelector.props('items')

    // Check that items have correct types
    const itemTypes = items.map((item: ItemOption) => item.type)
    expect(itemTypes).toContain('item')
    expect(itemTypes).toContain('building')
  })

  it('handles empty items and buildings arrays', () => {
    vi.mocked(mockDataStore).items = {}
    vi.mocked(mockDataStore).buildings = {}

    const wrapper = createWrapper()
    const gameDataSelector = wrapper.findComponent(GameDataSelector)

    expect(gameDataSelector.props('items')).toEqual([])
  })

  it('uses default empty iconConfig when not provided', () => {
    const wrapper = createWrapper()
    const gameDataSelector = wrapper.findComponent(GameDataSelector)

    expect(gameDataSelector.props('iconConfig')).toEqual({})
  })
})
