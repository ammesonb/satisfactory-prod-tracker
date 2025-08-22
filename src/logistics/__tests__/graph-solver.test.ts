import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  newRecipeNode,
  getCatalystQuantity,
  selectIngredientSources,
  getRecipeLinks,
  produceRecipe,
  decrementConsumedProducts,
} from '../graph-solver'
import { setupMockDataStore, recipeDatabase } from './recipe-fixtures'
import type { Recipe } from '@/types/factory'
import type { RecipeIngredient, RecipeProduct } from '@/types/data'

vi.mock('@/stores/data')

describe('graph-solver unit tests', () => {
  beforeEach(() => {
    setupMockDataStore()
  })



})
