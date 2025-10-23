import type { Ref, VNode } from 'vue'

import type { RecipeNode } from '@/logistics/graph-node'
import type { Building, Item, Recipe, RecipeIngredient, RecipeProduct } from '@/types/data'
import type { GoogleDriveFile } from '@/types/cloudSync'
import type { ErrorBuilder } from '@/types/errors'
import type { Factory } from '@/types/factory'

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
  getFloorIndexForRecipe: (recipe: RecipeNode) => number
  getRecipeByName: (recipeName: string) => RecipeNode | null
  exportFactories: (factoryNames?: string[]) => Record<string, Factory>
  importFactories: (factories: Record<string, Factory>) => void
}

/**
 * Theme Store Interface
 * Manages application theme state
 */
export interface IThemeStore {
  // State - Pinia with persistence can expose this as boolean or Ref depending on context
  isDark: boolean | Ref<boolean>

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

  // Getters
  icon: string
  color: string

  // Actions
  createBuilder: (level: 'error' | 'warning' | 'info') => ErrorBuilder
  error: () => ErrorBuilder
  warning: () => ErrorBuilder
  info: () => ErrorBuilder
  hide: () => void
}

/**
 * Cloud Sync Store Interface
 * Manages Google Drive sync state and operations
 */
export interface ICloudSyncStore {
  // State
  accessToken: string | null
  tokenExpiry: number | null
  instanceId: string
  displayId?: string
  autoSync: {
    enabled: boolean
    namespace: string
    selectedFactories: string[]
  }
  autoSyncSuspended: boolean
  finalGlobalError: { message: string; timestamp: string } | null

  // Getters
  isAuthenticated: boolean
  isConfigured: boolean
  isFactoryAutoSynced: (factoryName: string) => boolean

  // Actions
  authenticate: () => Promise<void>
  refreshToken: () => Promise<void>
  signOut: () => void
  enableAutoSync: (namespace: string, factories: string[]) => void
  disableAutoSync: () => void
  changeNamespace: (newNamespace: string) => Promise<void>
  addFactoryToAutoSync: (factoryName: string) => void
  removeFactoryFromAutoSync: (factoryName: string) => void
  backupFactory: (namespace: string, factoryName: string) => Promise<void>
  restoreFactory: (namespace: string, filename: string, importAlias?: string) => Promise<void>
  listBackups: (namespace?: string) => Promise<GoogleDriveFile[]>
  deleteBackup: (namespace: string, filename: string) => Promise<void>
  performAutoSave: () => Promise<void>
  checkForConflicts: () => Promise<void>
  resolveConflict: (factoryName: string, resolution: 'cloud' | 'local') => Promise<void>
  setGlobalError: (message: string) => void
  clearGlobalError: () => void
  suspendAutoSync: () => void
  resumeAutoSync: () => void
  setDisplayId: (displayId: string) => void
}
