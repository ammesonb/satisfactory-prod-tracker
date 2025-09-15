import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue'
import type { IThemeStore } from '@/types/stores'

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

    const button = wrapper.findComponent({ name: 'VBtn' })
    expect(button.exists()).toBe(true)
    expect(button.attributes('aria-label')).toBe('Switch to dark mode')

    const icon = wrapper.findComponent({ name: 'VIcon' })
    expect(icon.exists()).toBe(true)
    expect(wrapper.html()).toContain('mdi-weather-night')
    expect(icon.props('color')).toBe('orange')
  })

  it('renders with dark theme', () => {
    mockThemeStore.isDark = true

    const wrapper = createWrapper()

    const button = wrapper.findComponent({ name: 'VBtn' })
    expect(button.attributes('aria-label')).toBe('Switch to light mode')

    expect(wrapper.html()).toContain('mdi-weather-sunny')
  })

  it('calls toggleTheme when button is clicked', async () => {
    const wrapper = createWrapper()

    const button = wrapper.findComponent({ name: 'VBtn' })
    await button.trigger('click')

    expect(mockThemeStore.toggleTheme).toHaveBeenCalledOnce()
  })

  it('has correct accessibility attributes', () => {
    const wrapper = createWrapper()

    const button = wrapper.findComponent({ name: 'VBtn' })
    expect(button.props('icon')).toBe(true)
    expect(button.attributes('aria-label')).toBeTruthy()
  })

  it('renders correctly in both theme states', () => {
    // Test light theme
    mockThemeStore.isDark = false
    const lightWrapper = createWrapper()
    expect(lightWrapper.html()).toContain('mdi-weather-night')
    expect(lightWrapper.findComponent({ name: 'VBtn' }).attributes('aria-label')).toBe(
      'Switch to dark mode',
    )

    // Test dark theme
    mockThemeStore.isDark = true
    const darkWrapper = createWrapper()
    expect(darkWrapper.html()).toContain('mdi-weather-sunny')
    expect(darkWrapper.findComponent({ name: 'VBtn' }).attributes('aria-label')).toBe(
      'Switch to light mode',
    )
  })
})
