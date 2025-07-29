import { defineStore } from 'pinia'
import type { Item, Recipe, Building, RecipeIngredient, RecipeProduct } from '@/types/data'

export const useDataStore = defineStore('data', {
  state: () => ({
    items: {} as Record<string, Item>,
    recipes: {} as Record<string, Recipe>,
    buildings: {} as Record<string, Building>,
  }),
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
      return this.recipes[recipeName].ingredients
    },
    recipeProducts(recipeName: string): RecipeProduct[] {
      return this.recipes[recipeName].products
    },
    getIcon(objectName: string): string {
      if (this.recipes.hasOwnProperty(objectName)) {
        // Recipes don't have icons, so use the first product instead
        objectName = this.recipes[objectName].products[0].item
      }

      if (this.items.hasOwnProperty(objectName)) {
        return this.items[objectName].icon
      }

      if (this.buildings.hasOwnProperty(objectName)) {
        return this.buildings[objectName].icon
      }

      return ''
    },
  },
})
