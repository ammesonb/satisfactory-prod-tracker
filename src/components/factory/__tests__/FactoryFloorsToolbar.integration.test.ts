import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import FactoryFloorsToolbar from '@/components/factory/FactoryFloorsToolbar.vue'
import { ExpandRecipeState } from '@/composables/useFloorNavigation'
import type { IFactoryStore, IDataStore, IThemeStore, IErrorStore } from '@/types/stores'
import type { VueWrapper } from '@vue/test-utils'
import type { Factory } from '@/types/factory'

// Mock the composables
vi.mock('@/composables/useFloorNavigation', () => ({
  ExpandRecipeState: {
    Complete: 'complete',
    Incomplete: 'incomplete',
  },
  useFloorNavigation: vi.fn(() => ({
    setRecipeExpansionFromCompletion: vi.fn(),
  })),
}))

vi.mock('@/composables/useRecipeStatus', () => ({
  useRecipeStatus: vi.fn(() => ({
    isRecipeComplete: vi.fn(),
  })),
}))

vi.mock('@/composables/useFloorManagement', () => ({
  useFloorManagement: vi.fn(() => ({
    openFloorEditor: vi.fn(),
  })),
}))

vi.mock('@/composables/useStores', () => ({
  getStores: vi.fn(() => ({
    factoryStore: {
      currentFactory: null,
    },
  })),
}))

describe('FactoryFloorsToolbar Integration', () => {
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

  let mockFactoryStore: Partial<IFactoryStore>

  beforeEach(async () => {
    vi.clearAllMocks()

    mockFactoryStore = {
      currentFactory: null,
    }

    const { getStores } = vi.mocked(await import('@/composables/useStores'))
    getStores.mockReturnValue({
      dataStore: {} as IDataStore,
      factoryStore: mockFactoryStore as IFactoryStore,
      themeStore: {} as IThemeStore,
      errorStore: {} as IErrorStore,
    })
  })

  const createWrapper = () => {
    return mount(FactoryFloorsToolbar)
  }

  const setFactoryWithFloors = () => {
    mockFactoryStore.currentFactory = TEST_FACTORY
  }

  const setFactoryWithoutFloors = () => {
    mockFactoryStore.currentFactory = EMPTY_FACTORY
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

  it('renders correctly', () => {
    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('Complete')
    expect(wrapper.text()).toContain('Incomplete')
    expect(wrapper.text()).toContain('Edit Floors')
  })

  it('disables all buttons when factory has no floors', () => {
    setFactoryWithoutFloors()
    const wrapper = createWrapper()
    expectAllButtonsDisabled(wrapper)
  })

  it('disables all buttons when factory is null', () => {
    const wrapper = createWrapper()
    expectAllButtonsDisabled(wrapper)
  })

  it('enables all buttons when factory has floors', () => {
    setFactoryWithFloors()
    const wrapper = createWrapper()
    expectAllButtonsEnabled(wrapper)
  })

  it('renders menus with correct structure', () => {
    setFactoryWithFloors()
    const wrapper = createWrapper()

    const menus = wrapper.findAllComponents({ name: 'VMenu' })
    expect(menus).toHaveLength(2)

    // Check that menus have open-on-hover prop
    menus.forEach((menu) => {
      expect(menu.props('openOnHover')).toBe(true)
    })
  })

  it('renders menu buttons with correct text and icons', () => {
    const wrapper = createWrapper()

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
    setFactoryWithFloors()

    const { useFloorNavigation } = await import('@/composables/useFloorNavigation')
    const { useRecipeStatus } = await import('@/composables/useRecipeStatus')

    const wrapper = createWrapper()

    const mockSetRecipeExpansion =
      vi.mocked(useFloorNavigation).mock.results[0]?.value?.setRecipeExpansionFromCompletion
    const mockIsRecipeComplete = vi.mocked(useRecipeStatus).mock.results[0]?.value?.isRecipeComplete

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
    setFactoryWithFloors()

    const { useFloorManagement } = await import('@/composables/useFloorManagement')

    const wrapper = createWrapper()
    const editButton = wrapper.findAllComponents({ name: 'VBtn' })[2]
    await editButton.trigger('click')

    const mockOpenFloorEditor =
      vi.mocked(useFloorManagement).mock.results[0]?.value?.openFloorEditor
    expect(mockOpenFloorEditor).toHaveBeenCalledWith()
  })
})
