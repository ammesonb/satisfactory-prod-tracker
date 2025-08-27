import { describe, it, expect } from 'vitest'
import {
  newRecipeNode,
  getCatalystQuantity,
  produceRecipe,
  decrementConsumedProducts,
} from '../graph-node'
import type { Recipe, RecipeIngredient, RecipeProduct } from '@/types/data'

describe('graph-node unit tests', () => {
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

  describe('produceRecipe', () => {
    it('should set availableProducts as copy of products', () => {
      const mockRecipe = newRecipeNode(
        { name: 'Recipe_Test_C', count: 1 },
        [{ item: 'Desc_Input_C', amount: 1 }],
        [
          { item: 'Desc_Output1_C', amount: 2 },
          { item: 'Desc_Output2_C', amount: 3 },
        ],
      )

      const mockInputs = [
        { source: 'Recipe_Source_C', sink: 'Recipe_Test_C', material: 'Desc_Input_C', amount: 1 },
      ]

      produceRecipe(mockRecipe, 5, mockInputs)

      expect(mockRecipe.availableProducts).toEqual([
        { item: 'Desc_Output1_C', amount: 2 },
        { item: 'Desc_Output2_C', amount: 3 },
      ])

      // Should be a copy, not the same reference
      expect(mockRecipe.availableProducts).not.toBe(mockRecipe.products)
      expect(mockRecipe.availableProducts[0]).not.toBe(mockRecipe.products[0])
    })

    it('should set batch number', () => {
      const mockRecipe = newRecipeNode({ name: 'Recipe_Test_C', count: 1 }, [], [])

      produceRecipe(mockRecipe, 7, [])

      expect(mockRecipe.batchNumber).toBe(7)
    })

    it('should assign inputs by reference', () => {
      const mockRecipe = newRecipeNode({ name: 'Recipe_Test_C', count: 1 }, [], [])

      const mockInputs = [
        { source: 'Recipe_Source_C', sink: 'Recipe_Test_C', material: 'Desc_Input_C', amount: 1 },
      ]

      produceRecipe(mockRecipe, 1, mockInputs)

      expect(mockRecipe.inputs).toBe(mockInputs) // Same reference
      expect(mockRecipe.inputs).toEqual(mockInputs)
    })

    it('should handle empty products and inputs', () => {
      const mockRecipe = newRecipeNode({ name: 'Recipe_Empty_C', count: 1 }, [], [])

      produceRecipe(mockRecipe, 3, [])

      expect(mockRecipe.availableProducts).toEqual([])
      expect(mockRecipe.batchNumber).toBe(3)
      expect(mockRecipe.inputs).toEqual([])
    })
  })

  describe('decrementConsumedProducts', () => {
    it('should decrement available products and add output links', () => {
      const sourceRecipe = newRecipeNode(
        { name: 'Recipe_Source_C', count: 1 },
        [],
        [{ item: 'Desc_Material_C', amount: 10 }],
      )
      sourceRecipe.availableProducts = [{ item: 'Desc_Material_C', amount: 10 }]

      const sinkRecipe = newRecipeNode(
        { name: 'Recipe_Sink_C', count: 1 },
        [{ item: 'Desc_Material_C', amount: 5 }],
        [],
      )

      const recipesByName = {
        [sourceRecipe.recipe.name]: sourceRecipe,
        [sinkRecipe.recipe.name]: sinkRecipe,
      }

      const links = [
        {
          source: 'Recipe_Source_C',
          sink: 'Recipe_Sink_C',
          material: 'Desc_Material_C',
          amount: 5,
        },
      ]

      decrementConsumedProducts(recipesByName, links, [sourceRecipe])

      expect(sourceRecipe.availableProducts[0].amount).toBe(5)
      expect(sourceRecipe.outputs).toHaveLength(1)
      expect(sourceRecipe.outputs[0]).toBe(links[0])
      expect(sourceRecipe.fullyConsumed).toBe(false)
    })

    it('should mark recipe as fully consumed when all products are consumed', () => {
      const sourceRecipe = newRecipeNode(
        { name: 'Recipe_Source_C', count: 1 },
        [],
        [
          { item: 'Desc_Material1_C', amount: 5 },
          { item: 'Desc_Material2_C', amount: 3 },
        ],
      )
      sourceRecipe.availableProducts = [
        { item: 'Desc_Material1_C', amount: 5 },
        { item: 'Desc_Material2_C', amount: 3 },
      ]

      const recipesByName = { Recipe_Source_C: sourceRecipe }

      const links = [
        {
          source: 'Recipe_Source_C',
          sink: 'Recipe_Sink1_C',
          material: 'Desc_Material1_C',
          amount: 5,
        },
        {
          source: 'Recipe_Source_C',
          sink: 'Recipe_Sink2_C',
          material: 'Desc_Material2_C',
          amount: 3,
        },
      ]

      decrementConsumedProducts(recipesByName, links, [sourceRecipe])

      expect(sourceRecipe.availableProducts[0].amount).toBe(0)
      expect(sourceRecipe.availableProducts[1].amount).toBe(0)
      expect(sourceRecipe.fullyConsumed).toBe(true)
      expect(sourceRecipe.outputs).toHaveLength(2)
    })

    it('should not mark as fully consumed when products remain above threshold', () => {
      const sourceRecipe = newRecipeNode(
        { name: 'Recipe_Source_C', count: 1 },
        [],
        [{ item: 'Desc_Material_C', amount: 10 }],
      )
      sourceRecipe.availableProducts = [{ item: 'Desc_Material_C', amount: 10 }]

      const recipesByName = { Recipe_Source_C: sourceRecipe }

      const links = [
        {
          source: 'Recipe_Source_C',
          sink: 'Recipe_Sink_C',
          material: 'Desc_Material_C',
          amount: 3,
        },
      ]

      decrementConsumedProducts(recipesByName, links, [sourceRecipe])

      expect(sourceRecipe.availableProducts[0].amount).toBe(7)
      expect(sourceRecipe.fullyConsumed).toBe(false)
    })

    it('should handle multiple links from the same source', () => {
      const sourceRecipe = newRecipeNode(
        { name: 'Recipe_Source_C', count: 1 },
        [],
        [{ item: 'Desc_Material_C', amount: 20 }],
      )
      sourceRecipe.availableProducts = [{ item: 'Desc_Material_C', amount: 20 }]

      const recipesByName = { Recipe_Source_C: sourceRecipe }

      const links = [
        {
          source: 'Recipe_Source_C',
          sink: 'Recipe_Sink1_C',
          material: 'Desc_Material_C',
          amount: 7,
        },
        {
          source: 'Recipe_Source_C',
          sink: 'Recipe_Sink2_C',
          material: 'Desc_Material_C',
          amount: 5,
        },
        {
          source: 'Recipe_Source_C',
          sink: 'Recipe_Sink3_C',
          material: 'Desc_Material_C',
          amount: 3,
        },
      ]

      decrementConsumedProducts(recipesByName, links, [sourceRecipe])

      expect(sourceRecipe.availableProducts[0].amount).toBe(5) // 20 - 7 - 5 - 3
      expect(sourceRecipe.outputs).toHaveLength(3)
      expect(sourceRecipe.fullyConsumed).toBe(false)
    })

    it('should throw error when trying to consume non-existent product', () => {
      const sourceRecipe = newRecipeNode(
        { name: 'Recipe_Source_C', count: 1 },
        [],
        [{ item: 'Desc_Material1_C', amount: 10 }],
      )
      sourceRecipe.availableProducts = [{ item: 'Desc_Material1_C', amount: 10 }]

      const recipesByName = { Recipe_Source_C: sourceRecipe }

      const links = [
        {
          source: 'Recipe_Source_C',
          sink: 'Recipe_Sink_C',
          material: 'Desc_NonExistent_C',
          amount: 5,
        },
      ]

      expect(() => {
        decrementConsumedProducts(recipesByName, links, [sourceRecipe])
      }).toThrow(
        'Unable to find product Desc_NonExistent_C in source Recipe_Source_C - should never happen!',
      )
    })

    it('should mark as fully consumed when products are within zero threshold', () => {
      const sourceRecipe = newRecipeNode(
        { name: 'Recipe_Source_C', count: 1 },
        [],
        [{ item: 'Desc_Material_C', amount: 5 }],
      )
      sourceRecipe.availableProducts = [{ item: 'Desc_Material_C', amount: 0.05 }] // Within threshold

      const recipesByName = { Recipe_Source_C: sourceRecipe }

      const links = [
        {
          source: 'Recipe_Source_C',
          sink: 'Recipe_Sink_C',
          material: 'Desc_Material_C',
          amount: 0.01,
        },
      ]

      decrementConsumedProducts(recipesByName, links, [sourceRecipe])

      expect(sourceRecipe.availableProducts[0].amount).toBe(0)
      expect(sourceRecipe.fullyConsumed).toBe(true) // Should be true since 0.04 <= ZERO_THRESHOLD (0.1)
    })

    it('should handle catalyst recipe with self-referential links', () => {
      // Use the catalyst recipe from fixtures
      const recipe = { name: 'Recipe_Fake_AluminaSolution_C', count: 1 }
      const ingredients = [{ item: 'Desc_AluminaSolution_C', amount: 120 }]
      const products = [
        { item: 'Desc_AluminaSolution_C', amount: 60 },
        { item: 'Desc_Water_C', amount: 120 },
      ]

      const catalystRecipe = newRecipeNode(recipe, ingredients, products)
      catalystRecipe.availableProducts = [...products]

      const recipesByName = {
        [recipe.name]: catalystRecipe,
      }

      // Self-referential catalyst link - recipe consumes its own product
      const links = [
        {
          source: recipe.name,
          sink: recipe.name,
          material: ingredients[0].item,
          amount: ingredients[0].amount - products[0].amount, // Uses all of its own alumina solution production
        },
      ]

      // Should not throw "Source node not found" error
      expect(() => {
        decrementConsumedProducts(recipesByName, links, [catalystRecipe])
      }).not.toThrow()

      // Verify the alumina solution product is fully consumed by itself
      const aluminaSolutionProduct = catalystRecipe.availableProducts.find(
        (p) => p.item === 'Desc_AluminaSolution_C',
      )
      const waterProduct = catalystRecipe.availableProducts.find((p) => p.item === 'Desc_Water_C')

      expect(aluminaSolutionProduct?.amount).toBe(0)
      expect(waterProduct?.amount).toBe(products[1].amount) // Water should remain
      expect(catalystRecipe.outputs).toHaveLength(1)
      expect(catalystRecipe.outputs[0]).toBe(links[0])
      expect(catalystRecipe.fullyConsumed).toBe(false) // Still has water available
    })
  })
})
