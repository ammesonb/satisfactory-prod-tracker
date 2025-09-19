import { describe, it, expect, beforeEach } from 'vitest'
import { RECIPES } from './recipe-input-fixtures'
import { BASIC_TEST_CASES, COMPLEX_TEST_CASES } from './recipe-test-cases'
import type { RecipeNode } from '@/logistics/graph-node'
import { solveRecipeChain } from '@/logistics/graph-solver'
import type { RecipeProduct } from '@/types/data'
import type { Material } from '@/types/factory'
import { RecipeChainError } from '@/errors/processing-errors'
import { expectErrorWithMessage } from './error-test-helpers'

// Helper function to test complete recipe chain solving
const testRecipeChain = (
  description: string,
  testCase: {
    rawRecipes: string[]
    expectedBatches: string[][]
    expectedLinks: Material[]
    expectedProducedItems: Record<string, object[]>
    externalInputs?: RecipeProduct[]
  },
) => {
  describe(description, () => {
    let result: RecipeNode[]

    beforeEach(() => {
      result = solveRecipeChain(testCase.rawRecipes, testCase.externalInputs || [])
    })

    it('has the correct number of recipe nodes', () => {
      expect(result).toHaveLength(testCase.rawRecipes.length)
    })

    it('groups recipes into correct batches', () => {
      expectRecipeBatchesToMatch(result, testCase.expectedBatches)
    })

    it('creates correct recipe links', () => {
      const actualLinks = extractLinks(result)
      expectRecipeLinksToMatch(actualLinks, testCase.expectedLinks)
    })

    it('produces correct items', () => {
      const actualProducedItems = extractProducedItems(result)
      expect(actualProducedItems).toEqual(testCase.expectedProducedItems)
    })
  })
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
  expect.soft(actual).toHaveLength(expected.length)

  const counts = expected.reduce(
    (acc, link) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { amount: expectedAmount, ...expectedRest } = link
      acc[JSON.stringify(expectedRest)] = (acc[JSON.stringify(expectedRest)] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  for (const [key, value] of Object.entries(counts)) {
    // ensure each link is only included once
    expect.soft({ key, value }).toEqual({ key, value: 1 })
  }

  if (expected.length !== actual.length) {
    console.log(`Expected ${expected.length} links, got ${actual.length} links`)
  }
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

    expect.soft(matchingLink).toBeDefined()
    if (matchingLink) {
      // Check amount with absolute tolerance (0.1 difference allowed)
      expect
        .soft({
          source: expectedLink.source,
          sink: expectedLink.sink,
          material: expectedLink.material,
          amount: matchingLink.amount,
        })
        .toEqual({
          source: matchingLink.source,
          sink: matchingLink.sink,
          material: matchingLink.material,
          amount: expect.closeTo(expectedAmount, 0.1),
        })
    } else {
      console.error('No match for', expectedLink)
    }
  }

  // check actual against expected too, in case extras are present
  for (const actualLink of actual) {
    const { amount: actualAmount, ...actualRest } = actualLink
    const matchingLink = expected.find((expectedLink) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { amount, ...expectedRest } = expectedLink
      return JSON.stringify(actualRest) === JSON.stringify(expectedRest)
    })
    if (!matchingLink) {
      console.error('Actual link not found in expected:', actualLink)
    }

    expect.soft(matchingLink).toBeDefined()
    if (matchingLink) {
      expect
        .soft({
          source: actualLink.source,
          sink: actualLink.sink,
          material: actualLink.material,
          amount: actualAmount,
        })
        .toEqual({
          source: matchingLink.source,
          sink: matchingLink.sink,
          material: matchingLink.material,
          amount: expect.closeTo(matchingLink.amount, 0.1),
        })
    } else {
      console.log('No match for', actualLink)
    }
  }
}

// Helper function to check recipe batch grouping
const expectRecipeBatchesToMatch = (actual: RecipeNode[], expectedBatches: string[][]) => {
  console.log(`Expected ${expectedBatches.length} batches`)
  const nodesByBatch: Record<string, RecipeNode[]> = {}
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
            (b: string) =>
              `Batch ${b}: [${nodesByBatch[b].map((n: RecipeNode) => n.recipe.name).join(', ')}]`,
          ),
        )
      }
      expect(recipeNode).toBeDefined()
    }
  }
}

describe('graph-solver integration - production chain solving', () => {
  describe('simple production chains', () => {
    // Tests a basic 2-step production chain: Iron Ore -> Iron Ingot -> Iron Plate
    it('should handle simple production chain', () => {
      const testCase = BASIC_TEST_CASES.SIMPLE_PRODUCTION
      const result = solveRecipeChain(testCase.rawRecipes, [])

      expect(result).toHaveLength(testCase.expectedBatches.flat().length)
      expectRecipeBatchesToMatch(result, testCase.expectedBatches)
      const actualLinks = extractLinks(result)
      expect(actualLinks).toEqual(testCase.expectedLinks)
    })

    // Tests a multi-tier production chain with parallel base materials and dependencies: Ores -> Ingots -> Wire -> Cable
    testRecipeChain('tiered production chain', BASIC_TEST_CASES.TIERED_PRODUCTION)

    // Tests parallel production from natural resources (both recipes can run in same batch)
    testRecipeChain('production chain with natural resources', BASIC_TEST_CASES.NATURAL_RESOURCES)

    // Tests exact quantity matching: 3 iron ingot smelters producing exactly what 1 iron plate constructor needs
    testRecipeChain(
      'sufficient quantity produced by another recipe',
      BASIC_TEST_CASES.SUFFICIENT_QUANTITY,
    )

    testRecipeChain('external inputs are used', BASIC_TEST_CASES.EXTERNAL_INPUTS)
  })

  describe('complex/codependent production chains', () => {
    // Tests aluminum refining producing multiple byproducts, one used by subsequent recipe
    testRecipeChain(
      'natural resources as byproducts and self-referential catalysts',
      COMPLEX_TEST_CASES.ALUMINUM_SOLUTION,
    )

    testRecipeChain('modular frame production', COMPLEX_TEST_CASES.MODULAR_FRAME)

    testRecipeChain('plastic/rubber codependent recipes', COMPLEX_TEST_CASES.PLASTIC_RUBBER)

    testRecipeChain('insanely complex plutonium cells', COMPLEX_TEST_CASES.PLUTONIUM_CELL)
  })

  describe('error cases', () => {
    // Tests insufficient production: 1 iron ingot produced, but 6 needed for 2 iron plate recipes
    it('should throw RecipeChainError for insufficient quantity production', () => {
      const rawRecipes = [
        RECIPES.IRON_INGOT('1'), // Produces 1 iron ingot
        RECIPES.IRON_PLATE('2'), // Needs 6 iron ingots (3 each)
      ]

      const error = expectErrorWithMessage(
        () => solveRecipeChain(rawRecipes, []),
        RecipeChainError,
        {
          unprocessedRecipes: expect.arrayContaining(['Recipe_IronPlate_C']),
        },
        'Recipe chain error',
      )

      expect(error.missingDependencies).toHaveProperty('Recipe_IronPlate_C')
      // Verify that showError method exists (new interface)
      expect(typeof error.showError).toBe('function')
    })
  })
})
