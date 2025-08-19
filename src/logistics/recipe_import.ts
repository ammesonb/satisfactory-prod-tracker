import { useDataStore } from '@/stores/data'
import type { RecipeIngredient } from '@/types/data'
import type { Recipe, Material } from '@/types/factory'

const ZERO_THRESHOLD = 0.05

const NATURAL_RESOURCES = [
  'Desc_OreBauxite_C',
  'Desc_Coal_C',
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

/**
 * Detects circular dependencies among a set of recipes.
 * A circular dependency exists when:
 * 1. A recipe consumes an item that it also produces (catalyst recipe), OR
 * 2. Recipes are part of a mutual dependency cycle
 */
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

/**
 * Resolves circular dependencies by creating links between codependent recipes.
 * This allows circular recipes to reference each other's outputs as inputs.
 *
 * @param circularRecipes - Array of recipes with circular dependencies
 * @returns Array of links that connect the circular recipes
 */
export const resolveCircularDependencies = (circularRecipes: Recipe[]): Material[] => {
  const data = useDataStore()
  const circularLinks: Material[] = []

  // Create copies of recipe data that we can modify
  const modifiedRecipeData = new Map<
    string,
    {
      ingredients: RecipeIngredient[]
      products: RecipeIngredient[]
    }
  >()

  // Initialize with copies of original data
  circularRecipes.forEach((recipe) => {
    modifiedRecipeData.set(recipe.name, {
      ingredients: data.recipeIngredients(recipe.name).map((ing) => ({ ...ing })),
      products: data.recipeProducts(recipe.name).map((prod) => ({ ...prod })),
    })
  })

  // Find circular links and modify recipe data
  for (const recipe of circularRecipes) {
    const recipeData = modifiedRecipeData.get(recipe.name)!

    for (const ingredient of recipeData.ingredients) {
      // Check for self-referential catalyst first
      const selfProduct = recipeData.products.find((p) => p.item === ingredient.item)
      if (selfProduct) {
        const neededAmount = ingredient.amount * recipe.count
        const availableAmount = selfProduct.amount * recipe.count
        const linkAmount = Math.min(neededAmount, availableAmount)

        if (linkAmount > 0) {
          // Create the self-referential link
          circularLinks.push({
            source: recipe.name,
            sink: recipe.name,
            name: ingredient.item,
            amount: linkAmount,
          })

          // Reduce both ingredient requirement and product output
          ingredient.amount -= linkAmount / recipe.count
          selfProduct.amount -= linkAmount / recipe.count
        }
      }

      // Then check for dependencies between different recipes
      for (const otherRecipe of circularRecipes) {
        if (otherRecipe === recipe) continue

        const otherRecipeData = modifiedRecipeData.get(otherRecipe.name)!
        const matchingProduct = otherRecipeData.products.find((p) => p.item === ingredient.item)

        if (matchingProduct) {
          const neededAmount = ingredient.amount * recipe.count
          const availableAmount = matchingProduct.amount * otherRecipe.count
          const linkAmount = Math.min(neededAmount, availableAmount)

          if (linkAmount > 0) {
            // Create the circular link
            circularLinks.push({
              source: otherRecipe.name,
              sink: recipe.name,
              name: ingredient.item,
              amount: linkAmount,
            })

            // Reduce ingredient requirement for consuming recipe
            ingredient.amount -= linkAmount / recipe.count

            // Reduce product output for producing recipe
            matchingProduct.amount -= linkAmount / otherRecipe.count
          }
        }
      }
    }
  }

  return circularLinks
}

/**
 * Handles catalyst/self-referential ingredient processing for a recipe.
 * Returns the amount still needed after self-production is accounted for.
 */
export const linkCatalystIngredient = (
  ingredient: RecipeIngredient,
  recipe: Recipe,
  products: RecipeIngredient[],
  materialLinks: Material[],
): number => {
  let amount_needed = ingredient.amount * recipe.count
  const matchingProduct = products.find((product) => product.item === ingredient.item)

  if (matchingProduct) {
    // when dealing with catalyst recipes, check recipe amounts rather than totals
    // this way we can see how much in total of the catalyst we can recover from the outputs
    const amount_consumed = Math.min(ingredient.amount, matchingProduct.amount)
    const total_consumed = amount_consumed * recipe.count
    materialLinks.push({
      source: recipe.name,
      sink: recipe.name,
      name: ingredient.item,
      amount: total_consumed,
    })
    // amount remaining will be multiplied by the recipe count required,
    // but the product's amount will be per each craft cycle
    amount_needed -= total_consumed
    // product amount is per instance not totals
    matchingProduct.amount -= amount_consumed
  }

  return amount_needed
}

/**
 * Handles external ingredient sourcing (from other recipes or natural resources).
 * Returns null if the ingredient cannot be satisfied, or the material links if successful.
 */
export const processExternalIngredient = (
  ingredient: RecipeIngredient,
  recipe: Recipe,
  amount_needed: number,
  alreadyProduced: Record<string, RecipeItem[]>,
  usedSources: [RecipeItem, number][],
  availableCircularLinks: Material[] = [],
): Material[] | null => {
  const materialLinks: Material[] = []

  // First, check for available circular links for this specific recipe and ingredient
  const usableCircularLinks = availableCircularLinks.filter(
    (link) => link.sink === recipe.name && link.name === ingredient.item,
  )

  for (const circularLink of usableCircularLinks) {
    const linkAmount = Math.min(circularLink.amount, amount_needed)
    if (linkAmount > 0) {
      materialLinks.push({
        source: circularLink.source,
        sink: recipe.name,
        name: ingredient.item,
        amount: linkAmount,
      })
      amount_needed -= linkAmount

      if (amount_needed <= ZERO_THRESHOLD) {
        return materialLinks // Fully satisfied by circular links
      }
    }
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
      return materialLinks
    } else {
      return null // Missing ingredient
    }
  }

  // Check if we have enough available production
  const availableAmount = alreadyProduced[ingredient.item].reduce(
    (acc, item) => acc + item.amount,
    0,
  )
  if (amount_needed - ZERO_THRESHOLD > availableAmount && !isNaturalResource(ingredient.item)) {
    return null // Insufficient production
  }

  // Try to find enough from current production
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
    // defer subtracting amount from source until end, since could hit early-exit/unprocessed condition
    // which results in not consuming these resources just yet
    usedSources.push([source, amount])
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

  return materialLinks
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
  availableCircularLinks: Material[] = [],
  recipeData: Map<string, PreprocessedRecipeData>,
): Material[] => {
  const data = useDataStore()

  // Use preprocessed data
  let ingredients: RecipeIngredient[]

  if (recipeData.has(recipe.name)) {
    const preprocessed = recipeData.get(recipe.name)!
    ingredients = preprocessed.ingredients.map((ing) => ({ ...ing }))
  } else {
    // Fallback for recipes not in preprocessed data (shouldn't happen in normal flow)
    ingredients = data.recipeIngredients(recipe.name)
  }

  const materialLinks: Material[] = []
  const usedSources: [RecipeItem, number][] = []

  for (const ingredient of ingredients) {
    // With preprocessing, catalyst is already handled, just use the ingredient amount
    const amount_needed = ingredient.amount * recipe.count

    // Skip if no amount needed
    if (amount_needed <= ZERO_THRESHOLD) {
      continue
    }

    // Handle external ingredient sourcing
    const externalLinks = processExternalIngredient(
      ingredient,
      recipe,
      amount_needed,
      alreadyProduced,
      usedSources,
      availableCircularLinks,
    )

    if (externalLinks === null) {
      return [] // Could not satisfy this ingredient
    }

    materialLinks.push(...externalLinks)
  }

  // now that we've confirmed we can produce this ingredient, consume the sources
  for (const [source, amount] of usedSources) {
    source.amount -= amount
  }

  return materialLinks
}

