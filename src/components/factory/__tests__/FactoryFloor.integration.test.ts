import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import FactoryFloor from '@/components/factory/FactoryFloor.vue'
import { recipeDatabase } from '@/__tests__/fixtures/data'
import { newRecipeNode } from '@/logistics/graph-node'
import type { Floor } from '@/types/factory'

// Mock the composables
vi.mock('@/composables/useFloorManagement', () => ({
  useFloorManagement: vi.fn(() => ({
    getFloorDisplayName: vi.fn(
      (floorNumber: number, floor: Floor) =>
        `Floor ${floorNumber}` + (floor.name ? ` - ${floor.name}` : ''),
    ),
    openFloorEditor: vi.fn(),
  })),
}))

vi.mock('@/composables/useRecipeStatus', () => ({
  useRecipeStatus: vi.fn(() => ({
    getRecipePanelValue: vi.fn((recipe) => `${recipe.batchNumber || 0}-${recipe.recipe.name}`),
  })),
}))

vi.mock('@/composables/useFloorNavigation', () => ({
  formatFloorId: vi.fn((index: number) => `floor-${index}`),
}))

vi.mock('@/logistics/images', () => ({
  getIconURL: vi.fn((icon: string, size: number) => `https://example.com/icon/${icon}/${size}`),
}))

// Mock RecipeNode component since it's auto-imported
vi.mock('@/components/factory/RecipeNode.vue', () => ({
  default: {
    name: 'RecipeNode',
    props: ['recipe'],
    template: '<div data-testid="recipe-node">Recipe: {{ recipe.recipe.name }}</div>',
  },
}))

