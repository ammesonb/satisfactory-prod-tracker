import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mockFactories } from '@/__tests__/fixtures/composables/factoryStore'
import { component } from '@/__tests__/vue-test-helpers'
import type { Factory } from '@/types/factory'

import FactorySelector from '@/components/common/FactorySelector.vue'
import ManualBackup from '@/components/modals/import-export/ManualBackup.vue'
import { VBtn } from 'vuetify/components'

vi.mock('@/composables/useStores', async () => {
  const { mockUseStores } = await import('@/__tests__/fixtures/composables')
  return mockUseStores
})

describe('ManualBackup Integration', () => {
  const testFactories: Factory[] = [
    {
      name: 'Iron Factory',
      icon: 'iron-icon',
      floors: [],
      recipeLinks: {},
    },
    {
      name: 'Copper Factory',
      icon: 'copper-icon',
      floors: [],
      recipeLinks: {},
    },
  ]

  const createWrapper = (props = {}) => {
    return mount(ManualBackup, {
      props: {
        disabled: false,
        ...props,
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFactories.value = {
      'Iron Factory': testFactories[0],
      'Copper Factory': testFactories[1],
    }
  })

  describe('Button State', () => {
    it('disables backup button when no factories selected', () => {
      const wrapper = createWrapper()

      component(wrapper, VBtn).assert({
        props: { disabled: true },
      })
    })

    it('enables backup button when factories are selected', async () => {
      const wrapper = createWrapper()

      await component(wrapper, FactorySelector).emit('update:modelValue', ['Iron Factory'])

      component(wrapper, VBtn).assert({
        props: { disabled: false },
      })
    })

    it('respects disabled prop regardless of selection', async () => {
      const wrapper = createWrapper({ disabled: true })

      await component(wrapper, FactorySelector).emit('update:modelValue', ['Iron Factory'])

      component(wrapper, VBtn).assert({
        props: { disabled: true },
      })
    })
  })

  describe('Button Text', () => {
    it('displays correct text for single factory', async () => {
      const wrapper = createWrapper()

      await component(wrapper, FactorySelector).emit('update:modelValue', ['Iron Factory'])

      expect(wrapper.text()).toContain('Backup 1 Factory')
    })

    it('displays correct text for multiple factories', async () => {
      const wrapper = createWrapper()

      await component(wrapper, FactorySelector).emit('update:modelValue', [
        'Iron Factory',
        'Copper Factory',
      ])

      expect(wrapper.text()).toContain('Backup 2 Factories')
    })

    it('displays correct text for no selection', () => {
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Backup 0 Factories')
    })
  })

  describe('Interactions', () => {
    it('emits backup event when button clicked', async () => {
      const wrapper = createWrapper()

      await component(wrapper, FactorySelector).emit('update:modelValue', ['Iron Factory'])
      await component(wrapper, VBtn).click()

      expect(wrapper.emitted('backup')).toHaveLength(1)
      expect(wrapper.emitted('backup')?.[0]).toEqual([])
    })

    it('does not emit backup when button is disabled', async () => {
      const wrapper = createWrapper({ disabled: true })

      await component(wrapper, FactorySelector).emit('update:modelValue', ['Iron Factory'])

      // Button is disabled, so click won't work
      const button = component(wrapper, VBtn).getComponent()
      expect(button.props('disabled')).toBe(true)
    })
  })

  describe('v-model binding', () => {
    it('updates selected factories when model changes', async () => {
      const wrapper = createWrapper()

      await component(wrapper, FactorySelector).emit('update:modelValue', ['Iron Factory'])

      const selector = component(wrapper, FactorySelector).getComponent()
      expect(selector.props('modelValue')).toEqual(['Iron Factory'])
    })

    it('syncs with parent v-model', async () => {
      const wrapper = mount(ManualBackup, {
        props: {
          modelValue: ['Iron Factory'],
          'onUpdate:modelValue': vi.fn(),
        },
      })

      const selector = component(wrapper, FactorySelector).getComponent()
      expect(selector.props('modelValue')).toEqual(['Iron Factory'])
    })
  })
})
