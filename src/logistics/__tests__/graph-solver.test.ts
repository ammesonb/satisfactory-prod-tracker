import { describe, it, expect, vi, beforeEach } from 'vitest'
import { solveRecipeChain } from '../graph-solver'
import { setupMockDataStore } from './recipe-fixtures'
import { RECIPES } from './recipe-input-fixtures'
import { BASIC_TEST_CASES, COMPLEX_TEST_CASES } from './recipe-test-cases'
import type { RecipeNode } from '../graph-node'
import type { Material } from '@/types/factory'

vi.mock('@/stores/data')

// Helper function to test complete recipe chain solving
const testRecipeChain = (
  rawRecipes: string[],
  expectedBatches: string[][],
  expectedLinks: Material[],
  expectedProducedItems: Record<string, object[]>,
) => {
  const result = solveRecipeChain(rawRecipes)

  console.log(result)

  expect(result).toHaveLength(rawRecipes.length)
  expectRecipeBatchesToMatch(result, expectedBatches)

  const actualLinks = extractLinks(result)
  expectRecipeLinksToMatch(actualLinks, expectedLinks)

  const actualProducedItems = extractProducedItems(result)
  expect(actualProducedItems).toEqual(expectedProducedItems)

  return result
}

// Helper function to extract links from RecipeNodes
const extractLinks = (nodes: RecipeNode[]): Material[] => {
  const links: Material[] = []
  for (const node of nodes) {
    for (const input of node.inputs) {
      links.push({
        source: input.source,
        sink: input.sink,
        material: input.material,
        amount: input.amount,
      })
    }
  }
  return links
}

// Helper function to extract produced items from RecipeNodes
const extractProducedItems = (nodes: RecipeNode[]): Record<string, object[]> => {
  const producedItems: Record<string, object[]> = {}

  for (const node of nodes) {
    for (const product of node.availableProducts) {
      if (product.amount > 0) {
        if (!producedItems[product.item]) {
          producedItems[product.item] = []
        }
        producedItems[product.item].push({
          amount: product.amount,
          recipe: node.recipe,
          isResource: false,
        })
      }
    }
  }

  return producedItems
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
      console.error('Expected link not found:', expectedLink)
      console.error('Available actual links:')
      actual.forEach((link, i) => console.error(`  ${i}:`, link))
    }

    expect(matchingLink).toBeDefined()
    expect(matchingLink.amount).toBeCloseTo(expectedAmount, 2)
  }
}

// Helper function to check recipe batch grouping
const expectRecipeBatchesToMatch = (actual: RecipeNode[], expectedBatches: string[][]) => {
  console.log(`Expected ${expectedBatches.length} batches`)

  const nodesByBatch = {}
  for (const node of actual) {
    nodesByBatch[node.batchNumber!] = nodesByBatch[node.batchNumber!] || []
    nodesByBatch[node.batchNumber!].push(node)
  }

  for (let batchIndex = 0; batchIndex < expectedBatches.length; batchIndex++) {
    const expectedBatch = expectedBatches[batchIndex]

    for (const recipeName of expectedBatch) {
      const recipeNode = nodesByBatch[batchIndex].find((node) => node.recipe.name === recipeName)
      if (!recipeNode) {
        console.error(`Recipe '${recipeName}' not found in batch ${batchIndex}`)
        console.error(
          `Available recipes in batch ${batchIndex}:`,
          nodesByBatch[batchIndex]?.map((n) => n.recipe.name) || [],
        )
        console.error(
          `All batches:`,
          Object.keys(nodesByBatch).map(
            (b) => `Batch ${b}: [${nodesByBatch[b].map((n) => n.recipe.name).join(', ')}]`,
          ),
        )
      }
      expect(recipeNode).toBeDefined()
    }
  }
}

describe('graph-solver integration - production chain solving', () => {
  beforeEach(() => {
    setupMockDataStore()
  })

  describe('simple production chains', () => {
    // Tests a basic 2-step production chain: Iron Ore -> Iron Ingot -> Iron Plate
    it('should handle simple production chain', () => {
      const testCase = BASIC_TEST_CASES.SIMPLE_PRODUCTION
      const result = solveRecipeChain(testCase.rawRecipes)

      expect(result).toHaveLength(testCase.expectedBatches.flat().length)
      expectRecipeBatchesToMatch(result, testCase.expectedBatches)
      const actualLinks = extractLinks(result)
      expect(actualLinks).toEqual(testCase.expectedLinks)
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

      const result = solveRecipeChain(rawRecipes)
      // Should only produce the iron ingot recipe, iron plate should be left out
      expect(result).toHaveLength(1)
      expect(result[0].recipe.name).toBe('Recipe_IngotIron_C')
    })
  })
})
