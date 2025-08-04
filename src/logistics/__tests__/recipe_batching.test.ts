import { describe, it, expect, vi, beforeEach } from 'vitest'
import { batchRecipes, findCircularRecipes } from '../recipe_import'
import { useDataStore } from '@/stores/data'
import type { Recipe } from '@/types/factory'

vi.mock('@/stores/data')

describe('recipe batching', () => {
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

    expect(() => batchRecipes(recipes)).toThrow('Batching recipes failed, missing ingredients for')
  })

  it('should handle catalyst recipes (self-referential circular dependency)', () => {
    const recipes = [
      // Base recipe produces alumina solution
      { name: 'Recipe_AluminaSolutionRaw_C', building: 'Desc_Refinery_C', count: 1 },
      // Catalyst recipe consumes and produces alumina solution
      { name: 'Recipe_AluminaSolution_C', building: 'Desc_Refinery_C', count: 1 },
    ]

    mockDataStore.recipeIngredients = vi
      .fn()
      // First batch iteration
      .mockReturnValueOnce([{ item: 'Desc_OreBauxite_C', amount: 2 }]) // AluminaSolutionRaw - should match
      .mockReturnValueOnce([{ item: 'Desc_AluminaSolution_C', amount: 120 }]) // AluminaSolution - no external source yet

      // Circular dependency detection - both recipes get analyzed for circularity
      .mockReturnValueOnce([{ item: 'Desc_AluminaSolution_C', amount: 120 }]) // AluminaSolution ingredients
      .mockReturnValueOnce([{ item: 'Desc_OreBauxite_C', amount: 2 }]) // AluminaSolutionRaw ingredients

    mockDataStore.recipeProducts = vi
      .fn()
      .mockReturnValueOnce([{ item: 'Desc_AluminaSolution_C', amount: 30 }]) // AluminaSolutionRaw batch 1
      // Circular dependency detection - products for circularity check
      .mockReturnValueOnce([
        { item: 'Desc_AluminaSolution_C', amount: 60 },
        { item: 'Desc_Water_C', amount: 120 },
      ]) // AluminaSolution products
      .mockReturnValueOnce([{ item: 'Desc_AluminaSolution_C', amount: 30 }]) // AluminaSolutionRaw products
      // After circular detection, products are marked as available
      .mockReturnValueOnce([
        { item: 'Desc_AluminaSolution_C', amount: 60 },
        { item: 'Desc_Water_C', amount: 120 },
      ]) // AluminaSolution batch 2

    const result = batchRecipes(recipes)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual([expect.objectContaining({ name: 'Recipe_AluminaSolutionRaw_C' })])
    expect(result[1]).toEqual([expect.objectContaining({ name: 'Recipe_AluminaSolution_C' })])
  })

  it('should handle mutual circular dependencies (plastic/rubber cycle)', () => {
    const recipes = [
      // Base recipes
      { name: 'Recipe_ResidualRubber_C', building: 'Desc_OilRefinery_C', count: 1 },
      { name: 'Recipe_Alternate_DilutedFuel_C', building: 'Desc_Blender_C', count: 1 },
      // Circular recipes that depend on each other
      { name: 'Recipe_Alternate_RecycledRubber_C', building: 'Desc_OilRefinery_C', count: 1 },
      { name: 'Recipe_Alternate_Plastic_1_C', building: 'Desc_OilRefinery_C', count: 1 },
    ]

    mockDataStore.recipeIngredients = vi
      .fn()
      // First batch iteration
      .mockReturnValueOnce([
        { item: 'Desc_PolymerResin_C', amount: 40 },
        { item: 'Desc_Water_C', amount: 40 },
      ]) // ResidualRubber - should match (uses natural resources indirectly)
      .mockReturnValueOnce([
        { item: 'Desc_HeavyOilResidue_C', amount: 50 },
        { item: 'Desc_Water_C', amount: 100 },
      ]) // DilutedFuel - should match (uses natural resources indirectly)
      .mockReturnValueOnce([
        { item: 'Desc_Plastic_C', amount: 30 },
        { item: 'Desc_Fuel_C', amount: 30 },
      ]) // RecycledRubber - no match (needs Plastic from Plastic_1_C)
      .mockReturnValueOnce([
        { item: 'Desc_Rubber_C', amount: 30 },
        { item: 'Desc_Fuel_C', amount: 30 },
      ]) // Plastic_1_C - no match (needs Rubber from RecycledRubber)

      // Circular dependency detection - analyze all remaining recipes for circularity
      .mockReturnValueOnce([
        { item: 'Desc_Plastic_C', amount: 30 },
        { item: 'Desc_Fuel_C', amount: 30 },
      ]) // RecycledRubber ingredients
      .mockReturnValueOnce([
        { item: 'Desc_Rubber_C', amount: 30 },
        { item: 'Desc_Fuel_C', amount: 30 },
      ]) // Plastic_1_C ingredients

    mockDataStore.recipeProducts = vi
      .fn()
      .mockReturnValueOnce([{ item: 'Desc_Rubber_C', amount: 20 }]) // ResidualRubber batch 1
      .mockReturnValueOnce([{ item: 'Desc_Fuel_C', amount: 100 }]) // DilutedFuel batch 1
      // Circular dependency detection - products for circularity check
      .mockReturnValueOnce([{ item: 'Desc_Rubber_C', amount: 60 }]) // RecycledRubber products
      .mockReturnValueOnce([{ item: 'Desc_Plastic_C', amount: 60 }]) // Plastic_1_C products
      // After circular detection, products are marked as available
      .mockReturnValueOnce([{ item: 'Desc_Rubber_C', amount: 60 }]) // RecycledRubber batch 2
      .mockReturnValueOnce([{ item: 'Desc_Plastic_C', amount: 60 }]) // Plastic_1_C batch 2

    const result = batchRecipes(recipes)

    expect(result).toHaveLength(2)
    expect(result[0]).toHaveLength(2) // ResidualRubber and DilutedFuel
    expect(result[1]).toHaveLength(2) // RecycledRubber and Plastic_1_C (circular pair)
    expect(result[1].map((r) => r.name)).toEqual(
      expect.arrayContaining(['Recipe_Alternate_RecycledRubber_C', 'Recipe_Alternate_Plastic_1_C']),
    )
  })

  it('should throw error when non-circular missing ingredients prevent batching', () => {
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

      // Circular dependency detection - analyze remaining recipe
      .mockReturnValueOnce([{ item: 'Desc_Wire_C', amount: 2 }]) // Cable ingredients

    mockDataStore.recipeProducts = vi
      .fn()
      .mockReturnValueOnce([{ item: 'Desc_IronIngot_C', amount: 1 }]) // IronIngot batch 1
      // Circular dependency detection - products for circularity check
      .mockReturnValueOnce([{ item: 'Desc_Cable_C', amount: 1 }]) // Cable products

    expect(() => batchRecipes(recipes)).toThrow('Batching recipes failed, missing ingredients for')
  })
})

