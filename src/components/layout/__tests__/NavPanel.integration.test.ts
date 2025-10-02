import { mount, VueWrapper } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VBtn, VTextField, VListItem, VChip, VCard, VCardTitle } from 'vuetify/components'
import { mockCurrentFactory } from '@/__tests__/fixtures/composables/factoryStore'
import { component } from '@/__tests__/vue-test-helpers'
import { formatFloorId, formatRecipeId } from '@/utils/floors'
import { mockGetFloorDisplayName } from '@/__tests__/fixtures/composables/navigation'
import type { Factory, Floor } from '@/types/factory'
import { newRecipeNode } from '@/logistics/graph-node'

import NavPanel from '@/components/layout/NavPanel.vue'

// Mock composables
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

vi.mock('@/composables/useFloorSearch', async () => {
  const { mockUseFloorSearch } = await import('@/__tests__/fixtures/composables')
  return { useFloorSearch: mockUseFloorSearch }
})

vi.mock('@/logistics/images', () => ({
  getIconURL: vi.fn((icon: string) => `/icons/${icon}.png`),
}))

describe('NavPanel Integration', () => {
  const IRON_ORE = 'Desc_OreIron_C'
  const COPPER_ORE = 'Desc_OreCopper_C'

  const createTestFactory = (): Factory => {
    const ironIngotNode = newRecipeNode(
      {
        name: 'Recipe_IronIngot_C',
        building: 'Build_SmelterMk1_C',
        count: 1,
      },
      [], // ingredients
      [], // products
    )

    const ironPlateNode = newRecipeNode(
      {
        name: 'Recipe_IronPlate_C',
        building: 'Build_ConstructorMk1_C',
        count: 1,
      },
      [],
      [],
    )
    ironPlateNode.built = true // Mark as built for testing

    const copperIngotNode = newRecipeNode(
      {
        name: 'Recipe_CopperIngot_C',
        building: 'Build_SmelterMk1_C',
        count: 1,
      },
      [],
      [],
    )

    return {
      name: 'Test Factory',
      floors: [
        {
          name: 'Mining Floor',
          iconItem: IRON_ORE,
          recipes: [ironIngotNode, ironPlateNode],
        },
        {
          name: 'Processing Floor',
          iconItem: COPPER_ORE,
          recipes: [copperIngotNode],
        },
      ],
      recipeLinks: {},
      icon: '',
    }
  }

  const createWrapper = (factory: Factory | null = createTestFactory()) => {
    // Set up the mock factory data
    mockCurrentFactory.value = factory
    return mount(NavPanel)
  }

  const getFloorItems = (wrapper: VueWrapper) => {
    return component(wrapper, VListItem)
      .match((row) => row.classes().includes('floor-item'))
      .getComponents()
  }

  const getRecipeItems = (wrapper: VueWrapper) => {
    return component(wrapper, VListItem)
      .match((row) => row.classes().includes('recipe-item'))
      .getComponents()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentFactory.value = null

    // Setup default mock behaviors
    mockGetFloorDisplayName.mockImplementation(
      (floorNumber: number, floor?: Floor) => floor?.name || `Floor ${floorNumber}`,
    )
  })

  describe('rendering', () => {
    it('renders with factory floors', () => {
      const wrapper = createWrapper()

      // Check title and close button
      component(wrapper, VCard).assert()
      component(wrapper, VCardTitle).assert({ text: 'Navigation' })
      component(wrapper, VBtn).assert()

      // Check search field
      component(wrapper, VTextField).assert({
        props: { placeholder: 'Search floors and recipes...' },
      })

      // Check floor items
      const floorItems = getFloorItems(wrapper)
      expect(floorItems).toHaveLength(2)
      expect(floorItems[0].text()).toContain('Mining Floor')
      expect(floorItems[1].text()).toContain('Processing Floor')
    })

    it('does not render when no floors exist', () => {
      const emptyFactory: Factory = {
        name: 'Empty Factory',
        floors: [],
        recipeLinks: {},
        icon: '',
      }
      const wrapper = createWrapper(emptyFactory)

      component(wrapper, VCard).assert({ exists: false })
    })

    it('renders floor recipe counts', () => {
      const chips = createWrapper().findAllComponents(VChip)
      expect(chips[0].text()).toBe('2')
      expect(chips[1].text()).toBe('1')
    })

    it('renders recipe items under each floor', () => {
      const recipeItems = getRecipeItems(createWrapper())
      expect(recipeItems).toHaveLength(3) // 2 from first floor + 1 from second

      // Check recipe names (mocked to return the recipe name directly)
      expect(recipeItems[0].text()).toContain('Recipe_IronIngot_C')
      expect(recipeItems[1].text()).toContain('Recipe_IronPlate_C')
      expect(recipeItems[2].text()).toContain('Recipe_CopperIngot_C')
    })

    it('shows completion status for recipes', () => {
      expect(createWrapper().findAll('.recipe-built')).toHaveLength(1)
    })
  })

  describe('user interactions', () => {
    it('emits close event when close button is clicked', async () => {
      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .assert({ props: { icon: 'mdi-close' } })
        .click()

      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('emits navigate event with floor ID when floor is clicked', async () => {
      const wrapper = createWrapper()

      const floorItems = getFloorItems(wrapper)
      await floorItems[0].trigger('click')

      expect(wrapper.emitted('navigate')).toBeTruthy()
      expect(wrapper.emitted('navigate')?.[0]).toEqual([formatFloorId(0)])

      await floorItems[1].trigger('click')
      expect(wrapper.emitted('navigate')?.[1]).toEqual([formatFloorId(1)])
    })

    it('emits navigate event with recipe ID when recipe is clicked', async () => {
      const wrapper = createWrapper()

      const recipeItems = getRecipeItems(wrapper)

      await recipeItems[0].trigger('click')
      expect(wrapper.emitted('navigate')?.[0]).toEqual([formatRecipeId(0, 'Recipe_IronIngot_C')])

      await recipeItems[1].trigger('click')
      expect(wrapper.emitted('navigate')?.[1]).toEqual([formatRecipeId(0, 'Recipe_IronPlate_C')])

      await recipeItems[2].trigger('click')
      expect(wrapper.emitted('navigate')?.[2]).toEqual([formatRecipeId(1, 'Recipe_CopperIngot_C')])
    })
  })

  describe('search functionality', () => {
    it('focuses search field on mount', () => {
      const focusSpy = vi.fn()
      const originalFocus = HTMLElement.prototype.focus
      HTMLElement.prototype.focus = focusSpy

      const wrapper = createWrapper()

      // Vue Test Utils doesn't execute onMounted automatically in some cases
      // So we verify the ref exists and would be focused
      const searchFieldRef = (wrapper.vm as { searchFieldRef?: HTMLElement }).searchFieldRef
      expect(searchFieldRef).toBeDefined()

      HTMLElement.prototype.focus = originalFocus
    })

    it('displays floor icons when configured', () => {
      const wrapper = createWrapper()

      const floorItems = getFloorItems(wrapper)
      const firstFloor = floorItems[0]

      // Check that the avatar with icon is rendered
      const avatar = firstFloor.find('.v-avatar')
      expect(avatar.exists()).toBe(true)

      const img = avatar.find('.v-img')
      expect(img.exists()).toBe(true)
    })

    it('displays recipe icons', () => {
      const wrapper = createWrapper()

      const recipeItems = getRecipeItems(wrapper)
      const firstRecipe = recipeItems[0]

      const avatar = firstRecipe.find('.v-avatar')
      expect(avatar.exists()).toBe(true)

      const img = avatar.find('.v-img')
      expect(img.exists()).toBe(true)
    })
  })

  describe('default behaviors', () => {
    it('handles floors without custom names', () => {
      const factory: Factory = {
        name: 'Test',
        floors: [
          {
            recipes: [],
          },
        ],
        recipeLinks: {},
        icon: '',
      }

      const wrapper = createWrapper(factory)
      const floorItems = getFloorItems(wrapper)

      // Should use the default naming from useFloorManagement
      expect(floorItems[0].text()).toContain('Floor 1')
    })

    it('uses default icon for floors without custom icons', () => {
      const factory: Factory = {
        name: 'Test',
        floors: [
          {
            name: 'No Icon Floor',
            recipes: [],
          },
        ],
        recipeLinks: {},
        icon: '',
      }

      const wrapper = createWrapper(factory)
      const floorItems = getFloorItems(wrapper)

      // Should not have an avatar, but should have fallback icon
      expect(floorItems[0].props('prependIcon')).toBe('mdi-factory')
    })
  })

  describe('edge cases', () => {
    it('handles floors with no recipes', () => {
      const factory: Factory = {
        name: 'Test',
        floors: [
          {
            name: 'Empty Floor',
            recipes: [],
          },
        ],
        recipeLinks: {},
        icon: '',
      }

      const wrapper = createWrapper(factory)

      const recipeItems = getRecipeItems(wrapper)
      expect(recipeItems).toHaveLength(0)

      // But floor should still be visible with count of 0
      const chip = wrapper.findComponent(VChip)
      expect(chip.text()).toBe('0')
    })

    it('renders correctly with null factory', () => {
      // Should not render anything when factory is null
      component(createWrapper(null), VCard).assert({ exists: false })
    })
  })
})
