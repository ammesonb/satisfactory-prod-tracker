import { useDataStore } from '@/stores/data'
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

export const pickSource = (
  request: RecipeItem,
  ingredient: string,
  sources: RecipeItem[],
): RecipeItem[] => {
  if (sources.length === 0) {
    throw new Error(`No sources found for ${ingredient} in ${request.recipe.name}`)
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
  sources = sources.sort((a, b) => a.amount - b.amount)
  const usedSources: RecipeItem[] = []
  while (quantity > ZERO_THRESHOLD) {
    const source = sources.shift()
    if (!source) {
      break
    }
    quantity -= source.amount
    usedSources.push(source)
  }

  if (quantity > ZERO_THRESHOLD) {
    throw new Error(`Not enough sources for ${ingredient} in ${request.recipe.name}`)
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

  while (remainingRecipes.length > 0) {
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

export const materialLinksFromRecipes = (recipes: Recipe[]): Material[] => {
  // TODO: always use your own output as input if possible, e.g. encased uranium fuel cell has sulfuric acid catalyst
  const data = useDataStore()
  const { ingredients, products } = getAllRecipeMaterials(recipes)

  const materialLinks: Material[] = []

  // For each item we need to source
  for (const [ingredient, sinkList] of Object.entries(ingredients)) {
    const ingredientSources = products[ingredient]
    // for each recipe requiring the ingredient, try to match to products
    for (const sink of sinkList) {
      // If the sink either is an intermediate product or a natural resource that could be sourced from a byproduct
      if (!sink.isResource || ingredientSources.length > 0) {
        const sources = pickSource(sink, ingredient, ingredientSources)
        // TODO: iterate over sources until required amount satisfied
        // TODO: and update ingredientSources with amount used
        // TODO: if producer fully consumed, remove from list
      } else if (sink.isResource) {
        // For a non-produced raw resource, source from the environment
        const name = data.items[ingredient].name
        materialLinks.push({
          source: name,
          sink: sink.recipe.name,
          name,
          amount: sink.amount,
        })
      } else {
        throw new Error(`No sources found for ${ingredient} in ${sink.recipe.name}`)
      }
    }
  }

  // TODO: We also will need a summary of each resource, such that it is easy to find the inputs/outputs for it
  return materialLinks
}

// TODO: need function to generate full material lines for recipes
//       - byproducts should be consumed by first producer, need to think about this one
//       - ideally consumed by one consumer, but maybe splitting is okay too

// TODO: need to group recipes into "floors" based on inputs
//       - raw first, iteratively until all recipes produced
//       - MAKE SURE to check all ingredients produced, not ANY

// TODO: display checkboxes for linked materials (inputs + outputs) and buildings like
// input 1 -----            ----- output 1
// input 2 ----- building 1 ----- output 2
// input 3 -----            -----

// such that a building will only be hidden if all the inputs, itself, and outputs are checked off
// if an output from say, iron -> iron rod is checked, the INPUT for iron rod should also be checked

// still want to show building name, count, etc as well as the amounts and percentages for inputs and outputs

// TODO: anchor-based hyperlink for inputs and outputs
