import type { Recipe } from '@/types/factory'
import type { RecipeIngredient, RecipeProduct } from '@/types/data'
import { ZERO_THRESHOLD, isNaturalResource } from './constants'

export interface RecipeLink {
  source: string
  sink: string
  material: string
  amount: number
}

export interface RecipeNode {
  recipe: Recipe
  batchNumber?: number
  ingredients: RecipeIngredient[]
  products: RecipeProduct[]
  availableProducts: RecipeProduct[]
  fullyConsumed: boolean

  // TODO: do we need these? maybe just a straight list of links is actually fine?
  // TODO: this is probably easier to test for though, and represent on the UI actually
  inputs: RecipeLink[]
  outputs: RecipeLink[]
}

/**
 * Generate a blank recipe node for the given recipe.
 */
export const newRecipeNode = (
  recipe: Recipe,
  ingredients: RecipeIngredient[],
  products: RecipeProduct[],
): RecipeNode => ({
  recipe,
  ingredients,
  products,
  availableProducts: [],
  fullyConsumed: false,
  inputs: [],
  outputs: [],
})

/**
 * Determine the PRODUCED quantity of a recipe's ingredient.
 * This is used to calculate the external amount needed as an input for the recipe to be sustainable.
 */
export const getCatalystQuantity = (ingredient: RecipeIngredient, recipe: RecipeNode) => {
  return recipe.products.find((prod) => prod.item === ingredient.item)?.amount || 0
}

/**
 * Marking a recipe as produced will:
 * - make its products available
 * - assign the batch number to the recipe
 * - assign the ingredient sources to the recipe
 */
export const produceRecipe = (recipe: RecipeNode, batchNumber: number, inputs: RecipeLink[]) => {
  recipe.availableProducts = recipe.products.map((product) => ({
    ...product,
    amount: product.amount * recipe.recipe.count,
  }))
  recipe.batchNumber = batchNumber
  // assign by reference here, so same object is used in both places
  // TODO: if this is restored from session storage, then the input/output will reference different objects
  recipe.inputs = inputs
}

/*
 * Decrement the available products of recipes used in the given links, then update their fullyConsumed status accordingly.
 */
export const decrementConsumedProducts = (
  recipesByName: Record<string, RecipeNode>,
  links: RecipeLink[],
) => {
  for (const link of links) {
    // Skip natural resource sources (they don't exist in recipesByName)
    if (isNaturalResource(link.source)) {
      continue
    }

    const sourceNode = recipesByName[link.source]
    if (!sourceNode) {
      throw new Error(`Source node not found: ${link.source} for material ${link.material}. Available recipes: ${Object.keys(recipesByName).join(', ')}`)
    }
    // add the output link, for a double-headed list structure approach
    sourceNode.outputs.push(link)
    const productIndex = sourceNode.availableProducts.findIndex((p) => p.item === link.material)
    if (productIndex >= 0) {
      sourceNode.availableProducts[productIndex].amount -= link.amount
    } else {
      // should never be able to make a link for something without the product, but here as a safeguard
      throw new Error(
        `Unable to find product ${link.material} in source ${link.source} - should never happen!`,
      )
    }

    sourceNode.fullyConsumed = sourceNode.availableProducts.every(
      (product) => product.amount <= ZERO_THRESHOLD,
    )
  }
}
