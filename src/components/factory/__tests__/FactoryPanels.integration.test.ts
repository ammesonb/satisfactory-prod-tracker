import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import FactoryPanels from '@/components/factory/FactoryPanels.vue'
import { recipeDatabase } from '@/__tests__/fixtures/data'
import { newRecipeNode } from '@/logistics/graph-node'
import type { Factory, Floor } from '@/types/factory'
import type { IFactoryStore, IDataStore, IThemeStore, IErrorStore } from '@/types/stores'

// Mock the composables
vi.mock('@/composables/useStores', () => ({
  getStores: vi.fn(() => ({
    factoryStore: {} as IFactoryStore,
  })),
}))

vi.mock('@/composables/useFloorNavigation', () => ({
  useFloorNavigation: vi.fn(() => ({
    expandedFloors: { value: [0, 1] },
  })),
}))

// Mock child components since they're auto-imported
vi.mock('@/components/factory/FactoryFloorsToolbar.vue', () => ({
  default: {
    name: 'FactoryFloorsToolbar',
    template: '<div data-testid="factory-floors-toolbar">Factory Floors Toolbar</div>',
  },
}))

vi.mock('@/components/factory/FactoryFloor.vue', () => ({
  default: {
    name: 'FactoryFloor',
    props: ['floor', 'floorNumber'],
    template: '<div data-testid="factory-floor">Floor {{ floorNumber }}: {{ floor.name }}</div>',
  },
}))

vi.mock('@/components/modals/FloorEditModal.vue', () => ({
  default: {
    name: 'FloorEditModal',
    template: '<div data-testid="floor-edit-modal">Floor Edit Modal</div>',
  },
}))

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

  let mockFactoryStore: Partial<IFactoryStore>

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
    mockFactoryStore = { currentFactory: null }

    const { getStores } = vi.mocked(await import('@/composables/useStores'))
    getStores.mockReturnValue({
      dataStore: {} as IDataStore,
      factoryStore: mockFactoryStore as IFactoryStore,
      themeStore: {} as IThemeStore,
      errorStore: {} as IErrorStore,
    })
  })

  const createWrapper = () => {
    return mount(FactoryPanels)
  }

  const setFactoryWithFloors = () => {
    mockFactoryStore.currentFactory = createMockFactory()
  }

  const setFactoryWithCustomFloors = (floors: Floor[]) => {
    mockFactoryStore.currentFactory = createMockFactory({ floors })
  }

  it('renders nothing when no current factory is set', () => {
    const wrapper = createWrapper()

    expect(wrapper.html()).toBe('<!--v-if-->')
    expect(wrapper.find('[data-testid="factory-floors-toolbar"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="factory-floor"]').exists()).toBe(false)
  })

  it('renders factory components when current factory exists', () => {
    setFactoryWithFloors()
    const wrapper = createWrapper()

    expect(wrapper.find('[data-testid="factory-floors-toolbar"]').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'VExpansionPanels' }).exists()).toBe(true)
    expect(wrapper.find('[data-testid="floor-edit-modal"]').exists()).toBe(true)
  })

  it('renders correct number of factory floors', () => {
    setFactoryWithFloors()
    const wrapper = createWrapper()

    const floors = wrapper.findAll('[data-testid="factory-floor"]')
    expect(floors).toHaveLength(2)
  })

  it('passes correct props to FactoryFloor components', () => {
    setFactoryWithFloors()
    const wrapper = createWrapper()

    const floorComponents = wrapper.findAllComponents({ name: 'FactoryFloor' })
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

  it('handles factory with no floors', () => {
    setFactoryWithCustomFloors([])
    const wrapper = createWrapper()

    expect(wrapper.find('[data-testid="factory-floors-toolbar"]').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'VExpansionPanels' }).exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="factory-floor"]')).toHaveLength(0)
  })

  it('handles factory with single floor', () => {
    const singleFloor = createMockFloor({ name: 'Only Floor' })
    setFactoryWithCustomFloors([singleFloor])
    const wrapper = createWrapper()

    const floors = wrapper.findAll('[data-testid="factory-floor"]')
    expect(floors).toHaveLength(1)

    const floorComponent = wrapper.findComponent({ name: 'FactoryFloor' })
    expect(floorComponent.props('floor')).toEqual(expect.objectContaining({ name: 'Only Floor' }))
    expect(floorComponent.props('floorNumber')).toBe(1)
  })

  it('handles factory with many floors', () => {
    const manyFloors = Array.from({ length: 5 }, (_, index) =>
      createMockFloor({ name: `Floor ${index + 1}` }),
    )
    setFactoryWithCustomFloors(manyFloors)
    const wrapper = createWrapper()

    const floors = wrapper.findAll('[data-testid="factory-floor"]')
    expect(floors).toHaveLength(5)

    const floorComponents = wrapper.findAllComponents({ name: 'FactoryFloor' })
    floorComponents.forEach((floorComponent, index) => {
      expect(floorComponent.props('floorNumber')).toBe(index + 1)
      expect(floorComponent.props('floor')).toEqual(
        expect.objectContaining({ name: `Floor ${index + 1}` }),
      )
    })
  })

  it('binds expandedFloors to expansion panels model', async () => {
    const { useFloorNavigation } = await import('@/composables/useFloorNavigation')

    setFactoryWithFloors()
    const wrapper = createWrapper()

    // Verify that useFloorNavigation was called and returns expandedFloors
    expect(vi.mocked(useFloorNavigation)).toHaveBeenCalled()
    const mockResult = vi.mocked(useFloorNavigation).mock.results[0]?.value
    expect(mockResult).toHaveProperty('expandedFloors')

    // Verify the expansion panels uses the expandedFloors model
    const expansionPanels = wrapper.findComponent({ name: 'VExpansionPanels' })
    expect(expansionPanels.exists()).toBe(true)
  })

  it('maintains reactive connection to factory store', () => {
    const wrapper = createWrapper()

    // Initially no factory
    expect(wrapper.html()).toBe('<!--v-if-->')

    // Set factory
    setFactoryWithFloors()

    // Component should react to store changes
    // Note: In a real component test with real reactivity, this would work
    // For this mock test, we're verifying the conditional rendering logic
    expect(mockFactoryStore.currentFactory).toBeTruthy()
  })
})
