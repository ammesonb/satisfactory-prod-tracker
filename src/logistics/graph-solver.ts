import { useDataStore } from '@/stores/data'
import { parseRecipeString } from '@/logistics/recipe-parser'
import { findCircularRecipes } from '@/logistics/dependency-resolver'
import {
  newRecipeNode,
  produceRecipe,
  decrementConsumedProducts,
  type RecipeNode,
} from '@/logistics/graph-node'
import { getRecipeLinks } from '@/logistics/graph-linker'

// Identify circular recipes and return groupings of codependent recipes
const groupCircularRecipes = (recipes: RecipeNode[]): RecipeNode[][] => {
  const circularRecipes = findCircularRecipes(recipes.map((r) => r.recipe))
  const data = useDataStore()

  // Pre-filter to only circular recipe nodes
  const circularNodes = recipes.filter((recipe) =>
    circularRecipes.some((cr) => cr.name === recipe.recipe.name),
  )

  if (circularNodes.length === 0) return []

  // Build adjacency map once
  const adjacencyMap = new Map<string, Set<string>>()
  const nodeMap = new Map<string, RecipeNode>()

  for (const node of circularNodes) {
    adjacencyMap.set(node.recipe.name, new Set())
    nodeMap.set(node.recipe.name, node)
  }

  // Pre-compute all ingredient/product sets
  const recipeData = new Map<string, { ingredients: Set<string>; products: Set<string> }>()
  for (const node of circularNodes) {
    const ingredients = new Set(data.recipeIngredients(node.recipe.name).map((ing) => ing.item))
    const products = new Set(data.recipeProducts(node.recipe.name).map((prod) => prod.item))
    recipeData.set(node.recipe.name, { ingredients, products })
  }

  // Build connections efficiently
  for (const node1 of circularNodes) {
    const data1 = recipeData.get(node1.recipe.name)!

    for (const node2 of circularNodes) {
      if (node1 === node2) continue

      const data2 = recipeData.get(node2.recipe.name)!

      // Check if node1 needs something from node2 OR node2 needs something from node1
      const hasConnection =
        [...data1.ingredients].some((item) => data2.products.has(item)) ||
        [...data2.ingredients].some((item) => data1.products.has(item))

      if (hasConnection) {
        adjacencyMap.get(node1.recipe.name)!.add(node2.recipe.name)
      }
    }
  }

  // Find connected components using DFS
  const visited = new Set<string>()
  const groups: RecipeNode[][] = []

  const dfs = (recipeName: string, group: RecipeNode[]) => {
    if (visited.has(recipeName)) return

    visited.add(recipeName)
    group.push(nodeMap.get(recipeName)!)

    for (const neighbor of adjacencyMap.get(recipeName)!) {
      dfs(neighbor, group)
    }
  }

  for (const node of circularNodes) {
    if (!visited.has(node.recipe.name)) {
      const group: RecipeNode[] = []
      dfs(node.recipe.name, group)
      groups.push(group)
    }
  }

  return groups
}

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
  const circularRecipeGroups = groupCircularRecipes(pendingRecipes)
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
      // TODO: check circular/codependent recipes here first

      console.warn(
        `Unable to process ${pendingRecipes.length} remaining recipes due to missing dependencies:`,
      )
      pendingRecipes.forEach((recipe) => {
        const requiredIngredients = data.recipeIngredients(recipe.recipe.name)
        const availableItems = Object.keys(producedRecipes)
        const missingIngredients = requiredIngredients.filter(
          (ing) =>
            !availableItems.some((item) => item === ing.item) ||
            (producedRecipes[ing.item]?.availableProducts.find((p) => p.item === ing.item)
              ?.amount || 0) < ing.amount,
        )
        console.warn(
          `  ${recipe.recipe.name}: missing ${missingIngredients.map((ing) => `${ing.item} (need ${ing.amount})`).join(', ')}`,
        )
      })
      break
    }

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