describe('FactoryFloor Integration', () => {
  // Test constants from fixtures
  const TEST_ITEMS = {
    IRON_ORE: 'Desc_OreIron_C',
    IRON_INGOT: 'Desc_IronIngot_C',
    IRON_PLATE: 'Desc_IronPlate_C',
  } as const

  const TEST_RECIPES = {
    IRON_INGOT: 'Recipe_IngotIron_C',
    IRON_PLATE: 'Recipe_IronPlate_C',
  } as const

  const TEST_BUILDINGS = {
    SMELTER: 'Build_SmelterMk1_C',
    CONSTRUCTOR: 'Build_ConstructorMk1_C',
  } as const

  // Mock floor data
  const createMockFloor = (customProps: Partial<Floor> = {}): Floor => {
    const ironIngotRecipe = recipeDatabase[TEST_RECIPES.IRON_INGOT]
    const ironPlateRecipe = recipeDatabase[TEST_RECIPES.IRON_PLATE]

    const recipes = [
      newRecipeNode(
        { name: TEST_RECIPES.IRON_INGOT, building: TEST_BUILDINGS.SMELTER, count: 2 },
        ironIngotRecipe.ingredients,
        ironIngotRecipe.products,
      ),
      newRecipeNode(
        { name: TEST_RECIPES.IRON_PLATE, building: TEST_BUILDINGS.CONSTRUCTOR, count: 1 },
        ironPlateRecipe.ingredients,
        ironPlateRecipe.products,
      ),
    ]

    // Set expanded state for testing
    recipes[0].expanded = true
    recipes[1].expanded = false

    return {
      name: 'Test Floor',
      iconItem: TEST_ITEMS.IRON_ORE,
      recipes,
      ...customProps,
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props: Partial<{ floor: Floor; floorNumber: number }> = {}) => {
    const defaultProps = {
      floor: createMockFloor(),
      floorNumber: 1,
    }

    const componentProps = {
      ...defaultProps,
      ...props,
    }

    return mount({
      template: `
        <v-expansion-panels>
          <FactoryFloor :floor="floor" :floor-number="floorNumber" />
        </v-expansion-panels>
      `,
      components: { FactoryFloor },
      setup() {
        return componentProps
      },
    })
  }

  it('renders with default props', () => {
    const wrapper = createWrapper()

    // Check expansion panel exists
    const expansionPanel = wrapper.findComponent({ name: 'VExpansionPanel' })
    expect(expansionPanel.exists()).toBe(true)

    // Check expansion panel title
    const expansionPanelTitle = wrapper.findComponent({ name: 'VExpansionPanelTitle' })
    expect(expansionPanelTitle.exists()).toBe(true)

    // Check expansion panel text
    const expansionPanelText = wrapper.findComponent({ name: 'VExpansionPanelText' })
    expect(expansionPanelText.exists()).toBe(true)
  })

  it('displays correct floor name with custom name', () => {
    const floorWithCustomName = createMockFloor({ name: 'Smelting Floor' })
    const wrapper = createWrapper({ floor: floorWithCustomName, floorNumber: 2 })

    expect(wrapper.text()).toContain('Floor 2 - Smelting Floor')
  })

  it('displays correct floor name without custom name', () => {
    const floorWithoutName = createMockFloor({ name: undefined })
    const wrapper = createWrapper({ floor: floorWithoutName, floorNumber: 3 })

    expect(wrapper.text()).toContain('Floor 3')
    expect(wrapper.text()).not.toContain(' - ')
  })

  it('displays floor icon when iconItem is present', () => {
    const wrapper = createWrapper()

    const icon = wrapper.findComponent({ name: 'VImg' })
    expect(icon.exists()).toBe(true)
    expect(icon.props('width')).toBe('24')
    expect(icon.props('height')).toBe('24')
  })

  it('displays default factory icon when iconItem is not present', () => {
    const floorWithoutIcon = createMockFloor({ iconItem: undefined })
    const wrapper = createWrapper({ floor: floorWithoutIcon })

    const defaultIcon = wrapper.findComponent({ name: 'VIcon' })
    expect(defaultIcon.exists()).toBe(true)
    expect(wrapper.html()).toContain('mdi-factory')
  })

  it('displays correct recipe count', () => {
    const wrapper = createWrapper()

    const chip = wrapper.findComponent({ name: 'VChip' })
    expect(chip.exists()).toBe(true)
    expect(chip.text()).toContain('2 recipes')
  })

  it('displays recipe count for floor with no recipes', () => {
    const emptyFloor = createMockFloor({ recipes: [] })
    const wrapper = createWrapper({ floor: emptyFloor })

    const chip = wrapper.findComponent({ name: 'VChip' })
    expect(chip.text()).toContain('0 recipes')
  })

  it('calls openFloorEditor when edit button is clicked', async () => {
    const { useFloorManagement } = await import('@/composables/useFloorManagement')

    const wrapper = createWrapper({ floorNumber: 2 })

    const editButton = wrapper.find('[data-testid="edit-floor-btn"]').exists()
      ? wrapper.find('[data-testid="edit-floor-btn"]')
      : wrapper.findComponent({ name: 'VBtn' })

    await editButton.trigger('click')

    // Check that the mock was called with correct params
    const mockUseFloorManagement = vi.mocked(useFloorManagement)
    expect(mockUseFloorManagement).toHaveBeenCalled()
    // The openFloorEditor function should be called with floorNumber - 1
    const mockOpenFloorEditor = mockUseFloorManagement.mock.results[0]?.value?.openFloorEditor
    expect(mockOpenFloorEditor).toHaveBeenCalledWith(1)
  })

  it('sets correct expansion panel value based on floor number', () => {
    const wrapper = createWrapper({ floorNumber: 3 })

    const expansionPanel = wrapper.findComponent({ name: 'VExpansionPanel' })
    expect(expansionPanel.props('value')).toBe(2) // floorNumber - 1
  })

  it('uses formatFloorId for expansion panel id', async () => {
    const { formatFloorId } = await import('@/composables/useFloorNavigation')

    createWrapper({ floorNumber: 4 })

    // Verify that formatFloorId was called with the correct parameter
    expect(vi.mocked(formatFloorId)).toHaveBeenCalledWith(3) // floorNumber - 1
  })

  it('uses recipe status composable correctly', async () => {
    const { useRecipeStatus } = await import('@/composables/useRecipeStatus')

    createWrapper()

    // Verify that useRecipeStatus was called
    expect(vi.mocked(useRecipeStatus)).toHaveBeenCalled()
  })

  it('renders expansion panels structure correctly', () => {
    const wrapper = createWrapper()

    // Check basic structure
    const outerExpansionPanels = wrapper.findComponent({ name: 'VExpansionPanels' })
    expect(outerExpansionPanels.exists()).toBe(true)

    const expansionPanel = wrapper.findComponent({ name: 'VExpansionPanel' })
    expect(expansionPanel.exists()).toBe(true)

    // Check that it has the expected structure for recipe content
    const innerExpansionPanels = wrapper.findAllComponents({ name: 'VExpansionPanels' })
    expect(innerExpansionPanels.length).toBeGreaterThan(0)
  })

  it('handles different floor configurations', () => {
    const configurations = [
      { floorNumber: 1, name: 'Ground Floor', iconItem: TEST_ITEMS.IRON_ORE },
      { floorNumber: 5, name: undefined, iconItem: undefined },
      { floorNumber: 10, name: 'Top Floor', iconItem: TEST_ITEMS.IRON_PLATE },
    ]

    configurations.forEach(({ floorNumber, name, iconItem }) => {
      const floor = createMockFloor({ name, iconItem })
      const wrapper = createWrapper({ floor, floorNumber })

      expect(wrapper.findComponent({ name: 'VExpansionPanel' }).exists()).toBe(true)
      expect(wrapper.text()).toContain(`Floor ${floorNumber}`)

      if (name) {
        expect(wrapper.text()).toContain(name)
      }
    })
  })

  it('handles edge case with empty recipe list', () => {
    const emptyFloor = createMockFloor({ recipes: [] })
    const wrapper = createWrapper({ floor: emptyFloor })

    // Should render without errors
    expect(wrapper.findComponent({ name: 'VExpansionPanel' }).exists()).toBe(true)
    expect(wrapper.text()).toContain('0 recipes')

    // Should not render any RecipeNode components
    const recipeNodes = wrapper.findAllComponents({ name: 'RecipeNode' })
    expect(recipeNodes).toHaveLength(0)
  })

  it('calls getFloorDisplayName with correct parameters', async () => {
    const { useFloorManagement } = await import('@/composables/useFloorManagement')

    const floor = createMockFloor()
    createWrapper({ floor, floorNumber: 3 })

    // Verify that useFloorManagement was called
    expect(vi.mocked(useFloorManagement)).toHaveBeenCalled()
    // The getFloorDisplayName function should be called with correct params
    const mockGetFloorDisplayName =
      vi.mocked(useFloorManagement).mock.results[0]?.value?.getFloorDisplayName
    expect(mockGetFloorDisplayName).toHaveBeenCalledWith(3, floor)
  })
})
