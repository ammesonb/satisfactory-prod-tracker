import { h } from 'vue'

import type { ErrorBuilder, UserFriendlyError } from '@/types/errors'

export class RecipeFormatError extends Error implements UserFriendlyError {
  constructor(public recipeString: string) {
    super(`Invalid recipe format: "${recipeString}"`)
    this.name = 'RecipeFormatError'
  }

  showError(errorStore: { error(): ErrorBuilder }) {
    errorStore
      .error()
      .title('Invalid recipe format')
      .body(() =>
        h('div', [
          h('p', { class: 'mb-3' }, `Recipe "${this.recipeString}" is not in the correct format.`),
          h('p', { class: 'mb-2' }, 'Expected format:'),
          h(
            'v-card',
            {
              class: 'pa-3',
              color: 'surface',
              variant: 'tonal',
            },
            [h('code', { class: 'text-body-2' }, `"recipe_name@efficiency#building": "count"`)],
          ),
        ]),
      )
      .show()
  }
}

export class InvalidBuildingError extends Error implements UserFriendlyError {
  constructor(public buildingName: string) {
    super(`Invalid building name: "${buildingName}"`)
    this.name = 'InvalidBuildingError'
  }

  showError(errorStore: { error(): ErrorBuilder }) {
    errorStore
      .error()
      .title('Invalid building')
      .body(() =>
        h('div', [
          h(
            'p',
            { class: 'mb-3' },
            `Building "${this.buildingName}" does not exist in the game data.`,
          ),
          h(
            'v-alert',
            {
              type: 'info',
              variant: 'tonal',
              class: 'mb-0',
            },
            [
              h(
                'p',
                { class: 'mb-0' },
                'Check your spelling or verify the building name exists in Satisfactory.',
              ),
            ],
          ),
        ]),
      )
      .show()
  }
}

export class InvalidRecipeError extends Error implements UserFriendlyError {
  constructor(public recipeName: string) {
    super(`Invalid recipe name: "${recipeName}"`)
    this.name = 'InvalidRecipeError'
  }

  showError(errorStore: { error(): ErrorBuilder }) {
    errorStore
      .error()
      .title('Invalid recipe')
      .body(() =>
        h('div', [
          h('p', { class: 'mb-3' }, `Recipe "${this.recipeName}" does not exist in the game data.`),
          h(
            'v-alert',
            {
              type: 'info',
              variant: 'tonal',
              class: 'mb-0',
            },
            [
              h(
                'p',
                { class: 'mb-0' },
                'Check your spelling or verify the recipe name exists in Satisfactory.',
              ),
            ],
          ),
        ]),
      )
      .show()
  }
}
