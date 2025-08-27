import { describe, it, expect } from 'vitest'
import { parseRecipeString } from '../recipe-parser'
import { isNaturalResource } from '../constants'

describe('recipe parsing and source selection', () => {
  describe('recipe parsing', () => {
    it('should parse recipe strings', () => {
      const result = parseRecipeString(
        '"Recipe_Alternate_SteelPlate_C@100#Desc_Smelter_C": "1.2345"',
      )
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
  })
})
