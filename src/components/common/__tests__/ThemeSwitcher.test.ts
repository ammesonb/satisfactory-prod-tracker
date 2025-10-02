import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue'
import type { IThemeStore } from '@/types/stores'
import { component } from '@/__tests__/vue-test-helpers'
import { VBtn, VIcon } from 'vuetify/components'

// Mock the useTheme composable from Vuetify
const mockThemeChange = vi.fn()
vi.mock('vuetify', () => ({
  useTheme: vi.fn(() => ({
    change: mockThemeChange,
  })),
}))

// Mock the stores composable
const mockThemeStore = {
  isDark: false,
  toggleTheme: vi.fn(),
  setTheme: vi.fn(),
} as Partial<IThemeStore>

vi.mock('@/composables/useStores', () => ({
  getStores: vi.fn(() => ({
    themeStore: mockThemeStore,
  })),
}))

describe('ThemeSwitcher Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockThemeStore.isDark = false
  })

  const createWrapper = () => {
    return mount(ThemeSwitcher)
  }

  it('renders with default light theme', () => {
    const wrapper = createWrapper()

    component(wrapper, VBtn).assert({
      exists: true,
      attributes: {
        'aria-label': 'Switch to dark mode',
      },
    })

    component(wrapper, VIcon).assert({
      props: {
        color: 'orange',
      },
    })
    expect(wrapper.html()).toContain('mdi-weather-night')
  })

  it('renders with dark theme', () => {
    mockThemeStore.isDark = true

    const wrapper = createWrapper()

    component(wrapper, VBtn).assert({
      attributes: {
        'aria-label': 'Switch to light mode',
      },
    })

    expect(wrapper.html()).toContain('mdi-weather-sunny')
  })

  it('calls toggleTheme when button is clicked', async () => {
    const wrapper = createWrapper()

    await component(wrapper, VBtn).click()
    expect(mockThemeStore.toggleTheme).toHaveBeenCalledOnce()
  })

  it('has correct accessibility attributes', () => {
    const wrapper = createWrapper()

    component(wrapper, VBtn).assert({
      props: {
        icon: true,
      },
      attributes: {
        'aria-label': 'Switch to dark mode',
      },
    })
  })

  it('renders correctly in both theme states', () => {
    // Test light theme
    mockThemeStore.isDark = false
    const lightWrapper = createWrapper()
    component(lightWrapper, VBtn).assert({
      attributes: {
        'aria-label': 'Switch to dark mode',
      },
    })
    component(lightWrapper, VIcon).assert({
      props: {
        color: 'orange',
      },
    })
    expect(lightWrapper.html()).toContain('mdi-weather-night')

    // Test dark theme
    mockThemeStore.isDark = true
    const darkWrapper = createWrapper()
    component(darkWrapper, VBtn).assert({
      attributes: {
        'aria-label': 'Switch to light mode',
      },
    })
    component(darkWrapper, VIcon).assert({
      props: {
        color: 'orange',
      },
    })
    expect(darkWrapper.html()).toContain('mdi-weather-sunny')
  })
})
