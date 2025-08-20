import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resolveCircularDependencies } from '../dependency-resolver'
import { setupMockDataStore } from './recipe-fixtures'
import type { Recipe } from '@/types/factory'

vi.mock('@/stores/data')

describe('resolveCircularDependencies', () => {
  beforeEach(() => {
    setupMockDataStore()
  })

  it('should create links for plastic/rubber codependent recipes', () => {
    const circularRecipes: Recipe[] = [
      { name: 'Recipe_Alternate_RecycledRubber_C', building: 'Desc_OilRefinery_C', count: 1.7037 },
      { name: 'Recipe_Alternate_Plastic_1_C', building: 'Desc_OilRefinery_C', count: 1.85185 },
    ]

    const result = resolveCircularDependencies(circularRecipes)

    // Should create two circular links - one for plastic and one for rubber
    expect(result).toHaveLength(2)

    // Link for plastic: RecycledRubber needs 30 plastic, Plastic produces 60 plastic
    const plasticLink = result.find(
      (link) =>
        link.source === 'Recipe_Alternate_Plastic_1_C' &&
        link.sink === 'Recipe_Alternate_RecycledRubber_C' &&
        link.name === 'Desc_Plastic_C',
    )
    expect(plasticLink).toBeDefined()
    expect(plasticLink!.amount).toBeCloseTo(30 * 1.7037, 3) // 51.111

    // Link for rubber: Plastic needs 30 rubber, RecycledRubber produces 60 rubber
    const rubberLink = result.find(
      (link) =>
        link.source === 'Recipe_Alternate_RecycledRubber_C' &&
        link.sink === 'Recipe_Alternate_Plastic_1_C' &&
        link.name === 'Desc_Rubber_C',
    )
    expect(rubberLink).toBeDefined()
    expect(rubberLink!.amount).toBeCloseTo(30 * 1.85185, 3) // 55.555
  })

  it('should handle catalyst recipes (self-referential)', () => {
    const circularRecipes: Recipe[] = [
      { name: 'Recipe_Fake_AluminaSolution_C', building: 'Desc_Refinery_C', count: 1 },
    ]

    const result = resolveCircularDependencies(circularRecipes)

    // Should create one self-referential link
    expect(result).toHaveLength(1)

    const selfLink = result[0]
    expect(selfLink.source).toBe('Recipe_Fake_AluminaSolution_C')
    expect(selfLink.sink).toBe('Recipe_Fake_AluminaSolution_C')
    expect(selfLink.name).toBe('Desc_AluminaSolution_C')
    expect(selfLink.amount).toBe(60) // min(120 needed, 60 produced)
  })

  it('should handle empty recipe list', () => {
    const result = resolveCircularDependencies([])
    expect(result).toEqual([])
  })

  it('should handle recipes with no circular dependencies', () => {
    const circularRecipes: Recipe[] = [
      { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 1 },
    ]

    const result = resolveCircularDependencies(circularRecipes)
    expect(result).toEqual([])
  })

  it('should limit link amounts to minimum of needed vs available', () => {
    // Test with unbalanced production where one recipe needs more than the other can provide
    const circularRecipes: Recipe[] = [
      { name: 'Recipe_Alternate_RecycledRubber_C', building: 'Desc_OilRefinery_C', count: 3 }, // needs 90 plastic
      { name: 'Recipe_Alternate_Plastic_1_C', building: 'Desc_OilRefinery_C', count: 1 }, // produces 60 plastic
    ]

    const result = resolveCircularDependencies(circularRecipes)

    const plasticLink = result.find((link) => link.name === 'Desc_Plastic_C')
    expect(plasticLink!.amount).toBe(60) // Limited by available, not needed
  })
})
