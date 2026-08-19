import { computed, ref } from 'vue'

import { getStores } from '@/composables/useStores'
import type { RecipeNode } from '@/logistics/graph-node'
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

const unnamedFloorRegex = /^Floor (\d+)$/i

// Shared state outside the composable so all instances share the same refs
const showFloorEditor = ref(false)
const editFloorIndex = ref<number | null>(null)

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
    factoryStore.markDirty(factoryStore.currentFactory.name)
  }

  const updateFloorIcon = (floorIndex: number, iconItem: string | undefined) => {
    if (!factoryStore.currentFactory?.floors[floorIndex]) return
    factoryStore.currentFactory.floors[floorIndex].iconItem = iconItem
    factoryStore.markDirty(factoryStore.currentFactory.name)
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
    if (updates.length > 0) {
      factoryStore.markDirty(factoryStore.currentFactory.name)
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

    toFloor.recipes.push(recipe)
    factoryStore.markDirty(factoryStore.currentFactory.name)
  }

  // Floor editor modal functions
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

  /**
   * Get the floor index for a given recipe by searching through floors.
   * Delegates to the factory store implementation.
   */
  const getFloorIndexForRecipe = (recipe: RecipeNode) => {
    return factoryStore.getFloorIndexForRecipe(recipe)
  }

  /**
   * Insert a new empty floor at the specified index.
   * Updates floor names that reference numeric positions >= atIndex.
   *
   * @param atIndex - The index where the new floor should be inserted (0-based)
   */
  const insertFloor = (atIndex: number) => {
    if (!factoryStore.currentFactory) return

    const newFloor: Floor = { recipes: [] }
    factoryStore.currentFactory.floors.splice(atIndex, 0, newFloor)

    // Update floor names that reference numeric positions >= atIndex
    updateFloorNamesAfterInsertion(atIndex)
    factoryStore.markDirty(factoryStore.currentFactory.name)
  }

  const getUnnamedFloorsAfterIndex = (
    index: number,
  ): { floor: Floor; nameMatch?: RegExpMatchArray | null }[] =>
    factoryStore.currentFactory?.floors
      .slice(index)
      .map((floor) => ({ floor, nameMatch: floor.name?.match(unnamedFloorRegex) || undefined }))
      .filter((floor) => floor.nameMatch) || []

  /**
   * Update floor names after inserting a floor.
   * Increments numeric floor names (e.g., "Floor 3" → "Floor 4") for floors after the insertion point.
   */
  const updateFloorNamesAfterInsertion = (insertedIndex: number) => {
    if (!factoryStore.currentFactory) return

    for (const { floor, nameMatch } of getUnnamedFloorsAfterIndex(insertedIndex + 1)) {
      if (!nameMatch) continue // Type guard, though filter should prevent this

      const oldNumber = parseInt(nameMatch[1], 10)
      if (oldNumber > insertedIndex) {
        floor.name = `Floor ${oldNumber + 1}`
      }
    }
  }

  /**
   * Remove a floor at the specified index if it's empty.
   * Updates floor names that reference numeric positions > floorIndex.
   *
   * @param floorIndex - The index of the floor to remove (0-based)
   * @throws Error if floor is not empty
   */
  const removeFloor = (floorIndex: number) => {
    if (!factoryStore.currentFactory) return

    const floor = factoryStore.currentFactory.floors[floorIndex]
    if (!floor || floor.recipes.length > 0) {
      throw new Error('Cannot remove floor with recipes')
    }

    factoryStore.currentFactory.floors.splice(floorIndex, 1)

    // Update floor names that reference numeric positions > floorIndex
    updateFloorNamesAfterRemoval(floorIndex)
    factoryStore.markDirty(factoryStore.currentFactory.name)
  }

  /**
   * Update floor names after removing a floor.
   * Decrements numeric floor names (e.g., "Floor 4" → "Floor 3") for floors after the removal point.
   */
  const updateFloorNamesAfterRemoval = (removedIndex: number) => {
    if (!factoryStore.currentFactory) return

    for (const { floor, nameMatch } of getUnnamedFloorsAfterIndex(removedIndex)) {
      if (!nameMatch) continue // Type guard, though filter should prevent this

      const oldNumber = parseInt(nameMatch[1], 10)
      if (oldNumber > removedIndex + 1) {
        floor.name = `Floor ${oldNumber - 1}`
      }
    }
  }

  /**
   * Check if a floor can be removed (i.e., it's empty).
   *
   * @param floorIndex - The index of the floor to check (0-based)
   * @returns true if the floor exists and has no recipes, false otherwise
   */
  const canRemoveFloor = (floorIndex: number): boolean => {
    const floor = factoryStore.currentFactory?.floors[floorIndex]
    return !!floor && floor.recipes.length === 0
  }

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
    getFloorIndexForRecipe,
    insertFloor,
    removeFloor,
    canRemoveFloor,
  }
}
