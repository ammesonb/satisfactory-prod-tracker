import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processRecipeChain } from '../recipe-processor'
import { setupMockDataStore } from './recipe-fixtures'
import type { Recipe, Material } from '@/types/factory'

vi.mock('@/stores/data')

// Common recipe patterns with buildings
const BUILDINGS = {
  SMELTER: 'Desc_SmelterMk1_C',
  CONSTRUCTOR: 'Desc_ConstructorMk1_C',
  ASSEMBLER: 'Desc_AssemblerMk1_C',
  FOUNDRY: 'Desc_FoundryMk1_C',
  REFINERY: 'Desc_OilRefinery_C',
  BLENDER: 'Desc_Blender_C',
}

const makeRecipe = (
  recipeName: string,
  amount: string,
  building: string,
  efficiency: number = 100,
) => `${recipeName}@${efficiency}#${building}: "${amount}"`

const RECIPES = {
  IRON_INGOT: (amount: string) => makeRecipe('Recipe_IronIngot_C', amount, BUILDINGS.SMELTER),
  IRON_PLATE: (amount: string) => makeRecipe('Recipe_IronPlate_C', amount, BUILDINGS.CONSTRUCTOR),
  COPPER_INGOT: (amount: string) => makeRecipe('Recipe_CopperIngot_C', amount, BUILDINGS.SMELTER),
  WIRE: (amount: string) => makeRecipe('Recipe_Wire_C', amount, BUILDINGS.CONSTRUCTOR),
  CABLE: (amount: string) => makeRecipe('Recipe_Cable_C', amount, BUILDINGS.CONSTRUCTOR),
  CONCRETE: (amount: string) => makeRecipe('Recipe_Concrete_C', amount, BUILDINGS.CONSTRUCTOR),

  // Complex recipes
  ALUMINA_SOLUTION_RAW: (amount: string) =>
    makeRecipe('Recipe_AluminaSolutionRaw_C', amount, BUILDINGS.REFINERY),
  ALUMINA_SOLUTION: (amount: string) =>
    makeRecipe('Recipe_AluminaSolution_C', amount, BUILDINGS.REFINERY),
  PURE_CATERIUM_INGOT: (amount: string) =>
    makeRecipe('Recipe_PureCateriumIngot_C', amount, BUILDINGS.REFINERY),

  // Modular frame production chain
  ALTERNATE_STEEL_ROD: (amount: string) =>
    makeRecipe('Recipe_Alternate_SteelRod_C', amount, BUILDINGS.CONSTRUCTOR),
  ALTERNATE_PURE_IRON_INGOT: (amount: string) =>
    makeRecipe('Recipe_Alternate_PureIronIngot_C', amount, 'Desc_OilRefinery_C'),
  MODULAR_FRAME: (amount: string) =>
    makeRecipe('Recipe_ModularFrame_C', amount, BUILDINGS.ASSEMBLER),
  ALTERNATE_STEEL_CASTED_PLATE: (amount: string) =>
    makeRecipe('Recipe_Alternate_SteelCastedPlate_C', amount, BUILDINGS.FOUNDRY),
  ALTERNATE_WIRE_1: (amount: string) =>
    makeRecipe('Recipe_Alternate_Wire_1_C', amount, BUILDINGS.CONSTRUCTOR),
  ALTERNATE_REINFORCED_IRON_PLATE_2: (amount: string) =>
    makeRecipe('Recipe_Alternate_ReinforcedIronPlate_2_C', amount, BUILDINGS.ASSEMBLER),
  ALTERNATE_INGOT_STEEL_1: (amount: string) =>
    makeRecipe('Recipe_Alternate_IngotSteel_1_C', amount, BUILDINGS.FOUNDRY),

  // Oil/plastic/rubber production chain
  RESIDUAL_RUBBER: (amount: string) =>
    makeRecipe('Recipe_ResidualRubber_C', amount, 'Desc_OilRefinery_C'),
  ALTERNATE_RECYCLED_RUBBER: (amount: string) =>
    makeRecipe('Recipe_Alternate_RecycledRubber_C', amount, 'Desc_OilRefinery_C'),
  ALTERNATE_HEAVY_OIL_RESIDUE: (amount: string) =>
    makeRecipe('Recipe_Alternate_HeavyOilResidue_C', amount, 'Desc_OilRefinery_C'),
  ALTERNATE_DILUTED_FUEL: (amount: string) =>
    makeRecipe('Recipe_Alternate_DilutedFuel_C', amount, BUILDINGS.BLENDER),
  ALTERNATE_PLASTIC_1: (amount: string) =>
    makeRecipe('Recipe_Alternate_Plastic_1_C', amount, 'Desc_OilRefinery_C'),
  FLUID_CANISTER: (amount: string) =>
    makeRecipe('Recipe_FluidCanister_C', amount, BUILDINGS.CONSTRUCTOR),
}

