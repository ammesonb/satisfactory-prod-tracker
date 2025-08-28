import type { UserFriendlyError } from './friendly-error'

export class RecipeFormatError extends Error implements UserFriendlyError {
  constructor(public recipeString: string) {
    super(`Invalid recipe format: "${recipeString}"`)
    this.name = 'RecipeFormatError'
  }

  toErrorMessage() {
    return {
      summary: 'Invalid recipe format',
      details: `Recipe "${this.recipeString}" is not in the correct format. Expected: recipe_name@efficiency#building: "count"`,
    }
  }
}

export class InvalidBuildingError extends Error implements UserFriendlyError {
  constructor(public buildingName: string) {
    super(`Invalid building name: "${buildingName}"`)
    this.name = 'InvalidBuildingError'
  }

  toErrorMessage() {
    return {
      summary: 'Invalid building',
      details: `Building "${this.buildingName}" does not exist in the game data.`,
    }
  }
}

export class InvalidRecipeError extends Error implements UserFriendlyError {
  constructor(public recipeName: string) {
    super(`Invalid recipe name: "${recipeName}"`)
    this.name = 'InvalidRecipeError'
  }

  toErrorMessage() {
    return {
      summary: 'Invalid recipe',
      details: `Recipe "${this.recipeName}" does not exist in the game data.`,
    }
  }
}
