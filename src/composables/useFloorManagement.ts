import { computed, ref } from 'vue'

import { getStores } from '@/composables/useStores'
import type { ItemOption } from '@/types/data'
import type { Floor } from '@/types/factory'

export interface FloorWithIndex extends Floor {
  originalIndex: number
}

export interface FloorFormData {
  index: number
  name: string | undefined
  item: ItemOption | undefined
  originalName: string | undefined
  originalItem: ItemOption | undefined
}

export function useFloorManagement() {
  const { factoryStore, dataStore } = getStores()

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

  // Floor editor modal state
  const showFloorEditor = ref(false)
  const editFloorIndex = ref<number | null>(null)

  const openFloorEditor = (floorIndex?: number) => {
    editFloorIndex.value = floorIndex ?? null
    showFloorEditor.value = true
  }

  const closeFloorEditor = () => {
    showFloorEditor.value = false
    editFloorIndex.value = null
  }

  // Floor form template generation
  const getFloorFormsTemplate = (): FloorFormData[] => {
    if (!factoryStore.currentFactory) return []

    const indicesToEdit =
      editFloorIndex.value !== null
        ? [editFloorIndex.value] // Single floor mode
        : factoryStore.currentFactory.floors.map((_, index) => index) // All floors mode

    return indicesToEdit.map((index) => {
      const floor = factoryStore.currentFactory!.floors[index]
      const itemOption = floor?.iconItem
        ? {
            // NOTE: value here is icon, not key like in utils
            // TODO: change the logic around this so we can use normal keys here
            value: floor.iconItem,
            name: dataStore.getItemDisplayName(floor.iconItem),
            icon: dataStore.getIcon(floor.iconItem),
            type: 'item' as const,
          }
        : undefined

      return {
        index,
        name: floor?.name,
        item: itemOption,
        originalName: floor?.name,
        originalItem: itemOption,
      }
    })
  }

  const floorChanged = (form: FloorFormData) =>
    form.name !== form.originalName || form.item?.value !== form.originalItem?.value

  // Form change detection
  const hasFloorFormChanges = (forms: FloorFormData[]) => {
    return forms.some(floorChanged)
  }

  const updateFloorsFromForms = (floors: FloorFormData[]) => {
    updateFloors(
      floors.filter(floorChanged).map((floor) => ({
        index: floor.index,
        iconItem: floor.item?.value,
        name: floor.name,
      })),
    )
  }

  const floorMatches = (floor: FloorWithIndex, query: string) =>
    // floor name includes the query
    getFloorDisplayName(floor.originalIndex + 1, floor)
      .toLowerCase()
      .includes(query.toLowerCase()) ||
    // or a recipe in it does
    floor.recipes.some((recipe) =>
      dataStore
        .getRecipeDisplayName(recipe.recipe.name)
        .toLowerCase()
        .includes(query.toLowerCase()),
    )

  return {
    showFloorEditor,
    editFloorIndex,
    openFloorEditor,
    closeFloorEditor,
    getFloorDisplayName,
    currentFactoryFloors,
    getEligibleFloors,
    updateFloorName,
    updateFloorIcon,
    updateFloors,
    moveRecipe,
    getFloorFormsTemplate,
    hasFloorFormChanges,
    updateFloorsFromForms,
    floorMatches,
  }
}
