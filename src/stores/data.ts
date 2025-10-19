import { defineStore } from 'pinia'

import {
  formatBuildingDisplayName,
  formatItemDisplayName,
  formatRecipeDisplayName,
} from '@/stores/transformers/display-names'
import { resolveIcon } from '@/stores/transformers/icon-resolver'
import { getRecipeIngredients, getRecipeProducts } from '@/stores/transformers/recipe-data'
import type { Building, Item, Recipe, RecipeIngredient, RecipeProduct } from '@/types/data'

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
        formatItemDisplayName(state.items, itemName),
    getRecipeDisplayName:
      (state) =>
      (recipeName: string): string =>
        formatRecipeDisplayName(state.recipes, recipeName),
    getBuildingDisplayName:
      (state) =>
      (buildingName: string): string =>
        formatBuildingDisplayName(state.buildings, buildingName),
    getRecipeProductionBuildings:
      (state) =>
      (recipeName: string): string[] =>
        state.recipes[recipeName]?.producedIn ?? [],
  },
  actions: {
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
