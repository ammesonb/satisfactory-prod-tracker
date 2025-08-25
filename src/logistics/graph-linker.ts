import type { RecipeIngredient } from '@/types/data'
import { isNaturalResource, ZERO_THRESHOLD } from './constants'
import type { RecipeNode } from './graph-node'
import { getCatalystQuantity } from './graph-node'
import type { Material } from '@/types/factory'

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
export const selectIngredientSources = (
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

/**
 * Identify which and what quantity is needed from available input sources to craft the recipe.
 * If any ingredient cannot be satisfied, returns an empty list immediately.
 */
export const getRecipeLinks = (
  recipe: RecipeNode,
  producedRecipes: Record<string, RecipeNode>,
): Material[] => {
  const links: Material[] = []
  for (const ingredient of recipe.ingredients) {
    // create a map from recipe name -> available product matching ingredient
    const recipeAmounts = Object.fromEntries(
      Object.entries(producedRecipes)
        .map(([recipeName, recipe]) => {
          const product = recipe.availableProducts.find((prod) => prod.item === ingredient.item)
          return [recipeName, product?.amount ?? 0]
        })
        .filter(([, amount]) => Number(amount) > 0),
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

    // if the catalyst fully satisfies the amount required, continue to next ingredient
    if (ingredient.amount <= catalystQuantity + ZERO_THRESHOLD) {
      continue
    }

    // Sometimes a catalyst might produce more than it consumes, so in that case mark amount needed as none
    let amountNeeded = Math.max(0, (ingredient.amount - catalystQuantity) * recipe.recipe.count)

    const ingredientSources = selectIngredientSources(ingredient, amountNeeded, recipeAmounts)

    // If no sources, can't product this yet so no links
    // this also overrides the current links list, since any missing ingredient breaks the recipe
    if (ingredientSources.length === 0) {
      return []
    }

    // identify how much to use from each source
    for (const source of ingredientSources) {
      // if consuming from a natural resource, use rest of needed
      const amountUsed = isNaturalResource(source)
        ? amountNeeded
        : Math.min(amountNeeded, recipeAmounts[source])
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
 * Similar to getRecipeLinks, but checks each group of circular recipes.
 * If a recipe can be produced as long as the other codependent recipe is ALSO produced,
 * then we can add both to the current batch.
 *
 * Returns a map of recipe name to its required links for circular recipes that can be produced.
 */
export const getLinksForCircularRecipes = (
  circularRecipeGroups: RecipeNode[][],
  producedRecipes: Record<string, RecipeNode>,
): Map<string, Material[]> => {
  const recipeLinksMap = new Map<string, Material[]>()
  // track newly-added recipes, so we only do each once
  const processedRecipes = new Set<string>()

  // Filter out single-recipe groups (catalyst recipes) - these should be handled by normal processing
  const multiRecipeGroups = circularRecipeGroups.filter((group) => group.length > 1)

  // For each group of dependent recipes, see if we can produce all of them.
  for (const recipeGroup of multiRecipeGroups) {
    // Skip if any recipe in this group is already processed
    if (recipeGroup.some((recipe) => processedRecipes.has(recipe.recipe.name))) {
      continue
    }

    // Create temporary extended produced recipes that includes other recipes in the group
    const extendedProducedRecipes = { ...producedRecipes }
    for (const recipe of recipeGroup) {
      extendedProducedRecipes[recipe.recipe.name] = recipe
    }

    // track needed input links by the name of the recipe
    const groupRecipeLinks = new Map<string, Material[]>()
    let canProduce = true

    for (const recipe of recipeGroup) {
      // if we've already produced this recipe, continue to next in group
      if (processedRecipes.has(recipe.recipe.name)) {
        continue
      }

      const recipeLinks = getRecipeLinks(recipe, extendedProducedRecipes)
      if (recipeLinks.length === 0) {
        canProduce = false
        break
      }
      groupRecipeLinks.set(recipe.recipe.name, recipeLinks)
    }

    if (canProduce) {
      // merge the links maps based on the recipe name
      for (const [recipeName, links] of groupRecipeLinks) {
        recipeLinksMap.set(recipeName, links)
      }
      // update the processed set with all the newly-available recipes
      recipeGroup.forEach((recipe) => processedRecipes.add(recipe.recipe.name))
    }
  }

  return recipeLinksMap
}
