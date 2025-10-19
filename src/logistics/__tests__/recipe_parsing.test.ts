import { describe, expect, it } from 'vitest'

import { InvalidBuildingError, InvalidRecipeError, RecipeFormatError } from '@/errors/recipe-errors'
import { isNaturalResource } from '@/logistics/constants'
import { parseRecipeString } from '@/logistics/recipe-parser'

// Vitest doesn't have fail globally, let's add it
const fail = (message: string) => {
  throw new Error(message)
}

describe('recipe parsing and source selection', () => {
  describe('recipe parsing', () => {
    it('should parse recipe strings', () => {
      const result = parseRecipeString('"Recipe_Fake_IronIngot_C@100#Desc_SmelterMk1_C": "1.2345"')
      expect(result).toEqual({
        name: 'Recipe_Fake_IronIngot_C',
        building: 'Desc_SmelterMk1_C',
        count: 1.2345,
      })
    })

    it('should parse recipe strings with decimal efficiency', () => {
      const result = parseRecipeString('"Recipe_Fake_IronIngot_C@75.5#Desc_SmelterMk1_C": "2.0"')
      expect(result).toEqual({
        name: 'Recipe_Fake_IronIngot_C',
        building: 'Desc_SmelterMk1_C',
        count: 2.0,
      })
    })

    it('should parse recipe strings with decimal amounts', () => {
      const result = parseRecipeString('"Recipe_Wire_C@100#Desc_ConstructorMk1_C": "0.333"')
      expect(result).toEqual({
        name: 'Recipe_Wire_C',
        building: 'Desc_ConstructorMk1_C',
        count: 0.333,
      })
    })

    describe('error cases', () => {
      describe('RecipeFormatError', () => {
        it('should throw RecipeFormatError for missing quotes', () => {
          expect(() => parseRecipeString('Recipe_Test_C@100#Desc_SmelterMk1_C: 1')).toThrow(
            RecipeFormatError,
          )
        })

        it('should throw RecipeFormatError for malformed recipe name', () => {
          expect(() =>
            parseRecipeString('"Invalid Recipe Name@100#Desc_SmelterMk1_C": "1"'),
          ).toThrow(RecipeFormatError)
        })

        it('should throw RecipeFormatError for missing @ symbol', () => {
          expect(() => parseRecipeString('"Recipe_Test_C100#Desc_SmelterMk1_C": "1"')).toThrow(
            RecipeFormatError,
          )
        })

        it('should throw RecipeFormatError for missing # symbol', () => {
          expect(() => parseRecipeString('"Recipe_Test_C@100Desc_SmelterMk1_C": "1"')).toThrow(
            RecipeFormatError,
          )
        })

        it('should throw RecipeFormatError for missing colon', () => {
          expect(() => parseRecipeString('"Recipe_Test_C@100#Desc_SmelterMk1_C" "1"')).toThrow(
            RecipeFormatError,
          )
        })

        it('should throw RecipeFormatError for invalid efficiency', () => {
          expect(() => parseRecipeString('"Recipe_Test_C@abc#Desc_SmelterMk1_C": "1"')).toThrow(
            RecipeFormatError,
          )
        })

        it('should throw RecipeFormatError for invalid amount', () => {
          expect(() => parseRecipeString('"Recipe_Test_C@100#Desc_SmelterMk1_C": "abc"')).toThrow(
            RecipeFormatError,
          )
        })

        it('should throw RecipeFormatError for empty string', () => {
          expect(() => parseRecipeString('')).toThrow(RecipeFormatError)
        })

        it('should throw RecipeFormatError for malformed building name', () => {
          expect(() => parseRecipeString('"Recipe_Test_C@100#Invalid Building Name": "1"')).toThrow(
            RecipeFormatError,
          )
        })
      })

      describe('InvalidBuildingError', () => {
        it('should throw InvalidBuildingError for nonexistent building', () => {
          expect(() =>
            parseRecipeString('"Recipe_Fake_IronIngot_C@100#Desc_NonexistentBuilding_C": "1"'),
          ).toThrow(InvalidBuildingError)
        })

        it('should include building name in error', () => {
          try {
            parseRecipeString('"Recipe_Fake_IronIngot_C@100#Desc_NonexistentBuilding_C": "1"')
            fail('Expected InvalidBuildingError to be thrown')
          } catch (error) {
            expect(error).toBeInstanceOf(InvalidBuildingError)
            expect((error as InvalidBuildingError).buildingName).toBe('Desc_NonexistentBuilding_C')
            expect((error as Error).message).toContain('Desc_NonexistentBuilding_C')
          }
        })
      })

      describe('InvalidRecipeError', () => {
        it('should throw InvalidRecipeError for nonexistent recipe', () => {
          expect(() =>
            parseRecipeString('"Recipe_NonexistentRecipe_C@100#Desc_SmelterMk1_C": "1"'),
          ).toThrow(InvalidRecipeError)
        })

        it('should include recipe name in error', () => {
          try {
            parseRecipeString('"Recipe_NonexistentRecipe_C@100#Desc_SmelterMk1_C": "1"')
            fail('Expected InvalidRecipeError to be thrown')
          } catch (error) {
            expect(error).toBeInstanceOf(InvalidRecipeError)
            expect((error as InvalidRecipeError).recipeName).toBe('Recipe_NonexistentRecipe_C')
            expect((error as Error).message).toContain('Recipe_NonexistentRecipe_C')
          }
        })
      })
    })

    describe('edge cases', () => {
      it('should handle very small decimal amounts', () => {
        const result = parseRecipeString(
          '"Recipe_Fake_IronIngot_C@100#Desc_SmelterMk1_C": "0.0001"',
        )
        expect(result.count).toBe(0.0001)
      })

      it('should handle very large amounts', () => {
        const result = parseRecipeString(
          '"Recipe_Fake_IronIngot_C@100#Desc_SmelterMk1_C": "999999.999"',
        )
        expect(result.count).toBe(999999.999)
      })

      it('should handle zero efficiency (if valid format)', () => {
        const result = parseRecipeString('"Recipe_Fake_IronIngot_C@0#Desc_SmelterMk1_C": "1"')
        expect(result.name).toBe('Recipe_Fake_IronIngot_C')
      })

      it('should handle maximum efficiency values', () => {
        const result = parseRecipeString('"Recipe_Fake_IronIngot_C@250#Desc_SmelterMk1_C": "1"')
        expect(result.name).toBe('Recipe_Fake_IronIngot_C')
      })

      it('should allow a trailing comma with some whitespace', () => {
        const result = parseRecipeString(
          '"Recipe_Fake_IronIngot_C@250#Desc_SmelterMk1_C": "1.23" ,',
        )
        expect(result.count).toBe(1.23)
      })
    })

    it('detects natural resources', () => {
      expect(isNaturalResource('Desc_OreIron_C')).toBe(true)
      expect(isNaturalResource('Desc_IronIngot_C')).toBe(false)
    })
  })
})
