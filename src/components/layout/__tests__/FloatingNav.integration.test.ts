import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VFab } from 'vuetify/components'
import { mockNavigateToElement } from '@/__tests__/fixtures/composables/navigation'
import {
  expectElementExists,
  expectElementNotExists,
  expectProps,
  clickElement,
  emitEvent,
} from '@/__tests__/vue-test-helpers'

import FloatingNav from '@/components/layout/FloatingNav.vue'
import NavPanel from '../NavPanel.vue'

// Mock the useFloorNavigation composable
vi.mock('@/composables/useFloorNavigation', async () => {
  const { mockUseFloorNavigation } = await import('@/__tests__/fixtures/composables')
  return { useFloorNavigation: mockUseFloorNavigation }
})

describe('FloatingNav Integration', () => {
  const createWrapper = () => {
    return mount(FloatingNav)
  }

  const openNavPanel = async (wrapper: ReturnType<typeof createWrapper>) => {
    await clickElement(wrapper, VFab)
    return wrapper.findComponent(NavPanel)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with FAB button initially visible', () => {
    const wrapper = createWrapper()

    expectElementExists(wrapper, VFab)
    expectProps(wrapper, VFab, {
      icon: 'mdi-map',
      color: 'primary',
    })
  })

  it('toggles nav panel visibility when FAB is clicked', async () => {
    const wrapper = createWrapper()

    // Initially, FAB is visible and NavPanel is not rendered
    expectElementExists(wrapper, VFab)
    expectElementNotExists(wrapper, NavPanel)

    await clickElement(wrapper, VFab)

    // After clicking, NavPanel should be visible
    expectElementExists(wrapper, NavPanel)
  })

  it('handles navigate event from NavPanel and calls composable', async () => {
    const wrapper = createWrapper()

    const navPanel = await openNavPanel(wrapper)
    expect(navPanel.exists()).toBe(true)

    await emitEvent(wrapper, NavPanel, 'navigate', 'floor-1')

    expect(mockNavigateToElement).toHaveBeenCalledWith('floor-1')
    // Panel should be closed after navigate
    expectElementNotExists(wrapper, NavPanel)
  })

  it('handles close event from NavPanel', async () => {
    const wrapper = createWrapper()

    await openNavPanel(wrapper)
    expectElementExists(wrapper, NavPanel)

    await emitEvent(wrapper, NavPanel, 'close')

    // Nav panel should be closed
    expectElementNotExists(wrapper, NavPanel)
  })

  it('maintains closed state after multiple toggles', async () => {
    const wrapper = createWrapper()

    // Open panel
    await clickElement(wrapper, VFab)
    expectElementExists(wrapper, NavPanel)

    // Close via close event
    await emitEvent(wrapper, NavPanel, 'close')
    expectElementNotExists(wrapper, NavPanel)

    // Open again
    await clickElement(wrapper, VFab)
    expectElementExists(wrapper, NavPanel)

    // Close via navigate
    await emitEvent(wrapper, NavPanel, 'navigate', 'test-element')
    expectElementNotExists(wrapper, NavPanel)
  })
})
