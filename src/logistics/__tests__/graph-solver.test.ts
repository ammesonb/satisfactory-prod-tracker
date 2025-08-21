import { describe, it, expect, vi, beforeEach } from 'vitest'
import { newRecipeNode, getCatalystQuantity, selectIngredientSources, produceRecipe, decrementConsumedProducts } from '../graph-solver'
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

  describe('produceRecipe', () => {
    it('should set availableProducts as copy of products', () => {
      const mockRecipe = newRecipeNode(
        { name: 'Recipe_Test_C', count: 1 },
        [{ item: 'Desc_Input_C', amount: 1 }],
        [
          { item: 'Desc_Output1_C', amount: 2 },
          { item: 'Desc_Output2_C', amount: 3 }
        ]
      )

      const mockInputs = [
        { source: 'Recipe_Source_C', sink: 'Recipe_Test_C', material: 'Desc_Input_C', amount: 1 }
      ]

      produceRecipe(mockRecipe, 5, mockInputs)

      expect(mockRecipe.availableProducts).toHaveLength(2)
      expect(mockRecipe.availableProducts[0]).toEqual({ item: 'Desc_Output1_C', amount: 2 })
      expect(mockRecipe.availableProducts[1]).toEqual({ item: 'Desc_Output2_C', amount: 3 })
      
      // Should be a copy, not the same reference
      expect(mockRecipe.availableProducts).not.toBe(mockRecipe.products)
      expect(mockRecipe.availableProducts[0]).not.toBe(mockRecipe.products[0])
    })

    it('should set batch number', () => {
      const mockRecipe = newRecipeNode(
        { name: 'Recipe_Test_C', count: 1 },
        [],
        []
      )

      produceRecipe(mockRecipe, 7, [])

      expect(mockRecipe.batchNumber).toBe(7)
    })

    it('should assign inputs by reference', () => {
      const mockRecipe = newRecipeNode(
        { name: 'Recipe_Test_C', count: 1 },
        [],
        []
      )

      const mockInputs = [
        { source: 'Recipe_Source_C', sink: 'Recipe_Test_C', material: 'Desc_Input_C', amount: 1 }
      ]

      produceRecipe(mockRecipe, 1, mockInputs)

      expect(mockRecipe.inputs).toBe(mockInputs) // Same reference
      expect(mockRecipe.inputs).toEqual(mockInputs)
    })

    it('should handle empty products and inputs', () => {
      const mockRecipe = newRecipeNode(
        { name: 'Recipe_Empty_C', count: 1 },
        [],
        []
      )

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
        [{ item: 'Desc_Material_C', amount: 10 }]
      )
      sourceRecipe.availableProducts = [{ item: 'Desc_Material_C', amount: 10 }]

      const sinkRecipe = newRecipeNode(
        { name: 'Recipe_Sink_C', count: 1 },
        [{ item: 'Desc_Material_C', amount: 5 }],
        []
      )

      const recipesByName = {
        Recipe_Source_C: sourceRecipe,
        Recipe_Sink_C: sinkRecipe
      }

      const links = [
        { source: 'Recipe_Source_C', sink: 'Recipe_Sink_C', material: 'Desc_Material_C', amount: 5 }
      ]

      decrementConsumedProducts(recipesByName, links)

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
          { item: 'Desc_Material2_C', amount: 3 }
        ]
      )
      sourceRecipe.availableProducts = [
        { item: 'Desc_Material1_C', amount: 5 },
        { item: 'Desc_Material2_C', amount: 3 }
      ]

      const recipesByName = { Recipe_Source_C: sourceRecipe }

      const links = [
        { source: 'Recipe_Source_C', sink: 'Recipe_Sink1_C', material: 'Desc_Material1_C', amount: 5 },
        { source: 'Recipe_Source_C', sink: 'Recipe_Sink2_C', material: 'Desc_Material2_C', amount: 3 }
      ]

      decrementConsumedProducts(recipesByName, links)

      expect(sourceRecipe.availableProducts[0].amount).toBe(0)
      expect(sourceRecipe.availableProducts[1].amount).toBe(0)
      expect(sourceRecipe.fullyConsumed).toBe(true)
      expect(sourceRecipe.outputs).toHaveLength(2)
    })

    it('should not mark as fully consumed when products remain above threshold', () => {
      const sourceRecipe = newRecipeNode(
        { name: 'Recipe_Source_C', count: 1 },
        [],
        [{ item: 'Desc_Material_C', amount: 10 }]
      )
      sourceRecipe.availableProducts = [{ item: 'Desc_Material_C', amount: 10 }]

      const recipesByName = { Recipe_Source_C: sourceRecipe }

      const links = [
        { source: 'Recipe_Source_C', sink: 'Recipe_Sink_C', material: 'Desc_Material_C', amount: 3 }
      ]

      decrementConsumedProducts(recipesByName, links)

      expect(sourceRecipe.availableProducts[0].amount).toBe(7)
      expect(sourceRecipe.fullyConsumed).toBe(false)
    })

    it('should handle multiple links from the same source', () => {
      const sourceRecipe = newRecipeNode(
        { name: 'Recipe_Source_C', count: 1 },
        [],
        [{ item: 'Desc_Material_C', amount: 20 }]
      )
      sourceRecipe.availableProducts = [{ item: 'Desc_Material_C', amount: 20 }]

      const recipesByName = { Recipe_Source_C: sourceRecipe }

      const links = [
        { source: 'Recipe_Source_C', sink: 'Recipe_Sink1_C', material: 'Desc_Material_C', amount: 7 },
        { source: 'Recipe_Source_C', sink: 'Recipe_Sink2_C', material: 'Desc_Material_C', amount: 5 },
        { source: 'Recipe_Source_C', sink: 'Recipe_Sink3_C', material: 'Desc_Material_C', amount: 3 }
      ]

      decrementConsumedProducts(recipesByName, links)

      expect(sourceRecipe.availableProducts[0].amount).toBe(5) // 20 - 7 - 5 - 3
      expect(sourceRecipe.outputs).toHaveLength(3)
      expect(sourceRecipe.fullyConsumed).toBe(false)
    })

    it('should throw error when trying to consume non-existent product', () => {
      const sourceRecipe = newRecipeNode(
        { name: 'Recipe_Source_C', count: 1 },
        [],
        [{ item: 'Desc_Material1_C', amount: 10 }]
      )
      sourceRecipe.availableProducts = [{ item: 'Desc_Material1_C', amount: 10 }]

      const recipesByName = { Recipe_Source_C: sourceRecipe }

      const links = [
        { source: 'Recipe_Source_C', sink: 'Recipe_Sink_C', material: 'Desc_NonExistent_C', amount: 5 }
      ]

      expect(() => {
        decrementConsumedProducts(recipesByName, links)
      }).toThrow('Unable to find product Desc_NonExistent_C in source Recipe_Source_C - should never happen!')
    })

    it('should mark as fully consumed when products are within zero threshold', () => {
      const sourceRecipe = newRecipeNode(
        { name: 'Recipe_Source_C', count: 1 },
        [],
        [{ item: 'Desc_Material_C', amount: 5 }]
      )
      sourceRecipe.availableProducts = [{ item: 'Desc_Material_C', amount: 0.05 }] // Within threshold

      const recipesByName = { Recipe_Source_C: sourceRecipe }

      const links = [
        { source: 'Recipe_Source_C', sink: 'Recipe_Sink_C', material: 'Desc_Material_C', amount: 0.01 }
      ]

      decrementConsumedProducts(recipesByName, links)

      expect(sourceRecipe.availableProducts[0].amount).toBe(0.04)
      expect(sourceRecipe.fullyConsumed).toBe(true) // Should be true since 0.04 <= ZERO_THRESHOLD (0.1)
    })
  })
})
