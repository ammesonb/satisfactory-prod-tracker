const floorPrefix = 'floor-'
const recipePrefix = 'recipe-'

export const ExpandRecipeState = {
  Complete: true,
  Incomplete: false,
  All: null,
}

// Element ID formatters
export const formatFloorId = (floorIndex: number): string => `${floorPrefix}${floorIndex}`

/**
 * Format a unique DOM ID for a recipe element.
 *
 * NOTE: Recipe names are unique within a factory, so we don't need floor index.
 * This change decouples DOM IDs from floor position, allowing floors to be reorganized.
 *
 * @param recipeName The unique recipe name
 * @returns A formatted DOM ID like "recipe-Recipe_IronPlate_C"
 */
export const formatRecipeId = (recipeName: string): string => `${recipePrefix}${recipeName}`

export const isFloorIdentifier = (id: string): boolean => id.startsWith(floorPrefix)
export const isRecipeIdentifier = (id: string): boolean => id.startsWith(recipePrefix)

export const getFloorIndexFromIdentifier = (id: string): number =>
  parseInt(id.replace(floorPrefix, ''))
