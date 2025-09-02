import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import GettingStarted from '@/components/common/GettingStarted.vue'
import { useFactoryStore } from '@/stores/factory'
import { createPinia, setActivePinia, type Pinia } from 'pinia'

// Import the component test setup
import '@/components/__tests__/component-setup'

// Mock the factory store
vi.mock('@/stores/factory', () => ({
  useFactoryStore: vi.fn(),
}))

describe('GettingStarted', () => {
  let mockFactoryStore: ReturnType<typeof useFactoryStore>
  let pinia: Pinia

  beforeEach(() => {
    vi.clearAllMocks()

    pinia = createPinia()
    setActivePinia(pinia)

    mockFactoryStore = {
      addFactory: vi.fn(),
      setSelectedFactory: vi.fn(),
    } as unknown as ReturnType<typeof useFactoryStore>
    vi.mocked(useFactoryStore).mockImplementation(() => mockFactoryStore)
  })

  describe('Content Rendering', () => {
    it('renders the main title and welcome text', () => {
      const wrapper = mount(GettingStarted)

      expect(wrapper.text()).toContain('Get Started')
      expect(wrapper.text()).toContain(
        'Welcome! To begin tracking your factory production, follow these simple steps:',
      )
    })

    it('renders all step instructions', () => {
      const wrapper = mount(GettingStarted)

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
      const wrapper = mount(GettingStarted)

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
      const wrapper = mount(GettingStarted)

      const sampleButton = wrapper.find('button')
      expect(sampleButton.exists()).toBe(true)
      expect(sampleButton.text()).toContain('Try Sample Recipes')
    })

    it('calls addFactory with correct parameters when clicked', async () => {
      const wrapper = mount(GettingStarted)

      const sampleButton = wrapper.find('button')
      await sampleButton.trigger('click')

      expect(mockFactoryStore.addFactory).toHaveBeenCalledTimes(1)
      const [name, icon, recipes, externalInputs] = mockFactoryStore.addFactory.mock.calls[0]

      expect(name).toBe('Sample Factory')
      expect(icon).toBe('desc-modularframe-c')
      expect(externalInputs).toEqual([])

      // Verify sample recipes content
      expect(recipes).toContain('Recipe_Alternate_SteelRod_C@100#Desc_ConstructorMk1_C')
      expect(recipes).toContain('Recipe_ModularFrame_C@100#Desc_AssemblerMk1_C')
      expect(recipes).toContain('Recipe_Alternate_IngotSteel_1_C@100#Desc_FoundryMk1_C')
    })

    it('selects the factory after creation', async () => {
      const wrapper = mount(GettingStarted)

      const sampleButton = wrapper.find('button')
      await sampleButton.trigger('click')

      expect(mockFactoryStore.setSelectedFactory).toHaveBeenCalledTimes(1)
      expect(mockFactoryStore.setSelectedFactory).toHaveBeenCalledWith('Sample Factory')
    })

    it('handles errors when factory creation fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const testError = new Error('Test factory creation error')
      mockFactoryStore.addFactory.mockImplementation(() => {
        throw testError
      })

      const wrapper = mount(GettingStarted)

      const sampleButton = wrapper.find('button')
      await sampleButton.trigger('click')

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to add sample factory:', testError)
      expect(mockFactoryStore.setSelectedFactory).not.toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })
})
