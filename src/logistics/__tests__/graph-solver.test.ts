import { describe, it, expect, vi, beforeEach } from 'vitest'
import { newRecipeNode, getCatalystQuantity, selectIngredientSources } from '../graph-solver'
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

  describe('selectIngredientSources', () => {
    const createIngredient = (item: string, amount: number): RecipeIngredient => ({
      item,
      amount,
    })

    it('should return empty array for zero amount needed', () => {
      const ingredient = createIngredient('Desc_IronIngot_C', 1)
      const sources = { Source1: 10, Source2: 5 }

      const result = selectIngredientSources(ingredient, 0, sources)

      expect(result).toEqual([])
    })

    it('should return empty array for insufficient crafted sources', () => {
      const ingredient = createIngredient('Desc_IronIngot_C', 1)
      const sources = { Source1: 5, Source2: 3 }

      const result = selectIngredientSources(ingredient, 10, sources)

      expect(result).toEqual([])
    })

    it('should return single source that exactly satisfies amount needed', () => {
      const ingredient = createIngredient('Desc_IronIngot_C', 1)
      const sources = { Source1: 10, Source2: 5 }

      const result = selectIngredientSources(ingredient, 10, sources)

      expect(result).toEqual(['Source1'])
    })

    it('should return smallest source that can satisfy amount needed', () => {
      const ingredient = createIngredient('Desc_IronIngot_C', 1)
      const sources = { Source1: 20, Source2: 12, Source3: 8 }

      const result = selectIngredientSources(ingredient, 10, sources)

      expect(result).toEqual(['Source2'])
    })

    it('should combine multiple sources when no single source is sufficient', () => {
      const ingredient = createIngredient('Desc_IronIngot_C', 1)
      const sources = { Source1: 5, Source2: 8, Source3: 3 }

      const result = selectIngredientSources(ingredient, 12, sources)

      expect(result).toEqual(['Source3', 'Source1', 'Source2'])
    })

    it('should consume smallest sources first when combining multiple', () => {
      const ingredient = createIngredient('Desc_IronIngot_C', 1)
      const sources = { Source1: 10, Source2: 3, Source3: 7, Source4: 5 }

      const result = selectIngredientSources(ingredient, 15, sources)

      expect(result).toEqual(['Source2', 'Source4', 'Source3'])
    })

    it('should stop consuming when amount needed is satisfied within threshold', () => {
      const ingredient = createIngredient('Desc_IronIngot_C', 1)
      const sources = { Source1: 5, Source2: 6 }

      const result = selectIngredientSources(ingredient, 5.05, sources) // Within ZERO_THRESHOLD

      expect(result).toEqual(['Source1'])
    })

    it('should allow natural resources with insufficient crafted sources', () => {
      const ingredient = createIngredient('Desc_OreIron_C', 1) // Natural resource
      const sources = { Source1: 5, Source2: 3 }

      const result = selectIngredientSources(ingredient, 10, sources)

      expect(result).toEqual(['Source2', 'Source1', 'Desc_OreIron_C'])
    })

    it('should not add natural source when crafted sources are sufficient for natural resource', () => {
      const ingredient = createIngredient('Desc_OreIron_C', 1) // Natural resource
      const sources = { Source1: 8, Source2: 5 }

      const result = selectIngredientSources(ingredient, 10, sources)

      expect(result).toEqual(['Source2', 'Source1'])
    })

    it('should handle empty sources for natural resource', () => {
      const ingredient = createIngredient('Desc_OreIron_C', 1) // Natural resource
      const sources = {}

      const result = selectIngredientSources(ingredient, 10, sources)

      expect(result).toEqual(['Desc_OreIron_C'])
    })

    it('should handle empty sources for crafted ingredient', () => {
      const ingredient = createIngredient('Desc_IronIngot_C', 1) // Crafted ingredient
      const sources = {}

      const result = selectIngredientSources(ingredient, 10, sources)

      expect(result).toEqual([])
    })

    it('should prefer sources that satisfy exact amount within threshold', () => {
      const ingredient = createIngredient('Desc_IronIngot_C', 1)
      const sources = { Source1: 9.99, Source2: 15 } // Source1 is within threshold of 10

      const result = selectIngredientSources(ingredient, 10, sources)

      expect(result).toEqual(['Source1'])
    })
  })
})
