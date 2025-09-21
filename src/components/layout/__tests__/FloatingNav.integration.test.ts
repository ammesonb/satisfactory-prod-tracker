import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import FloatingNav from '@/components/layout/FloatingNav.vue'
import { mockNavigateToElement } from '@/__tests__/fixtures/composables/navigation'
import {
  expectElementExists,
  expectElementNotExists,
  clickElement,
  emitEvent,
  byComponent,
  getComponent,
} from '@/__tests__/vue-test-helpers'

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
    await clickElement(wrapper, byComponent('VFab'))
    return getComponent(wrapper, byComponent('NavPanel'))
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with FAB button initially visible', () => {
    const wrapper = createWrapper()

    const fab = getComponent(wrapper, byComponent('VFab'))
    expect(fab.exists()).toBe(true)
    expect(fab.props('icon')).toBe('mdi-map')
    expect(fab.props('color')).toBe('primary')
  })

  it('toggles nav panel visibility when FAB is clicked', async () => {
    const wrapper = createWrapper()

    // Initially, FAB is visible and NavPanel is not rendered
    expectElementExists(wrapper, byComponent('VFab'))
    expectElementNotExists(wrapper, byComponent('NavPanel'))

    await clickElement(wrapper, byComponent('VFab'))

    // After clicking, NavPanel should be visible
    expectElementExists(wrapper, byComponent('NavPanel'))
  })

  it('handles navigate event from NavPanel and calls composable', async () => {
    const wrapper = createWrapper()

    const navPanel = await openNavPanel(wrapper)
    expect(navPanel.exists()).toBe(true)

    await emitEvent(wrapper, byComponent('NavPanel'), 'navigate', 'floor-1')

    expect(mockNavigateToElement).toHaveBeenCalledWith('floor-1')
    // Panel should be closed after navigate
    expectElementNotExists(wrapper, byComponent('NavPanel'))
  })

  it('handles close event from NavPanel', async () => {
    const wrapper = createWrapper()

    const navPanel = await openNavPanel(wrapper)
    expect(navPanel.exists()).toBe(true)

    await emitEvent(wrapper, byComponent('NavPanel'), 'close')

    // Nav panel should be closed
    expectElementNotExists(wrapper, byComponent('NavPanel'))
  })

  it('maintains closed state after multiple toggles', async () => {
    const wrapper = createWrapper()

    // Open panel
    await clickElement(wrapper, byComponent('VFab'))
    expectElementExists(wrapper, byComponent('NavPanel'))

    // Close via close event
    await emitEvent(wrapper, byComponent('NavPanel'), 'close')
    expectElementNotExists(wrapper, byComponent('NavPanel'))

    // Open again
    await clickElement(wrapper, byComponent('VFab'))
    expectElementExists(wrapper, byComponent('NavPanel'))

    // Close via navigate
    await emitEvent(wrapper, byComponent('NavPanel'), 'navigate', 'test-element')
    expectElementNotExists(wrapper, byComponent('NavPanel'))
  })
})
