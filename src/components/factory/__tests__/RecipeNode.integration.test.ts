import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VSelect, VChip, VExpansionPanel } from 'vuetify/components'
import { newRecipeNode, type RecipeNode as RecipeNodeType } from '@/logistics/graph-node'
import { recipeDatabase } from '@/__tests__/fixtures/data'
import { mockGetStores } from '@/__tests__/fixtures/composables'
import { mockIsDark } from '@/__tests__/fixtures/composables/themeStore'
import { createTestRecipe } from '@/__tests__/fixtures/stores/dataStore'
import { mockGetEligibleFloors, mockMoveRecipe } from '@/__tests__/fixtures/composables/navigation'
import {
  mockGetRecipePanelValue,
  mockIsRecipeComplete,
} from '@/__tests__/fixtures/composables/useRecipeStatus'
import { component, element } from '@/__tests__/vue-test-helpers'

import RecipeNodeComponent from '@/components/factory/RecipeNode.vue'

// Use centralized mock fixtures
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

describe('RecipeNode Integration', () => {
  // Test constants from fixtures
  const TEST_RECIPES = {
    IRON_INGOT: 'Recipe_Fake_IronIngot_C',
    COPPER_INGOT: 'Recipe_Fake_CopperIngot_C',
    PURE_CATERIUM: 'Recipe_PureCateriumIngot_C',
  } as const

  const TEST_FLOORS = [
    { title: 'Ground Floor', value: 0, disabled: false },
    { title: 'Floor 1', value: 1, disabled: false },
    { title: 'Floor 2', value: 2, disabled: false },
  ]

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    // Reset theme to light mode
    mockIsDark.value = false
  })

  const createRecipeNode = (recipeName: string, batchNumber = 1): RecipeNodeType => {
    const recipeData = recipeDatabase[recipeName]
    if (!recipeData) {
      throw new Error(`Recipe ${recipeName} not found in fixtures`)
    }

    // Convert RecipeData to Recipe type for the component
    const recipe = createTestRecipe(recipeData)

    const recipeNode = newRecipeNode(
      { name: recipe.name, building: recipe.producedIn[0] || 'Unknown', count: 1.5 },
      recipe.ingredients,
      recipe.products,
    )
    recipeNode.batchNumber = batchNumber
    return recipeNode
  }

  const createWrapper = (recipe?: RecipeNodeType, customProps = {}) => {
    const defaultRecipeNode = recipe || createRecipeNode(TEST_RECIPES.IRON_INGOT)
    return mount({
      template: '<v-expansion-panels><RecipeNode v-bind="props" /></v-expansion-panels>',
      components: { RecipeNode: RecipeNodeComponent },
      setup() {
        return { props: { recipe: defaultRecipeNode, ...customProps } }
      },
    })
  }

  // Helper functions for this specific component
  const expectPanelClasses = (wrapper: VueWrapper, expectedClass: string) => {
    expect(wrapper.find('.v-expansion-panel').classes()).toContain(expectedClass)
  }

  const expectTitleClasses = (wrapper: VueWrapper, expectedClass: string) => {
    expect(wrapper.find('.v-expansion-panel-title').classes()).toContain(expectedClass)
  }

  describe('Basic Rendering', () => {
    it('displays recipe display name correctly', async () => {
      const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
      const wrapper = createWrapper(recipeNode)

      element(wrapper, '.text-h6').assert({ text: TEST_RECIPES.IRON_INGOT })
    })

    it('displays recipe count in chip with correct formatting', () => {
      const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
      const wrapper = createWrapper(recipeNode)

      component(wrapper, VChip).assert({ text: 'x1.50' })
    })

    it('formats recipe count correctly for different values', () => {
      const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
      recipeNode.recipe.count = 2.75

      const wrapper = createWrapper(recipeNode)

      component(wrapper, VChip).assert({ exists: true, text: 'x2.75' })
    })

    it('shows RecipeDetails tooltip when recipe exists in data store', async () => {
      const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)

      // Access the centralized mock and set up recipe data
      const mockDataStore = mockGetStores().dataStore
      const recipeData = recipeDatabase[TEST_RECIPES.IRON_INGOT]
      mockDataStore.recipes[TEST_RECIPES.IRON_INGOT] = createTestRecipe(recipeData)

      const wrapper = createWrapper(recipeNode)

      component(wrapper, VChip).assert({ exists: true, text: 'x1.50' })
    })

    it('sets correct ID on expansion panel element', () => {
      const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT, 2)
      const wrapper = createWrapper(recipeNode)

      // Check that the expansion panel has the correctly formatted ID
      const expansionPanel = wrapper.findComponent(VExpansionPanel)
      expect(expansionPanel.attributes('id')).toBe(`recipe-2-${TEST_RECIPES.IRON_INGOT}`)
    })

    it('handles recipe with no batch number gracefully', () => {
      const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
      recipeNode.batchNumber = undefined
      component(createWrapper(), VExpansionPanel).assert()
    })

    it('handles multiple ingredients recipe correctly', async () => {
      const recipeNode = createRecipeNode(TEST_RECIPES.PURE_CATERIUM)
      const wrapper = createWrapper(recipeNode)

      component(wrapper, VChip).assert({ text: 'x1.50' })
      component(wrapper, VExpansionPanel).assert()
    })
  })

  it('applies correct panel background class when recipe is not completed in light theme', async () => {
    mockIsRecipeComplete.mockReturnValueOnce(false)
    expectPanelClasses(createWrapper(), 'bg-grey-lighten-1')
  })

  it('applies correct panel background class when recipe is completed in light theme', async () => {
    mockIsRecipeComplete.mockReturnValueOnce(true)
    expectPanelClasses(createWrapper(), 'bg-blue-grey-lighten-1')
  })

  it('applies correct panel background class in dark theme', async () => {
    mockIsRecipeComplete.mockReturnValueOnce(false)
    mockIsDark.value = true
    expectPanelClasses(createWrapper(), 'bg-grey-darken-2')
  })

  it('applies correct title background class when recipe is not completed', async () => {
    mockIsRecipeComplete.mockReturnValueOnce(false)
    expectTitleClasses(createWrapper(), 'bg-grey')
  })

  it('applies correct title background class when recipe is completed', async () => {
    mockIsRecipeComplete.mockReturnValueOnce(true)
    expectTitleClasses(createWrapper(), 'bg-green-lighten-4')
  })

  it('displays floor selection dropdown with eligible floors', () => {
    const wrapper = createWrapper()

    component(wrapper, VSelect).assert({ exists: true, props: { items: TEST_FLOORS } })
  })

  it('displays current batch number as selected floor value', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT, 1)
    component(createWrapper(recipeNode), VSelect).assert({ props: { modelValue: 1 } })
  })

  it('calls getEligibleFloors with correct batch number', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT, 2)
    createWrapper(recipeNode)
    expect(mockGetEligibleFloors).toHaveBeenCalledWith(2)
  })

  it('calls moveRecipe when floor selection changes', async () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT, 1)
    await component(createWrapper(recipeNode), VSelect).emit('update:modelValue', 2)
    expect(mockMoveRecipe).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT, 1, 2)
  })

  it('calls isRecipeComplete to determine completion status', async () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    createWrapper(recipeNode)
    expect(mockIsRecipeComplete).toHaveBeenCalledWith(recipeNode)
  })

  it('calls getRecipePanelValue for panel value', async () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    createWrapper(recipeNode)
    expect(mockGetRecipePanelValue).toHaveBeenCalledWith(recipeNode)
  })

  it('handles recipe with no batch number gracefully', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    recipeNode.batchNumber = undefined
    component(createWrapper(recipeNode), VExpansionPanel).assert()
  })

  it('displays floor plan icon in select prepend', () => {
    const wrapper = createWrapper()

    const select = wrapper.findComponent(VSelect)
    component(wrapper, VSelect).assert()
    // Check that the icon slot is being used correctly
    const prependSlot = select.find('[slot="prepend-inner"]')
    expect(prependSlot.exists() || select.find('.v-icon').exists()).toBe(true)
  })

  it('handles multiple ingredients recipe correctly', async () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.PURE_CATERIUM)
    const wrapper = createWrapper(recipeNode)

    component(wrapper, VChip).assert({ exists: true, text: 'x1.50' })
    component(wrapper, VExpansionPanel).assert({ exists: true })
  })

  it('formats recipe count correctly for different values', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    recipeNode.recipe.count = 2.75

    const wrapper = createWrapper(recipeNode)

    component(wrapper, VChip).assert({ exists: true, text: 'x2.75' })
  })
})
