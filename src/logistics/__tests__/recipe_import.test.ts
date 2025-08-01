import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  stringToRecipe,
  isNaturalResource,
  pickSource,
  getAllRecipeMaterials,
  batchRecipes,
  getLinksForRecipe,
} from '../recipe_import'
import { useDataStore } from '@/stores/data'

vi.mock('@/stores/data')

describe('recipe_import', () => {
  it('should parse recipe strings', () => {
    const result = stringToRecipe('"Recipe_Alternate_SteelPlate_C@100#Desc_Smelter_C": "1.2345"')
    expect(result).toEqual({
      name: 'Recipe_Alternate_SteelPlate_C',
      building: 'Desc_Smelter_C',
      count: 1.2345,
    })
  })

  it('detects natural resources', () => {
    expect(isNaturalResource('Desc_OreIron_C')).toBe(true)
    expect(isNaturalResource('Desc_IronIngot_C')).toBe(false)
  })

  describe('picks correct sources', () => {
    const createRecipeItem = (amount: number, recipeName: string) => ({
      amount,
      recipe: { name: recipeName, building: 'TestBuilding', count: 1 },
    })

    // item names not checked since it's assumed anything provided will already match the required ingredient
    const createRequest = (amount: number) => ({ amount, item: 'TestIngredient' })

    it('should fill request exactly by one source', () => {
      const request = createRequest(10)
      const sources = [createRecipeItem(10, 'Source1')]

      const result = pickSource(request, sources)

      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(10)
    })

    it('should fill request by one source with remainder', () => {
      const request = createRequest(5)
      const sources = [createRecipeItem(10, 'Source1')]

      const result = pickSource(request, sources)

      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(10)
    })

    it('should return empty when no sources provided', () => {
      const request = createRequest(10)
      const sources = []

      expect(pickSource(request, sources)).toHaveLength(0)
    })

    it('should return empty when the only source has insufficient quantity', () => {
      const request = createRequest(10)
      const sources = [createRecipeItem(5, 'Source1')]

      expect(pickSource(request, sources)).toHaveLength(0)
    })

    it('should return empty when multiple sources have insufficient quantity', () => {
      const request = createRequest(20)
      const sources = [createRecipeItem(5, 'Source1'), createRecipeItem(8, 'Source2')]

      expect(pickSource(request, sources)).toHaveLength(0)
    })

    it('should return lowest amount when multiple sources have sufficient quantity', () => {
      const request = createRequest(10)
      const sources = [
        createRecipeItem(15, 'Source1'),
        createRecipeItem(12, 'Source2'),
        createRecipeItem(20, 'Source3'),
      ]

      const result = pickSource(request, sources)

      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(12)
      expect(result[0].recipe.name).toBe('Source2')
    })

    it('should return source when quantity is within threshold', () => {
      const request = createRequest(10)
      const sources = [createRecipeItem(9.95, 'Source1')] // Within 0.1 threshold

      const result = pickSource(request, sources)

      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(9.95)
    })

    it('should combine multiple sources to cover request', () => {
      const request = createRequest(15)
      const sources = [createRecipeItem(5, 'Source1'), createRecipeItem(10, 'Source2')]

      const result = pickSource(request, sources)
      expect(result).toHaveLength(2)
    })

    it('should consume lowest quantities first when more sources than needed', () => {
      const request = createRequest(12)
      const sources = [
        createRecipeItem(3, 'Source1'),
        createRecipeItem(7, 'Source2'),
        createRecipeItem(5, 'Source3'),
        createRecipeItem(10, 'Source4'),
      ]

      const result = pickSource(request, sources)
      expect(result).toHaveLength(3)
      expect(result.map((r) => r.recipe.name)).toEqual(['Source1', 'Source3', 'Source2'])
    })

    it('should return empty array for natural resource with no sources', () => {
      const request = createRequest(10)
      const sources = []

      const result = pickSource(request, sources)

      expect(result).toHaveLength(0)
    })

    it('should allow remainder for natural resource with insufficient sources', () => {
      const request = { amount: 20, item: 'Desc_OreIron_C' }
      const sources = [createRecipeItem(5, 'Source1'), createRecipeItem(8, 'Source2')]

      const result = pickSource(request, sources)

      expect(result).toHaveLength(2)
      expect(result[0].amount).toBe(5)
      expect(result[1].amount).toBe(8)
      // Total is 13, which is less than requested 20, but should not throw for natural resources
    })
  })

  describe('getAllRecipeMaterials', () => {
    let mockDataStore: ReturnType<typeof useDataStore>

    beforeEach(() => {
      mockDataStore = {
        recipeIngredients: vi.fn(),
        recipeProducts: vi.fn(),
      }
      vi.mocked(useDataStore).mockReturnValue(mockDataStore)
    })

    it('should return ingredients and products for recipes', () => {
      const recipes = [
        { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 2 },
        { name: 'Recipe_IronPlateReinforced_C', building: 'Desc_ConstructorMk1_C', count: 1 },
      ]

      mockDataStore.recipeIngredients
        .mockReturnValueOnce([{ item: 'Desc_OreIron_C', amount: 1 }])
        .mockReturnValueOnce([{ item: 'Desc_IronIngot_C', amount: 3 }])

      mockDataStore.recipeProducts
        .mockReturnValueOnce([{ item: 'Desc_IronIngot_C', amount: 1 }])
        .mockReturnValueOnce([{ item: 'Desc_IronPlate_C', amount: 1 }])

      const result = getAllRecipeMaterials(recipes)

      expect(result.ingredients).toEqual({
        Desc_OreIron_C: [
          {
            amount: 1,
            recipe: { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 2 },
            isResource: true,
          },
        ],
        Desc_IronIngot_C: [
          {
            amount: 3,
            recipe: {
              name: 'Recipe_IronPlateReinforced_C',
              building: 'Desc_ConstructorMk1_C',
              count: 1,
            },
            isResource: false,
          },
        ],
      })

      expect(result.products).toEqual({
        Desc_IronIngot_C: [
          {
            amount: 2,
            recipe: { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 2 },
            isResource: false,
          },
        ],
        Desc_IronPlate_C: [
          {
            amount: 1,
            recipe: {
              name: 'Recipe_IronPlateReinforced_C',
              building: 'Desc_ConstructorMk1_C',
              count: 1,
            },
            isResource: false,
          },
        ],
      })
    })

    it('should handle multiple recipes producing the same ingredient', () => {
      const recipes = [
        { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 1 },
        { name: 'Recipe_IronIngot_Alt_C', building: 'Desc_FoundryMk1_C', count: 1 },
      ]

      mockDataStore.recipeIngredients
        .mockReturnValueOnce([{ item: 'Desc_OreIron_C', amount: 1 }])
        .mockReturnValueOnce([{ item: 'Desc_OreIron_C', amount: 2 }])

      mockDataStore.recipeProducts
        .mockReturnValueOnce([{ item: 'Desc_IronIngot_C', amount: 1 }])
        .mockReturnValueOnce([{ item: 'Desc_IronIngot_C', amount: 2 }])

      const result = getAllRecipeMaterials(recipes)

      expect(result.ingredients.Desc_OreIron_C).toHaveLength(2)
      expect(result.products.Desc_IronIngot_C).toHaveLength(2)
    })

    it('should calculate product amounts based on recipe count', () => {
      const recipes = [{ name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 3 }]

      mockDataStore.recipeIngredients.mockReturnValueOnce([{ item: 'Desc_OreIron_C', amount: 1 }])
      mockDataStore.recipeProducts.mockReturnValueOnce([{ item: 'Desc_IronIngot_C', amount: 1 }])

      const result = getAllRecipeMaterials(recipes)

      expect(result.products.Desc_IronIngot_C[0].amount).toBe(3)
    })

    it('should handle empty recipe list', () => {
      const result = getAllRecipeMaterials([])

      expect(result.ingredients).toEqual({})
      expect(result.products).toEqual({})
    })
  })

  describe('batches recipes', () => {
    let mockDataStore: ReturnType<typeof useDataStore>

    beforeEach(() => {
      mockDataStore = {
        recipeIngredients: vi.fn(),
        recipeProducts: vi.fn(),
      }
      vi.mocked(useDataStore).mockReturnValue(mockDataStore)
    })

    it('should batch recipes into three tiers based on dependencies', () => {
      const recipes = [
        // Tier 1: Base materials from natural resources
        { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 1 },
        { name: 'Recipe_CopperIngot_C', building: 'Desc_SmelterMk1_C', count: 1 },

        // Tier 2: Intermediate products using tier 1 materials
        { name: 'Recipe_Wire_C', building: 'Desc_ConstructorMk1_C', count: 1 },
        { name: 'Recipe_IronPlate_C', building: 'Desc_ConstructorMk1_C', count: 1 },

        // Tier 3: Complex products using tier 2 materials
        { name: 'Recipe_Cable_C', building: 'Desc_ConstructorMk1_C', count: 1 },

        // Mining recipes should be filtered out
        { name: 'Recipe_IronOre_C', building: 'Mine', count: 1 },
      ]

      // Mock ingredients to return appropriate dependencies for each recipe
      mockDataStore.recipeIngredients = vi
        .fn()
        .mockReturnValueOnce([{ item: 'Desc_OreIron_C', amount: 1 }]) // IronIngot batch 1
        .mockReturnValueOnce([{ item: 'Desc_OreCopper_C', amount: 1 }]) // CopperIngot batch 1
        .mockReturnValueOnce([{ item: 'Desc_CopperIngot_C', amount: 1 }]) // Wire batch 1 - no match yet
        .mockReturnValueOnce([{ item: 'Desc_IronIngot_C', amount: 2 }]) // IronPlate batch 1 - no match yet
        .mockReturnValueOnce([{ item: 'Desc_Wire_C', amount: 2 }]) // Cable batch 1 - no match yet

        // Second batch iteration - checking remaining recipes
        .mockReturnValueOnce([{ item: 'Desc_CopperIngot_C', amount: 1 }]) // Wire batch 2 - should match now
        .mockReturnValueOnce([{ item: 'Desc_IronIngot_C', amount: 2 }]) // IronPlate batch 2 - should match now
        .mockReturnValueOnce([{ item: 'Desc_Wire_C', amount: 2 }]) // Cable batch 2 - no match yet

        // Third batch iteration - checking final recipes
        .mockReturnValueOnce([{ item: 'Desc_Wire_C', amount: 2 }]) // Cable batch 3 - should match now

      // Mock product outputs for tracking produced items - called when recipes are added to batches
      mockDataStore.recipeProducts
        .mockReturnValueOnce([{ item: 'Desc_IronIngot_C', amount: 1 }]) // IronIngot batch 1
        .mockReturnValueOnce([{ item: 'Desc_CopperIngot_C', amount: 1 }]) // CopperIngot batch 1
        .mockReturnValueOnce([{ item: 'Desc_Wire_C', amount: 1 }]) // Wire batch 2
        .mockReturnValueOnce([{ item: 'Desc_IronPlate_C', amount: 1 }]) // IronPlate batch 2
        .mockReturnValueOnce([{ item: 'Desc_Cable_C', amount: 1 }]) // Cable batch 3

      const result = batchRecipes(recipes)

      expect(result).toHaveLength(3)

      // Tier 1: Recipes that only use natural resources
      expect(result[0]).toEqual([
        expect.objectContaining({ name: 'Recipe_IronIngot_C' }),
        expect.objectContaining({ name: 'Recipe_CopperIngot_C' }),
      ])

      // Tier 2: Recipes that use tier 1 products
      expect(result[1]).toEqual([
        expect.objectContaining({ name: 'Recipe_Wire_C' }),
        expect.objectContaining({ name: 'Recipe_IronPlate_C' }),
      ])

      // Tier 3: Recipes that use tier 2 products
      expect(result[2]).toEqual([expect.objectContaining({ name: 'Recipe_Cable_C' })])
    })

    it('should handle recipes with no dependencies (only natural resources)', () => {
      const recipes = [
        { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 1 },
        { name: 'Recipe_CopperIngot_C', building: 'Desc_SmelterMk1_C', count: 1 },
      ]

      mockDataStore.recipeIngredients
        .mockReturnValueOnce([{ item: 'Desc_OreIron_C', amount: 1 }])
        .mockReturnValueOnce([{ item: 'Desc_OreCopper_C', amount: 1 }])

      mockDataStore.recipeProducts
        .mockReturnValueOnce([{ item: 'Desc_IronIngot_C', amount: 1 }])
        .mockReturnValueOnce([{ item: 'Desc_CopperIngot_C', amount: 1 }])

      const result = batchRecipes(recipes)

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveLength(2)
      expect(result[0].map((recipe) => recipe.name)).toEqual([
        'Recipe_IronIngot_C',
        'Recipe_CopperIngot_C',
      ])
    })

    it('should filter out mining recipes', () => {
      const recipes = [
        { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 1 },
        { name: 'Recipe_IronOre_C', building: 'Mine', count: 1 },
      ]

      mockDataStore.recipeIngredients.mockReturnValueOnce([{ item: 'Desc_OreIron_C', amount: 1 }])

      mockDataStore.recipeProducts.mockReturnValueOnce([{ item: 'Desc_IronIngot_C', amount: 1 }])

      const result = batchRecipes(recipes)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual([expect.objectContaining({ name: 'Recipe_IronIngot_C' })])
    })

    it('should handle empty recipe list', () => {
      const result = batchRecipes([])
      expect(result).toEqual([])
    })

    it('should handle complex dependency chains', () => {
      const recipes = [
        // Base tier
        { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 1 },

        // Second tier - depends on iron ingot
        { name: 'Recipe_IronPlate_C', building: 'Desc_ConstructorMk1_C', count: 1 },
        { name: 'Recipe_IronRod_C', building: 'Desc_ConstructorMk1_C', count: 1 },

        // Third tier - depends on iron plates and rods
        { name: 'Recipe_ReinforcedIronPlate_C', building: 'Desc_AssemblerMk1_C', count: 1 },
      ]

      mockDataStore.recipeIngredients = vi
        .fn()
        // First batch iteration
        .mockReturnValueOnce([{ item: 'Desc_OreIron_C', amount: 1 }]) // IronIngot batch 1
        .mockReturnValueOnce([{ item: 'Desc_IronIngot_C', amount: 2 }]) // IronPlate batch 1 - no match yet
        .mockReturnValueOnce([{ item: 'Desc_IronIngot_C', amount: 1 }]) // IronRod batch 1 - no match yet
        .mockReturnValueOnce([
          { item: 'Desc_IronPlate_C', amount: 6 },
          { item: 'Desc_IronRod_C', amount: 12 },
        ]) // ReinforcedIronPlate batch 1 - no match yet

        // Second batch iteration
        .mockReturnValueOnce([{ item: 'Desc_IronIngot_C', amount: 2 }]) // IronPlate batch 2 - should match now
        .mockReturnValueOnce([{ item: 'Desc_IronIngot_C', amount: 1 }]) // IronRod batch 2 - should match now
        .mockReturnValueOnce([
          { item: 'Desc_IronPlate_C', amount: 6 },
          { item: 'Desc_IronRod_C', amount: 12 },
        ]) // ReinforcedIronPlate batch 2 - no match yet

        // Third batch iteration
        .mockReturnValueOnce([
          { item: 'Desc_IronPlate_C', amount: 6 },
          { item: 'Desc_IronRod_C', amount: 12 },
        ]) // ReinforcedIronPlate batch 3 - should match now

      mockDataStore.recipeProducts
        .mockReturnValueOnce([{ item: 'Desc_IronIngot_C', amount: 1 }]) // IronIngot batch 1
        .mockReturnValueOnce([{ item: 'Desc_IronPlate_C', amount: 1 }]) // IronPlate batch 2
        .mockReturnValueOnce([{ item: 'Desc_IronRod_C', amount: 1 }]) // IronRod batch 2
        .mockReturnValueOnce([{ item: 'Desc_IronPlateReinforced_C', amount: 1 }]) // ReinforcedIronPlate batch 3

      const result = batchRecipes(recipes)

      expect(result).toHaveLength(3)
      expect(result[0]).toHaveLength(1) // Only IronIngot
      expect(result[1]).toHaveLength(2) // IronPlate and IronRod
      expect(result[1][0].name).toBe('Recipe_IronPlate_C')
      expect(result[1][1].name).toBe('Recipe_IronRod_C')
      expect(result[2]).toHaveLength(1) // ReinforcedIronPlate
      expect(result[2][0].name).toBe('Recipe_ReinforcedIronPlate_C')
    })

    it('should throw error when missing middle ingredient prevents batching', () => {
      const recipes = [
        // Base tier - produces iron ingot
        { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 1 },

        // This recipe needs copper wire, but no recipe produces copper wire
        { name: 'Recipe_Cable_C', building: 'Desc_ConstructorMk1_C', count: 1 },
      ]

      mockDataStore.recipeIngredients = vi
        .fn()
        // First batch iteration
        .mockReturnValueOnce([{ item: 'Desc_OreIron_C', amount: 1 }]) // IronIngot - should match
        .mockReturnValueOnce([{ item: 'Desc_Wire_C', amount: 2 }]) // Cable - no match (Wire not produced)

        // Second iteration - no progress made, should trigger error
        .mockReturnValueOnce([{ item: 'Desc_Wire_C', amount: 2 }]) // Cable - still no match

      mockDataStore.recipeProducts.mockReturnValueOnce([{ item: 'Desc_IronIngot_C', amount: 1 }]) // IronIngot batch 1

      expect(() => batchRecipes(recipes)).toThrow(
        'Batching recipes failed, missing ingredients for',
      )
    })

    it('should throw error when circular dependency exists', () => {
      const recipes = [
        // Recipe A needs product from Recipe B
        { name: 'Recipe_A', building: 'Desc_Constructor_C', count: 1 },
        // Recipe B needs product from Recipe A (circular dependency)
        { name: 'Recipe_B', building: 'Desc_Constructor_C', count: 1 },
      ]

      mockDataStore.recipeIngredients = vi
        .fn()
        // First batch iteration - neither recipe can be satisfied
        .mockReturnValueOnce([{ item: 'Product_B', amount: 1 }]) // Recipe A needs Product B
        .mockReturnValueOnce([{ item: 'Product_A', amount: 1 }]) // Recipe B needs Product A

        // Second iteration - still no progress
        .mockReturnValueOnce([{ item: 'Product_B', amount: 1 }]) // Recipe A still needs Product B
        .mockReturnValueOnce([{ item: 'Product_A', amount: 1 }]) // Recipe B still needs Product A

      expect(() => batchRecipes(recipes)).toThrow(
        'Batching recipes failed, missing ingredients for',
      )
    })
  })

  describe('generates links for recipe inputs', () => {
    let mockDataStore: ReturnType<typeof useDataStore>

    beforeEach(() => {
      mockDataStore = {
        recipeIngredients: vi.fn(),
        recipeProducts: vi.fn(),
        items: {
          Desc_OreIron_C: { name: 'Iron Ore' },
          Desc_OreCopper_C: { name: 'Copper Ore' },
          Desc_Water_C: { name: 'Water' },
        },
      }
      vi.mocked(useDataStore).mockReturnValue(mockDataStore)
    })

    const createRecipe = (name: string, building = 'TestBuilding', count = 1) => ({
      name,
      building,
      count,
    })

    const createRecipeItem = (amount: number, recipeName: string) => ({
      amount,
      recipe: createRecipe(recipeName),
      isResource: false,
    })

    it('should handle natural resource not produced (no sources)', () => {
      const recipe = createRecipe('Recipe_IronIngot_C')
      const alreadyProduced = {}

      mockDataStore.recipeIngredients.mockReturnValue([{ item: 'Desc_OreIron_C', amount: 30 }])
      mockDataStore.recipeProducts.mockReturnValue([{ item: 'Desc_IronIngot_C', amount: 30 }])

      const result = getLinksForRecipe(recipe, alreadyProduced)

      expect(result.links).toEqual([
        {
          source: 'Desc_OreIron_C',
          sink: 'Recipe_IronIngot_C',
          name: 'Desc_OreIron_C',
          amount: 30,
        },
      ])
      expect(result.recipesMissingIngredients).toEqual([])
    })

    it('should handle natural resource partially produced', () => {
      const recipe = createRecipe('Recipe_IronIngot_C')
      const alreadyProduced = {
        Desc_OreIron_C: [createRecipeItem(15, 'MiningRecipe')],
      }

      mockDataStore.recipeIngredients.mockReturnValue([{ item: 'Desc_OreIron_C', amount: 30 }])
      mockDataStore.recipeProducts.mockReturnValue([{ item: 'Desc_IronIngot_C', amount: 30 }])

      const result = getLinksForRecipe(recipe, alreadyProduced)

      expect(result.links).toEqual([
        {
          source: 'MiningRecipe',
          sink: 'Recipe_IronIngot_C',
          name: 'Desc_OreIron_C',
          amount: 15,
        },
        {
          source: 'Desc_OreIron_C',
          sink: 'Recipe_IronIngot_C',
          name: 'Desc_OreIron_C',
          amount: 15,
        },
      ])
      expect(result.recipesMissingIngredients).toEqual([])
      expect(alreadyProduced.Desc_OreIron_C[0].amount).toBe(0)
    })

    it('should handle natural resource fully/over produced', () => {
      const recipe = createRecipe('Recipe_IronIngot_C')
      const alreadyProduced = {
        Desc_OreIron_C: [createRecipeItem(50, 'MiningRecipe')],
      }

      mockDataStore.recipeIngredients.mockReturnValue([{ item: 'Desc_OreIron_C', amount: 30 }])
      mockDataStore.recipeProducts.mockReturnValue([{ item: 'Desc_IronIngot_C', amount: 30 }])

      const result = getLinksForRecipe(recipe, alreadyProduced)

      expect(result.links).toEqual([
        {
          source: 'MiningRecipe',
          sink: 'Recipe_IronIngot_C',
          name: 'Desc_OreIron_C',
          amount: 30,
        },
      ])
      expect(result.recipesMissingIngredients).toEqual([])
      expect(alreadyProduced.Desc_OreIron_C[0].amount).toBe(20)
    })

    it('should handle catalyst with partial production', () => {
      const recipe = createRecipe('Recipe_AluminaSolution_C')
      const alreadyProduced = {
        Desc_Water_C: [createRecipeItem(60, 'WaterExtractor')],
      }

      mockDataStore.recipeIngredients.mockReturnValue([
        { item: 'Desc_AluminaSolution_C', amount: 120 },
        { item: 'Desc_Water_C', amount: 120 },
      ])
      mockDataStore.recipeProducts.mockReturnValue([{ item: 'Desc_AluminaSolution_C', amount: 60 }])

      const result = getLinksForRecipe(recipe, alreadyProduced)

      expect(result.links).toEqual([
        {
          source: 'Recipe_AluminaSolution_C',
          sink: 'Recipe_AluminaSolution_C',
          name: 'Desc_AluminaSolution_C',
          amount: 60,
        },
        {
          source: 'WaterExtractor',
          sink: 'Recipe_AluminaSolution_C',
          name: 'Desc_Water_C',
          amount: 60,
        },
        {
          source: 'Desc_Water_C',
          sink: 'Recipe_AluminaSolution_C',
          name: 'Desc_Water_C',
          amount: 60,
        },
      ])
      expect(result.recipesMissingIngredients).toEqual([
        {
          amount: 60,
          item: 'Desc_AluminaSolution_C',
        },
      ])
    })

    it('should handle catalyst with full production', () => {
      const recipe = createRecipe('Recipe_AluminaSolution_C')
      const alreadyProduced = {
        Desc_Water_C: [createRecipeItem(200, 'WaterExtractor')],
      }

      mockDataStore.recipeIngredients.mockReturnValue([
        { item: 'Desc_AluminaSolution_C', amount: 60 },
        { item: 'Desc_Water_C', amount: 120 },
      ])
      mockDataStore.recipeProducts.mockReturnValue([
        { item: 'Desc_AluminaSolution_C', amount: 120 },
      ])

      const result = getLinksForRecipe(recipe, alreadyProduced)

      expect(result.links).toEqual([
        {
          source: 'Recipe_AluminaSolution_C',
          sink: 'Recipe_AluminaSolution_C',
          name: 'Desc_AluminaSolution_C',
          amount: 60,
        },
        {
          source: 'WaterExtractor',
          sink: 'Recipe_AluminaSolution_C',
          name: 'Desc_Water_C',
          amount: 120,
        },
      ])
      expect(result.recipesMissingIngredients).toHaveLength(0)
      expect(alreadyProduced.Desc_Water_C[0].amount).toBe(80)
    })

    it('should handle items not fully available', () => {
      const recipe = createRecipe('Recipe_IronPlateReinforced_C', 'TestBuilding', 5)
      const alreadyProduced = {
        Desc_IronPlate_C: [createRecipeItem(20, 'IronPlateRecipe')],
        Desc_IronRod_C: [createRecipeItem(8, 'IronRodRecipe')],
      }

      mockDataStore.recipeIngredients.mockReturnValue([
        { item: 'Desc_IronPlate_C', amount: 30 },
        { item: 'Desc_IronRod_C', amount: 12 },
      ])
      mockDataStore.recipeProducts.mockReturnValue([
        { item: 'Desc_IronPlateReinforced_C', amount: 5 },
      ])

      const result = getLinksForRecipe(recipe, alreadyProduced)

      expect(result.links).toEqual([])
      expect(result.recipesMissingIngredients).toEqual([
        {
          amount: 150,
          item: 'Desc_IronPlate_C',
        },
        {
          amount: 60,
          item: 'Desc_IronRod_C',
        },
      ])
      expect(alreadyProduced.Desc_IronPlate_C[0].amount).toBe(20)
      expect(alreadyProduced.Desc_IronRod_C[0].amount).toBe(8)
    })

    it('should handle single source', () => {
      const recipe = createRecipe('Recipe_IronPlate_C', 'TestBuilding', 2)
      const alreadyProduced = {
        Desc_IronIngot_C: [createRecipeItem(50, 'IronIngotRecipe')],
      }

      mockDataStore.recipeIngredients.mockReturnValue([{ item: 'Desc_IronIngot_C', amount: 20 }])
      mockDataStore.recipeProducts.mockReturnValue([{ item: 'Desc_IronPlate_C', amount: 10 }])

      const result = getLinksForRecipe(recipe, alreadyProduced)

      expect(result.links).toEqual([
        {
          source: 'IronIngotRecipe',
          sink: 'Recipe_IronPlate_C',
          name: 'Desc_IronIngot_C',
          amount: 40,
        },
      ])
      expect(result.recipesMissingIngredients).toEqual([])
      expect(alreadyProduced.Desc_IronIngot_C[0].amount).toBe(10)
    })

    it('should handle multiple sources', () => {
      const recipe = createRecipe('Recipe_Cable_C')
      const alreadyProduced = {
        Desc_Wire_C: [
          createRecipeItem(15, 'WireRecipe1'),
          createRecipeItem(25, 'WireRecipe2'),
          createRecipeItem(10, 'WireRecipe3'),
        ],
      }

      mockDataStore.recipeIngredients.mockReturnValue([{ item: 'Desc_Wire_C', amount: 40 }])
      mockDataStore.recipeProducts.mockReturnValue([{ item: 'Desc_Cable_C', amount: 30 }])

      const result = getLinksForRecipe(recipe, alreadyProduced)

      expect(result.links).toEqual([
        {
          source: 'WireRecipe3',
          sink: 'Recipe_Cable_C',
          name: 'Desc_Wire_C',
          amount: 10,
        },
        {
          source: 'WireRecipe1',
          sink: 'Recipe_Cable_C',
          name: 'Desc_Wire_C',
          amount: 15,
        },
        {
          source: 'WireRecipe2',
          sink: 'Recipe_Cable_C',
          name: 'Desc_Wire_C',
          amount: 15,
        },
      ])
      expect(result.recipesMissingIngredients).toHaveLength(0)
      expect(alreadyProduced.Desc_Wire_C[0].amount).toBe(0)
      expect(alreadyProduced.Desc_Wire_C[1].amount).toBe(0)
      expect(alreadyProduced.Desc_Wire_C[2].amount).toBe(0)
    })
  })
})
