import type { Material, Recipe } from '@/types/factory'
import type { RecipeIngredient, RecipeProduct } from '@/types/data'
import { ZERO_THRESHOLD, isNaturalResource } from './constants'
import { SourceNodeNotFoundError, ProductNotFoundError } from '@/errors/processing-errors'

export interface RecipeNode {
  recipe: Recipe
  batchNumber?: number
  ingredients: RecipeIngredient[]
  products: RecipeProduct[]
  availableProducts: RecipeProduct[]
  fullyConsumed: boolean

  // TODO: do we need these? maybe just a straight list of links is actually fine?
  // TODO: this is probably easier to test for though, and represent on the UI actually
  inputs: Material[]
  outputs: Material[]
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
export const produceRecipe = (recipe: RecipeNode, batchNumber: number, inputs: Material[]) => {
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
  producedRecipesByName: Record<string, RecipeNode>,
  links: Material[],
  batchRecipes?: RecipeNode[],
) => {
  for (const link of links) {
    // Skip natural resource sources (they don't exist in recipesByName)
    if (isNaturalResource(link.source)) {
      continue
    }

    let sourceNode: RecipeNode | undefined
    if (link.source in producedRecipesByName) {
      // try to find in standard production first
      sourceNode = producedRecipesByName[link.source]
    } else if (batchRecipes) {
      // if missing, e.g. for catalyst/codependent recipes, check the batch for a source
      sourceNode = batchRecipes.find((r) => r.recipe.name === link.source)
    }

    if (!sourceNode) {
      const availableRecipes = [
        ...Object.keys(producedRecipesByName),
        ...(batchRecipes?.map((r) => r.recipe.name) || []),
      ]
      throw new SourceNodeNotFoundError(link.source, link.material, availableRecipes)
    }

    // add the output link, for a double-headed list structure approach
    sourceNode.outputs.push(link)
    const productIndex = sourceNode.availableProducts.findIndex((p) => p.item === link.material)
    if (productIndex >= 0) {
      const remainder = sourceNode.availableProducts[productIndex].amount - link.amount
      sourceNode.availableProducts[productIndex].amount = remainder < ZERO_THRESHOLD ? 0 : remainder
    } else {
      // should never be able to make a link for something without the product, but here as a safeguard
      throw new ProductNotFoundError(link.material, link.source)
    }

    sourceNode.fullyConsumed = sourceNode.availableProducts.every(
      (product) => product.amount <= ZERO_THRESHOLD,
    )
  }
}
