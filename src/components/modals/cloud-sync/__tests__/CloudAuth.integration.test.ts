import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { component } from '@/__tests__/vue-test-helpers'

import CloudAuth from '@/components/modals/cloud-sync/CloudAuth.vue'
import { VBtn } from 'vuetify/components'

describe('CloudAuth Integration', () => {
  const createWrapper = (props = {}) => {
    return mount(CloudAuth, {
      props: {
        loading: false,
        ...props,
      },
    })
  }

  describe('Button State', () => {
    it('shows sign in button enabled by default', () => {
      const wrapper = createWrapper()

      component(wrapper, VBtn).assert({
        props: { loading: false },
      })
    })

    it('shows loading state when loading prop is true', () => {
      const wrapper = createWrapper({ loading: true })

      component(wrapper, VBtn).assert({
        props: { loading: true },
      })
    })
  })

  describe('Interactions', () => {
    it('emits authenticate event when button clicked', async () => {
      const wrapper = createWrapper()

      await component(wrapper, VBtn).click()

      expect(wrapper.emitted('authenticate')).toHaveLength(1)
      expect(wrapper.emitted('authenticate')?.[0]).toEqual([])
    })

    it('emits authenticate event even when loading', async () => {
      const wrapper = createWrapper({ loading: true })

      await component(wrapper, VBtn).click()

      expect(wrapper.emitted('authenticate')).toHaveLength(1)
    })
  })
})
