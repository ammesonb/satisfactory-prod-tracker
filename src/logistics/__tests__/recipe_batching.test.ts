import { describe, it, expect, vi, beforeEach } from 'vitest'
import { batchRecipes, findCircularRecipes } from '../recipe_import'
import type { Recipe } from '@/types/factory'
import { setupMockDataStore } from './recipe-fixtures'

vi.mock('@/stores/data')

describe('recipe batching', () => {
  beforeEach(() => {
    setupMockDataStore()
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

    const result = batchRecipes(recipes)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual([expect.objectContaining({ name: 'Recipe_IronIngot_C' })])
  })

  it('should handle empty recipe list', () => {
    const result = batchRecipes([])
    expect(result).toEqual([])
  })

  it('should handle dependency chains', () => {
    const recipes = [
      // Base tier
      { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 1 },

      // Second tier - depends on iron ingot
      { name: 'Recipe_IronPlate_C', building: 'Desc_ConstructorMk1_C', count: 1 },
      { name: 'Recipe_Alternate_Wire_1_C', building: 'Desc_ConstructorMk1_C', count: 1 },

      // Third tier - depends on iron plates and rods
      {
        name: 'Recipe_Alternate_ReinforcedIronPlate_2_C',
        building: 'Desc_AssemblerMk1_C',
        count: 1,
      },
    ]

    const result = batchRecipes(recipes)

    const expected = [
      [expect.objectContaining({ name: 'Recipe_IronIngot_C' })],
      [
        expect.objectContaining({ name: 'Recipe_IronPlate_C' }),
        expect.objectContaining({ name: 'Recipe_Alternate_Wire_1_C' }),
      ],
      [expect.objectContaining({ name: 'Recipe_Alternate_ReinforcedIronPlate_2_C' })],
    ]

    expect(result).toEqual(expected)
    for (let i = 0; i < expected.length; i++) {
      expect(result[i]).toEqual(expected[i])
    }
  })

  it('should throw error when missing middle ingredient prevents batching', () => {
    const recipes = [
      // Base tier - produces iron ingot
      { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 1 },

      // This recipe needs copper wire, but no recipe produces copper wire
      { name: 'Recipe_Cable_C', building: 'Desc_ConstructorMk1_C', count: 1 },
    ]

    expect(() => batchRecipes(recipes)).toThrow('Batching recipes failed, missing ingredients for')
  })

  it('should handle catalyst recipes (self-referential circular dependency)', () => {
    const recipes = [
      // Base recipe produces alumina solution
      { name: 'Recipe_AluminaSolutionRaw_C', building: 'Desc_Refinery_C', count: 1 },
      // Catalyst recipe consumes and produces alumina solution
      { name: 'Recipe_AluminaSolution_C', building: 'Desc_Refinery_C', count: 1 },
    ]

    const result = batchRecipes(recipes)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual([expect.objectContaining({ name: 'Recipe_AluminaSolutionRaw_C' })])
    expect(result[1]).toEqual([expect.objectContaining({ name: 'Recipe_AluminaSolution_C' })])
  })

  it('should handle mutual circular dependencies (plastic/rubber cycle)', () => {
    const recipes = [
      // Base recipes
      { name: 'Recipe_Alternate_HeavyOilResidue_C', building: 'Desc_OilRefinery_C', count: 1 },
      { name: 'Recipe_ResidualRubber_C', building: 'Desc_OilRefinery_C', count: 1 },
      { name: 'Recipe_Alternate_DilutedFuel_C', building: 'Desc_Blender_C', count: 1 },
      // Circular recipes that depend on each other
      { name: 'Recipe_Alternate_RecycledRubber_C', building: 'Desc_OilRefinery_C', count: 1 },
      { name: 'Recipe_Alternate_Plastic_1_C', building: 'Desc_OilRefinery_C', count: 1 },
    ]

    const result = batchRecipes(recipes)

    const expected = [
      [expect.objectContaining({ name: 'Recipe_Alternate_HeavyOilResidue_C' })],
      [
        expect.objectContaining({ name: 'Recipe_ResidualRubber_C' }),
        expect.objectContaining({ name: 'Recipe_Alternate_DilutedFuel_C' }),
      ],
      [expect.objectContaining({ name: 'Recipe_Alternate_Plastic_1_C' })],
      [expect.objectContaining({ name: 'Recipe_Alternate_RecycledRubber_C' })],
    ]
    expect(result).toHaveLength(expected.length)
    for (let i = 0; i < expected.length; i++) {
      expect(result[i]).toEqual(expected[i])
    }
  })

  it('should throw error when non-circular missing ingredients prevent batching', () => {
    const recipes = [
      // Base tier - produces iron ingot
      { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 1 },

      // This recipe needs copper wire, but no recipe produces copper wire
      { name: 'Recipe_Cable_C', building: 'Desc_ConstructorMk1_C', count: 1 },
    ]

    expect(() => batchRecipes(recipes)).toThrow('Batching recipes failed, missing ingredients for')
  })
})

describe('findCircularRecipes', () => {
  beforeEach(() => {
    setupMockDataStore()
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
    expect(result.map((r) => r.name)).toEqual(
      expect.arrayContaining(['Recipe_RecycledRubber_C', 'Recipe_RecycledPlastic_C']),
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
    const recipes: Recipe[] = [{ name: 'Recipe_Unknown_C', building: 'Desc_Unknown_C', count: 1 }]

    const result = findCircularRecipes(recipes)
    expect(result).toEqual([])
  })
})
