import { defineStore } from 'pinia'
import { h } from 'vue'
import { type RecipeProduct } from '@/types/data'
import { type Factory, type Floor } from '@/types/factory'
import { solveRecipeChain } from '@/logistics/graph-solver'
import { useErrorStore } from '@/stores/errors'
import { isUserFriendlyError } from '@/errors/type-guards'
import { linkToString, type RecipeNode } from '@/logistics/graph-node'

export const useFactoryStore = defineStore('factory', {
  state: () => ({
    selected: '',
    factories: {} as Record<string, Factory>,
  }),
  getters: {
    hasFactories: (state) => Object.keys(state.factories).length > 0,
    currentFactory: (state) => state.factories[state.selected] || null,
    factoryList: (state) =>
      Object.values(state.factories || {}).sort((a, b) => a.name.localeCompare(b.name)),
  },
  actions: {
    setSelectedFactory(factoryName: string) {
      this.selected = factoryName
    },
    addFactory(name: string, icon: string, recipes: string, externalInputs: RecipeProduct[]) {
      const errorStore = useErrorStore()

      const recipeNodes: RecipeNode[] = []

      try {
        recipeNodes.push(
          ...solveRecipeChain(
            recipes
              .trim()
              .split('\n')
              .map((s) => s.trim()),
            externalInputs,
          ),
        )
      } catch (error) {
        if (isUserFriendlyError(error)) {
          error.showError(errorStore)
        } else {
          errorStore
            .error()
            .title('Unknown error')
            .body(() =>
              h(
                'p',
                `An unexpected error occurred while adding the factory: ${error instanceof Error ? error.message : String(error)}`,
              ),
            )
            .show()
        }
        throw error
      }

      const floors: Floor[] = []
      const recipeLinks: Record<string, boolean> = {}

      for (const recipeNode of recipeNodes) {
        while (recipeNode.batchNumber! >= floors.length) {
          floors.push({ recipes: [] })
        }

        floors[recipeNode.batchNumber!].recipes.push(recipeNode)

        // Initialize all recipe links as incomplete (false)
        for (const link of [...recipeNode.inputs, ...recipeNode.outputs]) {
          recipeLinks[linkToString(link)] = false
        }
      }

      this.factories[name] = {
        name,
        icon,
        floors,
        recipeLinks,
      }
    },
    removeFactory(name: string) {
      if (this.currentFactory?.name === name) {
        this.selected = ''
      }
      delete this.factories[name]
    },
    setLinkBuiltState(linkId: string, built: boolean) {
      if (!this.currentFactory) return
      this.currentFactory.recipeLinks[linkId] = built
    },
    getRecipeByName(recipeName: string): RecipeNode | null {
      if (!this.currentFactory) return null

      for (const floor of this.currentFactory.floors) {
        const recipe = floor.recipes.find((r) => r.recipe.name === recipeName)
        if (recipe) return recipe
      }
      return null
    },
    exportFactories(factoryNames?: string[]) {
      const factoriesToExport: Record<string, Factory> = {}

      if (!factoryNames || factoryNames.length === 0) {
        // Export all factories
        Object.assign(factoriesToExport, this.factories)
      } else {
        // Export only selected factories
        for (const name of factoryNames) {
          if (this.factories[name]) {
            factoriesToExport[name] = this.factories[name]
          }
        }
      }

      return factoriesToExport
    },
    importFactories(factories: Record<string, Factory>) {
      for (const [factoryName, factoryData] of Object.entries(factories)) {
        this.factories[factoryName] = factoryData
      }
    },
  },
  persist: true,
})
