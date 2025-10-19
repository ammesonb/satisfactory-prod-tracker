import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  mockFilteredItems,
  mockSearchInput,
  mockUpdateSearch,
} from '@/__tests__/fixtures/composables/dataSearch'
import {
  mockFactories,
  mockRemoveFactory,
  mockSelectedFactory,
  mockSetSelectedFactory,
} from '@/__tests__/fixtures/composables/factoryStore'
import { mockInitializeExpansion } from '@/__tests__/fixtures/composables/navigation'
import { mockIsRecipeComplete } from '@/__tests__/fixtures/composables/useRecipeStatus'
import { component, element } from '@/__tests__/vue-test-helpers'

import FactoryDrawer from '@/components/layout/FactoryDrawer.vue'
import FactoryDrawerRow from '@/components/layout/FactoryDrawerRow.vue'
import { VIcon, VNavigationDrawer, VTextField } from 'vuetify/components'

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
      element(createWrapper(), '.no-factories').assert()
    })

    it('does not show search field when no factories exist', () => {
      component(createWrapper(), VTextField).assert({ exists: false })
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

      const factoryRows = wrapper.findAllComponents(FactoryDrawerRow)
      expect(factoryRows).toHaveLength(3)

      const factoryNames = factoryRows.map((row) => row.props('factory').name)
      expect(factoryNames).toContain('Steel Production Plant')
      expect(factoryNames).toContain('Iron Processing Plant')
      expect(factoryNames).toContain('Copper Facility')
    })

    it('shows search field when drawer is expanded', async () => {
      const wrapper = createWrapper()

      // Navigation drawer starts collapsed (rail=true), expand it
      await component(wrapper, VNavigationDrawer).emit('update:rail', false)

      component(wrapper, VTextField).assert({
        exists: true,
        props: {
          placeholder: 'Search factories...',
          prependInnerIcon: 'mdi-magnify',
          density: 'compact',
          hideDetails: true,
          clearable: true,
        },
      })
    })

    it('shows search icon when drawer is collapsed', () => {
      const wrapper = createWrapper()

      component(wrapper, VIcon).assert({
        exists: true,
        props: {
          icon: 'mdi-magnify',
          size: '24',
          color: 'default',
        },
      })
    })

    it('shows active search icon color when search has value', () => {
      mockSearchInput.value = 'test'
      const wrapper = createWrapper()

      component(wrapper, VIcon).assert({
        exists: true,
        props: {
          color: 'primary',
        },
      })
    })

    it('calls updateSearch when search field value changes', async () => {
      const wrapper = createWrapper()

      await component(wrapper, VNavigationDrawer).emit('update:rail', false)
      await component(wrapper, VTextField).emit('update:modelValue', 'steel')
      expect(mockUpdateSearch).toHaveBeenCalledWith('steel')
    })

    it('displays filtered results from composable', () => {
      // Set mock filtered results to one factory
      mockFilteredItems.value = [TEST_FACTORIES.STEEL_PLANT]

      const wrapper = createWrapper()

      const factoryRows = wrapper.findAllComponents(FactoryDrawerRow)
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

      component(wrapper, FactoryDrawerRow)
        .match(
          (row) => row.props('factory').name === 'Steel Production Plant' && row.props('selected'),
        )
        .assert()
      component(wrapper, FactoryDrawerRow)
        .match(
          (row) => row.props('factory').name === 'Iron Processing Plant' && !row.props('selected'),
        )
        .assert()
    })

    it('calls factory selection and navigation initialization when factory is selected', async () => {
      const wrapper = createWrapper()
      const selectedName = 'Steel Production Plant'

      component(wrapper, FactoryDrawerRow)
        .match((row) => row.props('factory').name === selectedName)
        .emit('select', TEST_FACTORIES.STEEL_PLANT)

      expect(mockSetSelectedFactory).toHaveBeenCalledWith(selectedName)
      expect(mockInitializeExpansion).toHaveBeenCalledWith(mockIsRecipeComplete)
    })

    it('handles factory deletion through drawer row', async () => {
      const wrapper = createWrapper()
      const factoryName = 'Steel Production Plant'

      component(wrapper, FactoryDrawerRow)
        .match((row) => row.props('factory').name === factoryName)
        .emit('delete', factoryName)

      expect(mockRemoveFactory).toHaveBeenCalledWith(factoryName)
    })
  })

  describe('Component Integration', () => {
    it('passes rail state to factory rows', () => {
      mockFactories.value = {
        'Steel Production Plant': TEST_FACTORIES.STEEL_PLANT,
      }
      mockFilteredItems.value = Object.values(mockFactories.value)

      const wrapper = createWrapper()

      // Drawer starts collapsed (rail=true)
      component(wrapper, FactoryDrawerRow).assertAll({ props: { rail: true } })
    })
  })
})
