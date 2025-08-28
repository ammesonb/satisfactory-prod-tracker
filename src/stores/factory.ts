import { defineStore } from 'pinia'
import type { Factory, Floor } from '@/types/factory'
import { solveRecipeChain } from '@/logistics/graph-solver'

export const useFactoryStore = defineStore('factory', {
  state: () => ({
    selected: '',
    factories: {} as Record<string, Factory>,
  }),
  getters: {
    currentFactory: (state) => state.factories[state.selected],
    factories: (state) => Object.values(state.factories || {}),
  },
  actions: {
    setSelectedFactory(factoryName: string) {
      this.selected = factoryName
    },
    addFactory(name: string, icon: string, recipes: string) {
      const recipeNodes = solveRecipeChain(recipes.split('\n').map((s) => s.trim()))
      const floors: Floor[] = []
      for (const recipeNode of recipeNodes) {
        while (recipeNode.batchNumber! > floors.length) {
          floors.push({ recipes: [] })
        }

        floors[recipeNode.batchNumber! - 1].recipes.push(recipeNode)
      }

      this.factories[name] = {
        name,
        icon,
        floors,
      }
    },
  },
  persist: true,
})
