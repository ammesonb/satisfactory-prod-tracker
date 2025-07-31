import { useDataStore } from '@/stores/data'
import type { RecipeIngredient } from '@/types/data'
import type { Recipe, Material } from '@/types/factory'

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

// TODO: refactor inputs to use RecipeIngredient
export const pickSource = (
  request: RecipeItem,
  ingredient: string,
  sources: RecipeItem[],
): RecipeItem[] => {
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
  if (quantity > ZERO_THRESHOLD && !isNaturalResource(ingredient)) {
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

export const getLinksForRecipe = (
  recipe: Recipe,
  alreadyProduced: Record<string, RecipeItem[]>,
): {
  links: Material[]
  recipesMissingIngredients: RecipeIngredient[]
} => {
  const data = useDataStore()
  const ingredients = data.recipeIngredients(recipe.name)
  const products = data.recipeProducts(recipe.name)

  const materialLinks: Material[] = []
  const recipesMissingIngredients: RecipeIngredient[] = []

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
          source: data.items[ingredient.item].name,
          sink: recipe.name,
          name: ingredient.item,
          amount: amount_needed,
        })
      } else {
        recipesMissingIngredients.push({
          // okay to set amount needed here since catalyst recipes will always offset that much
          // otherwise, should use the raw ingredient amount * recipe count
          amount: amount_needed,
          item: ingredient.item,
        })
      }
      continue
    }

    // Otherwise, try to find enough from current production
    const sources = pickSource(
      { amount: amount_needed, recipe },
      ingredient.item,
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
        source: data.items[ingredient.item].name,
        sink: recipe.name,
        name: ingredient.item,
        amount: amount_needed,
      })
    }
  }

  return {
    links: materialLinks,
    recipesMissingIngredients,
  }
}

// TODO: remove zero quantity remaining from alreadyProduced

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
