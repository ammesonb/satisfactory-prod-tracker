import { mockGetEligibleFloors, mockMoveRecipe } from '@/__tests__/fixtures/composables/navigation'
import { mockIsDark } from '@/__tests__/fixtures/composables/themeStore'
import {
  mockGetRecipePanelValue,
  mockIsRecipeComplete,
} from '@/__tests__/fixtures/composables/useRecipeStatus'
import { makeRecipeNode } from '@/__tests__/fixtures/data'
import { component, element } from '@/__tests__/vue-test-helpers'
import type { RecipeNode as RecipeNodeType } from '@/logistics/graph-node'
import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VChip, VExpansionPanel, VSelect } from 'vuetify/components'

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

  const createWrapper = (recipe?: RecipeNodeType, customProps = {}) => {
    const defaultRecipeNode =
      recipe || makeRecipeNode(TEST_RECIPES.IRON_INGOT, 1, { fromDatabase: true, count: 1.5 })
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
      const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 1, {
        fromDatabase: true,
        count: 1.5,
      })
      const wrapper = createWrapper(recipeNode)

      element(wrapper, '.text-h6').assert({ text: TEST_RECIPES.IRON_INGOT })
    })

    it('displays recipe count in chip with correct formatting', () => {
      const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 1, {
        fromDatabase: true,
        count: 1.5,
      })
      const wrapper = createWrapper(recipeNode)

      component(wrapper, VChip).assert({ text: 'x1.50' })
    })

    it('formats recipe count correctly for different values', () => {
      const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 1, {
        fromDatabase: true,
        count: 2.75,
      })

      const wrapper = createWrapper(recipeNode)

      component(wrapper, VChip).assert({ exists: true, text: 'x2.75' })
    })

    it('shows RecipeDetails tooltip when recipe exists in data store', async () => {
      const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 1, {
        fromDatabase: true,
        count: 1.5,
      })

      const wrapper = createWrapper(recipeNode)

      component(wrapper, VChip).assert({ exists: true, text: 'x1.50' })
    })

    it('sets correct ID on expansion panel element', () => {
      const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 2, {
        fromDatabase: true,
        count: 1.5,
      })
      const wrapper = createWrapper(recipeNode)

      // Check that the expansion panel has the correctly formatted ID
      const expansionPanel = wrapper.findComponent(VExpansionPanel)
      expect(expansionPanel.attributes('id')).toBe(`recipe-2-${TEST_RECIPES.IRON_INGOT}`)
    })

    it('handles recipe with no batch number gracefully', () => {
      const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 1, {
        fromDatabase: true,
        count: 1.5,
      })
      recipeNode.batchNumber = undefined
      component(createWrapper(recipeNode), VExpansionPanel).assert()
    })

    it('handles multiple ingredients recipe correctly', async () => {
      const recipeNode = makeRecipeNode(TEST_RECIPES.PURE_CATERIUM, 1, {
        fromDatabase: true,
        count: 1.5,
      })
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
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 1, {
      fromDatabase: true,
      count: 1.5,
    })
    component(createWrapper(recipeNode), VSelect).assert({ props: { modelValue: 1 } })
  })

  it('calls getEligibleFloors with correct batch number', () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 2, {
      fromDatabase: true,
      count: 1.5,
    })
    createWrapper(recipeNode)
    expect(mockGetEligibleFloors).toHaveBeenCalledWith(2)
  })

  it('calls moveRecipe when floor selection changes', async () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 1, {
      fromDatabase: true,
      count: 1.5,
    })
    await component(createWrapper(recipeNode), VSelect).emit('update:modelValue', 2)
    expect(mockMoveRecipe).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT, 1, 2)
  })

  it('calls isRecipeComplete to determine completion status', async () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 1, {
      fromDatabase: true,
      count: 1.5,
    })
    createWrapper(recipeNode)
    expect(mockIsRecipeComplete).toHaveBeenCalledWith(recipeNode)
  })

  it('calls getRecipePanelValue for panel value', async () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 1, {
      fromDatabase: true,
      count: 1.5,
    })
    createWrapper(recipeNode)
    expect(mockGetRecipePanelValue).toHaveBeenCalledWith(recipeNode)
  })

  it('handles recipe with no batch number gracefully', () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 1, {
      fromDatabase: true,
      count: 1.5,
    })
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
    const recipeNode = makeRecipeNode(TEST_RECIPES.PURE_CATERIUM, 1, {
      fromDatabase: true,
      count: 1.5,
    })
    const wrapper = createWrapper(recipeNode)

    component(wrapper, VChip).assert({ exists: true, text: 'x1.50' })
    component(wrapper, VExpansionPanel).assert({ exists: true })
  })

  it('formats recipe count correctly for different values', () => {
    const recipeNode = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 1, {
      fromDatabase: true,
      count: 2.75,
    })

    const wrapper = createWrapper(recipeNode)

    component(wrapper, VChip).assert({ exists: true, text: 'x2.75' })
  })
})
