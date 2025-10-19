import { recipeDatabase } from '@/__tests__/fixtures/data/recipes'
import type { RecipeNode } from '@/logistics/graph-node'
import { newRecipeNode } from '@/logistics/graph-node'
import type { Factory, Floor, Material } from '@/types/factory'

/**
 * Creates a mock RecipeNode for testing
 *
 * @param recipeName - The recipe name
 * @param batchNumber - The batch number (floor index)
 * @param options - Configuration options
 * @param options.fromDatabase - If true, loads recipe data from fixtures database (includes real ingredients/products)
 * @param options.building - Building type (defaults to 'Desc_SmelterMk1_C' or from database)
 * @param options.count - Building count (defaults to 1)
 * @param options.expanded - Recipe expansion state (defaults to true)
 * @param options.built - Recipe built state (defaults to true)
 * @param options.fullyConsumed - Whether recipe is fully consumed (defaults to false)
 */
export const makeRecipeNode = (
  recipeName: string,
  batchNumber: number = 0,
  options: {
    fromDatabase?: boolean
    building?: string
    count?: number
    expanded?: boolean
    built?: boolean
    fullyConsumed?: boolean
  } = {},
): RecipeNode => {
  // If fromDatabase is true, create from recipe database
  if (options.fromDatabase) {
    const recipe = recipeDatabase[recipeName]
    if (!recipe) {
      throw new Error(`Recipe ${recipeName} not found in fixtures`)
    }

    const node = newRecipeNode(
      {
        name: recipe.name,
        building: options.building ?? recipe.producedIn[0] ?? 'Unknown',
        count: options.count ?? 1,
      },
      recipe.ingredients,
      recipe.products,
    )

    // Set batchNumber
    node.batchNumber = batchNumber

    // Populate outputs from products
    node.outputs = node.products.map((product) => ({
      source: node.recipe.name,
      sink: product.item,
      material: product.item,
      amount: product.amount,
    }))

    return node
  }

  // Otherwise, create simple mock
  return {
    recipe: {
      name: recipeName,
      building: options.building ?? 'Desc_SmelterMk1_C',
      count: options.count ?? 1,
    },
    ingredients: [],
    products: [],
    availableProducts: [],
    fullyConsumed: options.fullyConsumed ?? false,
    built: options.built ?? true,
    expanded: options.expanded ?? true,
    inputs: [],
    outputs: [],
    batchNumber,
  }
}

/**
 * Creates a mock Floor for testing
 * Supports both recipe names (strings) and recipe nodes
 */
export const makeFloor = (
  recipes: string[] | RecipeNode[] = [],
  options: {
    name?: string
    iconItem?: string
  } = {},
): Floor => ({
  name: options.name,
  iconItem: options.iconItem,
  recipes:
    recipes.length === 0 || typeof recipes[0] === 'string'
      ? (recipes as string[]).map((recipeName) => makeRecipeNode(recipeName))
      : (recipes as RecipeNode[]),
})

/**
 * Creates a mock Factory for testing
 */
export const makeFactory = (
  name: string,
  floors: Floor[],
  options: {
    icon?: string
    recipeLinks?: Record<string, boolean>
  } = {},
): Factory => ({
  name,
  icon: options.icon ?? 'test-icon',
  floors,
  recipeLinks: options.recipeLinks ?? {},
})

/**
 * Creates a mock Material for testing
 */
export const makeMaterial = (
  material: string,
  source: string,
  sink: string,
  amount: number = 60,
): Material => ({
  material,
  source,
  sink,
  amount,
})
