// Test fixtures for recipe processing tests

// Building constants
export const BUILDINGS = {
  SMELTER: 'Desc_SmelterMk1_C',
  CONSTRUCTOR: 'Desc_ConstructorMk1_C',
  ASSEMBLER: 'Desc_AssemblerMk1_C',
  FOUNDRY: 'Desc_FoundryMk1_C',
  REFINERY: 'Desc_OilRefinery_C',
  BLENDER: 'Desc_Blender_C',
  PARTICLE_ACCELERATOR: 'Desc_HadronCollider_C',
  MANUFACTURER: 'Desc_ManufacturerMk1_C',
}

// Recipe factory function
export const makeRecipe = (
  recipeName: string,
  amount: string,
  building: string,
  efficiency: number = 100,
) => `${recipeName}@${efficiency}#${building}: "${amount}"`

// Recipe constants organized by production chains
export const RECIPES = {
  // Basic resources
  IRON_INGOT: (amount: string) => makeRecipe('Recipe_IronIngot_C', amount, BUILDINGS.SMELTER),
  IRON_PLATE: (amount: string) => makeRecipe('Recipe_IronPlate_C', amount, BUILDINGS.CONSTRUCTOR),
  COPPER_INGOT: (amount: string) => makeRecipe('Recipe_CopperIngot_C', amount, BUILDINGS.SMELTER),
  WIRE: (amount: string) => makeRecipe('Recipe_Wire_C', amount, BUILDINGS.CONSTRUCTOR),
  CABLE: (amount: string) => makeRecipe('Recipe_Cable_C', amount, BUILDINGS.CONSTRUCTOR),
  CONCRETE: (amount: string) => makeRecipe('Recipe_Concrete_C', amount, BUILDINGS.CONSTRUCTOR),
  SCREW: (amount: string) => makeRecipe('Recipe_Screw_C', amount, BUILDINGS.CONSTRUCTOR),

  // Advanced materials
  FAKE_ALUMINA_SOLUTION_RAW: (amount: string) =>
    makeRecipe('Recipe_Fake_AluminaSolutionRaw_C', amount, BUILDINGS.REFINERY),
  FAKE_ALUMINA_SOLUTION: (amount: string) =>
    makeRecipe('Recipe_Fake_AluminaSolution_C', amount, BUILDINGS.REFINERY),
  ALUMINA_SOLUTION: (amount: string) =>
    makeRecipe('Recipe_AluminaSolution_C', amount, BUILDINGS.REFINERY),
  PURE_CATERIUM_INGOT: (amount: string) =>
    makeRecipe('Recipe_PureCateriumIngot_C', amount, BUILDINGS.REFINERY),

  // Modular frame production chain
  ALTERNATE_STEEL_ROD: (amount: string) =>
    makeRecipe('Recipe_Alternate_SteelRod_C', amount, BUILDINGS.CONSTRUCTOR),
  ALTERNATE_PURE_IRON_INGOT: (amount: string) =>
    makeRecipe('Recipe_Alternate_PureIronIngot_C', amount, BUILDINGS.REFINERY),
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
    makeRecipe('Recipe_ResidualRubber_C', amount, BUILDINGS.REFINERY),
  ALTERNATE_RECYCLED_RUBBER: (amount: string) =>
    makeRecipe('Recipe_Alternate_RecycledRubber_C', amount, BUILDINGS.REFINERY),
  ALTERNATE_HEAVY_OIL_RESIDUE: (amount: string) =>
    makeRecipe('Recipe_Alternate_HeavyOilResidue_C', amount, BUILDINGS.REFINERY),
  ALTERNATE_DILUTED_FUEL: (amount: string) =>
    makeRecipe('Recipe_Alternate_DilutedFuel_C', amount, BUILDINGS.BLENDER),
  ALTERNATE_PLASTIC_1: (amount: string) =>
    makeRecipe('Recipe_Alternate_Plastic_1_C', amount, BUILDINGS.REFINERY),
  FLUID_CANISTER: (amount: string) =>
    makeRecipe('Recipe_FluidCanister_C', amount, BUILDINGS.CONSTRUCTOR),

  // Plutonium production chain
  PETROLEUM_COKE: (amount: string) =>
    makeRecipe('Recipe_PetroleumCoke_C', amount, BUILDINGS.REFINERY),
  ALTERNATE_WET_CONCRETE: (amount: string) =>
    makeRecipe('Recipe_Alternate_WetConcrete_C', amount, BUILDINGS.REFINERY),
  ALTERNATE_STEAMED_COPPER_SHEET: (amount: string) =>
    makeRecipe('Recipe_Alternate_SteamedCopperSheet_C', amount, BUILDINGS.REFINERY),
  ALTERNATE_PURE_QUARTZ_CRYSTAL: (amount: string) =>
    makeRecipe('Recipe_Alternate_PureQuartzCrystal_C', amount, BUILDINGS.REFINERY),
  ALTERNATE_PURE_COPPER_INGOT: (amount: string) =>
    makeRecipe('Recipe_Alternate_PureCopperIngot_C', amount, BUILDINGS.REFINERY),
  PURE_ALUMINUM_INGOT: (amount: string) =>
    makeRecipe('Recipe_PureAluminumIngot_C', amount, BUILDINGS.SMELTER),
  STATOR: (amount: string) => makeRecipe('Recipe_Stator_C', amount, BUILDINGS.ASSEMBLER),
  ALTERNATE_ELECTRO_ALUMINUM_SCRAP: (amount: string) =>
    makeRecipe('Recipe_Alternate_ElectroAluminumScrap_C', amount, BUILDINGS.REFINERY),
  ALTERNATE_COPPER_ROTOR: (amount: string) =>
    makeRecipe('Recipe_Alternate_CopperRotor_C', amount, BUILDINGS.ASSEMBLER),
  ALTERNATE_COATED_IRON_PLATE: (amount: string) =>
    makeRecipe('Recipe_Alternate_CoatedIronPlate_C', amount, BUILDINGS.ASSEMBLER),
  PLUTONIUM_CELL: (amount: string) =>
    makeRecipe('Recipe_PlutoniumCell_C', amount, BUILDINGS.ASSEMBLER),
  PRESSURE_CONVERSION_CUBE: (amount: string) =>
    makeRecipe('Recipe_PressureConversionCube_C', amount, BUILDINGS.ASSEMBLER),
  NITRIC_ACID: (amount: string) => makeRecipe('Recipe_NitricAcid_C', amount, BUILDINGS.BLENDER),
  NON_FISSILE_URANIUM: (amount: string) =>
    makeRecipe('Recipe_NonFissileUranium_C', amount, BUILDINGS.BLENDER),
  PLUTONIUM: (amount: string) =>
    makeRecipe('Recipe_Plutonium_C', amount, BUILDINGS.PARTICLE_ACCELERATOR),
  RADIO_CONTROL_UNIT: (amount: string) =>
    makeRecipe('Recipe_RadioControlUnit_C', amount, BUILDINGS.MANUFACTURER),
  SULFURIC_ACID: (amount: string) =>
    makeRecipe('Recipe_SulfuricAcid_C', amount, BUILDINGS.REFINERY),
  ELECTROMAGNETIC_CONTROL_ROD: (amount: string) =>
    makeRecipe('Recipe_ElectromagneticControlRod_C', amount, BUILDINGS.ASSEMBLER),
  ALTERNATE_PLUTONIUM_FUEL_UNIT: (amount: string) =>
    makeRecipe('Recipe_Alternate_PlutoniumFuelUnit_C', amount, BUILDINGS.ASSEMBLER),
  ALTERNATE_HEAT_FUSED_FRAME: (amount: string) =>
    makeRecipe('Recipe_Alternate_HeatFusedFrame_C', amount, BUILDINGS.BLENDER),
  ALTERNATE_FERTILE_URANIUM: (amount: string) =>
    makeRecipe('Recipe_Alternate_FertileUranium_C', amount, BUILDINGS.BLENDER),
  ALTERNATE_ALCLAD_CASING: (amount: string) =>
    makeRecipe('Recipe_Alternate_AlcladCasing_C', amount, BUILDINGS.ASSEMBLER),
  ALTERNATE_STEEL_PIPE_IRON: (amount: string) =>
    makeRecipe('Recipe_Alternate_SteelPipe_Iron_C', amount, BUILDINGS.CONSTRUCTOR),
  ALTERNATE_AI_LIMITER_PLASTIC: (amount: string) =>
    makeRecipe('Recipe_Alternate_AILimiter_Plastic_C', amount, BUILDINGS.ASSEMBLER),
  ALTERNATE_SILICA_DISTILLED: (amount: string) =>
    makeRecipe('Recipe_Alternate_Silica_Distilled_C', amount, BUILDINGS.BLENDER),
  ALTERNATE_QUARTZ_PURIFIED: (amount: string) =>
    makeRecipe('Recipe_Alternate_Quartz_Purified_C', amount, BUILDINGS.REFINERY),
  ALTERNATE_URANIUM_CELL_1: (amount: string) =>
    makeRecipe('Recipe_Alternate_UraniumCell_1_C', amount, BUILDINGS.MANUFACTURER),
  ALTERNATE_ENCASED_INDUSTRIAL_BEAM: (amount: string) =>
    makeRecipe('Recipe_Alternate_EncasedIndustrialBeam_C', amount, BUILDINGS.ASSEMBLER),
  ALTERNATE_QUICKWIRE: (amount: string) =>
    makeRecipe('Recipe_Alternate_Quickwire_C', amount, BUILDINGS.ASSEMBLER),
  ALTERNATE_NUCLEAR_FUEL_ROD_1: (amount: string) =>
    makeRecipe('Recipe_Alternate_NuclearFuelRod_1_C', amount, BUILDINGS.MANUFACTURER),
  ALTERNATE_MODULAR_FRAME_HEAVY: (amount: string) =>
    makeRecipe('Recipe_Alternate_ModularFrameHeavy_C', amount, BUILDINGS.MANUFACTURER),
  ALTERNATE_CRYSTAL_OSCILLATOR: (amount: string) =>
    makeRecipe('Recipe_Alternate_CrystalOscillator_C', amount, BUILDINGS.MANUFACTURER),
  ALTERNATE_COMPUTER_1: (amount: string) =>
    makeRecipe('Recipe_Alternate_Computer_1_C', amount, BUILDINGS.MANUFACTURER),
  ALTERNATE_CIRCUIT_BOARD_2: (amount: string) =>
    makeRecipe('Recipe_Alternate_CircuitBoard_2_C', amount, BUILDINGS.ASSEMBLER),
}
