import { defineStore } from 'pinia'
import type { Item, Recipe, Building, RecipeIngredient, RecipeProduct } from '@/types/data'
import { formatDisplayName as formatItemName } from '@/utils/items'
import { formatDisplayName as formatBuildingName } from '@/utils/buildings'
import {
  formatDisplayName as formatRecipeName,
  getRecipeIngredients,
  getRecipeProducts,
} from '@/utils/recipes'
import { resolveIcon } from '@/utils/icons'

export const useDataStore = defineStore('data', {
  state: () => ({
    items: {} as Record<string, Item>,
    recipes: {} as Record<string, Recipe>,
    buildings: {} as Record<string, Building>,
    isLoading: true,
  }),
  getters: {
    getItemDisplayName:
      (state) =>
      (itemName: string): string =>
        formatItemName(state.items, itemName),
    getRecipeDisplayName:
      (state) =>
      (recipeName: string): string =>
        formatRecipeName(state.recipes, recipeName),
    getBuildingDisplayName:
      (state) =>
      (buildingName: string): string =>
        formatBuildingName(state.buildings, buildingName),
    getRecipeProductionBuildings:
      (state) =>
      (recipeName: string): string[] =>
        state.recipes[recipeName]?.producedIn ?? [],
  },
  actions: {
    addRecipe(recipe: Recipe) {
      this.recipes[recipe.name] = recipe
    },
    addItem(item: Item) {
      this.items[item.name] = item
    },
    addBuilding(building: Building) {
      this.buildings[building.name] = building
    },
    recipeIngredients(recipeName: string): RecipeIngredient[] {
      return getRecipeIngredients(this.recipes, recipeName)
    },
    recipeProducts(recipeName: string): RecipeProduct[] {
      return getRecipeProducts(this.recipes, recipeName)
    },
    getIcon(objectName: string): string {
      return resolveIcon(this, objectName)
    },
    loadData() {
      this.isLoading = true
      fetch('data.json')
        .then((response) => response.json())
        .then((data) => {
          this.items = data.items
          this.recipes = data.recipes
          this.buildings = data.buildings
        })
        .finally(() => {
          this.isLoading = false
        })
    },
  },
})
