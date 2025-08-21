import { useDataStore } from '@/stores/data'
import { parseRecipeString } from './recipe-parser'
import type { Recipe } from '@/types/factory'
import type { RecipeIngredient, RecipeProduct } from '@/types/data'
import { isNaturalResource, ZERO_THRESHOLD } from './constants'

interface RecipeLink {
  source: string
  sink: string
  material: string
  amount: number
}

interface RecipeNode {
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
const newRecipeNode = (
  recipe: Recipe,
  ingredients: RecipeIngredient[],
  products: RecipeProduct[],
): RecipeNode => ({
  recipe,
  ingredients,
  products,
  // fully duplicate products since available products needs to be modified
  availableProducts: products.map((product) => ({ ...product })),
  fullyConsumed: false,
  inputs: [],
  outputs: [],
})

/**
 * Determine the PRODUCED quantity of a recipe's ingredient.
 * This is used to calculate the external amount needed as an input for the recipe to be sustainable.
 */
const getCatalystQuantity = (ingredient: RecipeIngredient, recipe: RecipeNode) => {
  return recipe.products.find((prod) => prod.item === ingredient.item)?.amount || 0
}

/**
 * Identify which and what quantity is needed from available input sources to craft the recipe.
 * If any ingredient cannot be satisfied, returns an empty list immediately.
 */
const getRecipeLinks = (
  recipe: RecipeNode,
  producedRecipes: Record<string, RecipeNode>,
): RecipeLink[] => {
  const links: RecipeLink[] = []
  for (const ingredient of recipe.ingredients) {
    // create a map from recipe name -> available product matching ingredient
    const recipeAmounts = Object.fromEntries(
      Object.entries(producedRecipes)
        .map(([recipeName, recipe]) => {
          const product = recipe.availableProducts.find((prod) => prod.item === ingredient.item)
          return [recipeName, product?.amount ?? 0]
        })
        .filter(([, amount]) => amount > 0),
    )
    const catalystQuantity = getCatalystQuantity(ingredient, recipe)
    // if catalyst found, add link to self
    if (catalystQuantity > 0) {
      links.push({
        source: recipe.recipe.name,
        sink: recipe.recipe.name,
        material: ingredient.item,
        amount: catalystQuantity,
      })
    }

    // Sometimes a catalyst might produce more than it consumes, so in that case mark amount needed as none
    let amountNeeded = Math.max(0, (ingredient.amount - catalystQuantity) * recipe.recipe.count)
    const ingredientSources = selectIngredientSources(ingredient, amountNeeded, recipeAmounts)

    // If no sources, can't product this yet so no links
    // this also overrides the current links list, since any missing ingredient breaks the recipe
    if (ingredientSources.length === 0) {
      return []
    }

    for (const source of ingredientSources) {
      const amountUsed = Math.min(amountNeeded, recipeAmounts[source])
      links.push({
        source,
        sink: recipe.recipe.name,
        material: ingredient.item,
        amount: amountUsed,
      })
      amountNeeded -= amountUsed
      if (amountNeeded <= ZERO_THRESHOLD) {
        break
      }
    }
  }

  return links
}

/**
 * Select an optimal set of input sources for a required amount of an ingredient.
 *
 * Prefers to consume:
 * - crafted sources over natural
 * - closest single-source that can fully satisfy the required amount
 * - smallest quantity outputs when multiple sources are needed, to leave largest products for later consumers
 *     - The idea is this way other recipes may only need a single source, if this one already requires multiple.
 *       So this source eats up all the bits and pieces, and other recipes are more likely to get a single, clean source.
 *
 * If insufficient quantity is available, returns an empty list.
 * Natural resources are allowed to have a remainder, which will be filled from an infinite "mined" source.
 */
const selectIngredientSources = (
  ingredient: RecipeIngredient,
  amountNeeded: number,
  availableSources: Record<string, number>,
): string[] => {
  if (amountNeeded <= ZERO_THRESHOLD) {
    return []
  }
  // if resource is produced and total sources is not enough,
  // then it's not possible to produce this recipe so return empty list
  if (
    !isNaturalResource(ingredient.item) &&
    Object.values(availableSources).reduce((a, b) => a + b, 0) < amountNeeded - ZERO_THRESHOLD
  ) {
    return []
  }

  const sortedSources = Object.entries(availableSources).sort((a, b) => a[1] - b[1])

  // return the smallest source that can satisfy the amount needed
  // this leaves larger sources available for other recipes that require more
  for (const source of sortedSources) {
    if (source[1] >= amountNeeded - ZERO_THRESHOLD) {
      return [source[0]]
    }
  }

  // otherwise, consume from _smallest_ first, to leave single large sources available for other recipes
  const usedSources = []
  for (const source of Object.entries(availableSources).sort((a, b) => a[1] - b[1])) {
    usedSources.push(source[0])
    amountNeeded -= source[1]
    if (amountNeeded <= ZERO_THRESHOLD) {
      break
    }
  }

  // if crafted sources for natural ingredient is insufficient, add a natural resource source to the list
  if (amountNeeded > ZERO_THRESHOLD && isNaturalResource(ingredient.item)) {
    usedSources.push(ingredient.item)
  }

  return usedSources
}

const produceRecipe = (recipe: RecipeNode, batchNumber: number, inputs: RecipeLink[]) => {
  recipe.availableProducts = recipe.products.map((product) => ({ ...product }))
  recipe.batchNumber = batchNumber
  // assign by reference here, so same object is used in both places
  // TODO: if this is restored from session storage, then the input/output will reference different objects
  recipe.inputs = inputs
}

/*
 * Decrement the available products of recipes used in the given links, then update their fullyConsumed status accordingly.
 */
const decrementConsumedProducts = (
  recipesByName: Record<string, RecipeNode>,
  links: RecipeLink[],
) => {
  for (const link of links) {
    const sourceNode = recipesByName[link.source]
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
