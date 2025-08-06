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
  // Basic smelting recipes
  Recipe_IronIngot_C: {
    name: 'Recipe_IronIngot_C',
    ingredients: [{ item: 'Desc_OreIron_C', amount: 1 }],
    products: [{ item: 'Desc_IronIngot_C', amount: 1 }],
  },
  Recipe_CopperIngot_C: {
    name: 'Recipe_CopperIngot_C',
    ingredients: [{ item: 'Desc_OreCopper_C', amount: 1 }],
    products: [{ item: 'Desc_CopperIngot_C', amount: 1 }],
  },

  // Basic construction recipes
  Recipe_IronPlate_C: {
    name: 'Recipe_IronPlate_C',
    ingredients: [{ item: 'Desc_IronIngot_C', amount: 3 }],
    products: [{ item: 'Desc_IronPlate_C', amount: 2 }],
  },
  Recipe_IronRod_C: {
    name: 'Recipe_IronRod_C',
    ingredients: [{ item: 'Desc_IronIngot_C', amount: 1 }],
    products: [{ item: 'Desc_IronRod_C', amount: 1 }],
  },
  Recipe_Wire_C: {
    name: 'Recipe_Wire_C',
    ingredients: [{ item: 'Desc_CopperIngot_C', amount: 2 }],
    products: [{ item: 'Desc_Wire_C', amount: 1 }],
  },
  Recipe_Cable_C: {
    name: 'Recipe_Cable_C',
    ingredients: [{ item: 'Desc_Wire_C', amount: 2 }],
    products: [{ item: 'Desc_Cable_C', amount: 1 }],
  },
  Recipe_Concrete_C: {
    name: 'Recipe_Concrete_C',
    ingredients: [{ item: 'Desc_Stone_C', amount: 3 }],
    products: [{ item: 'Desc_Concrete_C', amount: 1 }],
  },

  // Alumina solution recipes (catalyst examples)
  Recipe_AluminaSolutionRaw_C: {
    name: 'Recipe_AluminaSolutionRaw_C',
    ingredients: [{ item: 'Desc_OreBauxite_C', amount: 2 }],
    products: [{ item: 'Desc_AluminaSolution_C', amount: 30 }],
  },
  Recipe_AluminaSolution_C: {
    name: 'Recipe_AluminaSolution_C',
    ingredients: [{ item: 'Desc_AluminaSolution_C', amount: 120 }],
    products: [
      { item: 'Desc_AluminaSolution_C', amount: 60 },
      { item: 'Desc_Water_C', amount: 120 },
    ],
  },

  // Caterium processing
  Recipe_PureCateriumIngot_C: {
    name: 'Recipe_PureCateriumIngot_C',
    ingredients: [
      { item: 'Desc_OreGold_C', amount: 2 },
      { item: 'Desc_Water_C', amount: 2 },
    ],
    products: [{ item: 'Desc_CateriumIngot_C', amount: 2 }],
  },

  // Oil processing recipes
  Recipe_Alternate_HeavyOilResidue_C: {
    name: 'Recipe_Alternate_HeavyOilResidue_C',
    ingredients: [{ item: 'Desc_LiquidOil_C', amount: 30 }],
    products: [
      { item: 'Desc_HeavyOilResidue_C', amount: 40 },
      { item: 'Desc_PolymerResin_C', amount: 20 },
    ],
  },
  Recipe_Alternate_DilutedFuel_C: {
    name: 'Recipe_Alternate_DilutedFuel_C',
    ingredients: [
      { item: 'Desc_HeavyOilResidue_C', amount: 50 },
      { item: 'Desc_Water_C', amount: 100 },
    ],
    products: [{ item: 'Desc_Fuel_C', amount: 100 }],
  },

  // Rubber production recipes
  Recipe_ResidualRubber_C: {
    name: 'Recipe_ResidualRubber_C',
    ingredients: [
      { item: 'Desc_PolymerResin_C', amount: 40 },
      { item: 'Desc_Water_C', amount: 40 },
    ],
    products: [{ item: 'Desc_Rubber_C', amount: 20 }],
  },

  // Circular dependency recipes (plastic/rubber cycle)
  Recipe_Alternate_RecycledRubber_C: {
    name: 'Recipe_Alternate_RecycledRubber_C',
    ingredients: [
      { item: 'Desc_Plastic_C', amount: 30 },
      { item: 'Desc_Fuel_C', amount: 30 },
    ],
    products: [{ item: 'Desc_Rubber_C', amount: 60 }],
  },
  Recipe_Alternate_Plastic_1_C: {
    name: 'Recipe_Alternate_Plastic_1_C',
    ingredients: [
      { item: 'Desc_Rubber_C', amount: 30 },
      { item: 'Desc_Fuel_C', amount: 30 },
    ],
    products: [{ item: 'Desc_Plastic_C', amount: 60 }],
  },

  // Additional circular dependency recipes for batching tests
  Recipe_RecycledRubber_C: {
    name: 'Recipe_RecycledRubber_C',
    ingredients: [
      { item: 'Desc_Plastic_C', amount: 30 },
      { item: 'Desc_Fuel_C', amount: 30 },
    ],
    products: [{ item: 'Desc_Rubber_C', amount: 60 }],
  },
  Recipe_RecycledPlastic_C: {
    name: 'Recipe_RecycledPlastic_C',
    ingredients: [
      { item: 'Desc_Rubber_C', amount: 30 },
      { item: 'Desc_Fuel_C', amount: 30 },
    ],
    products: [{ item: 'Desc_Plastic_C', amount: 60 }],
  },

  // Steel production recipes
  Recipe_Alternate_IngotSteel_1_C: {
    name: 'Recipe_Alternate_IngotSteel_1_C',
    ingredients: [
      { item: 'Desc_IronIngot_C', amount: 40 },
      { item: 'Desc_Coal_C', amount: 40 },
    ],
    products: [{ item: 'Desc_SteelIngot_C', amount: 60 }],
  },

  // Alternate steel products
  Recipe_Alternate_SteelRod_C: {
    name: 'Recipe_Alternate_SteelRod_C',
    ingredients: [{ item: 'Desc_SteelIngot_C', amount: 12 }],
    products: [{ item: 'Desc_IronRod_C', amount: 48 }],
  },
  Recipe_Alternate_SteelCastedPlate_C: {
    name: 'Recipe_Alternate_SteelCastedPlate_C',
    ingredients: [
      { item: 'Desc_IronIngot_C', amount: 15 },
      { item: 'Desc_SteelIngot_C', amount: 15 },
    ],
    products: [{ item: 'Desc_IronPlate_C', amount: 45 }],
  },

  // Alternate pure iron ingot recipe
  Recipe_Alternate_PureIronIngot_C: {
    name: 'Recipe_Alternate_PureIronIngot_C',
    ingredients: [
      { item: 'Desc_OreIron_C', amount: 35 },
      { item: 'Desc_Water_C', amount: 20 },
    ],
    products: [{ item: 'Desc_IronIngot_C', amount: 65 }],
  },

  // Alternate wire recipe
  Recipe_Alternate_Wire_1_C: {
    name: 'Recipe_Alternate_Wire_1_C',
    ingredients: [{ item: 'Desc_IronIngot_C', amount: 12.5 }],
    products: [{ item: 'Desc_Wire_C', amount: 22.5 }],
  },

  // Alternate reinforced iron plate recipe
  Recipe_Alternate_ReinforcedIronPlate_2_C: {
    name: 'Recipe_Alternate_ReinforcedIronPlate_2_C',
    ingredients: [
      { item: 'Desc_IronPlate_C', amount: 18.75 },
      { item: 'Desc_Wire_C', amount: 37.5 },
    ],
    products: [{ item: 'Desc_IronPlateReinforced_C', amount: 5.625 }],
  },

  // Modular Frame recipe
  Recipe_ModularFrame_C: {
    name: 'Recipe_ModularFrame_C',
    ingredients: [
      { item: 'Desc_IronPlateReinforced_C', amount: 3 },
      { item: 'Desc_IronRod_C', amount: 12 },
    ],
    products: [{ item: 'Desc_ModularFrame_C', amount: 2 }],
  },

  // Fixed the plastic/rubber test - adding required recipe and fixing name
  Recipe_DilutedFuel_C: {
    name: 'Recipe_DilutedFuel_C',
    ingredients: [
      { item: 'Desc_HeavyOilResidue_C', amount: 50 },
      { item: 'Desc_Water_C', amount: 100 },
    ],
    products: [{ item: 'Desc_Fuel_C', amount: 100 }],
  },
  Recipe_FluidCanister_C: {
    name: 'Recipe_FluidCanister_C',
    ingredients: [{ item: 'Desc_Plastic_C', amount: 2 }],
    products: [{ item: 'Desc_FluidCanister_C', amount: 4 }],
  },
}

