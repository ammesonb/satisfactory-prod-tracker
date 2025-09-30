import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue'
import type { IThemeStore } from '@/types/stores'
import { component, element } from '@/__tests__/vue-test-helpers'
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
  })

  const createWrapper = () => {
    return mount(ThemeSwitcher)
  }

  it('renders with default light theme', () => {
    const wrapper = createWrapper()

    const button = wrapper.findComponent(VBtn)
    component(wrapper, VBtn).assert()
    expect(button.attributes('aria-label')).toBe('Switch to dark mode')

    component(wrapper, VIcon).assert()
    expect(component(wrapper, VIcon).getComponent().props('color')).toBe('orange')
    expect(wrapper.html()).toContain('mdi-weather-night')
  })

  it('renders with dark theme', () => {
    mockThemeStore.isDark = true

    const wrapper = createWrapper()

    const button = wrapper.findComponent(VBtn)
    component(wrapper, VBtn).assert()
    expect(button.attributes('aria-label')).toBe('Switch to light mode')

    expect(wrapper.html()).toContain('mdi-weather-sunny')
  })

  it('calls toggleTheme when button is clicked', async () => {
    const wrapper = createWrapper()

    await component(wrapper, VBtn).click()
    expect(mockThemeStore.toggleTheme).toHaveBeenCalledOnce()
  })

  it('has correct accessibility attributes', () => {
    const wrapper = createWrapper()

    const button = component(wrapper, VBtn).getComponent()
    expect(button.props('icon')).toBe(true)
    expect(button.attributes('aria-label')).toBeTruthy()
  })

  it('renders correctly in both theme states', () => {
    // Test light theme
    mockThemeStore.isDark = false
    const lightWrapper = createWrapper()
    expect(lightWrapper.html()).toContain('mdi-weather-night')
    const button = component(lightWrapper, VBtn).getComponent()
    expect(button.props('icon')).toBe(true)
    expect(button.attributes('aria-label')).toBe('Switch to dark mode')

    // Test dark theme
    mockThemeStore.isDark = true
    const darkWrapper = createWrapper()
    expect(darkWrapper.html()).toContain('mdi-weather-sunny')
    expect(darkWrapper.findComponent(VBtn).attributes('aria-label')).toBe('Switch to light mode')
  })
})
