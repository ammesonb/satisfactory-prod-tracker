import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import FactoryDrawer from '@/components/layout/FactoryDrawer.vue'
import {
  mockFactories,
  mockSelectedFactory,
  mockSetSelectedFactory,
  mockRemoveFactory,
} from '@/__tests__/fixtures/composables/factoryStore'
import { mockInitializeExpansion } from '@/__tests__/fixtures/composables/navigation'
import { mockIsRecipeComplete } from '@/__tests__/fixtures/composables/useRecipeStatus'
import {
  mockSearchInput,
  mockFilteredItems,
  mockUpdateSearch,
} from '@/__tests__/fixtures/composables/dataSearch'

// Mock composables with centralized fixtures
vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return { getStores: mockGetStores }
})

vi.mock('@/composables/useFloorNavigation', async () => {
  const { mockUseFloorNavigation } = await import('@/__tests__/fixtures/composables')
  return { useFloorNavigation: mockUseFloorNavigation }
})

vi.mock('@/composables/useRecipeStatus', async () => {
  const { mockUseRecipeStatus } = await import('@/__tests__/fixtures/composables')
  return { useRecipeStatus: mockUseRecipeStatus }
})

vi.mock('@/composables/useDataSearch', async () => {
  const { mockUseDataSearch } = await import('@/__tests__/fixtures/composables')
  return { useDataSearch: mockUseDataSearch }
})

// Mock modal component to avoid DOM issues in tests
vi.mock('@/components/modals/ConfirmationModal.vue', () => ({
  default: {
    name: 'ConfirmationModal',
    props: ['show', 'title', 'message', 'confirmText', 'cancelText'],
    template: '<div data-testid="confirmation-modal">Mock Modal</div>',
  },
}))

