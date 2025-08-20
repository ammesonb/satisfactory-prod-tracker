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

export const isNaturalResource = (item: string): boolean => {
  return NATURAL_RESOURCES.includes(item)
}
