import { defineStore } from 'pinia'
import type { Factory, Floor } from '@/types/factory'
import { solveRecipeChain } from '@/logistics/graph-solver'
import { useErrorStore } from '@/stores/errors'
import { isUserFriendlyError } from '@/errors/type-guards'
import type { RecipeNode } from '@/logistics/graph-node'

export const useFactoryStore = defineStore('factory', {
  state: () => ({
    selected: '',
    factories: {} as Record<string, Factory>,
  }),
  getters: {
    hasFactories: (state) => Object.keys(state.factories).length > 0,
    currentFactory: (state) => state.factories[state.selected],
    factoryList: (state) => Object.values(state.factories || {}),
  },
  actions: {
    setSelectedFactory(factoryName: string) {
      this.selected = factoryName
    },
    addFactory(name: string, icon: string, recipes: string) {
      const errorStore = useErrorStore()

      const recipeNodes: RecipeNode[] = []

      try {
        recipeNodes.push(...solveRecipeChain(recipes.split('\n').map((s) => s.trim())))
      } catch (error) {
        if (isUserFriendlyError(error)) {
          const { summary, details } = error.toErrorMessage()
          errorStore.setError(summary, details)
        } else {
          errorStore.setError(
            'Unknown error',
            `An unexpected error occurred while adding the factory: ${error instanceof Error ? error.message : String(error)}`,
          )
        }
        throw error
      }

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