describe('FactoryDrawer Integration', () => {
  const TEST_FACTORIES = {
    STEEL_PLANT: {
      name: 'Steel Production Plant',
      icon: 'Desc_SteelIngot_C',
      floors: {},
    },
    IRON_PLANT: {
      name: 'Iron Processing Plant',
      icon: 'Desc_IronIngot_C',
      floors: {},
    },
    COPPER_PLANT: {
      name: 'Copper Facility',
      icon: 'Desc_CopperIngot_C',
      floors: {},
    },
  } as const

  const createWrapper = () => {
    return mount({
      template: '<v-layout><FactoryDrawer /></v-layout>',
      components: { FactoryDrawer },
    })
  }

  beforeEach(() => {
    // Reset factory store state
    mockSelectedFactory.value = ''
    mockFactories.value = {}
    // Reset search state
    mockSearchInput.value = ''
    mockFilteredItems.value = []
  })

  describe('Empty State', () => {
    it('renders with no factories message when no factories exist', () => {
      const wrapper = createWrapper()

      const listItems = wrapper.findAllComponents({ name: 'VListItem' })
      const infoItem = listItems.find((item) => item.props('title') === 'No factories added yet')
      expect(infoItem?.exists()).toBe(true)
      expect(infoItem?.props('prependIcon')).toBe('mdi-information-outline')
    })

    it('does not show search field when no factories exist', () => {
      const wrapper = createWrapper()

      const searchField = wrapper.findComponent({ name: 'VTextField' })
      expect(searchField.exists()).toBe(false)
    })
  })

  describe('With Factories', () => {
    beforeEach(() => {
      mockFactories.value = {
        'Steel Production Plant': TEST_FACTORIES.STEEL_PLANT,
        'Iron Processing Plant': TEST_FACTORIES.IRON_PLANT,
        'Copper Facility': TEST_FACTORIES.COPPER_PLANT,
      }
      // Set filtered items to show all factories by default
      mockFilteredItems.value = Object.values(mockFactories.value)
    })

    it('renders all factories when search is empty', () => {
      const wrapper = createWrapper()

      const factoryRows = wrapper.findAllComponents({ name: 'FactoryDrawerRow' })
      expect(factoryRows).toHaveLength(3)

      const factoryNames = factoryRows.map((row) => row.props('factory').name)
      expect(factoryNames).toContain('Steel Production Plant')
      expect(factoryNames).toContain('Iron Processing Plant')
      expect(factoryNames).toContain('Copper Facility')
    })

    it('shows search field when drawer is expanded', async () => {
      const wrapper = createWrapper()

      // Navigation drawer starts collapsed (rail=true), expand it
      const drawer = wrapper.findComponent({ name: 'VNavigationDrawer' })
      await drawer.vm.$emit('update:rail', false)

      const searchField = wrapper.findComponent({ name: 'VTextField' })
      expect(searchField.exists()).toBe(true)
      expect(searchField.props('placeholder')).toBe('Search factories...')
      expect(searchField.props('prependInnerIcon')).toBe('mdi-magnify')
    })

    it('shows search icon when drawer is collapsed', () => {
      const wrapper = createWrapper()

      const searchIcon = wrapper.findComponent({ name: 'VIcon' })
      expect(searchIcon.exists()).toBe(true)
      expect(searchIcon.props('icon')).toBe('mdi-magnify')
    })

    it('shows active search icon color when search has value', () => {
      mockSearchInput.value = 'test'
      const wrapper = createWrapper()

      const searchIcon = wrapper.findComponent({ name: 'VIcon' })
      expect(searchIcon.props('color')).toBe('primary')
    })

    it('calls updateSearch when search field value changes', async () => {
      const wrapper = createWrapper()

      // Expand drawer to show search field
      const drawer = wrapper.findComponent({ name: 'VNavigationDrawer' })
      await drawer.vm.$emit('update:rail', false)

      const searchField = wrapper.findComponent({ name: 'VTextField' })
      await searchField.vm.$emit('update:modelValue', 'steel')

      expect(mockUpdateSearch).toHaveBeenCalledWith('steel')
    })

    it('displays filtered results from composable', () => {
      // Set mock filtered results to one factory
      mockFilteredItems.value = [TEST_FACTORIES.STEEL_PLANT]

      const wrapper = createWrapper()

      const factoryRows = wrapper.findAllComponents({ name: 'FactoryDrawerRow' })
      expect(factoryRows).toHaveLength(1)
      expect(factoryRows[0].props('factory').name).toBe('Steel Production Plant')
    })
  })

  describe('Factory Selection', () => {
    beforeEach(() => {
      mockFactories.value = {
        'Steel Production Plant': TEST_FACTORIES.STEEL_PLANT,
        'Iron Processing Plant': TEST_FACTORIES.IRON_PLANT,
      }
      // Set filtered items to show the factories
      mockFilteredItems.value = Object.values(mockFactories.value)
    })

    it('passes selected state to factory rows correctly', () => {
      mockSelectedFactory.value = 'Steel Production Plant'
      const wrapper = createWrapper()

      const factoryRows = wrapper.findAllComponents({ name: 'FactoryDrawerRow' })
      const steelRow = factoryRows.find(
        (row) => row.props('factory').name === 'Steel Production Plant',
      )
      const ironRow = factoryRows.find(
        (row) => row.props('factory').name === 'Iron Processing Plant',
      )

      expect(steelRow?.props('selected')).toBe(true)
      expect(ironRow?.props('selected')).toBe(false)
    })

    it('calls factory selection and navigation initialization when factory is selected', async () => {
      const wrapper = createWrapper()

      const factoryRows = wrapper.findAllComponents({ name: 'FactoryDrawerRow' })
      const steelRow = factoryRows.find(
        (row) => row.props('factory').name === 'Steel Production Plant',
      )

      await steelRow?.vm.$emit('select', TEST_FACTORIES.STEEL_PLANT)

      expect(mockSetSelectedFactory).toHaveBeenCalledWith('Steel Production Plant')
      expect(mockInitializeExpansion).toHaveBeenCalledWith(mockIsRecipeComplete)
    })

    it('handles factory deletion through drawer row', async () => {
      const wrapper = createWrapper()

      const factoryRows = wrapper.findAllComponents({ name: 'FactoryDrawerRow' })
      const steelRow = factoryRows.find(
        (row) => row.props('factory').name === 'Steel Production Plant',
      )

      await steelRow?.vm.$emit('delete', 'Steel Production Plant')

      expect(mockRemoveFactory).toHaveBeenCalledWith('Steel Production Plant')
    })
  })

  describe('Component Integration', () => {
    it('passes rail state to factory rows', () => {
      const wrapper = createWrapper()

      // Drawer starts collapsed (rail=true)
      const factoryRows = wrapper.findAllComponents({ name: 'FactoryDrawerRow' })
      factoryRows.forEach((row) => {
        expect(row.props('rail')).toBe(true)
      })
    })
  })
})
