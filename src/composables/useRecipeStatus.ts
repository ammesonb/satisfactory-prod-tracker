import { getStores } from '@/composables/useStores'
import { ZERO_THRESHOLD } from '@/logistics/constants'
import { linkToString, type RecipeNode } from '@/logistics/graph-node'
import type { Material } from '@/types/factory'

export function useRecipeStatus() {
  const { factoryStore } = getStores()

  const isRecipeComplete = (recipe: RecipeNode) => {
    if (!factoryStore.currentFactory || !recipe.built) return false

    return [...recipe.inputs, ...recipe.outputs].every(
      (link) => !!factoryStore.currentFactory?.recipeLinks[linkToString(link)],
    )
  }

  const setRecipeBuilt = (recipeName: string, built: boolean) => {
    const recipe = factoryStore.getRecipeByName(recipeName)
    if (recipe) recipe.built = built
  }

  const setLinkBuilt = (linkId: string, built: boolean) => {
    factoryStore.setLinkBuiltState(linkId, built)
  }

  const getRecipePanelValue = (recipe: RecipeNode) => {
    return `${recipe.batchNumber}-${recipe.recipe.name}`
  }

  const leftoverProductsAsLinks = (recipe: RecipeNode): Material[] =>
    recipe.availableProducts
      .filter((p) => p.amount > ZERO_THRESHOLD)
      .map((p) => ({
        source: recipe.recipe.name,
        sink: '',
        material: p.item,
        amount: p.amount,
      }))

  return {
    isRecipeComplete,
    setRecipeBuilt,
    setLinkBuilt,
    getRecipePanelValue,
    leftoverProductsAsLinks,
  }
}
