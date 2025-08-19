import { expect } from 'vitest'
import type { Material } from '@/types/factory'
import { RECIPES } from './recipe-input-fixtures'

// Basic test cases with simple production chains
export const BASIC_TEST_CASES = {
  // Simple 2-step chain: Iron Ore -> Iron Ingot -> Iron Plate
  SIMPLE_PRODUCTION: {
    rawRecipes: [RECIPES.IRON_INGOT('3'), RECIPES.IRON_PLATE('1')],
    expectedBatches: [['Recipe_IronIngot_C'], ['Recipe_IronPlate_C']],
    expectedLinks: [
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
  },

  // Multi-tier with parallel base materials: Ores -> Ingots -> Wire -> Cable
  TIERED_PRODUCTION: {
    rawRecipes: [
      RECIPES.IRON_INGOT('1'),
      RECIPES.COPPER_INGOT('4'),
      RECIPES.WIRE('2'),
      RECIPES.CABLE('1'),
    ],
    expectedBatches: [
      ['Recipe_IronIngot_C', 'Recipe_CopperIngot_C'],
      ['Recipe_Wire_C'],
      ['Recipe_Cable_C'],
    ],
    expectedLinks: [
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
    expectedProducedItems: {
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
  },

  // Parallel production from natural resources
  NATURAL_RESOURCES: {
    rawRecipes: [RECIPES.IRON_INGOT('2'), RECIPES.CONCRETE('1')],
    expectedBatches: [['Recipe_IronIngot_C', 'Recipe_Concrete_C']],
    expectedLinks: [
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
    expectedProducedItems: {
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
  },

  // Exact quantity matching
  SUFFICIENT_QUANTITY: {
    rawRecipes: [
      RECIPES.IRON_INGOT('3'), // Produces 3 iron ingots
      RECIPES.IRON_PLATE('1'), // Needs 3 iron ingots
    ],
    expectedBatches: [['Recipe_IronIngot_C'], ['Recipe_IronPlate_C']],
    expectedLinks: [
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
    expectedProducedItems: {
      Desc_IronPlate_C: [
        {
          amount: 2,
          recipe: expect.objectContaining({ name: 'Recipe_IronPlate_C' }),
          isResource: false,
        },
      ],
    },
  },
}

// Complex test cases with advanced production chains
export const COMPLEX_TEST_CASES = {
  // Aluminum refining with byproducts and self-referential catalysts
  ALUMINUM_SOLUTION: {
    rawRecipes: [
      RECIPES.ALUMINA_SOLUTION_RAW('2'),
      RECIPES.ALUMINA_SOLUTION('1'),
      RECIPES.PURE_CATERIUM_INGOT('1'),
    ],
    expectedBatches: [
      ['Recipe_AluminaSolutionRaw_C', 'Recipe_PureCateriumIngot_C'],
      ['Recipe_AluminaSolution_C'],
    ],
    expectedLinks: [
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
    ] as Material[],
    expectedProducedItems: {
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
  },

  // Modular frame production with complex dependencies
  MODULAR_FRAME: {
    rawRecipes: [
      '"Recipe_Alternate_SteelRod_C@100#Desc_ConstructorMk1_C": "1.25"',
      '"Recipe_Alternate_PureIronIngot_C@100#Desc_OilRefinery_C": "1.4359"',
      '"Recipe_ModularFrame_C@100#Desc_AssemblerMk1_C": "5"',
      '"Recipe_Alternate_SteelCastedPlate_C@100#Desc_FoundryMk1_C": "1.111111111111"',
      '"Recipe_Alternate_Wire_1_C@100#Desc_ConstructorMk1_C": "4.444444444444"',
      '"Recipe_Alternate_ReinforcedIronPlate_2_C@100#Desc_AssemblerMk1_C": "2.666666666666"',
      '"Recipe_Alternate_IngotSteel_1_C@100#Desc_FoundryMk1_C": "0.5277777777777"',
    ],
    expectedBatches: [
      ['Recipe_Alternate_PureIronIngot_C'],
      ['Recipe_Alternate_Wire_1_C', 'Recipe_Alternate_IngotSteel_1_C'],
      ['Recipe_Alternate_SteelCastedPlate_C', 'Recipe_Alternate_SteelRod_C'],
      ['Recipe_Alternate_ReinforcedIronPlate_2_C'],
      ['Recipe_ModularFrame_C'],
    ],
    expectedLinks: [
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
    ] as Material[],
    expectedProducedItems: {
      Desc_ModularFrame_C: [
        {
          amount: 10,
          recipe: expect.objectContaining({ name: 'Recipe_ModularFrame_C' }),
          isResource: false,
        },
      ],
    },
  },

  // Plastic/rubber codependent recipes with circular dependencies
  PLASTIC_RUBBER: {
    rawRecipes: [
      RECIPES.RESIDUAL_RUBBER('0.6666666666666'),
      RECIPES.ALTERNATE_RECYCLED_RUBBER('1.7037'),
      RECIPES.ALTERNATE_HEAVY_OIL_RESIDUE('1.333333333333'),
      RECIPES.ALTERNATE_DILUTED_FUEL('1.066666666666'),
      RECIPES.ALTERNATE_PLASTIC_1('1.85185'),
      RECIPES.FLUID_CANISTER('0.08333333333333'),
    ],
    expectedBatches: [
      ['Recipe_Alternate_HeavyOilResidue_C'],
      ['Recipe_ResidualRubber_C', 'Recipe_Alternate_DilutedFuel_C'],
      ['Recipe_Alternate_Plastic_1_C', 'Recipe_Alternate_RecycledRubber_C'],
      ['Recipe_FluidCanister_C'],
    ],
    expectedLinks: [
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
    ] as Material[],
    expectedProducedItems: {
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
    },
  },

  // Extremely complex plutonium production chain
  PLUTONIUM_CELL: {
    rawRecipes: [
      RECIPES.PETROLEUM_COKE('0.3088888888888'),
      RECIPES.RESIDUAL_RUBBER('0.668144'),
      RECIPES.ALTERNATE_WET_CONCRETE('1.3'),
      RECIPES.ALTERNATE_STEEL_ROD('0.99537'),
      RECIPES.ALTERNATE_STEAMED_COPPER_SHEET('0.651852'),
      RECIPES.ALTERNATE_RECYCLED_RUBBER('1.03588'),
      RECIPES.ALTERNATE_PURE_QUARTZ_CRYSTAL('0.0328042'),
      RECIPES.ALTERNATE_PURE_IRON_INGOT('5.32253'),
      RECIPES.ALTERNATE_PURE_COPPER_INGOT('6.46317'),
      RECIPES.PURE_CATERIUM_INGOT('3.43948'),
      RECIPES.PURE_ALUMINUM_INGOT('3.088888888888'),
      RECIPES.ALUMINA_SOLUTION('0.9266666666666'),
      RECIPES.STATOR('2.2'),
      RECIPES.ALTERNATE_HEAVY_OIL_RESIDUE('1.33629'),
      RECIPES.ALTERNATE_ELECTRO_ALUMINUM_SCRAP('0.6177777777777'),
      RECIPES.ALTERNATE_COPPER_ROTOR('0.651852'),
      RECIPES.MODULAR_FRAME('1.333333333333'),
      RECIPES.ALTERNATE_COATED_IRON_PLATE('0.381276'),
      RECIPES.PLUTONIUM_CELL('4'),
      RECIPES.PRESSURE_CONVERSION_CUBE('1'),
      RECIPES.NITRIC_ACID('1.52623'),
      RECIPES.NON_FISSILE_URANIUM('1.833333333333'),
      RECIPES.PLUTONIUM('1.333333333333'),
      RECIPES.RADIO_CONTROL_UNIT('0.8'),
      RECIPES.SULFURIC_ACID('0.7583333333333'),
      RECIPES.ELECTROMAGNETIC_CONTROL_ROD('1.833333333333'),
      RECIPES.ALTERNATE_PLUTONIUM_FUEL_UNIT('2'),
      RECIPES.ALTERNATE_HEAT_FUSED_FRAME('0.3333333333333'),
      RECIPES.ALTERNATE_FERTILE_URANIUM('0.4166666666666'),
      RECIPES.ALTERNATE_DILUTED_FUEL('0.821919'),
      RECIPES.ALTERNATE_ALCLAD_CASING('0.2844444444444'),
      RECIPES.ALTERNATE_STEEL_PIPE_IRON('2.6'),
      RECIPES.ALTERNATE_AI_LIMITER_PLASTIC('1.316666666666'),
      RECIPES.ALTERNATE_SILICA_DISTILLED('0.201852'),
      RECIPES.ALTERNATE_QUARTZ_PURIFIED('0.403704'),
      RECIPES.ALTERNATE_WIRE_1('5.0963'),
      RECIPES.ALTERNATE_URANIUM_CELL_1('3.666666666666'),
      RECIPES.ALTERNATE_ENCASED_INDUSTRIAL_BEAM('0.8333333333333'),
      RECIPES.ALTERNATE_REINFORCED_IRON_PLATE_2('0.7111111111111'),
      RECIPES.ALTERNATE_QUICKWIRE('5.50317'),
      RECIPES.ALTERNATE_PLASTIC_1('1.37052'),
      RECIPES.ALTERNATE_NUCLEAR_FUEL_ROD_1('3.666666666666'),
      RECIPES.ALTERNATE_INGOT_STEEL_1('0.199074'),
      RECIPES.ALTERNATE_MODULAR_FRAME_HEAVY('0.3555555555555'),
      RECIPES.ALTERNATE_CRYSTAL_OSCILLATOR('1.706666666666'),
      RECIPES.ALTERNATE_COMPUTER_1('0.5333333333333'),
      RECIPES.ALTERNATE_CIRCUIT_BOARD_2('0.914286'),
      RECIPES.SCREW('3.177777777777'),
    ],
    expectedBatches: [],
    expectedLinks: [],
    expectedProducedItems: {
      Desc_PlutoniumFuelRod_C: [
        {
          amount: expect.closeTo(1, 2),
          recipe: expect.objectContaining({ name: 'Recipe_Alternate_PlutoniumFuelUnit_C' }),
          isResource: false,
        },
      ],
      Desc_NuclearFuelRod_C: [
        {
          amount: expect.closeTo(2.2, 2),
          recipe: expect.objectContaining({ name: 'Recipe_Alternate_NuclearFuelRod_1_C' }),
          isResource: false,
        },
      ],
    },
  },
}
