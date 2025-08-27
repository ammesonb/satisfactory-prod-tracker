import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  findCircularRecipes,
  groupCircularRecipes,
  resolveCircularDependencies,
} from '../dependency-resolver'
import { setupMockDataStore } from './recipe-fixtures'
import { useDataStore } from '@/stores/data'
import type { Recipe } from '@/types/factory'
import { newRecipeNode, type RecipeNode } from '@/logistics/graph-node'

vi.mock('@/stores/data')

describe('findCircularRecipes', () => {
  beforeEach(() => {
    setupMockDataStore()
  })

  it('should detect self-referential catalyst recipes', () => {
    const recipes: Recipe[] = [
      { name: 'Recipe_Fake_AluminaSolution_C', building: 'Desc_Refinery_C', count: 1 },
      { name: 'Recipe_IronIngot_C', building: 'Desc_SmelterMk1_C', count: 1 },
    ]

    const result = findCircularRecipes(recipes)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Recipe_Fake_AluminaSolution_C')
  })

  it('should detect mutual circular dependencies', () => {
    const recipes: Recipe[] = [
      { name: 'Recipe_Fake_RecycledRubber_C', building: 'Desc_OilRefinery_C', count: 1 },
      { name: 'Recipe_Fake_RecycledPlastic_C', building: 'Desc_OilRefinery_C', count: 1 },
    ]

    const result = findCircularRecipes(recipes)

    expect(result).toHaveLength(2)
    expect(result.map((r) => r.name)).toEqual(
      expect.arrayContaining(['Recipe_Fake_RecycledRubber_C', 'Recipe_Fake_RecycledPlastic_C']),
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
        link.material === 'Desc_Plastic_C',
    )
    expect(plasticLink).toBeDefined()
    expect(plasticLink!.amount).toBeCloseTo(30 * 1.7037, 3) // 51.111

    // Link for rubber: Plastic needs 30 rubber, RecycledRubber produces 60 rubber
    const rubberLink = result.find(
      (link) =>
        link.source === 'Recipe_Alternate_RecycledRubber_C' &&
        link.sink === 'Recipe_Alternate_Plastic_1_C' &&
        link.material === 'Desc_Rubber_C',
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
    expect(selfLink.material).toBe('Desc_AluminaSolution_C')
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

    const plasticLink = result.find((link) => link.material === 'Desc_Plastic_C')
    expect(plasticLink!.amount).toBe(60) // Limited by available, not needed
  })
})

describe('group circular recipes', () => {
  beforeEach(() => {
    setupMockDataStore()
  })

  const createRecipeNode = (name: string): RecipeNode => {
    const data = useDataStore()
    return newRecipeNode(
      { name, building: 'Desc_SmelterMk1_C', count: 1 },
      data.recipeIngredients(name),
      data.recipeProducts(name),
    )
  }

  it('returns empty array for non-circular recipes', () => {
    const recipes = [
      createRecipeNode('Recipe_IngotIron_C'),
      createRecipeNode('Recipe_IronPlate_C'),
      createRecipeNode('Recipe_IngotCopper_C'),
      createRecipeNode('Recipe_Wire_C'),
      createRecipeNode('Recipe_Cable_C'),
    ]

    const groups = groupCircularRecipes(recipes)
    expect(groups).toEqual([])
  })

  it('groups self-referential (catalyst) recipes individually', () => {
    const recipes = [
      createRecipeNode('Recipe_Fake_AluminaSolution_C'), // catalyst recipe
      createRecipeNode('Recipe_IngotIron_C'), // non-circular
    ]

    const groups = groupCircularRecipes(recipes)
    expect(groups).toHaveLength(1)
    expect(groups[0]).toHaveLength(1)
    expect(groups[0][0].recipe.name).toBe('Recipe_Fake_AluminaSolution_C')
  })

  it('groups mutually dependent recipes together', () => {
    const recipes = [
      createRecipeNode('Recipe_Alternate_RecycledRubber_C'), // needs plastic, produces rubber
      createRecipeNode('Recipe_Alternate_Plastic_1_C'), // needs rubber, produces plastic
      createRecipeNode('Recipe_IngotIron_C'), // non-circular
    ]

    const groups = groupCircularRecipes(recipes)
    expect(groups).toHaveLength(1)
    expect(groups[0]).toHaveLength(2)

    const groupNames = groups[0].map((r) => r.recipe.name)
    expect(groupNames).toContain('Recipe_Alternate_RecycledRubber_C')
    expect(groupNames).toContain('Recipe_Alternate_Plastic_1_C')
  })

  it('creates separate groups for independent circular dependencies', () => {
    const recipes = [
      createRecipeNode('Recipe_Fake_AluminaSolution_C'), // catalyst recipe (group 1)
      createRecipeNode('Recipe_Alternate_RecycledRubber_C'), // plastic/rubber cycle (group 2)
      createRecipeNode('Recipe_Alternate_Plastic_1_C'), // plastic/rubber cycle (group 2)
    ]

    const groups = groupCircularRecipes(recipes)
    expect(groups).toHaveLength(2)

    // Find the catalyst group (single recipe)
    const catalystGroup = groups.find((g) => g.length === 1)
    expect(catalystGroup).toBeDefined()
    expect(catalystGroup![0].recipe.name).toBe('Recipe_Fake_AluminaSolution_C')

    // Find the mutual dependency group (two recipes)
    const mutualGroup = groups.find((g) => g.length === 2)
    expect(mutualGroup).toBeDefined()
    const mutualNames = mutualGroup!.map((r) => r.recipe.name)
    expect(mutualNames).toContain('Recipe_Alternate_RecycledRubber_C')
    expect(mutualNames).toContain('Recipe_Alternate_Plastic_1_C')
  })

  it('handles mixed circular and non-circular recipes', () => {
    const recipes = [
      createRecipeNode('Recipe_IngotIron_C'), // non-circular
      createRecipeNode('Recipe_Fake_AluminaSolution_C'), // catalyst
      createRecipeNode('Recipe_IronPlate_C'), // non-circular
      createRecipeNode('Recipe_Alternate_RecycledRubber_C'), // mutual dependency
      createRecipeNode('Recipe_Alternate_Plastic_1_C'), // mutual dependency
      createRecipeNode('Recipe_Wire_C'), // non-circular
    ]

    const groups = groupCircularRecipes(recipes)
    expect(groups).toHaveLength(2)

    // Should have one group with the catalyst recipe
    const singleRecipeGroups = groups.filter((g) => g.length === 1)
    expect(singleRecipeGroups).toHaveLength(1)
    expect(singleRecipeGroups[0][0].recipe.name).toEqual('Recipe_Fake_AluminaSolution_C')

    // Should have one group with the mutual dependency
    const multiRecipeGroups = groups.filter((g) => g.length === 2)
    expect(multiRecipeGroups).toHaveLength(1)
    const names = multiRecipeGroups[0].map((r) => r.recipe.name)
    expect(names).toContain('Recipe_Alternate_RecycledRubber_C')
    expect(names).toContain('Recipe_Alternate_Plastic_1_C')
  })

  it('handles empty recipe list', () => {
    const groups = groupCircularRecipes([])
    expect(groups).toEqual([])
  })
})
