import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'

import { mockUseLinkData } from '@/__tests__/fixtures/composables'
import {
  mockIsLinkBuilt,
  mockSetLinkBuilt,
  mockUseRecipeStatus,
} from '@/__tests__/fixtures/composables/useRecipeStatus'
import { makeMaterial, makeRecipeNode } from '@/__tests__/fixtures/data'
import { component } from '@/__tests__/vue-test-helpers'
import type { RecipeNode } from '@/logistics/graph-node'
import type { Item } from '@/types/data'
import type { Material } from '@/types/factory'

import CachedIcon from '@/components/common/CachedIcon.vue'
import RecipeLink from '@/components/factory/RecipeLink.vue'
import RecipeLinkTarget from '@/components/factory/RecipeLinkTarget.vue'
import TransportCapacityTooltip from '@/components/factory/TransportCapacityTooltip.vue'
import { VCard, VCheckbox } from 'vuetify/components'

vi.mock('@/composables/useStores')
vi.mock('@/composables/useRecipeStatus')
vi.mock('@/composables/useLinkData')

describe('RecipeLink Integration', () => {
  // Test constants from fixtures
  const TEST_RECIPES = {
    IRON_INGOT: 'Recipe_Fake_IronIngot_C',
  } as const

  const TEST_ITEMS = {
    IRON_ORE: 'Desc_OreIron_C',
    IRON_INGOT: 'Desc_IronIngot_C',
  } as const

  let mockMaterialItemValue: ReturnType<typeof ref>

  beforeEach(() => {
    vi.clearAllMocks()

    mockMaterialItemValue = ref<Item | null>({
      name: 'Iron Ore',
      icon: TEST_ITEMS.IRON_ORE,
    } as Item)

    mockUseLinkData.mockReturnValue({
      linkId: computed(() => 'test-link-id'),
      materialItem: computed(() => mockMaterialItemValue.value as Item),
      linkTarget: computed(() => 'test-target'),
      isRecipe: computed(() => false),
      targetRecipe: computed(() => null),
      displayName: computed(() => 'Test Display Name'),
      transportIcon: computed(() => 'Desc_ConveyorBeltMk1_C'),
    })
  })

  const createWrapper = (
    link: Material,
    recipe: RecipeNode,
    direction: 'input' | 'output' = 'input',
  ) => {
    return mount(RecipeLink, {
      props: {
        link,
        recipe,
        direction,
      },
    })
  }

  it('renders without errors and displays material information', () => {
    const recipe = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', 'Smelting', 30.5)

    const wrapper = createWrapper(link, recipe, 'input')

    component(wrapper, VCard).assert({
      exists: true,
      text: ['Iron Ore', '30.5/min'],
    })
  })

  it('renders child components with correct props', () => {
    const recipe = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', 'Smelting', 30)

    const wrapper = createWrapper(link, recipe, 'output')

    // Check CachedIcon components
    component(wrapper, CachedIcon).assert({
      count: 2, // Material icon + transport icon
    })

    component(wrapper, RecipeLinkTarget).assert({
      props: {
        link,
        direction: 'output',
      },
    })

    component(wrapper, TransportCapacityTooltip).assert({
      props: {
        recipe,
        link,
        direction: 'output',
      },
    })
  })

  it('calls composables with correct parameters', () => {
    const recipe = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', 'Smelting', 30)

    createWrapper(link, recipe, 'input')

    expect(mockUseRecipeStatus).toHaveBeenCalled()
    expect(mockUseLinkData).toHaveBeenCalled()
  })

  it('handles built state correctly when link is built', () => {
    mockIsLinkBuilt.mockReturnValueOnce(true)

    const recipe = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', 'Smelting', 30)

    const wrapper = createWrapper(link, recipe)

    // Should have built styling
    component(wrapper, VCard).assert({
      classes: ['bg-green-lighten-4'],
    })

    // Checkbox should be checked
    component(wrapper, VCheckbox).assert({
      props: {
        modelValue: true,
      },
    })
  })

  it('handles unbuilt state correctly when link is not built', () => {
    mockIsLinkBuilt.mockReturnValueOnce(false)

    const recipe = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', 'Smelting', 30)

    const wrapper = createWrapper(link, recipe)

    // Should have unbuilt styling
    component(wrapper, VCard).assert({
      classes: ['bg-surface'],
    })

    // Checkbox should be unchecked
    component(wrapper, VCheckbox).assert({
      props: {
        modelValue: false,
      },
    })
  })

  it('toggles built state when card is clicked', async () => {
    const recipe = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', 'Smelting', 30)

    await component(createWrapper(link, recipe), VCard)
      .match((card) => card.classes().includes('recipe-link'))
      .click()

    expect(mockSetLinkBuilt).toHaveBeenCalledWith(link, true)
  })

  it('toggles built state when checkbox is changed', async () => {
    const recipe = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', 'Smelting', 30)

    await component(createWrapper(link, recipe), VCheckbox).emit('update:modelValue', true)
    expect(mockSetLinkBuilt).toHaveBeenCalledWith(link, true)
  })

  it('displays fallback material name when materialItem is not available', () => {
    mockMaterialItemValue.value = null

    const recipe = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    const link = makeMaterial('Unknown_Material', 'Mining', 'Smelting', 25)
    const wrapper = createWrapper(link, recipe)

    component(wrapper, VCard).assert({
      text: ['Unknown_Material', '25.0/min'],
    })
  })
})
