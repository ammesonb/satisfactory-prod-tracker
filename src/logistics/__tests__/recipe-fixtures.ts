import { vi } from 'vitest'
import { useDataStore } from '@/stores/data'

// Recipe data structures for test scenarios
interface RecipeData {
  name: string
  ingredients: Array<{ item: string; amount: number }>
  products: Array<{ item: string; amount: number }>
}

// Comprehensive recipe database for testing
export const recipeDatabase: Record<string, RecipeData> = {
  Recipe_Fake_IronIngot_C: {
    name: 'Recipe_Fake_IronIngot_C',
    ingredients: [{ item: 'Desc_OreIron_C', amount: 1 }],
    products: [{ item: 'Desc_IronIngot_C', amount: 1 }],
  },
  Recipe_Fake_CopperIngot_C: {
    name: 'Recipe_Fake_CopperIngot_C',
    ingredients: [{ item: 'Desc_OreCopper_C', amount: 1 }],
    products: [{ item: 'Desc_CopperIngot_C', amount: 1 }],
  },

  Recipe_Fake_AluminaSolutionRaw_C: {
    name: 'Recipe_AluminaSolutionRaw_C',
    ingredients: [{ item: 'Desc_OreBauxite_C', amount: 2 }],
    products: [{ item: 'Desc_AluminaSolution_C', amount: 30 }],
  },
  Recipe_Fake_AluminaSolution_C: {
    name: 'Recipe_AluminaSolution_C',
    ingredients: [{ item: 'Desc_AluminaSolution_C', amount: 120 }],
    products: [
      { item: 'Desc_AluminaSolution_C', amount: 60 },
      { item: 'Desc_Water_C', amount: 120 },
    ],
  },

  Recipe_PureCateriumIngot_C: {
    name: 'Recipe_PureCateriumIngot_C',
    ingredients: [
      { item: 'Desc_OreGold_C', amount: 2 },
      { item: 'Desc_Water_C', amount: 2 },
    ],
    products: [{ item: 'Desc_GoldIngot_C', amount: 2 }],
  },
  // Fake recycled rubber and plastic recipes
  Recipe_Fake_RecycledRubber_C: {
    name: 'Recipe_RecycledRubber_C',
    ingredients: [
      { item: 'Desc_Plastic_C', amount: 30 },
      { item: 'Desc_Fuel_C', amount: 30 },
    ],
    products: [{ item: 'Desc_Rubber_C', amount: 60 }],
  },
  Recipe_Fake_RecycledPlastic_C: {
    name: 'Recipe_RecycledPlastic_C',
    ingredients: [
      { item: 'Desc_Rubber_C', amount: 30 },
      { item: 'Desc_Fuel_C', amount: 30 },
    ],
    products: [{ item: 'Desc_Plastic_C', amount: 60 }],
  },

  Recipe_IronPlate_C: {
    name: 'Iron Plate',
    ingredients: [
      {
        item: 'Desc_IronIngot_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_IronPlate_C',
        amount: 20,
      },
    ],
  },
  Recipe_IronRod_C: {
    name: 'Iron Rod',
    ingredients: [
      {
        item: 'Desc_IronIngot_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_IronRod_C',
        amount: 15,
      },
    ],
  },
  Recipe_XenoZapper_C: {
    name: 'Xeno-Zapper',
    ingredients: [
      {
        item: 'Desc_IronRod_C',
        amount: 15,
      },
      {
        item: 'Desc_IronPlateReinforced_C',
        amount: 3,
      },
      {
        item: 'Desc_Cable_C',
        amount: 22.5,
      },
      {
        item: 'Desc_Wire_C',
        amount: 75,
      },
    ],
    products: [
      {
        item: 'BP_EquipmentDescriptorShockShank_C',
        amount: 1.5,
      },
    ],
  },
  Recipe_IngotIron_C: {
    name: 'Iron Ingot',
    ingredients: [
      {
        item: 'Desc_OreIron_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_IronIngot_C',
        amount: 30,
      },
    ],
  },
  Recipe_Alternate_RocketFuel_Nitro_C: {
    name: 'Alternate: Nitro Rocket Fuel',
    ingredients: [
      {
        item: 'Desc_LiquidFuel_C',
        amount: 100,
      },
      {
        item: 'Desc_NitrogenGas_C',
        amount: 75,
      },
      {
        item: 'Desc_Sulfur_C',
        amount: 100,
      },
      {
        item: 'Desc_Coal_C',
        amount: 50,
      },
    ],
    products: [
      {
        item: 'Desc_RocketFuel_C',
        amount: 150,
      },
      {
        item: 'Desc_CompactedCoal_C',
        amount: 25,
      },
    ],
  },
  Recipe_RocketFuel_C: {
    name: 'Rocket Fuel',
    ingredients: [
      {
        item: 'Desc_LiquidTurboFuel_C',
        amount: 60,
      },
      {
        item: 'Desc_NitricAcid_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_RocketFuel_C',
        amount: 100,
      },
      {
        item: 'Desc_CompactedCoal_C',
        amount: 10,
      },
    ],
  },
  Recipe_PackagedRocketFuel_C: {
    name: 'Packaged Rocket Fuel',
    ingredients: [
      {
        item: 'Desc_RocketFuel_C',
        amount: 120,
      },
      {
        item: 'Desc_GasTank_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_PackagedRocketFuel_C',
        amount: 60,
      },
    ],
  },
  Recipe_UnpackageRocketFuel_C: {
    name: 'Unpackage Rocket Fuel',
    ingredients: [
      {
        item: 'Desc_PackagedRocketFuel_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_RocketFuel_C',
        amount: 120,
      },
      {
        item: 'Desc_GasTank_C',
        amount: 60,
      },
    ],
  },
  Recipe_Alternate_IonizedFuel_Dark_C: {
    name: 'Alternate: Dark-Ion Fuel',
    ingredients: [
      {
        item: 'Desc_PackagedRocketFuel_C',
        amount: 240,
      },
      {
        item: 'Desc_DarkMatter_C',
        amount: 80,
      },
    ],
    products: [
      {
        item: 'Desc_IonizedFuel_C',
        amount: 200,
      },
      {
        item: 'Desc_CompactedCoal_C',
        amount: 40,
      },
    ],
  },
  Recipe_DarkEnergy_C: {
    name: 'Dark Matter Residue',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 50,
      },
    ],
    products: [
      {
        item: 'Desc_DarkEnergy_C',
        amount: 100,
      },
    ],
  },
  Recipe_QuantumEnergy_C: {
    name: 'Excited Photonic Matter',
    ingredients: [],
    products: [
      {
        item: 'Desc_QuantumEnergy_C',
        amount: 200,
      },
    ],
  },
  Recipe_DarkMatter_C: {
    name: 'Dark Matter Crystal',
    ingredients: [
      {
        item: 'Desc_Diamond_C',
        amount: 30,
      },
      {
        item: 'Desc_DarkEnergy_C',
        amount: 150,
      },
    ],
    products: [
      {
        item: 'Desc_DarkMatter_C',
        amount: 30,
      },
    ],
  },
  Recipe_SuperpositionOscillator_C: {
    name: 'Superposition Oscillator',
    ingredients: [
      {
        item: 'Desc_DarkMatter_C',
        amount: 30,
      },
      {
        item: 'Desc_CrystalOscillator_C',
        amount: 5,
      },
      {
        item: 'Desc_AluminumPlate_C',
        amount: 45,
      },
      {
        item: 'Desc_QuantumEnergy_C',
        amount: 125,
      },
    ],
    products: [
      {
        item: 'Desc_QuantumOscillator_C',
        amount: 5,
      },
      {
        item: 'Desc_DarkEnergy_C',
        amount: 125,
      },
    ],
  },
  Recipe_TemporalProcessor_C: {
    name: 'Neural-Quantum Processor',
    ingredients: [
      {
        item: 'Desc_TimeCrystal_C',
        amount: 15,
      },
      {
        item: 'Desc_ComputerSuper_C',
        amount: 3,
      },
      {
        item: 'Desc_FicsiteMesh_C',
        amount: 45,
      },
      {
        item: 'Desc_QuantumEnergy_C',
        amount: 75,
      },
    ],
    products: [
      {
        item: 'Desc_TemporalProcessor_C',
        amount: 3,
      },
      {
        item: 'Desc_DarkEnergy_C',
        amount: 75,
      },
    ],
  },
  Recipe_SpaceElevatorPart_12_C: {
    name: 'AI Expansion Server',
    ingredients: [
      {
        item: 'Desc_SpaceElevatorPart_6_C',
        amount: 4,
      },
      {
        item: 'Desc_TemporalProcessor_C',
        amount: 4,
      },
      {
        item: 'Desc_QuantumOscillator_C',
        amount: 4,
      },
      {
        item: 'Desc_QuantumEnergy_C',
        amount: 100,
      },
    ],
    products: [
      {
        item: 'Desc_SpaceElevatorPart_12_C',
        amount: 4,
      },
      {
        item: 'Desc_DarkEnergy_C',
        amount: 100,
      },
    ],
  },
  Recipe_IonizedFuel_C: {
    name: 'Ionized Fuel',
    ingredients: [
      {
        item: 'Desc_RocketFuel_C',
        amount: 40,
      },
      {
        item: 'Desc_CrystalShard_C',
        amount: 2.5,
      },
    ],
    products: [
      {
        item: 'Desc_IonizedFuel_C',
        amount: 40,
      },
      {
        item: 'Desc_CompactedCoal_C',
        amount: 5,
      },
    ],
  },
  Recipe_PackagedIonizedFuel_C: {
    name: 'Packaged Ionized Fuel',
    ingredients: [
      {
        item: 'Desc_IonizedFuel_C',
        amount: 80,
      },
      {
        item: 'Desc_GasTank_C',
        amount: 40,
      },
    ],
    products: [
      {
        item: 'Desc_PackagedIonizedFuel_C',
        amount: 40,
      },
    ],
  },
  Recipe_UnpackageIonizedFuel_C: {
    name: 'Unpackage Ionized Fuel',
    ingredients: [
      {
        item: 'Desc_PackagedIonizedFuel_C',
        amount: 40,
      },
    ],
    products: [
      {
        item: 'Desc_IonizedFuel_C',
        amount: 80,
      },
      {
        item: 'Desc_GasTank_C',
        amount: 40,
      },
    ],
  },
  Recipe_Alternate_Diamond_Turbo_C: {
    name: 'Alternate: Turbo Diamonds',
    ingredients: [
      {
        item: 'Desc_Coal_C',
        amount: 600,
      },
      {
        item: 'Desc_TurboFuel_C',
        amount: 40,
      },
    ],
    products: [
      {
        item: 'Desc_Diamond_C',
        amount: 60,
      },
    ],
  },
  Recipe_SAMFluctuator_C: {
    name: 'SAM Fluctuator',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 60,
      },
      {
        item: 'Desc_Wire_C',
        amount: 50,
      },
      {
        item: 'Desc_SteelPipe_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_SAMFluctuator_C',
        amount: 10,
      },
    ],
  },
  Recipe_FicsiteMesh_C: {
    name: 'Ficsite Trigon',
    ingredients: [
      {
        item: 'Desc_FicsiteIngot_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_FicsiteMesh_C',
        amount: 30,
      },
    ],
  },
  Recipe_FicsiteIngot_Iron_C: {
    name: 'Ficsite Ingot (Iron)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 40,
      },
      {
        item: 'Desc_IronIngot_C',
        amount: 240,
      },
    ],
    products: [
      {
        item: 'Desc_FicsiteIngot_C',
        amount: 10,
      },
    ],
  },
  Recipe_TimeCrystal_C: {
    name: 'Time Crystal',
    ingredients: [
      {
        item: 'Desc_Diamond_C',
        amount: 12,
      },
    ],
    products: [
      {
        item: 'Desc_TimeCrystal_C',
        amount: 6,
      },
    ],
  },
  Recipe_Diamond_C: {
    name: 'Diamonds',
    ingredients: [
      {
        item: 'Desc_Coal_C',
        amount: 600,
      },
    ],
    products: [
      {
        item: 'Desc_Diamond_C',
        amount: 30,
      },
    ],
  },
  Recipe_IngotSAM_C: {
    name: 'Reanimated SAM',
    ingredients: [
      {
        item: 'Desc_SAM_C',
        amount: 120,
      },
    ],
    products: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 30,
      },
    ],
  },
  Recipe_SpaceElevatorPart_10_C: {
    name: 'Biochemical Sculptor',
    ingredients: [
      {
        item: 'Desc_SpaceElevatorPart_7_C',
        amount: 0.5,
      },
      {
        item: 'Desc_FicsiteMesh_C',
        amount: 40,
      },
      {
        item: 'Desc_Water_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_SpaceElevatorPart_10_C',
        amount: 2,
      },
    ],
  },
  Recipe_FicsiteIngot_AL_C: {
    name: 'Ficsite Ingot (Aluminum)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 60,
      },
      {
        item: 'Desc_AluminumIngot_C',
        amount: 120,
      },
    ],
    products: [
      {
        item: 'Desc_FicsiteIngot_C',
        amount: 30,
      },
    ],
  },
  Recipe_FicsiteIngot_CAT_C: {
    name: 'Ficsite Ingot (Caterium)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 45,
      },
      {
        item: 'Desc_GoldIngot_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_FicsiteIngot_C',
        amount: 15,
      },
    ],
  },
  Recipe_Bauxite_Caterium_C: {
    name: 'Bauxite (Caterium)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 10,
      },
      {
        item: 'Desc_OreGold_C',
        amount: 150,
      },
    ],
    products: [
      {
        item: 'Desc_OreBauxite_C',
        amount: 120,
      },
    ],
  },
  Recipe_Bauxite_Copper_C: {
    name: 'Bauxite (Copper)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 10,
      },
      {
        item: 'Desc_OreCopper_C',
        amount: 180,
      },
    ],
    products: [
      {
        item: 'Desc_OreBauxite_C',
        amount: 120,
      },
    ],
  },
  Recipe_Caterium_Copper_C: {
    name: 'Caterium Ore (Copper)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 10,
      },
      {
        item: 'Desc_OreCopper_C',
        amount: 150,
      },
    ],
    products: [
      {
        item: 'Desc_OreGold_C',
        amount: 120,
      },
    ],
  },
  Recipe_Caterium_Quartz_C: {
    name: 'Caterium Ore (Quartz)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 10,
      },
      {
        item: 'Desc_RawQuartz_C',
        amount: 120,
      },
    ],
    products: [
      {
        item: 'Desc_OreGold_C',
        amount: 120,
      },
    ],
  },
  Recipe_Coal_Iron_C: {
    name: 'Coal (Iron)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 10,
      },
      {
        item: 'Desc_OreIron_C',
        amount: 180,
      },
    ],
    products: [
      {
        item: 'Desc_Coal_C',
        amount: 120,
      },
    ],
  },
  Recipe_Coal_Limestone_C: {
    name: 'Coal (Limestone)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 10,
      },
      {
        item: 'Desc_Stone_C',
        amount: 360,
      },
    ],
    products: [
      {
        item: 'Desc_Coal_C',
        amount: 120,
      },
    ],
  },
  Recipe_Copper_Quartz_C: {
    name: 'Copper Ore (Quartz)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 10,
      },
      {
        item: 'Desc_RawQuartz_C',
        amount: 100,
      },
    ],
    products: [
      {
        item: 'Desc_OreCopper_C',
        amount: 120,
      },
    ],
  },
  Recipe_Copper_Sulfur_C: {
    name: 'Copper Ore (Sulfur)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 10,
      },
      {
        item: 'Desc_Sulfur_C',
        amount: 120,
      },
    ],
    products: [
      {
        item: 'Desc_OreCopper_C',
        amount: 120,
      },
    ],
  },
  Recipe_Iron_Limestone_C: {
    name: 'Iron Ore (Limestone)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 10,
      },
      {
        item: 'Desc_Stone_C',
        amount: 240,
      },
    ],
    products: [
      {
        item: 'Desc_OreIron_C',
        amount: 120,
      },
    ],
  },
  Recipe_Limestone_Sulfur_C: {
    name: 'Limestone (Sulfur)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 10,
      },
      {
        item: 'Desc_Sulfur_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'Desc_Stone_C',
        amount: 120,
      },
    ],
  },
  Recipe_Nitrogen_Bauxite_C: {
    name: 'Nitrogen Gas (Bauxite)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 10,
      },
      {
        item: 'Desc_OreBauxite_C',
        amount: 100,
      },
    ],
    products: [
      {
        item: 'Desc_NitrogenGas_C',
        amount: 120,
      },
    ],
  },
  Recipe_Nitrogen_Caterium_C: {
    name: 'Nitrogen Gas (Caterium)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 10,
      },
      {
        item: 'Desc_OreGold_C',
        amount: 120,
      },
    ],
    products: [
      {
        item: 'Desc_NitrogenGas_C',
        amount: 120,
      },
    ],
  },
  Recipe_Quartz_Bauxite_C: {
    name: 'Raw Quartz (Bauxite)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 10,
      },
      {
        item: 'Desc_OreBauxite_C',
        amount: 100,
      },
    ],
    products: [
      {
        item: 'Desc_RawQuartz_C',
        amount: 120,
      },
    ],
  },
  Recipe_Quartz_Coal_C: {
    name: 'Raw Quartz (Coal)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 10,
      },
      {
        item: 'Desc_Coal_C',
        amount: 240,
      },
    ],
    products: [
      {
        item: 'Desc_RawQuartz_C',
        amount: 120,
      },
    ],
  },
  Recipe_Sulfur_Coal_C: {
    name: 'Sulfur (Coal)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 10,
      },
      {
        item: 'Desc_Coal_C',
        amount: 200,
      },
    ],
    products: [
      {
        item: 'Desc_Sulfur_C',
        amount: 120,
      },
    ],
  },
  Recipe_Sulfur_Iron_C: {
    name: 'Sulfur (Iron)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 10,
      },
      {
        item: 'Desc_OreIron_C',
        amount: 300,
      },
    ],
    products: [
      {
        item: 'Desc_Sulfur_C',
        amount: 120,
      },
    ],
  },
  Recipe_Uranium_Bauxite_C: {
    name: 'Uranium Ore (Bauxite)',
    ingredients: [
      {
        item: 'Desc_SAMIngot_C',
        amount: 10,
      },
      {
        item: 'Desc_OreBauxite_C',
        amount: 480,
      },
    ],
    products: [
      {
        item: 'Desc_OreUranium_C',
        amount: 120,
      },
    ],
  },
  Recipe_Alternate_Turbofuel_C: {
    name: 'Turbofuel',
    ingredients: [
      {
        item: 'Desc_LiquidFuel_C',
        amount: 22.5,
      },
      {
        item: 'Desc_CompactedCoal_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_LiquidTurboFuel_C',
        amount: 18.75,
      },
    ],
  },
  Recipe_PackagedTurboFuel_C: {
    name: 'Packaged Turbofuel',
    ingredients: [
      {
        item: 'Desc_LiquidTurboFuel_C',
        amount: 20,
      },
      {
        item: 'Desc_FluidCanister_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'Desc_TurboFuel_C',
        amount: 20,
      },
    ],
  },
  Recipe_UnpackageTurboFuel_C: {
    name: 'Unpackage Turbofuel',
    ingredients: [
      {
        item: 'Desc_TurboFuel_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'Desc_LiquidTurboFuel_C',
        amount: 20,
      },
      {
        item: 'Desc_FluidCanister_C',
        amount: 20,
      },
    ],
  },
  Recipe_Alternate_Coal_1_C: {
    name: 'Alternate: Charcoal',
    ingredients: [
      {
        item: 'Desc_Wood_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_Coal_C',
        amount: 150,
      },
    ],
  },
  Recipe_Alternate_Coal_2_C: {
    name: 'Alternate: Biocoal',
    ingredients: [
      {
        item: 'Desc_GenericBiomass_C',
        amount: 37.5,
      },
    ],
    products: [
      {
        item: 'Desc_Coal_C',
        amount: 45,
      },
    ],
  },
  Recipe_Alternate_EnrichedCoal_C: {
    name: 'Alternate: Compacted Coal',
    ingredients: [
      {
        item: 'Desc_Coal_C',
        amount: 25,
      },
      {
        item: 'Desc_Sulfur_C',
        amount: 25,
      },
    ],
    products: [
      {
        item: 'Desc_CompactedCoal_C',
        amount: 25,
      },
    ],
  },
  Recipe_CircuitBoard_C: {
    name: 'Circuit Board',
    ingredients: [
      {
        item: 'Desc_CopperSheet_C',
        amount: 15,
      },
      {
        item: 'Desc_Plastic_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_CircuitBoard_C',
        amount: 7.5,
      },
    ],
  },
  Recipe_LiquidFuel_C: {
    name: 'Fuel',
    ingredients: [
      {
        item: 'Desc_LiquidOil_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_LiquidFuel_C',
        amount: 40,
      },
      {
        item: 'Desc_PolymerResin_C',
        amount: 30,
      },
    ],
  },
  Recipe_PetroleumCoke_C: {
    name: 'Petroleum Coke',
    ingredients: [
      {
        item: 'Desc_HeavyOilResidue_C',
        amount: 40,
      },
    ],
    products: [
      {
        item: 'Desc_PetroleumCoke_C',
        amount: 120,
      },
    ],
  },
  Recipe_Plastic_C: {
    name: 'Plastic',
    ingredients: [
      {
        item: 'Desc_LiquidOil_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_Plastic_C',
        amount: 20,
      },
      {
        item: 'Desc_HeavyOilResidue_C',
        amount: 10,
      },
    ],
  },
  Recipe_Rubber_C: {
    name: 'Rubber',
    ingredients: [
      {
        item: 'Desc_LiquidOil_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_Rubber_C',
        amount: 20,
      },
      {
        item: 'Desc_HeavyOilResidue_C',
        amount: 20,
      },
    ],
  },
  Recipe_ResidualFuel_C: {
    name: 'Residual Fuel',
    ingredients: [
      {
        item: 'Desc_HeavyOilResidue_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_LiquidFuel_C',
        amount: 40,
      },
    ],
  },
  Recipe_ResidualPlastic_C: {
    name: 'Residual Plastic',
    ingredients: [
      {
        item: 'Desc_PolymerResin_C',
        amount: 60,
      },
      {
        item: 'Desc_Water_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'Desc_Plastic_C',
        amount: 20,
      },
    ],
  },
  Recipe_ResidualRubber_C: {
    name: 'Residual Rubber',
    ingredients: [
      {
        item: 'Desc_PolymerResin_C',
        amount: 40,
      },
      {
        item: 'Desc_Water_C',
        amount: 40,
      },
    ],
    products: [
      {
        item: 'Desc_Rubber_C',
        amount: 20,
      },
    ],
  },
  Recipe_Alternate_Diamond_Pink_C: {
    name: 'Alternate: Pink Diamonds',
    ingredients: [
      {
        item: 'Desc_Coal_C',
        amount: 120,
      },
      {
        item: 'Desc_QuartzCrystal_C',
        amount: 45,
      },
    ],
    products: [
      {
        item: 'Desc_Diamond_C',
        amount: 15,
      },
    ],
  },
  Recipe_Alternate_Diamond_Petroleum_C: {
    name: 'Alternate: Petroleum Diamonds',
    ingredients: [
      {
        item: 'Desc_PetroleumCoke_C',
        amount: 720,
      },
    ],
    products: [
      {
        item: 'Desc_Diamond_C',
        amount: 30,
      },
    ],
  },
  Recipe_Alternate_Diamond_OilBased_C: {
    name: 'Alternate: Oil-Based Diamonds',
    ingredients: [
      {
        item: 'Desc_LiquidOil_C',
        amount: 200,
      },
    ],
    products: [
      {
        item: 'Desc_Diamond_C',
        amount: 40,
      },
    ],
  },
  Recipe_Alternate_Diamond_Cloudy_C: {
    name: 'Alternate: Cloudy Diamonds',
    ingredients: [
      {
        item: 'Desc_Coal_C',
        amount: 240,
      },
      {
        item: 'Desc_Stone_C',
        amount: 480,
      },
    ],
    products: [
      {
        item: 'Desc_Diamond_C',
        amount: 20,
      },
    ],
  },
  Recipe_Alternate_DarkMatter_Trap_C: {
    name: 'Alternate: Dark Matter Trap',
    ingredients: [
      {
        item: 'Desc_TimeCrystal_C',
        amount: 30,
      },
      {
        item: 'Desc_DarkEnergy_C',
        amount: 150,
      },
    ],
    products: [
      {
        item: 'Desc_DarkMatter_C',
        amount: 60,
      },
    ],
  },
  Recipe_Alternate_DarkMatter_Crystallization_C: {
    name: 'Alternate: Dark Matter Crystallization',
    ingredients: [
      {
        item: 'Desc_DarkEnergy_C',
        amount: 200,
      },
    ],
    products: [
      {
        item: 'Desc_DarkMatter_C',
        amount: 20,
      },
    ],
  },
  Recipe_Alternate_WetConcrete_C: {
    name: 'Alternate: Wet Concrete',
    ingredients: [
      {
        item: 'Desc_Stone_C',
        amount: 120,
      },
      {
        item: 'Desc_Water_C',
        amount: 100,
      },
    ],
    products: [
      {
        item: 'Desc_Cement_C',
        amount: 80,
      },
    ],
  },
  Recipe_Alternate_TurboHeavyFuel_C: {
    name: 'Alternate: Turbo Heavy Fuel',
    ingredients: [
      {
        item: 'Desc_HeavyOilResidue_C',
        amount: 37.5,
      },
      {
        item: 'Desc_CompactedCoal_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_LiquidTurboFuel_C',
        amount: 30,
      },
    ],
  },
  Recipe_Alternate_SteelRod_C: {
    name: 'Alternate: Steel Rod',
    ingredients: [
      {
        item: 'Desc_SteelIngot_C',
        amount: 12,
      },
    ],
    products: [
      {
        item: 'Desc_IronRod_C',
        amount: 48,
      },
    ],
  },
  Recipe_SteelBeam_C: {
    name: 'Steel Beam',
    ingredients: [
      {
        item: 'Desc_SteelIngot_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_SteelPlate_C',
        amount: 15,
      },
    ],
  },
  Recipe_SteelPipe_C: {
    name: 'Steel Pipe',
    ingredients: [
      {
        item: 'Desc_SteelIngot_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_SteelPipe_C',
        amount: 20,
      },
    ],
  },
  Recipe_IngotSteel_C: {
    name: 'Steel Ingot',
    ingredients: [
      {
        item: 'Desc_OreIron_C',
        amount: 45,
      },
      {
        item: 'Desc_Coal_C',
        amount: 45,
      },
    ],
    products: [
      {
        item: 'Desc_SteelIngot_C',
        amount: 45,
      },
    ],
  },
  Recipe_SpaceElevatorPart_2_C: {
    name: 'Versatile Framework',
    ingredients: [
      {
        item: 'Desc_ModularFrame_C',
        amount: 2.5,
      },
      {
        item: 'Desc_SteelPlate_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_SpaceElevatorPart_2_C',
        amount: 5,
      },
    ],
  },
  Recipe_Alternate_SteelCanister_C: {
    name: 'Alternate: Steel Canister',
    ingredients: [
      {
        item: 'Desc_SteelIngot_C',
        amount: 40,
      },
    ],
    products: [
      {
        item: 'Desc_FluidCanister_C',
        amount: 40,
      },
    ],
  },
  Recipe_FluidCanister_C: {
    name: 'Empty Canister',
    ingredients: [
      {
        item: 'Desc_Plastic_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_FluidCanister_C',
        amount: 60,
      },
    ],
  },
  Recipe_Fuel_C: {
    name: 'Packaged Fuel',
    ingredients: [
      {
        item: 'Desc_LiquidFuel_C',
        amount: 40,
      },
      {
        item: 'Desc_FluidCanister_C',
        amount: 40,
      },
    ],
    products: [
      {
        item: 'Desc_Fuel_C',
        amount: 40,
      },
    ],
  },
  Recipe_LiquidBiofuel_C: {
    name: 'Liquid Biofuel',
    ingredients: [
      {
        item: 'Desc_Biofuel_C',
        amount: 90,
      },
      {
        item: 'Desc_Water_C',
        amount: 45,
      },
    ],
    products: [
      {
        item: 'Desc_LiquidBiofuel_C',
        amount: 60,
      },
    ],
  },
  Recipe_PackagedBiofuel_C: {
    name: 'Packaged Liquid Biofuel',
    ingredients: [
      {
        item: 'Desc_LiquidBiofuel_C',
        amount: 40,
      },
      {
        item: 'Desc_FluidCanister_C',
        amount: 40,
      },
    ],
    products: [
      {
        item: 'Desc_PackagedBiofuel_C',
        amount: 40,
      },
    ],
  },
  Recipe_PackagedCrudeOil_C: {
    name: 'Packaged Oil',
    ingredients: [
      {
        item: 'Desc_LiquidOil_C',
        amount: 30,
      },
      {
        item: 'Desc_FluidCanister_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_PackagedOil_C',
        amount: 30,
      },
    ],
  },
  Recipe_PackagedOilResidue_C: {
    name: 'Packaged Heavy Oil Residue',
    ingredients: [
      {
        item: 'Desc_HeavyOilResidue_C',
        amount: 30,
      },
      {
        item: 'Desc_FluidCanister_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_PackagedOilResidue_C',
        amount: 30,
      },
    ],
  },
  Recipe_PackagedWater_C: {
    name: 'Packaged Water',
    ingredients: [
      {
        item: 'Desc_Water_C',
        amount: 60,
      },
      {
        item: 'Desc_FluidCanister_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_PackagedWater_C',
        amount: 60,
      },
    ],
  },
  Recipe_UnpackageBioFuel_C: {
    name: 'Unpackage Liquid Biofuel',
    ingredients: [
      {
        item: 'Desc_PackagedBiofuel_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_LiquidBiofuel_C',
        amount: 60,
      },
      {
        item: 'Desc_FluidCanister_C',
        amount: 60,
      },
    ],
  },
  Recipe_UnpackageFuel_C: {
    name: 'Unpackage Fuel',
    ingredients: [
      {
        item: 'Desc_Fuel_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_LiquidFuel_C',
        amount: 60,
      },
      {
        item: 'Desc_FluidCanister_C',
        amount: 60,
      },
    ],
  },
  Recipe_UnpackageOil_C: {
    name: 'Unpackage Oil',
    ingredients: [
      {
        item: 'Desc_PackagedOil_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_LiquidOil_C',
        amount: 60,
      },
      {
        item: 'Desc_FluidCanister_C',
        amount: 60,
      },
    ],
  },
  Recipe_UnpackageOilResidue_C: {
    name: 'Unpackage Heavy Oil Residue',
    ingredients: [
      {
        item: 'Desc_PackagedOilResidue_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'Desc_HeavyOilResidue_C',
        amount: 20,
      },
      {
        item: 'Desc_FluidCanister_C',
        amount: 20,
      },
    ],
  },
  Recipe_UnpackageWater_C: {
    name: 'Unpackage Water',
    ingredients: [
      {
        item: 'Desc_PackagedWater_C',
        amount: 120,
      },
    ],
    products: [
      {
        item: 'Desc_Water_C',
        amount: 120,
      },
      {
        item: 'Desc_FluidCanister_C',
        amount: 120,
      },
    ],
  },
  Recipe_Alternate_SteamedCopperSheet_C: {
    name: 'Alternate: Steamed Copper Sheet',
    ingredients: [
      {
        item: 'Desc_CopperIngot_C',
        amount: 22.5,
      },
      {
        item: 'Desc_Water_C',
        amount: 22.5,
      },
    ],
    products: [
      {
        item: 'Desc_CopperSheet_C',
        amount: 22.5,
      },
    ],
  },
  Recipe_Alternate_RubberConcrete_C: {
    name: 'Alternate: Rubber Concrete',
    ingredients: [
      {
        item: 'Desc_Stone_C',
        amount: 100,
      },
      {
        item: 'Desc_Rubber_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'Desc_Cement_C',
        amount: 90,
      },
    ],
  },
  Recipe_Alternate_RecycledRubber_C: {
    name: 'Alternate: Recycled Rubber',
    ingredients: [
      {
        item: 'Desc_Plastic_C',
        amount: 30,
      },
      {
        item: 'Desc_LiquidFuel_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_Rubber_C',
        amount: 60,
      },
    ],
  },
  Recipe_Alternate_PureQuartzCrystal_C: {
    name: 'Alternate: Pure Quartz Crystal',
    ingredients: [
      {
        item: 'Desc_RawQuartz_C',
        amount: 67.5,
      },
      {
        item: 'Desc_Water_C',
        amount: 37.5,
      },
    ],
    products: [
      {
        item: 'Desc_QuartzCrystal_C',
        amount: 52.5,
      },
    ],
  },
  Recipe_QuartzCrystal_C: {
    name: 'Quartz Crystal',
    ingredients: [
      {
        item: 'Desc_RawQuartz_C',
        amount: 37.5,
      },
    ],
    products: [
      {
        item: 'Desc_QuartzCrystal_C',
        amount: 22.5,
      },
    ],
  },
  Recipe_Alternate_PureIronIngot_C: {
    name: 'Alternate: Pure Iron Ingot',
    ingredients: [
      {
        item: 'Desc_OreIron_C',
        amount: 35,
      },
      {
        item: 'Desc_Water_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'Desc_IronIngot_C',
        amount: 65,
      },
    ],
  },
  Recipe_Alternate_PureCopperIngot_C: {
    name: 'Alternate: Pure Copper Ingot',
    ingredients: [
      {
        item: 'Desc_OreCopper_C',
        amount: 15,
      },
      {
        item: 'Desc_Water_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_CopperIngot_C',
        amount: 37.5,
      },
    ],
  },
  Recipe_Alternate_PureCateriumIngot_C: {
    name: 'Alternate: Pure Caterium Ingot',
    ingredients: [
      {
        item: 'Desc_OreGold_C',
        amount: 24,
      },
      {
        item: 'Desc_Water_C',
        amount: 24,
      },
    ],
    products: [
      {
        item: 'Desc_GoldIngot_C',
        amount: 12,
      },
    ],
  },
  Recipe_PureAluminumIngot_C: {
    name: 'Alternate: Pure Aluminum Ingot',
    ingredients: [
      {
        item: 'Desc_AluminumScrap_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_AluminumIngot_C',
        amount: 30,
      },
    ],
  },
  Recipe_AluminumCasing_C: {
    name: 'Aluminum Casing',
    ingredients: [
      {
        item: 'Desc_AluminumIngot_C',
        amount: 90,
      },
    ],
    products: [
      {
        item: 'Desc_AluminumCasing_C',
        amount: 60,
      },
    ],
  },
  Recipe_AluminumSheet_C: {
    name: 'Alclad Aluminum Sheet',
    ingredients: [
      {
        item: 'Desc_AluminumIngot_C',
        amount: 30,
      },
      {
        item: 'Desc_CopperIngot_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_AluminumPlate_C',
        amount: 30,
      },
    ],
  },
  Recipe_AluminaSolution_C: {
    name: 'Alumina Solution',
    ingredients: [
      {
        item: 'Desc_OreBauxite_C',
        amount: 120,
      },
      {
        item: 'Desc_Water_C',
        amount: 180,
      },
    ],
    products: [
      {
        item: 'Desc_AluminaSolution_C',
        amount: 120,
      },
      {
        item: 'Desc_Silica_C',
        amount: 50,
      },
    ],
  },
  Recipe_AluminumScrap_C: {
    name: 'Aluminum Scrap',
    ingredients: [
      {
        item: 'Desc_AluminaSolution_C',
        amount: 240,
      },
      {
        item: 'Desc_Coal_C',
        amount: 120,
      },
    ],
    products: [
      {
        item: 'Desc_AluminumScrap_C',
        amount: 360,
      },
      {
        item: 'Desc_Water_C',
        amount: 120,
      },
    ],
  },
  Recipe_PackagedAlumina_C: {
    name: 'Packaged Alumina Solution',
    ingredients: [
      {
        item: 'Desc_AluminaSolution_C',
        amount: 120,
      },
      {
        item: 'Desc_FluidCanister_C',
        amount: 120,
      },
    ],
    products: [
      {
        item: 'Desc_PackagedAlumina_C',
        amount: 120,
      },
    ],
  },
  Recipe_IngotAluminum_C: {
    name: 'Aluminum Ingot',
    ingredients: [
      {
        item: 'Desc_AluminumScrap_C',
        amount: 90,
      },
      {
        item: 'Desc_Silica_C',
        amount: 75,
      },
    ],
    products: [
      {
        item: 'Desc_AluminumIngot_C',
        amount: 60,
      },
    ],
  },
  Recipe_Silica_C: {
    name: 'Silica',
    ingredients: [
      {
        item: 'Desc_RawQuartz_C',
        amount: 22.5,
      },
    ],
    products: [
      {
        item: 'Desc_Silica_C',
        amount: 37.5,
      },
    ],
  },
  Recipe_CrystalOscillator_C: {
    name: 'Crystal Oscillator',
    ingredients: [
      {
        item: 'Desc_QuartzCrystal_C',
        amount: 18,
      },
      {
        item: 'Desc_Cable_C',
        amount: 14,
      },
      {
        item: 'Desc_IronPlateReinforced_C',
        amount: 2.5,
      },
    ],
    products: [
      {
        item: 'Desc_CrystalOscillator_C',
        amount: 1,
      },
    ],
  },
  Recipe_UnpackageAlumina_C: {
    name: 'Unpackage Alumina Solution',
    ingredients: [
      {
        item: 'Desc_PackagedAlumina_C',
        amount: 120,
      },
    ],
    products: [
      {
        item: 'Desc_AluminaSolution_C',
        amount: 120,
      },
      {
        item: 'Desc_FluidCanister_C',
        amount: 120,
      },
    ],
  },
  Recipe_Alternate_PolymerResin_C: {
    name: 'Alternate: Polymer Resin',
    ingredients: [
      {
        item: 'Desc_LiquidOil_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_PolymerResin_C',
        amount: 130,
      },
      {
        item: 'Desc_HeavyOilResidue_C',
        amount: 20,
      },
    ],
  },
  Recipe_Alternate_PlasticSmartPlating_C: {
    name: 'Alternate: Plastic Smart Plating',
    ingredients: [
      {
        item: 'Desc_IronPlateReinforced_C',
        amount: 2.5,
      },
      {
        item: 'Desc_Rotor_C',
        amount: 2.5,
      },
      {
        item: 'Desc_Plastic_C',
        amount: 7.5,
      },
    ],
    products: [
      {
        item: 'Desc_SpaceElevatorPart_1_C',
        amount: 5,
      },
    ],
  },
  Recipe_Alternate_HighSpeedWiring_C: {
    name: 'Alternate: Automated Speed Wiring',
    ingredients: [
      {
        item: 'Desc_Stator_C',
        amount: 3.75,
      },
      {
        item: 'Desc_Wire_C',
        amount: 75,
      },
      {
        item: 'Desc_HighSpeedConnector_C',
        amount: 1.875,
      },
    ],
    products: [
      {
        item: 'Desc_SpaceElevatorPart_3_C',
        amount: 7.5,
      },
    ],
  },
  Recipe_EncasedIndustrialBeam_C: {
    name: 'Encased Industrial Beam',
    ingredients: [
      {
        item: 'Desc_SteelPlate_C',
        amount: 18,
      },
      {
        item: 'Desc_Cement_C',
        amount: 36,
      },
    ],
    products: [
      {
        item: 'Desc_SteelPlateReinforced_C',
        amount: 6,
      },
    ],
  },
  Recipe_Motor_C: {
    name: 'Motor',
    ingredients: [
      {
        item: 'Desc_Rotor_C',
        amount: 10,
      },
      {
        item: 'Desc_Stator_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_Motor_C',
        amount: 5,
      },
    ],
  },
  Recipe_Stator_C: {
    name: 'Stator',
    ingredients: [
      {
        item: 'Desc_SteelPipe_C',
        amount: 15,
      },
      {
        item: 'Desc_Wire_C',
        amount: 40,
      },
    ],
    products: [
      {
        item: 'Desc_Stator_C',
        amount: 5,
      },
    ],
  },
  Recipe_SpaceElevatorPart_3_C: {
    name: 'Automated Wiring',
    ingredients: [
      {
        item: 'Desc_Stator_C',
        amount: 2.5,
      },
      {
        item: 'Desc_Cable_C',
        amount: 50,
      },
    ],
    products: [
      {
        item: 'Desc_SpaceElevatorPart_3_C',
        amount: 2.5,
      },
    ],
  },
  Recipe_AILimiter_C: {
    name: 'AI Limiter',
    ingredients: [
      {
        item: 'Desc_CopperSheet_C',
        amount: 25,
      },
      {
        item: 'Desc_HighSpeedWire_C',
        amount: 100,
      },
    ],
    products: [
      {
        item: 'Desc_CircuitBoardHighSpeed_C',
        amount: 5,
      },
    ],
  },
  Recipe_Alternate_HeavyOilResidue_C: {
    name: 'Alternate: Heavy Oil Residue',
    ingredients: [
      {
        item: 'Desc_LiquidOil_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_HeavyOilResidue_C',
        amount: 40,
      },
      {
        item: 'Desc_PolymerResin_C',
        amount: 20,
      },
    ],
  },
  Recipe_Alternate_HeavyFlexibleFrame_C: {
    name: 'Alternate: Heavy Flexible Frame',
    ingredients: [
      {
        item: 'Desc_ModularFrame_C',
        amount: 18.75,
      },
      {
        item: 'Desc_SteelPlateReinforced_C',
        amount: 11.25,
      },
      {
        item: 'Desc_Rubber_C',
        amount: 75,
      },
      {
        item: 'Desc_IronScrew_C',
        amount: 390,
      },
    ],
    products: [
      {
        item: 'Desc_ModularFrameHeavy_C',
        amount: 3.75,
      },
    ],
  },
  Recipe_Computer_C: {
    name: 'Computer',
    ingredients: [
      {
        item: 'Desc_CircuitBoard_C',
        amount: 10,
      },
      {
        item: 'Desc_Cable_C',
        amount: 20,
      },
      {
        item: 'Desc_Plastic_C',
        amount: 40,
      },
    ],
    products: [
      {
        item: 'Desc_Computer_C',
        amount: 2.5,
      },
    ],
  },
  Recipe_ModularFrameHeavy_C: {
    name: 'Heavy Modular Frame',
    ingredients: [
      {
        item: 'Desc_ModularFrame_C',
        amount: 10,
      },
      {
        item: 'Desc_SteelPipe_C',
        amount: 40,
      },
      {
        item: 'Desc_SteelPlateReinforced_C',
        amount: 10,
      },
      {
        item: 'Desc_IronScrew_C',
        amount: 240,
      },
    ],
    products: [
      {
        item: 'Desc_ModularFrameHeavy_C',
        amount: 2,
      },
    ],
  },
  Recipe_SpaceElevatorPart_4_C: {
    name: 'Modular Engine',
    ingredients: [
      {
        item: 'Desc_Motor_C',
        amount: 2,
      },
      {
        item: 'Desc_Rubber_C',
        amount: 15,
      },
      {
        item: 'Desc_SpaceElevatorPart_1_C',
        amount: 2,
      },
    ],
    products: [
      {
        item: 'Desc_SpaceElevatorPart_4_C',
        amount: 1,
      },
    ],
  },
  Recipe_SpaceElevatorPart_5_C: {
    name: 'Adaptive Control Unit',
    ingredients: [
      {
        item: 'Desc_SpaceElevatorPart_3_C',
        amount: 5,
      },
      {
        item: 'Desc_CircuitBoard_C',
        amount: 5,
      },
      {
        item: 'Desc_ModularFrameHeavy_C',
        amount: 1,
      },
      {
        item: 'Desc_Computer_C',
        amount: 2,
      },
    ],
    products: [
      {
        item: 'Desc_SpaceElevatorPart_5_C',
        amount: 1,
      },
    ],
  },
  Recipe_Alternate_FusedWire_C: {
    name: 'Alternate: Fused Wire',
    ingredients: [
      {
        item: 'Desc_CopperIngot_C',
        amount: 12,
      },
      {
        item: 'Desc_GoldIngot_C',
        amount: 3,
      },
    ],
    products: [
      {
        item: 'Desc_Wire_C',
        amount: 90,
      },
    ],
  },
  Recipe_Alternate_FlexibleFramework_C: {
    name: 'Alternate: Flexible Framework',
    ingredients: [
      {
        item: 'Desc_ModularFrame_C',
        amount: 3.75,
      },
      {
        item: 'Desc_SteelPlate_C',
        amount: 22.5,
      },
      {
        item: 'Desc_Rubber_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_SpaceElevatorPart_2_C',
        amount: 7.5,
      },
    ],
  },
  Recipe_Alternate_ElectrodeCircuitBoard_C: {
    name: 'Alternate: Electrode Circuit Board',
    ingredients: [
      {
        item: 'Desc_Rubber_C',
        amount: 20,
      },
      {
        item: 'Desc_PetroleumCoke_C',
        amount: 40,
      },
    ],
    products: [
      {
        item: 'Desc_CircuitBoard_C',
        amount: 5,
      },
    ],
  },
  Recipe_Alternate_ElectroAluminumScrap_C: {
    name: 'Alternate: Electrode Aluminum Scrap',
    ingredients: [
      {
        item: 'Desc_AluminaSolution_C',
        amount: 180,
      },
      {
        item: 'Desc_PetroleumCoke_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_AluminumScrap_C',
        amount: 300,
      },
      {
        item: 'Desc_Water_C',
        amount: 105,
      },
    ],
  },
  Recipe_Alternate_DilutedPackagedFuel_C: {
    name: 'Alternate: Diluted Packaged Fuel',
    ingredients: [
      {
        item: 'Desc_HeavyOilResidue_C',
        amount: 30,
      },
      {
        item: 'Desc_PackagedWater_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_Fuel_C',
        amount: 60,
      },
    ],
  },
  Recipe_Alternate_CopperRotor_C: {
    name: 'Alternate: Copper Rotor',
    ingredients: [
      {
        item: 'Desc_CopperSheet_C',
        amount: 22.5,
      },
      {
        item: 'Desc_IronScrew_C',
        amount: 195,
      },
    ],
    products: [
      {
        item: 'Desc_Rotor_C',
        amount: 11.25,
      },
    ],
  },
  Recipe_ModularFrame_C: {
    name: 'Modular Frame',
    ingredients: [
      {
        item: 'Desc_IronPlateReinforced_C',
        amount: 3,
      },
      {
        item: 'Desc_IronRod_C',
        amount: 12,
      },
    ],
    products: [
      {
        item: 'Desc_ModularFrame_C',
        amount: 2,
      },
    ],
  },
  Recipe_Rotor_C: {
    name: 'Rotor',
    ingredients: [
      {
        item: 'Desc_IronRod_C',
        amount: 20,
      },
      {
        item: 'Desc_IronScrew_C',
        amount: 100,
      },
    ],
    products: [
      {
        item: 'Desc_Rotor_C',
        amount: 4,
      },
    ],
  },
  Recipe_CopperSheet_C: {
    name: 'Copper Sheet',
    ingredients: [
      {
        item: 'Desc_CopperIngot_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'Desc_CopperSheet_C',
        amount: 10,
      },
    ],
  },
  Recipe_SpaceElevatorPart_1_C: {
    name: 'Smart Plating',
    ingredients: [
      {
        item: 'Desc_IronPlateReinforced_C',
        amount: 2,
      },
      {
        item: 'Desc_Rotor_C',
        amount: 2,
      },
    ],
    products: [
      {
        item: 'Desc_SpaceElevatorPart_1_C',
        amount: 2,
      },
    ],
  },
  Recipe_Alternate_CopperAlloyIngot_C: {
    name: 'Alternate: Copper Alloy Ingot',
    ingredients: [
      {
        item: 'Desc_OreCopper_C',
        amount: 50,
      },
      {
        item: 'Desc_OreIron_C',
        amount: 50,
      },
    ],
    products: [
      {
        item: 'Desc_CopperIngot_C',
        amount: 100,
      },
    ],
  },
  Recipe_Alternate_CokeSteelIngot_C: {
    name: 'Alternate: Coke Steel Ingot',
    ingredients: [
      {
        item: 'Desc_OreIron_C',
        amount: 75,
      },
      {
        item: 'Desc_PetroleumCoke_C',
        amount: 75,
      },
    ],
    products: [
      {
        item: 'Desc_SteelIngot_C',
        amount: 100,
      },
    ],
  },
  Recipe_Alternate_CoatedIronPlate_C: {
    name: 'Alternate: Coated Iron Plate',
    ingredients: [
      {
        item: 'Desc_IronIngot_C',
        amount: 37.5,
      },
      {
        item: 'Desc_Plastic_C',
        amount: 7.5,
      },
    ],
    products: [
      {
        item: 'Desc_IronPlate_C',
        amount: 75,
      },
    ],
  },
  Recipe_Alternate_CoatedIronCanister_C: {
    name: 'Alternate: Coated Iron Canister',
    ingredients: [
      {
        item: 'Desc_IronPlate_C',
        amount: 30,
      },
      {
        item: 'Desc_CopperSheet_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_FluidCanister_C',
        amount: 60,
      },
    ],
  },
  Recipe_Alternate_CoatedCable_C: {
    name: 'Alternate: Coated Cable',
    ingredients: [
      {
        item: 'Desc_Wire_C',
        amount: 37.5,
      },
      {
        item: 'Desc_HeavyOilResidue_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_Cable_C',
        amount: 67.5,
      },
    ],
  },
  Recipe_Alternate_BoltedFrame_C: {
    name: 'Alternate: Bolted Frame',
    ingredients: [
      {
        item: 'Desc_IronPlateReinforced_C',
        amount: 7.5,
      },
      {
        item: 'Desc_IronScrew_C',
        amount: 140,
      },
    ],
    products: [
      {
        item: 'Desc_ModularFrame_C',
        amount: 5,
      },
    ],
  },
  Recipe_Alternate_AdheredIronPlate_C: {
    name: 'Alternate: Adhered Iron Plate',
    ingredients: [
      {
        item: 'Desc_IronPlate_C',
        amount: 11.25,
      },
      {
        item: 'Desc_Rubber_C',
        amount: 3.75,
      },
    ],
    products: [
      {
        item: 'Desc_IronPlateReinforced_C',
        amount: 3.75,
      },
    ],
  },
  Recipe_Alternate_TurboPressureMotor_C: {
    name: 'Alternate: Turbo Pressure Motor',
    ingredients: [
      {
        item: 'Desc_Motor_C',
        amount: 7.5,
      },
      {
        item: 'Desc_PressureConversionCube_C',
        amount: 1.875,
      },
      {
        item: 'Desc_PackagedNitrogenGas_C',
        amount: 45,
      },
      {
        item: 'Desc_Stator_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_MotorLightweight_C',
        amount: 3.75,
      },
    ],
  },
  Recipe_PlutoniumCell_C: {
    name: 'Encased Plutonium Cell',
    ingredients: [
      {
        item: 'Desc_PlutoniumPellet_C',
        amount: 10,
      },
      {
        item: 'Desc_Cement_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'Desc_PlutoniumCell_C',
        amount: 5,
      },
    ],
  },
  Recipe_PressureConversionCube_C: {
    name: 'Pressure Conversion Cube',
    ingredients: [
      {
        item: 'Desc_ModularFrameFused_C',
        amount: 1,
      },
      {
        item: 'Desc_ModularFrameLightweight_C',
        amount: 2,
      },
    ],
    products: [
      {
        item: 'Desc_PressureConversionCube_C',
        amount: 1,
      },
    ],
  },
  Recipe_NitricAcid_C: {
    name: 'Nitric Acid',
    ingredients: [
      {
        item: 'Desc_NitrogenGas_C',
        amount: 120,
      },
      {
        item: 'Desc_Water_C',
        amount: 30,
      },
      {
        item: 'Desc_IronPlate_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_NitricAcid_C',
        amount: 30,
      },
    ],
  },
  Recipe_NonFissileUranium_C: {
    name: 'Non-Fissile Uranium',
    ingredients: [
      {
        item: 'Desc_NuclearWaste_C',
        amount: 37.5,
      },
      {
        item: 'Desc_Silica_C',
        amount: 25,
      },
      {
        item: 'Desc_NitricAcid_C',
        amount: 15,
      },
      {
        item: 'Desc_SulfuricAcid_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_NonFissibleUranium_C',
        amount: 50,
      },
      {
        item: 'Desc_Water_C',
        amount: 15,
      },
    ],
  },
  Recipe_CopperDust_C: {
    name: 'Copper Powder',
    ingredients: [
      {
        item: 'Desc_CopperIngot_C',
        amount: 300,
      },
    ],
    products: [
      {
        item: 'Desc_CopperDust_C',
        amount: 50,
      },
    ],
  },
  Recipe_Plutonium_C: {
    name: 'Plutonium Pellet',
    ingredients: [
      {
        item: 'Desc_NonFissibleUranium_C',
        amount: 100,
      },
      {
        item: 'Desc_NuclearWaste_C',
        amount: 25,
      },
    ],
    products: [
      {
        item: 'Desc_PlutoniumPellet_C',
        amount: 30,
      },
    ],
  },
  Recipe_PlutoniumFuelRod_C: {
    name: 'Plutonium Fuel Rod',
    ingredients: [
      {
        item: 'Desc_PlutoniumCell_C',
        amount: 7.5,
      },
      {
        item: 'Desc_SteelPlate_C',
        amount: 4.5,
      },
      {
        item: 'Desc_ElectromagneticControlRod_C',
        amount: 1.5,
      },
      {
        item: 'Desc_AluminumPlateReinforced_C',
        amount: 2.5,
      },
    ],
    products: [
      {
        item: 'Desc_PlutoniumFuelRod_C',
        amount: 0.25,
      },
    ],
  },
  Recipe_PackagedNitricAcid_C: {
    name: 'Packaged Nitric Acid',
    ingredients: [
      {
        item: 'Desc_NitricAcid_C',
        amount: 30,
      },
      {
        item: 'Desc_GasTank_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_PackagedNitricAcid_C',
        amount: 30,
      },
    ],
  },
  Recipe_SpaceElevatorPart_9_C: {
    name: 'Nuclear Pasta',
    ingredients: [
      {
        item: 'Desc_CopperDust_C',
        amount: 100,
      },
      {
        item: 'Desc_PressureConversionCube_C',
        amount: 0.5,
      },
    ],
    products: [
      {
        item: 'Desc_SpaceElevatorPart_9_C',
        amount: 0.5,
      },
    ],
  },
  Recipe_UnpackageNitricAcid_C: {
    name: 'Unpackage Nitric Acid',
    ingredients: [
      {
        item: 'Desc_PackagedNitricAcid_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'Desc_NitricAcid_C',
        amount: 20,
      },
      {
        item: 'Desc_GasTank_C',
        amount: 20,
      },
    ],
  },
  Recipe_Alternate_TurboBlendFuel_C: {
    name: 'Alternate: Turbo Blend Fuel',
    ingredients: [
      {
        item: 'Desc_LiquidFuel_C',
        amount: 15,
      },
      {
        item: 'Desc_HeavyOilResidue_C',
        amount: 30,
      },
      {
        item: 'Desc_Sulfur_C',
        amount: 22.5,
      },
      {
        item: 'Desc_PetroleumCoke_C',
        amount: 22.5,
      },
    ],
    products: [
      {
        item: 'Desc_LiquidTurboFuel_C',
        amount: 45,
      },
    ],
  },
  Recipe_UraniumCell_C: {
    name: 'Encased Uranium Cell',
    ingredients: [
      {
        item: 'Desc_OreUranium_C',
        amount: 50,
      },
      {
        item: 'Desc_Cement_C',
        amount: 15,
      },
      {
        item: 'Desc_SulfuricAcid_C',
        amount: 40,
      },
    ],
    products: [
      {
        item: 'Desc_UraniumCell_C',
        amount: 25,
      },
      {
        item: 'Desc_SulfuricAcid_C',
        amount: 10,
      },
    ],
  },
  Recipe_CoolingSystem_C: {
    name: 'Cooling System',
    ingredients: [
      {
        item: 'Desc_AluminumPlateReinforced_C',
        amount: 12,
      },
      {
        item: 'Desc_Rubber_C',
        amount: 12,
      },
      {
        item: 'Desc_Water_C',
        amount: 30,
      },
      {
        item: 'Desc_NitrogenGas_C',
        amount: 150,
      },
    ],
    products: [
      {
        item: 'Desc_CoolingSystem_C',
        amount: 6,
      },
    ],
  },
  Recipe_Battery_C: {
    name: 'Battery',
    ingredients: [
      {
        item: 'Desc_SulfuricAcid_C',
        amount: 50,
      },
      {
        item: 'Desc_AluminaSolution_C',
        amount: 40,
      },
      {
        item: 'Desc_AluminumCasing_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'Desc_Battery_C',
        amount: 20,
      },
      {
        item: 'Desc_Water_C',
        amount: 30,
      },
    ],
  },
  Recipe_ComputerSuper_C: {
    name: 'Supercomputer',
    ingredients: [
      {
        item: 'Desc_Computer_C',
        amount: 7.5,
      },
      {
        item: 'Desc_CircuitBoardHighSpeed_C',
        amount: 3.75,
      },
      {
        item: 'Desc_HighSpeedConnector_C',
        amount: 5.625,
      },
      {
        item: 'Desc_Plastic_C',
        amount: 52.5,
      },
    ],
    products: [
      {
        item: 'Desc_ComputerSuper_C',
        amount: 1.875,
      },
    ],
  },
  Recipe_RadioControlUnit_C: {
    name: 'Radio Control Unit',
    ingredients: [
      {
        item: 'Desc_AluminumCasing_C',
        amount: 40,
      },
      {
        item: 'Desc_CrystalOscillator_C',
        amount: 1.25,
      },
      {
        item: 'Desc_Computer_C',
        amount: 2.5,
      },
    ],
    products: [
      {
        item: 'Desc_ModularFrameLightweight_C',
        amount: 2.5,
      },
    ],
  },
  Recipe_SulfuricAcid_C: {
    name: 'Sulfuric Acid',
    ingredients: [
      {
        item: 'Desc_Sulfur_C',
        amount: 50,
      },
      {
        item: 'Desc_Water_C',
        amount: 50,
      },
    ],
    products: [
      {
        item: 'Desc_SulfuricAcid_C',
        amount: 50,
      },
    ],
  },
  Recipe_PackagedSulfuricAcid_C: {
    name: 'Packaged Sulfuric Acid',
    ingredients: [
      {
        item: 'Desc_SulfuricAcid_C',
        amount: 40,
      },
      {
        item: 'Desc_FluidCanister_C',
        amount: 40,
      },
    ],
    products: [
      {
        item: 'Desc_PackagedSulfuricAcid_C',
        amount: 40,
      },
    ],
  },
  Recipe_SpaceElevatorPart_7_C: {
    name: 'Assembly Director System',
    ingredients: [
      {
        item: 'Desc_SpaceElevatorPart_5_C',
        amount: 1.5,
      },
      {
        item: 'Desc_ComputerSuper_C',
        amount: 0.75,
      },
    ],
    products: [
      {
        item: 'Desc_SpaceElevatorPart_7_C',
        amount: 0.75,
      },
    ],
  },
  Recipe_HighSpeedConnector_C: {
    name: 'High-Speed Connector',
    ingredients: [
      {
        item: 'Desc_HighSpeedWire_C',
        amount: 210,
      },
      {
        item: 'Desc_Cable_C',
        amount: 37.5,
      },
      {
        item: 'Desc_CircuitBoard_C',
        amount: 3.75,
      },
    ],
    products: [
      {
        item: 'Desc_HighSpeedConnector_C',
        amount: 3.75,
      },
    ],
  },
  Recipe_UnpackageSulfuricAcid_C: {
    name: 'Unpackage Sulfuric Acid',
    ingredients: [
      {
        item: 'Desc_PackagedSulfuricAcid_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_SulfuricAcid_C',
        amount: 60,
      },
      {
        item: 'Desc_FluidCanister_C',
        amount: 60,
      },
    ],
  },
  Recipe_Alternate_SuperStateComputer_C: {
    name: 'Alternate: Super-State Computer',
    ingredients: [
      {
        item: 'Desc_Computer_C',
        amount: 7.199999999999999,
      },
      {
        item: 'Desc_ElectromagneticControlRod_C',
        amount: 2.4,
      },
      {
        item: 'Desc_Battery_C',
        amount: 24,
      },
      {
        item: 'Desc_Wire_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_ComputerSuper_C',
        amount: 2.4,
      },
    ],
  },
  Recipe_ElectromagneticControlRod_C: {
    name: 'Electromagnetic Control Rod',
    ingredients: [
      {
        item: 'Desc_Stator_C',
        amount: 6,
      },
      {
        item: 'Desc_CircuitBoardHighSpeed_C',
        amount: 4,
      },
    ],
    products: [
      {
        item: 'Desc_ElectromagneticControlRod_C',
        amount: 4,
      },
    ],
  },
  Recipe_NuclearFuelRod_C: {
    name: 'Uranium Fuel Rod',
    ingredients: [
      {
        item: 'Desc_UraniumCell_C',
        amount: 20,
      },
      {
        item: 'Desc_SteelPlateReinforced_C',
        amount: 1.2000000000000002,
      },
      {
        item: 'Desc_ElectromagneticControlRod_C',
        amount: 2,
      },
    ],
    products: [
      {
        item: 'Desc_NuclearFuelRod_C',
        amount: 0.4,
      },
    ],
  },
  Recipe_SpaceElevatorPart_6_C: {
    name: 'Magnetic Field Generator',
    ingredients: [
      {
        item: 'Desc_SpaceElevatorPart_2_C',
        amount: 2.5,
      },
      {
        item: 'Desc_ElectromagneticControlRod_C',
        amount: 1,
      },
    ],
    products: [
      {
        item: 'Desc_SpaceElevatorPart_6_C',
        amount: 1,
      },
    ],
  },
  Recipe_Alternate_SloppyAlumina_C: {
    name: 'Alternate: Sloppy Alumina',
    ingredients: [
      {
        item: 'Desc_OreBauxite_C',
        amount: 200,
      },
      {
        item: 'Desc_Water_C',
        amount: 200,
      },
    ],
    products: [
      {
        item: 'Desc_AluminaSolution_C',
        amount: 240,
      },
    ],
  },
  Recipe_Alternate_RadioControlSystem_C: {
    name: 'Alternate: Radio Control System',
    ingredients: [
      {
        item: 'Desc_CrystalOscillator_C',
        amount: 1.5,
      },
      {
        item: 'Desc_CircuitBoard_C',
        amount: 15,
      },
      {
        item: 'Desc_AluminumCasing_C',
        amount: 90,
      },
      {
        item: 'Desc_Rubber_C',
        amount: 45,
      },
    ],
    products: [
      {
        item: 'Desc_ModularFrameLightweight_C',
        amount: 4.5,
      },
    ],
  },
  Recipe_Alternate_PlutoniumFuelUnit_C: {
    name: 'Alternate: Plutonium Fuel Unit',
    ingredients: [
      {
        item: 'Desc_PlutoniumCell_C',
        amount: 10,
      },
      {
        item: 'Desc_PressureConversionCube_C',
        amount: 0.5,
      },
    ],
    products: [
      {
        item: 'Desc_PlutoniumFuelRod_C',
        amount: 0.5,
      },
    ],
  },
  Recipe_Alternate_OCSupercomputer_C: {
    name: 'Alternate: OC Supercomputer',
    ingredients: [
      {
        item: 'Desc_ModularFrameLightweight_C',
        amount: 6,
      },
      {
        item: 'Desc_CoolingSystem_C',
        amount: 6,
      },
    ],
    products: [
      {
        item: 'Desc_ComputerSuper_C',
        amount: 3,
      },
    ],
  },
  Recipe_HeatSink_C: {
    name: 'Heat Sink',
    ingredients: [
      {
        item: 'Desc_AluminumPlate_C',
        amount: 37.5,
      },
      {
        item: 'Desc_CopperSheet_C',
        amount: 22.5,
      },
    ],
    products: [
      {
        item: 'Desc_AluminumPlateReinforced_C',
        amount: 7.5,
      },
    ],
  },
  Recipe_FusedModularFrame_C: {
    name: 'Fused Modular Frame',
    ingredients: [
      {
        item: 'Desc_ModularFrameHeavy_C',
        amount: 1.5,
      },
      {
        item: 'Desc_AluminumCasing_C',
        amount: 75,
      },
      {
        item: 'Desc_NitrogenGas_C',
        amount: 37.5,
      },
    ],
    products: [
      {
        item: 'Desc_ModularFrameFused_C',
        amount: 1.5,
      },
    ],
  },
  Recipe_GasTank_C: {
    name: 'Empty Fluid Tank',
    ingredients: [
      {
        item: 'Desc_AluminumIngot_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_GasTank_C',
        amount: 60,
      },
    ],
  },
  Recipe_PackagedNitrogen_C: {
    name: 'Packaged Nitrogen Gas',
    ingredients: [
      {
        item: 'Desc_NitrogenGas_C',
        amount: 240,
      },
      {
        item: 'Desc_GasTank_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_PackagedNitrogenGas_C',
        amount: 60,
      },
    ],
  },
  Recipe_UnpackageNitrogen_C: {
    name: 'Unpackage Nitrogen Gas',
    ingredients: [
      {
        item: 'Desc_PackagedNitrogenGas_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_NitrogenGas_C',
        amount: 240,
      },
      {
        item: 'Desc_GasTank_C',
        amount: 60,
      },
    ],
  },
  Recipe_Alternate_InstantScrap_C: {
    name: 'Alternate: Instant Scrap',
    ingredients: [
      {
        item: 'Desc_OreBauxite_C',
        amount: 150,
      },
      {
        item: 'Desc_Coal_C',
        amount: 100,
      },
      {
        item: 'Desc_SulfuricAcid_C',
        amount: 50,
      },
      {
        item: 'Desc_Water_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_AluminumScrap_C',
        amount: 300,
      },
      {
        item: 'Desc_Water_C',
        amount: 50,
      },
    ],
  },
  Recipe_Alternate_InstantPlutoniumCell_C: {
    name: 'Alternate: Instant Plutonium Cell',
    ingredients: [
      {
        item: 'Desc_NonFissibleUranium_C',
        amount: 75,
      },
      {
        item: 'Desc_AluminumCasing_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_PlutoniumCell_C',
        amount: 10,
      },
    ],
  },
  Recipe_Alternate_HeatFusedFrame_C: {
    name: 'Alternate: Heat-Fused Frame',
    ingredients: [
      {
        item: 'Desc_ModularFrameHeavy_C',
        amount: 3,
      },
      {
        item: 'Desc_AluminumIngot_C',
        amount: 150,
      },
      {
        item: 'Desc_NitricAcid_C',
        amount: 24,
      },
      {
        item: 'Desc_LiquidFuel_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_ModularFrameFused_C',
        amount: 3,
      },
    ],
  },
  Recipe_Alternate_FertileUranium_C: {
    name: 'Alternate: Fertile Uranium',
    ingredients: [
      {
        item: 'Desc_OreUranium_C',
        amount: 25,
      },
      {
        item: 'Desc_NuclearWaste_C',
        amount: 25,
      },
      {
        item: 'Desc_NitricAcid_C',
        amount: 15,
      },
      {
        item: 'Desc_SulfuricAcid_C',
        amount: 25,
      },
    ],
    products: [
      {
        item: 'Desc_NonFissibleUranium_C',
        amount: 100,
      },
      {
        item: 'Desc_Water_C',
        amount: 40,
      },
    ],
  },
  Recipe_Alternate_ElectricMotor_C: {
    name: 'Alternate: Electric Motor',
    ingredients: [
      {
        item: 'Desc_ElectromagneticControlRod_C',
        amount: 3.75,
      },
      {
        item: 'Desc_Rotor_C',
        amount: 7.5,
      },
    ],
    products: [
      {
        item: 'Desc_Motor_C',
        amount: 7.5,
      },
    ],
  },
  Recipe_Alternate_DilutedFuel_C: {
    name: 'Alternate: Diluted Fuel',
    ingredients: [
      {
        item: 'Desc_HeavyOilResidue_C',
        amount: 50,
      },
      {
        item: 'Desc_Water_C',
        amount: 100,
      },
    ],
    products: [
      {
        item: 'Desc_LiquidFuel_C',
        amount: 100,
      },
    ],
  },
  Recipe_Alternate_CoolingDevice_C: {
    name: 'Alternate: Cooling Device',
    ingredients: [
      {
        item: 'Desc_AluminumPlateReinforced_C',
        amount: 10,
      },
      {
        item: 'Desc_Motor_C',
        amount: 2.5,
      },
      {
        item: 'Desc_NitrogenGas_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_CoolingSystem_C',
        amount: 5,
      },
    ],
  },
  Recipe_Alternate_ClassicBattery_C: {
    name: 'Alternate: Classic Battery',
    ingredients: [
      {
        item: 'Desc_Sulfur_C',
        amount: 45,
      },
      {
        item: 'Desc_AluminumPlate_C',
        amount: 52.5,
      },
      {
        item: 'Desc_Plastic_C',
        amount: 60,
      },
      {
        item: 'Desc_Wire_C',
        amount: 90,
      },
    ],
    products: [
      {
        item: 'Desc_Battery_C',
        amount: 30,
      },
    ],
  },
  Recipe_Alternate_AutomatedMiner_C: {
    name: 'Alternate: Automated Miner',
    ingredients: [
      {
        item: 'Desc_SteelPipe_C',
        amount: 4,
      },
      {
        item: 'Desc_IronPlate_C',
        amount: 4,
      },
    ],
    products: [
      {
        item: 'BP_ItemDescriptorPortableMiner_C',
        amount: 1,
      },
    ],
  },
  Recipe_Alternate_AlcladCasing_C: {
    name: 'Alternate: Alclad Casing',
    ingredients: [
      {
        item: 'Desc_AluminumIngot_C',
        amount: 150,
      },
      {
        item: 'Desc_CopperIngot_C',
        amount: 75,
      },
    ],
    products: [
      {
        item: 'Desc_AluminumCasing_C',
        amount: 112.5,
      },
    ],
  },
  Recipe_Alternate_SteelPipe_Molded_C: {
    name: 'Alternate: Molded Steel Pipe',
    ingredients: [
      {
        item: 'Desc_SteelIngot_C',
        amount: 50,
      },
      {
        item: 'Desc_Cement_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_SteelPipe_C',
        amount: 50,
      },
    ],
  },
  Recipe_Alternate_SteelPipe_Iron_C: {
    name: 'Alternate: Iron Pipe',
    ingredients: [
      {
        item: 'Desc_IronIngot_C',
        amount: 100,
      },
    ],
    products: [
      {
        item: 'Desc_SteelPipe_C',
        amount: 25,
      },
    ],
  },
  Recipe_Alternate_SteelCastedPlate_C: {
    name: 'Alternate: Steel Cast Plate',
    ingredients: [
      {
        item: 'Desc_IronIngot_C',
        amount: 15,
      },
      {
        item: 'Desc_SteelIngot_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_IronPlate_C',
        amount: 45,
      },
    ],
  },
  Recipe_Alternate_SteelBeam_Molded_C: {
    name: 'Alternate: Molded Beam',
    ingredients: [
      {
        item: 'Desc_SteelIngot_C',
        amount: 120,
      },
      {
        item: 'Desc_Cement_C',
        amount: 80,
      },
    ],
    products: [
      {
        item: 'Desc_SteelPlate_C',
        amount: 45,
      },
    ],
  },
  Recipe_Alternate_SteelBeam_Aluminum_C: {
    name: 'Alternate: Aluminum Beam',
    ingredients: [
      {
        item: 'Desc_AluminumIngot_C',
        amount: 22.5,
      },
    ],
    products: [
      {
        item: 'Desc_SteelPlate_C',
        amount: 22.5,
      },
    ],
  },
  Recipe_Alternate_AluminumRod_C: {
    name: 'Alternate: Aluminum Rod',
    ingredients: [
      {
        item: 'Desc_AluminumIngot_C',
        amount: 7.5,
      },
    ],
    products: [
      {
        item: 'Desc_IronRod_C',
        amount: 52.5,
      },
    ],
  },
  Recipe_Alternate_AILimiter_Plastic_C: {
    name: 'Alternate: Plastic AI Limiter',
    ingredients: [
      {
        item: 'Desc_HighSpeedWire_C',
        amount: 120,
      },
      {
        item: 'Desc_Plastic_C',
        amount: 28,
      },
    ],
    products: [
      {
        item: 'Desc_CircuitBoardHighSpeed_C',
        amount: 8,
      },
    ],
  },
  Recipe_Alternate_Silica_Distilled_C: {
    name: 'Alternate: Distilled Silica',
    ingredients: [
      {
        item: 'Desc_DissolvedSilica_C',
        amount: 120,
      },
      {
        item: 'Desc_Stone_C',
        amount: 50,
      },
      {
        item: 'Desc_Water_C',
        amount: 100,
      },
    ],
    products: [
      {
        item: 'Desc_Silica_C',
        amount: 270,
      },
      {
        item: 'Desc_Water_C',
        amount: 80,
      },
    ],
  },
  Recipe_Alternate_Quartz_Purified_C: {
    name: 'Alternate: Quartz Purification',
    ingredients: [
      {
        item: 'Desc_RawQuartz_C',
        amount: 120,
      },
      {
        item: 'Desc_NitricAcid_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_QuartzCrystal_C',
        amount: 75,
      },
      {
        item: 'Desc_DissolvedSilica_C',
        amount: 60,
      },
    ],
  },
  Recipe_Alternate_Quartz_Fused_C: {
    name: 'Alternate: Fused Quartz Crystal',
    ingredients: [
      {
        item: 'Desc_RawQuartz_C',
        amount: 75,
      },
      {
        item: 'Desc_Coal_C',
        amount: 36,
      },
    ],
    products: [
      {
        item: 'Desc_QuartzCrystal_C',
        amount: 54,
      },
    ],
  },
  Recipe_Alternate_IronIngot_Leached_C: {
    name: 'Alternate: Leached Iron ingot',
    ingredients: [
      {
        item: 'Desc_OreIron_C',
        amount: 50,
      },
      {
        item: 'Desc_SulfuricAcid_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_IronIngot_C',
        amount: 100,
      },
    ],
  },
  Recipe_Alternate_IronIngot_Basic_C: {
    name: 'Alternate: Basic Iron Ingot',
    ingredients: [
      {
        item: 'Desc_OreIron_C',
        amount: 25,
      },
      {
        item: 'Desc_Stone_C',
        amount: 40,
      },
    ],
    products: [
      {
        item: 'Desc_IronIngot_C',
        amount: 50,
      },
    ],
  },
  Recipe_Alternate_CopperIngot_Tempered_C: {
    name: 'Alternate: Tempered Copper Ingot',
    ingredients: [
      {
        item: 'Desc_OreCopper_C',
        amount: 25,
      },
      {
        item: 'Desc_PetroleumCoke_C',
        amount: 40,
      },
    ],
    products: [
      {
        item: 'Desc_CopperIngot_C',
        amount: 60,
      },
    ],
  },
  Recipe_Alternate_CopperIngot_Leached_C: {
    name: 'Alternate: Leached Copper Ingot',
    ingredients: [
      {
        item: 'Desc_OreCopper_C',
        amount: 45,
      },
      {
        item: 'Desc_SulfuricAcid_C',
        amount: 25,
      },
    ],
    products: [
      {
        item: 'Desc_CopperIngot_C',
        amount: 110,
      },
    ],
  },
  Recipe_Alternate_CateriumIngot_Tempered_C: {
    name: 'Alternate: Tempered Caterium Ingot',
    ingredients: [
      {
        item: 'Desc_OreGold_C',
        amount: 45,
      },
      {
        item: 'Desc_PetroleumCoke_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_GoldIngot_C',
        amount: 22.5,
      },
    ],
  },
  Recipe_Alternate_CateriumIngot_Leached_C: {
    name: 'Alternate: Leached Caterium Ingot',
    ingredients: [
      {
        item: 'Desc_OreGold_C',
        amount: 54,
      },
      {
        item: 'Desc_SulfuricAcid_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_GoldIngot_C',
        amount: 36,
      },
    ],
  },
  Recipe_Alternate_Wire_2_C: {
    name: 'Alternate: Caterium Wire',
    ingredients: [
      {
        item: 'Desc_GoldIngot_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_Wire_C',
        amount: 120,
      },
    ],
  },
  Recipe_Alternate_Wire_1_C: {
    name: 'Alternate: Iron Wire',
    ingredients: [
      {
        item: 'Desc_IronIngot_C',
        amount: 12.5,
      },
    ],
    products: [
      {
        item: 'Desc_Wire_C',
        amount: 22.5,
      },
    ],
  },
  Recipe_Alternate_UraniumCell_1_C: {
    name: 'Alternate: Infused Uranium Cell',
    ingredients: [
      {
        item: 'Desc_OreUranium_C',
        amount: 25,
      },
      {
        item: 'Desc_Silica_C',
        amount: 15,
      },
      {
        item: 'Desc_Sulfur_C',
        amount: 25,
      },
      {
        item: 'Desc_HighSpeedWire_C',
        amount: 75,
      },
    ],
    products: [
      {
        item: 'Desc_UraniumCell_C',
        amount: 20,
      },
    ],
  },
  Recipe_IngotCaterium_C: {
    name: 'Caterium Ingot',
    ingredients: [
      {
        item: 'Desc_OreGold_C',
        amount: 45,
      },
    ],
    products: [
      {
        item: 'Desc_GoldIngot_C',
        amount: 15,
      },
    ],
  },
  Recipe_Alternate_TurboMotor_1_C: {
    name: 'Alternate: Turbo Electric Motor',
    ingredients: [
      {
        item: 'Desc_Motor_C',
        amount: 6.5625,
      },
      {
        item: 'Desc_ModularFrameLightweight_C',
        amount: 8.4375,
      },
      {
        item: 'Desc_ElectromagneticControlRod_C',
        amount: 4.6875,
      },
      {
        item: 'Desc_Rotor_C',
        amount: 6.5625,
      },
    ],
    products: [
      {
        item: 'Desc_MotorLightweight_C',
        amount: 2.8125,
      },
    ],
  },
  Recipe_MotorTurbo_C: {
    name: 'Turbo Motor',
    ingredients: [
      {
        item: 'Desc_CoolingSystem_C',
        amount: 7.5,
      },
      {
        item: 'Desc_ModularFrameLightweight_C',
        amount: 3.75,
      },
      {
        item: 'Desc_Motor_C',
        amount: 7.5,
      },
      {
        item: 'Desc_Rubber_C',
        amount: 45,
      },
    ],
    products: [
      {
        item: 'Desc_MotorLightweight_C',
        amount: 1.875,
      },
    ],
  },
  Recipe_SpaceElevatorPart_8_C: {
    name: 'Thermal Propulsion Rocket',
    ingredients: [
      {
        item: 'Desc_SpaceElevatorPart_4_C',
        amount: 2.5,
      },
      {
        item: 'Desc_MotorLightweight_C',
        amount: 1,
      },
      {
        item: 'Desc_CoolingSystem_C',
        amount: 3,
      },
      {
        item: 'Desc_ModularFrameFused_C',
        amount: 1,
      },
    ],
    products: [
      {
        item: 'Desc_SpaceElevatorPart_8_C',
        amount: 1,
      },
    ],
  },
  Recipe_Alternate_Stator_C: {
    name: 'Alternate: Quickwire Stator',
    ingredients: [
      {
        item: 'Desc_SteelPipe_C',
        amount: 16,
      },
      {
        item: 'Desc_HighSpeedWire_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_Stator_C',
        amount: 8,
      },
    ],
  },
  Recipe_Alternate_Silica_C: {
    name: 'Alternate: Cheap Silica',
    ingredients: [
      {
        item: 'Desc_RawQuartz_C',
        amount: 22.5,
      },
      {
        item: 'Desc_Stone_C',
        amount: 37.5,
      },
    ],
    products: [
      {
        item: 'Desc_Silica_C',
        amount: 52.5,
      },
    ],
  },
  Recipe_Alternate_Screw_2_C: {
    name: 'Alternate: Steel Screw',
    ingredients: [
      {
        item: 'Desc_SteelPlate_C',
        amount: 5,
      },
    ],
    products: [
      {
        item: 'Desc_IronScrew_C',
        amount: 260,
      },
    ],
  },
  Recipe_Alternate_Screw_C: {
    name: 'Alternate: Cast Screw',
    ingredients: [
      {
        item: 'Desc_IronIngot_C',
        amount: 12.5,
      },
    ],
    products: [
      {
        item: 'Desc_IronScrew_C',
        amount: 50,
      },
    ],
  },
  Recipe_Alternate_Rotor_C: {
    name: 'Alternate: Steel Rotor',
    ingredients: [
      {
        item: 'Desc_SteelPipe_C',
        amount: 10,
      },
      {
        item: 'Desc_Wire_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_Rotor_C',
        amount: 5,
      },
    ],
  },
  Recipe_Alternate_EncasedIndustrialBeam_C: {
    name: 'Alternate: Encased Industrial Pipe',
    ingredients: [
      {
        item: 'Desc_SteelPipe_C',
        amount: 24,
      },
      {
        item: 'Desc_Cement_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'Desc_SteelPlateReinforced_C',
        amount: 4,
      },
    ],
  },
  Recipe_Alternate_ReinforcedIronPlate_2_C: {
    name: 'Alternate: Stitched Iron Plate',
    ingredients: [
      {
        item: 'Desc_IronPlate_C',
        amount: 18.75,
      },
      {
        item: 'Desc_Wire_C',
        amount: 37.5,
      },
    ],
    products: [
      {
        item: 'Desc_IronPlateReinforced_C',
        amount: 5.625,
      },
    ],
  },
  Recipe_Alternate_ReinforcedIronPlate_1_C: {
    name: 'Alternate: Bolted Iron Plate',
    ingredients: [
      {
        item: 'Desc_IronPlate_C',
        amount: 90,
      },
      {
        item: 'Desc_IronScrew_C',
        amount: 250,
      },
    ],
    products: [
      {
        item: 'Desc_IronPlateReinforced_C',
        amount: 15,
      },
    ],
  },
  Recipe_Alternate_RadioControlUnit_1_C: {
    name: 'Alternate: Radio Connection Unit',
    ingredients: [
      {
        item: 'Desc_AluminumPlateReinforced_C',
        amount: 15,
      },
      {
        item: 'Desc_HighSpeedConnector_C',
        amount: 7.5,
      },
      {
        item: 'Desc_QuartzCrystal_C',
        amount: 45,
      },
    ],
    products: [
      {
        item: 'Desc_ModularFrameLightweight_C',
        amount: 3.75,
      },
    ],
  },
  Recipe_Alternate_Quickwire_C: {
    name: 'Alternate: Fused Quickwire',
    ingredients: [
      {
        item: 'Desc_GoldIngot_C',
        amount: 7.5,
      },
      {
        item: 'Desc_CopperIngot_C',
        amount: 37.5,
      },
    ],
    products: [
      {
        item: 'Desc_HighSpeedWire_C',
        amount: 90,
      },
    ],
  },
  Recipe_Alternate_Plastic_1_C: {
    name: 'Alternate: Recycled Plastic',
    ingredients: [
      {
        item: 'Desc_Rubber_C',
        amount: 30,
      },
      {
        item: 'Desc_LiquidFuel_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_Plastic_C',
        amount: 60,
      },
    ],
  },
  Recipe_Alternate_NuclearFuelRod_1_C: {
    name: 'Alternate: Uranium Fuel Unit',
    ingredients: [
      {
        item: 'Desc_UraniumCell_C',
        amount: 20,
      },
      {
        item: 'Desc_ElectromagneticControlRod_C',
        amount: 2,
      },
      {
        item: 'Desc_CrystalOscillator_C',
        amount: 0.6000000000000001,
      },
      {
        item: 'Desc_Rotor_C',
        amount: 2,
      },
    ],
    products: [
      {
        item: 'Desc_NuclearFuelRod_C',
        amount: 0.6000000000000001,
      },
    ],
  },
  Recipe_Alternate_Motor_1_C: {
    name: 'Alternate: Rigor Motor',
    ingredients: [
      {
        item: 'Desc_Rotor_C',
        amount: 3.75,
      },
      {
        item: 'Desc_Stator_C',
        amount: 3.75,
      },
      {
        item: 'Desc_CrystalOscillator_C',
        amount: 1.25,
      },
    ],
    products: [
      {
        item: 'Desc_Motor_C',
        amount: 7.5,
      },
    ],
  },
  Recipe_Alternate_ModularFrame_C: {
    name: 'Alternate: Steeled Frame',
    ingredients: [
      {
        item: 'Desc_IronPlateReinforced_C',
        amount: 2,
      },
      {
        item: 'Desc_SteelPipe_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_ModularFrame_C',
        amount: 3,
      },
    ],
  },
  Recipe_Alternate_IngotSteel_2_C: {
    name: 'Alternate: Compacted Steel Ingot',
    ingredients: [
      {
        item: 'Desc_OreIron_C',
        amount: 5,
      },
      {
        item: 'Desc_CompactedCoal_C',
        amount: 2.5,
      },
    ],
    products: [
      {
        item: 'Desc_SteelIngot_C',
        amount: 10,
      },
    ],
  },
  Recipe_Alternate_IngotSteel_1_C: {
    name: 'Alternate: Solid Steel Ingot',
    ingredients: [
      {
        item: 'Desc_IronIngot_C',
        amount: 40,
      },
      {
        item: 'Desc_Coal_C',
        amount: 40,
      },
    ],
    products: [
      {
        item: 'Desc_SteelIngot_C',
        amount: 60,
      },
    ],
  },
  Recipe_Alternate_IngotIron_C: {
    name: 'Alternate: Iron Alloy Ingot',
    ingredients: [
      {
        item: 'Desc_OreIron_C',
        amount: 40,
      },
      {
        item: 'Desc_OreCopper_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_IronIngot_C',
        amount: 75,
      },
    ],
  },
  Recipe_Alternate_HighSpeedConnector_C: {
    name: 'Alternate: Silicon High-Speed Connector',
    ingredients: [
      {
        item: 'Desc_HighSpeedWire_C',
        amount: 90,
      },
      {
        item: 'Desc_Silica_C',
        amount: 37.5,
      },
      {
        item: 'Desc_CircuitBoard_C',
        amount: 3,
      },
    ],
    products: [
      {
        item: 'Desc_HighSpeedConnector_C',
        amount: 3,
      },
    ],
  },
  Recipe_Alternate_ModularFrameHeavy_C: {
    name: 'Alternate: Heavy Encased Frame',
    ingredients: [
      {
        item: 'Desc_ModularFrame_C',
        amount: 7.5,
      },
      {
        item: 'Desc_SteelPlateReinforced_C',
        amount: 9.375,
      },
      {
        item: 'Desc_SteelPipe_C',
        amount: 33.75,
      },
      {
        item: 'Desc_Cement_C',
        amount: 20.625,
      },
    ],
    products: [
      {
        item: 'Desc_ModularFrameHeavy_C',
        amount: 2.8125,
      },
    ],
  },
  Recipe_Alternate_HeatSink_1_C: {
    name: 'Alternate: Heat Exchanger',
    ingredients: [
      {
        item: 'Desc_AluminumCasing_C',
        amount: 30,
      },
      {
        item: 'Desc_Rubber_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_AluminumPlateReinforced_C',
        amount: 10,
      },
    ],
  },
  Recipe_Alternate_Gunpowder_1_C: {
    name: 'Alternate: Fine Black Powder',
    ingredients: [
      {
        item: 'Desc_Sulfur_C',
        amount: 7.5,
      },
      {
        item: 'Desc_CompactedCoal_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_Gunpowder_C',
        amount: 45,
      },
    ],
  },
  Recipe_Alternate_ElectromagneticControlRod_1_C: {
    name: 'Alternate: Electromagnetic Connection Rod',
    ingredients: [
      {
        item: 'Desc_Stator_C',
        amount: 8,
      },
      {
        item: 'Desc_HighSpeedConnector_C',
        amount: 4,
      },
    ],
    products: [
      {
        item: 'Desc_ElectromagneticControlRod_C',
        amount: 8,
      },
    ],
  },
  Recipe_Alternate_CrystalOscillator_C: {
    name: 'Alternate: Insulated Crystal Oscillator',
    ingredients: [
      {
        item: 'Desc_QuartzCrystal_C',
        amount: 18.75,
      },
      {
        item: 'Desc_Rubber_C',
        amount: 13.125,
      },
      {
        item: 'Desc_CircuitBoardHighSpeed_C',
        amount: 1.875,
      },
    ],
    products: [
      {
        item: 'Desc_CrystalOscillator_C',
        amount: 1.875,
      },
    ],
  },
  Recipe_Alternate_Concrete_C: {
    name: 'Alternate: Fine Concrete',
    ingredients: [
      {
        item: 'Desc_Silica_C',
        amount: 15,
      },
      {
        item: 'Desc_Stone_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_Cement_C',
        amount: 50,
      },
    ],
  },
  Recipe_Alternate_Computer_2_C: {
    name: 'Alternate: Crystal Computer',
    ingredients: [
      {
        item: 'Desc_CircuitBoard_C',
        amount: 5,
      },
      {
        item: 'Desc_CrystalOscillator_C',
        amount: 1.6666666666666667,
      },
    ],
    products: [
      {
        item: 'Desc_Computer_C',
        amount: 3.3333333333333335,
      },
    ],
  },
  Recipe_Alternate_Computer_1_C: {
    name: 'Alternate: Caterium Computer',
    ingredients: [
      {
        item: 'Desc_CircuitBoard_C',
        amount: 15,
      },
      {
        item: 'Desc_HighSpeedWire_C',
        amount: 52.5,
      },
      {
        item: 'Desc_Rubber_C',
        amount: 22.5,
      },
    ],
    products: [
      {
        item: 'Desc_Computer_C',
        amount: 3.75,
      },
    ],
  },
  Recipe_Alternate_CircuitBoard_2_C: {
    name: 'Alternate: Caterium Circuit Board',
    ingredients: [
      {
        item: 'Desc_Plastic_C',
        amount: 12.5,
      },
      {
        item: 'Desc_HighSpeedWire_C',
        amount: 37.5,
      },
    ],
    products: [
      {
        item: 'Desc_CircuitBoard_C',
        amount: 8.75,
      },
    ],
  },
  Recipe_Alternate_CircuitBoard_1_C: {
    name: 'Alternate: Silicon Circuit Board',
    ingredients: [
      {
        item: 'Desc_CopperSheet_C',
        amount: 27.5,
      },
      {
        item: 'Desc_Silica_C',
        amount: 27.5,
      },
    ],
    products: [
      {
        item: 'Desc_CircuitBoard_C',
        amount: 12.5,
      },
    ],
  },
  Recipe_Alternate_Cable_2_C: {
    name: 'Alternate: Quickwire Cable',
    ingredients: [
      {
        item: 'Desc_HighSpeedWire_C',
        amount: 7.5,
      },
      {
        item: 'Desc_Rubber_C',
        amount: 5,
      },
    ],
    products: [
      {
        item: 'Desc_Cable_C',
        amount: 27.5,
      },
    ],
  },
  Recipe_Alternate_Cable_1_C: {
    name: 'Alternate: Insulated Cable',
    ingredients: [
      {
        item: 'Desc_Wire_C',
        amount: 45,
      },
      {
        item: 'Desc_Rubber_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_Cable_C',
        amount: 100,
      },
    ],
  },
  Recipe_Ficsonium_C: {
    name: 'Ficsonium',
    ingredients: [
      {
        item: 'Desc_PlutoniumWaste_C',
        amount: 10,
      },
      {
        item: 'Desc_SingularityCell_C',
        amount: 10,
      },
      {
        item: 'Desc_DarkEnergy_C',
        amount: 200,
      },
    ],
    products: [
      {
        item: 'Desc_Ficsonium_C',
        amount: 10,
      },
    ],
  },
  Recipe_FicsoniumFuelRod_C: {
    name: 'Ficsonium Fuel Rod',
    ingredients: [
      {
        item: 'Desc_Ficsonium_C',
        amount: 5,
      },
      {
        item: 'Desc_ElectromagneticControlRod_C',
        amount: 5,
      },
      {
        item: 'Desc_FicsiteMesh_C',
        amount: 100,
      },
      {
        item: 'Desc_QuantumEnergy_C',
        amount: 50,
      },
    ],
    products: [
      {
        item: 'Desc_FicsoniumFuelRod_C',
        amount: 2.5,
      },
      {
        item: 'Desc_DarkEnergy_C',
        amount: 50,
      },
    ],
  },
  Recipe_SingularityCell_C: {
    name: 'Singularity Cell',
    ingredients: [
      {
        item: 'Desc_SpaceElevatorPart_9_C',
        amount: 1,
      },
      {
        item: 'Desc_DarkMatter_C',
        amount: 20,
      },
      {
        item: 'Desc_IronPlate_C',
        amount: 100,
      },
      {
        item: 'Desc_Cement_C',
        amount: 200,
      },
    ],
    products: [
      {
        item: 'Desc_SingularityCell_C',
        amount: 10,
      },
    ],
  },
  Recipe_SpaceElevatorPart_11_C: {
    name: 'Ballistic Warp Drive',
    ingredients: [
      {
        item: 'Desc_SpaceElevatorPart_8_C',
        amount: 1,
      },
      {
        item: 'Desc_SingularityCell_C',
        amount: 5,
      },
      {
        item: 'Desc_QuantumOscillator_C',
        amount: 2,
      },
      {
        item: 'Desc_DarkMatter_C',
        amount: 40,
      },
    ],
    products: [
      {
        item: 'Desc_SpaceElevatorPart_11_C',
        amount: 1,
      },
    ],
  },
  Recipe_Hoverpack_C: {
    name: 'Hoverpack',
    ingredients: [
      {
        item: 'Desc_Motor_C',
        amount: 4,
      },
      {
        item: 'Desc_ModularFrameHeavy_C',
        amount: 2,
      },
      {
        item: 'Desc_Computer_C',
        amount: 4,
      },
      {
        item: 'Desc_AluminumPlate_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'BP_EquipmentDescriptorHoverPack_C',
        amount: 0.5,
      },
    ],
  },
  Recipe_FilterHazmat_C: {
    name: 'Iodine-Infused Filter',
    ingredients: [
      {
        item: 'Desc_Filter_C',
        amount: 3.75,
      },
      {
        item: 'Desc_HighSpeedWire_C',
        amount: 30,
      },
      {
        item: 'Desc_AluminumCasing_C',
        amount: 3.75,
      },
    ],
    products: [
      {
        item: 'Desc_HazmatFilter_C',
        amount: 3.75,
      },
    ],
  },
  Recipe_HazmatSuit_C: {
    name: 'Hazmat Suit',
    ingredients: [
      {
        item: 'Desc_Rubber_C',
        amount: 25,
      },
      {
        item: 'Desc_Plastic_C',
        amount: 25,
      },
      {
        item: 'Desc_AluminumPlate_C',
        amount: 25,
      },
      {
        item: 'Desc_Fabric_C',
        amount: 25,
      },
    ],
    products: [
      {
        item: 'BP_EquipmentDescriptorHazmatSuit_C',
        amount: 0.5,
      },
    ],
  },
  Recipe_JetPack_C: {
    name: 'Jetpack',
    ingredients: [
      {
        item: 'Desc_Motor_C',
        amount: 5,
      },
      {
        item: 'Desc_SteelPipe_C',
        amount: 10,
      },
      {
        item: 'Desc_IronPlate_C',
        amount: 25,
      },
      {
        item: 'Desc_Wire_C',
        amount: 50,
      },
    ],
    products: [
      {
        item: 'BP_EquipmentDescriptorJetPack_C',
        amount: 1,
      },
    ],
  },
  Recipe_Quickwire_C: {
    name: 'Quickwire',
    ingredients: [
      {
        item: 'Desc_GoldIngot_C',
        amount: 12,
      },
    ],
    products: [
      {
        item: 'Desc_HighSpeedWire_C',
        amount: 60,
      },
    ],
  },
  Recipe_XenoBasher_C: {
    name: 'Xeno-Basher',
    ingredients: [
      {
        item: 'BP_EquipmentDescriptorShockShank_C',
        amount: 1.5,
      },
      {
        item: 'Desc_ModularFrame_C',
        amount: 3.75,
      },
      {
        item: 'Desc_IronRod_C',
        amount: 18.75,
      },
      {
        item: 'Desc_Wire_C',
        amount: 375,
      },
    ],
    products: [
      {
        item: 'BP_EquipmentDescriptorStunSpear_C',
        amount: 0.75,
      },
    ],
  },
  Recipe_Biofuel_C: {
    name: 'Solid Biofuel',
    ingredients: [
      {
        item: 'Desc_GenericBiomass_C',
        amount: 120,
      },
    ],
    products: [
      {
        item: 'Desc_Biofuel_C',
        amount: 60,
      },
    ],
  },
  Recipe_Chainsaw_C: {
    name: 'Chainsaw',
    ingredients: [
      {
        item: 'Desc_IronPlateReinforced_C',
        amount: 5,
      },
      {
        item: 'Desc_IronRod_C',
        amount: 25,
      },
      {
        item: 'Desc_IronScrew_C',
        amount: 160,
      },
      {
        item: 'Desc_Cable_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_Chainsaw_C',
        amount: 1,
      },
    ],
  },
  Recipe_Protein_Hog_C: {
    name: 'Hog Protein',
    ingredients: [
      {
        item: 'Desc_HogParts_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'Desc_AlienProtein_C',
        amount: 20,
      },
    ],
  },
  Recipe_Protein_Spitter_C: {
    name: 'Spitter Protein',
    ingredients: [
      {
        item: 'Desc_SpitterParts_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'Desc_AlienProtein_C',
        amount: 20,
      },
    ],
  },
  Recipe_Biomass_Mycelia_C: {
    name: 'Biomass (Mycelia)',
    ingredients: [
      {
        item: 'Desc_Mycelia_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_GenericBiomass_C',
        amount: 150,
      },
    ],
  },
  Recipe_PowerCrystalShard_1_C: {
    name: 'Power Shard (1)',
    ingredients: [
      {
        item: 'Desc_Crystal_C',
        amount: 7.5,
      },
    ],
    products: [
      {
        item: 'Desc_CrystalShard_C',
        amount: 7.5,
      },
    ],
  },
  Recipe_Gunpowder_C: {
    name: 'Black Powder',
    ingredients: [
      {
        item: 'Desc_Coal_C',
        amount: 15,
      },
      {
        item: 'Desc_Sulfur_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_Gunpowder_C',
        amount: 30,
      },
    ],
  },
  Recipe_AlienPowerFuel_C: {
    name: 'Alien Power Matrix',
    ingredients: [
      {
        item: 'Desc_SAMFluctuator_C',
        amount: 12.5,
      },
      {
        item: 'Desc_CrystalShard_C',
        amount: 7.5,
      },
      {
        item: 'Desc_QuantumOscillator_C',
        amount: 7.5,
      },
      {
        item: 'Desc_QuantumEnergy_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_AlienPowerFuel_C',
        amount: 2.5,
      },
      {
        item: 'Desc_DarkEnergy_C',
        amount: 60,
      },
    ],
  },
  Recipe_ObjectScanner_C: {
    name: 'Object Scanner',
    ingredients: [
      {
        item: 'Desc_IronPlateReinforced_C',
        amount: 6,
      },
      {
        item: 'Desc_Wire_C',
        amount: 30,
      },
      {
        item: 'Desc_IronScrew_C',
        amount: 75,
      },
    ],
    products: [
      {
        item: 'BP_EquipmentDescriptorObjectScanner_C',
        amount: 1.5,
      },
    ],
  },
  Recipe_Protein_Stinger_C: {
    name: 'Stinger Protein',
    ingredients: [
      {
        item: 'Desc_StingerParts_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'Desc_AlienProtein_C',
        amount: 20,
      },
    ],
  },
  Recipe_Protein_Crab_C: {
    name: 'Hatcher Protein',
    ingredients: [
      {
        item: 'Desc_HatcherParts_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'Desc_AlienProtein_C',
        amount: 20,
      },
    ],
  },
  Recipe_AlienDNACapsule_C: {
    name: 'Alien DNA Capsule',
    ingredients: [
      {
        item: 'Desc_AlienProtein_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_AlienDNACapsule_C',
        amount: 10,
      },
    ],
  },
  Recipe_Biomass_AlienProtein_C: {
    name: 'Biomass (Alien Protein)',
    ingredients: [
      {
        item: 'Desc_AlienProtein_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_GenericBiomass_C',
        amount: 1500,
      },
    ],
  },
  Recipe_MedicinalInhalerAlienOrgans_C: {
    name: 'Protein Inhaler',
    ingredients: [
      {
        item: 'Desc_AlienProtein_C',
        amount: 3,
      },
      {
        item: 'Desc_Nut_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_Medkit_C',
        amount: 3,
      },
    ],
  },
  Recipe_SpikedRebar_C: {
    name: 'Iron Rebar',
    ingredients: [
      {
        item: 'Desc_IronRod_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_SpikedRebar_C',
        amount: 15,
      },
    ],
  },
  Recipe_RebarGun_C: {
    name: 'Rebar Gun',
    ingredients: [
      {
        item: 'Desc_IronPlateReinforced_C',
        amount: 6,
      },
      {
        item: 'Desc_IronRod_C',
        amount: 16,
      },
      {
        item: 'Desc_IronScrew_C',
        amount: 100,
      },
    ],
    products: [
      {
        item: 'Desc_RebarGunProjectile_C',
        amount: 1,
      },
    ],
  },
  Recipe_CartridgeSmart_C: {
    name: 'Homing Rifle Ammo',
    ingredients: [
      {
        item: 'Desc_CartridgeStandard_C',
        amount: 50,
      },
      {
        item: 'Desc_HighSpeedConnector_C',
        amount: 2.5,
      },
    ],
    products: [
      {
        item: 'Desc_CartridgeSmartProjectile_C',
        amount: 25,
      },
    ],
  },
  Recipe_BladeRunners_C: {
    name: 'Blade Runners',
    ingredients: [
      {
        item: 'Desc_Silica_C',
        amount: 20,
      },
      {
        item: 'Desc_ModularFrame_C',
        amount: 3,
      },
      {
        item: 'Desc_Rotor_C',
        amount: 3,
      },
    ],
    products: [
      {
        item: 'BP_EquipmentDescriptorJumpingStilts_C',
        amount: 1,
      },
    ],
  },
  Recipe_Rebar_Stunshot_C: {
    name: 'Stun Rebar',
    ingredients: [
      {
        item: 'Desc_SpikedRebar_C',
        amount: 10,
      },
      {
        item: 'Desc_HighSpeedWire_C',
        amount: 50,
      },
    ],
    products: [
      {
        item: 'Desc_Rebar_Stunshot_C',
        amount: 10,
      },
    ],
  },
  Recipe_ZipLine_C: {
    name: 'Zipline',
    ingredients: [
      {
        item: 'BP_EquipmentDescriptorShockShank_C',
        amount: 1.5,
      },
      {
        item: 'Desc_HighSpeedWire_C',
        amount: 45,
      },
      {
        item: 'Desc_IronRod_C',
        amount: 4.5,
      },
      {
        item: 'Desc_Cable_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'BP_EqDescZipLine_C',
        amount: 1.5,
      },
    ],
  },
  Recipe_FilterGasMask_C: {
    name: 'Gas Filter',
    ingredients: [
      {
        item: 'Desc_Fabric_C',
        amount: 15,
      },
      {
        item: 'Desc_Coal_C',
        amount: 30,
      },
      {
        item: 'Desc_IronPlate_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_Filter_C',
        amount: 7.5,
      },
    ],
  },
  Recipe_Gasmask_C: {
    name: 'Gas Mask',
    ingredients: [
      {
        item: 'Desc_Fabric_C',
        amount: 50,
      },
      {
        item: 'Desc_CopperSheet_C',
        amount: 10,
      },
      {
        item: 'Desc_SteelPipe_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'BP_EquipmentDescriptorGasmask_C',
        amount: 1,
      },
    ],
  },
  Recipe_NobeliskGas_C: {
    name: 'Gas Nobelisk',
    ingredients: [
      {
        item: 'Desc_NobeliskExplosive_C',
        amount: 5,
      },
      {
        item: 'Desc_GenericBiomass_C',
        amount: 50,
      },
    ],
    products: [
      {
        item: 'Desc_NobeliskGas_C',
        amount: 5,
      },
    ],
  },
  Recipe_TherapeuticInhaler_C: {
    name: 'Therapeutic Inhaler',
    ingredients: [
      {
        item: 'Desc_Mycelia_C',
        amount: 45,
      },
      {
        item: 'Desc_AlienProtein_C',
        amount: 3,
      },
      {
        item: 'Desc_Shroom_C',
        amount: 3,
      },
    ],
    products: [
      {
        item: 'Desc_Medkit_C',
        amount: 3,
      },
    ],
  },
  Recipe_MedicinalInhaler_C: {
    name: 'Vitamin Inhaler',
    ingredients: [
      {
        item: 'Desc_Mycelia_C',
        amount: 30,
      },
      {
        item: 'Desc_Berry_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_Medkit_C',
        amount: 3,
      },
    ],
  },
  Recipe_Parachute_C: {
    name: 'Parachute',
    ingredients: [
      {
        item: 'Desc_Fabric_C',
        amount: 30,
      },
      {
        item: 'Desc_Cable_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_Parachute_C',
        amount: 1.5,
      },
    ],
  },
  Recipe_Alternate_PolyesterFabric_C: {
    name: 'Alternate: Polyester Fabric',
    ingredients: [
      {
        item: 'Desc_PolymerResin_C',
        amount: 30,
      },
      {
        item: 'Desc_Water_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_Fabric_C',
        amount: 30,
      },
    ],
  },
  Recipe_Fabric_C: {
    name: 'Fabric',
    ingredients: [
      {
        item: 'Desc_Mycelia_C',
        amount: 15,
      },
      {
        item: 'Desc_GenericBiomass_C',
        amount: 75,
      },
    ],
    products: [
      {
        item: 'Desc_Fabric_C',
        amount: 15,
      },
    ],
  },
  Recipe_NutritionalInhaler_C: {
    name: 'Nutritional Inhaler',
    ingredients: [
      {
        item: 'Desc_Shroom_C',
        amount: 3,
      },
      {
        item: 'Desc_Berry_C',
        amount: 6,
      },
      {
        item: 'Desc_Nut_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_Medkit_C',
        amount: 3,
      },
    ],
  },
  Recipe_SyntheticPowerShard_C: {
    name: 'Synthetic Power Shard',
    ingredients: [
      {
        item: 'Desc_TimeCrystal_C',
        amount: 10,
      },
      {
        item: 'Desc_DarkMatter_C',
        amount: 10,
      },
      {
        item: 'Desc_QuartzCrystal_C',
        amount: 60,
      },
      {
        item: 'Desc_QuantumEnergy_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_CrystalShard_C',
        amount: 5,
      },
      {
        item: 'Desc_DarkEnergy_C',
        amount: 60,
      },
    ],
  },
  Recipe_PowerCrystalShard_3_C: {
    name: 'Power Shard (5)',
    ingredients: [
      {
        item: 'Desc_Crystal_mk3_C',
        amount: 2.5,
      },
    ],
    products: [
      {
        item: 'Desc_CrystalShard_C',
        amount: 12.5,
      },
    ],
  },
  Recipe_PowerCrystalShard_2_C: {
    name: 'Power Shard (2)',
    ingredients: [
      {
        item: 'Desc_Crystal_mk2_C',
        amount: 5,
      },
    ],
    products: [
      {
        item: 'Desc_CrystalShard_C',
        amount: 10,
      },
    ],
  },
  Recipe_NobeliskShockwave_C: {
    name: 'Pulse Nobelisk',
    ingredients: [
      {
        item: 'Desc_NobeliskExplosive_C',
        amount: 5,
      },
      {
        item: 'Desc_CrystalOscillator_C',
        amount: 1,
      },
    ],
    products: [
      {
        item: 'Desc_NobeliskShockwave_C',
        amount: 5,
      },
    ],
  },
  Recipe_Rebar_Spreadshot_C: {
    name: 'Shatter Rebar',
    ingredients: [
      {
        item: 'Desc_SpikedRebar_C',
        amount: 10,
      },
      {
        item: 'Desc_QuartzCrystal_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_Rebar_Spreadshot_C',
        amount: 5,
      },
    ],
  },
  Recipe_CartridgeChaos_Packaged_C: {
    name: 'Turbo Rifle Ammo',
    ingredients: [
      {
        item: 'Desc_CartridgeStandard_C',
        amount: 125,
      },
      {
        item: 'Desc_AluminumCasing_C',
        amount: 15,
      },
      {
        item: 'Desc_TurboFuel_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_CartridgeChaos_C',
        amount: 250,
      },
    ],
  },
  Recipe_CartridgeChaos_C: {
    name: 'Turbo Rifle Ammo',
    ingredients: [
      {
        item: 'Desc_CartridgeStandard_C',
        amount: 125,
      },
      {
        item: 'Desc_AluminumCasing_C',
        amount: 15,
      },
      {
        item: 'Desc_LiquidTurboFuel_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_CartridgeChaos_C',
        amount: 250,
      },
    ],
  },
  Recipe_NobeliskNuke_C: {
    name: 'Nuke Nobelisk',
    ingredients: [
      {
        item: 'Desc_NobeliskExplosive_C',
        amount: 2.5,
      },
      {
        item: 'Desc_UraniumCell_C',
        amount: 10,
      },
      {
        item: 'Desc_GunpowderMK2_C',
        amount: 5,
      },
      {
        item: 'Desc_CircuitBoardHighSpeed_C',
        amount: 3,
      },
    ],
    products: [
      {
        item: 'Desc_NobeliskNuke_C',
        amount: 0.5,
      },
    ],
  },
  Recipe_Cartridge_C: {
    name: 'Rifle Ammo',
    ingredients: [
      {
        item: 'Desc_CopperSheet_C',
        amount: 15,
      },
      {
        item: 'Desc_GunpowderMK2_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_CartridgeStandard_C',
        amount: 75,
      },
    ],
  },
  Recipe_Rebar_Explosive_C: {
    name: 'Explosive Rebar',
    ingredients: [
      {
        item: 'Desc_SpikedRebar_C',
        amount: 10,
      },
      {
        item: 'Desc_GunpowderMK2_C',
        amount: 10,
      },
      {
        item: 'Desc_SteelPipe_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_Rebar_Explosive_C',
        amount: 5,
      },
    ],
  },
  Recipe_SpaceRifleMk1_C: {
    name: 'Rifle',
    ingredients: [
      {
        item: 'Desc_Motor_C',
        amount: 1,
      },
      {
        item: 'Desc_Rubber_C',
        amount: 5,
      },
      {
        item: 'Desc_SteelPipe_C',
        amount: 12.5,
      },
      {
        item: 'Desc_IronScrew_C',
        amount: 125,
      },
    ],
    products: [
      {
        item: 'BP_EquipmentDescriptorRifle_C',
        amount: 0.5,
      },
    ],
  },
  Recipe_NobeliskCluster_C: {
    name: 'Cluster Nobelisk',
    ingredients: [
      {
        item: 'Desc_NobeliskExplosive_C',
        amount: 7.5,
      },
      {
        item: 'Desc_GunpowderMK2_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_NobeliskCluster_C',
        amount: 2.5,
      },
    ],
  },
  Recipe_Nobelisk_C: {
    name: 'Nobelisk',
    ingredients: [
      {
        item: 'Desc_Gunpowder_C',
        amount: 20,
      },
      {
        item: 'Desc_SteelPipe_C',
        amount: 20,
      },
    ],
    products: [
      {
        item: 'Desc_NobeliskExplosive_C',
        amount: 10,
      },
    ],
  },
  Recipe_NobeliskDetonator_C: {
    name: 'Nobelisk Detonator',
    ingredients: [
      {
        item: 'BP_EquipmentDescriptorObjectScanner_C',
        amount: 0.75,
      },
      {
        item: 'Desc_SteelPlate_C',
        amount: 7.5,
      },
      {
        item: 'Desc_Cable_C',
        amount: 37.5,
      },
    ],
    products: [
      {
        item: 'BP_EquipmentDescriptorNobeliskDetonator_C',
        amount: 0.75,
      },
    ],
  },
  Recipe_GunpowderMK2_C: {
    name: 'Smokeless Powder',
    ingredients: [
      {
        item: 'Desc_Gunpowder_C',
        amount: 20,
      },
      {
        item: 'Desc_HeavyOilResidue_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_GunpowderMK2_C',
        amount: 20,
      },
    ],
  },
  Recipe_FactoryCart_C: {
    name: 'Factory Cart(TM)',
    ingredients: [
      {
        item: 'Desc_IronPlateReinforced_C',
        amount: 12,
      },
      {
        item: 'Desc_IronRod_C',
        amount: 12,
      },
      {
        item: 'Desc_Rotor_C',
        amount: 6,
      },
    ],
    products: [
      {
        item: 'Desc_GolfCart_C',
        amount: 3,
      },
    ],
  },
  Recipe_GoldenCart_C: {
    name: 'Golden Factory Cart(TM)',
    ingredients: [
      {
        item: 'Desc_GoldIngot_C',
        amount: 45,
      },
      {
        item: 'Desc_IronRod_C',
        amount: 12,
      },
      {
        item: 'Desc_Rotor_C',
        amount: 6,
      },
    ],
    products: [
      {
        item: 'Desc_GolfCartGold_C',
        amount: 3,
      },
    ],
  },
  Recipe_Biomass_Leaves_C: {
    name: 'Biomass (Leaves)',
    ingredients: [
      {
        item: 'Desc_Leaves_C',
        amount: 120,
      },
    ],
    products: [
      {
        item: 'Desc_GenericBiomass_C',
        amount: 60,
      },
    ],
  },
  Recipe_Biomass_Wood_C: {
    name: 'Biomass (Wood)',
    ingredients: [
      {
        item: 'Desc_Wood_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_GenericBiomass_C',
        amount: 300,
      },
    ],
  },
  Recipe_IronPlateReinforced_C: {
    name: 'Reinforced Iron Plate',
    ingredients: [
      {
        item: 'Desc_IronPlate_C',
        amount: 30,
      },
      {
        item: 'Desc_IronScrew_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_IronPlateReinforced_C',
        amount: 5,
      },
    ],
  },
  Recipe_Concrete_C: {
    name: 'Concrete',
    ingredients: [
      {
        item: 'Desc_Stone_C',
        amount: 45,
      },
    ],
    products: [
      {
        item: 'Desc_Cement_C',
        amount: 15,
      },
    ],
  },
  Recipe_Screw_C: {
    name: 'Screw',
    ingredients: [
      {
        item: 'Desc_IronRod_C',
        amount: 10,
      },
    ],
    products: [
      {
        item: 'Desc_IronScrew_C',
        amount: 40,
      },
    ],
  },
  Recipe_Cable_C: {
    name: 'Cable',
    ingredients: [
      {
        item: 'Desc_Wire_C',
        amount: 60,
      },
    ],
    products: [
      {
        item: 'Desc_Cable_C',
        amount: 30,
      },
    ],
  },
  Recipe_Wire_C: {
    name: 'Wire',
    ingredients: [
      {
        item: 'Desc_CopperIngot_C',
        amount: 15,
      },
    ],
    products: [
      {
        item: 'Desc_Wire_C',
        amount: 30,
      },
    ],
  },
  Recipe_IngotCopper_C: {
    name: 'Copper Ingot',
    ingredients: [
      {
        item: 'Desc_OreCopper_C',
        amount: 30,
      },
    ],
    products: [
      {
        item: 'Desc_CopperIngot_C',
        amount: 30,
      },
    ],
  },
  Recipe_PortableMiner_C: {
    name: 'Portable Miner',
    ingredients: [
      {
        item: 'Desc_IronPlate_C',
        amount: 3,
      },
      {
        item: 'Desc_IronRod_C',
        amount: 6,
      },
    ],
    products: [
      {
        item: 'BP_ItemDescriptorPortableMiner_C',
        amount: 1.5,
      },
    ],
  },
}

