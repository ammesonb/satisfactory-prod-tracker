import type { RecipeNode } from '@/logistics/graph-node'
import type { ConflictInfo, FactoryStatus } from '@/types/cloudSync'

export interface Recipe {
  name: string
  building: string
  count: number
}

export interface RecipeEntry {
  recipe: string
  building: string
  count: number
  icon: string
}

export interface Material {
  source: string
  sink: string
  material: string
  amount: number
}

/**
 * Represents a physical floor in the factory for organizational purposes.
 *
 * IMPORTANT: Floor position (array index in Factory.floors[]) is INDEPENDENT of recipe batch numbers.
 * - Floor index = organizational position chosen by user
 * - Recipe.batchNumber = logical production tier from graph solver
 *
 * Floors can be inserted, removed, or reordered without affecting batch numbers.
 */
export interface Floor {
  name?: string
  iconItem?: string
  recipes: RecipeNode[]
}

/**
 * Represents a complete factory with multiple floors.
 *
 * NOTE: When importing recipes via addFactory(), floors are initially created based on batch numbers
 * (floor[i] contains recipes with batchNumber === i). However, users can freely reorganize recipes
 * across floors afterward, breaking this alignment. Code should NOT assume floor index === batch number.
 */
export interface Factory {
  name: string
  icon: string
  floors: Floor[]
  recipeLinks: Record<string, boolean>
  syncStatus?: FactoryStatus
  conflict?: ConflictInfo
}

// Error message constants
export const FACTORY_PARSE_ERRORS = {
  MUST_BE_OBJECT: 'Factories must be an object',
  MISSING_ATTRIBUTES: 'Factories must contain attributes: name, icon, floors, and recipeLinks',
  MISSING_NAME_OR_ICON: (name: string) => `Factory "${name}" missing required name or icon`,
  MUST_HAVE_FLOORS_ARRAY: (name: string) => `Factory "${name}" must have floors array`,
  MUST_HAVE_RECIPE_LINKS: (name: string) => `Factory "${name}" must have recipeLinks object`,
  IMPORT_DATA_MUST_BE_OBJECT: 'Import data must be an object',
} as const

export const asFactory = (data: unknown): Factory => {
  const properties = ['name', 'icon', 'floors', 'recipeLinks']
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error(FACTORY_PARSE_ERRORS.MUST_BE_OBJECT)
  }
  if (!properties.every((p) => p in data)) {
    throw new Error(FACTORY_PARSE_ERRORS.MISSING_ATTRIBUTES)
  }
  const factory = data as Factory
  if (typeof factory.name !== 'string' || typeof factory.icon !== 'string') {
    throw new Error(FACTORY_PARSE_ERRORS.MISSING_NAME_OR_ICON(factory.name))
  }

  if (!Array.isArray(factory.floors)) {
    throw new Error(FACTORY_PARSE_ERRORS.MUST_HAVE_FLOORS_ARRAY(factory.name))
  }

  if (!factory.recipeLinks || typeof factory.recipeLinks !== 'object') {
    throw new Error(FACTORY_PARSE_ERRORS.MUST_HAVE_RECIPE_LINKS(factory.name))
  }

  return factory
}

export const parseFactoriesFromJson = (rawData: string): Record<string, Factory> => {
  if (!rawData.trim()) {
    return {}
  }

  const data = JSON.parse(rawData)
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(FACTORY_PARSE_ERRORS.IMPORT_DATA_MUST_BE_OBJECT)
  }

  return Object.entries(data).reduce(
    (factories, [name, factoryData]) => ({
      ...factories,
      [name]: asFactory(factoryData),
    }),
    {} as Record<string, Factory>,
  )
}
