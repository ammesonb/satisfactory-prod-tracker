import { defineStore } from 'pinia'
import { h } from 'vue'
import type { Factory, Floor } from '@/types/factory'
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
    currentFactory: (state) => state.factories[state.selected],
    factoryList: (state) => Object.values(state.factories || {}),
    getFloorDisplayName: () => (floorIndex: number, floor: Floor) => {
      return `Floor ${floorIndex}` + (floor.name ? ` - ${floor.name}` : '')
    },
    recipeComplete:
      (state) =>
      (recipe: RecipeNode): boolean => {
        if (state.selected === '' || !recipe.built) {
          return false
        }

        const factory = state.factories[state.selected]
        if (!factory) {
          return false
        }

        return (
          [...recipe.inputs, ...recipe.outputs]
            .map(linkToString)
            .every((link) => factory.recipeLinks[link]) ?? false
        )
      },
  },
  actions: {
    setSelectedFactory(factoryName: string) {
      this.selected = factoryName
    },
    updateFloorName(factoryName: string, floorIndex: number, name: string) {
      const factory = this.factories[factoryName]
      if (factory && factory.floors[floorIndex]) {
        factory.floors[floorIndex].name = name
      }
    },
    updateFloorIcon(factoryName: string, floorIndex: number, icon: string) {
      const factory = this.factories[factoryName]
      if (factory && factory.floors[floorIndex]) {
        factory.floors[floorIndex].icon = icon
      }
    },
    updateFloors(
      factoryName: string,
      updates: Array<{ index: number; name?: string; icon?: string }>,
    ) {
      const factory = this.factories[factoryName]
      if (!factory) return

      for (const update of updates) {
        const floor = factory.floors[update.index]
        if (floor) {
          if ('name' in update) floor.name = update.name
          if ('icon' in update) floor.icon = update.icon
        }
      }
    },
    addFactory(name: string, icon: string, recipes: string) {
      const errorStore = useErrorStore()

      const recipeNodes: RecipeNode[] = []

      try {
        recipeNodes.push(
          ...solveRecipeChain(
            recipes
              .trim()
              .split('\n')
              .map((s) => s.trim()),
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
    setLinkBuiltState(linkId: string, built: boolean) {
      if (!this.currentFactory) return
      this.currentFactory.recipeLinks[linkId] = built
    },
  },
  persist: true,
})
