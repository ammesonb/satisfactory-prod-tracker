import { describe, it, expect, vi, beforeEach } from 'vitest'
import { batchRecipes } from '../recipe_import'
import { useDataStore } from '@/stores/data'

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

    expect(() => batchRecipes(recipes)).toThrow('Batching recipes failed, missing ingredients for')
  })
})
