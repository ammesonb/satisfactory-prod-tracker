import { getStores } from '@/composables/useStores'
import { ZERO_THRESHOLD } from '@/logistics/constants'
import { linkToString, type RecipeNode } from '@/logistics/graph-node'
import type { Material } from '@/types/factory'

export function useRecipeStatus() {
  const { factoryStore } = getStores()

  const isRecipeComplete = (recipe: RecipeNode) => {
    if (!factoryStore.currentFactory || !recipe.built) return false

    const checkLinks = (links: Material[]) => {
      return links.every((link) => !!factoryStore.currentFactory?.recipeLinks[linkToString(link)])
    }

    return (
      checkLinks(recipe.inputs) &&
      checkLinks(recipe.outputs) &&
      checkLinks(leftoverProductsAsLinks(recipe))
    )
  }

  const setRecipeBuilt = (recipeName: string, built: boolean) => {
    const recipe = factoryStore.getRecipeByName(recipeName)
    if (recipe) recipe.built = built
  }

  const isLinkBuilt = (link: Material) => {
    return !!factoryStore.currentFactory?.recipeLinks[linkToString(link)]
  }

  const setLinkBuilt = (link: Material, built: boolean) => {
    factoryStore.setLinkBuiltState(linkToString(link), built)
  }

  /**
   * Get a unique identifier for a recipe panel in the expansion panels.
   *
   * NOTE: Recipe names are unique within a factory, so we don't need batchNumber anymore.
   * This decouples panel values from batch numbers, allowing flexible floor organization.
   */
  const getRecipePanelValue = (recipe: RecipeNode) => {
    return recipe.recipe.name
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
    isLinkBuilt,
    setLinkBuilt,
    getRecipePanelValue,
    leftoverProductsAsLinks,
  }
}