// Item database for testing
export const itemDatabase = {
  Desc_OreIron_C: { name: 'Iron Ore' },
  Desc_OreCopper_C: { name: 'Copper Ore' },
  Desc_Coal_C: { name: 'Coal' },
  Desc_OreBauxite_C: { name: 'Bauxite' },
  Desc_OreGold_C: { name: 'Caterium Ore' },
  Desc_Water_C: { name: 'Water' },
  Desc_Stone_C: { name: 'Stone' },
  Desc_LiquidOil_C: { name: 'Crude Oil' },
  Desc_IronIngot_C: { name: 'Iron Ingot' },
  Desc_CopperIngot_C: { name: 'Copper Ingot' },
  Desc_SteelIngot_C: { name: 'Steel Ingot' },
  Desc_CateriumIngot_C: { name: 'Caterium Ingot' },
  Desc_IronPlate_C: { name: 'Iron Plate' },
  Desc_IronRod_C: { name: 'Iron Rod' },
  Desc_Wire_C: { name: 'Wire' },
  Desc_Cable_C: { name: 'Cable' },
  Desc_Concrete_C: { name: 'Concrete' },
  Desc_IronPlateReinforced_C: { name: 'Reinforced Iron Plate' },
  Desc_SteelCastedPlate_C: { name: 'Steel Casted Plate' },
  Desc_ModularFrame_C: { name: 'Modular Frame' },
  Desc_AluminaSolution_C: { name: 'Alumina Solution' },
  Desc_HeavyOilResidue_C: { name: 'Heavy Oil Residue' },
  Desc_PolymerResin_C: { name: 'Polymer Resin' },
  Desc_Fuel_C: { name: 'Fuel' },
  Desc_Rubber_C: { name: 'Rubber' },
  Desc_Plastic_C: { name: 'Plastic' },
  Desc_FluidCanister_C: { name: 'Fluid Canister' },
}

/**
 * Creates a mock data store for testing that uses the recipe database fixture
 * instead of mockReturnValueOnce calls
 */
export function createMockDataStore() {
  return {
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
