import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, computed } from 'vue'
import { newRecipeNode, type RecipeNode } from '@/logistics/graph-node'
import { recipeDatabase } from '@/__tests__/fixtures/data'
import { mockSetLinkBuilt } from '@/__tests__/fixtures/composables/useRecipeStatus'
import type { Material } from '@/types/factory'
import type { Item } from '@/types/data'
import { component } from '@/__tests__/vue-test-helpers'

import RecipeLink from '@/components/factory/RecipeLink.vue'
import CachedIcon from '@/components/common/CachedIcon.vue'
import RecipeLinkTarget from '@/components/factory/RecipeLinkTarget.vue'
import TransportCapacityTooltip from '@/components/factory/TransportCapacityTooltip.vue'
import { VCard, VCheckbox } from 'vuetify/components'

// Use centralized mock fixtures
vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return { getStores: mockGetStores }
})

vi.mock('@/composables/useRecipeStatus', async () => {
  const { mockUseRecipeStatus } = await import('@/__tests__/fixtures/composables')
  return { useRecipeStatus: mockUseRecipeStatus }
})

vi.mock('@/composables/useLinkData', async () => {
  const { mockUseLinkData } = await import('@/__tests__/fixtures/composables')
  return { useLinkData: mockUseLinkData }
})

describe('RecipeLink Integration', () => {
  // Test constants from fixtures
  const TEST_RECIPES = {
    IRON_INGOT: 'Recipe_Fake_IronIngot_C',
  } as const

  const TEST_ITEMS = {
    IRON_ORE: 'Desc_OreIron_C',
    IRON_INGOT: 'Desc_IronIngot_C',
  } as const

  let mockMaterialItemValue: ReturnType<typeof ref>

  beforeEach(async () => {
    // Reset all mocks before each test
    vi.clearAllMocks()

    // Setup reactive test data for material item
    mockMaterialItemValue = ref<Item | null>({
      name: 'Iron Ore',
      icon: TEST_ITEMS.IRON_ORE,
    } as Item)

    // Update the useLinkData mock to use the reactive material item
    const { mockUseLinkData } = await import('@/__tests__/fixtures/composables')
    mockUseLinkData.mockReturnValue({
      linkId: computed(() => 'test-link-id'),
      materialItem: computed(() => mockMaterialItemValue.value as Item),
      linkTarget: computed(() => 'test-target'),
      isRecipe: computed(() => false),
      targetRecipe: computed(() => null),
      displayName: computed(() => 'Test Display Name'),
      transportIcon: computed(() => 'Desc_ConveyorBeltMk1_C'),
    })
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
    direction: 'input' | 'output' = 'input',
  ) => {
    return mount(RecipeLink, {
      props: {
        link,
        recipe,
        direction,
      },
    })
  }

  it('renders without errors and displays material information', () => {
    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30.5)

    const wrapper = createWrapper(link, recipe, 'input')

    component(wrapper, VCard).assert({
      exists: true,
      text: ['Iron Ore', '30.50/min'],
    })
  })

  it('renders child components with correct props', () => {
    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)

    const wrapper = createWrapper(link, recipe, 'output')

    // Check CachedIcon components
    component(wrapper, CachedIcon).assert({
      count: 2, // Material icon + transport icon
    })

    component(wrapper, RecipeLinkTarget).assert({
      props: {
        link,
        direction: 'output',
      },
    })

    component(wrapper, TransportCapacityTooltip).assert({
      props: {
        recipe,
        link,
        direction: 'output',
      },
    })
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
    // Access the centralized mock functions
    const { mockIsLinkBuilt } = await import('@/__tests__/fixtures/composables/useRecipeStatus')
    mockIsLinkBuilt.mockReturnValueOnce(true)

    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)

    const wrapper = createWrapper(link, recipe)

    // Should have built styling
    component(wrapper, VCard).assert({
      classes: ['bg-green-lighten-4'],
    })

    // Checkbox should be checked
    component(wrapper, VCheckbox).assert({
      props: {
        modelValue: true,
      },
    })
  })

  it('handles unbuilt state correctly when link is not built', async () => {
    // Access the centralized mock functions (default is false)
    const { mockIsLinkBuilt } = await import('@/__tests__/fixtures/composables/useRecipeStatus')
    mockIsLinkBuilt.mockReturnValueOnce(false)

    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)

    const wrapper = createWrapper(link, recipe)

    // Should have unbuilt styling
    component(wrapper, VCard).assert({
      classes: ['bg-surface'],
    })

    // Checkbox should be unchecked
    component(wrapper, VCheckbox).assert({
      props: {
        modelValue: false,
      },
    })
  })

  it('toggles built state when card is clicked', async () => {
    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)

    await component(createWrapper(link, recipe), VCard)
      .match((card) => card.classes().includes('recipe-link'))
      .click()

    expect(mockSetLinkBuilt).toHaveBeenCalledWith(link, true)
  })

  it('toggles built state when checkbox is changed', async () => {
    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)

    await component(createWrapper(link, recipe), VCheckbox).emit('update:modelValue', true)
    expect(mockSetLinkBuilt).toHaveBeenCalledWith(link, true)
  })

  it('displays fallback material name when materialItem is not available', () => {
    mockMaterialItemValue.value = null

    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const link = createMaterialLink('Mining', 'Smelting', 'Unknown_Material', 25)
    const wrapper = createWrapper(link, recipe)

    component(wrapper, VCard).assert({
      text: ['Unknown_Material', '25.00/min'],
    })
  })
})