// Expected results for complex tests
const MODULAR_FRAME_EXPECTED_LINKS = [
  {
    source: 'Desc_OreIron_C',
    sink: 'Recipe_Alternate_PureIronIngot_C',
    name: 'Desc_OreIron_C',
    amount: 50.256,
  },
  {
    source: 'Desc_Water_C',
    sink: 'Recipe_Alternate_PureIronIngot_C',
    name: 'Desc_Water_C',
    amount: 28.718,
  },
  {
    source: 'Recipe_Alternate_PureIronIngot_C',
    sink: 'Recipe_Alternate_Wire_1_C',
    name: 'Desc_IronIngot_C',
    amount: 55.556,
  },
  {
    source: 'Recipe_Alternate_PureIronIngot_C',
    sink: 'Recipe_Alternate_IngotSteel_1_C',
    name: 'Desc_IronIngot_C',
    amount: 21.111,
  },
  {
    source: 'Desc_Coal_C',
    sink: 'Recipe_Alternate_IngotSteel_1_C',
    name: 'Desc_Coal_C',
    amount: 21.111,
  },
  {
    source: 'Recipe_Alternate_IngotSteel_1_C',
    sink: 'Recipe_Alternate_SteelRod_C',
    name: 'Desc_SteelIngot_C',
    amount: 15,
  },
  {
    source: 'Recipe_Alternate_PureIronIngot_C',
    sink: 'Recipe_Alternate_SteelCastedPlate_C',
    name: 'Desc_IronIngot_C',
    amount: 16.667,
  },
  {
    source: 'Recipe_Alternate_IngotSteel_1_C',
    sink: 'Recipe_Alternate_SteelCastedPlate_C',
    name: 'Desc_SteelIngot_C',
    amount: 16.667,
  },
  {
    source: 'Recipe_Alternate_SteelCastedPlate_C',
    sink: 'Recipe_Alternate_ReinforcedIronPlate_2_C',
    name: 'Desc_IronPlate_C',
    amount: 50,
  },
  {
    source: 'Recipe_Alternate_Wire_1_C',
    sink: 'Recipe_Alternate_ReinforcedIronPlate_2_C',
    name: 'Desc_Wire_C',
    amount: 100,
  },
  {
    source: 'Recipe_Alternate_ReinforcedIronPlate_2_C',
    sink: 'Recipe_ModularFrame_C',
    name: 'Desc_IronPlateReinforced_C',
    amount: 15,
  },
  {
    source: 'Recipe_Alternate_SteelRod_C',
    sink: 'Recipe_ModularFrame_C',
    name: 'Desc_IronRod_C',
    amount: 60,
  },
]

const MODULAR_FRAME_EXPECTED_BATCHES = [
  ['Recipe_Alternate_PureIronIngot_C'],
  ['Recipe_Alternate_Wire_1_C', 'Recipe_Alternate_IngotSteel_1_C'],
  ['Recipe_Alternate_SteelCastedPlate_C', 'Recipe_Alternate_SteelRod_C'],
  ['Recipe_Alternate_ReinforcedIronPlate_2_C'],
  ['Recipe_ModularFrame_C'],
]

