import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import RecipeLinkTarget from '@/components/factory/RecipeLinkTarget.vue'
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

vi.mock('@/composables/useFloorNavigation', () => ({
  useFloorNavigation: vi.fn(() => ({
    navigateToRecipe: vi.fn(),
  })),
}))

vi.mock('@/composables/useLinkData', () => ({
  useLinkData: vi.fn(() => ({
    linkTarget: computed(() => 'test-target'),
    isRecipe: computed(() => false),
    targetRecipe: computed(() => null),
    displayName: computed(() => 'Test Display Name'),
  })),
}))

vi.mock('@/composables/useRecipeStatus', () => ({
  useRecipeStatus: vi.fn(() => ({
    isLinkBuilt: vi.fn(() => false),
  })),
}))

describe('RecipeLinkTarget Integration', () => {
  // Test constants from fixtures
  const TEST_RECIPES = {
    IRON_INGOT: 'Recipe_Fake_IronIngot_C',
    COPPER_INGOT: 'Recipe_Fake_CopperIngot_C',
  } as const

  const TEST_ITEMS = {
    IRON_ORE: 'Desc_OreIron_C',
    IRON_INGOT: 'Desc_IronIngot_C',
    COPPER_ORE: 'Desc_OreCopper_C',
  } as const

  let mockDataStore: ReturnType<typeof createMockDataStore>
  let mockFactoryStore: Partial<IFactoryStore>
  let mockUseFloorNavigation: {
    expandedFloors: Ref<number[]>
    expandFloor: ReturnType<typeof vi.fn>
    collapseFloor: ReturnType<typeof vi.fn>
    setRecipeExpansionFromCompletion: ReturnType<typeof vi.fn>
    toggleFloor: ReturnType<typeof vi.fn>
    navigateToElement: ReturnType<typeof vi.fn>
    initializeExpansion: ReturnType<typeof vi.fn>
    navigateToRecipe: ReturnType<typeof vi.fn>
  }
  let mockUseLinkData: {
    linkId: ComputedRef<string>
    materialItem: ComputedRef<Item>
    linkTarget: ComputedRef<string>
    isRecipe: ComputedRef<boolean>
    targetRecipe: ComputedRef<RecipeNode | null>
    displayName: ComputedRef<string>
    transportIcon: ComputedRef<string>
  }
  let mockUseRecipeStatus: {
    isRecipeComplete: ReturnType<typeof vi.fn>
    setRecipeBuilt: ReturnType<typeof vi.fn>
    isLinkBuilt: ReturnType<typeof vi.fn>
    setLinkBuilt: ReturnType<typeof vi.fn>
    getRecipePanelValue: ReturnType<typeof vi.fn>
    leftoverProductsAsLinks: ReturnType<typeof vi.fn>
  }

  beforeEach(async () => {
    mockDataStore = createMockDataStore()
    mockFactoryStore = {
      currentFactory: null,
      getRecipeByName: vi.fn(),
    }

    const { getStores } = vi.mocked(await import('@/composables/useStores'))
    getStores.mockReturnValue({
      dataStore: mockDataStore as unknown as IDataStore,
      factoryStore: mockFactoryStore as IFactoryStore,
      themeStore: {} as IThemeStore,
      errorStore: {} as IErrorStore,
    })

    mockUseFloorNavigation = {
      expandedFloors: ref<number[]>([]),
      expandFloor: vi.fn(),
      collapseFloor: vi.fn(),
      setRecipeExpansionFromCompletion: vi.fn(),
      toggleFloor: vi.fn(),
      navigateToElement: vi.fn(),
      initializeExpansion: vi.fn(),
      navigateToRecipe: vi.fn(),
    }

    mockUseLinkData = {
      linkId: computed(() => 'test-link-id'),
      materialItem: computed(() => ({ name: 'Test Item', icon: 'test-icon' }) as Item),
      linkTarget: computed(() => 'test-target'),
      isRecipe: computed(() => false),
      targetRecipe: computed(() => null),
      displayName: computed(() => 'Test Display Name'),
      transportIcon: computed(() => 'test-transport-icon'),
    }

    mockUseRecipeStatus = {
      isRecipeComplete: vi.fn(() => false),
      setRecipeBuilt: vi.fn(),
      isLinkBuilt: vi.fn(() => false),
      setLinkBuilt: vi.fn(),
      getRecipePanelValue: vi.fn(() => 'test-panel-value'),
      leftoverProductsAsLinks: vi.fn(() => []),
    }

    const { useFloorNavigation } = vi.mocked(await import('@/composables/useFloorNavigation'))
    const { useLinkData } = vi.mocked(await import('@/composables/useLinkData'))
    const { useRecipeStatus } = vi.mocked(await import('@/composables/useRecipeStatus'))

    useFloorNavigation.mockReturnValue(mockUseFloorNavigation)
    useLinkData.mockReturnValue(mockUseLinkData)
    useRecipeStatus.mockReturnValue(mockUseRecipeStatus)
  })

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

  const createWrapper = (link: Material, type: 'input' | 'output' = 'input', customProps = {}) => {
    return mount(RecipeLinkTarget, {
      props: {
        link,
        type,
        ...customProps,
      },
    })
  }

  const expectLinkBuiltState = (wrapper: VueWrapper, isBuilt: boolean) => {
    const textClass = isBuilt ? 'text-black' : 'text-medium-emphasis'
    expect(wrapper.find('.text-caption').classes()).toContain(textClass)
  }

  const expectCorrectLinkText = (
    wrapper: VueWrapper,
    type: 'input' | 'output',
    hasTarget: boolean,
  ) => {
    const expectedText = type === 'input' ? 'from' : hasTarget ? 'to' : ''
    if (expectedText) {
      expect(wrapper.text()).toContain(expectedText)
    }
  }

  it('renders without errors and displays basic content', () => {
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)
    const wrapper = createWrapper(link, 'input')

    expect(wrapper.find('.text-caption').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Display Name')
  })

  it('shows correct link text for input type', () => {
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)
    const wrapper = createWrapper(link, 'input')

    expectCorrectLinkText(wrapper, 'input', true)
  })

  it('shows correct link text for output type with target', async () => {
    // Mock link data to show target exists
    mockUseLinkData.linkTarget = computed(() => 'target-recipe')
    const { useLinkData } = vi.mocked(await import('@/composables/useLinkData'))
    useLinkData.mockReturnValue({
      ...mockUseLinkData,
      linkTarget: computed(() => 'target-recipe'),
    })

    const link = createMaterialLink('Smelting', 'Construction', TEST_ITEMS.IRON_INGOT, 30)
    const wrapper = createWrapper(link, 'output')

    expectCorrectLinkText(wrapper, 'output', true)
  })

  it('shows empty link text for output type without target', async () => {
    // Mock link data to show no target
    mockUseLinkData.linkTarget = computed(() => '')
    const { useLinkData } = vi.mocked(await import('@/composables/useLinkData'))
    useLinkData.mockReturnValue({
      ...mockUseLinkData,
      linkTarget: computed(() => ''),
    })

    const link = createMaterialLink('Smelting', '', TEST_ITEMS.IRON_INGOT, 30)
    const wrapper = createWrapper(link, 'output')

    expectCorrectLinkText(wrapper, 'output', false)
  })

  it('applies correct text color when link is built', async () => {
    mockUseRecipeStatus.isLinkBuilt = vi.fn(() => true)
    const { useRecipeStatus } = vi.mocked(await import('@/composables/useRecipeStatus'))
    useRecipeStatus.mockReturnValue({
      ...mockUseRecipeStatus,
      isLinkBuilt: vi.fn(() => true),
    })

    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)
    const wrapper = createWrapper(link, 'input')

    expectLinkBuiltState(wrapper, true)
  })

  it('applies correct text color when link is not built', async () => {
    mockUseRecipeStatus.isLinkBuilt = vi.fn(() => false)
    const { useRecipeStatus } = vi.mocked(await import('@/composables/useRecipeStatus'))
    useRecipeStatus.mockReturnValue({
      ...mockUseRecipeStatus,
      isLinkBuilt: vi.fn(() => false),
    })

    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)
    const wrapper = createWrapper(link, 'input')

    expectLinkBuiltState(wrapper, false)
  })

  it('renders clickable recipe link when target is a recipe', async () => {
    const targetRecipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)

    // Mock as recipe with target
    mockUseLinkData.isRecipe = computed(() => true)
    mockUseLinkData.targetRecipe = computed(() => targetRecipe)
    mockUseLinkData.displayName = computed(() => 'Iron Ingot Recipe')

    const { useLinkData } = vi.mocked(await import('@/composables/useLinkData'))
    useLinkData.mockReturnValue({
      ...mockUseLinkData,
      isRecipe: computed(() => true),
      targetRecipe: computed(() => targetRecipe),
      displayName: computed(() => 'Iron Ingot Recipe'),
    })

    const link = createMaterialLink('Mining', TEST_RECIPES.IRON_INGOT, TEST_ITEMS.IRON_ORE, 30)
    const wrapper = createWrapper(link, 'input')

    const clickableSpan = wrapper.find('.navigate-name')
    expect(clickableSpan.exists()).toBe(true)
    expect(clickableSpan.classes()).toContain('text-decoration-underline')
    expect(clickableSpan.text()).toContain('Iron Ingot Recipe')
  })

  it('renders static text when target is not a recipe', async () => {
    // Mock as non-recipe
    mockUseLinkData.isRecipe = computed(() => false)
    mockUseLinkData.displayName = computed(() => 'Iron Ore Resource')

    const { useLinkData } = vi.mocked(await import('@/composables/useLinkData'))
    useLinkData.mockReturnValue({
      ...mockUseLinkData,
      isRecipe: computed(() => false),
      displayName: computed(() => 'Iron Ore Resource'),
    })

    const link = createMaterialLink('', 'Smelting', TEST_ITEMS.IRON_ORE, 30)
    const wrapper = createWrapper(link, 'input')

    expect(wrapper.find('.navigate-name').exists()).toBe(false)
    expect(wrapper.text()).toContain('Iron Ore Resource')
  })

  it('calls navigateToRecipe when clicking recipe link', async () => {
    const targetRecipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)

    // Mock as recipe with target
    mockUseLinkData.isRecipe = computed(() => true)
    mockUseLinkData.targetRecipe = computed(() => targetRecipe)

    const { useLinkData } = vi.mocked(await import('@/composables/useLinkData'))
    useLinkData.mockReturnValue({
      ...mockUseLinkData,
      isRecipe: computed(() => true),
      targetRecipe: computed(() => targetRecipe),
    })

    const link = createMaterialLink('Mining', TEST_RECIPES.IRON_INGOT, TEST_ITEMS.IRON_ORE, 30)
    const wrapper = createWrapper(link, 'input')

    const clickableSpan = wrapper.find('.navigate-name')
    await clickableSpan.trigger('click')

    expect(mockUseFloorNavigation.navigateToRecipe).toHaveBeenCalledWith(targetRecipe)
  })

  it('prevents event propagation when clicking recipe link', async () => {
    const targetRecipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)

    // Mock as recipe with target
    mockUseLinkData.isRecipe = computed(() => true)
    mockUseLinkData.targetRecipe = computed(() => targetRecipe)

    const { useLinkData } = vi.mocked(await import('@/composables/useLinkData'))
    useLinkData.mockReturnValue({
      ...mockUseLinkData,
      isRecipe: computed(() => true),
      targetRecipe: computed(() => targetRecipe),
    })

    const link = createMaterialLink('Mining', TEST_RECIPES.IRON_INGOT, TEST_ITEMS.IRON_ORE, 30)
    const wrapper = createWrapper(link, 'input')

    const clickableSpan = wrapper.find('.navigate-name')
    const clickEvent = new Event('click')
    const preventSpy = vi.spyOn(clickEvent, 'preventDefault')
    const stopSpy = vi.spyOn(clickEvent, 'stopPropagation')

    await clickableSpan.element.dispatchEvent(clickEvent)

    expect(preventSpy).toHaveBeenCalled()
    expect(stopSpy).toHaveBeenCalled()
  })

  it('shows hover effects on recipe links', async () => {
    const targetRecipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)

    // Mock as recipe with target
    mockUseLinkData.isRecipe = computed(() => true)
    mockUseLinkData.targetRecipe = computed(() => targetRecipe)

    const { useLinkData } = vi.mocked(await import('@/composables/useLinkData'))
    useLinkData.mockReturnValue({
      ...mockUseLinkData,
      isRecipe: computed(() => true),
      targetRecipe: computed(() => targetRecipe),
    })

    const link = createMaterialLink('Mining', TEST_RECIPES.IRON_INGOT, TEST_ITEMS.IRON_ORE, 30)
    const wrapper = createWrapper(link, 'input')

    const clickableSpan = wrapper.find('span[class*="navigate-name"]')

    // Initially should have navigate-name class (not hovered)
    expect(clickableSpan.classes()).toContain('navigate-name')
    expect(clickableSpan.classes()).not.toContain('navigate-name-hover')

    // Hover in
    await clickableSpan.trigger('mouseenter')
    await wrapper.vm.$nextTick()

    // Should switch to hover class
    expect(clickableSpan.classes()).not.toContain('navigate-name')
    expect(clickableSpan.classes()).toContain('navigate-name-hover')

    // Hover out
    await clickableSpan.trigger('mouseleave')
    await wrapper.vm.$nextTick()

    // Back to non-hover class
    expect(clickableSpan.classes()).toContain('navigate-name')
    expect(clickableSpan.classes()).not.toContain('navigate-name-hover')
  })

  it('does not call navigation when clicking and target recipe is null', async () => {
    // Mock as recipe but with null target
    mockUseLinkData.isRecipe = computed(() => true)
    mockUseLinkData.targetRecipe = computed(() => null)

    const { useLinkData } = vi.mocked(await import('@/composables/useLinkData'))
    useLinkData.mockReturnValue({
      ...mockUseLinkData,
      isRecipe: computed(() => true),
      targetRecipe: computed(() => null),
    })

    const link = createMaterialLink('Mining', 'unknown-recipe', TEST_ITEMS.IRON_ORE, 30)
    const wrapper = createWrapper(link, 'input')

    const clickableSpan = wrapper.find('.navigate-name')
    await clickableSpan.trigger('click')

    expect(mockUseFloorNavigation.navigateToRecipe).not.toHaveBeenCalled()
  })

  it('calls composables with correct parameters', async () => {
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)
    createWrapper(link, 'input')

    const { useFloorNavigation } = await import('@/composables/useFloorNavigation')
    const { useLinkData } = await import('@/composables/useLinkData')
    const { useRecipeStatus } = await import('@/composables/useRecipeStatus')

    expect(vi.mocked(useFloorNavigation)).toHaveBeenCalled()
    expect(vi.mocked(useLinkData)).toHaveBeenCalled()
    expect(vi.mocked(useRecipeStatus)).toHaveBeenCalled()
  })
})
