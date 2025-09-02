import { buildingDatabase, itemDatabase, recipeDatabase } from '../data'
import { vi } from 'vitest'

/**
 * Creates a mock data store for testing that uses the recipe database fixture
 * instead of mockReturnValueOnce calls
 */
export function createMockDataStore() {
  return {
    buildings: buildingDatabase,
    recipes: recipeDatabase,
    recipeIngredients: vi.fn((recipeName: string) => {
      const recipe = recipeDatabase[recipeName]
      return recipe ? recipe.ingredients : []
    }),
    recipeProducts: vi.fn((recipeName: string) => {
      const recipe = recipeDatabase[recipeName]
      return recipe ? recipe.products : []
    }),
    items: itemDatabase,
    getItemDisplayName: vi.fn((itemKey: string) => {
      const item =
        itemDatabase[itemKey] ||
        itemDatabase[Object.keys(itemDatabase).find((key) => itemDatabase[key].icon === itemKey)]
      return item?.name || itemKey
    }),
    getIcon: vi.fn((itemKey: string) => {
      const item =
        itemDatabase[itemKey] ||
        itemDatabase[Object.keys(itemDatabase).find((key) => itemDatabase[key].icon === itemKey)]
      return item?.icon || itemKey
    }),
  }
}