const PLASTIC_RUBBER_EXPECTED_LINKS = [
  {
    source: 'Desc_LiquidOil_C',
    sink: 'Recipe_Alternate_HeavyOilResidue_C',
    name: 'Desc_LiquidOil_C',
    amount: 40,
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
    source: 'Recipe_Alternate_HeavyOilResidue_C',
    sink: 'Recipe_Alternate_DilutedFuel_C',
    name: 'Desc_HeavyOilResidue_C',
    amount: 53.333,
  },
  {
    source: 'Desc_Water_C',
    sink: 'Recipe_Alternate_DilutedFuel_C',
    name: 'Desc_Water_C',
    amount: 106.667,
  },
  {
    source: 'Recipe_Alternate_DilutedFuel_C',
    sink: 'Recipe_Alternate_Plastic_1_C',
    name: 'Desc_Fuel_C',
    amount: 55.555,
  },
  {
    source: 'Recipe_Alternate_DilutedFuel_C',
    sink: 'Recipe_Alternate_RecycledRubber_C',
    name: 'Desc_Fuel_C',
    amount: 51.111,
  },
  {
    source: 'Recipe_Alternate_Plastic_1_C',
    sink: 'Recipe_Alternate_RecycledRubber_C',
    name: 'Desc_Plastic_C',
    amount: 51.111,
  },
  {
    source: 'Recipe_Alternate_RecycledRubber_C',
    sink: 'Recipe_Alternate_Plastic_1_C',
    name: 'Desc_Rubber_C',
    amount: 55.5555,
  },
  {
    source: 'Recipe_Alternate_Plastic_1_C',
    sink: 'Recipe_FluidCanister_C',
    name: 'Desc_Plastic_C',
    amount: 0.16667,
  },
]

const PLASTIC_RUBBER_EXPECTED_BATCHES = [
  ['Recipe_Alternate_HeavyOilResidue_C'],
  ['Recipe_ResidualRubber_C', 'Recipe_Alternate_DilutedFuel_C'],
  ['Recipe_Alternate_Plastic_1_C', 'Recipe_Alternate_RecycledRubber_C'],
  ['Recipe_FluidCanister_C'],
]

// Helper function to test complete recipe chain processing
const testRecipeChain = (
  rawRecipes: string[],
  expectedBatches: string[][],
  expectedLinks: Material[],
  expectedProducedItems: Record<string, object[]>,
) => {
  const result = processRecipeChain(rawRecipes)

  expect(result.recipeBatches).toHaveLength(expectedBatches.length)
  expectRecipeBatchesToMatch(result.recipeBatches, expectedBatches)
  expectRecipeLinksToMatch(result.recipeLinks, expectedLinks)
  expect(result.producedItems).toEqual(expectedProducedItems)

  return result
}

// Helper function to compare recipe links with floating point tolerance for amounts (order-agnostic)
const expectRecipeLinksToMatch = (actual: Material[], expected: Material[]) => {
  expect(actual).toHaveLength(expected.length)
  console.log(`Expected ${expected.length} links, got ${actual.length} links`)

  for (const expectedLink of expected) {
    const { amount: expectedAmount, ...expectedRest } = expectedLink

    // Find a matching link in the actual results
    const matchingLink = actual.find((actualLink) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { amount, ...actualRest } = actualLink
      return JSON.stringify(actualRest) === JSON.stringify(expectedRest)
    })

    if (!matchingLink) {
      console.error('Expected link not found:', expectedLink)
      console.error('Available actual links:')
      actual.forEach((link, i) => console.error(`  ${i}:`, link))
    }

    expect(matchingLink).toBeDefined()
    expect(matchingLink.amount).toBeCloseTo(expectedAmount, 2)
  }
}

