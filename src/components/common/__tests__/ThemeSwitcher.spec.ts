import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue'
import { useThemeStore } from '@/stores/theme'
import { createPinia, setActivePinia, type Pinia } from 'pinia'

import '@/components/__tests__/component-setup'

describe('ThemeSwitcher', () => {
  let pinia: Pinia
  let themeStore: ReturnType<typeof useThemeStore>

  beforeEach(() => {
    vi.clearAllMocks()
    pinia = createPinia()
    setActivePinia(pinia)
    themeStore = useThemeStore()
  })

  const mountThemeSwitcher = () => {
    return mount(ThemeSwitcher)
  }

  describe('Initial Render', () => {
    it('renders theme toggle button', () => {
      const wrapper = mountThemeSwitcher()
      const button = wrapper.find('button[aria-label]')
      expect(button.exists()).toBe(true)
    })

    it('shows sun icon when in dark mode', () => {
      themeStore.setDarkTheme(true)
      const wrapper = mountThemeSwitcher()

      expect(wrapper.html()).toContain('mdi-weather-sunny')
    })

    it('shows moon icon when in light mode', () => {
      themeStore.setDarkTheme(false)
      const wrapper = mountThemeSwitcher()

      expect(wrapper.html()).toContain('mdi-weather-night')
    })
  })

  describe('Accessibility', () => {
    it('has correct aria-label for dark mode', () => {
      themeStore.setDarkTheme(true)
      const wrapper = mountThemeSwitcher()

      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBe('Switch to light mode')
    })

    it('has correct aria-label for light mode', () => {
      themeStore.setDarkTheme(false)
      const wrapper = mountThemeSwitcher()

      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBe('Switch to dark mode')
    })
  })

  describe('Theme Toggle Functionality', () => {
    it('toggles theme when button is clicked', async () => {
      themeStore.setDarkTheme(true)
      const wrapper = mountThemeSwitcher()
      const button = wrapper.find('button')

      await button.trigger('click')

      expect(themeStore.isDark).toBe(false)
    })
  })

  describe('Icon Display', () => {
    it('displays weather-sunny icon in dark mode', () => {
      themeStore.setDarkTheme(true)
      const wrapper = mountThemeSwitcher()

      expect(wrapper.html()).toContain('mdi-weather-sunny')
    })

    it('displays weather-night icon in light mode', () => {
      themeStore.setDarkTheme(false)
      const wrapper = mountThemeSwitcher()

      expect(wrapper.html()).toContain('mdi-weather-night')
    })
  })

  describe('Button Styling', () => {
    it('renders as icon button', () => {
      const wrapper = mountThemeSwitcher()
      const button = wrapper.find('button')

      expect(button.exists()).toBe(true)
      expect(wrapper.html()).toContain('v-btn')
    })

    it('has orange colored icon', () => {
      const wrapper = mountThemeSwitcher()
      const icon = wrapper.find('.v-icon')

      expect(icon.exists()).toBe(true)
      expect(wrapper.html()).toContain('text-orange')
    })
  })
})
