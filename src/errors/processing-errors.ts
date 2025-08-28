import type { ErrorBuilder, UserFriendlyError } from '@/types/errors'
import { h } from 'vue'

export class RecipeChainError extends Error implements UserFriendlyError {
  constructor(
    public unprocessedRecipes: string[],
    public missingDependencies: Record<string, string[]>,
  ) {
    super(`Unable to process ${unprocessedRecipes.length} recipes due to missing dependencies`)
    this.name = 'RecipeChainError'
  }

  showError(errorStore: { error(): ErrorBuilder }) {
    const dependencyItems = Object.entries(this.missingDependencies).map(([recipe, deps]) =>
      h(
        'v-list-item',
        {
          key: recipe,
          class: 'px-0',
        },
        [h('v-list-item-title', recipe), h('v-list-item-subtitle', `Missing: ${deps.join(', ')}`)],
      ),
    )

    errorStore
      .error()
      .title('Recipe chain error')
      .body(() =>
        h('div', [
          h(
            'p',
            { class: 'mb-3' },
            `Could not resolve dependencies for ${this.unprocessedRecipes.length} recipes:`,
          ),
          h(
            'v-list',
            {
              class: 'bg-grey-lighten-5 rounded',
              density: 'compact',
            },
            dependencyItems,
          ),
        ]),
      )
      .show()
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

  showError(errorStore: { error(): ErrorBuilder }) {
    errorStore
      .error()
      .title('Recipe processing error')
      .body(() =>
        h('div', [
          h(
            'p',
            { class: 'mb-3' },
            `Recipe "${this.sourceRecipe}" was expected to produce "${this.material}" but could not be found.`,
          ),
          h(
            'v-alert',
            {
              type: 'warning',
              variant: 'tonal',
              class: 'mb-0',
            },
            [
              h(
                'p',
                { class: 'mb-0' },
                'This indicates a problem with the recipe chain calculation.',
              ),
            ],
          ),
        ]),
      )
      .show()
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

  showError(errorStore: { error(): ErrorBuilder }) {
    errorStore
      .error()
      .title('Recipe processing error')
      .body(() =>
        h('div', [
          h(
            'p',
            { class: 'mb-3' },
            `Recipe "${this.sourceRecipe}" was expected to produce "${this.material}" but that product was not found in its outputs.`,
          ),
          h(
            'v-alert',
            {
              type: 'error',
              variant: 'tonal',
              class: 'mb-0',
            },
            [h('p', { class: 'mb-0' }, 'This indicates a data inconsistency.')],
          ),
        ]),
      )
      .show()
  }
}
