import { defineStore } from 'pinia'
import type { Item, Recipe, Building, RecipeIngredient, RecipeProduct } from '@/types/data'
import { BELT_ITEM_NAMES, EXTERNAL_RECIPE } from '@/logistics/constants'

export const useDataStore = defineStore('data', {
  state: () => ({
    items: {} as Record<string, Item>,
    recipes: {} as Record<string, Recipe>,
    buildings: {} as Record<string, Building>,
  }),
  getters: {
    getItemDisplayName:
      (state) =>
      (itemName: string): string => {
        const item = state.items[itemName]
        return item?.name || itemName
      },
    getRecipeDisplayName:
      (state) =>
      (recipeName: string): string => {
        if (recipeName === EXTERNAL_RECIPE) {
          return 'External'
        }
        const recipe = state.recipes[recipeName]
        return (recipe?.name || recipeName).replace(/^Alternate: /, '')
      },
    getBuildingDisplayName:
      (state) =>
      (buildingName: string): string => {
        const building = state.buildings[buildingName]
        return building?.name || buildingName
      },
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
      if (recipeName === EXTERNAL_RECIPE) {
        return []
      }

      const recipe = this.recipes[recipeName]
      if (!recipe) {
        throw new Error(`Recipe not found: ${recipeName}`)
      }
      return recipe.ingredients.map((ingredient) => {
        return {
          item: ingredient.item,
          // scale amount by craft count / min
          amount: ingredient.amount * (60 / recipe.time),
        }
      })
    },
    recipeProducts(recipeName: string): RecipeProduct[] {
      if (recipeName === EXTERNAL_RECIPE) {
        return []
      }

      const recipe = this.recipes[recipeName]
      if (!recipe) {
        throw new Error(`Recipe not found: ${recipeName}`)
      }
      return recipe.products.map((product) => {
        return {
          item: product.item,
          // scale amount by craft count / min
          amount: product.amount * (60 / recipe.time),
        }
      })
    },
    getIcon(objectName: string): string {
      if (objectName === EXTERNAL_RECIPE) {
        return this.buildings[BELT_ITEM_NAMES[0]].icon
      }
      if (this.recipes.hasOwnProperty(objectName)) {
        // Recipes don't have icons, so use the first product instead
        return this.items[this.recipes[objectName].products[0].item].icon
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
