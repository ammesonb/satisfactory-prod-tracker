import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  mockIsFactoryAutoSynced,
  mockSelectedFactories,
} from '@/__tests__/fixtures/composables/cloudSyncStore'
import { mockIsAuthenticated } from '@/__tests__/fixtures/composables/googleAuthStore'
import { makeConflict, makeFactory, makeSyncStatus } from '@/__tests__/fixtures/data/factory'
import { component, element } from '@/__tests__/vue-test-helpers'
import { FactorySyncStatus } from '@/types/cloudSync'
import { FACTORY_STATUS_TOOLTIPS, STATUS_COLORS, STATUS_ICONS } from '@/utils/cloudSync'

import FactorySyncBadge from '@/components/common/FactorySyncBadge.vue'
import { VBadge, VTooltip } from 'vuetify/components'

vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return { getStores: mockGetStores }
})

// Test factories with different sync statuses
const TEST_FACTORIES = {
  clean: makeFactory('Clean Factory', [], {
    syncStatus: makeSyncStatus(FactorySyncStatus.CLEAN),
  }),
  dirty: makeFactory('Dirty Factory', [], {
    syncStatus: makeSyncStatus(FactorySyncStatus.DIRTY),
  }),
  saving: makeFactory('Saving Factory', [], {
    syncStatus: makeSyncStatus(FactorySyncStatus.SAVING),
  }),
  conflict: makeFactory('Conflict Factory', [], {
    syncStatus: makeSyncStatus(FactorySyncStatus.CONFLICT),
    conflict: makeConflict(),
  }),
  error: makeFactory('Error Factory', [], {
    syncStatus: makeSyncStatus(FactorySyncStatus.ERROR, { lastError: 'Test error' }),
  }),
  noStatus: makeFactory('No Status Factory', []),
}

describe('FactorySyncBadge', () => {
  const createWrapper = (factoryOverride = TEST_FACTORIES.clean, railMode = false) => {
    return mount(FactorySyncBadge, {
      props: {
        factory: factoryOverride,
        rail: railMode,
      },
      slots: {
        default: '<div class="slot-content">Slot Content</div>',
      },
    })
  }

  beforeEach(() => {
    mockIsAuthenticated.mockReturnValue(false)
    mockSelectedFactories.value = []
    mockIsFactoryAutoSynced.mockImplementation((factoryName: string) =>
      mockSelectedFactories.value.includes(factoryName),
    )
  })

  describe('visibility', () => {
    it('shows badge when authenticated and factory is auto-synced', () => {
      mockIsAuthenticated.mockReturnValue(true)
      mockSelectedFactories.value = [TEST_FACTORIES.clean.name]

      const wrapper = createWrapper(TEST_FACTORIES.clean)

      component(wrapper, VBadge).assert()
    })

    it('hides badge when not authenticated', () => {
      mockIsAuthenticated.mockReturnValue(false)
      mockSelectedFactories.value = [TEST_FACTORIES.clean.name]

      const wrapper = createWrapper(TEST_FACTORIES.clean)

      component(wrapper, VBadge).assert({ exists: false })
    })

    it('hides badge when factory is not auto-synced', () => {
      mockIsAuthenticated.mockReturnValue(true)
      mockSelectedFactories.value = []

      const wrapper = createWrapper(TEST_FACTORIES.clean)

      component(wrapper, VBadge).assert({ exists: false })
    })

    it('renders slot content when badge is hidden', () => {
      mockIsAuthenticated.mockReturnValue(false)

      const wrapper = createWrapper(TEST_FACTORIES.clean)

      element(wrapper, '.slot-content').assert()
    })

    it('wraps slot content with badge when badge is shown', () => {
      mockIsAuthenticated.mockReturnValue(true)
      mockSelectedFactories.value = [TEST_FACTORIES.clean.name]

      const wrapper = createWrapper(TEST_FACTORIES.clean)

      component(wrapper, VBadge).assert()
      expect(wrapper.find('.slot-content').exists()).toBe(true)
    })
  })

  describe('badge appearance', () => {
    beforeEach(() => {
      mockIsAuthenticated.mockReturnValue(true)
    })

    it('passes color from utility function to badge', () => {
      mockSelectedFactories.value = [TEST_FACTORIES.clean.name]
      const wrapper = createWrapper(TEST_FACTORIES.clean)

      const badge = component(wrapper, VBadge).getComponent()
      expect(badge.props().color).toBe(STATUS_COLORS[FactorySyncStatus.CLEAN])
    })

    it('passes icon from utility function to badge', () => {
      mockSelectedFactories.value = [TEST_FACTORIES.dirty.name]
      const wrapper = createWrapper(TEST_FACTORIES.dirty)

      const badge = component(wrapper, VBadge).getComponent()
      expect(badge.props().icon).toBe(STATUS_ICONS[FactorySyncStatus.DIRTY])
    })

    it('uses dot mode when rail prop is true', () => {
      mockSelectedFactories.value = [TEST_FACTORIES.clean.name]
      const wrapper = createWrapper(TEST_FACTORIES.clean, true)

      const badge = component(wrapper, VBadge).getComponent()
      expect(badge.props().dot).toBe(true)
    })

    it('uses icon mode when rail prop is false', () => {
      mockSelectedFactories.value = [TEST_FACTORIES.clean.name]
      const wrapper = createWrapper(TEST_FACTORIES.clean, false)

      const badge = component(wrapper, VBadge).getComponent()
      expect(badge.props().dot).toBe(false)
    })
  })

  describe('tooltip', () => {
    it('enables tooltip when badge is visible', () => {
      mockIsAuthenticated.mockReturnValue(true)
      mockSelectedFactories.value = [TEST_FACTORIES.clean.name]

      const wrapper = createWrapper(TEST_FACTORIES.clean)

      const tooltip = component(wrapper, VTooltip).getComponent()
      expect(tooltip.props().disabled).toBe(false)
    })

    it('disables tooltip when badge is hidden', () => {
      mockIsAuthenticated.mockReturnValue(false)

      const wrapper = createWrapper(TEST_FACTORIES.clean)

      const tooltip = component(wrapper, VTooltip).getComponent()
      expect(tooltip.props().disabled).toBe(true)
    })

    it('passes tooltip text from utility function', () => {
      mockIsAuthenticated.mockReturnValue(true)
      mockSelectedFactories.value = [TEST_FACTORIES.clean.name]

      const wrapper = createWrapper(TEST_FACTORIES.clean)

      const tooltip = component(wrapper, VTooltip).getComponent()
      expect(tooltip.props().text).toBe(FACTORY_STATUS_TOOLTIPS[FactorySyncStatus.CLEAN])
    })
  })
})
