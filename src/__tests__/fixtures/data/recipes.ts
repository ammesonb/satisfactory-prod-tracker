import type { RecipeData } from '@/__tests__/fixtures/types/dataStore'
export const recipeDatabase: Record<string, RecipeData> = {
  Recipe_Fake_IronIngot_C: {
    name: 'Recipe_Fake_IronIngot_C',
    ingredients: [{ item: 'Desc_OreIron_C', amount: 1 }],
    products: [{ item: 'Desc_IronIngot_C', amount: 1 }],
    time: 5,
    producedIn: ['Desc_SmelterMk1_C'],
  },
  Recipe_Fake_CopperIngot_C: {
    name: 'Recipe_Fake_CopperIngot_C',
    ingredients: [{ item: 'Desc_OreCopper_C', amount: 1 }],
    products: [{ item: 'Desc_CopperIngot_C', amount: 1 }],
    time: 5,
    producedIn: ['Desc_SmelterMk1_C'],
  },

  Recipe_Fake_AluminaSolutionRaw_C: {
    name: 'Recipe_AluminaSolutionRaw_C',
    ingredients: [{ item: 'Desc_OreBauxite_C', amount: 2 }],
    products: [{ item: 'Desc_AluminaSolution_C', amount: 30 }],
    time: 5,
    producedIn: ['Desc_SmelterMk1_C'],
  },
  Recipe_Fake_AluminaSolution_C: {
    name: 'Recipe_AluminaSolution_C',
    ingredients: [{ item: 'Desc_AluminaSolution_C', amount: 120 }],
    products: [
      { item: 'Desc_AluminaSolution_C', amount: 60 },
      { item: 'Desc_Water_C', amount: 120 },
    ],
    time: 5,
    producedIn: ['Desc_SmelterMk1_C'],
  },
  // is fake, since actually an alternate
  Recipe_PureCateriumIngot_C: {
    name: 'Recipe_PureCateriumIngot_C',
    ingredients: [
      { item: 'Desc_OreGold_C', amount: 2 },
      { item: 'Desc_Water_C', amount: 2 },
    ],
    products: [{ item: 'Desc_GoldIngot_C', amount: 2 }],
    time: 5,
    producedIn: ['Desc_SmelterMk1_C'],
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
  // real recipes start here
  Recipe_IronPlate_C: {
    name: 'Iron Plate',
    time: 6,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 4,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 40,
    producedIn: [],
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
    time: 2,
    producedIn: ['Desc_SmelterMk1_C'],
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
    time: 2.4,
    producedIn: ['Desc_Blender_C'],
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
    time: 6,
    producedIn: ['Desc_Blender_C'],
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
    time: 1,
    producedIn: ['Desc_Packager_C'],
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
    time: 1,
    producedIn: ['Desc_Packager_C'],
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
    time: 3,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 3,
    producedIn: ['Desc_Converter_C'],
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
    time: 2,
    producedIn: ['Desc_HadronCollider_C'],
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
    time: 12,
    producedIn: ['Desc_QuantumEncoder_C'],
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
    time: 20,
    producedIn: ['Desc_QuantumEncoder_C'],
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
    time: 15,
    producedIn: ['Desc_QuantumEncoder_C'],
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
    time: 24,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 3,
    producedIn: ['Desc_Packager_C'],
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
    time: 3,
    producedIn: ['Desc_Packager_C'],
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
    time: 3,
    producedIn: ['Desc_HadronCollider_C'],
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
    time: 6,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 6,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 10,
    producedIn: ['Desc_Converter_C'],
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
    time: 2,
    producedIn: ['Desc_HadronCollider_C'],
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
    time: 2,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 120,
    producedIn: ['Desc_Blender_C'],
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
    time: 2,
    producedIn: ['Desc_Converter_C'],
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
    time: 4,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 6,
    producedIn: ['Desc_Converter_C'],
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
    time: 16,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 6,
    producedIn: ['Desc_Packager_C'],
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
    time: 6,
    producedIn: ['Desc_Packager_C'],
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
    time: 4,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 8,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 12,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 8,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 6,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 6,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 6,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 6,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 6,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 6,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 6,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 4,
    producedIn: ['Desc_Converter_C'],
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
    time: 2,
    producedIn: ['Desc_HadronCollider_C'],
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
    time: 3,
    producedIn: ['Desc_HadronCollider_C'],
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
    time: 3,
    producedIn: ['Desc_HadronCollider_C'],
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
    time: 2,
    producedIn: ['Desc_HadronCollider_C'],
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
    time: 3,
    producedIn: ['Desc_HadronCollider_C'],
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
    time: 3,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 8,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 5,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 4,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 6,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 4,
    producedIn: ['Desc_FoundryMk1_C'],
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
    time: 24,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 6,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 4,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 3,
    producedIn: ['Desc_Packager_C'],
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
    time: 4,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 3,
    producedIn: ['Desc_Packager_C'],
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
    time: 4,
    producedIn: ['Desc_Packager_C'],
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
    time: 4,
    producedIn: ['Desc_Packager_C'],
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
    time: 2,
    producedIn: ['Desc_Packager_C'],
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
    time: 2,
    producedIn: ['Desc_Packager_C'],
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
    time: 2,
    producedIn: ['Desc_Packager_C'],
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
    time: 2,
    producedIn: ['Desc_Packager_C'],
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
    time: 6,
    producedIn: ['Desc_Packager_C'],
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
    time: 1,
    producedIn: ['Desc_Packager_C'],
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
    time: 8,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 6,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 12,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 8,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 8,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 12,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 24,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 5,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 2,
    producedIn: ['Desc_SmelterMk1_C'],
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
    time: 2,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 6,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 6,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 1,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 1,
    producedIn: ['Desc_Packager_C'],
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
    time: 4,
    producedIn: ['Desc_FoundryMk1_C'],
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
    time: 8,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 120,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 1,
    producedIn: ['Desc_Packager_C'],
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
    time: 6,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 24,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 32,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 10,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 12,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 12,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 24,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 12,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 6,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 16,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 24,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 30,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 60,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 60,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 20,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 16,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 12,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 4,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 2,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 16,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 60,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 15,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 6,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 30,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 6,
    producedIn: ['Desc_FoundryMk1_C'],
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
    time: 12,
    producedIn: ['Desc_FoundryMk1_C'],
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
    time: 8,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 4,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 8,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 24,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 16,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 32,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 12,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 60,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 6,
    producedIn: ['Desc_Blender_C'],
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
    time: 24,
    producedIn: ['Desc_Blender_C'],
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
    time: 6,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 60,
    producedIn: ['Desc_HadronCollider_C'],
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
    time: 240,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 2,
    producedIn: ['Desc_Packager_C'],
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
    time: 120,
    producedIn: ['Desc_HadronCollider_C'],
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
    time: 3,
    producedIn: ['Desc_Packager_C'],
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
    time: 8,
    producedIn: ['Desc_Blender_C'],
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
    time: 12,
    producedIn: ['Desc_Blender_C'],
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
    time: 10,
    producedIn: ['Desc_Blender_C'],
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
    time: 3,
    producedIn: ['Desc_Blender_C'],
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
    time: 32,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 48,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 6,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 3,
    producedIn: ['Desc_Packager_C'],
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
    time: 80,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 16,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 1,
    producedIn: ['Desc_Packager_C'],
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
    time: 25,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 30,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 150,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 120,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 3,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 40,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 120,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 20,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 8,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 40,
    producedIn: ['Desc_Blender_C'],
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
    time: 1,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 1,
    producedIn: ['Desc_Packager_C'],
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
    time: 1,
    producedIn: ['Desc_Packager_C'],
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
    time: 6,
    producedIn: ['Desc_Blender_C'],
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
    time: 120,
    producedIn: ['Desc_HadronCollider_C'],
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
    time: 20,
    producedIn: ['Desc_Blender_C'],
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
    time: 12,
    producedIn: ['Desc_Blender_C'],
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
    time: 16,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 6,
    producedIn: ['Desc_Blender_C'],
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
    time: 24,
    producedIn: ['Desc_Blender_C'],
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
    time: 8,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 60,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 8,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 6,
    producedIn: ['Desc_FoundryMk1_C'],
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
    time: 12,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 4,
    producedIn: ['Desc_FoundryMk1_C'],
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
    time: 12,
    producedIn: ['Desc_FoundryMk1_C'],
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
    time: 8,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 8,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 15,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 6,
    producedIn: ['Desc_Blender_C'],
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
    time: 12,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 20,
    producedIn: ['Desc_FoundryMk1_C'],
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
    time: 6,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 12,
    producedIn: ['Desc_FoundryMk1_C'],
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
    time: 12,
    producedIn: ['Desc_FoundryMk1_C'],
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
    time: 12,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 8,
    producedIn: ['Desc_FoundryMk1_C'],
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
    time: 10,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 4,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 24,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 12,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 4,
    producedIn: ['Desc_SmelterMk1_C'],
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
    time: 64,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 32,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 120,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 15,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 8,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 12,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 24,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 12,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 15,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 32,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 12,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 16,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 8,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 12,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 300,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 48,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 60,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 24,
    producedIn: ['Desc_FoundryMk1_C'],
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
    time: 3,
    producedIn: ['Desc_FoundryMk1_C'],
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
    time: 12,
    producedIn: ['Desc_FoundryMk1_C'],
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
    time: 40,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 64,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 6,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 8,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 15,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 32,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 12,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 36,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 16,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 48,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 24,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 24,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 12,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 6,
    producedIn: ['Desc_HadronCollider_C'],
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
    time: 24,
    producedIn: ['Desc_QuantumEncoder_C'],
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
    time: 60,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 60,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 120,
    producedIn: [],
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
    time: 16,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 120,
    producedIn: [],
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
    time: 60,
    producedIn: [],
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
    time: 5,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 80,
    producedIn: [],
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
    time: 4,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 60,
    producedIn: [],
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
    time: 3,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 3,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 4,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 8,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 4,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 24,
    producedIn: ['Desc_QuantumEncoder_C'],
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
    time: 40,
    producedIn: [],
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
    time: 3,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 3,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 6,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 4,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 20,
    producedIn: [],
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
    time: 4,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 60,
    producedIn: [],
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
    time: 24,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 60,
    producedIn: [],
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
    time: 6,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 40,
    producedIn: [],
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
    time: 8,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 60,
    producedIn: [],
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
    time: 12,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 20,
    producedIn: [],
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
    time: 20,
    producedIn: [],
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
    time: 40,
    producedIn: [],
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
    time: 2,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 4,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 20,
    producedIn: [],
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
    time: 12,
    producedIn: ['Desc_QuantumEncoder_C'],
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
    time: 24,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 12,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 60,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 12,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 12,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 12,
    producedIn: ['Desc_Blender_C'],
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
    time: 120,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 12,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 12,
    producedIn: ['Desc_ManufacturerMk1_C'],
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
    time: 120,
    producedIn: [],
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
    time: 24,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 6,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 80,
    producedIn: [],
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
    time: 6,
    producedIn: ['Desc_OilRefinery_C'],
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
    time: 20,
    producedIn: [],
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
    time: 20,
    producedIn: [],
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
    time: 5,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 4,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 12,
    producedIn: ['Desc_AssemblerMk1_C'],
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
    time: 4,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 6,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 2,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 4,
    producedIn: ['Desc_ConstructorMk1_C'],
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
    time: 2,
    producedIn: ['Desc_SmelterMk1_C'],
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
    time: 40,
    producedIn: [],
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
