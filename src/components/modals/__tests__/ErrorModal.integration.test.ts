import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { h } from 'vue'
import { VBtn, VIcon, VCard, VCardTitle, VCardText } from 'vuetify/components'
import ErrorModal from '@/components/modals/ErrorModal.vue'
import { component, element } from '@/__tests__/vue-test-helpers'
import {
  mockErrorShow,
  mockErrorLevel,
  mockErrorSummary,
  mockErrorBodyContent,
  mockHideError,
} from '@/__tests__/fixtures/composables/errorStore'

vi.mock('@/composables/useStores', async () => {
  const { mockUseStores } = await import('@/__tests__/fixtures/composables')
  return mockUseStores
})

describe('ErrorModal Integration', () => {
  const createWrapper = () => {
    return mount(ErrorModal)
  }

  beforeEach(() => {
    mockErrorShow.value = false
    mockErrorLevel.value = 'error'
    mockErrorSummary.value = ''
    mockErrorBodyContent.value = null
    mockHideError.mockClear()
  })

  describe('Rendering', () => {
    it('does not render when error store show is false', () => {
      mockErrorShow.value = false

      const wrapper = createWrapper()

      component(wrapper, VCard).assert({ exists: false })
    })

    it('renders error dialog with title when shown', () => {
      mockErrorShow.value = true
      mockErrorSummary.value = 'Failed to load data'

      const wrapper = createWrapper()

      component(wrapper, VCard).assert()
      component(wrapper, VCardTitle).assert({ text: 'Failed to load data' })
      component(wrapper, VBtn)
        .match((btn) => btn.text() === 'Close')
        .assert()
    })

    it('renders with body content when provided', () => {
      mockErrorShow.value = true
      mockErrorSummary.value = 'Error Title'
      const errorMessage = 'Detailed error message'
      mockErrorBodyContent.value = () => h('div', errorMessage)

      const wrapper = createWrapper()

      component(wrapper, VCardText).assert()
      element(wrapper, 'div').assert({ text: errorMessage })
    })

    it('does not render body content when not provided', () => {
      mockErrorShow.value = true
      mockErrorSummary.value = 'Error Title'
      mockErrorBodyContent.value = null

      const wrapper = createWrapper()

      component(wrapper, VCardText).assert({ exists: false })
    })

    it('displays icon from error store', () => {
      mockErrorShow.value = true
      mockErrorSummary.value = 'Error'
      mockErrorLevel.value = 'error'

      const wrapper = createWrapper()

      component(wrapper, VIcon).assert({
        props: {
          icon: 'mdi-alert-circle',
          color: 'error',
        },
      })
    })
  })

  describe('User Interactions', () => {
    it('calls errorStore.hide when close button is clicked', async () => {
      mockErrorShow.value = true
      mockErrorSummary.value = 'Error'

      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .match((btn) => btn.text() === 'Close')
        .click()

      expect(mockHideError).toHaveBeenCalled()
    })
  })
})
