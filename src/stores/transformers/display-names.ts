import { EXTERNAL_RECIPE } from '@/logistics/constants'
import type { Building, Item, Recipe } from '@/types/data'

export const formatRecipeDisplayName = (recipes: Record<string, Recipe>, recipeName: string) => {
  if (recipeName === EXTERNAL_RECIPE) {
    return recipeName
  }
  const recipe = recipes[recipeName]
  if (!recipe) {
    throw new Error(`Recipe not found: ${recipeName}`)
  }

  return recipe.name.replace(/^Alternate: /, '')
}

export const formatItemDisplayName = (items: Record<string, Item>, itemName: string) => {
  if (itemName === EXTERNAL_RECIPE) {
    return itemName
  }

  const item = items[itemName]
  if (!item) {
    throw new Error(`Item not found: ${itemName}`)
  }

  return item.name
}

export const formatBuildingDisplayName = (
  buildings: Record<string, Building>,
  buildingName: string,
) => {
  const building = buildings[buildingName]
  if (!building) {
    throw new Error(`Building not found: ${buildingName}`)
  }

  return building.name
}
