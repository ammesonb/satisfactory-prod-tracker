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
      const recipe = this.recipes[recipeName]
      return recipe.ingredients.map((ingredient) => {
        return {
          item: ingredient.item,
          // scale amount by craft count / min
          amount: ingredient.amount * (60 / recipe.time),
        }
      })
    },
    recipeProducts(recipeName: string): RecipeProduct[] {
      const recipe = this.recipes[recipeName]
      return recipe.products.map((product) => {
        return {
          item: product.item,
          // scale amount by craft count / min
          amount: product.amount * (60 / recipe.time),
        }
      })
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
    loadData() {
      fetch('data.json')
        .then((response) => response.json())
        .then((data) => {
          this.items = data.items
          this.recipes = data.recipes
          this.buildings = data.buildings
        })
    },
  },
})
