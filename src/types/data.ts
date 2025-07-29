export interface FluidColor {
  r: number
  g: number
  b: number
  a: number
}

export interface PingColor {
  r: number
  g: number
  b: number
  a: number
}

export interface Item {
  slug: string
  icon: string
  name: string
  description: string
  sinkPoints: number
  className: string
  stackSize: number
  energyValue: number
  radioactiveDecay: number
  liquid: boolean
  fluidColor: FluidColor
}

export interface RecipeIngredient {
  item: string
  amount: number
}

export interface RecipeProduct {
  item: string
  amount: number
}

export interface Recipe {
  slug: string
  name: string
  className: string
  alternate: boolean
  time: number
  inHand: boolean
  forBuilding: boolean
  inWorkshop: boolean
  inMachine: boolean
  manualTimeMultiplier: number
  ingredients: RecipeIngredient[]
  products: RecipeProduct[]
  producedIn: string[]
  isVariablePower: boolean
  minPower: number
  maxPower: number
}

export interface SchematicCost {
  item: string
  amount: number
}

export interface SchematicUnlock {
  recipes?: string[]
  scannerResources?: string[]
  inventorySlots?: number
  armSlots?: number
  buildingEfficiencyMultiplier?: number
  buildingOverclockMultiplier?: number
}

export interface Schematic {
  className: string
  type: string
  name: string
  slug: string
  icon: string
  cost: SchematicCost[]
  unlock: SchematicUnlock
  requiredSchematics: string[]
  tier: number
  time: number
  mam: boolean
  alternate: boolean
}

export interface GeneratorFuel {
  item: string
  energyValue: number
  byproduct?: string
  byproductAmount?: number
}

export interface Generator {
  className: string
  fuel: GeneratorFuel[]
  powerProduction: number
  powerProductionExponent: number
  waterToPowerRatio: number
}

export interface Resource {
  item: string
  pingColor: PingColor
  speed: number
}

export interface Miner {
  className: string
  allowedResources: string[]
  allowLiquids: boolean
  allowSolids: boolean
  itemsPerCycle: number
  extractCycleTime: number
}

export interface BuildingSize {
  width: number
  length: number
  height: number
}

export interface BuildingMetadata {
  powerConsumption?: number
  powerConsumptionExponent?: number
  manufacturingSpeed?: number
  beltSpeed?: number
  flowLimit?: number
  headLift?: number
  storageSize?: number
  inventorySize?: number
}

export interface Building {
  slug: string
  icon: string
  name: string
  description: string
  className: string
  categories: string[]
  buildMenuPriority: number
  metadata: BuildingMetadata
  size: BuildingSize
}

export interface GameData {
  items: Record<string, Item>
  recipes: Record<string, Recipe>
  schematics: Record<string, Schematic>
  generators: Record<string, Generator>
  resources: Record<string, Resource>
  miners: Record<string, Miner>
  buildings: Record<string, Building>
}
