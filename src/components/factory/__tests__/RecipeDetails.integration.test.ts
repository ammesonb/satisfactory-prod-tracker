import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import RecipeDetails from '@/components/factory/RecipeDetails.vue'
import { newRecipeNode, type RecipeNode } from '@/logistics/graph-node'
import { recipeDatabase } from '@/__tests__/fixtures/data'
import { createTestRecipe } from '@/__tests__/fixtures/stores/dataStore'
import { getMockStores } from '@/__tests__/fixtures/composables/testUtils'

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
    const testWrapper = createWrapper(createRecipeNode(TEST_RECIPES.IRON_INGOT))
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

  const createWrapper = (recipeNode: RecipeNode) => {
    return mount(RecipeDetails, {
      props: {
        recipe: recipeNode,
      },
    })
  }

  it('renders without errors with default recipe', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const wrapper = createWrapper(recipeNode)

    expect(wrapper.find('.recipe-details').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'VCard' }).exists()).toBe(true)
  })

  it('displays craft time correctly', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const wrapper = createWrapper(recipeNode)

    expect(wrapper.text()).toContain('5.0s') // Iron ingot recipe takes 5 seconds
  })

  it('calls data store methods for recipe ingredients', async () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    createWrapper(recipeNode)

    const dataStore = (await getMockStores()).dataStore
    expect(dataStore.recipeIngredients).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT)
  })

  it('calls data store methods for recipe products', async () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    createWrapper(recipeNode)

    const dataStore = (await getMockStores()).dataStore
    expect(dataStore.recipeProducts).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT)
  })

  it('displays ingredients section when ingredients exist', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const wrapper = createWrapper(recipeNode)

    expect(wrapper.text()).toContain('Ingredients')
    expect(wrapper.text()).toContain('Iron Ore') // from fixture data
  })

  it('displays products section when products exist', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const wrapper = createWrapper(recipeNode)

    expect(wrapper.text()).toContain('Products')
    expect(wrapper.text()).toContain('Iron Ingot') // from fixture data
  })

  it('handles recipe with multiple ingredients correctly', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.PURE_CATERIUM)
    const wrapper = createWrapper(recipeNode)

    expect(wrapper.text()).toContain('Caterium Ore') // Gold ore in fixtures
    expect(wrapper.text()).toContain('Water')
    expect(wrapper.text()).toContain('2.0/min') // Both ingredients have amount 2
  })

  it('calls getIcon and getItemDisplayName for each ingredient', async () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    createWrapper(recipeNode)

    const dataStore = (await getMockStores()).dataStore
    expect(dataStore.getIcon).toHaveBeenCalledWith(TEST_ITEMS.IRON_ORE)
    expect(dataStore.getItemDisplayName).toHaveBeenCalledWith(TEST_ITEMS.IRON_ORE)
  })

  it('calls getIcon and getItemDisplayName for each product', async () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    createWrapper(recipeNode)

    const dataStore = (await getMockStores()).dataStore
    expect(dataStore.getIcon).toHaveBeenCalledWith(TEST_ITEMS.IRON_INGOT)
    expect(dataStore.getItemDisplayName).toHaveBeenCalledWith(TEST_ITEMS.IRON_INGOT)
  })

  it('uses getIconURL for ingredient icons', async () => {
    const { getIconURL } = await import('@/logistics/images')
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    createWrapper(recipeNode)

    const mockGetIconURL = vi.mocked(getIconURL)
    expect(mockGetIconURL).toHaveBeenCalledWith(expect.any(String), 64)
  })

  it('displays ingredient amounts with /min suffix', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const wrapper = createWrapper(recipeNode)

    expect(wrapper.text()).toContain('1.0/min') // Iron ore amount from fixture
  })

  it('displays product amounts with /min suffix', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    const wrapper = createWrapper(recipeNode)

    expect(wrapper.text()).toContain('1.0/min') // Iron ingot amount from fixture
  })

  it('handles empty ingredients gracefully', async () => {
    // Create a mock recipe with no ingredients (recipe already set up in beforeEach)
    const emptyRecipeNode = newRecipeNode(
      { name: 'NoIngredientsRecipe', building: TEST_BUILDINGS.SMELTER, count: 1 },
      [],
      [{ item: TEST_ITEMS.IRON_INGOT, amount: 1 }],
    )

    const dataStore = (await getMockStores()).dataStore
    vi.mocked(dataStore.recipeIngredients).mockReturnValue([])
    vi.mocked(dataStore.recipeProducts).mockReturnValue([
      { item: TEST_ITEMS.IRON_INGOT, amount: 1 },
    ])

    const wrapper = createWrapper(emptyRecipeNode)

    // Should not show ingredients section
    expect(wrapper.text()).not.toContain('Ingredients')
    // But should still show products
    expect(wrapper.text()).toContain('Products')
  })

  it('handles empty products gracefully', async () => {
    // Create a mock recipe with no products (recipe already set up in beforeEach)
    const emptyRecipeNode = newRecipeNode(
      { name: 'NoProductsRecipe', building: TEST_BUILDINGS.SMELTER, count: 1 },
      [{ item: TEST_ITEMS.IRON_ORE, amount: 1 }],
      [],
    )

    const dataStore = (await getMockStores()).dataStore
    vi.mocked(dataStore.recipeIngredients).mockReturnValue([
      { item: TEST_ITEMS.IRON_ORE, amount: 1 },
    ])
    vi.mocked(dataStore.recipeProducts).mockReturnValue([])

    const wrapper = createWrapper(emptyRecipeNode)

    // Should show ingredients section
    expect(wrapper.text()).toContain('Ingredients')
    // But should not show products section
    expect(wrapper.text()).not.toContain('Products')
  })
})
