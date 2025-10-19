import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { makeMaterial, makeRecipeNode } from '@/__tests__/fixtures/data'
import { createMockDataStore } from '@/__tests__/fixtures/stores/dataStore'
import { useTransport } from '@/composables/useTransport'
import {
  BELT_CAPACITIES,
  BELT_ITEM_NAMES,
  PIPELINE_CAPACITIES,
  PIPELINE_ITEM_NAMES,
} from '@/logistics/constants'
import * as graphNode from '@/logistics/graph-node'

vi.mock('@/composables/useStores', () => ({
  getStores: vi.fn(() => ({
    dataStore: createMockDataStore(),
  })),
}))

vi.mock('@/logistics/graph-node', async () => {
  const actual = await vi.importActual('@/logistics/graph-node')
  return {
    ...actual,
    calculateTransportCapacity: vi.fn(),
  }
})

describe('useTransport', () => {
  const mockCalculateTransportCapacity = vi.mocked(graphNode.calculateTransportCapacity)

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('isFluidMaterial', () => {
    const testCases = [
      { material: 'Desc_Water_C', expected: true, name: 'water' },
      { material: 'Desc_LiquidOil_C', expected: true, name: 'oil' },
      { material: 'Desc_IronIngot_C', expected: false, name: 'iron ingot' },
      { material: 'Desc_IronPlate_C', expected: false, name: 'iron plate' },
    ]

    testCases.forEach(({ material, expected, name }) => {
      it(`returns ${expected} for ${name}`, () => {
        const recipe = makeRecipeNode('Recipe_Test_C', 0)
        const link = makeMaterial(material, 'Source', 'Sink')

        const { isFluidMaterial } = useTransport(recipe, link, 'input')

        expect(isFluidMaterial.value).toBe(expected)
      })
    })
  })

  describe('capacities', () => {
    it('returns belt capacities for solid materials', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0)
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink')

      const { capacities } = useTransport(recipe, link, 'input')

      expect(capacities.value).toEqual(BELT_CAPACITIES)
    })

    it('returns pipeline capacities for fluid materials', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0)
      const link = makeMaterial('Desc_Water_C', 'Source', 'Sink')

      const { capacities } = useTransport(recipe, link, 'input')

      expect(capacities.value).toEqual(PIPELINE_CAPACITIES)
    })
  })

  describe('transportItems', () => {
    it('returns belt items for solid materials', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0)
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink')

      const { transportItems } = useTransport(recipe, link, 'input')

      expect(transportItems.value).toHaveLength(BELT_ITEM_NAMES.length)
    })

    it('returns pipeline items for fluid materials', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0)
      const link = makeMaterial('Desc_Water_C', 'Source', 'Sink')

      const { transportItems } = useTransport(recipe, link, 'input')

      expect(transportItems.value).toHaveLength(PIPELINE_ITEM_NAMES.length)
    })
  })

  describe('buildingCounts', () => {
    const testCases = [
      {
        name: 'returns empty array when not hovered',
        isHovered: false,
        shouldCalculate: false,
      },
      {
        name: 'returns empty array when isHovered is undefined',
        isHovered: undefined,
        shouldCalculate: false,
      },
    ]

    testCases.forEach(({ name, isHovered, shouldCalculate }) => {
      it(name, () => {
        const recipe = makeRecipeNode('Recipe_Test_C', 0)
        const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink')
        recipe.inputs = [link]

        const { buildingCounts } = useTransport(recipe, link, 'input', isHovered)

        expect(buildingCounts.value).toEqual([])
        if (shouldCalculate) {
          expect(mockCalculateTransportCapacity).toHaveBeenCalled()
        } else {
          expect(mockCalculateTransportCapacity).not.toHaveBeenCalled()
        }
      })
    })

    it('calculates building counts for input when hovered', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 2 })
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 60)
      recipe.inputs = [link]

      mockCalculateTransportCapacity.mockReturnValue([1, 0, 0])

      const { buildingCounts } = useTransport(recipe, link, 'input', true)

      expect(buildingCounts.value).toEqual([1, 0, 0])
      expect(mockCalculateTransportCapacity).toHaveBeenCalledWith('Desc_IronIngot_C', 60, 2)
    })

    it('calculates building counts for output when hovered', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 3 })
      const link = makeMaterial('Desc_IronPlate_C', 'Source', 'Sink', 120)
      recipe.outputs = [link]

      mockCalculateTransportCapacity.mockReturnValue([2, 0, 0])

      const { buildingCounts } = useTransport(recipe, link, 'output', true)

      expect(buildingCounts.value).toEqual([2, 0, 0])
      expect(mockCalculateTransportCapacity).toHaveBeenCalledWith('Desc_IronPlate_C', 120, 3)
    })

    it('returns empty array when recipe link not found', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0)
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink')
      recipe.inputs = [makeMaterial('Desc_CopperIngot_C', 'Source', 'Sink')]

      const { buildingCounts } = useTransport(recipe, link, 'input', true)

      expect(buildingCounts.value).toEqual([])
      expect(mockCalculateTransportCapacity).not.toHaveBeenCalled()
    })

    it('handles multiple inputs and finds correct one', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 1 })
      const targetLink = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 30)
      recipe.inputs = [
        makeMaterial('Desc_CopperIngot_C', 'Source', 'Sink', 15),
        targetLink,
        makeMaterial('Desc_Coal_C', 'Source', 'Sink', 45),
      ]

      mockCalculateTransportCapacity.mockReturnValue([1, 0])

      const { buildingCounts } = useTransport(recipe, targetLink, 'input', true)

      expect(buildingCounts.value).toEqual([1, 0])
      expect(mockCalculateTransportCapacity).toHaveBeenCalledWith('Desc_IronIngot_C', 30, 1)
    })
  })

  describe('reactivity', () => {
    it('recalculates when different materials are used', () => {
      const recipe1 = makeRecipeNode('Recipe_Test_C', 0)
      const solidLink = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink')

      const {
        isFluidMaterial: isFluid1,
        capacities: cap1,
        transportItems: items1,
      } = useTransport(recipe1, solidLink, 'input')

      expect(isFluid1.value).toBe(false)
      expect(cap1.value).toEqual(BELT_CAPACITIES)
      expect(items1.value).toHaveLength(BELT_ITEM_NAMES.length)

      const recipe2 = makeRecipeNode('Recipe_Test_C', 0)
      const fluidLink = makeMaterial('Desc_Water_C', 'Source', 'Sink')

      const {
        isFluidMaterial: isFluid2,
        capacities: cap2,
        transportItems: items2,
      } = useTransport(recipe2, fluidLink, 'input')

      expect(isFluid2.value).toBe(true)
      expect(cap2.value).toEqual(PIPELINE_CAPACITIES)
      expect(items2.value).toHaveLength(PIPELINE_ITEM_NAMES.length)
    })
  })

  describe('edge cases', () => {
    it('handles recipes with no inputs', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0)
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink')
      recipe.inputs = []

      const { buildingCounts } = useTransport(recipe, link, 'input', true)

      expect(buildingCounts.value).toEqual([])
    })

    it('handles zero amount materials', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 1 })
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 0)
      const recipeLink = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 0)
      recipe.inputs = [recipeLink]

      mockCalculateTransportCapacity.mockReturnValue([0])

      const { buildingCounts } = useTransport(recipe, link, 'input', true)

      expect(buildingCounts.value).toEqual([0])
      expect(mockCalculateTransportCapacity).toHaveBeenCalledWith('Desc_IronIngot_C', 0, 1)
    })

    it('handles fractional recipe counts', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 2.5 })
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 100)
      const recipeLink = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 100)
      recipe.inputs = [recipeLink]

      mockCalculateTransportCapacity.mockReturnValue([2, 1, 0])

      const { buildingCounts } = useTransport(recipe, link, 'input', true)

      expect(buildingCounts.value).toEqual([2, 1, 0])
      expect(mockCalculateTransportCapacity).toHaveBeenCalledWith('Desc_IronIngot_C', 100, 2.5)
    })
  })
})
