import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mockSetRecipeBuilt } from '@/__tests__/fixtures/composables/useRecipeStatus'
import { recipeDatabase } from '@/__tests__/fixtures/data'
import { component } from '@/__tests__/vue-test-helpers'
import { newRecipeNode, type RecipeNode } from '@/logistics/graph-node'
import type { Recipe } from '@/types/factory'

import CachedIcon from '@/components/common/CachedIcon.vue'
import RecipeBuilding from '@/components/factory/RecipeBuilding.vue'
import { VCard, VCheckbox } from 'vuetify/components'

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
    component(createWrapper(), VCard).assert({
      exists: true,
      text: 'Smelter',
    })
  })

  it('displays building name from data store', () => {
    const constructorRecipe = createTestRecipeNode(
      TEST_RECIPES.IRON_INGOT,
      false,
      TEST_BUILDINGS.CONSTRUCTOR,
    )
    const wrapper = createWrapper({ recipe: constructorRecipe })

    component(wrapper, VCard).assert({
      text: ['Constructor'],
    })
  })

  it('displays cached icon when available', () => {
    const wrapper = createWrapper()

    component(wrapper, CachedIcon).assert({
      exists: true,
      props: {
        size: 32,
      },
    })
    const cachedIcon = wrapper.findComponent(CachedIcon)
    expect(cachedIcon.props('icon')).toBeTruthy()
  })

  it('shows unchecked checkbox when recipe is not built', () => {
    const wrapper = createWrapper()

    component(wrapper, VCheckbox).assert({
      exists: true,
      props: {
        modelValue: false,
      },
    })
  })

  it('shows checked checkbox when recipe is built', () => {
    const builtRecipe = createTestRecipeNode(TEST_RECIPES.IRON_INGOT, true)
    const wrapper = createWrapper({ recipe: builtRecipe })

    component(wrapper, VCheckbox).assert({
      props: {
        modelValue: true,
      },
    })
  })

  it('applies correct cardClass when recipe is not built', () => {
    const wrapper = createWrapper()

    const card = wrapper.findComponent(VCard)
    expect(card.classes()).toContain('bg-surface')
    expect(card.classes()).not.toContain('bg-green-lighten-4')
    expect(card.classes()).toContain('elevation-2')
  })

  it('applies correct cardClass when recipe is built', () => {
    const builtRecipe = createTestRecipeNode(TEST_RECIPES.IRON_INGOT, true)
    const wrapper = createWrapper({ recipe: builtRecipe })

    const card = wrapper.findComponent(VCard)
    expect(card.classes()).toContain('bg-green-lighten-4')
    expect(card.classes()).not.toContain('bg-surface')
    expect(card.classes()).toContain('elevation-2')
  })

  it('calls setRecipeBuilt when card is clicked', async () => {
    component(createWrapper(), VCard).click()
    expect(mockSetRecipeBuilt).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT, true)
  })

  it('calls setRecipeBuilt when checkbox is changed', async () => {
    component(createWrapper(), VCheckbox).emit('update:modelValue', true)
    expect(mockSetRecipeBuilt).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT, true)
  })

  it('toggles built state when card is clicked on built recipe', async () => {
    const builtRecipe = createTestRecipeNode(TEST_RECIPES.IRON_INGOT, true)
    component(createWrapper({ recipe: builtRecipe }), VCard).click()
    expect(mockSetRecipeBuilt).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT, false)
  })

  it('handles null checkbox value correctly', async () => {
    component(createWrapper(), VCheckbox).emit('update:modelValue', null)
    expect(mockSetRecipeBuilt).toHaveBeenCalledWith(TEST_RECIPES.IRON_INGOT, false)
  })

  it('renders with different recipe data', () => {
    const copperRecipe = createTestRecipeNode(TEST_RECIPES.COPPER_INGOT)
    const wrapper = createWrapper({ recipe: copperRecipe })
    component(wrapper, VCard).assert({ exists: true, text: ['Smelter'] })
  })

  it('calls data store methods with correct building parameter', () => {
    const constructorRecipe = createTestRecipeNode(
      TEST_RECIPES.IRON_INGOT,
      false,
      TEST_BUILDINGS.CONSTRUCTOR,
    )
    const wrapper = createWrapper({ recipe: constructorRecipe })

    component(wrapper, VCard).assert({ text: ['Constructor'] })
    expect(wrapper.findComponent(CachedIcon).props('icon')).toBeTruthy()
  })
})
