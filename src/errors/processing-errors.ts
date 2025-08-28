import type { UserFriendlyError } from './friendly-error'

export class RecipeChainError extends Error implements UserFriendlyError {
  constructor(
    public unprocessedRecipes: string[],
    public missingDependencies: Record<string, string[]>,
  ) {
    super(`Unable to process ${unprocessedRecipes.length} recipes due to missing dependencies`)
    this.name = 'RecipeChainError'
  }

  toErrorMessage() {
    const details = Object.entries(this.missingDependencies)
      .map(([recipe, deps]) => `${recipe}: missing ${deps.join(', ')}`)
      .join('\n')
    return {
      summary: 'Recipe chain error',
      details: `Could not resolve dependencies for ${this.unprocessedRecipes.length} recipes:\n${details}`,
    }
  }
}

export class SourceNodeNotFoundError extends Error implements UserFriendlyError {
  constructor(
    public sourceRecipe: string,
    public material: string,
    public availableRecipes: string[],
  ) {
    super(`Source node not found: ${sourceRecipe} for material ${material}`)
    this.name = 'SourceNodeNotFoundError'
  }

  toErrorMessage() {
    return {
      summary: 'Recipe processing error',
      details: `Recipe "${this.sourceRecipe}" was expected to produce "${this.material}" but could not be found. This indicates a problem with the recipe chain calculation.`,
    }
  }
}

export class ProductNotFoundError extends Error implements UserFriendlyError {
  constructor(
    public material: string,
    public sourceRecipe: string,
  ) {
    super(`Unable to find product ${material} in source ${sourceRecipe}`)
    this.name = 'ProductNotFoundError'
  }

  toErrorMessage() {
    return {
      summary: 'Recipe processing error',
      details: `Recipe "${this.sourceRecipe}" was expected to produce "${this.material}" but that product was not found in its outputs. This indicates a data inconsistency.`,
    }
  }
}
