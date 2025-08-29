import { ref, watch } from 'vue'
import { useFactoryStore } from '@/stores/factory'

// Global singleton state
const expandedFloors = ref<number[]>([])
let initialized = false

const floorPrefix = 'floor-'
const recipePrefix = 'recipe-'

// Element ID formatters
export const formatFloorId = (floorIndex: number): string => `${floorPrefix}${floorIndex}`
export const formatRecipeId = (floorIndex: number, recipeName: string): string =>
  `${recipePrefix}${floorIndex}-${recipeName}`

export function useFloorNavigation() {
  const factoryStore = useFactoryStore()

  const initializeExpansion = () => {
    if (factoryStore.currentFactory) {
      // only show floors with incomplete recipes by default
      expandedFloors.value = factoryStore.currentFactory.floors
        .map((floor, index) =>
          floor.recipes.some((recipe) => !factoryStore.recipeComplete(recipe)) ? index : undefined,
        )
        .filter((index): index is number => index !== undefined)
    } else {
      expandedFloors.value = []
    }
  }

  // Only initialize watcher once
  if (!initialized) {
    initialized = true

    // Watch for factory changes
    watch(
      () => [factoryStore.currentFactory],
      () => {
        initializeExpansion()
      },
      { immediate: true },
    )
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
    toggleFloor,
    navigateToElement,
    initializeExpansion,
  }
}
