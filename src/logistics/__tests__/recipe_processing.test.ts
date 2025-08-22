import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processRecipeChain } from '../recipe-processor'
import { setupMockDataStore } from './recipe-fixtures'
import { RECIPES } from './recipe-input-fixtures'
import { BASIC_TEST_CASES, COMPLEX_TEST_CASES } from './recipe-test-cases'
import type { Recipe, Material } from '@/types/factory'

vi.mock('@/stores/data')

// Helper function to test complete recipe chain processing
const testRecipeChain = (
  rawRecipes: string[],
  expectedBatches: string[][],
  expectedLinks: Material[],
  expectedProducedItems: Record<string, object[]>,
) => {
  const result = processRecipeChain(rawRecipes)

  expect(result.recipeBatches).toHaveLength(expectedBatches.length)
  expectRecipeBatchesToMatch(result.recipeBatches, expectedBatches)
  expectRecipeLinksToMatch(result.recipeLinks, expectedLinks)
  expect(result.producedItems).toEqual(expectedProducedItems)

  return result
}

// Helper function to compare recipe links with floating point tolerance for amounts (order-agnostic)
const expectRecipeLinksToMatch = (actual: Material[], expected: Material[]) => {
  expect(actual).toHaveLength(expected.length)
  console.log(`Expected ${expected.length} links, got ${actual.length} links`)

  for (const expectedLink of expected) {
    const { amount: expectedAmount, ...expectedRest } = expectedLink

    // Find a matching link in the actual results
    const matchingLink = actual.find((actualLink) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { amount, ...actualRest } = actualLink
      return JSON.stringify(actualRest) === JSON.stringify(expectedRest)
    })

    if (!matchingLink) {
      console.error(
        `Expected link not found: ${expectedLink.source} -> ${expectedLink.sink} (${expectedLink.material}: ${expectedLink.amount})`,
      )
      console.error(`Available actual links (${actual.length} total):`)
      actual.forEach((link, i) =>
        console.error(`  ${i}: ${link.source} -> ${link.sink} (${link.material}: ${link.amount})`),
      )
    }

    expect(matchingLink).toBeDefined()
    expect(matchingLink.amount).toBeCloseTo(expectedAmount, 2)
  }
}

// Helper function to check recipe batch grouping
const expectRecipeBatchesToMatch = (actual: Recipe[][], expected: string[][]) => {
  expect(actual).toHaveLength(expected.length)
  console.log(`Expected ${expected.length} batches, got ${actual.length} batches`)

  for (let i = 0; i < expected.length; i++) {
    const actualBatch = actual[i]
    const expectedBatch = expected[i]

    expect(actualBatch).toHaveLength(expectedBatch.length)
    for (const recipeName of expectedBatch) {
      expect(actualBatch).toContainEqual(expect.objectContaining({ name: recipeName }))
    }
  }
}

describe('processRecipeChain integration - production chain processing', () => {
  beforeEach(() => {
    setupMockDataStore()
  })

  describe('simple production chains', () => {
    // Tests a basic 2-step production chain: Iron Ore -> Iron Ingot -> Iron Plate
    it('should handle simple production chain', () => {
      const testCase = BASIC_TEST_CASES.SIMPLE_PRODUCTION
      const result = processRecipeChain(testCase.rawRecipes)

      expect(result.recipeBatches).toHaveLength(testCase.expectedBatches.length)
      expectRecipeBatchesToMatch(result.recipeBatches, testCase.expectedBatches)
      expect(result.recipeLinks).toEqual(testCase.expectedLinks)
    })

    // Tests a multi-tier production chain with parallel base materials and dependencies: Ores -> Ingots -> Wire -> Cable
    it('should handle tiered production chain', () => {
      const testCase = BASIC_TEST_CASES.TIERED_PRODUCTION
      testRecipeChain(
        testCase.rawRecipes,
        testCase.expectedBatches,
        testCase.expectedLinks,
        testCase.expectedProducedItems,
      )
    })

    // Tests parallel production from natural resources (both recipes can run in same batch)
    it('should handle production chain with natural resources', () => {
      const testCase = BASIC_TEST_CASES.NATURAL_RESOURCES
      testRecipeChain(
        testCase.rawRecipes,
        testCase.expectedBatches,
        testCase.expectedLinks,
        testCase.expectedProducedItems,
      )
    })

    // Tests exact quantity matching: 3 iron ingot smelters producing exactly what 1 iron plate constructor needs
    it('should handle sufficient quantity produced by another recipe', () => {
      const testCase = BASIC_TEST_CASES.SUFFICIENT_QUANTITY
      testRecipeChain(
        testCase.rawRecipes,
        testCase.expectedBatches,
        testCase.expectedLinks,
        testCase.expectedProducedItems,
      )
    })
  })

  describe('complex/codependent production chains', () => {
    // Tests aluminum refining producing multiple byproducts, one used by subsequent recipe
    it('should handle natural resources as byproducts and self-referential catalysts', () => {
      const testCase = COMPLEX_TEST_CASES.ALUMINUM_SOLUTION
      testRecipeChain(
        testCase.rawRecipes,
        testCase.expectedBatches,
        testCase.expectedLinks,
        testCase.expectedProducedItems,
      )
    })

    it('should link modular frame production', () => {
      const testCase = COMPLEX_TEST_CASES.MODULAR_FRAME
      testRecipeChain(
        testCase.rawRecipes,
        testCase.expectedBatches,
        testCase.expectedLinks,
        testCase.expectedProducedItems,
      )
    })

    it('should link plastic/rubber codependent recipes', () => {
      const testCase = COMPLEX_TEST_CASES.PLASTIC_RUBBER
      testRecipeChain(
        testCase.rawRecipes,
        testCase.expectedBatches,
        testCase.expectedLinks,
        testCase.expectedProducedItems,
      )
    })

    it('should process insanely complex plutonium cells', () => {
      const testCase = COMPLEX_TEST_CASES.PLUTONIUM_CELL
      testRecipeChain(
        testCase.rawRecipes,
        testCase.expectedBatches,
        testCase.expectedLinks,
        testCase.expectedProducedItems,
      )
    })
  })

  describe('error cases', () => {
    // Tests insufficient production: 1 iron ingot produced, but 6 needed for 2 iron plate recipes
    it('should handle insufficient quantity production', () => {
      const rawRecipes = [
        RECIPES.IRON_INGOT('1'), // Produces 1 iron ingot
        RECIPES.IRON_PLATE('2'), // Needs 6 iron ingots (3 each)
      ]

      expect(() => processRecipeChain(rawRecipes)).toThrow(
        'No progress made and no circular dependencies found. Missing ingredients for: Recipe_IronPlate_C',
      )
    })
  })
})
