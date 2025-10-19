import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mockNavigateToElement } from '@/__tests__/fixtures/composables/navigation'
import { component } from '@/__tests__/vue-test-helpers'

import FloatingNav from '@/components/layout/FloatingNav.vue'
import NavPanel from '@/components/layout/NavPanel.vue'
import { VFab } from 'vuetify/components'

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
    await component(wrapper, VFab).click()
    return wrapper.findComponent(NavPanel)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with FAB button initially visible', () => {
    const wrapper = createWrapper()

    component(wrapper, VFab).assert({
      exists: true,
      props: {
        icon: 'mdi-map',
        color: 'primary',
      },
    })
  })

  it('toggles nav panel visibility when FAB is clicked', async () => {
    const wrapper = createWrapper()

    // Initially, FAB is visible and NavPanel is not rendered
    component(wrapper, VFab).assert()
    component(wrapper, NavPanel).assert({ exists: false })

    await component(wrapper, VFab).click()

    // After clicking, NavPanel should be visible
    component(wrapper, NavPanel).assert()
  })

  it('handles navigate event from NavPanel and calls composable', async () => {
    const wrapper = createWrapper()

    const navPanel = await openNavPanel(wrapper)
    expect(navPanel.exists()).toBe(true)

    await component(wrapper, NavPanel).emit('navigate', 'floor-1')

    expect(mockNavigateToElement).toHaveBeenCalledWith('floor-1')
    // Panel should be closed after navigate
    component(wrapper, NavPanel).assert({ exists: false })
  })

  it('handles close event from NavPanel', async () => {
    const wrapper = createWrapper()

    await openNavPanel(wrapper)
    component(wrapper, NavPanel).assert()

    await component(wrapper, NavPanel).emit('close')

    // Nav panel should be closed
    component(wrapper, NavPanel).assert({ exists: false })
  })

  it('maintains closed state after multiple toggles', async () => {
    const wrapper = createWrapper()

    // Open panel
    await component(wrapper, VFab).click()
    component(wrapper, NavPanel).assert()

    // Close via close event
    await component(wrapper, NavPanel).emit('close')
    component(wrapper, NavPanel).assert({ exists: false })

    // Open again
    await component(wrapper, VFab).click()
    component(wrapper, NavPanel).assert()

    // Close via navigate
    await component(wrapper, NavPanel).emit('navigate', 'test-element')
    component(wrapper, NavPanel).assert({ exists: false })
  })
})
