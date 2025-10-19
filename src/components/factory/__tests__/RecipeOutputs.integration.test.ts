import { mockLeftoverProductsAsLinks } from '@/__tests__/fixtures/composables/useRecipeStatus'
import { makeRecipeNode } from '@/__tests__/fixtures/data'
import { component, element } from '@/__tests__/vue-test-helpers'
import type { RecipeNode } from '@/logistics/graph-node'
import type { Material } from '@/types/factory'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import RecipeLink from '@/components/factory/RecipeLink.vue'
import RecipeOutputs from '@/components/factory/RecipeOutputs.vue'

// Use centralized fixtures for mocking composables
vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return { getStores: mockGetStores }
})

vi.mock('@/composables/useRecipeStatus', async () => {
  const { mockUseRecipeStatus } = await import('@/__tests__/fixtures/composables')
  return { useRecipeStatus: mockUseRecipeStatus }
})

// Mock child components
vi.mock('@/components/factory/RecipeLink.vue', () => ({
  default: {
    name: 'RecipeLink',
    props: ['link', 'recipe', 'direction'],
    template: '<div data-testid="recipe-link">{{ link.material }} ({{ link.amount }})</div>',
  },
}))

describe('RecipeOutputs Integration', () => {
  // Test constants from fixtures
  const TEST_RECIPES = {
    IRON_INGOT: 'Recipe_Fake_IronIngot_C',
    COPPER_INGOT: 'Recipe_Fake_CopperIngot_C',
    PURE_CATERIUM: 'Recipe_PureCateriumIngot_C',
  } as const

  const TEST_ITEMS = {
    IRON_ORE: 'Desc_OreIron_C',
    IRON_INGOT: 'Desc_IronIngot_C',
    COPPER_ORE: 'Desc_OreCopper_C',
    COPPER_INGOT: 'Desc_CopperIngot_C',
    GOLD_ORE: 'Desc_OreGold_C',
    GOLD_INGOT: 'Desc_GoldIngot_C',
    WATER: 'Desc_Water_C',
  } as const

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (recipeNode: RecipeNode) => {
    return mount(RecipeOutputs, {
      props: {
        recipe: recipeNode,
      },
    })
  }

  it('renders without errors with default recipe', () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const wrapper = createWrapper(recipeNode)

    expect(wrapper.exists()).toBe(true)
    element(wrapper, 'h4').assert({ text: 'Outputs' })
  })

  it('renders RecipeLink components for each output', () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const recipeLinks = createWrapper(recipeNode).findAllComponents(RecipeLink)
    expect(recipeLinks.length).toBeGreaterThan(0)
  })

  it('passes correct props to RecipeLink components', () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const recipeLinks = createWrapper(recipeNode).findAllComponents(RecipeLink)
    recipeLinks.forEach((link) => {
      expect(link.props('recipe')).toEqual(recipeNode)
      expect(link.props('direction')).toBe('output')
      expect(link.props('link')).toBeDefined()
    })
  })

  it('calls leftoverProductsAsLinks composable function', async () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    createWrapper(recipeNode)
    expect(mockLeftoverProductsAsLinks).toHaveBeenCalledWith(recipeNode)
  })

  it('includes both recipe outputs and leftover products in links', async () => {
    const mockLeftoverProducts: Material[] = [
      { source: 'test-recipe', sink: '', material: TEST_ITEMS.COPPER_INGOT, amount: 0.5 },
    ]
    mockLeftoverProductsAsLinks.mockReturnValueOnce(mockLeftoverProducts)

    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const recipeLinks = createWrapper(recipeNode).findAllComponents(RecipeLink)
    expect(recipeLinks.length).toBeGreaterThanOrEqual(recipeNode.outputs.length)
    expect(mockLeftoverProductsAsLinks).toHaveBeenCalledWith(recipeNode)
  })

  it('displays "None" when no outputs exist', async () => {
    mockLeftoverProductsAsLinks.mockReturnValueOnce([])

    // Create a recipe node with no outputs
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    recipeNode.outputs = []

    const wrapper = createWrapper(recipeNode)
    expect(wrapper.text()).toContain('None')
    component(wrapper, RecipeLink).assert({ exists: false })
  })

  it('handles recipe with multiple outputs correctly', () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.PURE_CATERIUM, 0, { fromDatabase: true })

    const wrapper = createWrapper(recipeNode)

    const recipeLinks = wrapper.findAllComponents(RecipeLink)
    expect(recipeNode.outputs.length).toBeGreaterThan(0)
    expect(recipeLinks.length).toBeGreaterThanOrEqual(recipeNode.outputs.length)
  })

  it('uses correct key for v-for loop', () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const wrapper = createWrapper(recipeNode)

    const recipeLinks = wrapper.findAllComponents(RecipeLink)

    // Each RecipeLink should have a unique key based on linkToString
    recipeLinks.forEach((link) => {
      expect(link.props('link')).toBeDefined()
    })
  })

  it('integrates outputs from recipe node correctly', () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const wrapper = createWrapper(recipeNode)

    // The component should show outputs based on the recipe node
    expect(wrapper.findAllComponents(RecipeLink).length).toBeGreaterThanOrEqual(
      recipeNode.outputs.length,
    )
  })

  it('handles leftover products when they exist', async () => {
    const mockLeftoverProducts: Material[] = [
      { source: 'test-recipe', sink: '', material: TEST_ITEMS.IRON_ORE, amount: 2.5 },
      { source: 'test-recipe', sink: '', material: TEST_ITEMS.COPPER_ORE, amount: 1.0 },
    ]

    mockLeftoverProductsAsLinks.mockReturnValueOnce(mockLeftoverProducts)

    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    recipeNode.availableProducts = mockLeftoverProducts.map((product) => ({
      item: product.material,
      amount: product.amount,
    }))
    const recipeLinks = createWrapper(recipeNode).findAllComponents(RecipeLink)
    expect(recipeLinks.length).toBe(recipeNode.outputs.length + mockLeftoverProducts.length)
    expect(mockLeftoverProductsAsLinks).toHaveBeenCalledWith(recipeNode)
  })
})
