import type { ComputedRef, Ref } from 'vue'

import type { RecipeNode } from '@/logistics/graph-node'
import type { Building, ItemOption } from '@/types/data'
import type { Floor, Material } from '@/types/factory'

export interface FloorFormData {
  index: number
  name: string | undefined
  item: ItemOption | undefined
  originalName: string | undefined
  originalItem: ItemOption | undefined
}

export interface UseFloorManagement {
  showFloorEditor: Ref<boolean>
  editFloorIndex: Ref<number | null>
  openFloorEditor: (floorIndex?: number) => void
  closeFloorEditor: () => void
  getFloorDisplayName: (floorIndex: number, floor: Floor) => string
  currentFactoryFloors: ComputedRef<
    Array<{
      index: number
      floor: Floor
      displayName: string
      recipeCount: number
    }>
  >
  getEligibleFloors: (currentFloorIndex: number) => Array<{
    value: number
    title: string
    disabled: boolean
  }>
  updateFloorName: (floorIndex: number, name: string | undefined) => void
  updateFloorIcon: (floorIndex: number, iconItem: string | undefined) => void
  updateFloors: (
    updates: Array<{ index: number; name?: string | undefined; iconItem?: string | undefined }>,
  ) => void
  moveRecipe: (recipeName: string, fromFloorIndex: number, toFloorIndex: number) => void
  getFloorFormsTemplate: () => FloorFormData[]
  hasFloorFormChanges: (forms: FloorFormData[]) => boolean
  updateFloorsFromForms: (floors: FloorFormData[]) => void
}

export interface UseRecipeStatus {
  isRecipeComplete: (recipe: RecipeNode) => boolean
  setRecipeBuilt: (recipeName: string, built: boolean) => void
  isLinkBuilt: (link: Material) => boolean
  setLinkBuilt: (link: Material, built: boolean) => void
  getRecipePanelValue: (recipe: RecipeNode) => string
  leftoverProductsAsLinks: (recipe: RecipeNode) => Material[]
}

export interface UseFloorNavigation {
  expandedFloors: Ref<number[]>
  expandFloor: (floorIndex: number) => void
  collapseFloor: (floorIndex: number) => void
  setRecipeExpansionFromCompletion: (
    affectsCompleted: boolean | null,
    shouldExpand: boolean,
    isRecipeComplete: (recipe: RecipeNode) => boolean,
  ) => void
  toggleFloor: (floorIndex: number) => void
  navigateToElement: (elementId: string) => void
  initializeExpansion: (isRecipeComplete: (recipe: RecipeNode) => boolean) => void
  navigateToRecipe: (recipe: RecipeNode) => void
}

export interface UseFloorNavigationHelpers {
  formatFloorId: (floorIndex: number) => string
  formatRecipeId: (floorIndex: number, recipeName: string) => string
}

export interface UseDataSearch {
  searchInput: Ref<string>
  filteredItems: ComputedRef<ItemOption[]>
  updateSearch: (value: string) => void
}

export interface UseSelection {
  selectedSet: ComputedRef<Set<string>>
  allSelected: ComputedRef<boolean>
  someSelected: ComputedRef<boolean>
  toggleAll: () => void
  toggleItem: (key: string) => void
  isSelected: (key: string) => boolean
}

export interface UseTransport {
  isFluidMaterial: ComputedRef<boolean>
  capacities: ComputedRef<number[]>
  transportItems: ComputedRef<Building[]>
  buildingCounts: ComputedRef<number[]>
}
