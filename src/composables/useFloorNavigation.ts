import { ref } from 'vue'
import { useFactoryStore } from '@/stores'
import type { RecipeNode } from '@/logistics/graph-node'

// Global singleton state
const expandedFloors = ref<number[]>([])

const floorPrefix = 'floor-'
const recipePrefix = 'recipe-'

export const ExpandRecipeState = {
  Complete: true,
  Incomplete: false,
  All: null,
}

// Element ID formatters
export const formatFloorId = (floorIndex: number): string => `${floorPrefix}${floorIndex}`
export const formatRecipeId = (floorIndex: number, recipeName: string): string =>
  `${recipePrefix}${floorIndex}-${recipeName}`

export function useFloorNavigation() {
  const factoryStore = useFactoryStore()

  const initializeExpansion = (isRecipeComplete: (recipe: RecipeNode) => boolean) => {
    if (factoryStore.currentFactory) {
      // only show floors with incomplete recipes by default
      expandedFloors.value = factoryStore.currentFactory.floors
        .map((floor, index) =>
          floor.recipes.some((recipe) => !isRecipeComplete(recipe)) ? index : undefined,
        )
        .filter((index): index is number => index !== undefined)
    } else {
      expandedFloors.value = []
    }
  }

  const expandFloor = (floorIndex: number) => {
    if (!expandedFloors.value.includes(floorIndex)) {
      expandedFloors.value.push(floorIndex)
    }
  }

  const collapseFloor = (floorIndex: number) => {
    const index = expandedFloors.value.indexOf(floorIndex)
    if (index > -1) {
      expandedFloors.value.splice(index, 1)
    }
  }

  const setRecipeExpansionFromCompletion = (
    affectsCompleted: boolean | null,
    shouldExpand: boolean,
    isRecipeComplete: (recipe: RecipeNode) => boolean,
  ) => {
    if (!factoryStore.currentFactory) return

    for (const floor of factoryStore.currentFactory.floors) {
      for (const recipe of floor.recipes) {
        // only change state of the requested complete/incomplete recipes
        if (
          affectsCompleted === ExpandRecipeState.All ||
          affectsCompleted === isRecipeComplete(recipe)
        ) {
          recipe.expanded = shouldExpand
        }
      }

      const anyExpanded = floor.recipes.some((r) => r.expanded)
      // if expanding recipes and any are expanded on this floor, then make sure the floor is visible
      if (shouldExpand && anyExpanded) expandFloor(floor.recipes[0].batchNumber!)
      // otherwise if collapsing and no recipes are expanded, then collapse the whole floor
      else if (!shouldExpand && !anyExpanded) collapseFloor(floor.recipes[0].batchNumber!)
    }
  }

  const toggleFloor = (floorIndex: number) => {
    if (expandedFloors.value.includes(floorIndex)) {
      collapseFloor(floorIndex)
    } else {
      expandFloor(floorIndex)
    }
  }

  const navigateToElement = (elementId: string) => {
    if (elementId.startsWith(floorPrefix)) {
      const floorIndex = parseInt(elementId.replace(floorPrefix, ''))
      expandFloor(floorIndex)

      // Scroll to element after a delay to ensure expansion
      setTimeout(() => {
        const element = document.getElementById(elementId)
        if (element) {
          const yOffset = -80 // Account for app bar height
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 100)
    } else if (elementId.startsWith(recipePrefix)) {
      const parts = elementId.split('-')
      const floorIndex = parseInt(parts[1])
      expandFloor(floorIndex)

      // Scroll to element after a delay to ensure expansion
      setTimeout(() => {
        const element = document.getElementById(elementId)
        if (element) {
          const yOffset = -80 // Less offset for recipes
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 250) // Increased delay to ensure expansion completes
    }
  }

  return {
    expandedFloors,
    expandFloor,
    collapseFloor,
    setRecipeExpansionFromCompletion,
    toggleFloor,
    navigateToElement,
    initializeExpansion,
  }
}
