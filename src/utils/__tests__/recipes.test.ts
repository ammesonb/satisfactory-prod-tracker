import { describe, expect, it, vi } from 'vitest'

import type { Recipe } from '@/types/data'

// Mock the cache module to test the core logic without memoization
vi.mock('../cache', () => ({
  memoize: vi.fn((fn) => fn), // Return the function unwrapped for testing
}))

// Import after mocking
import { recipesToOptions } from '../recipes'

describe('recipes utilities', () => {
  // Helper to create mock recipe data
  const createMockRecipe = (name: string, className: string): Recipe => ({
    slug: className.toLowerCase().replace(/_c$/, ''),
    name,
    className,
    alternate: false,
    time: 2,
    inHand: false,
    forBuilding: false,
    inWorkshop: false,
    inMachine: true,
    manualTimeMultiplier: 1,
    ingredients: [],
    products: [],
    producedIn: [],
    isVariablePower: false,
    minPower: 0,
    maxPower: 0,
  })

  // Helper to create a mock display name function
  const createMockDisplayNameFn = (nameMap?: Record<string, string>) => {
    return vi.fn((key: string) => {
      if (nameMap && key in nameMap) {
        return nameMap[key]
      }
      // Default behavior: remove "Recipe_" prefix and "_C" suffix, replace underscores
      return key
        .replace(/^Recipe_/, '')
        .replace(/_C$/, '')
        .replace(/_/g, ' ')
    })
  }

  // Helper to verify option structure
  const expectValidRecipeOption = (
    option: { value: string; title: string },
    expectedValue: string,
    expectedTitle: string,
  ) => {
    expect(option).toEqual({
      value: expectedValue,
      title: expectedTitle,
    })
    expect(typeof option.value).toBe('string')
    expect(typeof option.title).toBe('string')
  }

  describe('recipesToOptions', () => {
    describe('basic functionality', () => {
      it('should convert recipes to options with display names', () => {
        const ironRecipe = {
          className: 'Recipe_IronIngot_C',
          name: 'Iron Ingot',
          displayName: 'Iron Ingot',
        }
        const copperRecipe = {
          className: 'Recipe_CopperIngot_C',
          name: 'Copper Ingot',
          displayName: 'Copper Ingot',
        }
        const steelRecipe = {
          className: 'Recipe_SteelIngot_C',
          name: 'Steel Ingot',
          displayName: 'Steel Ingot',
        }

        const recipes = {
          [ironRecipe.className]: createMockRecipe(ironRecipe.name, ironRecipe.className),
          [copperRecipe.className]: createMockRecipe(copperRecipe.name, copperRecipe.className),
          [steelRecipe.className]: createMockRecipe(steelRecipe.name, steelRecipe.className),
        }

        const getDisplayName = createMockDisplayNameFn({
          [ironRecipe.className]: ironRecipe.displayName,
          [copperRecipe.className]: copperRecipe.displayName,
          [steelRecipe.className]: steelRecipe.displayName,
        })

        const result = recipesToOptions(recipes, getDisplayName, [])

        expect(result).toHaveLength(3)
        expect(getDisplayName).toHaveBeenCalledTimes(3)

        // Results should be sorted alphabetically by title
        expectValidRecipeOption(result[0], copperRecipe.className, copperRecipe.displayName)
        expectValidRecipeOption(result[1], ironRecipe.className, ironRecipe.displayName)
        expectValidRecipeOption(result[2], steelRecipe.className, steelRecipe.displayName)
      })

      it('should sort results alphabetically by title', () => {
        const zebraRecipe = {
          className: 'Recipe_Zebra_C',
          name: 'Zebra Recipe',
          displayName: 'Zebra Recipe',
        }
        const alphaRecipe = {
          className: 'Recipe_Alpha_C',
          name: 'Alpha Recipe',
          displayName: 'Alpha Recipe',
        }
        const betaRecipe = {
          className: 'Recipe_Beta_C',
          name: 'Beta Recipe',
          displayName: 'Beta Recipe',
        }

        const recipes = {
          [zebraRecipe.className]: createMockRecipe(zebraRecipe.name, zebraRecipe.className),
          [alphaRecipe.className]: createMockRecipe(alphaRecipe.name, alphaRecipe.className),
          [betaRecipe.className]: createMockRecipe(betaRecipe.name, betaRecipe.className),
        }

        const getDisplayName = createMockDisplayNameFn({
          [zebraRecipe.className]: zebraRecipe.displayName,
          [alphaRecipe.className]: alphaRecipe.displayName,
          [betaRecipe.className]: betaRecipe.displayName,
        })

        const result = recipesToOptions(recipes, getDisplayName, [])

        expect(result).toHaveLength(3)
        expectValidRecipeOption(result[0], alphaRecipe.className, alphaRecipe.displayName)
        expectValidRecipeOption(result[1], betaRecipe.className, betaRecipe.displayName)
        expectValidRecipeOption(result[2], zebraRecipe.className, zebraRecipe.displayName)
      })

      it('should handle empty recipes object', () => {
        const recipes = {}
        const getDisplayName = createMockDisplayNameFn()

        const result = recipesToOptions(recipes, getDisplayName, [])

        expect(result).toEqual([])
        expect(Array.isArray(result)).toBe(true)
        expect(getDisplayName).not.toHaveBeenCalled()
      })

      it('should handle single recipe', () => {
        const singleRecipe = {
          className: 'Recipe_IronIngot_C',
          name: 'Iron Ingot',
          displayName: 'Iron Ingot',
        }
        const recipes = {
          [singleRecipe.className]: createMockRecipe(singleRecipe.name, singleRecipe.className),
        }

        const getDisplayName = createMockDisplayNameFn({
          [singleRecipe.className]: singleRecipe.displayName,
        })

        const result = recipesToOptions(recipes, getDisplayName, [])

        expect(result).toHaveLength(1)
        expectValidRecipeOption(result[0], singleRecipe.className, singleRecipe.displayName)
        expect(getDisplayName).toHaveBeenCalledWith(singleRecipe.className)
      })
    })

    describe('exclude functionality', () => {
      it('should exclude specified recipe keys', () => {
        const ironRecipe = {
          className: 'Recipe_IronIngot_C',
          name: 'Iron Ingot',
          displayName: 'Iron Ingot',
        }
        const copperRecipe = {
          className: 'Recipe_CopperIngot_C',
          name: 'Copper Ingot',
          displayName: 'Copper Ingot',
        }
        const steelRecipe = {
          className: 'Recipe_SteelIngot_C',
          name: 'Steel Ingot',
          displayName: 'Steel Ingot',
        }
        const aluminumRecipe = {
          className: 'Recipe_AluminumIngot_C',
          name: 'Aluminum Ingot',
          displayName: 'Aluminum Ingot',
        }

        const recipes = {
          [ironRecipe.className]: createMockRecipe(ironRecipe.name, ironRecipe.className),
          [copperRecipe.className]: createMockRecipe(copperRecipe.name, copperRecipe.className),
          [steelRecipe.className]: createMockRecipe(steelRecipe.name, steelRecipe.className),
          [aluminumRecipe.className]: createMockRecipe(
            aluminumRecipe.name,
            aluminumRecipe.className,
          ),
        }

        const getDisplayName = createMockDisplayNameFn({
          [ironRecipe.className]: ironRecipe.displayName,
          [steelRecipe.className]: steelRecipe.displayName,
        })

        const excludeKeys = [copperRecipe.className, aluminumRecipe.className]
        const result = recipesToOptions(recipes, getDisplayName, excludeKeys)

        expect(result).toHaveLength(2)
        expectValidRecipeOption(result[0], ironRecipe.className, ironRecipe.displayName)
        expectValidRecipeOption(result[1], steelRecipe.className, steelRecipe.displayName)

        // Display name function should only be called for non-excluded recipes
        expect(getDisplayName).toHaveBeenCalledTimes(2)
        expect(getDisplayName).toHaveBeenCalledWith(ironRecipe.className)
        expect(getDisplayName).toHaveBeenCalledWith(steelRecipe.className)
      })

      it('should handle empty exclude array', () => {
        const ironRecipe = {
          className: 'Recipe_IronIngot_C',
          name: 'Iron Ingot',
          displayName: 'Iron Ingot',
        }
        const copperRecipe = {
          className: 'Recipe_CopperIngot_C',
          name: 'Copper Ingot',
          displayName: 'Copper Ingot',
        }

        const recipes = {
          [ironRecipe.className]: createMockRecipe(ironRecipe.name, ironRecipe.className),
          [copperRecipe.className]: createMockRecipe(copperRecipe.name, copperRecipe.className),
        }

        const getDisplayName = createMockDisplayNameFn({
          [ironRecipe.className]: ironRecipe.displayName,
          [copperRecipe.className]: copperRecipe.displayName,
        })

        const result = recipesToOptions(recipes, getDisplayName, [])

        expect(result).toHaveLength(2)
        expect(getDisplayName).toHaveBeenCalledTimes(2)
      })

      it('should handle undefined exclude parameter', () => {
        const singleRecipe = {
          className: 'Recipe_IronIngot_C',
          name: 'Iron Ingot',
          displayName: 'Iron Ingot',
        }
        const recipes = {
          [singleRecipe.className]: createMockRecipe(singleRecipe.name, singleRecipe.className),
        }

        const getDisplayName = createMockDisplayNameFn({
          [singleRecipe.className]: singleRecipe.displayName,
        })

        const result = recipesToOptions(recipes, getDisplayName, undefined)

        expect(result).toHaveLength(1)
        expectValidRecipeOption(result[0], singleRecipe.className, singleRecipe.displayName)
      })

      it('should exclude all recipes if all keys are in exclude array', () => {
        const ironRecipe = { className: 'Recipe_IronIngot_C', name: 'Iron Ingot' }
        const copperRecipe = { className: 'Recipe_CopperIngot_C', name: 'Copper Ingot' }

        const recipes = {
          [ironRecipe.className]: createMockRecipe(ironRecipe.name, ironRecipe.className),
          [copperRecipe.className]: createMockRecipe(copperRecipe.name, copperRecipe.className),
        }

        const getDisplayName = createMockDisplayNameFn()
        const excludeKeys = [ironRecipe.className, copperRecipe.className]

        const result = recipesToOptions(recipes, getDisplayName, excludeKeys)

        expect(result).toEqual([])
        expect(getDisplayName).not.toHaveBeenCalled()
      })

      it('should handle exclude keys that do not exist in recipes', () => {
        const existingRecipe = {
          className: 'Recipe_IronIngot_C',
          name: 'Iron Ingot',
          displayName: 'Iron Ingot',
        }
        const nonExistentKeys = ['Recipe_NonExistent_C', 'Recipe_NotThere_C']

        const recipes = {
          [existingRecipe.className]: createMockRecipe(
            existingRecipe.name,
            existingRecipe.className,
          ),
        }

        const getDisplayName = createMockDisplayNameFn({
          [existingRecipe.className]: existingRecipe.displayName,
        })

        const result = recipesToOptions(recipes, getDisplayName, nonExistentKeys)

        expect(result).toHaveLength(1)
        expectValidRecipeOption(result[0], existingRecipe.className, existingRecipe.displayName)
      })
    })

    describe('display name integration', () => {
      it('should call display name function for each recipe', () => {
        const recipeA = { className: 'Recipe_A_C', name: 'Recipe A' }
        const recipeB = { className: 'Recipe_B_C', name: 'Recipe B' }
        const expectedCallCount = 2

        const recipes = {
          [recipeA.className]: createMockRecipe(recipeA.name, recipeA.className),
          [recipeB.className]: createMockRecipe(recipeB.name, recipeB.className),
        }

        const getDisplayName = createMockDisplayNameFn()

        recipesToOptions(recipes, getDisplayName, [])

        expect(getDisplayName).toHaveBeenCalledTimes(expectedCallCount)
        expect(getDisplayName).toHaveBeenCalledWith(recipeA.className)
        expect(getDisplayName).toHaveBeenCalledWith(recipeB.className)
      })

      it('should handle display names with special characters', () => {
        const specialRecipe = {
          className: 'Recipe_Special_C',
          name: 'Special Recipe',
          displayName: 'Recipe with "quotes" & symbols! 🎉',
        }

        const recipes = {
          [specialRecipe.className]: createMockRecipe(specialRecipe.name, specialRecipe.className),
        }

        const getDisplayName = createMockDisplayNameFn({
          [specialRecipe.className]: specialRecipe.displayName,
        })

        const result = recipesToOptions(recipes, getDisplayName, [])

        expect(result).toHaveLength(1)
        expectValidRecipeOption(result[0], specialRecipe.className, specialRecipe.displayName)
      })

      it('should maintain sorting with complex display names', () => {
        const firstSortedRecipe = {
          className: 'Recipe_Z_First_C',
          name: 'Z Recipe',
          displayName: 'AAA Recipe (should be first)',
        }
        const middleSortedRecipe = {
          className: 'Recipe_M_Middle_C',
          name: 'M Recipe',
          displayName: 'MMM Recipe (should be middle)',
        }
        const lastSortedRecipe = {
          className: 'Recipe_A_Last_C',
          name: 'A Recipe',
          displayName: 'ZZZ Recipe (should be last)',
        }

        const recipes = {
          [firstSortedRecipe.className]: createMockRecipe(
            firstSortedRecipe.name,
            firstSortedRecipe.className,
          ),
          [lastSortedRecipe.className]: createMockRecipe(
            lastSortedRecipe.name,
            lastSortedRecipe.className,
          ),
          [middleSortedRecipe.className]: createMockRecipe(
            middleSortedRecipe.name,
            middleSortedRecipe.className,
          ),
        }

        const getDisplayName = createMockDisplayNameFn({
          [firstSortedRecipe.className]: firstSortedRecipe.displayName,
          [lastSortedRecipe.className]: lastSortedRecipe.displayName,
          [middleSortedRecipe.className]: middleSortedRecipe.displayName,
        })

        const result = recipesToOptions(recipes, getDisplayName, [])

        expect(result).toHaveLength(3)
        expectValidRecipeOption(
          result[0],
          firstSortedRecipe.className,
          firstSortedRecipe.displayName,
        )
        expectValidRecipeOption(
          result[1],
          middleSortedRecipe.className,
          middleSortedRecipe.displayName,
        )
        expectValidRecipeOption(result[2], lastSortedRecipe.className, lastSortedRecipe.displayName)
      })
    })

    describe('edge cases', () => {
      it('should handle recipes with identical display names', () => {
        const recipeA = { className: 'Recipe_A_C', name: 'Recipe A', displayName: 'Identical Name' }
        const recipeB = { className: 'Recipe_B_C', name: 'Recipe B', displayName: 'Identical Name' }
        const expectedLength = 2

        const recipes = {
          [recipeA.className]: createMockRecipe(recipeA.name, recipeA.className),
          [recipeB.className]: createMockRecipe(recipeB.name, recipeB.className),
        }

        const getDisplayName = createMockDisplayNameFn({
          [recipeA.className]: recipeA.displayName,
          [recipeB.className]: recipeB.displayName,
        })

        const result = recipesToOptions(recipes, getDisplayName, [])

        expect(result).toHaveLength(expectedLength)
        expect(result[0].title).toBe(recipeA.displayName)
        expect(result[1].title).toBe(recipeB.displayName)

        // Should maintain original key order when titles are identical
        const values = result.map((r) => r.value)
        expect(values).toContain(recipeA.className)
        expect(values).toContain(recipeB.className)
      })

      it('should handle case-sensitive sorting', () => {
        const lowerRecipe = { className: 'Recipe_Lower_C', name: 'lower', displayName: 'lowercase' }
        const upperRecipe = { className: 'Recipe_Upper_C', name: 'UPPER', displayName: 'UPPERCASE' }
        const mixedRecipe = { className: 'Recipe_Mixed_C', name: 'MiXeD', displayName: 'MiXeDcAsE' }
        const expectedSortOrder = ['lowercase', 'MiXeDcAsE', 'UPPERCASE']

        const recipes = {
          [lowerRecipe.className]: createMockRecipe(lowerRecipe.name, lowerRecipe.className),
          [upperRecipe.className]: createMockRecipe(upperRecipe.name, upperRecipe.className),
          [mixedRecipe.className]: createMockRecipe(mixedRecipe.name, mixedRecipe.className),
        }

        const getDisplayName = createMockDisplayNameFn({
          [lowerRecipe.className]: lowerRecipe.displayName,
          [upperRecipe.className]: upperRecipe.displayName,
          [mixedRecipe.className]: mixedRecipe.displayName,
        })

        const result = recipesToOptions(recipes, getDisplayName, [])

        expect(result).toHaveLength(3)

        // Verify that localeCompare is working (case-insensitive by default)
        const titles = result.map((r) => r.title)
        expect(titles).toEqual(expectedSortOrder)
      })

      it('should handle large number of recipes efficiently', () => {
        const recipeCount = 1000
        const expectedFirstTitle = 'Test Recipe 0000'
        const expectedLastTitle = 'Test Recipe 0999'
        const recipes: Record<string, Recipe> = {}
        const displayNames: Record<string, string> = {}

        // Create test recipes
        for (let i = 0; i < recipeCount; i++) {
          const key = `Recipe_Test${i.toString().padStart(4, '0')}_C`
          recipes[key] = createMockRecipe(`Test Recipe ${i}`, key)
          displayNames[key] = `Test Recipe ${i.toString().padStart(4, '0')}`
        }

        const getDisplayName = createMockDisplayNameFn(displayNames)
        const result = recipesToOptions(recipes, getDisplayName, [])

        expect(result).toHaveLength(recipeCount)
        expect(getDisplayName).toHaveBeenCalledTimes(recipeCount)

        // Verify sorting is maintained
        expect(result[0].title).toBe(expectedFirstTitle)
        expect(result[recipeCount - 1].title).toBe(expectedLastTitle)
      })
    })

    describe('result structure validation', () => {
      it('should return array of objects with correct structure', () => {
        const testRecipe = {
          className: 'Recipe_Test_C',
          name: 'Test Recipe',
          displayName: 'Test Recipe Display',
        }
        const expectedKeys = ['value', 'title']
        const expectedLength = 1

        const recipes = {
          [testRecipe.className]: createMockRecipe(testRecipe.name, testRecipe.className),
        }

        const getDisplayName = createMockDisplayNameFn({
          [testRecipe.className]: testRecipe.displayName,
        })

        const result = recipesToOptions(recipes, getDisplayName, [])

        expect(Array.isArray(result)).toBe(true)
        expect(result).toHaveLength(expectedLength)

        const option = result[0]

        // Check all required properties exist
        expectedKeys.forEach((key) => {
          expect(option).toHaveProperty(key)
        })

        // Check property types
        expect(typeof option.value).toBe('string')
        expect(typeof option.title).toBe('string')

        // Check no extra properties
        const actualKeys = Object.keys(option)
        expect(actualKeys.sort()).toEqual(expectedKeys.sort())
      })
    })
  })
})
