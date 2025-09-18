import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import RecipeDetails from '@/components/factory/RecipeDetails.vue'
import { newRecipeNode, type RecipeNode } from '@/logistics/graph-node'
import { recipeDatabase } from '@/__tests__/fixtures/data'
import { createMockDataStore, createTestRecipe } from '@/__tests__/fixtures/stores/dataStore'
import type { IDataStore, IFactoryStore, IThemeStore, IErrorStore } from '@/types/stores'

// Mock the stores composable
vi.mock('@/composables/useStores', () => ({
  getStores: vi.fn(() => ({
    dataStore: createMockDataStore(),
  })),
}))

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

  let mockDataStore: ReturnType<typeof createMockDataStore>

  beforeEach(async () => {
    mockDataStore = createMockDataStore()
    // Add missing methods to match IDataStore interface
    const enhancedDataStore = {
      ...mockDataStore,
      getRecipeDisplayName: vi.fn((recipeName: string) => recipeName),
      getBuildingDisplayName: vi.fn((buildingName: string) => buildingName),
      getRecipeProductionBuildings: vi.fn(() => ['Desc_SmelterMk1_C']),
      loadData: vi.fn(),
    }

    const { getStores } = vi.mocked(await import('@/composables/useStores'))
    getStores.mockReturnValue({
      dataStore: enhancedDataStore as unknown as IDataStore,
      factoryStore: {} as IFactoryStore,
      themeStore: {} as IThemeStore,
      errorStore: {} as IErrorStore,
    })

    // Update reference to enhanced store
    mockDataStore = enhancedDataStore
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

  it('calls data store methods for recipe ingredients', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    createWrapper(recipeNode)

    expect(mockDataStore.recipeIngredients).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT)
  })

  it('calls data store methods for recipe products', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    createWrapper(recipeNode)

    expect(mockDataStore.recipeProducts).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT)
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

  it('calls getIcon and getItemDisplayName for each ingredient', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    createWrapper(recipeNode)

    // Should call for iron ore (ingredient)
    expect(mockDataStore.getIcon).toHaveBeenCalledWith(TEST_ITEMS.IRON_ORE)
    expect(mockDataStore.getItemDisplayName).toHaveBeenCalledWith(TEST_ITEMS.IRON_ORE)
  })

  it('calls getIcon and getItemDisplayName for each product', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    createWrapper(recipeNode)

    // Should call for iron ingot (product)
    expect(mockDataStore.getIcon).toHaveBeenCalledWith(TEST_ITEMS.IRON_INGOT)
    expect(mockDataStore.getItemDisplayName).toHaveBeenCalledWith(TEST_ITEMS.IRON_INGOT)
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

  it('handles empty ingredients gracefully', () => {
    // Create a mock recipe with no ingredients
    const emptyRecipeNode = newRecipeNode(
      { name: 'NoIngredientsRecipe', building: TEST_BUILDINGS.SMELTER, count: 1 },
      [],
      [{ item: TEST_ITEMS.IRON_INGOT, amount: 1 }],
    )

    // Add the mock recipe to the recipes database for craft time access
    mockDataStore.recipes['NoIngredientsRecipe'] = createTestRecipe({
      name: 'NoIngredientsRecipe',
      ingredients: [],
      products: [{ item: TEST_ITEMS.IRON_INGOT, amount: 1 }],
      time: 10,
      producedIn: [TEST_BUILDINGS.SMELTER],
    })
    mockDataStore.recipeIngredients.mockReturnValue([])
    mockDataStore.recipeProducts.mockReturnValue([{ item: TEST_ITEMS.IRON_INGOT, amount: 1 }])

    const wrapper = createWrapper(emptyRecipeNode)

    // Should not show ingredients section
    expect(wrapper.text()).not.toContain('Ingredients')
    // But should still show products
    expect(wrapper.text()).toContain('Products')
  })

  it('handles empty products gracefully', () => {
    // Create a mock recipe with no products
    const emptyRecipeNode = newRecipeNode(
      { name: 'NoProductsRecipe', building: TEST_BUILDINGS.SMELTER, count: 1 },
      [{ item: TEST_ITEMS.IRON_ORE, amount: 1 }],
      [],
    )

    // Add the mock recipe to the recipes database for craft time access
    mockDataStore.recipes['NoProductsRecipe'] = createTestRecipe({
      name: 'NoProductsRecipe',
      ingredients: [{ item: TEST_ITEMS.IRON_ORE, amount: 1 }],
      products: [],
      time: 8,
      producedIn: [TEST_BUILDINGS.SMELTER],
    })
    mockDataStore.recipeIngredients.mockReturnValue([{ item: TEST_ITEMS.IRON_ORE, amount: 1 }])
    mockDataStore.recipeProducts.mockReturnValue([])

    const wrapper = createWrapper(emptyRecipeNode)

    // Should show ingredients section
    expect(wrapper.text()).toContain('Ingredients')
    // But should not show products section
    expect(wrapper.text()).not.toContain('Products')
  })
})