/**
 *  1. For each iteration:
    - Try to link each remaining recipe using current producedItems
    - If successful, add recipe to current batch (but don't update producedItems yet)
    - If failed, keep in remaining recipes
  2. After iteration completes:
    - If current batch is empty but remaining recipes exist → detect circular dependencies
    - Add all current batch products to producedItems for next iteration
    - Move to next batch
  3. Repeat until all recipes processed
 */
interface PreprocessedRecipeData {
  recipe: Recipe
  ingredients: RecipeIngredient[]
  products: RecipeIngredient[]
}

interface PendingCatalystLink {
  recipeName: string
  item: string
  amount: number
}

/**
 * Preprocesses catalyst recipes by identifying self-referential ingredients/products
 * and creating modified recipe data with catalyst consumption pre-calculated.
 *
 * @param recipes - Array of recipes to preprocess
 * @returns Object containing all recipe data (original + modified) and pending catalyst links
 */
export const preprocessCatalystRecipes = (
  recipes: Recipe[],
): {
  recipeData: Map<string, PreprocessedRecipeData>
  pendingCatalystLinks: PendingCatalystLink[]
} => {
  const data = useDataStore()
  const recipeData = new Map<string, PreprocessedRecipeData>()
  const pendingCatalystLinks: PendingCatalystLink[] = []

  for (const recipe of recipes) {
    const ingredients = data.recipeIngredients(recipe.name).map((ing) => ({ ...ing }))
    const products = data.recipeProducts(recipe.name).map((prod) => ({ ...prod }))

    // Check for self-referential catalyst items
    for (const ingredient of ingredients) {
      const matchingProduct = products.find((prod) => prod.item === ingredient.item)
      if (matchingProduct) {
        // Calculate the self-referential amount (lesser of consumption vs production per recipe)
        const catalystAmount = Math.min(ingredient.amount, matchingProduct.amount)

        if (catalystAmount > 0) {
          // Create pending catalyst link for the total amount across all recipe instances
          pendingCatalystLinks.push({
            recipeName: recipe.name,
            item: ingredient.item,
            amount: catalystAmount * recipe.count,
          })

          // Reduce both ingredient requirement and product output by catalyst amount
          ingredient.amount -= catalystAmount
          matchingProduct.amount -= catalystAmount
        }
      }
    }

    recipeData.set(recipe.name, { recipe, ingredients, products })
  }

  return { recipeData, pendingCatalystLinks }
}

