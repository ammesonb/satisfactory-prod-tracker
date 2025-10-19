import { describe, expect, it } from 'vitest'

import { findCircularRecipes, groupCircularRecipes } from '@/logistics/dependency-resolver'
import { newRecipeNode, type RecipeNode } from '@/logistics/graph-node'
import { useDataStore } from '@/stores/data'
import type { Recipe } from '@/types/factory'

describe('findCircularRecipes', () => {
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

describe('group circular recipes', () => {
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
