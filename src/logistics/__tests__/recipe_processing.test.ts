import { describe, it, expect, vi, beforeEach } from 'vitest'
import { linkRecipes } from '../recipe_import'
import { useDataStore } from '@/stores/data'
import { setupMockDataStore } from './recipe-fixtures'

vi.mock('@/stores/data')

describe('linkRecipes integration - production chain processing', () => {
  let mockDataStore: ReturnType<typeof useDataStore>

  beforeEach(() => {
    mockDataStore = setupMockDataStore()
  })

  // Tests a basic 2-step production chain: Iron Ore -> Iron Ingot -> Iron Plate
  it('should handle simple production chain', () => {
    const rawRecipes = [
      '"Recipe_IronIngot_C@100#Desc_SmelterMk1_C": "3"',
      '"Recipe_IronPlate_C@100#Desc_ConstructorMk1_C": "1"',
    ]

    const result = linkRecipes(rawRecipes)

    expect(result.recipeBatches).toHaveLength(2)
    expect(result.recipeBatches[0]).toEqual([
      expect.objectContaining({ name: 'Recipe_IronIngot_C' }),
    ])
    expect(result.recipeBatches[1]).toEqual([
      expect.objectContaining({ name: 'Recipe_IronPlate_C' }),
    ])

    expect(result.recipeLinks).toEqual([
      {
        source: 'Desc_OreIron_C',
        sink: 'Recipe_IronIngot_C',
        name: 'Desc_OreIron_C',
        amount: 3,
      },
      {
        source: 'Recipe_IronIngot_C',
        sink: 'Recipe_IronPlate_C',
        name: 'Desc_IronIngot_C',
        amount: 3,
      },
    ])
  })

  // Tests a multi-tier production chain with parallel base materials and dependencies: Ores -> Ingots -> Wire -> Cable
  it('should handle complex production chain', () => {
    const rawRecipes = [
      '"Recipe_IronIngot_C@1#Desc_SmelterMk1_C": "1"',
      '"Recipe_CopperIngot_C@1#Desc_SmelterMk1_C": "4"',
      '"Recipe_Wire_C@1#Desc_ConstructorMk1_C": "2"',
      '"Recipe_Cable_C@1#Desc_ConstructorMk1_C": "1"',
    ]

    const result = linkRecipes(rawRecipes)

    expect(result.recipeBatches).toHaveLength(3)
    expect(result.recipeLinks).toEqual([
      {
        source: 'Desc_OreIron_C',
        sink: 'Recipe_IronIngot_C',
        name: 'Desc_OreIron_C',
        amount: 1,
      },
      {
        source: 'Desc_OreCopper_C',
        sink: 'Recipe_CopperIngot_C',
        name: 'Desc_OreCopper_C',
        amount: 4,
      },
      {
        source: 'Recipe_CopperIngot_C',
        sink: 'Recipe_Wire_C',
        name: 'Desc_CopperIngot_C',
        amount: 4,
      },
      {
        source: 'Recipe_Wire_C',
        sink: 'Recipe_Cable_C',
        name: 'Desc_Wire_C',
        amount: 2,
      },
    ])
    expect(result.producedItems).toEqual({
      Desc_IronIngot_C: [
        {
          amount: 1,
          recipe: expect.objectContaining({ name: 'Recipe_IronIngot_C' }),
          isResource: false,
        },
      ],
      Desc_Cable_C: [
        {
          amount: 1,
          recipe: expect.objectContaining({ name: 'Recipe_Cable_C' }),
          isResource: false,
        },
      ],
    })
  })

  // Tests parallel production from natural resources (both recipes can run in same batch)
  it('should handle production chain with natural resources', () => {
    const rawRecipes = [
      '"Recipe_IronIngot_C@1#Desc_SmelterMk1_C": "2"',
      '"Recipe_Concrete_C@1#Desc_ConstructorMk1_C": "1"',
    ]

    const result = linkRecipes(rawRecipes)

    expect(result.recipeBatches).toHaveLength(1)
    expect(result.recipeLinks).toEqual([
      {
        source: 'Desc_OreIron_C',
        sink: 'Recipe_IronIngot_C',
        name: 'Desc_OreIron_C',
        amount: 2,
      },
      {
        source: 'Desc_Stone_C',
        sink: 'Recipe_Concrete_C',
        name: 'Desc_Stone_C',
        amount: 3,
      },
    ])
  })

  // Tests oil refining producing multiple byproducts, one used by subsequent recipe
  it('should handle natural resources as byproducts', () => {
    const rawRecipes = [
      '"Recipe_AluminaSolutionRaw_C@1#Desc_Refinery_C": "2"',
      '"Recipe_AluminaSolution_C@1#Desc_Refinery_C": "1"',
      '"Recipe_PureCateriumIngot_C@1#Desc_Refinery_C": "1"',
    ]

    const result = linkRecipes(rawRecipes)

    expect(result.recipeBatches).toHaveLength(2)
    expect(result.recipeLinks).toEqual([
      // raw first
      {
        source: 'Desc_OreBauxite_C',
        sink: 'Recipe_AluminaSolutionRaw_C',
        name: 'Desc_OreBauxite_C',
        amount: 4,
      },
      {
        source: 'Desc_OreGold_C',
        sink: 'Recipe_PureCateriumIngot_C',
        name: 'Desc_OreGold_C',
        amount: 2,
      },
      // then refined products
      {
        source: 'Desc_Water_C',
        sink: 'Recipe_PureCateriumIngot_C',
        name: 'Desc_Water_C',
        amount: 2,
      },
      // catalyst before external product
      {
        source: 'Recipe_AluminaSolution_C',
        sink: 'Recipe_AluminaSolution_C',
        name: 'Desc_AluminaSolution_C',
        amount: 60,
      },
      {
        source: 'Recipe_AluminaSolutionRaw_C',
        sink: 'Recipe_AluminaSolution_C',
        name: 'Desc_AluminaSolution_C',
        amount: 60,
      },
    ])
    expect(result.producedItems).toEqual({
      Desc_CateriumIngot_C: [
        {
          amount: 2,
          recipe: expect.objectContaining({ name: 'Recipe_PureCateriumIngot_C' }),
          isResource: false,
        },
      ],
      Desc_Water_C: [
        {
          amount: 120,
          recipe: expect.objectContaining({ name: 'Recipe_AluminaSolution_C' }),
          isResource: false,
        },
      ],
    })
  })

  // Tests insufficient production: 1 iron ingot produced, but 6 needed for 2 iron plate recipes
  it('should handle insufficient quantity production', () => {
    const rawRecipes = [
      '"Recipe_IronIngot_C@1#Desc_SmelterMk1_C": "1"', // Produces 1 iron ingot
      '"Recipe_IronPlate_C@1#Desc_ConstructorMk1_C": "2"', // Needs 6 iron ingots (3 each)
    ]

    expect(() => linkRecipes(rawRecipes)).toThrow(
      'Not enough resources to produce Recipe_IronPlate_C',
    )
  })

  // Tests exact quantity matching: 3 iron ingot smelters producing exactly what 1 iron plate constructor needs
  it('should handle sufficient quantity produced by another recipe', () => {
    const rawRecipes = [
      '"Recipe_IronIngot_C@1#Desc_SmelterMk1_C": "3"', // Produces 3 iron ingots
      '"Recipe_IronPlate_C@1#Desc_ConstructorMk1_C": "1"', // Needs 3 iron ingots
    ]

    const result = linkRecipes(rawRecipes)

    expect(result.recipeBatches).toHaveLength(2)
    expect(result.recipeLinks).toEqual([
      {
        source: 'Desc_OreIron_C',
        sink: 'Recipe_IronIngot_C',
        name: 'Desc_OreIron_C',
        amount: 3,
      },
      {
        source: 'Recipe_IronIngot_C',
        sink: 'Recipe_IronPlate_C',
        name: 'Desc_IronIngot_C',
        amount: 3,
      },
    ])
  })

  it('should link modular frame production', () => {})

  it('should link plastic/rubber catalyst recipes', () => {
    const rawRecipes = [
      '"Recipe_ResidualRubber_C@100#Desc_OilRefinery_C": "0.6666666666666"',
      '"Recipe_Alternate_RecycledRubber_C@100#Desc_OilRefinery_C": "1.7037"',
      '"Recipe_Alternate_HeavyOilResidue_C@100#Desc_OilRefinery_C": "1.333333333333"',
      '"Recipe_Alternate_DilutedFuel_C@100#Desc_Blender_C": "1.066666666666"',
      '"Recipe_Alternate_Plastic_1_C@100#Desc_OilRefinery_C": "1.85185"',
    ]

    const result = linkRecipes(rawRecipes)

    expect(result.recipeBatches).toHaveLength(3)
    expect(result.recipeLinks).toEqual([
      {
        source: 'Desc_LiquidOil_C',
        sink: 'Recipe_Alternate_HeavyOilResidue_C',
        name: 'Desc_LiquidOil_C',
        amount: 40,
      },
      {
        source: 'Recipe_Alternate_HeavyOilResidue_C',
        sink: 'Recipe_Alternate_DilutedFuel_C',
        name: 'Desc_HeavyOilResidue_C',
        amount: 53.333, // TODO: these need to be close to, not exact
      },
      {
        source: 'Desc_Water_C',
        sink: 'Recipe_Alternate_DilutedFuel_C',
        name: 'Desc_Water_C',
        amount: 106.667,
      },
      {
        source: 'Recipe_Alternate_HeavyOilResidue_C',
        sink: 'Recipe_ResidualRubber_C',
        name: 'Desc_PolymerResin_C',
        amount: 26.6667,
      },
      {
        source: 'Desc_Water_C',
        sink: 'Recipe_ResidualRubber_C',
        name: 'Desc_Water_C',
        amount: 26.6667,
      },
      {
        source: 'Recipe_DilutedFuel_C',
        sink: 'Recipe_Alternate_Plastic_1_C',
        name: 'Desc_Fuel_C',
        amount: 55.555,
      },
      {
        source: 'Recipe_ResidualRubber_C',
        sink: 'Recipe_Alternate_Plastic_1_C',
        name: 'Desc_Rubber_C',
        amount: 13.3333,
      },
      {
        source: 'Recipe_DilutedFuel_C',
        sink: 'Reciped_Alternate_RecycledRubber_C',
        name: 'Desc_Fuel_C',
        amount: 51.111,
      },
      {
        source: 'Recipe_Alternate_Plastic_1_C',
        sink: 'Recipe_RecycledRubber_C',
        name: 'Desc_Plastic_C',
        amount: 51.111,
      },
      {
        source: 'Recipe_RecycledRubber_C',
        sink: 'Recipe_Alternate_Plastic_1_C',
        name: 'Desc_Rubber_C',
        amount: 42.222,
      },
    ])
    expect(result.producedItems).toEqual({
      Desc_Plastic_C: [
        {
          amount: 60,
          recipe: expect.objectContaining({ name: 'Recipe_Alternate_Plastic_1_C' }),
          isResource: false,
        },
      ],
      Desc_Rubber_C: [
        {
          amount: 60,
          recipe: expect.objectContaining({ name: 'Recipe_RecycledRubber_C' }),
          isResource: false,
        },
      ],
    })
  })
})
