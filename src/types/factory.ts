import type { RecipeNode } from '@/logistics/graph-node'

export interface Recipe {
  name: string
  building: string
  count: number
}

export interface Material {
  source: string
  sink: string
  material: string
  amount: number
}

export interface Floor {
  name?: string
  icon?: string
  recipes: RecipeNode[]
}

export interface Factory {
  name: string
  icon: string
  floors: Floor[]
  recipeLinks: Record<string, boolean>
}

export const asFactory = (data: unknown): Factory => {
  const properties = ['name', 'icon', 'floors', 'recipeLinks']
  if (typeof data !== 'object' || data === null) {
    throw new Error('Factories must be an object')
  }
  if (!properties.every((p) => p in data)) {
    throw new Error('Factories must contain attributes: name, icon, floors, and recipeLinks')
  }
  const factory = data as Factory
  if (typeof factory.name !== 'string' || typeof factory.icon !== 'string') {
    throw new Error(`Factory "${factory.name}" missing required name or icon`)
  }

  if (!Array.isArray(factory.floors)) {
    throw new Error(`Factory "${factory.name}" must have floors array`)
  }

  if (!factory.recipeLinks || typeof factory.recipeLinks !== 'object') {
    throw new Error(`Factory "${factory.name}" must have recipeLinks object`)
  }

  return factory
}