// Helper function to check recipe batch grouping
const expectRecipeBatchesToMatch = (actual: Recipe[][], expected: string[][]) => {
  expect(actual).toHaveLength(expected.length)
  console.log(`Expected ${expected.length} batches, got ${actual.length} batches`)

  for (let i = 0; i < expected.length; i++) {
    const actualBatch = actual[i]
    const expectedBatch = expected[i]

    expect(actualBatch).toHaveLength(expectedBatch.length)
    for (const recipeName of expectedBatch) {
      expect(actualBatch).toContainEqual(expect.objectContaining({ name: recipeName }))
    }
  }
}

describe('processRecipeChain integration - production chain processing', () => {
  beforeEach(() => {
    setupMockDataStore()
  })

  describe('simple production chains', () => {
    // Tests a basic 2-step production chain: Iron Ore -> Iron Ingot -> Iron Plate
    it('should handle simple production chain', () => {
      const rawRecipes = [RECIPES.IRON_INGOT('3'), RECIPES.IRON_PLATE('1')]

      const result = processRecipeChain(rawRecipes)

      expect(result.recipeBatches).toHaveLength(2)
      expectRecipeBatchesToMatch(result.recipeBatches, [
        ['Recipe_IronIngot_C'],
        ['Recipe_IronPlate_C'],
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
    it('should handle tiered production chain', () => {
      const rawRecipes = [
        RECIPES.IRON_INGOT('1'),
        RECIPES.COPPER_INGOT('4'),
        RECIPES.WIRE('2'),
        RECIPES.CABLE('1'),
      ]

      testRecipeChain(
        rawRecipes,
        [['Recipe_IronIngot_C', 'Recipe_CopperIngot_C'], ['Recipe_Wire_C'], ['Recipe_Cable_C']],
        [
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
        ],
        {
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
        },
      )
    })

    // Tests parallel production from natural resources (both recipes can run in same batch)
    it('should handle production chain with natural resources', () => {
      const rawRecipes = [RECIPES.IRON_INGOT('2'), RECIPES.CONCRETE('1')]

      testRecipeChain(
        rawRecipes,
        [['Recipe_IronIngot_C', 'Recipe_Concrete_C']],
        [
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
        ],
        {
          Desc_IronIngot_C: [
            {
              amount: 2,
              recipe: expect.objectContaining({ name: 'Recipe_IronIngot_C' }),
              isResource: false,
            },
          ],
          Desc_Concrete_C: [
            {
              amount: 1,
              recipe: expect.objectContaining({ name: 'Recipe_Concrete_C' }),
              isResource: false,
            },
          ],
        },
      )
    })

    // Tests exact quantity matching: 3 iron ingot smelters producing exactly what 1 iron plate constructor needs
    it('should handle sufficient quantity produced by another recipe', () => {
      const rawRecipes = [
        RECIPES.IRON_INGOT('3'), // Produces 3 iron ingots
        RECIPES.IRON_PLATE('1'), // Needs 3 iron ingots
      ]

      testRecipeChain(
        rawRecipes,
        [['Recipe_IronIngot_C'], ['Recipe_IronPlate_C']],
        [
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
        ],
        {
          Desc_IronPlate_C: [
            {
              amount: 2,
              recipe: expect.objectContaining({ name: 'Recipe_IronPlate_C' }),
              isResource: false,
            },
          ],
        },
      )
    })
  })

  describe('complex/codependent production chains', () => {
    // Tests aluminum refining producing multiple byproducts, one used by subsequent recipe
    it('should handle natural resources as byproducts and self-referential catalysts', () => {
      const rawRecipes = [
        RECIPES.ALUMINA_SOLUTION_RAW('2'),
        RECIPES.ALUMINA_SOLUTION('1'),
        RECIPES.PURE_CATERIUM_INGOT('1'),
      ]

      testRecipeChain(
        rawRecipes,
        [
          ['Recipe_AluminaSolutionRaw_C', 'Recipe_PureCateriumIngot_C'],
          ['Recipe_AluminaSolution_C'],
        ],
        [
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
          // then refined products including water
          {
            source: 'Desc_Water_C',
            sink: 'Recipe_PureCateriumIngot_C',
            name: 'Desc_Water_C',
            amount: 2,
          },
          {
            source: 'Recipe_AluminaSolutionRaw_C',
            sink: 'Recipe_AluminaSolution_C',
            name: 'Desc_AluminaSolution_C',
            amount: 60,
          },
          {
            source: 'Recipe_AluminaSolution_C',
            sink: 'Recipe_AluminaSolution_C',
            name: 'Desc_AluminaSolution_C',
            amount: 60,
          },
        ],
        {
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
        },
      )
    })

    it('should link modular frame production', () => {
      const rawRecipes = [
        '"Recipe_Alternate_SteelRod_C@100#Desc_ConstructorMk1_C": "1.25"',
        '"Recipe_Alternate_PureIronIngot_C@100#Desc_OilRefinery_C": "1.4359"',
        '"Recipe_ModularFrame_C@100#Desc_AssemblerMk1_C": "5"',
        '"Recipe_Alternate_SteelCastedPlate_C@100#Desc_FoundryMk1_C": "1.111111111111"',
        '"Recipe_Alternate_Wire_1_C@100#Desc_ConstructorMk1_C": "4.444444444444"',
        '"Recipe_Alternate_ReinforcedIronPlate_2_C@100#Desc_AssemblerMk1_C": "2.666666666666"',
        '"Recipe_Alternate_IngotSteel_1_C@100#Desc_FoundryMk1_C": "0.5277777777777"',
      ]

      testRecipeChain(rawRecipes, MODULAR_FRAME_EXPECTED_BATCHES, MODULAR_FRAME_EXPECTED_LINKS, {
        Desc_ModularFrame_C: [
          {
            amount: 10,
            recipe: expect.objectContaining({ name: 'Recipe_ModularFrame_C' }),
            isResource: false,
          },
        ],
      })
    })

    it('should link plastic/rubber codependent recipes', () => {
      const rawRecipes = [
        RECIPES.RESIDUAL_RUBBER('0.6666666666666'),
        RECIPES.ALTERNATE_RECYCLED_RUBBER('1.7037'),
        RECIPES.ALTERNATE_HEAVY_OIL_RESIDUE('1.333333333333'),
        RECIPES.ALTERNATE_DILUTED_FUEL('1.066666666666'),
        RECIPES.ALTERNATE_PLASTIC_1('1.85185'),
        RECIPES.FLUID_CANISTER('0.08333333333333'),
      ]

      testRecipeChain(rawRecipes, PLASTIC_RUBBER_EXPECTED_BATCHES, PLASTIC_RUBBER_EXPECTED_LINKS, {
        Desc_Plastic_C: [
          {
            amount: expect.closeTo(110.94, 2),
            recipe: expect.objectContaining({ name: 'Recipe_Alternate_Plastic_1_C' }),
            isResource: false,
          },
        ],
        Desc_Rubber_C: [
          {
            amount: expect.closeTo(13.333, 2),
            recipe: expect.objectContaining({ name: 'Recipe_ResidualRubber_C' }),
            isResource: false,
          },
          {
            amount: expect.closeTo(102.222, 2),
            recipe: expect.objectContaining({ name: 'Recipe_Alternate_RecycledRubber_C' }),
            isResource: false,
          },
        ],
        Desc_FluidCanister_C: [
          {
            amount: expect.closeTo(0.33333, 4),
            recipe: expect.objectContaining({ name: 'Recipe_FluidCanister_C' }),
            isResource: false,
          },
        ],
      })
    })
  })

  describe('error cases', () => {
    // Tests insufficient production: 1 iron ingot produced, but 6 needed for 2 iron plate recipes
    it('should handle insufficient quantity production', () => {
      const rawRecipes = [
        RECIPES.IRON_INGOT('1'), // Produces 1 iron ingot
        RECIPES.IRON_PLATE('2'), // Needs 6 iron ingots (3 each)
      ]

      expect(() => processRecipeChain(rawRecipes)).toThrow(
        'No progress made and no circular dependencies found. Missing ingredients for: Recipe_IronPlate_C',
      )
    })
  })
})
