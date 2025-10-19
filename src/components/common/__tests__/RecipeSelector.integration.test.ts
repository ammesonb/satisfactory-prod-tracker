import { mount, VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { component } from '@/__tests__/vue-test-helpers'
import type { ItemOption } from '@/types/data'
import type { IDataStore } from '@/types/stores'
import type { DisplayConfig, IconConfig } from '@/types/ui'

import GameDataSelector from '@/components/common/GameDataSelector.vue'
import RecipeSelector from '@/components/common/RecipeSelector.vue'

// Test constants
const RECIPE_KEYS = {
  IRON_INGOT: 'Recipe_IronIngot_C',
  PURE_IRON_INGOT: 'Recipe_Alternate_PureIronIngot_C',
  STEEL_INGOT: 'Recipe_SteelIngot_C',
} as const

const RECIPE_NAMES = {
  IRON_INGOT: 'Iron Ingot',
  PURE_IRON_INGOT: 'Pure Iron Ingot (Alternate)',
  STEEL_INGOT: 'Steel Ingot',
} as const

const RECIPE_SLUGS = {
  IRON_INGOT: 'iron-ingot',
  PURE_IRON_INGOT: 'pure-iron-ingot',
  STEEL_INGOT: 'steel-ingot',
} as const

// Mock the useStores composable
const mockDataStore = {
  recipes: {
    [RECIPE_KEYS.IRON_INGOT]: {
      slug: RECIPE_SLUGS.IRON_INGOT,
      name: RECIPE_NAMES.IRON_INGOT,
      className: RECIPE_KEYS.IRON_INGOT,
      alternate: false,
    },
    [RECIPE_KEYS.PURE_IRON_INGOT]: {
      slug: RECIPE_SLUGS.PURE_IRON_INGOT,
      name: RECIPE_NAMES.PURE_IRON_INGOT,
      className: RECIPE_KEYS.PURE_IRON_INGOT,
      alternate: true,
    },
    [RECIPE_KEYS.STEEL_INGOT]: {
      slug: RECIPE_SLUGS.STEEL_INGOT,
      name: RECIPE_NAMES.STEEL_INGOT,
      className: RECIPE_KEYS.STEEL_INGOT,
      alternate: false,
    },
  },
  getRecipeDisplayName: vi.fn((key: string) => {
    const recipeMap = {
      [RECIPE_KEYS.IRON_INGOT]: RECIPE_NAMES.IRON_INGOT,
      [RECIPE_KEYS.PURE_IRON_INGOT]: RECIPE_NAMES.PURE_IRON_INGOT,
      [RECIPE_KEYS.STEEL_INGOT]: RECIPE_NAMES.STEEL_INGOT,
    }
    return recipeMap[key as keyof typeof recipeMap] || key
  }),
  getIcon: vi.fn((value: string) => `icon-${value}`),
} as unknown as Partial<IDataStore>

vi.mock('@/composables/useStores', () => ({
  getStores: vi.fn(() => ({
    dataStore: mockDataStore,
  })),
}))

// Mock the utility function
vi.mock('@/utils/recipes', () => ({
  recipesToOptions: vi.fn((recipes, getDisplayName, excludeKeys = []) => {
    return Object.keys(recipes)
      .filter((key) => !excludeKeys.includes(key))
      .map((key) => ({
        value: key,
        title: getDisplayName(key),
      }))
  }),
}))

describe('RecipeSelector Integration', () => {
  // UI constants
  const DEFAULT_PLACEHOLDER = 'Search for a recipe...'
  const DEFAULT_LABEL = 'Recipe'
  const CUSTOM_PLACEHOLDER = 'Select a recipe...'
  const CUSTOM_LABEL = 'Choose Recipe'

  const ICON_SIZES = {
    DEFAULT: 24,
    CUSTOM: 32,
  } as const

  const EXPECTED_RECIPE_COUNT = 3

  const mockSelectedRecipe: ItemOption = {
    value: RECIPE_KEYS.IRON_INGOT,
    name: RECIPE_NAMES.IRON_INGOT,
    icon: `icon-${RECIPE_KEYS.IRON_INGOT}`,
    type: 'recipe',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(RecipeSelector, {
      props: {
        ...props,
      },
    })
  }

  // Helper to get the GameDataSelector from any wrapper
  const getGameDataSelector = (wrapper: VueWrapper) => {
    return wrapper.findComponent(GameDataSelector)
  }

  it('renders GameDataSelector component', () => {
    const wrapper = createWrapper()

    component(wrapper, GameDataSelector).assert()
  })

  it('passes through modelValue to GameDataSelector', () => {
    const wrapper = createWrapper({ modelValue: mockSelectedRecipe })

    component(wrapper, GameDataSelector).assert({
      props: {
        modelValue: mockSelectedRecipe,
      },
    })
  })

  it('passes through disabled prop to GameDataSelector', () => {
    const wrapper = createWrapper({ disabled: true })

    component(wrapper, GameDataSelector).assert({
      props: {
        disabled: true,
      },
    })
  })

  it('uses default displayConfig when none provided', () => {
    const wrapper = createWrapper()

    component(wrapper, GameDataSelector).assert({
      props: {
        displayConfig: {
          placeholder: DEFAULT_PLACEHOLDER,
          label: DEFAULT_LABEL,
        },
      },
    })
  })

  it('merges custom displayConfig with defaults', () => {
    const displayConfig: Partial<DisplayConfig> = {
      placeholder: CUSTOM_PLACEHOLDER,
      label: CUSTOM_LABEL,
      variant: 'filled',
      density: 'compact',
    }

    const wrapper = createWrapper({ displayConfig })

    component(wrapper, GameDataSelector).assert({
      props: {
        displayConfig,
      },
    })
  })

  it('passes through iconConfig to GameDataSelector', () => {
    const iconConfig: Partial<IconConfig> = {
      selectedIconSize: ICON_SIZES.CUSTOM,
      showIcons: false,
    }

    const wrapper = createWrapper({ iconConfig })

    component(wrapper, GameDataSelector).assert({
      props: {
        iconConfig,
      },
    })
  })

  it('converts recipes to ItemOption format correctly', () => {
    const wrapper = createWrapper()
    const gameDataSelector = getGameDataSelector(wrapper)

    const items = gameDataSelector.props('items')
    expect(items).toHaveLength(EXPECTED_RECIPE_COUNT)

    // Verify ItemOption structure
    items.forEach((item: ItemOption) => {
      expect(item).toHaveProperty('value')
      expect(item).toHaveProperty('name')
      expect(item).toHaveProperty('icon')
      expect(item.type).toBe('recipe')
    })
  })

  it('calls recipesToOptions utility with correct parameters', async () => {
    const { recipesToOptions } = await import('@/utils/recipes')
    const excludeKeys = [RECIPE_KEYS.STEEL_INGOT]

    createWrapper({ excludeKeys })

    expect(recipesToOptions).toHaveBeenCalledWith(
      mockDataStore.recipes,
      mockDataStore.getRecipeDisplayName,
      excludeKeys,
    )
  })

  it('excludes recipes based on excludeKeys prop', () => {
    const excludeKeys = [RECIPE_KEYS.STEEL_INGOT]
    const wrapper = createWrapper({ excludeKeys })
    const gameDataSelector = getGameDataSelector(wrapper)

    const items = gameDataSelector.props('items')
    const itemValues = items.map((item: ItemOption) => item.value)

    expect(itemValues).not.toContain(RECIPE_KEYS.STEEL_INGOT)
    expect(items).toHaveLength(EXPECTED_RECIPE_COUNT - 1)
  })

  it('uses empty array as default excludeKeys', () => {
    const wrapper = createWrapper()
    const gameDataSelector = getGameDataSelector(wrapper)

    const items = gameDataSelector.props('items')
    expect(items).toHaveLength(EXPECTED_RECIPE_COUNT)
  })

  it('calls getRecipeDisplayName for recipe titles', () => {
    createWrapper()

    expect(mockDataStore.getRecipeDisplayName).toHaveBeenCalledWith(RECIPE_KEYS.IRON_INGOT)
    expect(mockDataStore.getRecipeDisplayName).toHaveBeenCalledWith(RECIPE_KEYS.PURE_IRON_INGOT)
    expect(mockDataStore.getRecipeDisplayName).toHaveBeenCalledWith(RECIPE_KEYS.STEEL_INGOT)
  })

  it('calls getIcon for recipe icons', () => {
    createWrapper()

    expect(mockDataStore.getIcon).toHaveBeenCalledWith(RECIPE_KEYS.IRON_INGOT)
    expect(mockDataStore.getIcon).toHaveBeenCalledWith(RECIPE_KEYS.PURE_IRON_INGOT)
    expect(mockDataStore.getIcon).toHaveBeenCalledWith(RECIPE_KEYS.STEEL_INGOT)
  })

  it('emits update:modelValue when GameDataSelector emits update:modelValue', async () => {
    const wrapper = createWrapper()

    await component(wrapper, GameDataSelector).emit('update:modelValue', mockSelectedRecipe)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([mockSelectedRecipe])
  })

  it('emits undefined when selection is cleared', async () => {
    const wrapper = createWrapper({ modelValue: mockSelectedRecipe })

    await component(wrapper, GameDataSelector).emit('update:modelValue', undefined)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([undefined])
  })

  it('handles v-model binding correctly', async () => {
    const modelValue = ref<ItemOption | undefined>(undefined)
    const wrapper = mount(RecipeSelector, {
      props: {
        modelValue: modelValue.value,
        'onUpdate:modelValue': (value: ItemOption | undefined) => {
          modelValue.value = value
        },
      },
    })

    // Test selection
    await component(wrapper, GameDataSelector).emit('update:modelValue', mockSelectedRecipe)
    expect(modelValue.value).toEqual(mockSelectedRecipe)

    // Test clearing
    await component(wrapper, GameDataSelector).emit('update:modelValue', undefined)
    expect(modelValue.value).toBeUndefined()
  })

  it('maps recipe data correctly to ItemOption format', () => {
    const wrapper = createWrapper()
    const gameDataSelector = getGameDataSelector(wrapper)

    const items = gameDataSelector.props('items')
    const firstItem = items[0] as ItemOption

    // Verify the mapping from recipe utility output to ItemOption
    expect(firstItem.value).toBe(RECIPE_KEYS.IRON_INGOT)
    expect(firstItem.name).toBe(RECIPE_NAMES.IRON_INGOT)
    expect(firstItem.icon).toBe(`icon-${RECIPE_KEYS.IRON_INGOT}`)
    expect(firstItem.type).toBe('recipe')
  })

  it('handles empty recipes object gracefully', () => {
    vi.mocked(mockDataStore).recipes = {}
    component(createWrapper(), GameDataSelector).assert({ props: { items: [] } })
  })

  it('handles undefined iconConfig gracefully', () => {
    component(createWrapper(), GameDataSelector).assert({ props: { iconConfig: {} } })
  })

  it('ensures all recipe items have recipe type', () => {
    const wrapper = createWrapper()
    const gameDataSelector = getGameDataSelector(wrapper)

    const items = gameDataSelector.props('items')
    items.forEach((item: ItemOption) => {
      expect(item.type).toBe('recipe')
    })
  })

  it('passes exclude keys to recipesToOptions utility', async () => {
    const { recipesToOptions } = await import('@/utils/recipes')
    const excludeKeys = [RECIPE_KEYS.IRON_INGOT, RECIPE_KEYS.PURE_IRON_INGOT]

    createWrapper({ excludeKeys })

    expect(recipesToOptions).toHaveBeenCalledWith(
      mockDataStore.recipes,
      mockDataStore.getRecipeDisplayName,
      excludeKeys,
    )
  })

  it('calls utility function with empty exclude array by default', async () => {
    const { recipesToOptions } = await import('@/utils/recipes')
    createWrapper()

    expect(recipesToOptions).toHaveBeenCalledWith(
      mockDataStore.recipes,
      mockDataStore.getRecipeDisplayName,
      [],
    )
  })
})
