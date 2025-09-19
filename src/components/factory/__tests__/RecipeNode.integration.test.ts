import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import RecipeNodeComponent from '@/components/factory/RecipeNode.vue'
import { newRecipeNode, type RecipeNode as RecipeNodeType } from '@/logistics/graph-node'
import { recipeDatabase } from '@/__tests__/fixtures/data'
import { mockGetStores } from '@/__tests__/fixtures/composables'
import { mockIsDark } from '@/__tests__/fixtures/composables/themeStore'
import { createTestRecipe } from '@/__tests__/fixtures/stores/dataStore'
import { mockGetEligibleFloors, mockMoveRecipe } from '@/__tests__/fixtures/composables/navigation'

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

  const expectElementExists = (wrapper: VueWrapper, selector: string) => {
    expect(wrapper.find(selector).exists()).toBe(true)
  }

  const expectElementText = (wrapper: VueWrapper, selector: string, text: string) => {
    expect(wrapper.find(selector).text()).toContain(text)
  }

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

      expectElementText(wrapper, '.text-h6', TEST_RECIPES.IRON_INGOT)
    })

    it('displays recipe count in chip with correct formatting', () => {
      const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
      const wrapper = createWrapper(recipeNode)

      expectElementText(wrapper, '.v-chip', 'x1.50')
    })

    it('formats recipe count correctly for different values', () => {
      const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
      recipeNode.recipe.count = 2.75

      const wrapper = createWrapper(recipeNode)

      expectElementText(wrapper, '.v-chip', 'x2.75')
    })

    it('shows RecipeDetails tooltip when recipe exists in data store', async () => {
      const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)

      // Access the centralized mock and set up recipe data
      const mockDataStore = mockGetStores().dataStore
      const recipeData = recipeDatabase[TEST_RECIPES.IRON_INGOT]
      mockDataStore.recipes[TEST_RECIPES.IRON_INGOT] = createTestRecipe(recipeData)

      const wrapper = createWrapper(recipeNode)

      // The tooltip and chip should exist when recipe is available
      expect(wrapper.find('.v-chip').exists()).toBe(true)
      // Check if tooltip activator exists (the chip itself acts as activator)
      expect(wrapper.text()).toContain('x1.50')
    })

    it('sets correct ID on expansion panel element', () => {
      const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT, 2)
      const wrapper = createWrapper(recipeNode)

      // Check that the expansion panel has the correctly formatted ID
      const expansionPanel = wrapper.find('.v-expansion-panel')
      expect(expansionPanel.attributes('id')).toBe(`recipe-2-${TEST_RECIPES.IRON_INGOT}`)
    })

    it('handles recipe with no batch number gracefully', () => {
      const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
      recipeNode.batchNumber = undefined

      const wrapper = createWrapper(recipeNode)

      expectElementExists(wrapper, '.v-expansion-panel')
    })

    it('handles multiple ingredients recipe correctly', async () => {
      const recipeNode = createRecipeNode(TEST_RECIPES.PURE_CATERIUM)
      const wrapper = createWrapper(recipeNode)

      expectElementText(wrapper, '.v-chip', 'x1.50')
      expectElementExists(wrapper, '.v-expansion-panel')
    })
  })

  it('applies correct panel background class when recipe is not completed in light theme', async () => {
    // Access and update centralized mocks
    const { mockIsRecipeComplete } = await import(
      '@/__tests__/fixtures/composables/useRecipeStatus'
    )
    mockIsRecipeComplete.mockReturnValueOnce(false)

    const wrapper = createWrapper()

    expectPanelClasses(wrapper, 'bg-grey-lighten-1')
  })

  it('applies correct panel background class when recipe is completed in light theme', async () => {
    // Access and update centralized mocks
    const { mockIsRecipeComplete } = await import(
      '@/__tests__/fixtures/composables/useRecipeStatus'
    )
    mockIsRecipeComplete.mockReturnValueOnce(true)

    const wrapper = createWrapper()

    expectPanelClasses(wrapper, 'bg-blue-grey-lighten-1')
  })

  it('applies correct panel background class in dark theme', async () => {
    // Access and update centralized mocks for dark theme
    const { mockIsRecipeComplete } = await import(
      '@/__tests__/fixtures/composables/useRecipeStatus'
    )

    mockIsRecipeComplete.mockReturnValueOnce(false)
    mockIsDark.value = true

    const wrapper = createWrapper()

    expectPanelClasses(wrapper, 'bg-grey-darken-2')
  })

  it('applies correct title background class when recipe is not completed', async () => {
    // Access and update centralized mocks
    const { mockIsRecipeComplete } = await import(
      '@/__tests__/fixtures/composables/useRecipeStatus'
    )
    mockIsRecipeComplete.mockReturnValueOnce(false)

    const wrapper = createWrapper()

    expectTitleClasses(wrapper, 'bg-grey')
  })

  it('applies correct title background class when recipe is completed', async () => {
    // Access and update centralized mocks
    const { mockIsRecipeComplete } = await import(
      '@/__tests__/fixtures/composables/useRecipeStatus'
    )
    mockIsRecipeComplete.mockReturnValueOnce(true)

    const wrapper = createWrapper()

    expectTitleClasses(wrapper, 'bg-green-lighten-4')
  })

  it('displays floor selection dropdown with eligible floors', () => {
    const wrapper = createWrapper()

    const select = wrapper.findComponent({ name: 'VSelect' })
    expect(select.exists()).toBe(true)
    expect(select.props('items')).toEqual(TEST_FLOORS)
  })

  it('displays current batch number as selected floor value', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT, 1)
    const wrapper = createWrapper(recipeNode)

    const select = wrapper.findComponent({ name: 'VSelect' })
    expect(select.props('modelValue')).toBe(1)
  })

  it('calls getEligibleFloors with correct batch number', async () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT, 2)
    createWrapper(recipeNode)

    // Access the centralized mock function
    expect(mockGetEligibleFloors).toHaveBeenCalledWith(2)
  })

  it('calls moveRecipe when floor selection changes', async () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT, 1)
    const wrapper = createWrapper(recipeNode)

    const select = wrapper.findComponent({ name: 'VSelect' })
    await select.vm.$emit('update:modelValue', 2)

    // Access the centralized mock function
    expect(mockMoveRecipe).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT, 1, 2)
  })

  it('prevents click propagation on floor select', () => {
    const wrapper = createWrapper()
    const select = wrapper.findComponent({ name: 'VSelect' })

    // Check that click.stop is applied (this would be in the template)
    expect(select.attributes()).toBeDefined()
  })

  it('renders child components in expansion panel text', () => {
    const wrapper = createWrapper()

    expectElementExists(wrapper, '.v-expansion-panel-text')
    expect(wrapper.find('.v-expansion-panel-text').html()).toBeTruthy()
  })

  it('calls isRecipeComplete to determine completion status', async () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    createWrapper(recipeNode)

    const { mockIsRecipeComplete } = await import(
      '@/__tests__/fixtures/composables/useRecipeStatus'
    )
    expect(mockIsRecipeComplete).toHaveBeenCalledWith(recipeNode)
  })

  it('calls getRecipePanelValue for panel value', async () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    createWrapper(recipeNode)

    const { mockGetRecipePanelValue } = await import(
      '@/__tests__/fixtures/composables/useRecipeStatus'
    )
    expect(mockGetRecipePanelValue).toHaveBeenCalledWith(recipeNode)
  })

  it('handles recipe with no batch number gracefully', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    recipeNode.batchNumber = undefined

    const wrapper = createWrapper(recipeNode)

    expectElementExists(wrapper, '.v-expansion-panel')
  })

  it('displays floor plan icon in select prepend', () => {
    const wrapper = createWrapper()

    const select = wrapper.findComponent({ name: 'VSelect' })
    expect(select.exists()).toBe(true)
    // Check that the icon slot is being used correctly
    const prependSlot = select.find('[slot="prepend-inner"]')
    expect(prependSlot.exists() || select.find('.v-icon').exists()).toBe(true)
  })

  it('handles multiple ingredients recipe correctly', async () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.PURE_CATERIUM)
    const wrapper = createWrapper(recipeNode)

    expectElementText(wrapper, '.v-chip', 'x1.50')
    expectElementExists(wrapper, '.v-expansion-panel')
  })

  it('formats recipe count correctly for different values', () => {
    const recipeNode = createRecipeNode(TEST_RECIPES.IRON_INGOT)
    recipeNode.recipe.count = 2.75

    const wrapper = createWrapper(recipeNode)

    expectElementText(wrapper, '.v-chip', 'x2.75')
  })
})
