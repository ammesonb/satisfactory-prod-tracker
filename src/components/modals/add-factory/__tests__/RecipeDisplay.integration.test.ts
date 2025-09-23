import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import RecipeDisplay from '@/components/modals/add-factory/RecipeDisplay.vue'
import RecipeListItem from '@/components/modals/add-factory/RecipeListItem.vue'
import {
  emitEvent,
  expectElementExists,
  expectElementNotExists,
  expectElementText,
} from '@/__tests__/vue-test-helpers'
import type { RecipeEntry } from '@/types/factory'
import { VCard } from 'vuetify/components'

// Mock composables with centralized fixtures
vi.mock('@/composables/useStores', async () => {
  const { mockUseStores } = await import('@/__tests__/fixtures/composables')
  return mockUseStores
})

const IRON_INGOT_RECIPE = 'Recipe_Fake_IronIngot_C'
const COPPER_INGOT_RECIPE = 'Recipe_Fake_CopperIngot_C'
const SMELTER_BUILDING = 'Desc_SmelterMk1_C'

const createMockRecipeEntry = (overrides: Partial<RecipeEntry> = {}): RecipeEntry => ({
  recipe: IRON_INGOT_RECIPE,
  building: SMELTER_BUILDING,
  count: 1,
  icon: 'desc-smeltermk1-c',
  ...overrides,
})

describe('RecipeDisplay Integration', () => {
  const createWrapper = (props: { recipes?: RecipeEntry[] } = {}) => {
    const defaultProps = {
      recipes: [],
      ...props,
    }
    return mount(RecipeDisplay, {
      props: defaultProps,
    })
  }

  it('renders empty state when no recipes provided', () => {
    expectElementNotExists(createWrapper(), '.recipe-display')
  })

  it('renders with single recipe', () => {
    const recipe = createMockRecipeEntry()
    const wrapper = createWrapper({ recipes: [recipe] })

    expectElementExists(wrapper, '.recipe-display')
    expectElementText(wrapper, 'h4', 'Selected Recipes')
    expectElementExists(wrapper, VCard)
    expectElementExists(wrapper, RecipeListItem)
  })

  it('renders multiple recipes', () => {
    const recipes = [
      createMockRecipeEntry({ recipe: IRON_INGOT_RECIPE }),
      createMockRecipeEntry({ recipe: COPPER_INGOT_RECIPE, building: SMELTER_BUILDING }),
    ]
    const wrapper = createWrapper({ recipes })

    expectElementExists(wrapper, '.recipe-display')
    expect(wrapper.findAllComponents(VCard)).toHaveLength(2)
    expect(wrapper.findAllComponents(RecipeListItem)).toHaveLength(2)
  })

  it('handles recipe removal', async () => {
    const recipe = createMockRecipeEntry()
    const wrapper = createWrapper({ recipes: [recipe] })

    emitEvent(wrapper, RecipeListItem, 'remove', [])

    // Check that the component emits remove with correct index
    expect(wrapper.emitted('remove')).toBeTruthy()
    expect(wrapper.emitted('remove')?.[0]).toEqual([0])
  })

  it('handles multiple recipe removals with correct indices', async () => {
    const recipes = [
      createMockRecipeEntry({ recipe: IRON_INGOT_RECIPE }),
      createMockRecipeEntry({ recipe: COPPER_INGOT_RECIPE }),
    ]
    const wrapper = createWrapper({ recipes })

    // Remove second recipe (index 1)
    const recipeItems = wrapper.findAllComponents(RecipeListItem)
    await recipeItems[1].vm.$emit('remove')

    expect(wrapper.emitted('remove')?.[0]).toEqual([1])
  })

  it('passes correct props to RecipeListItem components', () => {
    const recipe = createMockRecipeEntry({
      recipe: IRON_INGOT_RECIPE,
      building: SMELTER_BUILDING,
      count: 2,
    })
    const wrapper = createWrapper({ recipes: [recipe] })

    const recipeItem = wrapper.findComponent(RecipeListItem)
    expect(recipeItem.props('entry')).toEqual(recipe)
    expect(recipeItem.props('rowNumber')).toBe(1)
  })
})
