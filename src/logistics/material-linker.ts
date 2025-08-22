import { useDataStore } from '@/stores/data'
import type { Recipe, Material } from '@/types/factory'
import type { RecipeIngredient } from '@/types/data'
import { ZERO_THRESHOLD, isNaturalResource } from './constants'
import type { PreprocessedRecipeData } from './dependency-resolver'

export interface RecipeItem {
  amount: number
  recipe: Recipe
  isResource?: boolean
}

export const selectSources = (request: RecipeIngredient, sources: RecipeItem[]): RecipeItem[] => {
  if (sources.length === 0) {
    return []
  }

  const sufficientSources = sources
    // allow for small amount of error in decimal calculations
    .filter((source) => source.amount + ZERO_THRESHOLD >= request.amount)
    // closest match first, to leave largest available for later requests
    .sort((a, b) => a.amount - b.amount)

  if (sufficientSources.length > 0) {
    return [sufficientSources[0]]
  }

  let quantity = request.amount
  // consume smallest amounts first, to leave as much as possible for later consumers
  sources = sources.sort((a, b) => a.amount - b.amount)
  const usedSources: RecipeItem[] = []
  let sourceIndex = 0
  while (quantity > ZERO_THRESHOLD && sourceIndex < sources.length) {
    const source = sources[sourceIndex]
    quantity -= source.amount
    usedSources.push(source)
    sourceIndex++
  }

  // okay to have a remainder for natural resources
  if (quantity > ZERO_THRESHOLD && !isNaturalResource(request.item)) {
    return []
  }

  return usedSources
}

const handleCircularLinks = (
  ingredient: RecipeIngredient,
  recipe: Recipe,
  amount_needed: number,
  availableCircularLinks: Material[],
): { links: Material[]; remainingAmount: number } => {
  const links: Material[] = []
  let remainingAmount = amount_needed

  const usableCircularLinks = availableCircularLinks.filter(
    (link) => link.sink === recipe.name && link.material === ingredient.item,
  )

  for (const circularLink of usableCircularLinks) {
    const linkAmount = Math.min(circularLink.amount, remainingAmount)
    if (linkAmount > 0) {
      links.push({
        source: circularLink.source,
        sink: recipe.name,
        material: ingredient.item,
        amount: linkAmount,
      })
      remainingAmount -= linkAmount

      if (remainingAmount <= ZERO_THRESHOLD) {
        break
      }
    }
  }

  return { links, remainingAmount }
}

const handleExternalSources = (
  ingredient: RecipeIngredient,
  recipe: Recipe,
  amount_needed: number,
  alreadyProduced: Record<string, RecipeItem[]>,
  usedSources: [RecipeItem, number][],
): Material[] | null => {
  const materialLinks: Material[] = []

  // Check if we do not produce this item
  if (!alreadyProduced[ingredient.item] || alreadyProduced[ingredient.item].length === 0) {
    // Natural resource can be mined, otherwise it's missing
    if (isNaturalResource(ingredient.item)) {
      materialLinks.push({
        source: ingredient.item,
        sink: recipe.name,
        material: ingredient.item,
        amount: amount_needed,
      })
      return materialLinks
    } else {
      return null // Missing ingredient
    }
  }

  // Check if we have enough available production
  const availableAmount = alreadyProduced[ingredient.item].reduce(
    (acc, item) => acc + item.amount,
    0,
  )
  if (amount_needed - ZERO_THRESHOLD > availableAmount && !isNaturalResource(ingredient.item)) {
    return null // Insufficient production
  }

  // Try to find enough from current production
  const sources = selectSources(
    { amount: amount_needed, item: ingredient.item },
    alreadyProduced[ingredient.item],
  )

  let remainingAmount = amount_needed
  for (const source of sources) {
    const amount = Math.min(source.amount, remainingAmount)
    materialLinks.push({
      source: source.recipe.name,
      sink: recipe.name,
      material: ingredient.item,
      amount,
    })
    remainingAmount -= amount
    // Defer subtracting amount from source until end, since could hit early-exit/unprocessed condition
    // which results in not consuming these resources just yet
    usedSources.push([source, amount])

    if (remainingAmount <= ZERO_THRESHOLD) {
      break
    }
  }

  // If we still need more and it is a natural resource, mine it
  if (remainingAmount > ZERO_THRESHOLD && isNaturalResource(ingredient.item)) {
    materialLinks.push({
      source: ingredient.item,
      sink: recipe.name,
      material: ingredient.item,
      amount: remainingAmount,
    })
  }

  return materialLinks
}

export const processExternalIngredient = (
  ingredient: RecipeIngredient,
  recipe: Recipe,
  amount_needed: number,
  alreadyProduced: Record<string, RecipeItem[]>,
  usedSources: [RecipeItem, number][],
  availableCircularLinks: Material[] = [],
): Material[] | null => {
  const materialLinks: Material[] = []

  // First, handle circular links
  const { links: circularLinks, remainingAmount } = handleCircularLinks(
    ingredient,
    recipe,
    amount_needed,
    availableCircularLinks,
  )

  materialLinks.push(...circularLinks)

  // If fully satisfied by circular links, return early
  if (remainingAmount <= ZERO_THRESHOLD) {
    return materialLinks
  }

  // Handle external sources for remaining amount
  const externalLinks = handleExternalSources(
    ingredient,
    recipe,
    remainingAmount,
    alreadyProduced,
    usedSources,
  )

  if (externalLinks === null) {
    return null // Could not satisfy remaining amount
  }

  materialLinks.push(...externalLinks)
  return materialLinks
}

export const createMaterialLinks = (
  recipe: Recipe,
  alreadyProduced: Record<string, RecipeItem[]>,
  availableCircularLinks: Material[] = [],
  recipeData: Map<string, PreprocessedRecipeData>,
): Material[] => {
  const data = useDataStore()

  // Use preprocessed data
  let ingredients: RecipeIngredient[]

  if (recipeData.has(recipe.name)) {
    const preprocessed = recipeData.get(recipe.name)!
    ingredients = preprocessed.ingredients.map((ing) => ({ ...ing }))
  } else {
    // Fallback for recipes not in preprocessed data (shouldn't happen in normal flow)
    ingredients = data.recipeIngredients(recipe.name)
  }

  const materialLinks: Material[] = []
  const usedSources: [RecipeItem, number][] = []

  for (const ingredient of ingredients) {
    // With preprocessing, catalyst is already handled, just use the ingredient amount
    const amount_needed = ingredient.amount * recipe.count

    // Skip if no amount needed
    if (amount_needed <= ZERO_THRESHOLD) {
      continue
    }

    // Handle external ingredient sourcing
    const externalLinks = processExternalIngredient(
      ingredient,
      recipe,
      amount_needed,
      alreadyProduced,
      usedSources,
      availableCircularLinks,
    )

    if (externalLinks === null) {
      return [] // Could not satisfy this ingredient
    }

    materialLinks.push(...externalLinks)
  }

  // now that we've confirmed we can produce this ingredient, consume the sources
  for (const [source, amount] of usedSources) {
    source.amount -= amount
  }

  return materialLinks
}
