export const ZERO_THRESHOLD = 0.05

export const NATURAL_RESOURCES = [
  'Desc_OreBauxite_C',
  'Desc_Coal_C',
  'Desc_OreCopper_C',
  'Desc_OreGold_C',
  'Desc_OreIron_C',
  'Desc_OreSAM_C',
  'Desc_OreSulfur_C',
  'Desc_OreUranium_C',
  'Desc_RawQuartz_C',
  'Desc_Stone_C',
  'Desc_LiquidOil_C',
  'Desc_NitrogenGas_C',
  'Desc_Water_C',
]

export const isNaturalResource = (item: string): boolean => {
  return NATURAL_RESOURCES.includes(item)
}
