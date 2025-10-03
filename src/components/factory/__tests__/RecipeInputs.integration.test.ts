import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import RecipeInputs from '@/components/factory/RecipeInputs.vue'
import { newRecipeNode, type RecipeNode } from '@/logistics/graph-node'
import { recipeDatabase } from '@/__tests__/fixtures/data'
import type { Material } from '@/types/factory'
import RecipeLink from '../RecipeLink.vue'
import { component, element } from '@/__tests__/vue-test-helpers'

// Mock the RecipeLink component since it's auto-imported
vi.mock('@/components/factory/RecipeLink.vue', () => ({
  default: {
    name: 'RecipeLink',
    props: ['link', 'recipe', 'direction'],
    template: '<div data-testid="recipe-link">Link: {{ link.material }} ({{ link.amount }})</div>',
  },
}))

// Mock the linkToString utility
vi.mock('@/logistics/graph-node', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/logistics/graph-node')>()
  return {
    ...actual,
    linkToString: vi.fn((link: Material) => `${link.source}-${link.sink}-${link.material}`),
  }
})

describe('RecipeInputs Integration', () => {
  // Test constants from fixtures
  const TEST_RECIPES = {
    IRON_INGOT: 'Recipe_Fake_IronIngot_C',
    COPPER_INGOT: 'Recipe_Fake_CopperIngot_C',
  } as const

  const TEST_ITEMS = {
    IRON_ORE: 'Desc_OreIron_C',
    COPPER_ORE: 'Desc_OreCopper_C',
    WATER: 'Desc_Water_C',
  } as const

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

  const createWrapper = (recipe: RecipeNode) => {
    return mount(RecipeInputs, {
      props: {
        recipe,
      },
    })
  }

  it('renders without errors and displays "None" when no inputs on recipe', () => {
    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    recipe.inputs = []
    const wrapper = createWrapper(recipe)

    element(wrapper, '.recipe-inputs').assert({
      exists: true,
      text: ['None'],
    })
    component(wrapper, RecipeLink).assert({ exists: false })
  })

  it('renders RecipeLink components and does not show "None" when recipe has inputs', () => {
    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    recipe.inputs = [
      createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30),
      createMaterialLink('Storage', 'Smelting', TEST_ITEMS.IRON_ORE, 15),
    ]

    const wrapper = createWrapper(recipe)

    component(wrapper, RecipeLink).assert({ count: 2 })
    expect(wrapper.text()).not.toContain('None')
  })

  it('passes correct props to RecipeLink components', () => {
    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)
    recipe.inputs = [link]

    component(createWrapper(recipe), RecipeLink).assert({
      props: {
        link,
        recipe,
        direction: 'input',
      },
    })
  })

  it('uses linkToString for component keys', async () => {
    const { linkToString } = await import('@/logistics/graph-node')
    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const link = createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30)
    recipe.inputs = [link]

    createWrapper(recipe)

    expect(vi.mocked(linkToString)).toHaveBeenCalledWith(link)
  })

  it('handles multiple links with different materials', () => {
    const recipe = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    recipe.inputs = [
      createMaterialLink('Mining', 'Smelting', TEST_ITEMS.IRON_ORE, 30),
      createMaterialLink('Water_Pump', 'Smelting', TEST_ITEMS.WATER, 45),
      createMaterialLink('Storage', 'Smelting', TEST_ITEMS.COPPER_ORE, 15),
    ]

    const wrapper = createWrapper(recipe)

    const recipeLinkComponents = wrapper.findAllComponents(RecipeLink)
    expect(recipeLinkComponents).toHaveLength(3)

    // Verify all RecipeLink components get the correct direction and recipe
    recipeLinkComponents.forEach((component) => {
      expect(component.props('direction')).toBe('input')
      expect(component.props('recipe')).toEqual(recipe)
    })
  })
})
