import { getMockStores } from '@/__tests__/fixtures/composables/testUtils'
import { makeRecipeNode } from '@/__tests__/fixtures/data'
import { createTestRecipe } from '@/__tests__/fixtures/stores/dataStore'
import { component } from '@/__tests__/vue-test-helpers'
import RecipeDetails from '@/components/factory/RecipeDetails.vue'
import type { RecipeNode } from '@/logistics/graph-node'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VCard } from 'vuetify/components'

// Use centralized fixtures for mocking composables
vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return { getStores: mockGetStores }
})

// Mock the image utility
vi.mock('@/logistics/images', () => ({
  getIconURL: vi.fn((icon: string, size: number) => `https://example.com/${icon}_${size}.png`),
}))

describe('RecipeDetails Integration', () => {
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

  const TEST_BUILDINGS = {
    SMELTER: 'Desc_SmelterMk1_C',
    CONSTRUCTOR: 'Desc_ConstructorMk1_C',
  } as const

  beforeEach(async () => {
    vi.clearAllMocks()

    // Initialize mock stores and add test recipes
    const testWrapper = createWrapper(
      makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true }),
    )
    const dataStore = (await getMockStores()).dataStore

    // Add test recipes for empty ingredient/product tests
    dataStore.recipes['NoIngredientsRecipe'] = createTestRecipe({
      name: 'NoIngredientsRecipe',
      ingredients: [],
      products: [{ item: TEST_ITEMS.IRON_INGOT, amount: 1 }],
      time: 10,
      producedIn: [TEST_BUILDINGS.SMELTER],
    })
    dataStore.recipes['NoProductsRecipe'] = createTestRecipe({
      name: 'NoProductsRecipe',
      ingredients: [{ item: TEST_ITEMS.IRON_ORE, amount: 1 }],
      products: [],
      time: 8,
      producedIn: [TEST_BUILDINGS.SMELTER],
    })

    testWrapper.unmount()
  })

  const createWrapper = (recipeNode: RecipeNode) => {
    return mount(RecipeDetails, {
      props: {
        recipe: recipeNode,
      },
    })
  }

  it('renders without errors with default recipe', () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const wrapper = createWrapper(recipeNode)

    component(wrapper, VCard).assert()
  })

  it('displays craft time correctly', () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const wrapper = createWrapper(recipeNode)

    component(wrapper, VCard).assert({ text: ['5.0s'] })
  })

  it('calls data store methods for recipe ingredients', async () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    createWrapper(recipeNode)

    const dataStore = (await getMockStores()).dataStore
    expect(dataStore.recipeIngredients).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT)
  })

  it('calls data store methods for recipe products', async () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    createWrapper(recipeNode)

    const dataStore = (await getMockStores()).dataStore
    expect(dataStore.recipeProducts).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT)
  })

  it('displays ingredients section when ingredients exist', () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const wrapper = createWrapper(recipeNode)

    component(wrapper, VCard).assert({ text: ['Ingredients', 'Iron Ore'] })
  })

  it('displays products section when products exist', () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const wrapper = createWrapper(recipeNode)

    component(wrapper, VCard).assert({ text: ['Products', 'Iron Ingot'] })
  })

  it('handles recipe with multiple ingredients correctly', () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.PURE_CATERIUM, 0, { fromDatabase: true })
    const wrapper = createWrapper(recipeNode)

    component(wrapper, VCard).assert({ text: ['Caterium Ore', 'Water', '2.0/min'] })
  })

  it('calls getIcon and getItemDisplayName for each ingredient', async () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    createWrapper(recipeNode)

    const dataStore = (await getMockStores()).dataStore
    expect(dataStore.getIcon).toHaveBeenCalledWith(TEST_ITEMS.IRON_ORE)
    expect(dataStore.getItemDisplayName).toHaveBeenCalledWith(TEST_ITEMS.IRON_ORE)
  })

  it('calls getIcon and getItemDisplayName for each product', async () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    createWrapper(recipeNode)

    const dataStore = (await getMockStores()).dataStore
    expect(dataStore.getIcon).toHaveBeenCalledWith(TEST_ITEMS.IRON_INGOT)
    expect(dataStore.getItemDisplayName).toHaveBeenCalledWith(TEST_ITEMS.IRON_INGOT)
  })

  it('uses getIconURL for ingredient icons', async () => {
    const { getIconURL } = await import('@/logistics/images')
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    createWrapper(recipeNode)

    const mockGetIconURL = vi.mocked(getIconURL)
    expect(mockGetIconURL).toHaveBeenCalledWith(expect.any(String), 64)
  })

  it('displays ingredient amounts with /min suffix', () => {
    const wrapper = createWrapper(
      makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true }),
    )
    component(wrapper, VCard).assert({
      text: ['1.0/min'],
    })
  })

  it('displays product amounts with /min suffix', () => {
    const wrapper = createWrapper(
      makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true }),
    )
    component(wrapper, VCard).assert({
      text: ['1.0/min'],
    })
  })

  it('handles empty ingredients gracefully', async () => {
    // Create a mock recipe with no ingredients (recipe already set up in beforeEach)
    const emptyRecipeNode = makeRecipeNode('NoIngredientsRecipe', 0, { fromDatabase: true })

    const dataStore = (await getMockStores()).dataStore
    vi.mocked(dataStore.recipeIngredients).mockReturnValue([])
    vi.mocked(dataStore.recipeProducts).mockReturnValue([
      { item: TEST_ITEMS.IRON_INGOT, amount: 1 },
    ])

    const wrapper = createWrapper(emptyRecipeNode)

    // Should not show ingredients section
    expect(wrapper.text()).not.toContain('Ingredients')
    // But should still show products
    component(wrapper, VCard).assert({ text: ['Products'] })
  })

  it('handles empty products gracefully', async () => {
    // Create a mock recipe with no products (recipe already set up in beforeEach)
    const emptyRecipeNode = makeRecipeNode('NoProductsRecipe', 0, { fromDatabase: true })

    const dataStore = (await getMockStores()).dataStore
    vi.mocked(dataStore.recipeIngredients).mockReturnValue([
      { item: TEST_ITEMS.IRON_ORE, amount: 1 },
    ])
    vi.mocked(dataStore.recipeProducts).mockReturnValue([])

    const wrapper = createWrapper(emptyRecipeNode)

    // Should show ingredients section
    component(wrapper, VCard).assert({ text: ['Ingredients'] })
    // But should not show products section
    expect(wrapper.text()).not.toContain('Products')
  })
})
