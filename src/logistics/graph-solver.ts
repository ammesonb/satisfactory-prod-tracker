import { useDataStore } from '@/stores/data'
import { parseRecipeString } from './recipe-parser'
import { newRecipeNode, type RecipeNode } from '@/logistics/graph-node'
import { getRecipeLinks } from '@/logistics/graph-linker'

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
export const solveRecipeChain = (rawRecipes: string[]): RecipeNode[] => {
  const data = useDataStore()

  let pendingRecipes = rawRecipes
    .map(parseRecipeString)
    .map((recipe) =>
      newRecipeNode(recipe, data.recipeIngredients(recipe.name), data.recipeProducts(recipe.name)),
    )
  const producedRecipes: Record<string, RecipeNode> = {}

  let batch = -1
  while (pendingRecipes.length > 0) {
    batch++
    const batchRecipes: RecipeNode[] = []

    for (const recipe of pendingRecipes) {
      const links = getRecipeLinks(recipe, producedRecipes)
      if (links.length === 0) {
        continue
      }

      produceRecipe(recipe, batch, links)
      decrementConsumedProducts(producedRecipes, links)
      batchRecipes.push(recipe)
    }

    // Handle infinite loop if no recipes can be processed
    if (batchRecipes.length === 0) {
      console.warn(
        'Unable to process remaining recipes due to missing dependencies:',
        pendingRecipes.map((r) => r.recipe.name),
      )
      break
    }

    // TODO: handle codependencies if no batch recipes processed
    // TODO: this will be done by seeing if another recipe being processed satisfies this node, IFF this node satisfies that node too

    pendingRecipes = pendingRecipes.filter((recipe) => !batchRecipes.includes(recipe))
    // wait to add recipes to produced until AFTER batch, to get proper tiering/sorting
    Object.assign(
      producedRecipes,
      Object.fromEntries(batchRecipes.map((recipe) => [recipe.recipe.name, recipe])),
    )
  }

  // TODO: is this the correct thing to return here?
  return Object.values(producedRecipes)
}
