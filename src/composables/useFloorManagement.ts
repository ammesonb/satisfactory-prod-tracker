import { computed } from 'vue'
import { getStores } from '@/composables/useStores'
import type { Floor } from '@/types/factory'

export function useFloorManagement() {
  const { factoryStore } = getStores()

  const getFloorDisplayName = (floorIndex: number, floor: Floor): string => {
    return `Floor ${floorIndex}` + (floor.name ? ` - ${floor.name}` : '')
  }

  const currentFactoryFloors = computed(() => {
    if (!factoryStore.currentFactory) return []

    return factoryStore.currentFactory.floors.map((floor, index) => ({
      index,
      floor,
      displayName: getFloorDisplayName(index + 1, floor),
      recipeCount: floor.recipes.length,
    }))
  })

  const getEligibleFloors = (currentFloorIndex: number) => {
    return currentFactoryFloors.value.map((floorInfo) => ({
      value: floorInfo.index,
      title: floorInfo.displayName,
      disabled: floorInfo.index === currentFloorIndex,
    }))
  }

  // individual floor update functions
  const updateFloorName = (floorIndex: number, name: string | undefined) => {
    if (!factoryStore.currentFactory?.floors[floorIndex]) return
    factoryStore.currentFactory.floors[floorIndex].name = name
  }

  const updateFloorIcon = (floorIndex: number, iconItem: string | undefined) => {
    if (!factoryStore.currentFactory?.floors[floorIndex]) return
    factoryStore.currentFactory.floors[floorIndex].iconItem = iconItem
  }

  // batch update floors, indexed by array position, to the name or icon provided
  // if an entry is set, any value set in the object will update for that floor
  const updateFloors = (
    updates: Array<{ index: number; name?: string | undefined; iconItem?: string | undefined }>,
  ) => {
    if (!factoryStore.currentFactory) return

    for (const update of updates) {
      const floor = factoryStore.currentFactory.floors[update.index]
      if (floor) {
        if ('name' in update) floor.name = update.name
        if ('iconItem' in update) floor.iconItem = update.iconItem
      }
    }
  }

  const moveRecipe = (recipeName: string, fromFloorIndex: number, toFloorIndex: number) => {
    if (!factoryStore.currentFactory || fromFloorIndex === toFloorIndex) return

    const fromFloor = factoryStore.currentFactory.floors[fromFloorIndex]
    const toFloor = factoryStore.currentFactory.floors[toFloorIndex]

    if (!fromFloor || !toFloor) return

    // Find and remove recipe from source floor
    const recipeIndex = fromFloor.recipes.findIndex((r) => r.recipe.name === recipeName)
    if (recipeIndex === -1) return

    const recipe = fromFloor.recipes.splice(recipeIndex, 1)[0]

    recipe.batchNumber = toFloorIndex

    toFloor.recipes.push(recipe)
  }

  return {
    getFloorDisplayName,
    currentFactoryFloors,
    getEligibleFloors,
    updateFloorName,
    updateFloorIcon,
    updateFloors,
    moveRecipe,
  }
}
