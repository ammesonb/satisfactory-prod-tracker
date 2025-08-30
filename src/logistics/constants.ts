export const ZERO_THRESHOLD = 0.05

export const NATURAL_RESOURCES = [
  'Desc_OreBauxite_C',
  'Desc_Coal_C',
  'Desc_OreCopper_C',
  'Desc_OreGold_C',
  'Desc_OreIron_C',
  'Desc_OreSAM_C',
  'Desc_Sulfur_C',
  'Desc_OreUranium_C',
  'Desc_RawQuartz_C',
  'Desc_Stone_C',
  'Desc_LiquidOil_C',
  'Desc_NitrogenGas_C',
  'Desc_Water_C',
  // technically not natural, but since this isn't created by a recipe
  // we need to consider it a "free" resource
  'Desc_NuclearWaste_C',
]

export const FLUIDS = [
  'Desc_Water_C',
  'Desc_LiquidOil_C',
  'Desc_HeavyOilResidue_C',
  'Desc_NitrogenGas_C',
  'Desc_Fuel_C',
  'Desc_LiquidBiofuel_C',
  'Desc_LiquidTurboFuel_C',
  'Desc_AluminaSolution_C',
  'Desc_SulfuricAcid_C',
  'Desc_DissolvedSilica_C',
  'Desc_NitricAcid_C',
  'Desc_RocketFuel_C',
  'Desc_IonizedFuel_C',
  'Desc_QuantumEnergy_C',
  'Desc_DarkEnergy_C',
]

export const isNaturalResource = (item: string): boolean => NATURAL_RESOURCES.includes(item)

export const isFluid = (item: string): boolean => FLUIDS.includes(item)

export const BELT_CAPACITIES = [60, 120, 270, 480, 780, 1200]
export const PIPELINE_CAPACITIES = [300, 600]

export const BELT_ITEM_NAMES = [
  'Desc_ConveyorBeltMk1_C',
  'Desc_ConveyorBeltMk2_C',
  'Desc_ConveyorBeltMk3_C',
  'Desc_ConveyorBeltMk4_C',
  'Desc_ConveyorBeltMk5_C',
  'Desc_ConveyorBeltMk6_C',
]

export const PIPELINE_ITEM_NAMES = ['Desc_Pipeline_C', 'Desc_PipelineMK2_C']
