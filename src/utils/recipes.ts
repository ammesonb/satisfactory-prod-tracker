import type { Recipe, RecipeIngredient, RecipeProduct } from '@/types/data'
import { EXTERNAL_RECIPE } from '@/logistics/constants'
import { memoize } from '@/utils/cache'
import { linkToString, type RecipeNode } from '@/logistics/graph-node'

const scaleAmount = (amount: number, time: number) => amount * (60 / time)

export const formatDisplayName = (recipes: Record<string, Recipe>, recipeName: string) => {
  if (recipeName === EXTERNAL_RECIPE) {
    return recipeName
  }
  const recipe = recipes[recipeName]
  if (!recipe) {
    throw new Error(`Recipe not found: ${recipeName}`)
  }

  // "Alternate" prefix not meaningful and takes up a lot of screen space
  return recipe.name.replace(/^Alternate: /, '')
}

export const getRecipeIngredients = (
  recipes: Record<string, Recipe>,
  recipeName: string,
): RecipeIngredient[] => {
  if (recipeName === EXTERNAL_RECIPE) {
    return []
  }

  const recipe = recipes[recipeName]
  if (!recipe) {
    throw new Error(`Recipe not found: ${recipeName}`)
  }

  return recipe.ingredients.map((ingredient) => ({
    item: ingredient.item,
    amount: scaleAmount(ingredient.amount, recipe.time),
  }))
}

export const getRecipeProducts = (
  recipes: Record<string, Recipe>,
  recipeName: string,
): RecipeProduct[] => {
  if (recipeName === EXTERNAL_RECIPE) {
    return []
  }

  const recipe = recipes[recipeName]
  if (!recipe) {
    throw new Error(`Recipe not found: ${recipeName}`)
  }

  return recipe.products.map((product) => ({
    item: product.item,
    amount: scaleAmount(product.amount, recipe.time),
  }))
}

const recipesToOptionsInternal = (
  recipes: Record<string, Recipe>,
  getRecipeDisplayName: (key: string) => string,
  excludeKeys: string[] = [],
): Array<{ value: string; title: string }> => {
  return Object.keys(recipes)
    .filter((key) => !excludeKeys.includes(key))
    .map((key) => ({
      value: key,
      title: getRecipeDisplayName(key),
    }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

export const recipesToOptions = memoize(
  recipesToOptionsInternal,
  (recipes, _getRecipeDisplayName, excludeKeys) =>
    `${JSON.stringify(recipes)}-${excludeKeys?.join(',') || ''}`,
)

export const recipeComplete = (recipe: RecipeNode, links: Record<string, boolean>) => {
  return (
    recipe.built &&
    [...recipe.inputs, ...recipe.outputs].every((link) => !!links[linkToString(link)])
  )
}
