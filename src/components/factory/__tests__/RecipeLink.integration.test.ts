import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, computed, type ComputedRef } from 'vue'
import RecipeLink from '@/components/factory/RecipeLink.vue'
import { newRecipeNode, type RecipeNode } from '@/logistics/graph-node'
import { recipeDatabase } from '@/__tests__/fixtures/data'
import { createMockDataStore } from '@/__tests__/fixtures/stores/dataStore'
import type { Material } from '@/types/factory'
import type { IDataStore, IFactoryStore, IThemeStore, IErrorStore } from '@/types/stores'
import type { Item } from '@/types/data'

// Mock the composables
vi.mock('@/composables/useStores', () => ({
  getStores: vi.fn(() => ({
    dataStore: createMockDataStore(),
    factoryStore: {},
  })),
}))

vi.mock('@/composables/useRecipeStatus', () => ({
  useRecipeStatus: vi.fn(() => ({
    isLinkBuilt: vi.fn(() => false),
    setLinkBuilt: vi.fn(),
  })),
}))

vi.mock('@/composables/useLinkData', () => ({
  useLinkData: vi.fn(() => ({
    materialItem: { name: 'Iron Ore', icon: 'Desc_OreIron_C' },
    transportIcon: 'Desc_ConveyorBeltMk1_C',
  })),
}))

// Mock child components
vi.mock('@/components/common/CachedIcon.vue', () => ({
  default: {
    name: 'CachedIcon',
    props: ['icon', 'size'],
    template: '<div data-testid="cached-icon">{{ icon }}</div>',
  },
}))

vi.mock('@/components/factory/TransportCapacityTooltip.vue', () => ({
  default: {
    name: 'TransportCapacityTooltip',
    props: ['recipe', 'link', 'type', 'isHovered'],
    template: '<div data-testid="transport-tooltip">Transport Tooltip</div>',
  },
}))

vi.mock('@/components/factory/RecipeLinkTarget.vue', () => ({
  default: {
    name: 'RecipeLinkTarget',
    props: ['link', 'type'],
    template: '<div data-testid="recipe-link-target">{{ link.source }} -> {{ link.sink }}</div>',
  },
}))

