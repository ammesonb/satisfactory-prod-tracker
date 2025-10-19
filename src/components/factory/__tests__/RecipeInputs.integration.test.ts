import { makeMaterial, makeRecipeNode } from '@/__tests__/fixtures/data'
import { component, element } from '@/__tests__/vue-test-helpers'
import RecipeInputs from '@/components/factory/RecipeInputs.vue'
import type { RecipeNode } from '@/logistics/graph-node'
import type { Material } from '@/types/factory'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import RecipeLink from '../RecipeLink.vue'

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

  const createWrapper = (recipe: RecipeNode) => {
    return mount(RecipeInputs, {
      props: {
        recipe,
      },
    })
  }

  it('renders without errors and displays "None" when no inputs on recipe', () => {
    const recipe = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    recipe.inputs = []
    const wrapper = createWrapper(recipe)

    element(wrapper, '.recipe-inputs').assert({
      exists: true,
      text: ['None'],
    })
    component(wrapper, RecipeLink).assert({ exists: false })
  })

  it('renders RecipeLink components and does not show "None" when recipe has inputs', () => {
    const recipe = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    recipe.inputs = [
      makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', 'Smelting', 30),
      makeMaterial(TEST_ITEMS.IRON_ORE, 'Storage', 'Smelting', 15),
    ]

    const wrapper = createWrapper(recipe)

    component(wrapper, RecipeLink).assert({ count: 2 })
    expect(wrapper.text()).not.toContain('None')
  })

  it('passes correct props to RecipeLink components', () => {
    const recipe = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', 'Smelting', 30)
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
    const recipe = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', 'Smelting', 30)
    recipe.inputs = [link]

    createWrapper(recipe)

    expect(vi.mocked(linkToString)).toHaveBeenCalledWith(link)
  })

  it('handles multiple links with different materials', () => {
    const recipe = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    recipe.inputs = [
      makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', 'Smelting', 30),
      makeMaterial(TEST_ITEMS.WATER, 'Water_Pump', 'Smelting', 45),
      makeMaterial(TEST_ITEMS.COPPER_ORE, 'Storage', 'Smelting', 15),
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
