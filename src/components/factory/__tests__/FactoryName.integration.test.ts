import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mockFactories } from '@/__tests__/fixtures/composables/factoryStore'
import { component } from '@/__tests__/vue-test-helpers'

import FactoryName from '@/components/factory/FactoryName.vue'
import { VBtn, VTextField } from 'vuetify/components'

vi.mock('@/composables/useStores', async () => {
  const { mockUseStores } = await import('@/__tests__/fixtures/composables')
  return mockUseStores
})

describe('FactoryName Integration', () => {
  const createWrapper = (props = {}) => {
    return mount(FactoryName, {
      props: {
        name: 'Steel Production',
        ...props,
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFactories.value = {}
  })

  describe('Display Mode', () => {
    it('displays factory name as text by default', () => {
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Steel Production')
      component(wrapper, VTextField).assert({ exists: false })
    })
  })

  describe('Edit Mode', () => {
    it('shows text field when edit button clicked', async () => {
      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-pencil')
        .click()

      component(wrapper, VTextField).assert({ exists: true })
    })

    it('initializes text field with current name', async () => {
      const wrapper = createWrapper({ name: 'Original Name' })

      await component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-pencil')
        .click()

      component(wrapper, VTextField).assert({
        props: { modelValue: 'Original Name' },
      })
    })

    it('hides text when editing', async () => {
      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-pencil')
        .click()

      expect(wrapper.text()).not.toContain('Steel Production')
    })
  })

  describe('Rename Functionality', () => {
    it('emits rename event when name is changed and committed', async () => {
      mockFactories.value = {}

      const wrapper = createWrapper({ name: 'Original' })

      // Enter edit mode
      await component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-pencil')
        .click()

      // Change name
      const textField = component(wrapper, VTextField).getComponent()
      await textField.setValue('New Name')

      // Commit change (blur)
      await textField.trigger('blur')

      expect(wrapper.emitted('rename')).toHaveLength(1)
      expect(wrapper.emitted('rename')?.[0]).toEqual(['Original', 'New Name'])
    })

    it('emits rename on Enter key', async () => {
      mockFactories.value = {}

      const wrapper = createWrapper({ name: 'Original' })

      await component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-pencil')
        .click()

      const textField = component(wrapper, VTextField).getComponent()
      await textField.setValue('New Name')
      await textField.trigger('keydown.enter')

      expect(wrapper.emitted('rename')).toHaveLength(1)
      expect(wrapper.emitted('rename')?.[0]).toEqual(['Original', 'New Name'])
    })

    it('does not emit rename when name is unchanged', async () => {
      const wrapper = createWrapper({ name: 'Same Name' })

      await component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-pencil')
        .click()

      const textField = component(wrapper, VTextField).getComponent()
      await textField.trigger('blur')

      expect(wrapper.emitted('rename')).toBeUndefined()
    })

    it('trims whitespace from new name', async () => {
      mockFactories.value = {}

      const wrapper = createWrapper({ name: 'Original' })

      await component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-pencil')
        .click()

      const textField = component(wrapper, VTextField).getComponent()
      await textField.setValue('  New Name  ')
      await textField.trigger('blur')

      expect(wrapper.emitted('rename')?.[0]).toEqual(['Original', 'New Name'])
    })

    it('does not emit rename for empty name', async () => {
      const wrapper = createWrapper({ name: 'Original' })

      await component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-pencil')
        .click()

      const textField = component(wrapper, VTextField).getComponent()
      await textField.setValue('')
      await textField.trigger('blur')

      expect(wrapper.emitted('rename')).toBeUndefined()
    })
  })

  describe('Name Conflict Detection', () => {
    it('shows error when new name conflicts with existing factory', async () => {
      mockFactories.value = {
        'Existing Factory': {
          name: 'Existing Factory',
          icon: 'icon',
          floors: [],
          recipeLinks: {},
        },
      }

      const wrapper = createWrapper({ name: 'Original' })

      await component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-pencil')
        .click()

      const textField = component(wrapper, VTextField).getComponent()
      await textField.setValue('Existing Factory')

      component(wrapper, VTextField).assert({
        props: {
          error: true,
          errorMessages: 'A factory with this name already exists',
        },
      })
    })

    it('does not show error for same name (no change)', async () => {
      mockFactories.value = {
        'Steel Production': {
          name: 'Steel Production',
          icon: 'icon',
          floors: [],
          recipeLinks: {},
        },
      }

      const wrapper = createWrapper({ name: 'Steel Production' })

      await component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-pencil')
        .click()

      component(wrapper, VTextField).assert({
        props: {
          error: false,
        },
      })
    })

    it('prevents rename when name conflicts', async () => {
      mockFactories.value = {
        Conflict: {
          name: 'Conflict',
          icon: 'icon',
          floors: [],
          recipeLinks: {},
        },
      }

      const wrapper = createWrapper({ name: 'Original' })

      await component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-pencil')
        .click()

      const textField = component(wrapper, VTextField).getComponent()
      await textField.setValue('Conflict')
      await textField.trigger('blur')

      // Should not emit and should stay in edit mode
      expect(wrapper.emitted('rename')).toBeUndefined()
      component(wrapper, VTextField).assert({ exists: true })
    })
  })

  describe('Delete Functionality', () => {
    it('emits delete event when delete button clicked', async () => {
      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-delete')
        .click()

      expect(wrapper.emitted('delete')).toHaveLength(1)
      expect(wrapper.emitted('delete')?.[0]).toEqual([])
    })

    it('does not propagate click event', async () => {
      const wrapper = mount({
        template: '<div @click="parentClick"><FactoryName :name="name" /></div>',
        components: { FactoryName },
        setup() {
          return {
            name: 'Test Factory',
            parentClick: vi.fn(),
          }
        },
      })

      await component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-delete')
        .click()

      // Parent click should not be called due to @click.stop
      expect(wrapper.vm.parentClick).not.toHaveBeenCalled()
    })
  })

  describe('Event Propagation', () => {
    it('prevents click propagation when clicking edit button', async () => {
      const wrapper = mount({
        template: '<div @click="parentClick"><FactoryName :name="name" /></div>',
        components: { FactoryName },
        setup() {
          return {
            name: 'Test Factory',
            parentClick: vi.fn(),
          }
        },
      })

      await component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-pencil')
        .click()

      expect(wrapper.vm.parentClick).not.toHaveBeenCalled()
    })

    it('prevents click propagation when clicking text field', async () => {
      const wrapper = mount({
        template: '<div @click="parentClick"><FactoryName :name="name" /></div>',
        components: { FactoryName },
        setup() {
          return {
            name: 'Test Factory',
            parentClick: vi.fn(),
          }
        },
      })

      await component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-pencil')
        .click()

      await component(wrapper, VTextField).click()

      expect(wrapper.vm.parentClick).not.toHaveBeenCalled()
    })
  })
})
