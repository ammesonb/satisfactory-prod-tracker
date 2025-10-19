import { vi } from 'vitest'

import { buildingDatabase, itemDatabase, recipeDatabase } from '@/__tests__/fixtures/data'
import type { Building, Item, Recipe, RecipeIngredient, RecipeProduct } from '@/types/data'

/**
 * Creates a complete Recipe object from simplified test data
 */
export function createTestRecipe(data: {
  name: string
  ingredients: { item: string; amount: number }[]
  products: { item: string; amount: number }[]
  producedIn: string[]
  time?: number
}): Recipe {
  return {
    slug: data.name.toLowerCase().replace(/\s+/g, '-'),
    name: data.name,
    className: `Recipe_${data.name.replace(/\s+/g, '')}_C`,
    alternate: false,
    time: data.time || 1,
    inHand: false,
    forBuilding: false,
    inWorkshop: false,
    inMachine: true,
    manualTimeMultiplier: 1,
    ingredients: data.ingredients as RecipeIngredient[],
    products: data.products as RecipeProduct[],
    producedIn: data.producedIn,
    isVariablePower: false,
    minPower: 0,
    maxPower: 0,
  }
}

export const mockRecipeIngredients = vi.fn((recipeName: string) => {
  const recipe = recipeDatabase[recipeName]
  return recipe ? recipe.ingredients : []
})

export const mockRecipeProducts = vi.fn((recipeName: string) => {
  const recipe = recipeDatabase[recipeName]
  return recipe ? recipe.products : []
})

export const mockGetItemDisplayName = vi.fn((itemKey: string) => {
  const item = itemDatabase[itemKey]
  return item?.name || itemKey
})

export const mockGetRecipeDisplayName = vi.fn((recipeName: string) => recipeName)

export const mockGetBuildingDisplayName = vi.fn((buildingName: string) => {
  const building = buildingDatabase[buildingName]
  return building?.name || buildingName
})

export const mockGetRecipeProductionBuildings = vi.fn((recipeName: string) => {
  const recipe = recipeDatabase[recipeName]
  return recipe ? recipe.producedIn : []
})

export const mockGetIcon = vi.fn((itemKey: string) => {
  const item =
    itemDatabase[itemKey] ||
    (() => {
      const foundKey = Object.keys(itemDatabase).find((key) => itemDatabase[key].icon === itemKey)
      return foundKey ? itemDatabase[foundKey] : undefined
    })()
  return item?.icon || itemKey
})

export const mockLoadData = vi.fn()

/**
 * Creates a mock data store for testing that uses the recipe database fixture
 * instead of mockReturnValueOnce calls
 */
export function createMockDataStore() {
  return {
    buildings: buildingDatabase as Record<string, Building>,
    recipes: recipeDatabase as Record<string, Recipe>,
    items: itemDatabase as Record<string, Item>,
    recipeIngredients: mockRecipeIngredients,
    recipeProducts: mockRecipeProducts,
    getItemDisplayName: mockGetItemDisplayName,
    getRecipeDisplayName: mockGetRecipeDisplayName,
    getBuildingDisplayName: mockGetBuildingDisplayName,
    getRecipeProductionBuildings: mockGetRecipeProductionBuildings,
    getIcon: mockGetIcon,
    loadData: mockLoadData,
  }
}
