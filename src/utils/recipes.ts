import type { Recipe, RecipeIngredient, RecipeProduct } from '@/types/data'
import { EXTERNAL_RECIPE } from '@/logistics/constants'

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
