import type { VNode } from 'vue'
import type { Item, Recipe, Building, RecipeIngredient, RecipeProduct } from '@/types/data'
import type { Factory } from '@/types/factory'
import type { RecipeNode } from '@/logistics/graph-node'
import type { ErrorBuilder } from '@/types/errors'

/**
 * Data Store Interface
 * Manages game data including items, recipes, and buildings
 */
export interface IDataStore {
  // State
  items: Record<string, Item>
  recipes: Record<string, Recipe>
  buildings: Record<string, Building>

  // Getters
  getItemDisplayName: (itemName: string) => string
  getRecipeDisplayName: (recipeName: string) => string
  getBuildingDisplayName: (buildingName: string) => string
  getRecipeProductionBuildings: (recipeName: string) => string[]

  // Actions
  addRecipe: (recipe: Recipe) => void
  addItem: (item: Item) => void
  addBuilding: (building: Building) => void
  recipeIngredients: (recipeName: string) => RecipeIngredient[]
  recipeProducts: (recipeName: string) => RecipeProduct[]
  getIcon: (objectName: string) => string
  loadData: () => void
}

/**
 * Factory Store Interface
 * Manages factory data, floors, and production chains
 */
export interface IFactoryStore {
  // State
  selected: string
  factories: Record<string, Factory>

  // Getters
  hasFactories: boolean
  currentFactory: Factory | null
  factoryList: Factory[]

  // Actions
  setSelectedFactory: (factoryName: string) => void
  addFactory: (name: string, icon: string, recipes: string, externalInputs: RecipeProduct[]) => void
  removeFactory: (name: string) => void
  setLinkBuiltState: (linkId: string, built: boolean) => void
  getRecipeByName: (recipeName: string) => RecipeNode | null
  exportFactories: (factoryNames?: string[]) => Record<string, Factory>
  importFactories: (factories: Record<string, Factory>) => void
}

/**
 * Theme Store Interface
 * Manages application theme state
 */
export interface IThemeStore {
  // State - Pinia exposes this as a computed value, not a Ref
  isDark: boolean

  // Actions
  toggleTheme: () => void
  setTheme: (dark: boolean) => void
}

/**
 * Error Store Interface
 * Manages error display and modal state
 */
export interface IErrorStore {
  // State
  show: boolean
  level: 'error' | 'warning' | 'info'
  summary: string
  bodyContent: VNode | (() => VNode) | null

  // Actions
  createBuilder: (level: 'error' | 'warning' | 'info') => ErrorBuilder
  error: () => ErrorBuilder
  warning: () => ErrorBuilder
  info: () => ErrorBuilder
  hide: () => void
}
