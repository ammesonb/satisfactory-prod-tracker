import { describe, it, expect } from 'vitest'
import { stringToRecipe, isNaturalResource, pickSource } from '../recipe_import'

describe('recipe_import', () => {
  it('should parse recipe strings', () => {
    const result = stringToRecipe('"Recipe_Alternate_SteelPlate_C@100#Desc_Smelter_C": "1.2345"')
    expect(result).toEqual({
      name: 'Recipe_Alternate_SteelPlate_C',
      building: 'Desc_Smelter_C',
      count: 1.2345,
    })
  })

  it('detects natural resources', () => {
    expect(isNaturalResource('Desc_OreIron_C')).toBe(true)
    expect(isNaturalResource('Desc_IronIngot_C')).toBe(false)
  })

  describe('picks correct sources', () => {
    const createRecipeItem = (amount: number, recipeName: string) => ({
      amount,
      recipe: { name: recipeName, building: 'TestBuilding', count: 1 },
    })

    // item names not checked since it's assumed anything provided will already match the required ingredient
    const createRequest = (amount: number) => createRecipeItem(amount, 'TestRequest')

    it('should fill request exactly by one source', () => {
      const request = createRequest(10)
      const sources = [createRecipeItem(10, 'Source1')]

      const result = pickSource(request, 'TestIngredient', sources)

      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(10)
    })

    it('should fill request by one source with remainder', () => {
      const request = createRequest(5)
      const sources = [createRecipeItem(10, 'Source1')]

      const result = pickSource(request, 'TestIngredient', sources)

      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(10)
    })

    it('should throw error when no sources provided', () => {
      const request = createRequest(10)
      const sources = []

      expect(() => pickSource(request, 'TestIngredient', sources)).toThrow(
        'No sources found for TestIngredient in TestRequest',
      )
    })

    it('should throw error when the only source has insufficient quantity', () => {
      const request = createRequest(10)
      const sources = [createRecipeItem(5, 'Source1')]

      expect(() => pickSource(request, 'TestIngredient', sources)).toThrow(
        'Not enough sources for TestIngredient in TestRequest',
      )
    })

    it('should throw error when multiple sources have insufficient quantity', () => {
      const request = createRequest(20)
      const sources = [createRecipeItem(5, 'Source1'), createRecipeItem(8, 'Source2')]

      expect(() => pickSource(request, 'TestIngredient', sources)).toThrow(
        'Not enough sources for TestIngredient in TestRequest',
      )
    })

    it('should return lowest amount when multiple sources have sufficient quantity', () => {
      const request = createRequest(10)
      const sources = [
        createRecipeItem(15, 'Source1'),
        createRecipeItem(12, 'Source2'),
        createRecipeItem(20, 'Source3'),
      ]

      const result = pickSource(request, 'TestIngredient', sources)

      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(12)
      expect(result[0].recipe.name).toBe('Source2')
    })

    it('should return source when quantity is within threshold', () => {
      const request = createRequest(10)
      const sources = [createRecipeItem(9.95, 'Source1')] // Within 0.1 threshold

      const result = pickSource(request, 'TestIngredient', sources)

      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(9.95)
    })

    it('should combine multiple sources to cover request', () => {
      const request = createRequest(15)
      const sources = [createRecipeItem(5, 'Source1'), createRecipeItem(10, 'Source2')]

      const result = pickSource(request, 'TestIngredient', sources)
      expect(result).toHaveLength(2)
    })

    it('should consume lowest quantities first when more sources than needed', () => {
      const request = createRequest(12)
      const sources = [
        createRecipeItem(3, 'Source1'),
        createRecipeItem(7, 'Source2'),
        createRecipeItem(5, 'Source3'),
        createRecipeItem(10, 'Source4'),
      ]

      const result = pickSource(request, 'TestIngredient', sources)
      expect(result).toHaveLength(3)
      expect(result.map((r) => r.recipe.name)).toEqual(['Source1', 'Source3', 'Source2'])
    })
  })
})
