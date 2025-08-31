import { useDataStore } from '@/stores/data'
import { parseRecipeString } from '@/logistics/recipe-parser'
import { groupCircularRecipes, removeRecipesFromGroups } from '@/logistics/dependency-resolver'
import {
  newRecipeNode,
  produceRecipe,
  decrementConsumedProducts,
  type RecipeNode,
} from '@/logistics/graph-node'
import { getRecipeLinks, getLinksForCircularRecipes } from '@/logistics/graph-linker'
import { RecipeChainError } from '@/errors/processing-errors'
import { EXTERNAL_RECIPE, ZERO_THRESHOLD } from '@/logistics/constants'
import type { RecipeProduct } from '@/types/data'
import { BELT_ITEM_NAMES } from '@/logistics/constants'

/**
 * Figures out recipe production chain in graph-style (breadth-first) manner.
 *
 * While pre-processing to try to group recipes ahead of time could be more optimal, then we have to go through everything twice
 * as the first pass likely cannot deal with the nuance of quantities and mutual dependencies.
 * This approach, while possibly requiring more processing time, is simpler to understand and implement.
 *
 * 1. From a list of currently-produced recipes (including natural resources), see if we have enough to produce any given recipe
 * 2. If we can produce it, then add it to this batch and decrement available products to avoid over-consumption.
 * 3. Identify and add any recipes that are codependent, where all ingredients are satisified except for a mutual dependency.
 * 4. At end of batch, flip recipes from pending -> produced for next iteration
 */
export const solveRecipeChain = (
  rawRecipes: string[],
  externalInputs: RecipeProduct[],
): RecipeNode[] => {
  const data = useDataStore()

  let pendingRecipes = rawRecipes
    .map(parseRecipeString)
    .map((recipe) =>
      newRecipeNode(recipe, data.recipeIngredients(recipe.name), data.recipeProducts(recipe.name)),
    )
  const circularRecipeGroups = groupCircularRecipes(pendingRecipes)
  const producedRecipes: Record<string, RecipeNode> = {}

  if (externalInputs.length > 0) {
    const externalRecipe = newRecipeNode(
      { name: EXTERNAL_RECIPE, building: BELT_ITEM_NAMES[0], count: 1 },
      [],
      externalInputs,
    )
    produceRecipe(externalRecipe, 0, [])
    producedRecipes[EXTERNAL_RECIPE] = externalRecipe
  }

  let batch = -1
  while (pendingRecipes.length > 0) {
    batch++
    const batchRecipes: RecipeNode[] = []

    // First try to process normal recipes
    for (const recipe of pendingRecipes) {
      const links = getRecipeLinks(recipe, producedRecipes)
      if (links.length === 0) {
        continue
      }

      produceRecipe(recipe, batch, links)
      // add recipes to batch first, so if they reference themselves we can decrement the product
      batchRecipes.push(recipe)
      decrementConsumedProducts(producedRecipes, links, batchRecipes)
    }

    // Then try circular recipe groups for remaining recipes
    const circularRecipeLinks = getLinksForCircularRecipes(circularRecipeGroups, producedRecipes)

    // Process each circular recipe that has links and hasn't been processed yet
    for (const [recipeName, links] of Object.entries(circularRecipeLinks)) {
      const recipe = pendingRecipes.find((r) => r.recipe.name === recipeName)
      if (recipe && !batchRecipes.includes(recipe)) {
        produceRecipe(recipe, batch, links)
        batchRecipes.push(recipe)
      }
    }

    for (const links of Object.values(circularRecipeLinks)) {
      decrementConsumedProducts(producedRecipes, links, batchRecipes)
    }

    removeRecipesFromGroups(circularRecipeGroups, batchRecipes)

    // Handle infinite loop if no recipes can be processed
    if (batchRecipes.length === 0) {
      const missingDependencies = getMissingDependencies(pendingRecipes, producedRecipes)
      throw new RecipeChainError(
        pendingRecipes.map((recipe) => recipe.recipe.name),
        missingDependencies,
      )
    }

    pendingRecipes = pendingRecipes.filter((recipe) => !batchRecipes.includes(recipe))
    // wait to add recipes to produced until AFTER batch, to get proper tiering/sorting
    Object.assign(
      producedRecipes,
      Object.fromEntries(batchRecipes.map((recipe) => [recipe.recipe.name, recipe])),
    )
  }

  return Object.values(producedRecipes).filter((recipe) => recipe.recipe.name !== EXTERNAL_RECIPE)
}

const getMissingDependencies = (
  pendingRecipes: RecipeNode[],
  producedRecipes: Record<string, RecipeNode>,
): Record<string, string[]> => {
  const data = useDataStore()
  const missingDependencies: Record<string, string[]> = {}

  pendingRecipes.forEach((recipe) => {
    const requiredIngredients = data.recipeIngredients(recipe.recipe.name)
    const availableItems = Object.keys(producedRecipes)
    const missingIngredients = requiredIngredients.filter(
      (ing) =>
        !availableItems.some((item) => item === ing.item) ||
        (producedRecipes[ing.item]?.availableProducts.find((p) => p.item === ing.item)?.amount ||
          0) <
          ing.amount - ZERO_THRESHOLD,
    )

    if (missingIngredients.length > 0) {
      missingDependencies[recipe.recipe.name] = missingIngredients.map((ing) => ing.item)
    }
  })

  return missingDependencies
}
