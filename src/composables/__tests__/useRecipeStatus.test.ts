import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  mockCurrentFactory,
  mockFactoryStore,
  mockGetRecipeByName,
  mockSetLinkBuiltState,
} from '@/__tests__/fixtures/composables/factoryStore'
import { makeFactory, makeFloor, makeMaterial, makeRecipeNode } from '@/__tests__/fixtures/data'
import { createMockDataStore } from '@/__tests__/fixtures/stores/dataStore'
import { useRecipeStatus } from '@/composables/useRecipeStatus'
import { ZERO_THRESHOLD } from '@/logistics/constants'
import { linkToString } from '@/logistics/graph-node'

vi.mock('@/composables/useStores', () => ({
  getStores: vi.fn(() => ({
    dataStore: createMockDataStore(),
    factoryStore: mockFactoryStore,
  })),
}))

vi.mock('@/logistics/graph-node', async () => {
  const actual = await vi.importActual('@/logistics/graph-node')
  return {
    ...actual,
    linkToString: vi.fn((link) => `${link.material}:${link.source}->${link.sink}`),
  }
})

describe('useRecipeStatus', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockCurrentFactory.value = null
  })

  describe('isRecipeComplete', () => {
    it('returns false when currentFactory is null', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 0, { built: true })
      recipe.inputs = [makeMaterial('Desc_OreIron_C', 'Desc_OreIron_C', 'Recipe_IronIngot_C')]
      recipe.outputs = [
        makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Recipe_IronPlate_C'),
      ]

      const { isRecipeComplete } = useRecipeStatus()

      expect(isRecipeComplete(recipe)).toBe(false)
    })

    it('returns false when recipe is not built', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 0, { built: false })
      const input = makeMaterial('Desc_OreIron_C', 'Desc_OreIron_C', 'Recipe_IronIngot_C')
      const output = makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Recipe_IronPlate_C')
      recipe.inputs = [input]
      recipe.outputs = [output]

      mockCurrentFactory.value = makeFactory('Test Factory', [makeFloor([recipe])], {
        recipeLinks: {
          [linkToString(input)]: true,
          [linkToString(output)]: true,
        },
      })

      const { isRecipeComplete } = useRecipeStatus()

      expect(isRecipeComplete(recipe)).toBe(false)
    })

    it('returns true when all inputs and outputs are linked', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 0, { built: true })
      const input = makeMaterial('Desc_OreIron_C', 'Desc_OreIron_C', 'Recipe_IronIngot_C')
      const output = makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Recipe_IronPlate_C')
      recipe.inputs = [input]
      recipe.outputs = [output]

      mockCurrentFactory.value = makeFactory('Test Factory', [makeFloor([recipe])], {
        recipeLinks: {
          [linkToString(input)]: true,
          [linkToString(output)]: true,
        },
      })

      const { isRecipeComplete } = useRecipeStatus()

      expect(isRecipeComplete(recipe)).toBe(true)
    })

    it('returns false when at least one input is not linked', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 0, { built: true })
      const input1 = makeMaterial('Desc_OreIron_C', 'Desc_OreIron_C', 'Recipe_IronIngot_C')
      const input2 = makeMaterial('Desc_Coal_C', 'Desc_Coal_C', 'Recipe_IronIngot_C')
      const output = makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Recipe_IronPlate_C')
      recipe.inputs = [input1, input2]
      recipe.outputs = [output]

      mockCurrentFactory.value = makeFactory('Test Factory', [makeFloor([recipe])], {
        recipeLinks: {
          [linkToString(input1)]: true,
          [linkToString(output)]: true,
        },
      })

      const { isRecipeComplete } = useRecipeStatus()

      expect(isRecipeComplete(recipe)).toBe(false)
    })

    it('returns false when at least one output is not linked', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 0, { built: true })
      const input = makeMaterial('Desc_OreIron_C', 'Desc_OreIron_C', 'Recipe_IronIngot_C')
      const output1 = makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Recipe_IronPlate_C')
      const output2 = makeMaterial('Desc_IronScrap_C', 'Recipe_IronIngot_C', 'Recipe_Scrap_C')
      recipe.inputs = [input]
      recipe.outputs = [output1, output2]

      mockCurrentFactory.value = makeFactory('Test Factory', [makeFloor([recipe])], {
        recipeLinks: {
          [linkToString(input)]: true,
          [linkToString(output1)]: true,
        },
      })

      const { isRecipeComplete } = useRecipeStatus()

      expect(isRecipeComplete(recipe)).toBe(false)
    })

    it('calls linkToString for each input and output', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 0, { built: true })
      const input = makeMaterial('Desc_OreIron_C', 'Desc_OreIron_C', 'Recipe_IronIngot_C')
      const output = makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Recipe_IronPlate_C')
      recipe.inputs = [input]
      recipe.outputs = [output]

      mockCurrentFactory.value = makeFactory('Test Factory', [makeFloor([recipe])], {
        recipeLinks: {
          [linkToString(input)]: true,
          [linkToString(output)]: true,
        },
      })

      const { isRecipeComplete } = useRecipeStatus()
      isRecipeComplete(recipe)

      expect(linkToString).toHaveBeenCalledWith(input)
      expect(linkToString).toHaveBeenCalledWith(output)
    })

    it('handles recipes with no inputs', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 0, { built: true })
      const output = makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Recipe_IronPlate_C')
      recipe.inputs = []
      recipe.outputs = [output]

      mockCurrentFactory.value = makeFactory('Test Factory', [makeFloor([recipe])], {
        recipeLinks: {
          [linkToString(output)]: true,
        },
      })

      const { isRecipeComplete } = useRecipeStatus()

      expect(isRecipeComplete(recipe)).toBe(true)
    })

    it('handles recipes with no outputs', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 0, { built: true })
      const input = makeMaterial('Desc_OreIron_C', 'Desc_OreIron_C', 'Recipe_IronIngot_C')
      recipe.inputs = [input]
      recipe.outputs = []

      mockCurrentFactory.value = makeFactory('Test Factory', [makeFloor([recipe])], {
        recipeLinks: {
          [linkToString(input)]: true,
        },
      })

      const { isRecipeComplete } = useRecipeStatus()

      expect(isRecipeComplete(recipe)).toBe(true)
    })
  })

  describe('setRecipeBuilt', () => {
    it('sets recipe built state to true', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 0, { built: false })
      mockGetRecipeByName.mockReturnValue(recipe)

      const { setRecipeBuilt } = useRecipeStatus()
      setRecipeBuilt('Recipe_IronIngot_C', true)

      expect(recipe.built).toBe(true)
      expect(mockGetRecipeByName).toHaveBeenCalledWith('Recipe_IronIngot_C')
    })

    it('sets recipe built state to false', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 0, { built: true })
      mockGetRecipeByName.mockReturnValue(recipe)

      const { setRecipeBuilt } = useRecipeStatus()
      setRecipeBuilt('Recipe_IronIngot_C', false)

      expect(recipe.built).toBe(false)
    })

    it('does nothing when recipe not found', () => {
      mockGetRecipeByName.mockReturnValue(null)

      const { setRecipeBuilt } = useRecipeStatus()

      expect(() => setRecipeBuilt('Recipe_NonExistent_C', true)).not.toThrow()
    })

    it('does nothing when recipe is undefined', () => {
      mockGetRecipeByName.mockReturnValue(undefined)

      const { setRecipeBuilt } = useRecipeStatus()

      expect(() => setRecipeBuilt('Recipe_NonExistent_C', true)).not.toThrow()
    })
  })

  describe('isLinkBuilt', () => {
    it('returns true when link exists in recipeLinks', () => {
      const link = makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Recipe_IronPlate_C')
      mockCurrentFactory.value = makeFactory('Test Factory', [makeFloor()], {
        recipeLinks: {
          [linkToString(link)]: true,
        },
      })

      const { isLinkBuilt } = useRecipeStatus()

      expect(isLinkBuilt(link)).toBe(true)
      expect(linkToString).toHaveBeenCalledWith(link)
    })

    it('returns false when link does not exist in recipeLinks', () => {
      const link = makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Recipe_IronPlate_C')
      mockCurrentFactory.value = makeFactory('Test Factory', [makeFloor()], {
        recipeLinks: {},
      })

      const { isLinkBuilt } = useRecipeStatus()

      expect(isLinkBuilt(link)).toBe(false)
    })

    it('returns false when currentFactory is null', () => {
      const link = makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Recipe_IronPlate_C')

      const { isLinkBuilt } = useRecipeStatus()

      expect(isLinkBuilt(link)).toBe(false)
    })
  })

  describe('setLinkBuilt', () => {
    it('calls factoryStore.setLinkBuiltState with link string', () => {
      const link = makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Recipe_IronPlate_C')

      const { setLinkBuilt } = useRecipeStatus()
      setLinkBuilt(link, true)

      expect(linkToString).toHaveBeenCalledWith(link)
      expect(mockSetLinkBuiltState).toHaveBeenCalledWith(
        'Desc_IronIngot_C:Recipe_IronIngot_C->Recipe_IronPlate_C',
        true,
      )
    })

    it('sets link built state to false', () => {
      const link = makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Recipe_IronPlate_C')

      const { setLinkBuilt } = useRecipeStatus()
      setLinkBuilt(link, false)

      expect(mockSetLinkBuiltState).toHaveBeenCalledWith(
        'Desc_IronIngot_C:Recipe_IronIngot_C->Recipe_IronPlate_C',
        false,
      )
    })
  })

  describe('getRecipePanelValue', () => {
    it('returns formatted string with batchNumber and recipe name', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 2)

      const { getRecipePanelValue } = useRecipeStatus()

      expect(getRecipePanelValue(recipe)).toBe('2-Recipe_IronIngot_C')
    })

    it('handles batchNumber 0', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 0)

      const { getRecipePanelValue } = useRecipeStatus()

      expect(getRecipePanelValue(recipe)).toBe('0-Recipe_IronIngot_C')
    })

    it('handles large batchNumbers', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 99)

      const { getRecipePanelValue } = useRecipeStatus()

      expect(getRecipePanelValue(recipe)).toBe('99-Recipe_IronIngot_C')
    })

    it('handles recipe names with special characters', () => {
      const recipe = makeRecipeNode('Recipe_Alternate_Iron-Ingot_C', 1)

      const { getRecipePanelValue } = useRecipeStatus()

      expect(getRecipePanelValue(recipe)).toBe('1-Recipe_Alternate_Iron-Ingot_C')
    })
  })

  describe('leftoverProductsAsLinks', () => {
    it('returns empty array when no available products', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 0)
      recipe.availableProducts = []

      const { leftoverProductsAsLinks } = useRecipeStatus()

      expect(leftoverProductsAsLinks(recipe)).toEqual([])
    })

    it('filters out products with amount at or below ZERO_THRESHOLD', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 0)
      recipe.availableProducts = [
        { item: 'Desc_IronIngot_C', amount: ZERO_THRESHOLD },
        { item: 'Desc_IronPlate_C', amount: ZERO_THRESHOLD - 0.001 },
        { item: 'Desc_IronRod_C', amount: 0 },
      ]

      const { leftoverProductsAsLinks } = useRecipeStatus()

      expect(leftoverProductsAsLinks(recipe)).toEqual([])
    })

    it('includes products with amount above ZERO_THRESHOLD', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 0)
      recipe.availableProducts = [
        { item: 'Desc_IronIngot_C', amount: ZERO_THRESHOLD + 0.001 },
        { item: 'Desc_IronPlate_C', amount: 60 },
      ]

      const { leftoverProductsAsLinks } = useRecipeStatus()

      const links = leftoverProductsAsLinks(recipe)
      expect(links).toHaveLength(2)
      expect(links[0]).toEqual(
        makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', '', ZERO_THRESHOLD + 0.001),
      )
      expect(links[1]).toEqual(makeMaterial('Desc_IronPlate_C', 'Recipe_IronIngot_C', '', 60))
    })

    it('sets sink to empty string for all leftover products', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 0)
      recipe.availableProducts = [
        { item: 'Desc_IronIngot_C', amount: 30 },
        { item: 'Desc_IronPlate_C', amount: 20 },
      ]

      const { leftoverProductsAsLinks } = useRecipeStatus()

      const links = leftoverProductsAsLinks(recipe)
      expect(links.every((link) => link.sink === '')).toBe(true)
    })

    it('uses recipe name as source for all leftover products', () => {
      const recipe = makeRecipeNode('Recipe_SteelIngot_C', 2)
      recipe.availableProducts = [
        { item: 'Desc_SteelIngot_C', amount: 30 },
        { item: 'Desc_SteelPlate_C', amount: 20 },
      ]

      const { leftoverProductsAsLinks } = useRecipeStatus()

      const links = leftoverProductsAsLinks(recipe)
      expect(links.every((link) => link.source === 'Recipe_SteelIngot_C')).toBe(true)
    })

    it('preserves amount values from available products', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 0)
      recipe.availableProducts = [
        { item: 'Desc_IronIngot_C', amount: 45.5 },
        { item: 'Desc_IronPlate_C', amount: 123.456 },
      ]

      const { leftoverProductsAsLinks } = useRecipeStatus()

      const links = leftoverProductsAsLinks(recipe)
      expect(links[0].amount).toBe(45.5)
      expect(links[1].amount).toBe(123.456)
    })

    it('handles mixed products above and below threshold', () => {
      const recipe = makeRecipeNode('Recipe_IronIngot_C', 0)
      recipe.availableProducts = [
        { item: 'Desc_IronIngot_C', amount: ZERO_THRESHOLD - 0.001 },
        { item: 'Desc_IronPlate_C', amount: 30 },
        { item: 'Desc_IronRod_C', amount: ZERO_THRESHOLD },
        { item: 'Desc_SteelIngot_C', amount: 60 },
      ]

      const { leftoverProductsAsLinks } = useRecipeStatus()

      const links = leftoverProductsAsLinks(recipe)
      expect(links).toHaveLength(2)
      expect(links[0].material).toBe('Desc_IronPlate_C')
      expect(links[1].material).toBe('Desc_SteelIngot_C')
    })
  })
})
