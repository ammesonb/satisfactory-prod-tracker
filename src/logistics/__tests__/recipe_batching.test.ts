import { describe, it, expect, vi, beforeEach } from 'vitest'
import { findCircularRecipes } from '../recipe_import'
import type { Recipe } from '@/types/factory'
import { setupMockDataStore } from './recipe-fixtures'

vi.mock('@/stores/data')

describe('findCircularRecipes', () => {
  beforeEach(() => {
    setupMockDataStore()
  })

  it('should detect self-referential catalyst recipes', () => {
    const recipes: Recipe[] = [
      { name: 'Recipe_AluminaSolution_C', building: 'Desc_Refinery_C', count: 1 },
      { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 1 },
    ]

    const result = findCircularRecipes(recipes)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Recipe_AluminaSolution_C')
  })

  it('should detect mutual circular dependencies', () => {
    const recipes: Recipe[] = [
      { name: 'Recipe_RecycledRubber_C', building: 'Desc_OilRefinery_C', count: 1 },
      { name: 'Recipe_RecycledPlastic_C', building: 'Desc_OilRefinery_C', count: 1 },
    ]

    const result = findCircularRecipes(recipes)

    expect(result).toHaveLength(2)
    expect(result.map((r) => r.name)).toEqual(
      expect.arrayContaining(['Recipe_RecycledRubber_C', 'Recipe_RecycledPlastic_C']),
    )
  })

  it('should not detect non-circular dependencies', () => {
    const recipes: Recipe[] = [
      { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 1 },
      { name: 'Recipe_IronPlate_C', building: 'Desc_ConstructorMk1_C', count: 1 },
    ]

    const result = findCircularRecipes(recipes)

    expect(result).toHaveLength(0)
  })

  it('should handle empty recipe list', () => {
    const result = findCircularRecipes([])
    expect(result).toEqual([])
  })

  it('should handle recipes with missing data gracefully', () => {
    const recipes: Recipe[] = [{ name: 'Recipe_Unknown_C', building: 'Desc_Unknown_C', count: 1 }]

    const result = findCircularRecipes(recipes)
    expect(result).toEqual([])
  })
})
