export interface Item {
  name: string
  icon: string
}

export interface Building {
  name: string
  icon: string
}

export interface RecipeData {
  name: string
  ingredients: { item: string; amount: number }[]
  products: { item: string; amount: number }[]
}