describe('findCircularRecipes', () => {
  let mockDataStore: ReturnType<typeof useDataStore>

  // Recipe database for testing circular dependencies
  const testRecipeDatabase: Record<string, { ingredients: Array<{ item: string; amount: number }>; products: Array<{ item: string; amount: number }> }> = {
    // Normal recipes
    Recipe_IronIngot_C: {
      ingredients: [{ item: 'Desc_OreIron_C', amount: 1 }],
      products: [{ item: 'Desc_IronIngot_C', amount: 1 }],
    },
    Recipe_IronPlate_C: {
      ingredients: [{ item: 'Desc_IronIngot_C', amount: 3 }],
      products: [{ item: 'Desc_IronPlate_C', amount: 2 }],
    },
    // Self-referential catalyst recipe
    Recipe_AluminaSolution_C: {
      ingredients: [{ item: 'Desc_AluminaSolution_C', amount: 120 }],
      products: [
        { item: 'Desc_AluminaSolution_C', amount: 60 },
        { item: 'Desc_Water_C', amount: 120 },
      ],
    },
    // Mutual circular dependency recipes
    Recipe_RecycledRubber_C: {
      ingredients: [
        { item: 'Desc_Plastic_C', amount: 30 },
        { item: 'Desc_Fuel_C', amount: 30 },
      ],
      products: [{ item: 'Desc_Rubber_C', amount: 60 }],
    },
    Recipe_RecycledPlastic_C: {
      ingredients: [
        { item: 'Desc_Rubber_C', amount: 30 },
        { item: 'Desc_Fuel_C', amount: 30 },
      ],
      products: [{ item: 'Desc_Plastic_C', amount: 60 }],
    },
  }

  beforeEach(() => {
    mockDataStore = {
      recipeIngredients: vi.fn((recipeName: string) => {
        const recipe = testRecipeDatabase[recipeName]
        return recipe ? recipe.ingredients : []
      }),
      recipeProducts: vi.fn((recipeName: string) => {
        const recipe = testRecipeDatabase[recipeName]
        return recipe ? recipe.products : []
      }),
    }
    vi.mocked(useDataStore).mockReturnValue(mockDataStore)
  })

  it('should detect self-referential catalyst recipes', () => {
    const recipes: Recipe[] = [
      { name: 'Recipe_AluminaSolution_C', building: 'Desc_Refinery_C', count: 1 },
      { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 1 },
    ]

    const result = findCircularRecipes(recipes)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Recipe_AluminaSolution_C')
  })

  it('should detect mutual circular dependencies', () => {
    const recipes: Recipe[] = [
      { name: 'Recipe_RecycledRubber_C', building: 'Desc_OilRefinery_C', count: 1 },
      { name: 'Recipe_RecycledPlastic_C', building: 'Desc_OilRefinery_C', count: 1 },
    ]

    const result = findCircularRecipes(recipes)

    expect(result).toHaveLength(2)
    expect(result.map(r => r.name)).toEqual(
      expect.arrayContaining(['Recipe_RecycledRubber_C', 'Recipe_RecycledPlastic_C'])
    )
  })

  it('should not detect non-circular dependencies', () => {
    const recipes: Recipe[] = [
      { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 1 },
      { name: 'Recipe_IronPlate_C', building: 'Desc_ConstructorMk1_C', count: 1 },
    ]

    const result = findCircularRecipes(recipes)

    expect(result).toHaveLength(0)
  })

  it('should handle empty recipe list', () => {
    const result = findCircularRecipes([])
    expect(result).toEqual([])
  })

  it('should handle recipes with missing data gracefully', () => {
    const recipes: Recipe[] = [
      { name: 'Recipe_Unknown_C', building: 'Desc_Unknown_C', count: 1 },
    ]

    const result = findCircularRecipes(recipes)
    expect(result).toEqual([])
  })
})
