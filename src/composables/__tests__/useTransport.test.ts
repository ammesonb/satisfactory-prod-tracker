import { createPinia, setActivePinia } from 'pinia'
import { computed, ref } from 'vue'
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
        isHovered: ref(false),
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

      const { buildingCounts } = useTransport(recipe, link, 'input', ref(true))

      expect(buildingCounts.value).toEqual([1, 0, 0])
      expect(mockCalculateTransportCapacity).toHaveBeenCalledWith('Desc_IronIngot_C', 60, 2)
    })

    it('calculates building counts for output when hovered', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 3 })
      const link = makeMaterial('Desc_IronPlate_C', 'Source', 'Sink', 120)
      recipe.outputs = [link]

      mockCalculateTransportCapacity.mockReturnValue([2, 0, 0])

      const { buildingCounts } = useTransport(recipe, link, 'output', ref(true))

      expect(buildingCounts.value).toEqual([2, 0, 0])
      expect(mockCalculateTransportCapacity).toHaveBeenCalledWith('Desc_IronPlate_C', 120, 3)
    })

    it('returns empty array when recipe link not found', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0)
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink')
      recipe.inputs = [makeMaterial('Desc_CopperIngot_C', 'Source', 'Sink')]

      const { buildingCounts } = useTransport(recipe, link, 'input', ref(true))

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

      const { buildingCounts } = useTransport(recipe, targetLink, 'input', ref(true))

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

      const { buildingCounts } = useTransport(recipe, link, 'input', ref(true))

      expect(buildingCounts.value).toEqual([])
    })

    it('handles zero amount materials', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 1 })
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 0)
      const recipeLink = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 0)
      recipe.inputs = [recipeLink]

      mockCalculateTransportCapacity.mockReturnValue([0])

      const { buildingCounts } = useTransport(recipe, link, 'input', ref(true))

      expect(buildingCounts.value).toEqual([0])
      expect(mockCalculateTransportCapacity).toHaveBeenCalledWith('Desc_IronIngot_C', 0, 1)
    })

    it('handles fractional recipe counts', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 2.5 })
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 100)
      const recipeLink = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 100)
      recipe.inputs = [recipeLink]

      mockCalculateTransportCapacity.mockReturnValue([2, 1, 0])

      const { buildingCounts } = useTransport(recipe, link, 'input', ref(true))

      expect(buildingCounts.value).toEqual([2, 1, 0])
      expect(mockCalculateTransportCapacity).toHaveBeenCalledWith('Desc_IronIngot_C', 100, 2.5)
    })
  })

  describe('reactivity with isHovered', () => {
    it('recalculates buildingCounts when isHovered changes', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 1 })
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 30)
      recipe.inputs = [link]

      const isHovered = ref(false)
      mockCalculateTransportCapacity.mockReturnValue([1, 0])

      const { buildingCounts } = useTransport(recipe, link, 'input', isHovered)

      expect(buildingCounts.value).toEqual([])
      expect(mockCalculateTransportCapacity).not.toHaveBeenCalled()

      isHovered.value = true

      expect(buildingCounts.value).toEqual([1, 0])
      expect(mockCalculateTransportCapacity).toHaveBeenCalledWith('Desc_IronIngot_C', 30, 1)
    })

    it('works with computed refs', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 1 })
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 45)
      recipe.inputs = [link]

      const baseHover = ref(false)
      const isHovered = computed(() => baseHover.value)
      mockCalculateTransportCapacity.mockReturnValue([1, 1, 0])

      const { buildingCounts } = useTransport(recipe, link, 'input', isHovered)

      expect(buildingCounts.value).toEqual([])

      baseHover.value = true

      expect(buildingCounts.value).toEqual([1, 1, 0])
      expect(mockCalculateTransportCapacity).toHaveBeenCalledWith('Desc_IronIngot_C', 45, 1)
    })
  })

  describe('minimumUsableTier', () => {
    it('returns tier 0 for amounts within MK1 belt capacity (60)', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 1 })
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 30)
      recipe.inputs = [link]

      const { minimumUsableTier } = useTransport(recipe, link, 'input')

      expect(minimumUsableTier.value).toBe(0)
    })

    it('returns tier 1 for amounts exceeding MK1 but within MK2 belt capacity (120)', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 1 })
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 100)
      recipe.inputs = [link]

      const { minimumUsableTier } = useTransport(recipe, link, 'input')

      expect(minimumUsableTier.value).toBe(1)
    })

    it('returns tier 2 for amounts exceeding MK2 but within MK3 belt capacity (270)', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 1 })
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 240)
      recipe.inputs = [link]

      const { minimumUsableTier } = useTransport(recipe, link, 'input')

      expect(minimumUsableTier.value).toBe(2)
    })

    it('returns highest tier for amounts exceeding all capacities', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 1 })
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 1500)
      recipe.inputs = [link]

      const { minimumUsableTier } = useTransport(recipe, link, 'input')

      expect(minimumUsableTier.value).toBe(BELT_CAPACITIES.length - 1)
    })

    it('returns tier 0 for amounts within MK1 pipeline capacity (300)', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 1 })
      const link = makeMaterial('Desc_Water_C', 'Source', 'Sink', 150)
      recipe.inputs = [link]

      const { minimumUsableTier } = useTransport(recipe, link, 'input')

      expect(minimumUsableTier.value).toBe(0)
    })

    it('returns tier 1 for amounts exceeding MK1 but within MK2 pipeline capacity (600)', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 1 })
      const link = makeMaterial('Desc_Water_C', 'Source', 'Sink', 450)
      recipe.inputs = [link]

      const { minimumUsableTier } = useTransport(recipe, link, 'input')

      expect(minimumUsableTier.value).toBe(1)
    })

    it('returns highest tier for fluids exceeding all pipeline capacities', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 1 })
      const link = makeMaterial('Desc_Water_C', 'Source', 'Sink', 700)
      recipe.inputs = [link]

      const { minimumUsableTier } = useTransport(recipe, link, 'input')

      expect(minimumUsableTier.value).toBe(PIPELINE_CAPACITIES.length - 1)
    })

    it('handles edge case at exact capacity boundary', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 1 })
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 60)
      recipe.inputs = [link]

      const { minimumUsableTier } = useTransport(recipe, link, 'input')

      expect(minimumUsableTier.value).toBe(0)
    })

    it('returns highest tier when recipe link not found', () => {
      const recipe = makeRecipeNode('Recipe_Test_C', 0, { count: 1 })
      const link = makeMaterial('Desc_IronIngot_C', 'Source', 'Sink', 30)
      recipe.inputs = [] // No inputs - link won't be found

      const { minimumUsableTier } = useTransport(recipe, link, 'input')

      expect(minimumUsableTier.value).toBe(BELT_CAPACITIES.length - 1)
    })
  })
})
