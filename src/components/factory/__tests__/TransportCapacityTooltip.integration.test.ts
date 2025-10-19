import { mount } from '@vue/test-utils'
import { isRef } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  mockBuildingCounts,
  mockIsFluidMaterial,
  mockTransportItems,
} from '@/__tests__/fixtures/composables/transport'
import { recipeDatabase } from '@/__tests__/fixtures/data'
import { useTransport } from '@/composables/useTransport'
import { newRecipeNode, type RecipeNode } from '@/logistics/graph-node'
import type { Material } from '@/types/factory'

import CachedIcon from '@/components/common/CachedIcon.vue'
import TransportCapacityTooltip from '@/components/factory/TransportCapacityTooltip.vue'

// Use centralized fixtures for mocking composables
vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return { getStores: mockGetStores }
})

// Mock the useTransport composable
vi.mock('@/composables/useTransport', async () => {
  const { mockUseTransport } = await import('@/__tests__/fixtures/composables/transport')
  return { useTransport: mockUseTransport }
})

describe('TransportCapacityTooltip Integration', () => {
  // Single test data definition
  const TEST_RECIPE = 'Recipe_Fake_IronIngot_C'
  const TEST_MATERIAL = 'Desc_OreIron_C'

  const createTestRecipe = (): RecipeNode => {
    const recipe = recipeDatabase[TEST_RECIPE]
    return newRecipeNode(
      { name: recipe.name, building: recipe.producedIn[0], count: 1 },
      recipe.ingredients,
      recipe.products,
    )
  }

  const createTestLink = (amount = 30): Material => ({
    source: 'test-source',
    sink: 'test-sink',
    material: TEST_MATERIAL,
    amount,
  })

  const createWrapper = (overrideProps = {}) => {
    const defaultProps = {
      recipe: createTestRecipe(),
      link: createTestLink(),
      direction: 'input' as const,
      isHovered: true,
    }
    return mount(TransportCapacityTooltip, {
      props: { ...defaultProps, ...overrideProps },
    })
  }

  beforeEach(async () => {
    vi.clearAllMocks()
  })

  it('calls useTransport composable with correct parameters', async () => {
    createWrapper({ direction: 'output', isHovered: false })

    const calls = vi.mocked(useTransport).mock.calls
    expect(calls).toHaveLength(1)
    expect(calls[0][2]).toBe('output')
    // isHovered should be passed as a reactive reference
    expect(isRef(calls[0][3])).toBe(true)
  })

  it('displays building counts from composable results', async () => {
    mockBuildingCounts.mockReturnValue([3, 2, 1])

    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('3 × MK1')
    expect(wrapper.text()).toContain('2 × MK2')
    expect(wrapper.text()).toContain('1 × MK3')
  })

  it('renders transport items with correct icons', async () => {
    mockBuildingCounts.mockReturnValue([1, 1, 1])

    const wrapper = createWrapper()
    const cachedIcons = wrapper.findAllComponents(CachedIcon)

    expect(cachedIcons).toHaveLength(3)
    expect(cachedIcons[0].props('icon')).toBe('conveyor-mk1')
    expect(cachedIcons[1].props('icon')).toBe('conveyor-mk2')
    expect(cachedIcons[2].props('icon')).toBe('conveyor-mk3')
  })

  it('handles fluid materials correctly', async () => {
    const pipelineItems = [
      { name: 'Pipeline Mk.1', icon: 'pipeline-mk1' },
      { name: 'Pipeline Mk.2', icon: 'pipeline-mk2' },
    ]

    mockIsFluidMaterial.mockReturnValue(true)
    mockTransportItems.mockReturnValue(pipelineItems)
    mockBuildingCounts.mockReturnValue([2, 1])

    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('2 × MK1')
    expect(wrapper.text()).toContain('1 × MK2')

    const cachedIcons = wrapper.findAllComponents(CachedIcon)
    expect(cachedIcons[0].props('icon')).toBe('pipeline-mk1')
    expect(cachedIcons[1].props('icon')).toBe('pipeline-mk2')
  })
})
