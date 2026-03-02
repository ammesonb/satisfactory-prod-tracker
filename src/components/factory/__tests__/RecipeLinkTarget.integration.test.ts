import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'

import { mockUseLinkData } from '@/__tests__/fixtures/composables'
import { mockNavigateToRecipe } from '@/__tests__/fixtures/composables/navigation'
import { mockIsLinkBuilt } from '@/__tests__/fixtures/composables/useRecipeStatus'
import { makeMaterial, makeRecipeNode } from '@/__tests__/fixtures/data'
import { component, element } from '@/__tests__/vue-test-helpers'
import type { RecipeNode as RecipeNodeType } from '@/logistics/graph-node'
import type { Material } from '@/types/factory'

import RecipeLinkTarget from '@/components/factory/RecipeLinkTarget.vue'

vi.mock('@/composables/useStores')
vi.mock('@/composables/useFloorNavigation')
vi.mock('@/composables/useLinkData')
vi.mock('@/composables/useRecipeStatus')

describe('RecipeLinkTarget Integration', () => {
  const TEST_RECIPES = {
    IRON_INGOT: 'Recipe_Fake_IronIngot_C',
    COPPER_INGOT: 'Recipe_Fake_CopperIngot_C',
  } as const

  const TEST_ITEMS = {
    IRON_ORE: 'Desc_OreIron_C',
    IRON_INGOT: 'Desc_IronIngot_C',
    COPPER_ORE: 'Desc_OreCopper_C',
  } as const

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const withLinkData = (
    overrides: {
      linkTarget?: string
      isRecipe?: boolean
      targetRecipe?: RecipeNodeType | null
      displayName?: string
    } = {},
  ) => {
    mockUseLinkData.mockReturnValue({
      linkId: computed(() => 'test-link-id'),
      materialItem: computed(() => ({ name: 'Iron Ore', icon: 'Desc_OreIron_C' })),
      linkTarget: computed(() => overrides.linkTarget ?? 'test-target'),
      isRecipe: computed(() => overrides.isRecipe ?? false),
      targetRecipe: computed(() => overrides.targetRecipe ?? null),
      displayName: computed(() => overrides.displayName ?? 'Test Display Name'),
      transportIcon: computed(() => 'Desc_ConveyorBeltMk1_C'),
    })
  }

  const createWrapper = (
    link: Material,
    direction: 'input' | 'output' = 'input',
    customProps = {},
  ) => {
    return mount(RecipeLinkTarget, {
      props: {
        link,
        direction,
        ...customProps,
      },
    })
  }

  const expectLinkBuiltState = (wrapper: VueWrapper, isBuilt: boolean) => {
    const textClass = isBuilt ? 'text-black' : 'text-medium-emphasis'
    expect(wrapper.find('.text-caption').classes()).toContain(textClass)
  }

  const expectCorrectLinkText = (
    wrapper: VueWrapper,
    direction: 'input' | 'output',
    hasTarget: boolean,
  ) => {
    const expectedText = direction === 'input' ? 'from' : hasTarget ? 'to' : ''
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain(expectedText)
  }

  it('renders without errors and displays basic content', () => {
    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', 'Smelting', 30)
    const wrapper = createWrapper(link, 'input')
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Display Name')
  })

  it('shows correct link text for input direction', () => {
    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', 'Smelting', 30)
    expectCorrectLinkText(createWrapper(link, 'input'), 'input', true)
  })

  it('shows correct link text for output direction with target', () => {
    const link = makeMaterial(TEST_ITEMS.IRON_INGOT, 'Smelting', 'Construction', 30)
    expectCorrectLinkText(createWrapper(link, 'output'), 'output', true)
  })

  it('shows empty link text for output direction without target', () => {
    withLinkData({ linkTarget: '' })

    const link = makeMaterial(TEST_ITEMS.IRON_INGOT, 'Smelting', '', 30)
    expectCorrectLinkText(createWrapper(link, 'output'), 'output', false)
  })

  it('applies correct text color when link is built', () => {
    mockIsLinkBuilt.mockReturnValueOnce(true)

    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', 'Smelting', 30)
    expectLinkBuiltState(createWrapper(link, 'input'), true)
  })

  it('applies correct text color when link is not built', () => {
    mockIsLinkBuilt.mockReturnValueOnce(false)

    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', 'Smelting', 30)
    expectLinkBuiltState(createWrapper(link, 'input'), false)
  })

  it('renders clickable recipe link when target is a recipe', () => {
    const targetRecipe = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    withLinkData({ isRecipe: true, targetRecipe, displayName: 'Iron Ingot Recipe' })

    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', TEST_RECIPES.IRON_INGOT, 30)
    const wrapper = createWrapper(link, 'input')

    element(wrapper, '.navigate-name').assert({
      exists: true,
      classes: ['text-decoration-underline'],
      text: 'Iron Ingot Recipe',
    })
  })

  it('renders static text when target is not a recipe', () => {
    withLinkData({ displayName: 'Iron Ore Resource' })

    const link = makeMaterial(TEST_ITEMS.IRON_ORE, '', 'Smelting', 30)
    const wrapper = createWrapper(link, 'input')

    element(wrapper, '.navigate-name').assert({ exists: false })
    component(wrapper, RecipeLinkTarget).assert({ text: 'Iron Ore Resource' })
  })

  it('calls navigateToRecipe when clicking recipe link', async () => {
    const targetRecipe = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    withLinkData({ isRecipe: true, targetRecipe })

    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', TEST_RECIPES.IRON_INGOT, 30)
    const wrapper = createWrapper(link, 'input')
    await element(wrapper, '.navigate-name').click()
    expect(mockNavigateToRecipe).toHaveBeenCalledWith(targetRecipe)
  })

  it('prevents event propagation when clicking recipe link', async () => {
    const targetRecipe = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    withLinkData({ isRecipe: true, targetRecipe })

    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', TEST_RECIPES.IRON_INGOT, 30)
    const wrapper = createWrapper(link, 'input')

    const clickableSpan = wrapper.find('.navigate-name')
    const clickEvent = new Event('click')
    const preventSpy = vi.spyOn(clickEvent, 'preventDefault')
    const stopSpy = vi.spyOn(clickEvent, 'stopPropagation')

    await clickableSpan.element.dispatchEvent(clickEvent)

    expect(preventSpy).toHaveBeenCalled()
    expect(stopSpy).toHaveBeenCalled()
  })

  it('shows hover effects on recipe links', async () => {
    const targetRecipe = makeRecipeNode(TEST_RECIPES.IRON_INGOT, 0, { fromDatabase: true })
    withLinkData({ isRecipe: true, targetRecipe })

    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', TEST_RECIPES.IRON_INGOT, 30)
    const wrapper = createWrapper(link, 'input')

    const clickableSpan = wrapper.find('span[class*="navigate-name"]')

    expect(clickableSpan.classes()).toContain('navigate-name')
    expect(clickableSpan.classes()).not.toContain('navigate-name-hover')

    await clickableSpan.trigger('mouseenter')
    await wrapper.vm.$nextTick()

    expect(clickableSpan.classes()).not.toContain('navigate-name')
    expect(clickableSpan.classes()).toContain('navigate-name-hover')

    await clickableSpan.trigger('mouseleave')
    await wrapper.vm.$nextTick()

    expect(clickableSpan.classes()).toContain('navigate-name')
    expect(clickableSpan.classes()).not.toContain('navigate-name-hover')
  })

  it('does not call navigation when clicking and target recipe is null', async () => {
    withLinkData({ isRecipe: true })

    const link = makeMaterial(TEST_ITEMS.IRON_ORE, 'Mining', 'unknown-recipe', 30)
    const wrapper = createWrapper(link, 'input')
    await element(wrapper, '.navigate-name').click()
    expect(mockNavigateToRecipe).not.toHaveBeenCalled()
  })
})
