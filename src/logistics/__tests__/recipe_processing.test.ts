import { describe, it, expect, vi, beforeEach } from 'vitest'
import { linkRecipes } from '../recipe_import'
import { useDataStore } from '@/stores/data'

vi.mock('@/stores/data')

// Recipe data structures for test scenarios
interface RecipeData {
  name: string
  ingredients: Array<{ item: string; amount: number }>
  products: Array<{ item: string; amount: number }>
}

const recipeDatabase: Record<string, RecipeData> = {
  Recipe_IronIngot_C: {
    name: 'Recipe_IronIngot_C',
    ingredients: [{ item: 'Desc_OreIron_C', amount: 1 }],
    products: [{ item: 'Desc_IronIngot_C', amount: 1 }],
  },
  Recipe_IronPlate_C: {
    name: 'Recipe_IronPlate_C',
    ingredients: [{ item: 'Desc_IronIngot_C', amount: 3 }],
    products: [{ item: 'Desc_IronPlate_C', amount: 2 }],
  },
  Recipe_CopperIngot_C: {
    name: 'Recipe_CopperIngot_C',
    ingredients: [{ item: 'Desc_OreCopper_C', amount: 1 }],
    products: [{ item: 'Desc_CopperIngot_C', amount: 1 }],
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
  Recipe_CrudeOilRefining_C: {
    name: 'Recipe_CrudeOilRefining_C',
    ingredients: [{ item: 'Desc_LiquidOil_C', amount: 3 }],
    products: [
      { item: 'Desc_LiquidFuel_C', amount: 4 },
      { item: 'Desc_PolymerResin_C', amount: 2 },
    ],
  },
  Recipe_Plastic_C: {
    name: 'Recipe_Plastic_C',
    ingredients: [{ item: 'Desc_LiquidFuel_C', amount: 6 }],
    products: [{ item: 'Desc_Plastic_C', amount: 2 }],
  },
  Recipe_AluminaSolution_C: {
    name: 'Recipe_AluminaSolution_C',
    ingredients: [
      { item: 'Desc_AluminaSolution_C', amount: 60 },
      { item: 'Desc_Water_C', amount: 120 },
    ],
    products: [{ item: 'Desc_AluminaSolution_C', amount: 120 }],
  },
  Recipe_PureCateriumIngot_C: {
    name: 'Recipe_PureCateriumIngot_C',
    ingredients: [
      { item: 'Desc_CateriumIngot_C', amount: 2 },
      { item: 'Desc_Water_C', amount: 2 },
    ],
    products: [{ item: 'Desc_CateriumIngot_C', amount: 2 }],
  },
}

describe('linkRecipes integration - production chain processing', () => {
  let mockDataStore: ReturnType<typeof useDataStore>

  beforeEach(() => {
    mockDataStore = {
      recipeIngredients: vi.fn((recipeName: string) => {
        const recipe = recipeDatabase[recipeName]
        return recipe ? recipe.ingredients : []
      }),
      recipeProducts: vi.fn((recipeName: string) => {
        const recipe = recipeDatabase[recipeName]
        return recipe ? recipe.products : []
      }),
      items: {
        Desc_OreIron_C: { name: 'Iron Ore' },
        Desc_OreCopper_C: { name: 'Copper Ore' },
        Desc_Water_C: { name: 'Water' },
        Desc_Stone_C: { name: 'Stone' },
        Desc_LiquidOil_C: { name: 'Crude Oil' },
      },
    }
    vi.mocked(useDataStore).mockReturnValue(mockDataStore)
  })

  // Tests a basic 2-step production chain: Iron Ore -> Iron Ingot -> Iron Plate
  it('should handle simple production chain', () => {
    const rawRecipes = [
      '"Recipe_IronIngot_C@100#Desc_SmelterMk1_C": "3"',
      '"Recipe_IronPlate_C@100#Desc_ConstructorMk1_C": "1"',
    ]

    const result = linkRecipes(rawRecipes)

    expect(result.recipeBatches).toHaveLength(2)
    expect(result.recipeBatches[0]).toEqual([
      expect.objectContaining({ name: 'Recipe_IronIngot_C' }),
    ])
    expect(result.recipeBatches[1]).toEqual([
      expect.objectContaining({ name: 'Recipe_IronPlate_C' }),
    ])

    expect(result.recipeLinks).toEqual([
      {
        source: 'Desc_OreIron_C',
        sink: 'Recipe_IronIngot_C',
        name: 'Desc_OreIron_C',
        amount: 2,
      },
      {
        source: 'Recipe_IronIngot_C',
        sink: 'Recipe_IronPlate_C',
        name: 'Desc_IronIngot_C',
        amount: 3,
      },
    ])
  })

  // Tests a multi-tier production chain with parallel base materials and dependencies: Ores -> Ingots -> Wire -> Cable
  it('should handle complex production chain', () => {
    const rawRecipes = [
      '"Recipe_IronIngot_C@1#Desc_SmelterMk1_C": "1"',
      '"Recipe_CopperIngot_C@1#Desc_SmelterMk1_C": "1"',
      '"Recipe_Wire_C@1#Desc_ConstructorMk1_C": "1"',
      '"Recipe_Cable_C@1#Desc_ConstructorMk1_C": "1"',
    ]

    const result = linkRecipes(rawRecipes)

    expect(result.recipeBatches).toHaveLength(3)
    expect(result.recipeLinks).toEqual([
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
        amount: 1,
      },
      {
        source: 'Recipe_CopperIngot_C',
        sink: 'Recipe_Wire_C',
        name: 'Desc_CopperIngot_C',
        amount: 2,
      },
      {
        source: 'Recipe_Wire_C',
        sink: 'Recipe_Cable_C',
        name: 'Desc_Wire_C',
        amount: 2,
      },
    ])
  })

  // Tests parallel production from natural resources (both recipes can run in same batch)
  it('should handle production chain with natural resources', () => {
    const rawRecipes = [
      '"Recipe_IronIngot_C@1#Desc_SmelterMk1_C": "2"',
      '"Recipe_Concrete_C@1#Desc_ConstructorMk1_C": "1"',
    ]

    const result = linkRecipes(rawRecipes)

    expect(result.recipeBatches).toHaveLength(1)
    expect(result.recipeLinks).toEqual([
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
    ])
  })

  // Tests oil refining producing multiple byproducts, one used by subsequent recipe
  it('should handle natural resources as byproducts', () => {
    const rawRecipes = [
      '"Recipe_CrudeOilRefining_C@1#Desc_OilRefinery_C": "1"',
      '"Recipe_Plastic_C@1#Desc_Refinery_C": "1"',
    ]

    const result = linkRecipes(rawRecipes)

    expect(result.recipeBatches).toHaveLength(2)
    expect(result.recipeLinks).toEqual([
      {
        source: 'Desc_LiquidOil_C',
        sink: 'Recipe_CrudeOilRefining_C',
        name: 'Desc_LiquidOil_C',
        amount: 3,
      },
      {
        source: 'Recipe_CrudeOilRefining_C',
        sink: 'Recipe_Plastic_C',
        name: 'Desc_LiquidFuel_C',
        amount: 6,
      },
    ])
  })

  // Tests insufficient production: 1 iron ingot produced, but 6 needed for 2 iron plate recipes
  it('should handle insufficient quantity production', () => {
    const rawRecipes = [
      '"Recipe_IronIngot_C@1#Desc_SmelterMk1_C": "1"', // Produces 1 iron ingot
      '"Recipe_IronPlate_C@1#Desc_ConstructorMk1_C": "2"', // Needs 6 iron ingots (3 each)
    ]

    expect(() => linkRecipes(rawRecipes)).toThrow(
      'Not enough resources to produce Recipe_IronPlate_C',
    )
  })

  // Tests exact quantity matching: 3 iron ingot smelters producing exactly what 1 iron plate constructor needs
  it('should handle sufficient quantity produced by another recipe', () => {
    const rawRecipes = [
      '"Recipe_IronIngot_C@1#Desc_SmelterMk1_C": "3"', // Produces 3 iron ingots
      '"Recipe_IronPlate_C@1#Desc_ConstructorMk1_C": "1"', // Needs 3 iron ingots
    ]

    const result = linkRecipes(rawRecipes)

    expect(result.recipeBatches).toHaveLength(2)
    expect(result.recipeLinks).toEqual([
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
    ])
  })

  // Tests self-consuming catalyst recipe with net positive output (consumes 60, produces 120 = net +60)
  it('should handle catalyst with lower quantity output', () => {
    const rawRecipes = ['"Recipe_AluminaSolution_C@1#Desc_Refinery_C": "1"']

    const result = linkRecipes(rawRecipes)

    expect(result.recipeBatches).toHaveLength(1)
    expect(result.recipeLinks).toEqual([
      {
        source: 'Recipe_AluminaSolution_C',
        sink: 'Recipe_AluminaSolution_C',
        name: 'Desc_AluminaSolution_C',
        amount: 60,
      },
      {
        source: 'Desc_Water_C',
        sink: 'Recipe_AluminaSolution_C',
        name: 'Desc_Water_C',
        amount: 120,
      },
    ])
  })

  // Tests self-consuming catalyst recipe with no net gain (consumes 2, produces 2 = net 0)
  it('should handle catalyst with matching input/output quantities', () => {
    const rawRecipes = ['"Recipe_PureCateriumIngot_C@1#Desc_Refinery_C": "1"']

    const result = linkRecipes(rawRecipes)

    expect(result.recipeBatches).toHaveLength(1)
    expect(result.recipeLinks).toEqual([
      {
        source: 'Recipe_PureCateriumIngot_C',
        sink: 'Recipe_PureCateriumIngot_C',
        name: 'Desc_CateriumIngot_C',
        amount: 2,
      },
      {
        source: 'Desc_Water_C',
        sink: 'Recipe_PureCateriumIngot_C',
        name: 'Desc_Water_C',
        amount: 2,
      },
    ])
  })
})
