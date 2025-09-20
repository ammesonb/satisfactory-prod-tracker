const floorPrefix = 'floor-'
const recipePrefix = 'recipe-'

export const ExpandRecipeState = {
  Complete: true,
  Incomplete: false,
  All: null,
}

// Element ID formatters
export const formatFloorId = (floorIndex: number): string => `${floorPrefix}${floorIndex}`
export const formatRecipeId = (floorIndex: number, recipeName: string): string =>
  `${recipePrefix}${floorIndex}-${recipeName}`

export const isFloorIdentifier = (id: string): boolean => id.startsWith(floorPrefix)
export const isRecipeIdentifier = (id: string): boolean => id.startsWith(recipePrefix)

export const getFloorIndexFromIdentifier = (id: string): number =>
  parseInt(id.replace(floorPrefix, ''))
