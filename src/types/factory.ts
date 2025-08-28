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
  recipes: RecipeNode[]
}

export interface Factory {
  name: string
  icon: string
  floors: Floor[]
}
