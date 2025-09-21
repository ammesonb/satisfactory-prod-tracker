import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VCheckbox } from 'vuetify/components'
import RecipeBuilding from '@/components/factory/RecipeBuilding.vue'
import CachedIcon from '@/components/common/CachedIcon.vue'
import { newRecipeNode, type RecipeNode } from '@/logistics/graph-node'
import { recipeDatabase } from '@/__tests__/fixtures/data'
import type { Recipe } from '@/types/factory'
import { expectElementExists, expectElementText, expectProps } from '@/__tests__/vue-test-helpers'

// Use centralized fixtures for mocking composables
vi.mock('@/composables/useRecipeStatus', async () => {
  const { mockUseRecipeStatus } = await import('@/__tests__/fixtures/composables')
  return { useRecipeStatus: mockUseRecipeStatus }
})

vi.mock('@/stores', async () => {
  const { createMockDataStore } = await import('@/__tests__/fixtures/stores/dataStore')
  return { useDataStore: vi.fn(() => createMockDataStore()) }
})

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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default props', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('.recipe-building').exists()).toBe(true)
    expectElementText(wrapper, '.recipe-building', 'Building')
    expectElementText(wrapper, '.recipe-building', 'Smelter')
  })

  it('displays building name from data store', () => {
    const constructorRecipe = createTestRecipeNode(
      TEST_RECIPES.IRON_INGOT,
      false,
      TEST_BUILDINGS.CONSTRUCTOR,
    )
    const wrapper = createWrapper({ recipe: constructorRecipe })

    expectElementText(wrapper, '.recipe-building', 'Constructor')
  })

  it('displays cached icon when available', () => {
    const wrapper = createWrapper()

    expectElementExists(wrapper, CachedIcon)
    expectProps(wrapper, CachedIcon, {
      size: 32,
    })
    const cachedIcon = wrapper.findComponent(CachedIcon)
    expect(cachedIcon.props('icon')).toBeTruthy()
  })

  it('shows unchecked checkbox when recipe is not built', () => {
    const wrapper = createWrapper()

    expectElementExists(wrapper, VCheckbox)
    expectProps(wrapper, VCheckbox, {
      modelValue: false,
    })
  })

  it('shows checked checkbox when recipe is built', () => {
    const builtRecipe = createTestRecipeNode(TEST_RECIPES.IRON_INGOT, true)
    const wrapper = createWrapper({ recipe: builtRecipe })

    expectElementExists(wrapper, VCheckbox)
    expectProps(wrapper, VCheckbox, {
      modelValue: true,
    })
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

    // Access mock only when needed for specific assertion
    const { mockSetRecipeBuilt } = await import('@/__tests__/fixtures/composables/useRecipeStatus')
    expect(mockSetRecipeBuilt).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT, true)
  })

  it('calls setRecipeBuilt when checkbox is changed', async () => {
    const wrapper = createWrapper()

    const checkbox = wrapper.findComponent({ name: 'VCheckbox' })
    await checkbox.vm.$emit('update:modelValue', true)

    // Access mock only when needed for specific assertion
    const { mockSetRecipeBuilt } = await import('@/__tests__/fixtures/composables/useRecipeStatus')
    expect(mockSetRecipeBuilt).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT, true)
  })

  it('toggles built state when card is clicked on built recipe', async () => {
    const builtRecipe = createTestRecipeNode(TEST_RECIPES.IRON_INGOT, true)
    const wrapper = createWrapper({ recipe: builtRecipe })

    const card = wrapper.findComponent({ name: 'VCard' })
    await card.trigger('click')

    // Access mock only when needed for specific assertion
    const { mockSetRecipeBuilt } = await import('@/__tests__/fixtures/composables/useRecipeStatus')
    expect(mockSetRecipeBuilt).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT, false)
  })

  it('handles null checkbox value correctly', async () => {
    const wrapper = createWrapper()

    const checkbox = wrapper.findComponent({ name: 'VCheckbox' })
    await checkbox.vm.$emit('update:modelValue', null)

    // Access mock only when needed for specific assertion
    const { mockSetRecipeBuilt } = await import('@/__tests__/fixtures/composables/useRecipeStatus')
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
    expect(wrapper.findComponent({ name: 'CachedIcon' }).props('icon')).toBeTruthy()
  })
})
