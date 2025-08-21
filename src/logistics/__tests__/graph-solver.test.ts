import { describe, it, expect, vi, beforeEach } from 'vitest'
import { newRecipeNode, getCatalystQuantity } from '../graph-solver'
import { setupMockDataStore } from './recipe-fixtures'
import type { Recipe } from '@/types/factory'
import type { RecipeIngredient, RecipeProduct } from '@/types/data'

vi.mock('@/stores/data')

describe('graph-solver unit tests', () => {
  beforeEach(() => {
    setupMockDataStore()
  })

  describe('newRecipeNode', () => {
    it('should create a new recipe node with correct initial state', () => {
      const mockRecipe: Recipe = {
        name: 'Recipe_IronIngot_C',
        count: 1,
      }

      const mockIngredients: RecipeIngredient[] = [{ item: 'Desc_OreIron_C', amount: 1 }]

      const mockProducts: RecipeProduct[] = [{ item: 'Desc_IronIngot_C', amount: 1 }]

      const node = newRecipeNode(mockRecipe, mockIngredients, mockProducts)

      expect(node.recipe).toEqual(mockRecipe)
      expect(node.ingredients).toEqual(mockIngredients)
      expect(node.products).toEqual(mockProducts)
      expect(node.availableProducts).toEqual([])
      expect(node.fullyConsumed).toBe(false)
      expect(node.inputs).toEqual([])
      expect(node.outputs).toEqual([])
      expect(node.batchNumber).toBeUndefined()
    })

    it('should handle empty ingredients and products', () => {
      const mockRecipe: Recipe = {
        name: 'Recipe_Empty_C',
        count: 1,
      }

      const node = newRecipeNode(mockRecipe, [], [])

      expect(node.recipe).toEqual(mockRecipe)
      expect(node.ingredients).toEqual([])
      expect(node.products).toEqual([])
      expect(node.availableProducts).toEqual([])
      expect(node.fullyConsumed).toBe(false)
      expect(node.inputs).toEqual([])
      expect(node.outputs).toEqual([])
    })

    it('should handle multiple ingredients and products', () => {
      const mockRecipe: Recipe = {
        name: 'Recipe_Cable_C',
        count: 2,
      }

      const mockIngredients: RecipeIngredient[] = [{ item: 'Desc_Wire_C', amount: 2 }]

      const mockProducts: RecipeProduct[] = [{ item: 'Desc_Cable_C', amount: 1 }]

      const node = newRecipeNode(mockRecipe, mockIngredients, mockProducts)

      expect(node.ingredients).toHaveLength(1)
      expect(node.products).toHaveLength(1)
      expect(node.ingredients[0]).toEqual({ item: 'Desc_Wire_C', amount: 2 })
      expect(node.products[0]).toEqual({ item: 'Desc_Cable_C', amount: 1 })
    })
  })

  describe('getCatalystQuantity', () => {
    it('should return catalyst quantity when ingredient is produced by the same recipe', () => {
      const mockIngredient: RecipeIngredient = {
        item: 'Desc_AluminaSolution_C',
        amount: 120,
      }

      const mockRecipe = newRecipeNode(
        { name: 'Recipe_AluminaSolution_C', count: 1 },
        [mockIngredient],
        [
          { item: 'Desc_AluminaSolution_C', amount: 60 },
          { item: 'Desc_Water_C', amount: 120 },
        ],
      )

      const catalystQuantity = getCatalystQuantity(mockIngredient, mockRecipe)

      expect(catalystQuantity).toBe(60)
    })

    it('should return 0 when ingredient is not produced by the recipe', () => {
      const mockIngredient: RecipeIngredient = {
        item: 'Desc_OreIron_C',
        amount: 1,
      }

      const mockRecipe = newRecipeNode(
        { name: 'Recipe_IronIngot_C', count: 1 },
        [mockIngredient],
        [{ item: 'Desc_IronIngot_C', amount: 1 }],
      )

      const catalystQuantity = getCatalystQuantity(mockIngredient, mockRecipe)

      expect(catalystQuantity).toBe(0)
    })

    it('should return 0 when recipe has no products', () => {
      const mockIngredient: RecipeIngredient = {
        item: 'Desc_Water_C',
        amount: 100,
      }

      const mockRecipe = newRecipeNode({ name: 'Recipe_Empty_C', count: 1 }, [mockIngredient], [])

      const catalystQuantity = getCatalystQuantity(mockIngredient, mockRecipe)

      expect(catalystQuantity).toBe(0)
    })

    it('should return first matching product amount when multiple products have same item', () => {
      const mockIngredient: RecipeIngredient = {
        item: 'Desc_TestItem_C',
        amount: 100,
      }

      const mockRecipe = newRecipeNode(
        { name: 'Recipe_DuplicateProducts_C', count: 1 },
        [mockIngredient],
        [
          { item: 'Desc_TestItem_C', amount: 25 },
          { item: 'Desc_TestItem_C', amount: 50 },
        ],
      )

      const catalystQuantity = getCatalystQuantity(mockIngredient, mockRecipe)

      expect(catalystQuantity).toBe(25)
    })
  })
})
