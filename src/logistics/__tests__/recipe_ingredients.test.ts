import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setupMockDataStore } from './recipe-fixtures'
import { processExternalIngredient } from '../material-linker'
import type { Recipe } from '@/types/factory'
import type { RecipeIngredient } from '@/types/data'

vi.mock('@/stores/data')

interface RecipeItem {
  amount: number
  recipe: Recipe
  isResource?: boolean
}

describe('recipe ingredient processing', () => {
  beforeEach(() => {
    setupMockDataStore()
  })

  describe('external ingredient sourcing', () => {
    it('should handle natural resources when no production available', () => {
      const ingredient: RecipeIngredient = { item: 'Desc_OreIron_C', amount: 1 }
      const recipe: Recipe = { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 3 }
      const alreadyProduced: Record<string, RecipeItem[]> = {}
      const usedSources: [RecipeItem, number][] = []

      // Simulate the external ingredient processing
      const result = processExternalIngredient(ingredient, recipe, 3, alreadyProduced, usedSources)

      expect(result).toHaveLength(1)
      expect(result![0]).toEqual({
        source: 'Desc_OreIron_C',
        sink: 'Recipe_IronIngot_C',
        material: 'Desc_OreIron_C',
        amount: 3,
      })
    })

    it('should return null for missing non-natural ingredients', () => {
      const ingredient: RecipeIngredient = { item: 'Desc_Wire_C', amount: 2 }
      const recipe: Recipe = { name: 'Recipe_Cable_C', building: 'Desc_ConstructorMk1_C', count: 1 }
      const alreadyProduced: Record<string, RecipeItem[]> = {}
      const usedSources: [RecipeItem, number][] = []

      const result = processExternalIngredient(ingredient, recipe, 2, alreadyProduced, usedSources)

      expect(result).toBeNull()
    })

    it('should return null when insufficient production available', () => {
      const ingredient: RecipeIngredient = { item: 'Desc_IronIngot_C', amount: 3 }
      const recipe: Recipe = {
        name: 'Recipe_IronPlate_C',
        building: 'Desc_ConstructorMk1_C',
        count: 2,
      }
      const sourceRecipe: Recipe = {
        name: 'Recipe_IronIngot_C',
        building: 'Desc_SmelterMk1_C',
        count: 1,
      }
      const alreadyProduced: Record<string, RecipeItem[]> = {
        Desc_IronIngot_C: [{ amount: 1, recipe: sourceRecipe, isResource: false }], // Only 1 available, need 6
      }
      const usedSources: [RecipeItem, number][] = []

      const result = processExternalIngredient(ingredient, recipe, 6, alreadyProduced, usedSources)

      expect(result).toBeNull()
    })

    it('should successfully source from available production', () => {
      const ingredient: RecipeIngredient = { item: 'Desc_IronIngot_C', amount: 3 }
      const recipe: Recipe = {
        name: 'Recipe_IronPlate_C',
        building: 'Desc_ConstructorMk1_C',
        count: 1,
      }
      const sourceRecipe: Recipe = {
        name: 'Recipe_IronIngot_C',
        building: 'Desc_SmelterMk1_C',
        count: 3,
      }
      const alreadyProduced: Record<string, RecipeItem[]> = {
        Desc_IronIngot_C: [{ amount: 3, recipe: sourceRecipe, isResource: false }],
      }
      const usedSources: [RecipeItem, number][] = []

      const result = processExternalIngredient(ingredient, recipe, 3, alreadyProduced, usedSources)

      expect(result).toHaveLength(1)
      expect(result![0]).toEqual({
        source: 'Recipe_IronIngot_C',
        sink: 'Recipe_IronPlate_C',
        material: 'Desc_IronIngot_C',
        amount: 3,
      })
      expect(usedSources).toHaveLength(1)
      expect(usedSources[0][1]).toBe(3) // Amount used
    })
  })
})
