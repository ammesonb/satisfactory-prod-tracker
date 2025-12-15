import { defineStore } from 'pinia'
import { h } from 'vue'

import { isUserFriendlyError } from '@/errors/type-guards'
import { ZERO_THRESHOLD } from '@/logistics/constants'
import { linkToString, type RecipeNode } from '@/logistics/graph-node'
import { solveRecipeChain } from '@/logistics/graph-solver'
import { useErrorStore } from '@/stores/errors'
import { type RecipeProduct } from '@/types/data'
import { FactorySyncStatus, type ConflictInfo } from '@/types/cloudSync'
import { type Factory, type Floor } from '@/types/factory'

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

        // Also add leftover products as links (outputs with empty sink)
        const leftoverProducts = recipeNode.availableProducts
          .filter((p) => p.amount > ZERO_THRESHOLD)
          .map((p) => ({
            source: recipeNode.recipe.name,
            sink: '',
            material: p.item,
            amount: p.amount,
          }))

        for (const link of leftoverProducts) {
          recipeLinks[linkToString(link)] = false
        }
      }

      this.factories[name] = {
        name,
        icon,
        floors,
        recipeLinks,
      }

      // Mark new factory as dirty for auto-sync
      this.markDirty(name)
    },
    removeFactory(name: string) {
      if (this.currentFactory?.name === name) {
        this.selected = ''
      }
      delete this.factories[name]
    },
    renameFactory(oldName: string, newName: string) {
      const factory = this.factories[oldName]
      if (!factory) return

      factory.name = newName

      this.factories[newName] = factory
      delete this.factories[oldName]

      // Keep selected current if it was renamed
      if (this.selected === oldName) {
        this.selected = newName
      }
    },
    setLinkBuiltState(linkId: string, built: boolean) {
      if (!this.currentFactory) return
      this.currentFactory.recipeLinks[linkId] = built
      this.markDirty(this.currentFactory.name)
    },
    getRecipeByName(recipeName: string): RecipeNode | null {
      if (!this.currentFactory) return null

      for (const floor of this.currentFactory.floors) {
        const recipe = floor.recipes.find((r) => r.recipe.name === recipeName)
        if (recipe) return recipe
      }
      return null
    },
    /**
     * Find the floor index that contains the given recipe.
     *
     * Note: this may seem inefficient, but at the scale of thousands of recipes attempting to sync
     * an ordered list of recipes to a hashable data structure introduces more complexity than it saves.
     *
     * @param recipe The recipe node to search for
     * @returns The floor index (0-based), or -1 if not found
     */
    getFloorIndexForRecipe(recipe: RecipeNode): number {
      if (!this.currentFactory) return -1

      for (let i = 0; i < this.currentFactory.floors.length; i++) {
        if (
          this.currentFactory.floors[i].recipes.some((r) => r.recipe.name === recipe.recipe.name)
        ) {
          return i
        }
      }
      return -1
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

    // ========================================
    // Sync Status Management (Cloud Sync Phase 1)
    // ========================================

    setSyncStatus(factoryName: string, status: FactorySyncStatus): void {
      const factory = this.factories[factoryName]
      if (!factory) return

      factory.syncStatus = {
        lastSynced: null,
        ...factory.syncStatus,
        status,
        lastError:
          // if sync state is not error, clear error message
          status !== FactorySyncStatus.ERROR ? null : (factory.syncStatus?.lastError ?? null),
      }
    },

    markDirty(factoryName: string): void {
      this.setSyncStatus(factoryName, FactorySyncStatus.DIRTY)
    },

    markSynced(factoryName: string, timestamp?: string): void {
      const factory = this.factories[factoryName]
      if (!factory) return

      this.setSyncStatus(factoryName, FactorySyncStatus.CLEAN)
      if (factory.syncStatus) {
        factory.syncStatus.lastSynced = timestamp || new Date().toISOString()
      }
    },

    setSyncError(factoryName: string, errorMessage: string): void {
      const factory = this.factories[factoryName]
      if (!factory) return

      this.setSyncStatus(factoryName, FactorySyncStatus.ERROR)
      if (factory.syncStatus) {
        factory.syncStatus.lastError = errorMessage
      }
    },

    clearSyncError(factoryName: string): void {
      const factory = this.factories[factoryName]
      if (!factory || !factory.syncStatus) return

      factory.syncStatus.lastError = null
    },

    setSyncConflict(factoryName: string, conflict: ConflictInfo): void {
      const factory = this.factories[factoryName]
      if (!factory) return

      factory.conflict = conflict
      this.setSyncStatus(factoryName, FactorySyncStatus.CONFLICT)
    },

    clearSyncConflict(factoryName: string): void {
      const factory = this.factories[factoryName]
      if (!factory) return

      factory.conflict = undefined
    },
  },
  persist: true,
})
