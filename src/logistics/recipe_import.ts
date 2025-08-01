import { useDataStore } from '@/stores/data'
import type { RecipeIngredient } from '@/types/data'
import type { Recipe, Material as RecipeLink } from '@/types/factory'

const ZERO_THRESHOLD = 0.1

const NATURAL_RESOURCES = [
  'Desc_OreBauxite_C',
  'Desc_OreCoal_C',
  'Desc_OreCopper_C',
  'Desc_OreGold_C',
  'Desc_OreIron_C',
  'Desc_OreSAM_C',
  'Desc_OreSulfur_C',
  'Desc_OreUranium_C',
  'Desc_RawQuartz_C',
  'Desc_Stone_C',
  'Desc_LiquidOil_C',
  'Desc_NitrogenGas_C',
  'Desc_Water_C',
]

export const isNaturalResource = (item: string): boolean => {
  return NATURAL_RESOURCES.includes(item)
}

export const stringToRecipe = (recipeString: string): Recipe => {
  recipeString = recipeString.replace(/"/g, '')
  const amount = Number(recipeString.split(': ')[1].trim())
  const [recipeName, buildingName] = recipeString.split('#', 2)
  return {
    name: recipeName.split('@')[0].trim(),
    building: buildingName.split(':')[0].trim(),
    count: amount,
  }
}

interface RecipeItem {
  amount: number
  recipe: Recipe
  isResource?: boolean
}

/**
 * Selects a list of sources to fulfill a given ingredient request.
 *
 * This function attempts to find the most suitable sources to fulfill the required
 * amount of an ingredient, preferring sources with smaller quantities to preserve
 * larger quantities for future requests. It allows for a small threshold error in
 * decimal calculations. If the request cannot be fully satisfied by any combination
 * of sources, it returns an empty array unless the request is for a natural resource,
 * in which case partial fulfillment is allowed.
 *
 * @param request - The requested ingredient with its required amount.
 * @param sources - An array of available sources with their respective amounts.
 * @returns An array of sources that collectively fulfill the request, or an empty
 * array if the request cannot be fulfilled.
 */
export const pickSource = (request: RecipeIngredient, sources: RecipeItem[]): RecipeItem[] => {
  if (sources.length === 0) {
    return []
  }

  const sufficientSources = sources
    // allow for small amount of error in decimal calculations
    .filter((source) => source.amount + ZERO_THRESHOLD >= request.amount)
    // closest match first, to leave largest available for later requests
    .sort((a, b) => a.amount - b.amount)

  if (sufficientSources.length > 0) {
    return [sufficientSources[0]]
  }

  let quantity = request.amount
  // consume smallest amounts first, to leave as much as possible for later consumers
  sources = sources.sort((a, b) => a.amount - b.amount)
  const usedSources: RecipeItem[] = []
  let sourceIndex = 0
  while (quantity > ZERO_THRESHOLD && sourceIndex < sources.length) {
    const source = sources[sourceIndex]
    quantity -= source.amount
    usedSources.push(source)
    sourceIndex++
  }

  // okay to have a remainder for natural resources
  if (quantity > ZERO_THRESHOLD && !isNaturalResource(request.item)) {
    return []
  }

  return usedSources
}

export const getAllRecipeMaterials = (
  recipes: Recipe[],
): { ingredients: Record<string, RecipeItem[]>; products: Record<string, RecipeItem[]> } => {
  const data = useDataStore()
  return {
    // summarize a list of all ingredients and products needed for
    // all of the recipes, into one comprehensive map
    ingredients: recipes.reduce(
      (acc, recipe) => {
        data.recipeIngredients(recipe.name).forEach((ingredient) => {
          acc[ingredient.item] = [
            ...(acc[ingredient.item] || []),
            { amount: ingredient.amount, recipe, isResource: isNaturalResource(ingredient.item) },
          ]
        })
        return acc
      },
      {} as Record<string, RecipeItem[]>,
    ),
    products: recipes.reduce(
      (acc, recipe) => {
        data.recipeProducts(recipe.name).forEach((product) => {
          acc[product.item] = [
            ...(acc[product.item] || []),
            {
              amount: recipe.count * product.amount,
              recipe,
              isResource: isNaturalResource(product.item),
            },
          ]
        })
        return acc
      },
      {} as Record<string, RecipeItem[]>,
    ),
  }
}

/**
 * Groups recipes into batches based on their production requirements.
 *
 * This function groups recipes into batches based on the items required to produce them.
 * It first removes any "mined" resources from the list of recipes, as they do not require
 * a recipe. Then, it groups the remaining recipes into batches, where each batch contains
 * recipes that can be produced using the same items. The recipes are grouped in the order
 * of production, with simpler items produced first, followed by more complex items.
 *
 * @param recipes - An array of recipes to be grouped into batches.
 * @returns An array of recipe batches, where each batch is an array of recipes.
 */
export const batchRecipes = (recipes: Recipe[]): Recipe[][] => {
  // group recipes by items required to produce
  // e.g. ingots first, then simple items second, complex items afterwards
  const batches: Recipe[][] = []
  const data = useDataStore()

  // Any "mined" resource does not need a recipe, so leave those out
  let remainingRecipes = recipes.filter((recipe) => recipe.building !== 'Mine')
  const producedItems = [...NATURAL_RESOURCES]

  let lastLength = 0
  while (remainingRecipes.length > 0) {
    if (lastLength === remainingRecipes.length) {
      throw new Error(
        'Batching recipes failed, missing ingredients for ' + remainingRecipes.join(', '),
      )
    }
    lastLength = remainingRecipes.length

    const batch: Recipe[] = []
    const newlyProducedItems: string[] = []
    // for each recipe not yet produced
    for (const recipe of remainingRecipes) {
      // see if all ingredients are currently available
      const ingredients = data.recipeIngredients(recipe.name)
      if (
        ingredients.reduce(
          (acc, ingredient) => acc && producedItems.includes(ingredient.item),
          true,
        )
      ) {
        // if they are, add the recipe to this production batch and track the current products available
        batch.push(recipe)
        newlyProducedItems.push(...data.recipeProducts(recipe.name).map((product) => product.item))
      }
    }
    // remove recipes we are now producing, and mark their products as available
    remainingRecipes = remainingRecipes.filter((recipe) => !batch.includes(recipe))
    producedItems.push(...newlyProducedItems)
    batches.push(batch)
  }

  return batches
}

/**
 * Generates links for a given recipe based on its ingredients and products.
 *
 * This function generates links for a given recipe by first retrieving the ingredients
 * and products for the recipe. It then iterates through the ingredients, attempting to
 * find sources for each ingredient using the pickSource function. If a source is found,
 * a material link is created and added to the list of material links. If no source is
 * found, the ingredient is added to the list of recipes missing ingredients.
 * Natural resources will be added from a raw natural source instead of being considered missing.
 *
 * @param recipe - The recipe for which to generate links.
 * @param alreadyProduced - A record of already produced items and their sources.
 * @returns An object containing the generated material links and recipes missing ingredients.
 */
export const getLinksForRecipe = (
  recipe: Recipe,
  alreadyProduced: Record<string, RecipeItem[]>,
): RecipeLink[] => {
  const data = useDataStore()
  const ingredients = data.recipeIngredients(recipe.name)
  const products = data.recipeProducts(recipe.name)

  const materialLinks: RecipeLink[] = []

  for (const ingredient of ingredients) {
    // For catalyst/recursive recipes, always use your own output as an input if possible
    // The production planner tool should cover the amount needed to bootstrap the catalyst
    let amount_needed = ingredient.amount * recipe.count
    const matchingProduct = products.find((product) => product.item === ingredient.item)
    if (matchingProduct) {
      const amount_consumed = Math.min(amount_needed, matchingProduct.amount)
      materialLinks.push({
        source: recipe.name,
        sink: recipe.name,
        name: ingredient.item,
        amount: amount_consumed,
      })
      amount_needed -= amount_consumed
      matchingProduct.amount -= amount_consumed
    }

    // rarely, that is enough to cover all the resource you need
    // (though technically it would need some to jump-start it)
    if (amount_needed <= ZERO_THRESHOLD) {
      continue
    }

    // check if we do not produce this item
    if (!alreadyProduced[ingredient.item] || alreadyProduced[ingredient.item].length === 0) {
      // natural resource can be mined, otherwise it's just missing (hopefully for now)
      if (isNaturalResource(ingredient.item)) {
        materialLinks.push({
          source: ingredient.item,
          sink: recipe.name,
          name: ingredient.item,
          amount: amount_needed,
        })
      } else {
        return []
      }
      continue
    } else if (
      amount_needed >
        alreadyProduced[ingredient.item].reduce((acc, item) => acc + item.amount, 0) &&
      !isNaturalResource(ingredient.item)
    ) {
      // If we do not have enough of this ingredient, mark the full quantity as missing to ensure:
      // 1. We do not try to use products that cannot be fully produced
      // 2. We do not use up resources other recipes might need
      //
      // NOTE: if two recipes are co-dependent, this may result in the whole loop failing
      // however, this seems improbable as such a recipe likely would lead to infinite resource production
      // e.g. catalyst with net-positive gain:
      // put in 10 plastic, gain 20 rubber, take 10 rubber, gain 20 plastic - infinite plastic/rubber for no additional cost
      //
      // plus, satisfactory tools usually covers the bootstrap amount from an external source anyways which due to the tiering
      // of the batching function, should be included first regardless.
      //
      // Natural resources will always be available in the wild, so do not mark them as missing

      return []
    }

    // Otherwise, try to find enough from current production
    const sources = pickSource(
      { amount: amount_needed, item: ingredient.item },
      alreadyProduced[ingredient.item],
    )

    for (const source of sources) {
      const amount = Math.min(source.amount, amount_needed)
      materialLinks.push({
        source: source.recipe.name,
        sink: recipe.name,
        name: ingredient.item,
        amount,
      })
      amount_needed -= amount
      source.amount -= amount
      // should only happen on last source
      if (amount_needed <= ZERO_THRESHOLD) {
        break
      }
    }

    // if we still need more and it is a natural resource, mine it
    if (amount_needed > ZERO_THRESHOLD && isNaturalResource(ingredient.item)) {
      materialLinks.push({
        source: ingredient.item,
        sink: recipe.name,
        name: ingredient.item,
        amount: amount_needed,
      })
    }
  }

  return materialLinks
}

export const linkRecipes = (
  rawRecipes: string[],
): {
  recipeBatches: Recipe[][]
  recipeLinks: RecipeLink[]
} => {
  const recipes = rawRecipes.map(stringToRecipe)
  const batches = batchRecipes(recipes)

  const producedItems: Record<string, RecipeItem[]> = {}
  const groupedRecipes: Recipe[][] = []
  let batchIdx = 0
  const recipeLinks: RecipeLink[] = []
  // for each batch of recipes we can produce, create a "floor" mapping them to the materials they need
  while (batchIdx < batches.length) {
    // add a new floor of reipces
    groupedRecipes.push([])
    for (const recipe of batches[batchIdx]) {
      // try to find links for each of the ingredients the recipe needs
      const links = getLinksForRecipe(recipe, producedItems)
      recipeLinks.push(...links)

      // if ingredients not produced right now, check at END of next batch to see if the missing products are now available
      if (links.length === 0) {
        // if no more batches after this one, then we will never be able to produce this recipe
        // NOTE: since batching should have handled dependencies, if we need a product from this batch as an ingredient,
        // this recipe should then have been pushed to a new batch of its own
        if (batchIdx + 1 >= batches.length) {
          throw new Error('Not enough resources to produce ' + recipe.name)
        }
        batches[batchIdx + 1].push(recipe)
      } else {
        // Otherwise, we produced this recipe successfully so add it to this floor
        groupedRecipes[batchIdx].push(recipe)
      }
    }

    // filter out any sources that have been fully consumed
    Object.entries(producedItems).forEach(([item, sources]) => {
      producedItems[item] = sources.filter((source) => source.amount >= ZERO_THRESHOLD)
    })
    // next floor
    batchIdx++
  }

  return { recipeBatches: groupedRecipes, recipeLinks }
}

// prompt for whole factory link:
/*
Please generate a reasonable number of tests for getLinksForRecipe. This should be a set of something like: simple production chain, more complex
production chain, production chain with some natural resources, production chain with natural resources (some of which are byproducts from earlier
recipes), a case where there is not sufficient quantity produced, another case where sufficient quantity might be produced by another recipe, another
where the recipe has a catalyst (same ingredient output, but lower quantity), and a catalyst where the ingredient output matches its input requirement.
*/

// TODO: display checkboxes for linked materials (inputs + outputs) and buildings like
// input 1 -----            ----- output 1
// input 2 ----- building 1 ----- output 2
// input 3 -----            -----

// such that a building will only be hidden if all the inputs, itself, and outputs are checked off
// if an output from say, iron -> iron rod is checked, the INPUT for iron rod should also be checked

// still want to show building name, count, etc as well as the amounts and percentages for inputs and outputs

// TODO: anchor-based hyperlink for inputs and outputs
