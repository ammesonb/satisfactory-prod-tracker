import { describe, it, expect } from 'vitest'
import { newRecipeNode } from '@/logistics/graph-node'
import { selectIngredientSources, getRecipeLinks } from '@/logistics/graph-linker'
import type { RecipeIngredient } from '@/types/data'
import { recipeDatabase } from './recipe-fixtures'

describe('graph-linker unit tests', () => {
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

  describe('getRecipeLinks', () => {
    it('should return empty array when no ingredients', () => {
      const recipe = newRecipeNode(
        { name: 'Recipe_Empty_C', count: 1 },
        [],
        [{ item: 'Desc_Output_C', amount: 1 }],
      )

      const result = getRecipeLinks(recipe, {})

      expect(result).toEqual([])
    })

    it('should return empty array when ingredient sources are insufficient', () => {
      const ironPlate = recipeDatabase.Recipe_IronPlate_C
      const recipe = newRecipeNode(
        { name: ironPlate.name, count: 1 },
        ironPlate.ingredients,
        ironPlate.products,
      )

      const ironIngot = recipeDatabase.Recipe_IngotIron_C
      const sourceRecipe = newRecipeNode(
        { name: ironIngot.name, count: 1 },
        ironIngot.ingredients,
        ironIngot.products,
      )
      sourceRecipe.availableProducts = [{ item: ironIngot.products[0].item, amount: 20 }] // Only 20, need 30

      const producedRecipes = { [ironIngot.name]: sourceRecipe }

      const result = getRecipeLinks(recipe, producedRecipes)

      expect(result).toEqual([])
    })

    it('should create link when single source satisfies ingredient need', () => {
      const ironPlate = recipeDatabase.Recipe_IronPlate_C
      const recipe = newRecipeNode(
        { name: ironPlate.name, count: 1 },
        ironPlate.ingredients,
        ironPlate.products,
      )

      const ironIngot = recipeDatabase.Recipe_IngotIron_C
      const sourceRecipe = newRecipeNode(
        { name: ironIngot.name, count: 1 },
        ironIngot.ingredients,
        ironIngot.products,
      )
      sourceRecipe.availableProducts = [{ item: ironIngot.products[0].item, amount: 50 }]

      const producedRecipes = { [ironIngot.name]: sourceRecipe }

      const result = getRecipeLinks(recipe, producedRecipes)

      expect(result).toEqual([
        {
          source: ironIngot.name,
          sink: ironPlate.name,
          material: ironIngot.products[0].item,
          amount: 30,
        },
      ])
    })

    it('should handle multiple ingredients from different sources', () => {
      const circuitBoard = recipeDatabase.Recipe_CircuitBoard_C
      const recipe = newRecipeNode(
        { name: circuitBoard.name, count: 1 },
        circuitBoard.ingredients,
        circuitBoard.products,
      )

      // Mock copper sheet recipe
      const copperSheet = recipeDatabase.Recipe_Alternate_SteamedCopperSheet_C
      const copperSheetRecipe = newRecipeNode(
        { name: copperSheet.name, count: 1 },
        [],
        copperSheet.products,
      )
      copperSheetRecipe.availableProducts = copperSheet.products.map((product) => ({
        ...product,
        amount: 20,
      }))

      // Mock plastic recipe
      const plastic = recipeDatabase.Recipe_Plastic_C
      const plasticRecipe = newRecipeNode({ name: plastic.name, count: 1 }, [], plastic.products)
      plasticRecipe.availableProducts = plastic.products.map((product) => ({
        ...product,
        amount: 40,
      }))

      const producedRecipes = {
        [copperSheet.name]: copperSheetRecipe,
        [plastic.name]: plasticRecipe,
      }

      const result = getRecipeLinks(recipe, producedRecipes)

      expect(result).toEqual([
        {
          source: copperSheet.name,
          sink: circuitBoard.name,
          material: copperSheet.products[0].item,
          amount: 15,
        },
        {
          source: plastic.name,
          sink: circuitBoard.name,
          material: plastic.products[0].item,
          amount: 30,
        },
      ])
    })

    it('should handle multiple sources for single ingredient', () => {
      const cable = recipeDatabase.Recipe_Cable_C
      const recipe = newRecipeNode(
        { name: cable.name, count: 1 },
        cable.ingredients,
        cable.products,
      )

      const wire = recipeDatabase.Recipe_Wire_C
      const prodName = wire.products[0].item
      const wireRecipe1 = newRecipeNode({ name: wire.name, count: 1 }, [], wire.products)
      wireRecipe1.availableProducts = [{ item: prodName, amount: 20 }]

      const wireRecipe2 = newRecipeNode({ name: wire.name + '2', count: 1 }, [], wire.products)
      wireRecipe2.availableProducts = [{ item: prodName, amount: 50 }]

      const producedRecipes = {
        [wire.name]: wireRecipe1,
        [wire.name + '2']: wireRecipe2,
      }

      const result = getRecipeLinks(recipe, producedRecipes)

      expect(result).toHaveLength(2)
      expect(result).toContainEqual({
        source: wire.name,
        sink: cable.name,
        material: prodName,
        amount: 20,
      })
      expect(result).toContainEqual({
        source: wire.name + '2',
        sink: cable.name,
        material: prodName,
        amount: 40,
      })
    })

    it('should handle catalyst recipes with self-links', () => {
      const alumina = recipeDatabase.Recipe_Fake_AluminaSolution_C
      const recipe = newRecipeNode(
        { name: alumina.name, count: 1 },
        alumina.ingredients,
        alumina.products,
      )

      const aluminaRaw = recipeDatabase.Recipe_Fake_AluminaSolutionRaw_C
      const aluminaInput = newRecipeNode(
        { name: aluminaRaw.name, count: 2 },
        [],
        aluminaRaw.products,
      )
      aluminaInput.availableProducts = [
        {
          item: aluminaRaw.products[0].item,
          amount: 60,
        },
      ]

      const producedRecipes = { [aluminaRaw.name]: aluminaInput }

      const result = getRecipeLinks(recipe, producedRecipes)

      expect(result).toEqual([
        {
          source: alumina.name,
          sink: alumina.name,
          material: alumina.products[0].item,
          amount: 60,
        },
        {
          source: aluminaRaw.name,
          sink: alumina.name,
          material: aluminaRaw.products[0].item,
          amount: 60,
        },
      ])
    })

    it('should handle recipes with count multiplier', () => {
      const ironPlate = recipeDatabase.Recipe_IronPlate_C
      const recipe = newRecipeNode(
        { name: ironPlate.name, count: 3 },
        ironPlate.ingredients,
        ironPlate.products,
      )

      const ironIngot = recipeDatabase.Recipe_IngotIron_C
      const sourceRecipe = newRecipeNode({ name: ironIngot.name, count: 1 }, [], ironIngot.products)
      sourceRecipe.availableProducts = [{ item: ironIngot.products[0].item, amount: 90 }]

      const producedRecipes = { [ironIngot.name]: sourceRecipe }

      const result = getRecipeLinks(recipe, producedRecipes)

      expect(result).toEqual([
        {
          source: ironIngot.name,
          sink: ironPlate.name,
          material: ironIngot.products[0].item,
          amount: 90, // 30 * 3 count
        },
      ])
    })

    it('should return empty array when any ingredient cannot be satisfied', () => {
      const reinforced = recipeDatabase.Recipe_Alternate_ReinforcedIronPlate_1_C
      const recipe = newRecipeNode(
        { name: reinforced.name, count: 1 },
        reinforced.ingredients,
        reinforced.products,
      )

      const ironPlate = recipeDatabase.Recipe_IronPlate_C
      const plateRecipe = newRecipeNode({ name: ironPlate.name, count: 1 }, [], ironPlate.products)
      plateRecipe.availableProducts = [{ item: ironPlate.products[0].item, amount: 8 }]

      // No screw recipe available
      const producedRecipes = {
        [ironPlate.name]: plateRecipe,
      }

      const result = getRecipeLinks(recipe, producedRecipes)

      expect(result).toEqual([])
    })

    it('should handle catalyst producing more than it consumes', () => {
      const recipe = newRecipeNode(
        { name: 'Recipe_SpecialCatalyst_C', count: 1 },
        [{ item: 'Desc_TestMaterial_C', amount: 100 }],
        [{ item: 'Desc_TestMaterial_C', amount: 150 }],
      )

      const producedRecipes = {}

      const result = getRecipeLinks(recipe, producedRecipes)

      expect(result).toEqual([
        {
          source: 'Recipe_SpecialCatalyst_C',
          sink: 'Recipe_SpecialCatalyst_C',
          material: 'Desc_TestMaterial_C',
          amount: 150,
        },
      ])
    })

    it('should filter out sources with zero available products', () => {
      const cable = recipeDatabase.Recipe_Cable_C
      const recipe = newRecipeNode(
        { name: cable.name, count: 1 },
        cable.ingredients,
        cable.products,
      )

      const wire = recipeDatabase.Recipe_Wire_C
      const wireItem = wire.products[0].item
      const wireRecipe1 = newRecipeNode({ name: 'Recipe_Wire_C_1', count: 1 }, [], wire.products)
      wireRecipe1.availableProducts = [{ item: wireItem, amount: 0 }] // No available products

      const wireRecipe2 = newRecipeNode({ name: 'Recipe_Wire_C_2', count: 2 }, [], wire.products)
      wireRecipe2.availableProducts = [{ item: wireItem, amount: 60 }]

      const producedRecipes = {
        [wireRecipe1.recipe.name]: wireRecipe1,
        [wireRecipe2.recipe.name]: wireRecipe2,
      }

      const result = getRecipeLinks(recipe, producedRecipes)

      expect(result).toEqual([
        {
          source: wireRecipe2.recipe.name,
          sink: cable.name,
          material: wireItem,
          amount: 60,
        },
      ])
    })
  })
})
