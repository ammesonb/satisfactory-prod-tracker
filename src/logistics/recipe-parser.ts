import { InvalidBuildingError, InvalidRecipeError, RecipeFormatError } from '@/errors/recipe-errors'
import { useDataStore } from '@/stores/data'
import type { Recipe } from '@/types/factory'

const RECIPE_KEY = /^(Recipe_\w+)@[\d.]+#(\w+)$/
const AMOUNT = /^[\d.]+$/

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const toRecipe = (key: string, amount: unknown): Recipe => {
  const dataStore = useDataStore()
  const match = key.match(RECIPE_KEY)

  if (!match || !AMOUNT.test(String(amount))) {
    throw new RecipeFormatError(`"${key}": "${String(amount)}"`)
  }

  const [, recipeName, buildingName] = match

  if (!dataStore.buildings[buildingName]) {
    throw new InvalidBuildingError(buildingName)
  }

  if (!dataStore.recipes[recipeName]) {
    throw new InvalidRecipeError(recipeName)
  }

  return {
    name: recipeName,
    building: buildingName,
    count: Number(amount),
  }
}

/**
 * Parse a Satisfactory Tools solver response into recipes.
 *
 * Accepts the whole response body (`{ "code": 200, "result": { ... } }`) or
 * just the inner `result` object. The payload lists resource, byproduct, and
 * product totals alongside the production steps, so only `Recipe_` keys are
 * treated as recipes and everything else is ignored.
 */
export const parseRecipeInput = (recipesString: string): Recipe[] => {
  let parsed: unknown

  try {
    parsed = JSON.parse(recipesString)
  } catch {
    throw new RecipeFormatError(recipesString)
  }

  const result = isObject(parsed) && isObject(parsed.result) ? parsed.result : parsed

  if (!isObject(result)) {
    throw new RecipeFormatError(recipesString)
  }

  return Object.entries(result)
    .filter(([key]) => key.startsWith('Recipe_'))
    .map(([key, amount]) => toRecipe(key, amount))
}
