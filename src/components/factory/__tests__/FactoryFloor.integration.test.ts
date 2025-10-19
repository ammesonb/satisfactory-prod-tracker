import { mockUseRecipeStatus } from '@/__tests__/fixtures/composables'
import { getMockFloorManagement } from '@/__tests__/fixtures/composables/testUtils'
import { recipeDatabase } from '@/__tests__/fixtures/data'
import { component } from '@/__tests__/vue-test-helpers'
import FactoryFloor from '@/components/factory/FactoryFloor.vue'
import { newRecipeNode } from '@/logistics/graph-node'
import type { Floor } from '@/types/factory'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  VBtn,
  VChip,
  VExpansionPanel,
  VExpansionPanels,
  VExpansionPanelText,
  VExpansionPanelTitle,
  VIcon,
  VImg,
} from 'vuetify/components'

import RecipeNode from '@/components/factory/RecipeNode.vue'

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

    component(wrapper, VExpansionPanel).assert()
    component(wrapper, VExpansionPanelTitle).assert()
    component(wrapper, VExpansionPanelText).assert()
  })

  it('displays correct floor name with custom name', () => {
    const floorWithCustomName = createMockFloor({ name: 'Smelting Floor' })
    const wrapper = createWrapper({ floor: floorWithCustomName, floorNumber: 2 })

    component(wrapper, VExpansionPanelTitle).assert({ text: ['Floor 2 - Smelting Floor'] })
  })

  it('displays correct floor name without custom name', () => {
    const floorWithoutName = createMockFloor({ name: undefined })
    const wrapper = createWrapper({ floor: floorWithoutName, floorNumber: 3 })

    component(wrapper, VExpansionPanelTitle).assert({ text: ['Floor 3'] })
    expect(wrapper.text()).not.toContain(' - ')
  })

  it('displays floor icon when iconItem is present', () => {
    const wrapper = createWrapper()

    component(wrapper, VImg).assert({ exists: true, props: { width: '24', height: '24' } })
  })

  it('displays default factory icon when iconItem is not present', () => {
    const floorWithoutIcon = createMockFloor({ iconItem: undefined })
    const wrapper = createWrapper({ floor: floorWithoutIcon })

    component(wrapper, VIcon).assert({ exists: true, html: ['mdi-factory'] })
  })

  it('displays correct recipe count', () => {
    const wrapper = createWrapper()

    component(wrapper, VChip).assert({ exists: true, text: ['2 recipes'] })
  })

  it('displays recipe count for floor with no recipes', () => {
    const emptyFloor = createMockFloor({ recipes: [] })
    const wrapper = createWrapper({ floor: emptyFloor })

    component(wrapper, VChip).assert({ exists: true, text: ['0 recipes'] })
  })

  it('calls openFloorEditor when edit button is clicked', async () => {
    const wrapper = createWrapper({ floorNumber: 2 })

    const editButton = wrapper.find('[data-testid="edit-floor-btn"]').exists()
      ? wrapper.find('[data-testid="edit-floor-btn"]')
      : wrapper.findComponent(VBtn)

    await editButton.trigger('click')

    const mockOpenFloorEditor = (await getMockFloorManagement()).openFloorEditor
    expect(mockOpenFloorEditor).toHaveBeenCalledWith(1)
  })

  it('sets correct expansion panel value based on floor number', () => {
    const wrapper = createWrapper({ floorNumber: 3 })

    component(wrapper, VExpansionPanel).assert({ props: { value: 2 } })
  })

  it('sets correct expansion panel id using formatFloorId', () => {
    const wrapper = createWrapper({ floorNumber: 4 })

    component(wrapper, VExpansionPanel).assert({ attributes: { id: 'floor-3' } })
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

    const allExpansionPanels = wrapper.findAllComponents(VExpansionPanels)
    const innerExpansionPanels = allExpansionPanels.find((panel) => panel.props('multiple'))

    expect(innerExpansionPanels).toBeTruthy()

    const expectedExpandedValues = ['0-Recipe_IngotIron_C'] // Only first recipe is expanded
    expect(innerExpansionPanels!.props('modelValue')).toEqual(expectedExpandedValues)

    // Should render all RecipeNode components regardless of expansion state
    const recipeNodes = wrapper.findAllComponents(RecipeNode)
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

      component(wrapper, VExpansionPanel).assert({ exists: true })
      component(wrapper, VExpansionPanelTitle).assert({ text: [`Floor ${floorNumber}`] })

      if (name) {
        component(wrapper, VExpansionPanelTitle).assert({ text: [name] })
      }
    })
  })

  it('handles edge case with empty recipe list', () => {
    const emptyFloor = createMockFloor({ recipes: [] })
    const wrapper = createWrapper({ floor: emptyFloor })

    // Should render without errors
    component(wrapper, VExpansionPanel).assert()
    component(wrapper, VExpansionPanelTitle).assert({ text: ['0 recipes'] })

    // Should not render any RecipeNode components
    component(wrapper, RecipeNode).assert({ exists: false })
  })

  it('displays floor name using getFloorDisplayName result', async () => {
    const floor = createMockFloor({ name: 'Custom Floor' })
    const wrapper = createWrapper({ floor, floorNumber: 3 })

    const mockGetFloorDisplayName = (await getMockFloorManagement()).getFloorDisplayName
    expect(mockGetFloorDisplayName).toHaveBeenCalledWith(3, floor)

    component(wrapper, VExpansionPanelTitle).assert({ text: ['Floor 3 - Custom Floor'] })
  })
})
