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
  name: string
  recipes: Recipe[]
  materials: Material[]
}

export interface Factory {
  name: string
  floors: Floor[]
}
