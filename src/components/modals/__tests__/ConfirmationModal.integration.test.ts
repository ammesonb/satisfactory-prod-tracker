import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { component } from '@/__tests__/vue-test-helpers'

import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'
import { VBtn, VCard, VCardText, VCardTitle, VIcon } from 'vuetify/components'

describe('ConfirmationModal Integration', () => {
  const createWrapper = (props = {}) => {
    return mount(ConfirmationModal, {
      props: {
        show: false,
        ...props,
      },
    })
  }

  describe('Rendering', () => {
    it('does not render when show is false', () => {
      const wrapper = createWrapper({ show: false })
      component(wrapper, VCard).assert({ exists: false })
    })

    it('renders with default props when show is true', () => {
      const wrapper = createWrapper({ show: true })

      component(wrapper, VCard).assert()
      component(wrapper, VIcon)
        .match((icon) => icon.props().icon === 'mdi-help-circle')
        .assert()
      component(wrapper, VCardTitle).assert({ text: 'Confirm Action' })
      component(wrapper, VCardText).assert({ text: 'Are you sure you want to proceed?' })

      component(wrapper, VBtn)
        .match((btn) => btn.text() === 'Cancel')
        .assert()
      component(wrapper, VBtn)
        .match((btn) => btn.text() === 'Confirm')
        .assert()
    })

    it('renders with custom title and message', () => {
      const wrapper = createWrapper({
        show: true,
        title: 'Delete Item',
        message: 'This action cannot be undone.',
      })

      component(wrapper, VCardTitle).assert({ text: 'Delete Item' })
      component(wrapper, VCardText).assert({ text: 'This action cannot be undone.' })
    })

    it('renders with custom button text', () => {
      const wrapper = createWrapper({
        show: true,
        confirmText: 'Delete',
        cancelText: 'Go Back',
      })

      component(wrapper, VBtn)
        .match((btn) => btn.text() === 'Go Back')
        .assert()
      component(wrapper, VBtn)
        .match((btn) => btn.text() === 'Delete')
        .assert()
    })
  })

  describe('User Interactions', () => {
    it('emits confirm and update:show events when confirm button is clicked', async () => {
      const wrapper = createWrapper({ show: true })

      await component(wrapper, VBtn)
        .match((btn) => btn.text() === 'Confirm')
        .click()

      expect(wrapper.emitted('confirm')).toBeTruthy()
      expect(wrapper.emitted('update:show')).toBeTruthy()
      expect(wrapper.emitted('update:show')?.[0]).toEqual([false])
    })

    it('emits cancel and update:show events when cancel button is clicked', async () => {
      const wrapper = createWrapper({ show: true })

      await component(wrapper, VBtn)
        .match((btn) => btn.text() === 'Cancel')
        .click()

      expect(wrapper.emitted('cancel')).toBeTruthy()
      expect(wrapper.emitted('update:show')).toBeTruthy()
      expect(wrapper.emitted('update:show')?.[0]).toEqual([false])
    })
  })
})
