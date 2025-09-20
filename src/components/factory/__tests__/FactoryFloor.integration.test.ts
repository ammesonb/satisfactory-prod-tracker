import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import FactoryFloor from '@/components/factory/FactoryFloor.vue'
import { recipeDatabase } from '@/__tests__/fixtures/data'
import { newRecipeNode } from '@/logistics/graph-node'
import type { Floor } from '@/types/factory'
import { getMockFloorManagement } from '@/__tests__/fixtures/composables/testUtils'
import { mockUseRecipeStatus } from '@/__tests__/fixtures/composables'

vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return { getStores: mockGetStores }
})

vi.mock('@/composables/useFloorManagement', async () => {
  const { mockUseFloorManagement } = await import('@/__tests__/fixtures/composables')
  return { useFloorManagement: mockUseFloorManagement }
})

vi.mock('@/composables/useRecipeStatus', async () => {
  const { mockUseRecipeStatus } = await import('@/__tests__/fixtures/composables')
  return { useRecipeStatus: mockUseRecipeStatus }
})

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
        <v-expansion-panels v-model="expandedPanels">
          <FactoryFloor :floor="floor" :floor-number="floorNumber" />
        </v-expansion-panels>
      `,
      components: { FactoryFloor },
      setup() {
        return {
          ...componentProps,
          expandedPanels: [componentProps.floorNumber - 1], // Expand the floor panel
        }
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
    const wrapper = createWrapper({ floorNumber: 2 })

    const editButton = wrapper.find('[data-testid="edit-floor-btn"]').exists()
      ? wrapper.find('[data-testid="edit-floor-btn"]')
      : wrapper.findComponent({ name: 'VBtn' })

    await editButton.trigger('click')

    const mockOpenFloorEditor = (await getMockFloorManagement()).openFloorEditor
    expect(mockOpenFloorEditor).toHaveBeenCalledWith(1)
  })

  it('sets correct expansion panel value based on floor number', () => {
    const wrapper = createWrapper({ floorNumber: 3 })

    const expansionPanel = wrapper.findComponent({ name: 'VExpansionPanel' })
    expect(expansionPanel.props('value')).toBe(2) // floorNumber - 1
  })

  it('sets correct expansion panel id using formatFloorId', () => {
    const wrapper = createWrapper({ floorNumber: 4 })

    const expansionPanel = wrapper.findComponent({ name: 'VExpansionPanel' })
    expect(expansionPanel.attributes('id')).toBe('floor-3')
  })

  it('manages recipe expansion state using getRecipePanelValue', async () => {
    // Create floor with both expanded and collapsed recipes
    const floor = createMockFloor()
    // Ensure we have both expanded and non-expanded recipes
    floor.recipes[0].expanded = true
    floor.recipes[1].expanded = false

    const wrapper = createWrapper({ floor, floorNumber: 1 })

    await wrapper.vm.$nextTick()

    expect(mockUseRecipeStatus).toHaveBeenCalled()

    const allExpansionPanels = wrapper.findAllComponents({ name: 'VExpansionPanels' })
    const innerExpansionPanels = allExpansionPanels.find((panel) => panel.props('multiple'))

    expect(innerExpansionPanels).toBeTruthy()

    const expectedExpandedValues = ['0-Recipe_IngotIron_C'] // Only first recipe is expanded
    expect(innerExpansionPanels!.props('modelValue')).toEqual(expectedExpandedValues)

    // Should render all RecipeNode components regardless of expansion state
    const recipeNodes = wrapper.findAllComponents({ name: 'RecipeNode' })
    expect(recipeNodes).toHaveLength(2)
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

  it('displays floor name using getFloorDisplayName result', async () => {
    const floor = createMockFloor({ name: 'Custom Floor' })
    const wrapper = createWrapper({ floor, floorNumber: 3 })

    const mockGetFloorDisplayName = (await getMockFloorManagement()).getFloorDisplayName
    expect(mockGetFloorDisplayName).toHaveBeenCalledWith(3, floor)

    expect(wrapper.text()).toContain('Floor 3 - Custom Floor')
  })
})
