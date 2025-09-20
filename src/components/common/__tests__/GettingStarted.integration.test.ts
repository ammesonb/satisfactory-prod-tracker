import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import GettingStarted from '@/components/common/GettingStarted.vue'
import {
  mockAddFactory,
  mockSetSelectedFactory,
} from '@/__tests__/fixtures/composables/factoryStore'

// Mock the useStores composable
vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return { getStores: mockGetStores }
})

describe('GettingStarted Integration', () => {
  // Test constants
  const UI_TEXT = {
    TITLE: 'Get Started',
    WELCOME_MESSAGE:
      'Welcome! To begin tracking your factory production, follow these simple steps:',
    SAMPLE_BUTTON_TEXT: 'Try Sample Recipes',
    IMPORT_GUIDE_TEXT: 'import guide',
    IMPORT_ALERT_TITLE: 'Want to import from Satisfactory Tools?',
  } as const

  const STEPS = {
    ADD_FACTORY: {
      title: 'Add Factory',
      description: 'Click the + button and enter a factory name and icon.',
    },
    ENTER_RECIPES: {
      title: 'Enter Recipes',
      description:
        'Add recipes one by one using the recipe form, or import from Satisfactory Tools using the guide below.',
    },
    TRACK_PROGRESS: {
      title: 'Track Progress',
      description:
        'Use the checkboxes to mark recipes and connections as built to track your factory construction progress.',
    },
  } as const

  const SAMPLE_DATA = {
    FACTORY_NAME: 'Sample Factory',
    FACTORY_ICON: 'desc-modularframe-c',
  } as const

  const ICONS = {
    ROCKET_LAUNCH: 'mdi-rocket-launch',
    PLAY_CIRCLE: 'mdi-play-circle',
  } as const

  const EXPECTED_STEP_COUNT = 3

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(GettingStarted, {
      props: {
        ...props,
      },
    })
  }

  it('renders with correct title and welcome message', () => {
    const wrapper = createWrapper()

    expect(wrapper.text()).toContain(UI_TEXT.TITLE)
    expect(wrapper.text()).toContain(UI_TEXT.WELCOME_MESSAGE)
  })

  it('displays rocket launch icon in title', () => {
    const wrapper = createWrapper()

    // Check for VIcon component in the title
    const cardTitle = wrapper.findComponent({ name: 'VCardTitle' })
    const titleIcon = cardTitle.findComponent({ name: 'VIcon' })
    expect(titleIcon.exists()).toBe(true)
    // Note: Testing icon presence through class or attributes since icon content may vary
    expect(wrapper.find('.v-card-title').html()).toContain(ICONS.ROCKET_LAUNCH)
  })

  it('renders sample recipes button with correct text and icon', () => {
    const wrapper = createWrapper()

    const sampleButton = wrapper.find('button')
    expect(sampleButton.exists()).toBe(true)
    expect(sampleButton.text()).toContain(UI_TEXT.SAMPLE_BUTTON_TEXT)
    expect(sampleButton.html()).toContain(ICONS.PLAY_CIRCLE)
  })

  it('displays all getting started steps', () => {
    const wrapper = createWrapper()

    // Check step count by looking for subtitle elements directly
    const stepTitles = wrapper.findAll('.text-subtitle-1')
    expect(stepTitles).toHaveLength(EXPECTED_STEP_COUNT)

    // Check step content
    expect(wrapper.text()).toContain(`1. ${STEPS.ADD_FACTORY.title}`)
    expect(wrapper.text()).toContain(STEPS.ADD_FACTORY.description)

    expect(wrapper.text()).toContain(`2. ${STEPS.ENTER_RECIPES.title}`)
    expect(wrapper.text()).toContain(STEPS.ENTER_RECIPES.description)

    expect(wrapper.text()).toContain(`3. ${STEPS.TRACK_PROGRESS.title}`)
    expect(wrapper.text()).toContain(STEPS.TRACK_PROGRESS.description)
  })

  it('renders import guide alert with correct content', () => {
    const wrapper = createWrapper()

    const alert = wrapper.findComponent({ name: 'VAlert' })
    expect(alert.exists()).toBe(true)
    expect(alert.props('type')).toBe('info')
    expect(alert.props('variant')).toBe('tonal')

    expect(wrapper.text()).toContain(UI_TEXT.IMPORT_ALERT_TITLE)
    expect(wrapper.text()).toContain(UI_TEXT.IMPORT_GUIDE_TEXT)
  })

  it('has external link to import guide with correct attributes', () => {
    const wrapper = createWrapper()

    const importLink = wrapper.find('a[target="_blank"]')
    expect(importLink.exists()).toBe(true)
    expect(importLink.attributes('href')).toBe(
      'https://github.com/ammesonb/satisfactory-prod-tracker/wiki/Import-from-Satisfactory-Tools',
    )
    expect(importLink.attributes('target')).toBe('_blank')
    expect(importLink.classes()).toContain('text-decoration-none')
    expect(importLink.text()).toBe(UI_TEXT.IMPORT_GUIDE_TEXT)
  })

  it('calls addFactory when sample button is clicked', async () => {
    const wrapper = createWrapper()
    const sampleButton = wrapper.find('button')

    await sampleButton.trigger('click')

    expect(mockAddFactory).toHaveBeenCalledWith(
      SAMPLE_DATA.FACTORY_NAME,
      SAMPLE_DATA.FACTORY_ICON,
      expect.any(String), // sample recipes string
      [],
    )
  })

  it('calls setSelectedFactory after adding sample factory', async () => {
    const wrapper = createWrapper()
    const sampleButton = wrapper.find('button')

    await sampleButton.trigger('click')

    expect(mockSetSelectedFactory).toHaveBeenCalledWith(SAMPLE_DATA.FACTORY_NAME)
  })

  it('passes sample recipes to addFactory with correct format', async () => {
    const wrapper = createWrapper()
    const sampleButton = wrapper.find('button')

    await sampleButton.trigger('click')

    const addFactoryCall = vi.mocked(mockAddFactory).mock.calls[0]
    const sampleRecipes = addFactoryCall[2]

    // Verify sample recipes contain expected recipe patterns
    expect(sampleRecipes).toContain('Recipe_Alternate_SteelRod_C@100#Desc_ConstructorMk1_C')
    expect(sampleRecipes).toContain('Recipe_Alternate_PureIronIngot_C@100#Desc_OilRefinery_C')
    expect(sampleRecipes).toContain('Recipe_ModularFrame_C@100#Desc_AssemblerMk1_C')
    expect(sampleRecipes).toContain('Recipe_Alternate_SteelCastedPlate_C@100#Desc_FoundryMk1_C')
    expect(sampleRecipes).toContain('Recipe_Alternate_Wire_1_C@100#Desc_ConstructorMk1_C')
    expect(sampleRecipes).toContain(
      'Recipe_Alternate_ReinforcedIronPlate_2_C@100#Desc_AssemblerMk1_C',
    )
    expect(sampleRecipes).toContain('Recipe_Alternate_IngotSteel_1_C@100#Desc_FoundryMk1_C')
  })

  it('handles addFactory errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockError = new Error('Failed to add factory')
    vi.mocked(mockAddFactory).mockImplementation(() => {
      throw mockError
    })

    const wrapper = createWrapper()
    const sampleButton = wrapper.find('button')

    await sampleButton.trigger('click')

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to add sample factory:', mockError)
    expect(mockSetSelectedFactory).not.toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('has proper card structure and styling', () => {
    const wrapper = createWrapper()

    const card = wrapper.findComponent({ name: 'VCard' })
    expect(card.exists()).toBe(true)
    expect(card.classes()).toContain('mx-auto')
    expect(card.props('maxWidth')).toBe('800')

    const cardTitle = wrapper.findComponent({ name: 'VCardTitle' })
    expect(cardTitle.exists()).toBe(true)
    expect(cardTitle.classes()).toContain('text-h5')
    expect(cardTitle.classes()).toContain('d-flex')
    expect(cardTitle.classes()).toContain('justify-space-between')
    expect(cardTitle.classes()).toContain('align-center')

    const cardText = wrapper.findComponent({ name: 'VCardText' })
    expect(cardText.exists()).toBe(true)
  })

  it('has proper button styling', () => {
    const wrapper = createWrapper()

    const button = wrapper.findComponent({ name: 'VBtn' })
    expect(button.exists()).toBe(true)
    expect(button.props('color')).toBe('secondary')
    expect(button.props('variant')).toBe('elevated')
    expect(button.props('prependIcon')).toBe(ICONS.PLAY_CIRCLE)
  })

  it('renders step descriptions with proper HTML structure', () => {
    const wrapper = createWrapper()

    const stepDescriptions = wrapper.findAll('.text-body-2.text-medium-emphasis')
    expect(stepDescriptions).toHaveLength(EXPECTED_STEP_COUNT)

    // Verify v-html directive is used (descriptions should render as HTML)
    stepDescriptions.forEach((desc) => {
      expect(desc.element.innerHTML).toBeTruthy()
    })
  })

  it('has proper alert styling and structure', () => {
    const wrapper = createWrapper()

    const alert = wrapper.findComponent({ name: 'VAlert' })
    expect(alert.classes()).toContain('mt-4')
  })
})
