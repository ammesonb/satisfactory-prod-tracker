import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import RecipeBuilding from '@/components/factory/RecipeBuilding.vue'
import { newRecipeNode, type RecipeNode } from '@/logistics/graph-node'
import { recipeDatabase, buildingDatabase } from '@/__tests__/fixtures/data'
import type { Recipe } from '@/types/factory'

const icon = 'smelter-icon-url'
// Mock the composables
vi.mock('@/composables/useRecipeStatus', () => ({
  useRecipeStatus: vi.fn(() => ({
    setRecipeBuilt: vi.fn(),
  })),
}))

vi.mock('@/stores', () => ({
  useDataStore: vi.fn(() => ({
    getIcon: vi.fn(() => icon),
    getBuildingDisplayName: vi.fn((building) => buildingDatabase[building]?.name || 'Unknown'),
  })),
}))

describe('RecipeBuilding Integration', () => {
  // Test constants from fixtures
  const TEST_RECIPES = {
    IRON_INGOT: 'Recipe_Fake_IronIngot_C',
    COPPER_INGOT: 'Recipe_Fake_CopperIngot_C',
  } as const

  const TEST_BUILDINGS = {
    SMELTER: 'Desc_SmelterMk1_C',
    CONSTRUCTOR: 'Desc_ConstructorMk1_C',
  } as const

  let mockSetRecipeBuilt: ReturnType<typeof vi.fn>

  const createTestRecipe = (
    recipeName: string,
    building: string = TEST_BUILDINGS.SMELTER,
  ): Recipe => ({
    name: recipeName,
    building,
    count: 1,
  })

  const createTestRecipeNode = (
    recipeName: string,
    built = false,
    building: string = TEST_BUILDINGS.SMELTER,
  ): RecipeNode => {
    const recipe = createTestRecipe(recipeName, building)
    const recipeData = recipeDatabase[recipeName]
    const node = newRecipeNode(recipe, recipeData.ingredients, recipeData.products)
    node.built = built
    return node
  }

  const createWrapper = (props = {}) => {
    const defaultProps = {
      recipe: createTestRecipeNode(TEST_RECIPES.IRON_INGOT),
    }
    return mount(RecipeBuilding, {
      props: {
        ...defaultProps,
        ...props,
      },
    })
  }

  beforeEach(async () => {
    mockSetRecipeBuilt = vi.fn()
    const { useRecipeStatus } = vi.mocked(await import('@/composables/useRecipeStatus'))
    useRecipeStatus.mockReturnValue({
      isRecipeComplete: vi.fn(() => false),
      setRecipeBuilt: mockSetRecipeBuilt,
      isLinkBuilt: vi.fn(() => false),
      setLinkBuilt: vi.fn(),
      getRecipePanelValue: vi.fn(() => 'test-panel-value'),
      leftoverProductsAsLinks: vi.fn(() => []),
    })
  })

  it('renders with default props', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('.recipe-building').exists()).toBe(true)
    expect(wrapper.text()).toContain('Building')
    expect(wrapper.text()).toContain('Smelter')
  })

  it('displays building name from data store', () => {
    const constructorRecipe = createTestRecipeNode(
      TEST_RECIPES.IRON_INGOT,
      false,
      TEST_BUILDINGS.CONSTRUCTOR,
    )
    const wrapper = createWrapper({ recipe: constructorRecipe })

    expect(wrapper.text()).toContain('Constructor')
  })

  it('displays cached icon when available', () => {
    const wrapper = createWrapper()

    const cachedIcon = wrapper.findComponent({ name: 'CachedIcon' })
    expect(cachedIcon.exists()).toBe(true)
    expect(cachedIcon.props('icon')).toBe(icon)
    expect(cachedIcon.props('size')).toBe(32)
  })

  it('shows unchecked checkbox when recipe is not built', () => {
    const wrapper = createWrapper()

    const checkbox = wrapper.findComponent({ name: 'VCheckbox' })
    expect(checkbox.exists()).toBe(true)
    expect(checkbox.props('modelValue')).toBe(false)
  })

  it('shows checked checkbox when recipe is built', () => {
    const builtRecipe = createTestRecipeNode(TEST_RECIPES.IRON_INGOT, true)
    const wrapper = createWrapper({ recipe: builtRecipe })

    const checkbox = wrapper.findComponent({ name: 'VCheckbox' })
    expect(checkbox.props('modelValue')).toBe(true)
  })

  it('applies correct cardClass when recipe is not built', () => {
    const wrapper = createWrapper()

    const card = wrapper.findComponent({ name: 'VCard' })
    expect(card.classes()).toContain('bg-surface')
    expect(card.classes()).not.toContain('bg-green-lighten-4')
    expect(card.classes()).toContain('elevation-2')
  })

  it('applies correct cardClass when recipe is built', () => {
    const builtRecipe = createTestRecipeNode(TEST_RECIPES.IRON_INGOT, true)
    const wrapper = createWrapper({ recipe: builtRecipe })

    const card = wrapper.findComponent({ name: 'VCard' })
    expect(card.classes()).toContain('bg-green-lighten-4')
    expect(card.classes()).not.toContain('bg-surface')
    expect(card.classes()).toContain('elevation-2')
  })

  it('calls setRecipeBuilt when card is clicked', async () => {
    const wrapper = createWrapper()

    const card = wrapper.findComponent({ name: 'VCard' })
    await card.trigger('click')

    expect(mockSetRecipeBuilt).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT, true)
  })

  it('calls setRecipeBuilt when checkbox is changed', async () => {
    const wrapper = createWrapper()

    const checkbox = wrapper.findComponent({ name: 'VCheckbox' })
    await checkbox.vm.$emit('update:modelValue', true)

    expect(mockSetRecipeBuilt).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT, true)
  })

  it('toggles built state when card is clicked on built recipe', async () => {
    const builtRecipe = createTestRecipeNode(TEST_RECIPES.IRON_INGOT, true)
    const wrapper = createWrapper({ recipe: builtRecipe })

    const card = wrapper.findComponent({ name: 'VCard' })
    await card.trigger('click')

    expect(mockSetRecipeBuilt).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT, false)
  })

  it('handles null checkbox value correctly', async () => {
    const wrapper = createWrapper()

    const checkbox = wrapper.findComponent({ name: 'VCheckbox' })
    await checkbox.vm.$emit('update:modelValue', null)

    expect(mockSetRecipeBuilt).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT, false)
  })

  it('renders with different recipe data', () => {
    const copperRecipe = createTestRecipeNode(TEST_RECIPES.COPPER_INGOT)
    const wrapper = createWrapper({ recipe: copperRecipe })

    expect(wrapper.find('.recipe-building').exists()).toBe(true)
    expect(wrapper.text()).toContain('Smelter')
  })

  it('calls data store methods with correct building parameter', () => {
    const constructorRecipe = createTestRecipeNode(
      TEST_RECIPES.IRON_INGOT,
      false,
      TEST_BUILDINGS.CONSTRUCTOR,
    )
    const wrapper = createWrapper({ recipe: constructorRecipe })

    expect(wrapper.text()).toContain('Constructor')
    expect(wrapper.findComponent({ name: 'CachedIcon' }).props('icon')).toBe(icon)
  })
})
