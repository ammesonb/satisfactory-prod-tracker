import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { computed } from 'vue'
import { newRecipeNode, type RecipeNode } from '@/logistics/graph-node'
import type { Material } from '@/types/factory'
import type { Item } from '@/types/data'
import { recipeDatabase } from '@/__tests__/fixtures/data'
import { mockNavigateToRecipe } from '@/__tests__/fixtures/composables/navigation'
import {
  clickElement,
  expectElementExists,
  expectElementNotExists,
  expectElementText,
} from '@/__tests__/vue-test-helpers'

import RecipeLinkTarget from '@/components/factory/RecipeLinkTarget.vue'

// Use centralized mock fixtures
vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return { getStores: mockGetStores }
})

vi.mock('@/composables/useFloorNavigation', async () => {
  const { mockUseFloorNavigation } = await import('@/__tests__/fixtures/composables')
  return { useFloorNavigation: mockUseFloorNavigation }
})

vi.mock('@/composables/useLinkData', async () => {
  const { mockUseLinkData } = await import('@/__tests__/fixtures/composables')
  return { useLinkData: mockUseLinkData }
})

vi.mock('@/composables/useRecipeStatus', async () => {
  const { mockUseRecipeStatus } = await import('@/__tests__/fixtures/composables')
  return { useRecipeStatus: mockUseRecipeStatus }
})

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

  beforeEach(async () => {
    // Reset all mocks before each test
    vi.clearAllMocks()
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

  const createWrapper = (
    link: Material,
    direction: 'input' | 'output' = 'input',
    customProps = {},
  ) => {
    return mount(RecipeLinkTarget, {
      props: {
        link,
        direction,
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
    direction: 'input' | 'output',
    hasTarget: boolean,
  ) => {
    const expectedText = direction === 'input' ? 'from' : hasTarget ? 'to' : ''
    expectElementText(wrapper, RecipeLinkTarget, expectedText)
  }

  it('renders without errors and displays basic content', () => {
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)
    const wrapper = createWrapper(link, 'input')

    expectElementExists(wrapper, RecipeLinkTarget)
    expectElementText(wrapper, RecipeLinkTarget, 'Test Display Name')
  })

  it('shows correct link text for input direction', () => {
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)
    expectCorrectLinkText(createWrapper(link, 'input'), 'input', true)
  })

  it('shows correct link text for output direction with target', async () => {
    // Update the centralized mock to show target exists
    const { mockUseLinkData } = await import('@/__tests__/fixtures/composables')
    mockUseLinkData.mockReturnValue({
      linkId: computed(() => 'test-link-id'),
      materialItem: computed(() => ({ name: 'Test Item', icon: 'test-icon' }) as Item),
      linkTarget: computed(() => 'target-recipe'),
      isRecipe: computed(() => false),
      targetRecipe: computed(() => null),
      displayName: computed(() => 'Test Display Name'),
      transportIcon: computed(() => 'test-transport-icon'),
    })

    const link = createMaterialLink('Smelting', 'Construction', TEST_ITEMS.IRON_INGOT, 30)
    expectCorrectLinkText(createWrapper(link, 'output'), 'output', true)
  })

  it('shows empty link text for output direction without target', async () => {
    // Update the centralized mock to show no target
    const { mockUseLinkData } = await import('@/__tests__/fixtures/composables')
    mockUseLinkData.mockReturnValue({
      linkId: computed(() => 'test-link-id'),
      materialItem: computed(() => ({ name: 'Test Item', icon: 'test-icon' }) as Item),
      linkTarget: computed(() => ''),
      isRecipe: computed(() => false),
      targetRecipe: computed(() => null),
      displayName: computed(() => 'Test Display Name'),
      transportIcon: computed(() => 'test-transport-icon'),
    })

    const link = createMaterialLink('Smelting', '', TEST_ITEMS.IRON_INGOT, 30)
    expectCorrectLinkText(createWrapper(link, 'output'), 'output', false)
  })

  it('applies correct text color when link is built', async () => {
    // Update the centralized mock to return built state
    const { mockIsLinkBuilt } = await import('@/__tests__/fixtures/composables/useRecipeStatus')
    mockIsLinkBuilt.mockReturnValueOnce(true)

    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)
    expectLinkBuiltState(createWrapper(link, 'input'), true)
  })

  it('applies correct text color when link is not built', async () => {
    // Update the centralized mock to return unbuilt state
    const { mockIsLinkBuilt } = await import('@/__tests__/fixtures/composables/useRecipeStatus')
    mockIsLinkBuilt.mockReturnValueOnce(false)

    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)
    expectLinkBuiltState(createWrapper(link, 'input'), false)
  })

  it('renders clickable recipe link when target is a recipe', async () => {
    const targetRecipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)

    // Update the centralized mock for recipe target
    const { mockUseLinkData } = await import('@/__tests__/fixtures/composables')
    mockUseLinkData.mockReturnValue({
      linkId: computed(() => 'test-link-id'),
      materialItem: computed(() => ({ name: 'Test Item', icon: 'test-icon' }) as Item),
      linkTarget: computed(() => 'test-target'),
      isRecipe: computed(() => true),
      targetRecipe: computed(() => targetRecipe),
      displayName: computed(() => 'Iron Ingot Recipe'),
      transportIcon: computed(() => 'test-transport-icon'),
    })

    const link = createMaterialLink('Mining', TEST_RECIPES.IRON_INGOT, TEST_ITEMS.IRON_ORE, 30)
    const wrapper = createWrapper(link, 'input')

    expectElementExists(wrapper, '.navigate-name')
    const clickableSpan = wrapper.find('.navigate-name')
    expect(clickableSpan.classes()).toContain('text-decoration-underline')
    expect(clickableSpan.text()).toContain('Iron Ingot Recipe')
  })

  it('renders static text when target is not a recipe', async () => {
    // Update the centralized mock for non-recipe
    const { mockUseLinkData } = await import('@/__tests__/fixtures/composables')
    mockUseLinkData.mockReturnValue({
      linkId: computed(() => 'test-link-id'),
      materialItem: computed(() => ({ name: 'Test Item', icon: 'test-icon' }) as Item),
      linkTarget: computed(() => 'test-target'),
      isRecipe: computed(() => false),
      targetRecipe: computed(() => null),
      displayName: computed(() => 'Iron Ore Resource'),
      transportIcon: computed(() => 'test-transport-icon'),
    })

    const link = createMaterialLink('', 'Smelting', TEST_ITEMS.IRON_ORE, 30)
    const wrapper = createWrapper(link, 'input')

    expectElementNotExists(wrapper, '.navigate-name')
    expectElementText(wrapper, RecipeLinkTarget, 'Iron Ore Resource')
  })

  it('calls navigateToRecipe when clicking recipe link', async () => {
    const targetRecipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)

    // Update the centralized mock for recipe with target
    const { mockUseLinkData } = await import('@/__tests__/fixtures/composables')
    mockUseLinkData.mockReturnValue({
      linkId: computed(() => 'test-link-id'),
      materialItem: computed(() => ({ name: 'Test Item', icon: 'test-icon' }) as Item),
      linkTarget: computed(() => 'test-target'),
      isRecipe: computed(() => true),
      targetRecipe: computed(() => targetRecipe),
      displayName: computed(() => 'Test Display Name'),
      transportIcon: computed(() => 'test-transport-icon'),
    })

    const link = createMaterialLink('Mining', TEST_RECIPES.IRON_INGOT, TEST_ITEMS.IRON_ORE, 30)
    const wrapper = createWrapper(link, 'input')
    await clickElement(wrapper, '.navigate-name')
    expect(mockNavigateToRecipe).toHaveBeenCalledWith(targetRecipe)
  })

  it('prevents event propagation when clicking recipe link', async () => {
    const targetRecipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)

    // Update the centralized mock for recipe with target
    const { mockUseLinkData } = await import('@/__tests__/fixtures/composables')
    mockUseLinkData.mockReturnValue({
      linkId: computed(() => 'test-link-id'),
      materialItem: computed(() => ({ name: 'Test Item', icon: 'test-icon' }) as Item),
      linkTarget: computed(() => 'test-target'),
      isRecipe: computed(() => true),
      targetRecipe: computed(() => targetRecipe),
      displayName: computed(() => 'Test Display Name'),
      transportIcon: computed(() => 'test-transport-icon'),
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

    // Update the centralized mock for recipe with target
    const { mockUseLinkData } = await import('@/__tests__/fixtures/composables')
    mockUseLinkData.mockReturnValue({
      linkId: computed(() => 'test-link-id'),
      materialItem: computed(() => ({ name: 'Test Item', icon: 'test-icon' }) as Item),
      linkTarget: computed(() => 'test-target'),
      isRecipe: computed(() => true),
      targetRecipe: computed(() => targetRecipe),
      displayName: computed(() => 'Test Display Name'),
      transportIcon: computed(() => 'test-transport-icon'),
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
    // Update the centralized mock for recipe with null target
    const { mockUseLinkData } = await import('@/__tests__/fixtures/composables')
    mockUseLinkData.mockReturnValue({
      linkId: computed(() => 'test-link-id'),
      materialItem: computed(() => ({ name: 'Test Item', icon: 'test-icon' }) as Item),
      linkTarget: computed(() => 'test-target'),
      isRecipe: computed(() => true),
      targetRecipe: computed(() => null),
      displayName: computed(() => 'Test Display Name'),
      transportIcon: computed(() => 'test-transport-icon'),
    })

    const link = createMaterialLink('Mining', 'unknown-recipe', TEST_ITEMS.IRON_ORE, 30)
    const wrapper = createWrapper(link, 'input')
    await clickElement(wrapper, '.navigate-name')
    expect(mockNavigateToRecipe).not.toHaveBeenCalled()
  })
})
