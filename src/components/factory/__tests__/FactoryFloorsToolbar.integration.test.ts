import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import FactoryFloorsToolbar from '@/components/factory/FactoryFloorsToolbar.vue'
import { ExpandRecipeState } from '@/utils/floors'
import type { VueWrapper } from '@vue/test-utils'
import type { Factory } from '@/types/factory'

vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return { getStores: mockGetStores }
})

vi.mock('@/composables/useFloorManagement', async () => {
  const { mockUseFloorManagement } = await import('@/__tests__/fixtures/composables')
  return { useFloorManagement: mockUseFloorManagement }
})

vi.mock('@/composables/useFloorNavigation', async () => {
  const { mockUseFloorNavigation } = await import('@/__tests__/fixtures/composables')
  return { useFloorNavigation: mockUseFloorNavigation }
})

vi.mock('@/composables/useRecipeStatus', async () => {
  const { mockUseRecipeStatus } = await import('@/__tests__/fixtures/composables')
  return { useRecipeStatus: mockUseRecipeStatus }
})

describe('FactoryFloorsToolbar Integration', () => {
  // Test constants from fixtures
  const TEST_FACTORY: Factory = {
    name: 'Test Factory',
    icon: 'factory',
    floors: [
      { name: 'Ground Floor', iconItem: 'Desc_OreIron_C', recipes: [] },
      { name: 'Second Floor', iconItem: 'Desc_OreCopper_C', recipes: [] },
    ],
    recipeLinks: {},
  }

  const EMPTY_FACTORY: Factory = {
    name: 'Empty Factory',
    icon: 'factory',
    floors: [],
    recipeLinks: {},
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    // Reset the reactive refs to default state
    const { mockCurrentFactory } = await import('@/__tests__/fixtures/composables/stores')
    mockCurrentFactory.value = null
  })

  const createWrapper = async (factoryOverride?: Partial<Factory> | null) => {
    // Set the factory before mounting using the reactive ref
    const { mockCurrentFactory } = await import('@/__tests__/fixtures/composables/stores')

    if (factoryOverride === null) {
      mockCurrentFactory.value = null
    } else if (factoryOverride) {
      mockCurrentFactory.value = { ...TEST_FACTORY, ...factoryOverride }
    } else {
      // Default case - use TEST_FACTORY which has floors
      mockCurrentFactory.value = TEST_FACTORY
    }

    return mount(FactoryFloorsToolbar)
  }

  const expectAllButtonsDisabled = (wrapper: VueWrapper) => {
    const buttons = wrapper.findAllComponents({ name: 'VBtn' })
    buttons.forEach((button) => {
      expect(button.props('disabled')).toBe(true)
    })
  }

  const expectAllButtonsEnabled = (wrapper: VueWrapper) => {
    const buttons = wrapper.findAllComponents({ name: 'VBtn' })
    buttons.forEach((button) => {
      expect(button.props('disabled')).toBe(false)
    })
  }

  it('renders correctly', async () => {
    const wrapper = await createWrapper()

    expect(wrapper.text()).toContain('Complete')
    expect(wrapper.text()).toContain('Incomplete')
    expect(wrapper.text()).toContain('Edit Floors')
  })

  it('disables all buttons when factory has no floors', async () => {
    const wrapper = await createWrapper(EMPTY_FACTORY)
    expectAllButtonsDisabled(wrapper)
  })

  it('disables all buttons when factory is null', async () => {
    const wrapper = await createWrapper(null)
    expectAllButtonsDisabled(wrapper)
  })

  it('enables all buttons when factory has floors', async () => {
    const wrapper = await createWrapper()
    expectAllButtonsEnabled(wrapper)
  })

  it('renders menus with correct structure', async () => {
    const wrapper = await createWrapper()

    const menus = wrapper.findAllComponents({ name: 'VMenu' })
    expect(menus).toHaveLength(2)

    // Check that menus have open-on-hover prop
    menus.forEach((menu) => {
      expect(menu.props('openOnHover')).toBe(true)
    })
  })

  it('renders menu buttons with correct text and icons', async () => {
    const wrapper = await createWrapper()

    expect(wrapper.text()).toContain('Complete')
    expect(wrapper.text()).toContain('Incomplete')
  })

  const testMenuAction = async (
    actionName:
      | 'showCompleteRecipes'
      | 'hideCompleteRecipes'
      | 'showIncompleteRecipes'
      | 'hideIncompleteRecipes',
    expectedState: typeof ExpandRecipeState.Complete | typeof ExpandRecipeState.Incomplete,
    expectedExpanded: boolean,
  ) => {
    const wrapper = await createWrapper()

    // Get the mocked composables from fixtures
    const { mockUseFloorNavigation, mockUseRecipeStatus } = await import(
      '@/__tests__/fixtures/composables'
    )
    const mockSetRecipeExpansion =
      mockUseFloorNavigation.mock.results[0]?.value?.setRecipeExpansionFromCompletion
    const mockIsRecipeComplete = mockUseRecipeStatus.mock.results[0]?.value?.isRecipeComplete

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const menuActions = (wrapper.vm as any).menuActions
    await menuActions[actionName]()

    expect(mockSetRecipeExpansion).toHaveBeenCalledWith(
      expectedState,
      expectedExpanded,
      mockIsRecipeComplete,
    )
  }

  it('calls setRecipeExpansionFromCompletion when showCompleteRecipes is triggered', async () => {
    await testMenuAction('showCompleteRecipes', ExpandRecipeState.Complete, true)
  })

  it('calls setRecipeExpansionFromCompletion when hideCompleteRecipes is triggered', async () => {
    await testMenuAction('hideCompleteRecipes', ExpandRecipeState.Complete, false)
  })

  it('calls setRecipeExpansionFromCompletion when showIncompleteRecipes is triggered', async () => {
    await testMenuAction('showIncompleteRecipes', ExpandRecipeState.Incomplete, true)
  })

  it('calls setRecipeExpansionFromCompletion when hideIncompleteRecipes is triggered', async () => {
    await testMenuAction('hideIncompleteRecipes', ExpandRecipeState.Incomplete, false)
  })

  it('calls openFloorEditor when Edit Floors button is clicked', async () => {
    const wrapper = await createWrapper()
    const editButton = wrapper.findAllComponents({ name: 'VBtn' })[2]
    await editButton.trigger('click')

    // Get the mocked composables from fixtures
    const { mockUseFloorManagement } = await import('@/__tests__/fixtures/composables')
    const mockOpenFloorEditor = mockUseFloorManagement.mock.results[0]?.value?.openFloorEditor
    expect(mockOpenFloorEditor).toHaveBeenCalledWith()
  })
})