describe('RecipeLink Integration', () => {
  // Test constants from fixtures
  const TEST_RECIPES = {
    IRON_INGOT: 'Recipe_Fake_IronIngot_C',
  } as const

  const TEST_ITEMS = {
    IRON_ORE: 'Desc_OreIron_C',
    IRON_INGOT: 'Desc_IronIngot_C',
  } as const

  let mockDataStore: ReturnType<typeof createMockDataStore>
  let mockFactoryStore: Partial<IFactoryStore>
  let mockUseRecipeStatus: {
    isRecipeComplete: ReturnType<typeof vi.fn>
    setRecipeBuilt: ReturnType<typeof vi.fn>
    isLinkBuilt: ReturnType<typeof vi.fn>
    setLinkBuilt: ReturnType<typeof vi.fn>
    getRecipePanelValue: ReturnType<typeof vi.fn>
    leftoverProductsAsLinks: ReturnType<typeof vi.fn>
  }
  let mockMaterialItemValue: ReturnType<typeof ref>
  let mockUseLinkData: {
    linkId: ComputedRef<string>
    materialItem: ComputedRef<Item>
    linkTarget: ComputedRef<string>
    isRecipe: ComputedRef<boolean>
    targetRecipe: ComputedRef<RecipeNode | null>
    displayName: ComputedRef<string>
    transportIcon: ComputedRef<string>
  }

  beforeEach(async () => {
    mockDataStore = createMockDataStore()
    const enhancedDataStore = {
      ...mockDataStore,
      getRecipeDisplayName: vi.fn((recipeName: string) => recipeName),
      getBuildingDisplayName: vi.fn((buildingName: string) => buildingName),
      getRecipeProductionBuildings: vi.fn(() => ['Desc_SmelterMk1_C']),
      loadData: vi.fn(),
    }

    mockFactoryStore = {
      currentFactory: null,
      setLinkBuiltState: vi.fn(),
      getRecipeByName: vi.fn(),
    }

    const { getStores } = vi.mocked(await import('@/composables/useStores'))
    getStores.mockReturnValue({
      dataStore: enhancedDataStore as unknown as IDataStore,
      factoryStore: mockFactoryStore as IFactoryStore,
      themeStore: {} as IThemeStore,
      errorStore: {} as IErrorStore,
    })

    mockUseRecipeStatus = {
      isRecipeComplete: vi.fn(() => false),
      setRecipeBuilt: vi.fn(),
      isLinkBuilt: vi.fn(() => false),
      setLinkBuilt: vi.fn(),
      getRecipePanelValue: vi.fn(() => 'test-panel-value'),
      leftoverProductsAsLinks: vi.fn(() => []),
    }

    mockMaterialItemValue = ref<Item | null>({
      name: 'Iron Ore',
      icon: TEST_ITEMS.IRON_ORE,
    } as Item)

    mockUseLinkData = {
      linkId: computed(() => 'test-link-id'),
      materialItem: computed(() => mockMaterialItemValue.value as Item),
      linkTarget: computed(() => 'test-target'),
      isRecipe: computed(() => false),
      targetRecipe: computed(() => null),
      displayName: computed(() => 'Test Display Name'),
      transportIcon: computed(() => 'Desc_ConveyorBeltMk1_C'),
    }

    const { useRecipeStatus } = vi.mocked(await import('@/composables/useRecipeStatus'))
    const { useLinkData } = vi.mocked(await import('@/composables/useLinkData'))

    useRecipeStatus.mockReturnValue(mockUseRecipeStatus)
    useLinkData.mockReturnValue(mockUseLinkData)
  })

  const createRecipeNode = (recipeName: string): RecipeNode => {
    const recipe = recipeDatabase[recipeName]
    if (!recipe) {
      throw new Error(`Recipe ${recipeName} not found in fixtures`)
    }

    return newRecipeNode(
      { name: recipe.name, building: recipe.producedIn[0] || 'Unknown', count: 1 },
      recipe.ingredients,
      recipe.products,
    )
  }

  const createMaterialLink = (
    source: string,
    sink: string,
    material: string,
    amount: number,
  ): Material => ({
    source,
    sink,
    material,
    amount,
  })

  const createWrapper = (
    link: Material,
    recipe: RecipeNode,
    type: 'input' | 'output' = 'input',
  ) => {
    return mount(RecipeLink, {
      props: {
        link,
        recipe,
        type,
      },
    })
  }

  it('renders without errors and displays material information', () => {
    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30.5)

    const wrapper = createWrapper(link, recipe, 'input')

    expect(wrapper.find('.recipe-link').exists()).toBe(true)
    expect(wrapper.text()).toContain('Iron Ore')
    expect(wrapper.text()).toContain('30.50/min')
  })

  it('renders child components with correct props', () => {
    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)

    const wrapper = createWrapper(link, recipe, 'output')

    // Check CachedIcon components
    const cachedIcons = wrapper.findAllComponents({ name: 'CachedIcon' })
    expect(cachedIcons.length).toBeGreaterThanOrEqual(2) // Material icon + transport icon

    // Check RecipeLinkTarget
    const linkTarget = wrapper.findComponent({ name: 'RecipeLinkTarget' })
    expect(linkTarget.props('link')).toEqual(link)
    expect(linkTarget.props('type')).toBe('output')

    // Check TransportCapacityTooltip
    const tooltip = wrapper.findComponent({ name: 'TransportCapacityTooltip' })
    expect(tooltip.props('recipe')).toEqual(recipe)
    expect(tooltip.props('link')).toEqual(link)
    expect(tooltip.props('type')).toBe('output')
  })

  it('calls composables with correct parameters', async () => {
    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)

    createWrapper(link, recipe, 'input')

    const { useRecipeStatus } = await import('@/composables/useRecipeStatus')
    const { useLinkData } = await import('@/composables/useLinkData')

    expect(vi.mocked(useRecipeStatus)).toHaveBeenCalled()
    expect(vi.mocked(useLinkData)).toHaveBeenCalled()
  })

  it('handles built state correctly when link is built', async () => {
    // Set up fresh mock that returns true
    const { useRecipeStatus } = vi.mocked(await import('@/composables/useRecipeStatus'))
    useRecipeStatus.mockReturnValue({
      isRecipeComplete: vi.fn(() => false),
      setRecipeBuilt: vi.fn(),
      isLinkBuilt: vi.fn(() => true),
      setLinkBuilt: vi.fn(),
      getRecipePanelValue: vi.fn(() => 'test-panel-value'),
      leftoverProductsAsLinks: vi.fn(() => []),
    })

    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)

    const wrapper = createWrapper(link, recipe)

    // Should have built styling
    const card = wrapper.find('.recipe-link')
    expect(card.classes()).toContain('bg-green-lighten-4')

    // Checkbox should be checked
    const checkbox = wrapper.findComponent({ name: 'VCheckbox' })
    expect(checkbox.props('modelValue')).toBe(true)
  })

  it('handles unbuilt state correctly when link is not built', async () => {
    // Set up fresh mock that returns false
    const { useRecipeStatus } = vi.mocked(await import('@/composables/useRecipeStatus'))
    useRecipeStatus.mockReturnValue({
      isRecipeComplete: vi.fn(() => false),
      setRecipeBuilt: vi.fn(),
      isLinkBuilt: vi.fn(() => false),
      setLinkBuilt: vi.fn(),
      getRecipePanelValue: vi.fn(() => 'test-panel-value'),
      leftoverProductsAsLinks: vi.fn(() => []),
    })

    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)

    const wrapper = createWrapper(link, recipe)

    // Should have unbuilt styling
    const card = wrapper.find('.recipe-link')
    expect(card.classes()).toContain('bg-surface')

    // Checkbox should be unchecked
    const checkbox = wrapper.findComponent({ name: 'VCheckbox' })
    expect(checkbox.props('modelValue')).toBe(false)
  })

  it('toggles built state when card is clicked', async () => {
    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)

    const wrapper = createWrapper(link, recipe)

    const card = wrapper.find('.recipe-link')
    await card.trigger('click')

    expect(mockUseRecipeStatus.setLinkBuilt).toHaveBeenCalledWith(link, true)
  })

  it('toggles built state when checkbox is changed', async () => {
    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)

    const wrapper = createWrapper(link, recipe)

    const checkbox = wrapper.findComponent({ name: 'VCheckbox' })
    await checkbox.vm.$emit('update:modelValue', true)

    expect(mockUseRecipeStatus.setLinkBuilt).toHaveBeenCalledWith(link, true)
  })

  it('displays fallback material name when materialItem is not available', () => {
    mockMaterialItemValue.value = null

    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const link = createMaterialLink('Mining', 'Smelting', 'Unknown_Material', 25)

    const wrapper = createWrapper(link, recipe)

    expect(wrapper.text()).toContain('Unknown_Material')
    expect(wrapper.text()).toContain('25.00/min')
  })
})
