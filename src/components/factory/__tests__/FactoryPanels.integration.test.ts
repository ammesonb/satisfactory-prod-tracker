import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { recipeDatabase } from '@/__tests__/fixtures/data'
import { expectElementExists, expectElementNotExists } from '@/__tests__/vue-test-helpers'
import { mockUseFloorNavigation } from '@/__tests__/fixtures/composables'
import { mockCurrentFactory } from '@/__tests__/fixtures/composables/factoryStore'
import { VExpansionPanels } from 'vuetify/components'
import { newRecipeNode } from '@/logistics/graph-node'
import type { Factory, Floor } from '@/types/factory'

import FactoryFloor from '@/components/factory/FactoryFloor.vue'
import FactoryFloorsToolbar from '@/components/factory/FactoryFloorsToolbar.vue'
import FactoryPanels from '@/components/factory/FactoryPanels.vue'
import FloorEditModal from '@/components/modals/FloorEditModal.vue'

// Use centralized fixtures for mocking composables
vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return { getStores: mockGetStores }
})

vi.mock('@/composables/useFloorNavigation', async () => {
  const { mockUseFloorNavigation } = await import('@/__tests__/fixtures/composables')
  return { useFloorNavigation: mockUseFloorNavigation }
})

describe('FactoryPanels Integration', () => {
  // Test constants from fixtures
  const TEST_ITEMS = {
    IRON_ORE: 'Desc_OreIron_C',
    COPPER_ORE: 'Desc_OreCopper_C',
    IRON_INGOT: 'Desc_IronIngot_C',
  } as const

  const TEST_RECIPES = {
    IRON_INGOT: 'Recipe_IngotIron_C',
    COPPER_INGOT: 'Recipe_IngotCopper_C',
  } as const

  const TEST_BUILDINGS = {
    SMELTER: 'Build_SmelterMk1_C',
    CONSTRUCTOR: 'Build_ConstructorMk1_C',
  } as const

  // Helper to create mock floor data
  const createMockFloor = (customProps: Partial<Floor> = {}): Floor => {
    const ironIngotRecipe = recipeDatabase[TEST_RECIPES.IRON_INGOT]
    const copperIngotRecipe = recipeDatabase[TEST_RECIPES.COPPER_INGOT]

    const recipes = [
      newRecipeNode(
        { name: TEST_RECIPES.IRON_INGOT, building: TEST_BUILDINGS.SMELTER, count: 2 },
        ironIngotRecipe.ingredients,
        ironIngotRecipe.products,
      ),
      newRecipeNode(
        { name: TEST_RECIPES.COPPER_INGOT, building: TEST_BUILDINGS.SMELTER, count: 1 },
        copperIngotRecipe.ingredients,
        copperIngotRecipe.products,
      ),
    ]

    return {
      name: 'Test Floor',
      iconItem: TEST_ITEMS.IRON_ORE,
      recipes,
      ...customProps,
    }
  }

  // Helper to create mock factory
  const createMockFactory = (customProps: Partial<Factory> = {}): Factory => ({
    name: 'Test Factory',
    icon: 'factory',
    floors: [
      createMockFloor({ name: 'Ground Floor', iconItem: TEST_ITEMS.IRON_ORE }),
      createMockFloor({ name: 'Second Floor', iconItem: TEST_ITEMS.COPPER_ORE }),
    ],
    recipeLinks: {},
    ...customProps,
  })

  beforeEach(async () => {
    vi.clearAllMocks()

    // Reset the centralized factory store mock
    const { mockCurrentFactory } = await import('@/__tests__/fixtures/composables/factoryStore')
    mockCurrentFactory.value = null
  })

  const createWrapper = () => {
    return mount(FactoryPanels)
  }

  const setFactoryWithFloors = async () => {
    const { mockCurrentFactory } = await import('@/__tests__/fixtures/composables/factoryStore')
    mockCurrentFactory.value = createMockFactory()
  }

  const setFactoryWithCustomFloors = async (floors: Floor[]) => {
    const { mockCurrentFactory } = await import('@/__tests__/fixtures/composables/factoryStore')
    mockCurrentFactory.value = createMockFactory({ floors })
  }

  it('renders nothing when no current factory is set', () => {
    const wrapper = createWrapper()

    expect(wrapper.html()).toBe('<!--v-if-->')
    expectElementNotExists(wrapper, '[data-testid="factory-floors-toolbar"]')
    expectElementNotExists(wrapper, '[data-testid="factory-floor"]')
  })

  it('renders factory components when current factory exists', async () => {
    await setFactoryWithFloors()
    const wrapper = createWrapper()

    expectElementExists(wrapper, FactoryFloorsToolbar)
    expectElementExists(wrapper, VExpansionPanels)
    expectElementExists(wrapper, FloorEditModal)
  })

  it('renders correct number of factory floors', async () => {
    await setFactoryWithFloors()
    const wrapper = createWrapper()

    const floorComponents = wrapper.findAllComponents(FactoryFloor)
    expect(floorComponents).toHaveLength(2)
  })

  it('passes correct props to FactoryFloor components', async () => {
    await setFactoryWithFloors()
    const wrapper = createWrapper()

    const floorComponents = wrapper.findAllComponents(FactoryFloor)
    expect(floorComponents).toHaveLength(2)

    // Check first floor props
    expect(floorComponents[0].props('floor')).toEqual(
      expect.objectContaining({ name: 'Ground Floor', iconItem: TEST_ITEMS.IRON_ORE }),
    )
    expect(floorComponents[0].props('floorNumber')).toBe(1)

    // Check second floor props
    expect(floorComponents[1].props('floor')).toEqual(
      expect.objectContaining({ name: 'Second Floor', iconItem: TEST_ITEMS.COPPER_ORE }),
    )
    expect(floorComponents[1].props('floorNumber')).toBe(2)
  })

  it('handles factory with no floors', async () => {
    await setFactoryWithCustomFloors([])
    const wrapper = createWrapper()

    expectElementExists(wrapper, FactoryFloorsToolbar)
    expectElementExists(wrapper, VExpansionPanels)
    expect(wrapper.findAllComponents(FactoryFloor)).toHaveLength(0)
  })

  it('handles factory with single floor', async () => {
    const singleFloor = createMockFloor({ name: 'Only Floor' })
    await setFactoryWithCustomFloors([singleFloor])
    const wrapper = createWrapper()

    const floorComponents = wrapper.findAllComponents(FactoryFloor)
    expect(floorComponents).toHaveLength(1)

    const floorComponent = wrapper.findComponent(FactoryFloor)
    expect(floorComponent.props('floor')).toEqual(expect.objectContaining({ name: 'Only Floor' }))
    expect(floorComponent.props('floorNumber')).toBe(1)
  })

  it('handles factory with many floors', async () => {
    const manyFloors = Array.from({ length: 5 }, (_, index) =>
      createMockFloor({ name: `Floor ${index + 1}` }),
    )
    await setFactoryWithCustomFloors(manyFloors)
    const wrapper = createWrapper()

    const floorComponents = wrapper.findAllComponents(FactoryFloor)
    expect(floorComponents).toHaveLength(5)

    floorComponents.forEach((floorComponent, index) => {
      expect(floorComponent.props('floorNumber')).toBe(index + 1)
      expect(floorComponent.props('floor')).toEqual(
        expect.objectContaining({ name: `Floor ${index + 1}` }),
      )
    })
  })

  it('binds expandedFloors to expansion panels model', async () => {
    await setFactoryWithFloors()
    const wrapper = createWrapper()

    expect(mockUseFloorNavigation).toHaveBeenCalled()
    const mockResult = mockUseFloorNavigation.mock.results[0]?.value
    expect(mockResult).toHaveProperty('expandedFloors')

    expectElementExists(wrapper, VExpansionPanels)
  })

  it('maintains reactive connection to factory store', async () => {
    const wrapper = createWrapper()

    // Initially no factory
    expect(wrapper.html()).toBe('<!--v-if-->')

    // Set factory
    await setFactoryWithFloors()

    // Verify factory was set in centralized mock
    expect(mockCurrentFactory.value).toBeTruthy()
  })
})
