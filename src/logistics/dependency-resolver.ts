import type { RecipeNode } from '@/logistics/graph-node'
import { useDataStore } from '@/stores/data'
import type { Recipe } from '@/types/factory'

export const findCircularRecipes = (recipes: Recipe[]): Recipe[] => {
  const data = useDataStore()

  return recipes.filter((recipe) => {
    const ingredients = data.recipeIngredients(recipe.name)
    const products = data.recipeProducts(recipe.name)

    // Check if this recipe has a true circular dependency:
    // 1. It consumes an item that it also produces (catalyst recipe), OR
    // 2. It's part of a mutual dependency cycle with other remaining recipes
    return (
      // Self-referential (catalyst)
      ingredients.some((ingredient) =>
        products.some((product) => product.item === ingredient.item),
      ) ||
      // Mutual dependency: this recipe needs something from another recipe that needs something from this recipe
      recipes.some((otherRecipe) => {
        if (otherRecipe === recipe) return false
        const otherIngredients = data.recipeIngredients(otherRecipe.name)
        const otherProducts = data.recipeProducts(otherRecipe.name)

        // Check if there's a cycle: A needs B's product AND B needs A's product
        const thisNeedsOther = ingredients.some((ingredient) =>
          otherProducts.some((product) => product.item === ingredient.item),
        )
        const otherNeedsThis = otherIngredients.some((ingredient) =>
          products.some((product) => product.item === ingredient.item),
        )

        return thisNeedsOther && otherNeedsThis
      })
    )
  })
}

// Identify circular recipes and return groupings of codependent recipes
export const groupCircularRecipes = (recipes: RecipeNode[]): RecipeNode[][] => {
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

// When recipes are produced, we will need to remove them from the circular dependencies batches
// since their products should now be avialable normally.
export const removeRecipesFromGroups = (groupedRecipes: RecipeNode[][], recipes: RecipeNode[]) => {
  for (const recipe of recipes) {
    for (let i = 0; i < groupedRecipes.length; i++) {
      groupedRecipes[i] = groupedRecipes[i].filter((r) => r.recipe.name !== recipe.recipe.name)
    }
  }

  // can't be a circular dependency with only one recipe, that should just be accessible now
  groupedRecipes = groupedRecipes.filter((group) => group.length > 1)
}
