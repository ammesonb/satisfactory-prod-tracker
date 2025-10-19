import { InvalidBuildingError, InvalidRecipeError, RecipeFormatError } from '@/errors/recipe-errors'
import { useDataStore } from '@/stores/data'
import type { Recipe } from '@/types/factory'

export const parseRecipeString = (recipeString: string): Recipe => {
  const dataStore = useDataStore()

  if (!recipeString.match(/^"?\w+@[\d.]+#\w+"?: "[\d.]+"\s*,?\s*$/)) {
    throw new RecipeFormatError(recipeString)
  }

  let rest = recipeString.replace(/"/g, '')
  let index = rest.indexOf('@')
  const recipeName = rest.slice(0, index).trim()
  // strip efficiency
  index = rest.indexOf('#')
  rest = rest.slice(index + 1)
  index = rest.indexOf(':')
  const buildingName = rest.slice(0, index).trim()
  rest = rest.slice(index + 1)
  index = rest.indexOf(',')
  const amount = Number(rest.slice(0, index === -1 ? rest.length : index).trim())

  if (!dataStore.buildings[buildingName]) {
    throw new InvalidBuildingError(buildingName)
  }

  if (!dataStore.recipes[recipeName]) {
    throw new InvalidRecipeError(recipeName)
  }

  return {
    name: recipeName,
    building: buildingName,
    count: amount,
  }
}
