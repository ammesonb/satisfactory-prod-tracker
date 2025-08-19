import { useDataStore } from '@/stores/data'
import type { Recipe, Material } from '@/types/factory'
import type { RecipeIngredient } from '@/types/data'

export interface PreprocessedRecipeData {
  recipe: Recipe
  ingredients: RecipeIngredient[]
  products: RecipeIngredient[]
}

export interface PendingCatalystLink {
  recipeName: string
  item: string
  amount: number
}

export const preprocessCatalystRecipes = (
  recipes: Recipe[],
): {
  recipeData: Map<string, PreprocessedRecipeData>
  pendingCatalystLinks: PendingCatalystLink[]
} => {
  const data = useDataStore()
  const recipeData = new Map<string, PreprocessedRecipeData>()
  const pendingCatalystLinks: PendingCatalystLink[] = []

  for (const recipe of recipes) {
    const ingredients = data.recipeIngredients(recipe.name).map((ing) => ({ ...ing }))
    const products = data.recipeProducts(recipe.name).map((prod) => ({ ...prod }))

    // Check for self-referential catalyst items
    for (const ingredient of ingredients) {
      const matchingProduct = products.find((prod) => prod.item === ingredient.item)
      if (matchingProduct) {
        // Calculate the self-referential amount (lesser of consumption vs production per recipe)
        const catalystAmount = Math.min(ingredient.amount, matchingProduct.amount)

        if (catalystAmount > 0) {
          // Create pending catalyst link for the total amount across all recipe instances
          pendingCatalystLinks.push({
            recipeName: recipe.name,
            item: ingredient.item,
            amount: catalystAmount * recipe.count,
          })

          // Reduce both ingredient requirement and product output by catalyst amount
          ingredient.amount -= catalystAmount
          matchingProduct.amount -= catalystAmount
        }
      }
    }

    recipeData.set(recipe.name, { recipe, ingredients, products })
  }

  return { recipeData, pendingCatalystLinks }
}

export const findCircularRecipes = (recipes: Recipe[]): Recipe[] => {
  const data = useDataStore()

  return recipes.filter((recipe) => {
    const ingredients = data.recipeIngredients(recipe.name)
    const products = data.recipeProducts(recipe.name)

    // Check if this recipe has a true circular dependency:
    // 1. It consumes an item that it also produces (catalyst recipe), OR
    // 2. It's part of a mutual dependency cycle with other remaining recipes
    return (
      // Self-referential (catalyst)
      ingredients.some((ingredient) =>
        products.some((product) => product.item === ingredient.item),
      ) ||
      // Mutual dependency: this recipe needs something from another recipe that needs something from this recipe
      recipes.some((otherRecipe) => {
        if (otherRecipe === recipe) return false
        const otherIngredients = data.recipeIngredients(otherRecipe.name)
        const otherProducts = data.recipeProducts(otherRecipe.name)

        // Check if there's a cycle: A needs B's product AND B needs A's product
        const thisNeedsOther = ingredients.some((ingredient) =>
          otherProducts.some((product) => product.item === ingredient.item),
        )
        const otherNeedsThis = otherIngredients.some((ingredient) =>
          products.some((product) => product.item === ingredient.item),
        )

        return thisNeedsOther && otherNeedsThis
      })
    )
  })
}

export const resolveCircularDependencies = (circularRecipes: Recipe[]): Material[] => {
  const data = useDataStore()
  const circularLinks: Material[] = []

  // Create copies of recipe data that we can modify
  const modifiedRecipeData = new Map<
    string,
    {
      ingredients: RecipeIngredient[]
      products: RecipeIngredient[]
    }
  >()

  // Initialize with copies of original data
  circularRecipes.forEach((recipe) => {
    modifiedRecipeData.set(recipe.name, {
      ingredients: data.recipeIngredients(recipe.name).map((ing) => ({ ...ing })),
      products: data.recipeProducts(recipe.name).map((prod) => ({ ...prod })),
    })
  })

  // Find circular links and modify recipe data
  for (const recipe of circularRecipes) {
    const recipeData = modifiedRecipeData.get(recipe.name)!

    for (const ingredient of recipeData.ingredients) {
      // Check for self-referential catalyst first
      const selfProduct = recipeData.products.find((p) => p.item === ingredient.item)
      if (selfProduct) {
        const neededAmount = ingredient.amount * recipe.count
        const availableAmount = selfProduct.amount * recipe.count
        const linkAmount = Math.min(neededAmount, availableAmount)

        if (linkAmount > 0) {
          // Create the self-referential link
          circularLinks.push({
            source: recipe.name,
            sink: recipe.name,
            name: ingredient.item,
            amount: linkAmount,
          })

          // Reduce both ingredient requirement and product output
          ingredient.amount -= linkAmount / recipe.count
          selfProduct.amount -= linkAmount / recipe.count
        }
      }

      // Then check for dependencies between different recipes
      for (const otherRecipe of circularRecipes) {
        if (otherRecipe === recipe) continue

        const otherRecipeData = modifiedRecipeData.get(otherRecipe.name)!
        const matchingProduct = otherRecipeData.products.find((p) => p.item === ingredient.item)

        if (matchingProduct) {
          const neededAmount = ingredient.amount * recipe.count
          const availableAmount = matchingProduct.amount * otherRecipe.count
          const linkAmount = Math.min(neededAmount, availableAmount)

          if (linkAmount > 0) {
            // Create the circular link
            circularLinks.push({
              source: otherRecipe.name,
              sink: recipe.name,
              name: ingredient.item,
              amount: linkAmount,
            })

            // Reduce ingredient requirement for consuming recipe
            ingredient.amount -= linkAmount / recipe.count

            // Reduce product output for producing recipe
            matchingProduct.amount -= linkAmount / otherRecipe.count
          }
        }
      }
    }
  }

  return circularLinks
}
