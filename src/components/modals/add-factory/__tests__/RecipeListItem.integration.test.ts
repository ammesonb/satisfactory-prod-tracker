import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import RecipeListItem from '@/components/modals/add-factory/RecipeListItem.vue'
import { component } from '@/__tests__/vue-test-helpers'
import type { RecipeEntry } from '@/types/factory'
import { VBtn } from 'vuetify/components'
import CachedIcon from '@/components/common/CachedIcon.vue'
import { mockGetStores } from '@/__tests__/fixtures/composables/stores'

// Mock composables with centralized fixtures
vi.mock('@/composables/useStores', async () => {
  const { mockUseStores } = await import('@/__tests__/fixtures/composables')
  return mockUseStores
})

const IRON_INGOT_RECIPE = 'Recipe_Fake_IronIngot_C'
const SMELTER_BUILDING = 'Desc_SmelterMk1_C'

const createMockRecipeEntry = (overrides: Partial<RecipeEntry> = {}): RecipeEntry => ({
  recipe: IRON_INGOT_RECIPE,
  building: SMELTER_BUILDING,
  count: 2,
  icon: 'desc-smeltermk1-c',
  ...overrides,
})

describe('RecipeListItem Integration', () => {
  const createWrapper = (props: { entry?: RecipeEntry; rowNumber?: number } = {}) => {
    const defaultProps = {
      entry: createMockRecipeEntry(),
      rowNumber: 1,
      ...props,
    }
    return mount(RecipeListItem, {
      props: defaultProps,
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls dataStore methods with correct parameters', () => {
    const mockEntry = createMockRecipeEntry()
    const mockDataStore = mockGetStores().dataStore

    createWrapper({ entry: mockEntry })

    expect(mockDataStore.getIcon).toHaveBeenCalledWith(IRON_INGOT_RECIPE)
    expect(mockDataStore.getRecipeDisplayName).toHaveBeenCalledWith(IRON_INGOT_RECIPE)
    expect(mockDataStore.getBuildingDisplayName).toHaveBeenCalledWith(SMELTER_BUILDING)
  })

  it('emits remove event when delete button is clicked', async () => {
    const wrapper = createWrapper()

    await component(wrapper, VBtn).click()

    expect(wrapper.emitted('remove')).toBeTruthy()
    expect(wrapper.emitted('remove')?.[0]).toEqual([])
  })

  it('renders building icon when entry.icon is provided', () => {
    const mockEntry = createMockRecipeEntry({ icon: 'desc-smeltermk1-c' })
    const wrapper = createWrapper({ entry: mockEntry })

    const cachedIcons = wrapper.findAllComponents(CachedIcon)
    expect(cachedIcons.length).toBeGreaterThanOrEqual(2)
  })

  it('does not render building icon when entry.icon is empty', () => {
    const mockEntry = createMockRecipeEntry({ icon: '' })

    const wrapper = createWrapper({ entry: mockEntry })
    expect(wrapper.findAllComponents(CachedIcon)).toHaveLength(1)
  })

  it('displays correct recipe information', () => {
    const mockEntry = createMockRecipeEntry({ count: 3 })
    const wrapper = createWrapper({ entry: mockEntry, rowNumber: 5 })

    // Check row number and recipe name (dataStore returns the recipe key as display name)
    component(wrapper, RecipeListItem).assert({ text: '5. Recipe_Fake_IronIngot_C' })

    // Check building count and name (dataStore returns "Smelter" for Desc_SmelterMk1_C)
    component(wrapper, RecipeListItem).assert({ text: '3x Smelter' })
  })

  it('sets correct props on delete button', () => {
    component(createWrapper(), VBtn).assert({
      props: {
        icon: 'mdi-delete',
        size: 'small',
        variant: 'text',
        color: 'error',
      },
    })
  })
})
