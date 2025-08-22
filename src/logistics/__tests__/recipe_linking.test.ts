import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMaterialLinks } from '../material-linker'
import { useDataStore } from '@/stores/data'

vi.mock('@/stores/data')

describe('recipe linking', () => {
  let mockDataStore: ReturnType<typeof useDataStore>

  beforeEach(() => {
    mockDataStore = {
      recipeIngredients: vi.fn(),
      recipeProducts: vi.fn(),
      items: {
        Desc_OreIron_C: { name: 'Iron Ore' },
        Desc_OreCopper_C: { name: 'Copper Ore' },
        Desc_Water_C: { name: 'Water' },
      },
    }
    vi.mocked(useDataStore).mockReturnValue(mockDataStore)
  })

  const createRecipe = (name: string, building = 'TestBuilding', count = 1) => ({
    name,
    building,
    count,
  })

  const createRecipeItem = (amount: number, recipeName: string) => ({
    amount,
    recipe: createRecipe(recipeName),
    isResource: false,
  })

  describe('natural resource handling', () => {
    it('should handle natural resource not produced (no sources)', () => {
      const recipe = createRecipe('Recipe_IronIngot_C')
      const alreadyProduced = {}

      mockDataStore.recipeIngredients.mockReturnValue([{ item: 'Desc_OreIron_C', amount: 30 }])
      mockDataStore.recipeProducts.mockReturnValue([{ item: 'Desc_IronIngot_C', amount: 30 }])

      const result = createMaterialLinks(recipe, alreadyProduced, [], new Map())

      expect(result).toEqual([
        {
          source: 'Desc_OreIron_C',
          sink: 'Recipe_IronIngot_C',
          material: 'Desc_OreIron_C',
          amount: 30,
        },
      ])
    })

    it('should handle natural resource partially produced', () => {
      const recipe = createRecipe('Recipe_IronIngot_C')
      const alreadyProduced = {
        Desc_OreIron_C: [createRecipeItem(15, 'MiningRecipe')],
      }

      mockDataStore.recipeIngredients.mockReturnValue([{ item: 'Desc_OreIron_C', amount: 30 }])
      mockDataStore.recipeProducts.mockReturnValue([{ item: 'Desc_IronIngot_C', amount: 30 }])

      const result = createMaterialLinks(recipe, alreadyProduced, [], new Map())

      expect(result).toEqual([
        {
          source: 'MiningRecipe',
          sink: 'Recipe_IronIngot_C',
          material: 'Desc_OreIron_C',
          amount: 15,
        },
        {
          source: 'Desc_OreIron_C',
          sink: 'Recipe_IronIngot_C',
          material: 'Desc_OreIron_C',
          amount: 15,
        },
      ])
      expect(alreadyProduced.Desc_OreIron_C[0].amount).toBe(0)
    })

    it('should handle natural resource fully/over produced', () => {
      const recipe = createRecipe('Recipe_IronIngot_C')
      const alreadyProduced = {
        Desc_OreIron_C: [createRecipeItem(50, 'MiningRecipe')],
      }

      mockDataStore.recipeIngredients.mockReturnValue([{ item: 'Desc_OreIron_C', amount: 30 }])
      mockDataStore.recipeProducts.mockReturnValue([{ item: 'Desc_IronIngot_C', amount: 30 }])

      const result = createMaterialLinks(recipe, alreadyProduced, [], new Map())

      expect(result).toEqual([
        {
          source: 'MiningRecipe',
          sink: 'Recipe_IronIngot_C',
          material: 'Desc_OreIron_C',
          amount: 30,
        },
      ])
      expect(alreadyProduced.Desc_OreIron_C[0].amount).toBe(20)
    })
  })

  describe('catalyst recipes', () => {
    it('should handle catalyst with partial production', () => {
      const recipe = createRecipe('Recipe_AluminaSolution_C')
      const alreadyProduced = {
        Desc_Water_C: [createRecipeItem(60, 'WaterExtractor')],
      }

      mockDataStore.recipeIngredients.mockReturnValue([
        { item: 'Desc_AluminaSolution_C', amount: 120 },
        { item: 'Desc_Water_C', amount: 120 },
      ])
      mockDataStore.recipeProducts.mockReturnValue([{ item: 'Desc_AluminaSolution_C', amount: 60 }])

      const result = createMaterialLinks(recipe, alreadyProduced, [], new Map())

      expect(result).toEqual([
        /* used to be the list of available resources, changed to empty since if insufficient no point claiming resources
        {
          source: 'Recipe_AluminaSolution_C',
          sink: 'Recipe_AluminaSolution_C',
          material: 'Desc_AluminaSolution_C',
          amount: 60,
        },
        {
          source: 'WaterExtractor',
          sink: 'Recipe_AluminaSolution_C',
          material: 'Desc_Water_C',
          amount: 60,
        },
        {
          source: 'Desc_Water_C',
          sink: 'Recipe_AluminaSolution_C',
          material: 'Desc_Water_C',
          amount: 60,
        },
        */
      ])
      // should not consume any resources
      expect(alreadyProduced.Desc_Water_C[0].amount).toBe(60)
    })

    it('should handle catalyst with full production', () => {
      const recipe = createRecipe('Recipe_AluminaSolution_C')
      const alreadyProduced = {
        Desc_Water_C: [createRecipeItem(200, 'WaterExtractor')],
      }

      mockDataStore.recipeIngredients.mockReturnValue([
        { item: 'Desc_AluminaSolution_C', amount: 60 },
        { item: 'Desc_Water_C', amount: 120 },
      ])
      mockDataStore.recipeProducts.mockReturnValue([
        { item: 'Desc_AluminaSolution_C', amount: 120 },
      ])

      // Create preprocessed data for catalyst recipe
      const recipeData = new Map()
      recipeData.set('Recipe_AluminaSolution_C', {
        recipe,
        ingredients: [
          { item: 'Desc_AluminaSolution_C', amount: 0 }, // Reduced by catalyst amount (60)
          { item: 'Desc_Water_C', amount: 120 },
        ],
        products: [
          { item: 'Desc_AluminaSolution_C', amount: 60 }, // Reduced by catalyst amount (60)
        ],
      })

      const availableCircularLinks = [
        {
          source: 'Recipe_AluminaSolution_C',
          sink: 'Recipe_AluminaSolution_C',
          material: 'Desc_AluminaSolution_C',
          amount: 60,
        },
      ]

      const result = createMaterialLinks(
        recipe,
        alreadyProduced,
        availableCircularLinks,
        recipeData,
      )

      expect(result).toEqual([
        {
          source: 'WaterExtractor',
          sink: 'Recipe_AluminaSolution_C',
          material: 'Desc_Water_C',
          amount: 120,
        },
      ])
      expect(alreadyProduced.Desc_Water_C[0].amount).toBe(80)
    })

    it('links catalysts with multiple instances', () => {
      const recipe = createRecipe('Recipe_AluminaSolution_C', 'TestBuilding', 3)
      const alreadyProduced = {
        Desc_Water_C: [createRecipeItem(400, 'WaterExtractor')],
      }

      mockDataStore.recipeIngredients.mockReturnValue([
        { item: 'Desc_AluminaSolution_C', amount: 60 },
        { item: 'Desc_Water_C', amount: 120 },
      ])
      mockDataStore.recipeProducts.mockReturnValue([{ item: 'Desc_AluminaSolution_C', amount: 80 }])

      // Create preprocessed data for catalyst recipe with 3 instances
      const recipeData = new Map()
      recipeData.set('Recipe_AluminaSolution_C', {
        recipe,
        ingredients: [
          { item: 'Desc_AluminaSolution_C', amount: 0 }, // Reduced by catalyst amount (60)
          { item: 'Desc_Water_C', amount: 120 },
        ],
        products: [
          { item: 'Desc_AluminaSolution_C', amount: 20 }, // 80 - 60 catalyst = 20 net production
        ],
      })

      const availableCircularLinks = [
        {
          source: 'Recipe_AluminaSolution_C',
          sink: 'Recipe_AluminaSolution_C',
          material: 'Desc_AluminaSolution_C',
          amount: 180, // 60 * 3 instances
        },
      ]

      const result = createMaterialLinks(
        recipe,
        alreadyProduced,
        availableCircularLinks,
        recipeData,
      )

      expect(result).toEqual([
        {
          source: 'WaterExtractor',
          sink: 'Recipe_AluminaSolution_C',
          material: 'Desc_Water_C',
          amount: 360,
        },
      ])
      expect(alreadyProduced.Desc_Water_C[0].amount).toBe(40)
    })
  })

  describe('resource availability scenarios', () => {
    it('should handle items not fully available', () => {
      const recipe = createRecipe('Recipe_IronPlateReinforced_C', 'TestBuilding', 5)
      const alreadyProduced = {
        Desc_IronPlate_C: [createRecipeItem(20, 'IronPlateRecipe')],
        Desc_IronRod_C: [createRecipeItem(8, 'IronRodRecipe')],
      }

      mockDataStore.recipeIngredients.mockReturnValue([
        { item: 'Desc_IronPlate_C', amount: 30 },
        { item: 'Desc_IronRod_C', amount: 12 },
      ])
      mockDataStore.recipeProducts.mockReturnValue([
        { item: 'Desc_IronPlateReinforced_C', amount: 5 },
      ])

      const result = createMaterialLinks(recipe, alreadyProduced, [], new Map())

      expect(result).toEqual([])
      expect(alreadyProduced.Desc_IronPlate_C[0].amount).toBe(20)
      expect(alreadyProduced.Desc_IronRod_C[0].amount).toBe(8)
    })

    it('should handle single source', () => {
      const recipe = createRecipe('Recipe_IronPlate_C', 'TestBuilding', 2)
      const alreadyProduced = {
        Desc_IronIngot_C: [createRecipeItem(50, 'IronIngotRecipe')],
      }

      mockDataStore.recipeIngredients.mockReturnValue([{ item: 'Desc_IronIngot_C', amount: 20 }])
      mockDataStore.recipeProducts.mockReturnValue([{ item: 'Desc_IronPlate_C', amount: 10 }])

      const result = createMaterialLinks(recipe, alreadyProduced, [], new Map())

      expect(result).toEqual([
        {
          source: 'IronIngotRecipe',
          sink: 'Recipe_IronPlate_C',
          material: 'Desc_IronIngot_C',
          amount: 40,
        },
      ])
      expect(alreadyProduced.Desc_IronIngot_C[0].amount).toBe(10)
    })

    it('should handle multiple sources', () => {
      const recipe = createRecipe('Recipe_Cable_C')
      const alreadyProduced = {
        Desc_Wire_C: [
          createRecipeItem(15, 'WireRecipe1'),
          createRecipeItem(25, 'WireRecipe2'),
          createRecipeItem(10, 'WireRecipe3'),
        ],
      }

      mockDataStore.recipeIngredients.mockReturnValue([{ item: 'Desc_Wire_C', amount: 40 }])
      mockDataStore.recipeProducts.mockReturnValue([{ item: 'Desc_Cable_C', amount: 30 }])

      const result = createMaterialLinks(recipe, alreadyProduced, [], new Map())

      expect(result).toEqual([
        {
          source: 'WireRecipe3',
          sink: 'Recipe_Cable_C',
          material: 'Desc_Wire_C',
          amount: 10,
        },
        {
          source: 'WireRecipe1',
          sink: 'Recipe_Cable_C',
          material: 'Desc_Wire_C',
          amount: 15,
        },
        {
          source: 'WireRecipe2',
          sink: 'Recipe_Cable_C',
          material: 'Desc_Wire_C',
          amount: 15,
        },
      ])
      // production gets sorted by quantity
      expect(alreadyProduced.Desc_Wire_C).toEqual([
        createRecipeItem(0, 'WireRecipe3'),
        createRecipeItem(0, 'WireRecipe1'),
        createRecipeItem(10, 'WireRecipe2'),
      ])
    })

    it('should link when recipe produces more than one qty output', () => {
      // e.g. 3 ingots -> 2 plates, but we only need one plate
      // so input of 2 ingots should be enough
      const recipe = {
        name: 'Recipe_IronPlate_C',
        building: 'TestBuilding',
        count: 0.5,
      }

      mockDataStore.recipeIngredients.mockReturnValue([{ item: 'Desc_IronIngot_C', amount: 3 }])
      mockDataStore.recipeProducts.mockReturnValue([{ item: 'Desc_IronPlate_C', amount: 2 }])

      const result = createMaterialLinks(
        recipe,
        {
          Desc_IronIngot_C: [createRecipeItem(2, 'Recipe_IronIngot_C')],
        },
        [],
        new Map(),
      )

      expect(result).toEqual([
        {
          source: 'Recipe_IronIngot_C',
          sink: 'Recipe_IronPlate_C',
          material: 'Desc_IronIngot_C',
          amount: 1.5,
        },
      ])
    })
  })
})
