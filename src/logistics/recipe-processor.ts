import { useDataStore } from '@/stores/data'
import type { Recipe, Material } from '@/types/factory'
import { ZERO_THRESHOLD } from './constants'
import { parseRecipeString } from './recipe-parser'
import {
  findCircularRecipes,
  resolveCircularDependencies,
  preprocessCatalystRecipes,
} from './dependency-resolver'
import { createMaterialLinks, type RecipeItem } from './material-linker'

export const processRecipeChain = (
  rawRecipes: string[],
): {
  recipeBatches: Recipe[][]
  recipeLinks: Material[]
  producedItems: Record<string, RecipeItem[]>
} => {
  const data = useDataStore()
  const recipes = rawRecipes.map(parseRecipeString)

  // Filter out mining recipes - they don't need linking
  let remainingRecipes = recipes.filter((recipe) => recipe.building !== 'Mine')

  // Preprocess catalyst recipes
  const { recipeData, pendingCatalystLinks } = preprocessCatalystRecipes(remainingRecipes)

  const recipeBatches: Recipe[][] = []
  const recipeLinks: Material[] = []
  const producedItems: Record<string, RecipeItem[]> = {}

  let batchIndex = 0
  while (remainingRecipes.length > 0) {
    console.log('Batch', batchIndex)
    const currentBatch: Recipe[] = []
    const batchLinks: Material[] = []
    const deferredRecipes: Recipe[] = []

    // Helper function to add pending catalyst links for a recipe
    const addCatalystLinks = (recipe: Recipe) => {
      const catalystLinksForRecipe = pendingCatalystLinks
        .filter((link) => link.recipeName === recipe.name)
        .map((catalystLink) => ({
          source: recipe.name,
          sink: recipe.name,
          material: catalystLink.item,
          amount: catalystLink.amount,
        }))
      batchLinks.push(...catalystLinksForRecipe)
    }

    // Try to link each remaining recipe
    for (const recipe of remainingRecipes) {
      console.log('Recipe', recipe.name)

      // Create a copy of producedItems to avoid mutations during linking attempts
      const producedItemsCopy: Record<string, RecipeItem[]> = {}
      Object.entries(producedItems).forEach(([item, sources]) => {
        producedItemsCopy[item] = sources.map((source) => ({ ...source }))
      })

      const links = createMaterialLinks(recipe, producedItemsCopy, [], recipeData)

      if (links.length === 0) {
        console.log('Deferring recipe')
        console.log(
          'Missing ingredients:',
          recipeData.get(recipe.name)?.ingredients || data.recipeIngredients(recipe.name),
        )
        console.log('Produced items keys:', Object.keys(producedItems))
        deferredRecipes.push(recipe)
      } else {
        console.log('Produced recipe')
        currentBatch.push(recipe)
        batchLinks.push(...links)
        addCatalystLinks(recipe)

        // Apply the successful linking to the actual producedItems
        Object.entries(producedItemsCopy).forEach(([item, sources]) => {
          producedItems[item] = sources
        })
      }
    }

    // Check for circular dependencies if no progress was made
    if (currentBatch.length === 0 && deferredRecipes.length > 0) {
      console.log('No progress made, checking for circular dependencies')
      const circularRecipes = findCircularRecipes(deferredRecipes)

      if (circularRecipes.length > 0) {
        console.log(
          'Found circular recipes:',
          circularRecipes.map((r) => r.name),
        )

        // Link circular recipes to the needed sources, including each other
        const circularLinks = resolveCircularDependencies(circularRecipes)
        for (const recipe of circularRecipes) {
          const links = createMaterialLinks(recipe, producedItems, circularLinks, recipeData)
          currentBatch.push(recipe)
          batchLinks.push(...links)
          addCatalystLinks(recipe)
        }

        // Remove circular recipes from deferred
        remainingRecipes = deferredRecipes.filter((recipe) => !circularRecipes.includes(recipe))
      } else {
        throw new Error(
          'No progress made and no circular dependencies found. Missing ingredients for: ' +
            deferredRecipes.map((r) => r.name).join(', '),
        )
      }
    } else {
      remainingRecipes = deferredRecipes
    }

    recipeBatches.push(currentBatch)
    recipeLinks.push(...batchLinks)

    // Filter out consumed sources
    Object.entries(producedItems).forEach(([item, sources]) => {
      producedItems[item] = sources.filter((source) => source.amount >= ZERO_THRESHOLD)
      if (producedItems[item].length === 0) {
        delete producedItems[item]
      }
    })

    // Add products from current batch to available items for next iteration
    currentBatch.forEach((recipe) => {
      const products = recipeData.get(recipe.name)?.products || data.recipeProducts(recipe.name)
      products.forEach((product) => {
        console.log('Produced item', product.item, product.amount * recipe.count)
        if (product.amount > 0) {
          const availableAmount = product.amount * recipe.count

          if (!producedItems[product.item]) {
            producedItems[product.item] = []
          }
          producedItems[product.item].push({
            amount: availableAmount,
            recipe,
            isResource: false,
          })
        }
      })
    })

    batchIndex++
  }

  return { recipeBatches, recipeLinks, producedItems }
}
