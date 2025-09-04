import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, type VueWrapper, type MountingOptions } from '@vue/test-utils'
import { getActivePinia } from 'pinia'
import GettingStarted from '@/components/common/GettingStarted.vue'
import { useFactoryStore } from '@/stores/factory'

function createWrapper(component: VueWrapper, options: MountingOptions<VueWrapper> = {}) {
  return mount(component, {
    ...options,
    global: {
      plugins: [getActivePinia()],
      ...options.global,
    },
  })
}

describe('GettingStarted', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Content Rendering', () => {
    it('renders the main title and welcome text', () => {
      const wrapper = createWrapper(GettingStarted)

      expect(wrapper.text()).toContain('Get Started')
      expect(wrapper.text()).toContain(
        'Welcome! To begin tracking your factory production, follow these simple steps:',
      )
    })

    it('renders all step instructions', () => {
      const wrapper = createWrapper(GettingStarted)

      expect(wrapper.text()).toContain('1. Add Factory')
      expect(wrapper.text()).toContain('Click the + button and enter a factory name and icon.')

      expect(wrapper.text()).toContain('2. Enter Recipes')
      expect(wrapper.text()).toContain(
        'Add recipes one by one using the recipe form, or import from Satisfactory Tools using the guide below.',
      )

      expect(wrapper.text()).toContain('3. Track Progress')
      expect(wrapper.text()).toContain(
        'Use the checkboxes to mark recipes and connections as built to track your factory construction progress.',
      )
    })

    it('renders the import guide information', () => {
      const wrapper = createWrapper(GettingStarted)

      expect(wrapper.text()).toContain('Want to import from Satisfactory Tools?')
      expect(wrapper.text()).toContain('Check out the import guide for step-by-step instructions.')

      const importLink = wrapper.find('a[target="_blank"]')
      expect(importLink.exists()).toBe(true)
      expect(importLink.attributes('href')).toBe(
        'https://github.com/ammesonb/satisfactory-prod-tracker/wiki/Import-from-Satisfactory-Tools',
      )
    })
  })

  describe('Sample Factory Button', () => {
    it('renders the sample recipes button', () => {
      const wrapper = createWrapper(GettingStarted)

      const sampleButton = wrapper.find('button')
      expect(sampleButton.exists()).toBe(true)
      expect(sampleButton.text()).toContain('Try Sample Recipes')
    })

    it('calls addFactory with correct parameters when clicked', async () => {
      const wrapper = createWrapper(GettingStarted)

      const factoryStore = useFactoryStore()
      const sampleButton = wrapper.find('button')
      await sampleButton.trigger('click')

      const factory = factoryStore.factories['Sample Factory']
      expect(factory).toBeDefined()
      expect(factory.name).toBe('Sample Factory')
      expect(factory.icon).toBe('desc-modularframe-c')
      expect(Object.keys(factory.recipeLinks).length).toBeGreaterThan(0)
    })

    it('selects the factory after creation', async () => {
      const wrapper = createWrapper(GettingStarted)

      const factoryStore = useFactoryStore()
      const sampleButton = wrapper.find('button')
      await sampleButton.trigger('click')

      expect(factoryStore.selected).toBe('Sample Factory')
    })

    it('handles errors when factory creation fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const wrapper = createWrapper(GettingStarted)
      const factoryStore = useFactoryStore()

      const originalAddFactory = factoryStore.addFactory
      const testError = new Error('Test factory creation error')
      factoryStore.addFactory = vi.fn(() => {
        throw testError
      })

      const sampleButton = wrapper.find('button')
      await sampleButton.trigger('click')

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to add sample factory:', testError)
      expect(factoryStore.selected).toBe('')

      // Restore original method
      factoryStore.addFactory = originalAddFactory
      consoleErrorSpy.mockRestore()
    })
  })
})
