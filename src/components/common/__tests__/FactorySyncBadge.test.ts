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
import { VBadge, VIcon, VTooltip } from 'vuetify/components'

vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return { getStores: mockGetStores }
})

const SYNC_BADGE_CONTAINER = '.sync-badge-container'

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
    it('shows sync indicator when authenticated and factory is auto-synced (expanded mode)', () => {
      mockIsAuthenticated.mockReturnValue(true)
      mockSelectedFactories.value = [TEST_FACTORIES.clean.name]

      const wrapper = createWrapper(TEST_FACTORIES.clean, false)

      element(wrapper, SYNC_BADGE_CONTAINER).assert()
      component(wrapper, VIcon).assert()
    })

    it('shows dot badge when authenticated and factory is auto-synced (rail mode)', () => {
      mockIsAuthenticated.mockReturnValue(true)
      mockSelectedFactories.value = [TEST_FACTORIES.clean.name]

      const wrapper = createWrapper(TEST_FACTORIES.clean, true)

      component(wrapper, VBadge).assert()
    })

    it('hides sync indicator when not authenticated', () => {
      mockIsAuthenticated.mockReturnValue(false)
      mockSelectedFactories.value = [TEST_FACTORIES.clean.name]

      const wrapper = createWrapper(TEST_FACTORIES.clean)

      element(wrapper, SYNC_BADGE_CONTAINER).assert({ exists: false })
      component(wrapper, VBadge).assert({ exists: false })
    })

    it('hides sync indicator when factory is not auto-synced', () => {
      mockIsAuthenticated.mockReturnValue(true)
      mockSelectedFactories.value = []

      const wrapper = createWrapper(TEST_FACTORIES.clean)

      element(wrapper, SYNC_BADGE_CONTAINER).assert({ exists: false })
      component(wrapper, VBadge).assert({ exists: false })
    })

    it('renders slot content when sync indicator is hidden', () => {
      mockIsAuthenticated.mockReturnValue(false)

      const wrapper = createWrapper(TEST_FACTORIES.clean)

      element(wrapper, '.slot-content').assert()
    })

    it('wraps slot content with sync indicator when shown (expanded mode)', () => {
      mockIsAuthenticated.mockReturnValue(true)
      mockSelectedFactories.value = [TEST_FACTORIES.clean.name]

      const wrapper = createWrapper(TEST_FACTORIES.clean, false)

      element(wrapper, SYNC_BADGE_CONTAINER).assert()
      expect(wrapper.find('.slot-content').exists()).toBe(true)
    })
  })

  describe('badge appearance', () => {
    beforeEach(() => {
      mockIsAuthenticated.mockReturnValue(true)
    })

    describe('expanded mode (rail=false)', () => {
      it('passes color from utility function to icon', () => {
        mockSelectedFactories.value = [TEST_FACTORIES.clean.name]
        const wrapper = createWrapper(TEST_FACTORIES.clean, false)

        const icon = component(wrapper, VIcon).getComponent()
        expect(icon.props().color).toBe(STATUS_COLORS[FactorySyncStatus.CLEAN])
      })

      it('passes icon from utility function to icon', () => {
        mockSelectedFactories.value = [TEST_FACTORIES.dirty.name]
        const wrapper = createWrapper(TEST_FACTORIES.dirty, false)

        const icon = component(wrapper, VIcon).getComponent()
        expect(icon.props().icon).toBe(STATUS_ICONS[FactorySyncStatus.DIRTY])
      })

      it('adds spinning class when status is SAVING', () => {
        mockSelectedFactories.value = [TEST_FACTORIES.saving.name]
        const wrapper = createWrapper(TEST_FACTORIES.saving, false)

        const icon = component(wrapper, VIcon).getComponent()
        expect(icon.classes()).toContain('mdi-spin')
      })

      it('does not add spinning class when status is not SAVING', () => {
        mockSelectedFactories.value = [TEST_FACTORIES.clean.name]
        const wrapper = createWrapper(TEST_FACTORIES.clean, false)

        const icon = component(wrapper, VIcon).getComponent()
        expect(icon.classes()).not.toContain('mdi-spin')
      })
    })

    describe('rail mode (rail=true)', () => {
      it('uses dot mode on VBadge', () => {
        mockSelectedFactories.value = [TEST_FACTORIES.clean.name]
        const wrapper = createWrapper(TEST_FACTORIES.clean, true)

        const badge = component(wrapper, VBadge).getComponent()
        expect(badge.props().dot).toBe(true)
      })

      it('passes color from utility function to badge', () => {
        mockSelectedFactories.value = [TEST_FACTORIES.clean.name]
        const wrapper = createWrapper(TEST_FACTORIES.clean, true)

        const badge = component(wrapper, VBadge).getComponent()
        expect(badge.props().color).toBe(STATUS_COLORS[FactorySyncStatus.CLEAN])
      })
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