// Item database for testing
export const itemDatabase = {
  Desc_AlienDNACapsule_C: { name: 'Alien DNA Capsule' },
  Desc_AlienPowerFuel_C: { name: 'Alien Power Matrix' },
  Desc_AlienProtein_C: { name: 'Alien Protein' },
  Desc_AluminaSolution_C: { name: 'Alumina Solution' },
  Desc_AluminumCasing_C: { name: 'Aluminum Casing' },
  Desc_AluminumIngot_C: { name: 'Aluminum Ingot' },
  Desc_AluminumPlateReinforced_C: { name: 'Heat Sink' },
  Desc_AluminumPlate_C: { name: 'Alclad Aluminum Sheet' },
  Desc_AluminumScrap_C: { name: 'Aluminum Scrap' },
  Desc_Battery_C: { name: 'Battery' },
  Desc_Berry_C: { name: 'Paleberry' },
  Desc_Biofuel_C: { name: 'Solid Biofuel' },
  Desc_Cable_C: { name: 'Cable' },
  Desc_CartridgeChaos_C: { name: 'Turbo Rifle Ammo' },
  Desc_CartridgeSmartProjectile_C: { name: 'Homing Rifle Ammo' },
  Desc_CartridgeStandard_C: { name: 'Rifle Ammo' },
  Desc_Cement_C: { name: 'Concrete' },
  Desc_Chainsaw_C: { name: 'Chainsaw' },
  Desc_CircuitBoardHighSpeed_C: { name: 'AI Limiter' },
  Desc_CircuitBoard_C: { name: 'Circuit Board' },
  Desc_Coal_C: { name: 'Coal' },
  Desc_CompactedCoal_C: { name: 'Compacted Coal' },
  Desc_ComputerSuper_C: { name: 'Supercomputer' },
  Desc_Computer_C: { name: 'Computer' },
  Desc_CoolingSystem_C: { name: 'Cooling System' },
  Desc_CopperDust_C: { name: 'Copper Powder' },
  Desc_CopperIngot_C: { name: 'Copper Ingot' },
  Desc_CopperSheet_C: { name: 'Copper Sheet' },
  Desc_CrystalOscillator_C: { name: 'Crystal Oscillator' },
  Desc_CrystalShard_C: { name: 'Power Shard' },
  Desc_Crystal_C: { name: 'Blue Power Slug' },
  Desc_Crystal_mk2_C: { name: 'Yellow Power Slug' },
  Desc_Crystal_mk3_C: { name: 'Purple Power Slug' },
  Desc_DarkEnergy_C: { name: 'Dark Matter Residue' },
  Desc_DarkMatter_C: { name: 'Dark Matter Crystal' },
  Desc_Diamond_C: { name: 'Diamonds' },
  Desc_DissolvedSilica_C: { name: 'Dissolved Silica' },
  Desc_ElectromagneticControlRod_C: { name: 'Electromagnetic Control Rod' },
  Desc_Fabric_C: { name: 'Fabric' },
  Desc_FicsiteIngot_C: { name: 'Ficsite Ingot' },
  Desc_FicsiteMesh_C: { name: 'Ficsite Trigon' },
  Desc_FicsoniumFuelRod_C: { name: 'Ficsonium Fuel Rod' },
  Desc_Ficsonium_C: { name: 'Ficsonium' },
  Desc_Filter_C: { name: 'Gas Filter' },
  Desc_FluidCanister_C: { name: 'Empty Canister' },
  Desc_Fuel_C: { name: 'Packaged Fuel' },
  Desc_GasTank_C: { name: 'Empty Fluid Tank' },
  Desc_GenericBiomass_C: { name: 'Biomass' },
  Desc_GoldIngot_C: { name: 'Caterium Ingot' },
  Desc_GolfCartGold_C: { name: 'Golden Factory Cart(TM)' },
  Desc_GolfCart_C: { name: 'Factory Cart(TM)' },
  Desc_GunpowderMK2_C: { name: 'Smokeless Powder' },
  Desc_Gunpowder_C: { name: 'Black Powder' },
  Desc_HatcherParts_C: { name: 'Hatcher Remains' },
  Desc_HazmatFilter_C: { name: 'Iodine-Infused Filter' },
  Desc_HeavyOilResidue_C: { name: 'Heavy Oil Residue' },
  Desc_HighSpeedConnector_C: { name: 'High-Speed Connector' },
  Desc_HighSpeedWire_C: { name: 'Quickwire' },
  Desc_HogParts_C: { name: 'Hog Remains' },
  Desc_IonizedFuel_C: { name: 'Ionized Fuel' },
  Desc_IronIngot_C: { name: 'Iron Ingot' },
  Desc_IronPlateReinforced_C: { name: 'Reinforced Iron Plate' },
  Desc_IronPlate_C: { name: 'Iron Plate' },
  Desc_IronRod_C: { name: 'Iron Rod' },
  Desc_IronScrew_C: { name: 'Screw' },
  Desc_Leaves_C: { name: 'Leaves' },
  Desc_LiquidBiofuel_C: { name: 'Liquid Biofuel' },
  Desc_LiquidFuel_C: { name: 'Fuel' },
  Desc_LiquidOil_C: { name: 'Crude Oil' },
  Desc_LiquidTurboFuel_C: { name: 'Turbofuel' },
  Desc_Medkit_C: { name: 'Medicinal Inhaler' },
  Desc_ModularFrameFused_C: { name: 'Fused Modular Frame' },
  Desc_ModularFrameHeavy_C: { name: 'Heavy Modular Frame' },
  Desc_ModularFrameLightweight_C: { name: 'Radio Control Unit' },
  Desc_ModularFrame_C: { name: 'Modular Frame' },
  Desc_MotorLightweight_C: { name: 'Turbo Motor' },
  Desc_Motor_C: { name: 'Motor' },
  Desc_Mycelia_C: { name: 'Mycelia' },
  Desc_NitricAcid_C: { name: 'Nitric Acid' },
  Desc_NitrogenGas_C: { name: 'Nitrogen Gas' },
  Desc_NobeliskCluster_C: { name: 'Cluster Nobelisk' },
  Desc_NobeliskExplosive_C: { name: 'Nobelisk' },
  Desc_NobeliskGas_C: { name: 'Gas Nobelisk' },
  Desc_NobeliskNuke_C: { name: 'Nuke Nobelisk' },
  Desc_NobeliskShockwave_C: { name: 'Pulse Nobelisk' },
  Desc_NonFissibleUranium_C: { name: 'Non-Fissile Uranium' },
  Desc_NuclearFuelRod_C: { name: 'Uranium Fuel Rod' },
  Desc_NuclearWaste_C: { name: 'Uranium Waste' },
  Desc_Nut_C: { name: 'Beryl Nut' },
  Desc_OreBauxite_C: { name: 'Bauxite' },
  Desc_OreCopper_C: { name: 'Copper Ore' },
  Desc_OreGold_C: { name: 'Caterium Ore' },
  Desc_OreIron_C: { name: 'Iron Ore' },
  Desc_OreUranium_C: { name: 'Uranium' },
  Desc_PackagedAlumina_C: { name: 'Packaged Alumina Solution' },
  Desc_PackagedBiofuel_C: { name: 'Packaged Liquid Biofuel' },
  Desc_PackagedIonizedFuel_C: { name: 'Packaged Ionized Fuel' },
  Desc_PackagedNitricAcid_C: { name: 'Packaged Nitric Acid' },
  Desc_PackagedNitrogenGas_C: { name: 'Packaged Nitrogen Gas' },
  Desc_PackagedOilResidue_C: { name: 'Packaged Heavy Oil Residue' },
  Desc_PackagedOil_C: { name: 'Packaged Oil' },
  Desc_PackagedRocketFuel_C: { name: 'Packaged Rocket Fuel' },
  Desc_PackagedSulfuricAcid_C: { name: 'Packaged Sulfuric Acid' },
  Desc_PackagedWater_C: { name: 'Packaged Water' },
  Desc_Parachute_C: { name: 'Parachute' },
  Desc_PetroleumCoke_C: { name: 'Petroleum Coke' },
  Desc_Plastic_C: { name: 'Plastic' },
  Desc_PlutoniumCell_C: { name: 'Encased Plutonium Cell' },
  Desc_PlutoniumFuelRod_C: { name: 'Plutonium Fuel Rod' },
  Desc_PlutoniumPellet_C: { name: 'Plutonium Pellet' },
  Desc_PlutoniumWaste_C: { name: 'Plutonium Waste' },
  Desc_PolymerResin_C: { name: 'Polymer Resin' },
  Desc_PressureConversionCube_C: { name: 'Pressure Conversion Cube' },
  Desc_QuantumEnergy_C: { name: 'Excited Photonic Matter' },
  Desc_QuantumOscillator_C: { name: 'Superposition Oscillator' },
  Desc_QuartzCrystal_C: { name: 'Quartz Crystal' },
  Desc_RawQuartz_C: { name: 'Raw Quartz' },
  Desc_RebarGunProjectile_C: { name: 'Rebar Gun' },
  Desc_Rebar_Explosive_C: { name: 'Explosive Rebar' },
  Desc_Rebar_Spreadshot_C: { name: 'Shatter Rebar' },
  Desc_Rebar_Stunshot_C: { name: 'Stun Rebar' },
  Desc_ResourceSinkCoupon_C: { name: 'FICSIT Coupon' },
  Desc_RocketFuel_C: { name: 'Rocket Fuel' },
  Desc_Rotor_C: { name: 'Rotor' },
  Desc_Rubber_C: { name: 'Rubber' },
  Desc_SAMFluctuator_C: { name: 'SAM Fluctuator' },
  Desc_SAMIngot_C: { name: 'Reanimated SAM' },
  Desc_SAM_C: { name: 'SAM' },
  Desc_Shroom_C: { name: 'Bacon Agaric' },
  Desc_Silica_C: { name: 'Silica' },
  Desc_SingularityCell_C: { name: 'Singularity Cell' },
  Desc_SpaceElevatorPart_10_C: { name: 'Biochemical Sculptor' },
  Desc_SpaceElevatorPart_11_C: { name: 'Ballistic Warp Drive' },
  Desc_SpaceElevatorPart_12_C: { name: 'AI Expansion Server' },
  Desc_SpaceElevatorPart_1_C: { name: 'Smart Plating' },
  Desc_SpaceElevatorPart_2_C: { name: 'Versatile Framework' },
  Desc_SpaceElevatorPart_3_C: { name: 'Automated Wiring' },
  Desc_SpaceElevatorPart_4_C: { name: 'Modular Engine' },
  Desc_SpaceElevatorPart_5_C: { name: 'Adaptive Control Unit' },
  Desc_SpaceElevatorPart_6_C: { name: 'Magnetic Field Generator' },
  Desc_SpaceElevatorPart_7_C: { name: 'Assembly Director System' },
  Desc_SpaceElevatorPart_8_C: { name: 'Thermal Propulsion Rocket' },
  Desc_SpaceElevatorPart_9_C: { name: 'Nuclear Pasta' },
  Desc_SpikedRebar_C: { name: 'Iron Rebar' },
  Desc_SpitterParts_C: { name: 'Spitter Remains' },
  Desc_Stator_C: { name: 'Stator' },
  Desc_SteelIngot_C: { name: 'Steel Ingot' },
  Desc_SteelPipe_C: { name: 'Steel Pipe' },
  Desc_SteelPlateReinforced_C: { name: 'Encased Industrial Beam' },
  Desc_SteelPlate_C: { name: 'Steel Beam' },
  Desc_StingerParts_C: { name: 'Stinger Remains' },
  Desc_Stone_C: { name: 'Limestone' },
  Desc_Sulfur_C: { name: 'Sulfur' },
  Desc_SulfuricAcid_C: { name: 'Sulfuric Acid' },
  Desc_TemporalProcessor_C: { name: 'Neural-Quantum Processor' },
  Desc_TimeCrystal_C: { name: 'Time Crystal' },
  Desc_TurboFuel_C: { name: 'Packaged Turbofuel' },
  Desc_UraniumCell_C: { name: 'Encased Uranium Cell' },
  Desc_WAT1_C: { name: 'Somersloop' },
  Desc_WAT2_C: { name: 'Mercer Sphere' },
  Desc_Water_C: { name: 'Water' },
  Desc_Wire_C: { name: 'Wire' },
  Desc_Wood_C: { name: 'Wood' },
}

/**
 * Creates a mock data store for testing that uses the recipe database fixture
 * instead of mockReturnValueOnce calls
 */
export function createMockDataStore() {
  return {
    recipes: recipeDatabase,
    recipeIngredients: vi.fn((recipeName: string) => {
      const recipe = recipeDatabase[recipeName]
      return recipe ? recipe.ingredients : []
    }),
    recipeProducts: vi.fn((recipeName: string) => {
      const recipe = recipeDatabase[recipeName]
      return recipe ? recipe.products : []
    }),
    items: itemDatabase,
  }
}

/**
 * Sets up the mock data store for use in tests
 */
export function setupMockDataStore() {
  const mockDataStore = createMockDataStore()
  vi.mocked(useDataStore).mockReturnValue(mockDataStore)
  return mockDataStore
}