export const linkRecipes = (
  rawRecipes: string[],
): {
  recipeBatches: Recipe[][]
  recipeLinks: Material[]
  producedItems: Record<string, RecipeItem[]>
} => {
  const data = useDataStore()
  const recipes = rawRecipes.map(stringToRecipe)

  // Filter out mining recipes - they don't need linking
  let remainingRecipes = recipes.filter((recipe) => recipe.building !== 'Mine')

  // Preprocess catalyst recipes
  const { recipeData, pendingCatalystLinks } = preprocessCatalystRecipes(remainingRecipes)

  const recipeBatches: Recipe[][] = []
  const recipeLinks: Material[] = []
  const producedItems: Record<string, RecipeItem[]> = {}

  let batchIndex = 0
  while (remainingRecipes.length > 0) {
    console.log('Batch', batchIndex)
    const currentBatch: Recipe[] = []
    const batchLinks: Material[] = []
    const deferredRecipes: Recipe[] = []

    // Helper function to add pending catalyst links for a recipe
    const addCatalystLinks = (recipe: Recipe) => {
      const catalystLinksForRecipe = pendingCatalystLinks
        .filter((link) => link.recipeName === recipe.name)
        .map((catalystLink) => ({
          source: recipe.name,
          sink: recipe.name,
          name: catalystLink.item,
          amount: catalystLink.amount,
        }))
      batchLinks.push(...catalystLinksForRecipe)
    }

    // Try to link each remaining recipe
    for (const recipe of remainingRecipes) {
      console.log('Recipe', recipe.name)

      // Create a copy of producedItems to avoid mutations during linking attempts
      const producedItemsCopy: Record<string, RecipeItem[]> = {}
      Object.entries(producedItems).forEach(([item, sources]) => {
        producedItemsCopy[item] = sources.map((source) => ({ ...source }))
      })

      const links = getLinksForRecipe(recipe, producedItemsCopy, [], recipeData)

      if (links.length === 0) {
        console.log('Deferring recipe')
        console.log(
          'Missing ingredients:',
          recipeData.get(recipe.name)?.ingredients || data.recipeIngredients(recipe.name),
        )
        console.log('Produced items keys:', Object.keys(producedItems))
        deferredRecipes.push(recipe)
      } else {
        console.log('Produced recipe')
        currentBatch.push(recipe)
        batchLinks.push(...links)
        addCatalystLinks(recipe)

        // Apply the successful linking to the actual producedItems
        Object.entries(producedItemsCopy).forEach(([item, sources]) => {
          producedItems[item] = sources
        })
      }
    }

    // Check for circular dependencies if no progress was made
    if (currentBatch.length === 0 && deferredRecipes.length > 0) {
      console.log('No progress made, checking for circular dependencies')
      const circularRecipes = findCircularRecipes(deferredRecipes)

      if (circularRecipes.length > 0) {
        console.log(
          'Found circular recipes:',
          circularRecipes.map((r) => r.name),
        )
        // Resolve circular dependencies
        const circularLinks = resolveCircularDependencies(circularRecipes)

        // Process circular recipes with their resolved links
        for (const recipe of circularRecipes) {
          const links = getLinksForRecipe(recipe, producedItems, circularLinks, recipeData)
          currentBatch.push(recipe)
          batchLinks.push(...links)
          addCatalystLinks(recipe)
        }

        // Remove circular recipes from deferred
        remainingRecipes = deferredRecipes.filter((recipe) => !circularRecipes.includes(recipe))
      } else {
        throw new Error(
          'No progress made and no circular dependencies found. Missing ingredients for: ' +
            deferredRecipes.map((r) => r.name).join(', '),
        )
      }
    } else {
      remainingRecipes = deferredRecipes
    }

    // Add current batch to results
    recipeBatches.push(currentBatch)
    recipeLinks.push(...batchLinks)

    // Filter out consumed sources
    Object.entries(producedItems).forEach(([item, sources]) => {
      producedItems[item] = sources.filter((source) => source.amount >= ZERO_THRESHOLD)
      if (producedItems[item].length === 0) {
        delete producedItems[item]
      }
    })

    // Add products from current batch to available items for next iteration
    currentBatch.forEach((recipe) => {
      const products = recipeData.get(recipe.name)?.products || data.recipeProducts(recipe.name)
      products.forEach((product) => {
        console.log('Produced item', product.item, product.amount * recipe.count)
        if (product.amount > 0) {
          const availableAmount = product.amount * recipe.count

          if (!producedItems[product.item]) {
            producedItems[product.item] = []
          }
          producedItems[product.item].push({
            amount: availableAmount,
            recipe,
            isResource: false,
          })
        }
      })
    })

    batchIndex++
  }

  return { recipeBatches, recipeLinks, producedItems }
}

// have building on mouseover show raw recipe with native amounts
// show belt tier for ingredients/products into building
// also show building counts so we know e.g. 680 iron ore @ 65 ore / min for each building
// how many tier 1 belts, tier 2 belts, etc before having to switch?

// TODO: display checkboxes for linked materials (inputs + outputs) and buildings like
// input 1 -----            ----- output 1
// input 2 ----- building 1 ----- output 2
// input 3 -----            -----

// such that a building will only be hidden if all the inputs, itself, and outputs are checked off
// if an output from say, iron -> iron rod is checked, the INPUT for iron rod should also be checked

// still want to show building name, count, etc as well as the amounts and percentages for inputs and outputs

// TODO: anchor-based hyperlink for inputs and outputs
