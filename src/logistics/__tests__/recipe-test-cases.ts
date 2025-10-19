import type { Material } from '@/types/factory'
import { expect } from 'vitest'
import { RECIPES } from './recipe-input-fixtures'

// Basic test cases with simple production chains
export const BASIC_TEST_CASES = {
  // Simple 2-step chain: Iron Ore -> Iron Ingot -> Iron Plate
  SIMPLE_PRODUCTION: {
    rawRecipes: [RECIPES.IRON_INGOT('3'), RECIPES.IRON_PLATE('1')],
    expectedBatches: [['Recipe_IngotIron_C'], ['Recipe_IronPlate_C']],
    expectedLinks: [
      {
        source: 'Desc_OreIron_C',
        sink: 'Recipe_IngotIron_C',
        material: 'Desc_OreIron_C',
        amount: 90,
      },
      {
        source: 'Recipe_IngotIron_C',
        sink: 'Recipe_IronPlate_C',
        material: 'Desc_IronIngot_C',
        amount: 30,
      },
    ],
  },

  // Multi-tier with parallel base materials: Ores -> Ingots -> Wire -> Cable
  TIERED_PRODUCTION: {
    rawRecipes: [
      RECIPES.IRON_INGOT('1'),
      RECIPES.COPPER_INGOT('1'),
      RECIPES.WIRE('2'),
      RECIPES.CABLE('1'),
    ],
    expectedBatches: [
      ['Recipe_IngotIron_C', 'Recipe_IngotCopper_C'],
      ['Recipe_Wire_C'],
      ['Recipe_Cable_C'],
    ],
    expectedLinks: [
      {
        source: 'Desc_OreIron_C',
        sink: 'Recipe_IngotIron_C',
        material: 'Desc_OreIron_C',
        amount: 30,
      },
      {
        source: 'Desc_OreCopper_C',
        sink: 'Recipe_IngotCopper_C',
        material: 'Desc_OreCopper_C',
        amount: 30,
      },
      {
        source: 'Recipe_IngotCopper_C',
        sink: 'Recipe_Wire_C',
        material: 'Desc_CopperIngot_C',
        amount: 30,
      },
      {
        source: 'Recipe_Wire_C',
        sink: 'Recipe_Cable_C',
        material: 'Desc_Wire_C',
        amount: 60,
      },
    ],
    expectedProducedItems: {
      Desc_IronIngot_C: [
        {
          amount: 30,
          recipe: expect.objectContaining({ name: 'Recipe_IngotIron_C' }),
          isResource: false,
        },
      ],
      Desc_Cable_C: [
        {
          amount: 30,
          recipe: expect.objectContaining({ name: 'Recipe_Cable_C' }),
          isResource: false,
        },
      ],
    },
  },

  // Parallel production from natural resources
  NATURAL_RESOURCES: {
    rawRecipes: [RECIPES.IRON_INGOT('2'), RECIPES.CONCRETE('1')],
    expectedBatches: [['Recipe_IngotIron_C', 'Recipe_Concrete_C']],
    expectedLinks: [
      {
        source: 'Desc_OreIron_C',
        sink: 'Recipe_IngotIron_C',
        material: 'Desc_OreIron_C',
        amount: 60,
      },
      {
        source: 'Desc_Stone_C',
        sink: 'Recipe_Concrete_C',
        material: 'Desc_Stone_C',
        amount: 45,
      },
    ],
    expectedProducedItems: {
      Desc_IronIngot_C: [
        {
          amount: 60,
          recipe: expect.objectContaining({ name: 'Recipe_IngotIron_C' }),
          isResource: false,
        },
      ],
      Desc_Cement_C: [
        {
          amount: 15,
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
    expectedBatches: [['Recipe_IngotIron_C'], ['Recipe_IronPlate_C']],
    expectedLinks: [
      {
        source: 'Desc_OreIron_C',
        sink: 'Recipe_IngotIron_C',
        material: 'Desc_OreIron_C',
        amount: 90,
      },
      {
        source: 'Recipe_IngotIron_C',
        sink: 'Recipe_IronPlate_C',
        material: 'Desc_IronIngot_C',
        amount: 30,
      },
    ],
    expectedProducedItems: {
      Desc_IronPlate_C: [
        {
          amount: 20,
          recipe: expect.objectContaining({ name: 'Recipe_IronPlate_C' }),
          isResource: false,
        },
      ],
      Desc_IronIngot_C: [
        {
          amount: 60,
          recipe: expect.objectContaining({ name: 'Recipe_IngotIron_C' }),
          isResource: false,
        },
      ],
    },
  },

  // External inputs used
  EXTERNAL_INPUTS: {
    rawRecipes: [
      RECIPES.IRON_PLATE('1'), // Needs 3 iron ingots
    ],
    expectedBatches: [['Recipe_IronPlate_C']],
    expectedLinks: [
      {
        source: 'External',
        sink: 'Recipe_IronPlate_C',
        material: 'Desc_IronIngot_C',
        amount: 30,
      },
    ],
    expectedProducedItems: {
      Desc_IronPlate_C: [
        {
          amount: 20,
          recipe: expect.objectContaining({ name: 'Recipe_IronPlate_C' }),
          isResource: false,
        },
      ],
    },
    externalInputs: [
      {
        item: 'Desc_IronIngot_C',
        amount: 30,
      },
    ],
  },
}

// Complex test cases with advanced production chains
export const COMPLEX_TEST_CASES = {
  // Aluminum refining with byproducts and self-referential catalysts
  ALUMINUM_SOLUTION: {
    rawRecipes: [
      RECIPES.FAKE_ALUMINA_SOLUTION_RAW('2'),
      RECIPES.FAKE_ALUMINA_SOLUTION('1'),
      RECIPES.PURE_CATERIUM_INGOT('1'),
    ],
    expectedBatches: [
      ['Recipe_Fake_AluminaSolutionRaw_C', 'Recipe_PureCateriumIngot_C'],
      ['Recipe_Fake_AluminaSolution_C'],
    ],
    expectedLinks: [
      {
        source: 'Desc_OreBauxite_C',
        sink: 'Recipe_Fake_AluminaSolutionRaw_C',
        material: 'Desc_OreBauxite_C',
        amount: 4,
      },
      {
        source: 'Desc_OreGold_C',
        sink: 'Recipe_PureCateriumIngot_C',
        material: 'Desc_OreGold_C',
        amount: 2,
      },
      {
        source: 'Desc_Water_C',
        sink: 'Recipe_PureCateriumIngot_C',
        material: 'Desc_Water_C',
        amount: 2,
      },
      {
        source: 'Recipe_Fake_AluminaSolutionRaw_C',
        sink: 'Recipe_Fake_AluminaSolution_C',
        material: 'Desc_AluminaSolution_C',
        amount: 60,
      },
      {
        source: 'Recipe_Fake_AluminaSolution_C',
        sink: 'Recipe_Fake_AluminaSolution_C',
        material: 'Desc_AluminaSolution_C',
        amount: 60,
      },
    ] as Material[],
    expectedProducedItems: {
      Desc_GoldIngot_C: [
        {
          amount: 2,
          recipe: expect.objectContaining({ name: 'Recipe_PureCateriumIngot_C' }),
          isResource: false,
        },
      ],
      Desc_Water_C: [
        {
          amount: 120,
          recipe: expect.objectContaining({ name: 'Recipe_Fake_AluminaSolution_C' }),
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
        material: 'Desc_OreIron_C',
        amount: 50.256,
      },
      {
        source: 'Desc_Water_C',
        sink: 'Recipe_Alternate_PureIronIngot_C',
        material: 'Desc_Water_C',
        amount: 28.718,
      },
      {
        source: 'Recipe_Alternate_PureIronIngot_C',
        sink: 'Recipe_Alternate_Wire_1_C',
        material: 'Desc_IronIngot_C',
        amount: 55.556,
      },
      {
        source: 'Recipe_Alternate_PureIronIngot_C',
        sink: 'Recipe_Alternate_IngotSteel_1_C',
        material: 'Desc_IronIngot_C',
        amount: 21.111,
      },
      {
        source: 'Desc_Coal_C',
        sink: 'Recipe_Alternate_IngotSteel_1_C',
        material: 'Desc_Coal_C',
        amount: 21.111,
      },
      {
        source: 'Recipe_Alternate_IngotSteel_1_C',
        sink: 'Recipe_Alternate_SteelRod_C',
        material: 'Desc_SteelIngot_C',
        amount: 15,
      },
      {
        source: 'Recipe_Alternate_PureIronIngot_C',
        sink: 'Recipe_Alternate_SteelCastedPlate_C',
        material: 'Desc_IronIngot_C',
        amount: 16.667,
      },
      {
        source: 'Recipe_Alternate_IngotSteel_1_C',
        sink: 'Recipe_Alternate_SteelCastedPlate_C',
        material: 'Desc_SteelIngot_C',
        amount: 16.667,
      },
      {
        source: 'Recipe_Alternate_SteelCastedPlate_C',
        sink: 'Recipe_Alternate_ReinforcedIronPlate_2_C',
        material: 'Desc_IronPlate_C',
        amount: 50,
      },
      {
        source: 'Recipe_Alternate_Wire_1_C',
        sink: 'Recipe_Alternate_ReinforcedIronPlate_2_C',
        material: 'Desc_Wire_C',
        amount: 100,
      },
      {
        source: 'Recipe_Alternate_ReinforcedIronPlate_2_C',
        sink: 'Recipe_ModularFrame_C',
        material: 'Desc_IronPlateReinforced_C',
        amount: 15,
      },
      {
        source: 'Recipe_Alternate_SteelRod_C',
        sink: 'Recipe_ModularFrame_C',
        material: 'Desc_IronRod_C',
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
        material: 'Desc_LiquidOil_C',
        amount: 40,
      },
      {
        source: 'Recipe_Alternate_HeavyOilResidue_C',
        sink: 'Recipe_ResidualRubber_C',
        material: 'Desc_PolymerResin_C',
        amount: 26.6667,
      },
      {
        source: 'Desc_Water_C',
        sink: 'Recipe_ResidualRubber_C',
        material: 'Desc_Water_C',
        amount: 26.6667,
      },
      {
        source: 'Recipe_Alternate_HeavyOilResidue_C',
        sink: 'Recipe_Alternate_DilutedFuel_C',
        material: 'Desc_HeavyOilResidue_C',
        amount: 53.333,
      },
      {
        source: 'Desc_Water_C',
        sink: 'Recipe_Alternate_DilutedFuel_C',
        material: 'Desc_Water_C',
        amount: 106.667,
      },
      {
        source: 'Recipe_Alternate_DilutedFuel_C',
        sink: 'Recipe_Alternate_Plastic_1_C',
        material: 'Desc_LiquidFuel_C',
        amount: 55.555,
      },
      {
        source: 'Recipe_Alternate_DilutedFuel_C',
        sink: 'Recipe_Alternate_RecycledRubber_C',
        material: 'Desc_LiquidFuel_C',
        amount: 51.111,
      },
      {
        source: 'Recipe_Alternate_Plastic_1_C',
        sink: 'Recipe_Alternate_RecycledRubber_C',
        material: 'Desc_Plastic_C',
        amount: 51.111,
      },
      {
        source: 'Recipe_Alternate_RecycledRubber_C',
        sink: 'Recipe_Alternate_Plastic_1_C',
        material: 'Desc_Rubber_C',
        amount: 55.5555,
      },
      {
        source: 'Recipe_Alternate_Plastic_1_C',
        sink: 'Recipe_FluidCanister_C',
        material: 'Desc_Plastic_C',
        amount: 2.5,
      },
    ] as Material[],
    expectedProducedItems: {
      Desc_Plastic_C: [
        {
          amount: expect.closeTo(57.5, 2),
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
          amount: expect.closeTo(46.666, 2),
          recipe: expect.objectContaining({ name: 'Recipe_Alternate_RecycledRubber_C' }),
          isResource: false,
        },
      ],
      Desc_FluidCanister_C: [
        {
          amount: expect.closeTo(5, 4),
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
      RECIPES.ALTERNATE_PURE_CATERIUM_INGOT('3.43948'),
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
    expectedBatches: [
      // one
      [
        'Recipe_Alternate_PureIronIngot_C',
        'Recipe_Alternate_PureCopperIngot_C',
        'Recipe_Alternate_PureQuartzCrystal_C',
        'Recipe_Alternate_PureCateriumIngot_C',
        'Recipe_Alternate_WetConcrete_C',
        'Recipe_Alternate_HeavyOilResidue_C',
        'Recipe_AluminaSolution_C',
        'Recipe_SulfuricAcid_C',
      ],
      // two
      [
        'Recipe_PetroleumCoke_C',
        'Recipe_ResidualRubber_C',
        'Recipe_Alternate_DilutedFuel_C',
        'Recipe_Alternate_Wire_1_C',
        'Recipe_Alternate_SteelPipe_Iron_C',
        'Recipe_Alternate_Quickwire_C',
        'Recipe_Alternate_IngotSteel_1_C',
        'Recipe_Alternate_SteamedCopperSheet_C',
      ],
      // three
      [
        'Recipe_Alternate_Plastic_1_C',
        'Recipe_Alternate_RecycledRubber_C',
        'Recipe_Alternate_SteelRod_C',
        'Recipe_Alternate_ElectroAluminumScrap_C',
        'Recipe_Stator_C',
        'Recipe_Alternate_EncasedIndustrialBeam_C',
      ],
      // four
      [
        'Recipe_Screw_C',
        'Recipe_Alternate_CoatedIronPlate_C',
        'Recipe_Alternate_AILimiter_Plastic_C',
        'Recipe_Alternate_CircuitBoard_2_C',
        'Recipe_PureAluminumIngot_C',
      ],
      // five
      [
        'Recipe_Alternate_CopperRotor_C',
        'Recipe_Alternate_AlcladCasing_C',
        'Recipe_Alternate_ReinforcedIronPlate_2_C',
        'Recipe_NitricAcid_C',
        'Recipe_ElectromagneticControlRod_C',
        'Recipe_Alternate_Computer_1_C',
      ],
      // six
      [
        'Recipe_ModularFrame_C',
        'Recipe_Alternate_Quartz_Purified_C',
        'Recipe_Alternate_FertileUranium_C',
        'Recipe_NonFissileUranium_C',
      ],
      // seven
      [
        'Recipe_Plutonium_C',
        'Recipe_Alternate_Silica_Distilled_C',
        'Recipe_Alternate_CrystalOscillator_C',
        'Recipe_Alternate_ModularFrameHeavy_C',
      ],
      // eight
      [
        'Recipe_RadioControlUnit_C',
        'Recipe_PlutoniumCell_C',
        'Recipe_Alternate_HeatFusedFrame_C',
        'Recipe_Alternate_UraniumCell_1_C',
      ],
      // nine
      ['Recipe_PressureConversionCube_C', 'Recipe_Alternate_NuclearFuelRod_1_C'],
      ['Recipe_Alternate_PlutoniumFuelUnit_C'],
    ],
    expectedLinks: [
      // batch one
      ...[
        {
          source: 'Desc_OreIron_C',
          sink: 'Recipe_Alternate_PureIronIngot_C',
          material: 'Desc_OreIron_C',
          amount: 186.289,
        },
        {
          source: 'Desc_Water_C',
          sink: 'Recipe_Alternate_PureIronIngot_C',
          material: 'Desc_Water_C',
          amount: 106.451,
        },
        {
          source: 'Desc_OreCopper_C',
          sink: 'Recipe_Alternate_PureCopperIngot_C',
          material: 'Desc_OreCopper_C',
          amount: 96.9475,
        },
        {
          source: 'Desc_Water_C',
          sink: 'Recipe_Alternate_PureCopperIngot_C',
          material: 'Desc_Water_C',
          amount: 64.632,
        },
        {
          source: 'Desc_RawQuartz_C',
          sink: 'Recipe_Alternate_PureQuartzCrystal_C',
          material: 'Desc_RawQuartz_C',
          amount: 2.214,
        },
        {
          source: 'Desc_Water_C',
          sink: 'Recipe_Alternate_PureQuartzCrystal_C',
          material: 'Desc_Water_C',
          amount: 1.23,
        },
        {
          source: 'Desc_OreGold_C',
          sink: 'Recipe_Alternate_PureCateriumIngot_C',
          material: 'Desc_OreGold_C',
          amount: 82.548,
        },
        {
          source: 'Desc_Water_C',
          sink: 'Recipe_Alternate_PureCateriumIngot_C',
          material: 'Desc_Water_C',
          amount: 82.548,
        },
        {
          source: 'Desc_Stone_C',
          sink: 'Recipe_Alternate_WetConcrete_C',
          material: 'Desc_Stone_C',
          amount: 156,
        },
        {
          source: 'Desc_Water_C',
          sink: 'Recipe_Alternate_WetConcrete_C',
          material: 'Desc_Water_C',
          amount: 130,
        },
        {
          source: 'Desc_LiquidOil_C',
          sink: 'Recipe_Alternate_HeavyOilResidue_C',
          material: 'Desc_LiquidOil_C',
          amount: 40.089,
        },
        {
          source: 'Desc_OreBauxite_C',
          sink: 'Recipe_AluminaSolution_C',
          material: 'Desc_OreBauxite_C',
          amount: 111.2,
        },
        {
          source: 'Desc_Water_C',
          sink: 'Recipe_AluminaSolution_C',
          material: 'Desc_Water_C',
          amount: 166.8,
        },
        {
          source: 'Desc_Sulfur_C',
          sink: 'Recipe_SulfuricAcid_C',
          material: 'Desc_Sulfur_C',
          amount: 37.917,
        },
        {
          source: 'Desc_Water_C',
          sink: 'Recipe_SulfuricAcid_C',
          material: 'Desc_Water_C',
          amount: 37.917,
        },
      ],
      // batch two
      ...[
        {
          source: 'Recipe_Alternate_HeavyOilResidue_C',
          sink: 'Recipe_PetroleumCoke_C',
          material: 'Desc_HeavyOilResidue_C',
          amount: 12.356,
        },
        {
          source: 'Recipe_Alternate_HeavyOilResidue_C',
          sink: 'Recipe_ResidualRubber_C',
          material: 'Desc_PolymerResin_C',
          amount: 26.726,
        },
        {
          source: 'Desc_Water_C',
          sink: 'Recipe_ResidualRubber_C',
          material: 'Desc_Water_C',
          amount: 26.726,
        },
        {
          source: 'Recipe_Alternate_HeavyOilResidue_C',
          sink: 'Recipe_Alternate_DilutedFuel_C',
          material: 'Desc_HeavyOilResidue_C',
          amount: 41.096,
        },
        {
          source: 'Desc_Water_C',
          sink: 'Recipe_Alternate_DilutedFuel_C',
          material: 'Desc_Water_C',
          // this should be reduced by water from other recipes like aluminum scrap
          // but it is not produced yet, so cannot trust it in this solver
          amount: 82.19,
        },
        {
          source: 'Recipe_Alternate_PureIronIngot_C',
          sink: 'Recipe_Alternate_Wire_1_C',
          material: 'Desc_IronIngot_C',
          amount: 63.704,
        },
        {
          source: 'Recipe_Alternate_PureIronIngot_C',
          sink: 'Recipe_Alternate_SteelPipe_Iron_C',
          material: 'Desc_IronIngot_C',
          amount: 260,
        },
        {
          source: 'Recipe_Alternate_PureCateriumIngot_C',
          sink: 'Recipe_Alternate_Quickwire_C',
          material: 'Desc_GoldIngot_C',
          amount: 41.274,
        },
        {
          source: 'Recipe_Alternate_PureCopperIngot_C',
          sink: 'Recipe_Alternate_Quickwire_C',
          material: 'Desc_CopperIngot_C',
          amount: 206.369,
        },
        {
          source: 'Recipe_Alternate_PureIronIngot_C',
          sink: 'Recipe_Alternate_IngotSteel_1_C',
          material: 'Desc_IronIngot_C',
          amount: 7.963,
        },
        {
          source: 'Desc_Coal_C',
          sink: 'Recipe_Alternate_IngotSteel_1_C',
          material: 'Desc_Coal_C',
          amount: 7.963,
        },
        {
          source: 'Recipe_Alternate_PureCopperIngot_C',
          sink: 'Recipe_Alternate_SteamedCopperSheet_C',
          material: 'Desc_CopperIngot_C',
          amount: 14.667,
        },
        {
          source: 'Desc_Water_C',
          sink: 'Recipe_Alternate_SteamedCopperSheet_C',
          material: 'Desc_Water_C',
          amount: 14.667,
        },
      ],
      // batch three
      ...[
        {
          source: 'Recipe_Alternate_DilutedFuel_C',
          sink: 'Recipe_Alternate_Plastic_1_C',
          material: 'Desc_LiquidFuel_C',
          amount: 41.116,
        },
        {
          source: 'Recipe_Alternate_RecycledRubber_C',
          sink: 'Recipe_Alternate_Plastic_1_C',
          material: 'Desc_Rubber_C',
          amount: 41.116,
        },
        {
          source: 'Recipe_Alternate_DilutedFuel_C',
          sink: 'Recipe_Alternate_RecycledRubber_C',
          material: 'Desc_LiquidFuel_C',
          amount: 31.076,
        },
        {
          source: 'Recipe_Alternate_Plastic_1_C',
          sink: 'Recipe_Alternate_RecycledRubber_C',
          material: 'Desc_Plastic_C',
          amount: 31.076,
        },
        {
          source: 'Recipe_Alternate_IngotSteel_1_C',
          sink: 'Recipe_Alternate_SteelRod_C',
          material: 'Desc_SteelIngot_C',
          amount: 11.944,
        },
        {
          source: 'Recipe_AluminaSolution_C',
          sink: 'Recipe_Alternate_ElectroAluminumScrap_C',
          material: 'Desc_AluminaSolution_C',
          amount: 111.2,
        },
        {
          source: 'Recipe_PetroleumCoke_C',
          sink: 'Recipe_Alternate_ElectroAluminumScrap_C',
          material: 'Desc_PetroleumCoke_C',
          amount: 37.067,
        },
        {
          source: 'Recipe_Alternate_SteelPipe_Iron_C',
          sink: 'Recipe_Stator_C',
          material: 'Desc_SteelPipe_C',
          amount: 33,
        },
        {
          source: 'Recipe_Alternate_Wire_1_C',
          sink: 'Recipe_Stator_C',
          material: 'Desc_Wire_C',
          amount: 88,
        },
        {
          source: 'Recipe_Alternate_SteelPipe_Iron_C',
          sink: 'Recipe_Alternate_EncasedIndustrialBeam_C',
          material: 'Desc_SteelPipe_C',
          amount: 20,
        },
        {
          source: 'Recipe_Alternate_WetConcrete_C',
          sink: 'Recipe_Alternate_EncasedIndustrialBeam_C',
          material: 'Desc_Cement_C',
          amount: 16.667,
        },
      ],
      // batch four
      ...[
        {
          source: 'Recipe_Alternate_SteelRod_C',
          sink: 'Recipe_Screw_C',
          material: 'Desc_IronRod_C',
          amount: 31.778,
        },
        {
          source: 'Recipe_Alternate_PureIronIngot_C',
          sink: 'Recipe_Alternate_CoatedIronPlate_C',
          material: 'Desc_IronIngot_C',
          amount: 14.298,
        },
        {
          source: 'Recipe_Alternate_Plastic_1_C',
          sink: 'Recipe_Alternate_CoatedIronPlate_C',
          material: 'Desc_Plastic_C',
          amount: 2.8594,
        },
        {
          source: 'Recipe_Alternate_Quickwire_C',
          sink: 'Recipe_Alternate_AILimiter_Plastic_C',
          material: 'Desc_HighSpeedWire_C',
          amount: 158,
        },
        {
          source: 'Recipe_Alternate_Plastic_1_C',
          sink: 'Recipe_Alternate_AILimiter_Plastic_C',
          material: 'Desc_Plastic_C',
          amount: 36.867,
        },
        {
          source: 'Recipe_Alternate_Plastic_1_C',
          sink: 'Recipe_Alternate_CircuitBoard_2_C',
          material: 'Desc_Plastic_C',
          amount: 11.429,
        },
        {
          source: 'Recipe_Alternate_Quickwire_C',
          sink: 'Recipe_Alternate_CircuitBoard_2_C',
          material: 'Desc_HighSpeedWire_C',
          amount: 34.285,
        },
        {
          source: 'Recipe_Alternate_ElectroAluminumScrap_C',
          sink: 'Recipe_PureAluminumIngot_C',
          material: 'Desc_AluminumScrap_C',
          amount: 185.333,
        },
      ],
      // batch five
      ...[
        {
          source: 'Recipe_Alternate_SteamedCopperSheet_C',
          sink: 'Recipe_Alternate_CopperRotor_C',
          material: 'Desc_CopperSheet_C',
          amount: 14.667,
        },
        {
          source: 'Recipe_Screw_C',
          sink: 'Recipe_Alternate_CopperRotor_C',
          material: 'Desc_IronScrew_C',
          amount: 127.111,
        },
        {
          source: 'Recipe_PureAluminumIngot_C',
          sink: 'Recipe_Alternate_AlcladCasing_C',
          material: 'Desc_AluminumIngot_C',
          amount: 42.667,
        },
        {
          source: 'Recipe_Alternate_PureCopperIngot_C',
          sink: 'Recipe_Alternate_AlcladCasing_C',
          material: 'Desc_CopperIngot_C',
          amount: 21.333,
        },
        {
          source: 'Recipe_Alternate_CoatedIronPlate_C',
          sink: 'Recipe_Alternate_ReinforcedIronPlate_2_C',
          material: 'Desc_IronPlate_C',
          amount: 13.333,
        },
        {
          source: 'Recipe_Alternate_Wire_1_C',
          sink: 'Recipe_Alternate_ReinforcedIronPlate_2_C',
          material: 'Desc_Wire_C',
          amount: 26.667,
        },
        {
          source: 'Desc_NitrogenGas_C',
          sink: 'Recipe_NitricAcid_C',
          material: 'Desc_NitrogenGas_C',
          amount: 183.148,
        },
        {
          source: 'Recipe_Alternate_ElectroAluminumScrap_C',
          sink: 'Recipe_NitricAcid_C',
          material: 'Desc_Water_C',
          amount: 45.787,
        },
        {
          source: 'Recipe_Alternate_CoatedIronPlate_C',
          sink: 'Recipe_NitricAcid_C',
          material: 'Desc_IronPlate_C',
          amount: 15.262,
        },
        {
          source: 'Recipe_Stator_C',
          sink: 'Recipe_ElectromagneticControlRod_C',
          material: 'Desc_Stator_C',
          amount: 11,
        },
        {
          source: 'Recipe_Alternate_AILimiter_Plastic_C',
          sink: 'Recipe_ElectromagneticControlRod_C',
          material: 'Desc_CircuitBoardHighSpeed_C',
          amount: 7.333,
        },
        {
          source: 'Recipe_Alternate_CircuitBoard_2_C',
          sink: 'Recipe_Alternate_Computer_1_C',
          material: 'Desc_CircuitBoard_C',
          amount: 8,
        },
        {
          source: 'Recipe_Alternate_Quickwire_C',
          sink: 'Recipe_Alternate_Computer_1_C',
          material: 'Desc_HighSpeedWire_C',
          amount: 28,
        },
        {
          source: 'Recipe_ResidualRubber_C',
          sink: 'Recipe_Alternate_Computer_1_C',
          material: 'Desc_Rubber_C',
          amount: 12,
        },
      ],
      // batch six
      ...[
        {
          source: 'Recipe_Alternate_ReinforcedIronPlate_2_C',
          sink: 'Recipe_ModularFrame_C',
          material: 'Desc_IronPlateReinforced_C',
          amount: 4,
        },
        {
          source: 'Recipe_Alternate_SteelRod_C',
          sink: 'Recipe_ModularFrame_C',
          material: 'Desc_IronRod_C',
          amount: 16,
        },
        {
          source: 'Desc_RawQuartz_C',
          sink: 'Recipe_Alternate_Quartz_Purified_C',
          material: 'Desc_RawQuartz_C',
          amount: 48.444,
        },
        {
          source: 'Recipe_NitricAcid_C',
          sink: 'Recipe_Alternate_Quartz_Purified_C',
          material: 'Desc_NitricAcid_C',
          amount: 4.037,
        },
        {
          source: 'Desc_OreUranium_C',
          sink: 'Recipe_Alternate_FertileUranium_C',
          material: 'Desc_OreUranium_C',
          amount: 10.417,
        },
        {
          source: 'Desc_NuclearWaste_C',
          sink: 'Recipe_Alternate_FertileUranium_C',
          material: 'Desc_NuclearWaste_C',
          amount: 10.417,
        },
        {
          source: 'Recipe_NitricAcid_C',
          sink: 'Recipe_Alternate_FertileUranium_C',
          material: 'Desc_NitricAcid_C',
          amount: 6.25,
        },
        {
          source: 'Recipe_SulfuricAcid_C',
          sink: 'Recipe_Alternate_FertileUranium_C',
          material: 'Desc_SulfuricAcid_C',
          amount: 10.417,
        },
        {
          source: 'Desc_NuclearWaste_C',
          sink: 'Recipe_NonFissileUranium_C',
          material: 'Desc_NuclearWaste_C',
          amount: 68.75,
        },
        {
          source: 'Recipe_AluminaSolution_C',
          sink: 'Recipe_NonFissileUranium_C',
          material: 'Desc_Silica_C',
          amount: 45.833,
        },
        {
          source: 'Recipe_NitricAcid_C',
          sink: 'Recipe_NonFissileUranium_C',
          material: 'Desc_NitricAcid_C',
          amount: 27.5,
        },
        {
          source: 'Recipe_SulfuricAcid_C',
          sink: 'Recipe_NonFissileUranium_C',
          material: 'Desc_SulfuricAcid_C',
          amount: 27.5,
        },
      ],
      // batch seven
      ...[
        {
          source: 'Recipe_Alternate_FertileUranium_C',
          sink: 'Recipe_Plutonium_C',
          material: 'Desc_NonFissibleUranium_C',
          amount: 41.667,
        },
        {
          source: 'Recipe_NonFissileUranium_C',
          sink: 'Recipe_Plutonium_C',
          material: 'Desc_NonFissibleUranium_C',
          amount: 91.667,
        },
        {
          source: 'Desc_NuclearWaste_C',
          sink: 'Recipe_Plutonium_C',
          material: 'Desc_NuclearWaste_C',
          amount: 33.333,
        },
        {
          source: 'Recipe_Alternate_Quartz_Purified_C',
          sink: 'Recipe_Alternate_Silica_Distilled_C',
          material: 'Desc_DissolvedSilica_C',
          amount: 24.222,
        },
        {
          source: 'Desc_Stone_C',
          sink: 'Recipe_Alternate_Silica_Distilled_C',
          material: 'Desc_Stone_C',
          amount: 10.093,
        },
        {
          source: 'Recipe_Alternate_Silica_Distilled_C',
          sink: 'Recipe_Alternate_Silica_Distilled_C',
          material: 'Desc_Water_C',
          amount: 16.15,
        },
        {
          source: 'Recipe_Alternate_FertileUranium_C',
          sink: 'Recipe_Alternate_Silica_Distilled_C',
          material: 'Desc_Water_C',
          amount: 4.037,
        },
        {
          source: 'Recipe_Alternate_Quartz_Purified_C',
          sink: 'Recipe_Alternate_CrystalOscillator_C',
          material: 'Desc_QuartzCrystal_C',
          amount: 30.278,
        },
        {
          source: 'Recipe_Alternate_PureQuartzCrystal_C',
          sink: 'Recipe_Alternate_CrystalOscillator_C',
          material: 'Desc_QuartzCrystal_C',
          amount: 1.722,
        },
        {
          source: 'Recipe_Alternate_RecycledRubber_C',
          sink: 'Recipe_Alternate_CrystalOscillator_C',
          material: 'Desc_Rubber_C',
          amount: 21.04,
        },
        {
          source: 'Recipe_ResidualRubber_C',
          sink: 'Recipe_Alternate_CrystalOscillator_C',
          material: 'Desc_Rubber_C',
          amount: 1.36,
        },
        {
          source: 'Recipe_Alternate_AILimiter_Plastic_C',
          sink: 'Recipe_Alternate_CrystalOscillator_C',
          material: 'Desc_CircuitBoardHighSpeed_C',
          amount: 3.2,
        },
        {
          source: 'Recipe_ModularFrame_C',
          sink: 'Recipe_Alternate_ModularFrameHeavy_C',
          material: 'Desc_ModularFrame_C',
          amount: 2.667,
        },
        {
          source: 'Recipe_Alternate_EncasedIndustrialBeam_C',
          sink: 'Recipe_Alternate_ModularFrameHeavy_C',
          material: 'Desc_SteelPlateReinforced_C',
          amount: 3.333,
        },
        {
          source: 'Recipe_Alternate_SteelPipe_Iron_C',
          sink: 'Recipe_Alternate_ModularFrameHeavy_C',
          material: 'Desc_SteelPipe_C',
          amount: 12,
        },
        {
          source: 'Recipe_Alternate_WetConcrete_C',
          sink: 'Recipe_Alternate_ModularFrameHeavy_C',
          material: 'Desc_Cement_C',
          amount: 7.333,
        },
      ],
      // batch eight
      ...[
        {
          source: 'Recipe_Alternate_AlcladCasing_C',
          sink: 'Recipe_RadioControlUnit_C',
          material: 'Desc_AluminumCasing_C',
          amount: 32,
        },
        {
          source: 'Recipe_Alternate_CrystalOscillator_C',
          sink: 'Recipe_RadioControlUnit_C',
          material: 'Desc_CrystalOscillator_C',
          amount: 1,
        },
        {
          source: 'Recipe_Alternate_Computer_1_C',
          sink: 'Recipe_RadioControlUnit_C',
          material: 'Desc_Computer_C',
          amount: 2,
        },
        {
          source: 'Recipe_Plutonium_C',
          sink: 'Recipe_PlutoniumCell_C',
          material: 'Desc_PlutoniumPellet_C',
          amount: 40,
        },
        {
          source: 'Recipe_Alternate_WetConcrete_C',
          sink: 'Recipe_PlutoniumCell_C',
          material: 'Desc_Cement_C',
          amount: 80,
        },
        {
          source: 'Recipe_Alternate_ModularFrameHeavy_C',
          sink: 'Recipe_Alternate_HeatFusedFrame_C',
          material: 'Desc_ModularFrameHeavy_C',
          amount: 1,
        },
        {
          source: 'Recipe_PureAluminumIngot_C',
          sink: 'Recipe_Alternate_HeatFusedFrame_C',
          material: 'Desc_AluminumIngot_C',
          amount: 50,
        },
        {
          source: 'Recipe_NitricAcid_C',
          sink: 'Recipe_Alternate_HeatFusedFrame_C',
          material: 'Desc_NitricAcid_C',
          amount: 8,
        },
        {
          source: 'Recipe_Alternate_DilutedFuel_C',
          sink: 'Recipe_Alternate_HeatFusedFrame_C',
          material: 'Desc_LiquidFuel_C',
          amount: 10,
        },
        {
          source: 'Desc_OreUranium_C',
          sink: 'Recipe_Alternate_UraniumCell_1_C',
          material: 'Desc_OreUranium_C',
          amount: 91.667,
        },
        {
          source: 'Recipe_AluminaSolution_C',
          sink: 'Recipe_Alternate_UraniumCell_1_C',
          material: 'Desc_Silica_C',
          amount: 0.5,
        },
        {
          source: 'Recipe_Alternate_Silica_Distilled_C',
          sink: 'Recipe_Alternate_UraniumCell_1_C',
          material: 'Desc_Silica_C',
          amount: 54.5,
        },
        {
          source: 'Desc_Sulfur_C',
          sink: 'Recipe_Alternate_UraniumCell_1_C',
          material: 'Desc_Sulfur_C',
          amount: 91.667,
        },
        {
          source: 'Recipe_Alternate_Quickwire_C',
          sink: 'Recipe_Alternate_UraniumCell_1_C',
          material: 'Desc_HighSpeedWire_C',
          amount: 275,
        },
      ],
      // batch nine
      ...[
        {
          source: 'Recipe_Alternate_HeatFusedFrame_C',
          sink: 'Recipe_PressureConversionCube_C',
          material: 'Desc_ModularFrameFused_C',
          amount: 1,
        },
        {
          source: 'Recipe_RadioControlUnit_C',
          sink: 'Recipe_PressureConversionCube_C',
          material: 'Desc_ModularFrameLightweight_C',
          amount: 2,
        },
        {
          source: 'Recipe_Alternate_UraniumCell_1_C',
          sink: 'Recipe_Alternate_NuclearFuelRod_1_C',
          material: 'Desc_UraniumCell_C',
          amount: 73.333,
        },
        {
          source: 'Recipe_ElectromagneticControlRod_C',
          sink: 'Recipe_Alternate_NuclearFuelRod_1_C',
          material: 'Desc_ElectromagneticControlRod_C',
          amount: 7.333,
        },
        {
          source: 'Recipe_Alternate_CrystalOscillator_C',
          sink: 'Recipe_Alternate_NuclearFuelRod_1_C',
          material: 'Desc_CrystalOscillator_C',
          amount: 2.2,
        },
        {
          source: 'Recipe_Alternate_CopperRotor_C',
          sink: 'Recipe_Alternate_NuclearFuelRod_1_C',
          material: 'Desc_Rotor_C',
          amount: 7.333,
        },
      ],
      // batch ten
      ...[
        {
          source: 'Recipe_PlutoniumCell_C',
          sink: 'Recipe_Alternate_PlutoniumFuelUnit_C',
          material: 'Desc_PlutoniumCell_C',
          amount: 20,
        },
        {
          source: 'Recipe_PressureConversionCube_C',
          sink: 'Recipe_Alternate_PlutoniumFuelUnit_C',
          material: 'Desc_PressureConversionCube_C',
          amount: 1,
        },
      ],
    ],
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
      // technically, this should not be produced as it would be fully consumed by earlier recipes
      // however, to avoid having to backtrack, simply allow excess water to be produced
      Desc_Water_C: [
        {
          amount: expect.closeTo(19.08, 2),
          recipe: expect.objectContaining({ name: 'Recipe_Alternate_ElectroAluminumScrap_C' }),
          isResource: false,
        },
        {
          amount: expect.closeTo(27.5, 2),
          recipe: expect.objectContaining({ name: 'Recipe_NonFissileUranium_C' }),
          isResource: false,
        },
        {
          amount: expect.closeTo(12.63, 2),
          recipe: expect.objectContaining({ name: 'Recipe_Alternate_FertileUranium_C' }),
          isResource: false,
        },
      ],
    },
  },
}
