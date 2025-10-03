import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { VBtn, VCard, VCardTitle, VAlert, VTab, VWindow } from 'vuetify/components'
import { component } from '@/__tests__/vue-test-helpers'
import { mockFactories } from '@/__tests__/fixtures/composables/factoryStore'

import ImportExportModal from '@/components/modals/ImportExportModal.vue'
import ExportTab from '@/components/modals/import-export/ExportTab.vue'

vi.mock('@/composables/useStores', async () => {
  const { mockUseStores } = await import('@/__tests__/fixtures/composables')
  return mockUseStores
})

vi.mock('@/components/modals/import-export/ExportTab.vue', () => ({
  default: {
    name: 'ExportTab',
    template: '<div data-testid="export-tab">Export Tab</div>',
    emits: ['error'],
  },
}))

vi.mock('@/components/modals/import-export/ImportTab.vue', () => ({
  default: {
    name: 'ImportTab',
    template: '<div data-testid="import-tab">Import Tab</div>',
    emits: ['error', 'success'],
  },
}))

const SAMPLE_FACTORY = { name: 'Test Factory', floors: [] }
describe('ImportExportModal Integration', () => {
  const createWrapper = (props = {}) => {
    return mount(ImportExportModal, {
      props: {
        modelValue: false,
        ...props,
      },
    })
  }

  beforeEach(() => {
    mockFactories.value = { factory: SAMPLE_FACTORY }
  })

  const createEmptyWrapper = (props = {}) => {
    mockFactories.value = {}
    return mount(ImportExportModal, {
      props: {
        modelValue: false,
        ...props,
      },
    })
  }

  describe('Rendering', () => {
    it('does not render when modelValue is false', () => {
      const wrapper = createWrapper({ modelValue: false })

      component(wrapper, VCard).assert({ exists: false })
    })

    it('renders modal when modelValue is true', () => {
      const wrapper = createWrapper({ modelValue: true })

      component(wrapper, VCard).assert()
      component(wrapper, VCardTitle).assert({ text: 'Import/Export Factories' })
    })

    it('renders export and import tabs', () => {
      const wrapper = createWrapper({ modelValue: true })

      component(wrapper, VTab)
        .match((tab) => tab.text()?.includes('Export'))
        .assert()
      component(wrapper, VTab)
        .match((tab) => tab.text()?.includes('Import'))
        .assert()
    })

    it('shows export tab by default when factories exist', () => {
      mockFactories.value = { factory: SAMPLE_FACTORY }

      const wrapper = createWrapper({ modelValue: true })

      const vWindow = component(wrapper, VWindow).getComponent()
      expect(vWindow.props('modelValue')).toBe('export')
    })

    it('resets to import tab when resetModal is called with no factories', async () => {
      const wrapper = createEmptyWrapper({ modelValue: true })

      // Call resetModal directly (simulates what happens when modal closes/reopens)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).resetModal()
      await nextTick()

      const vWindow = component(wrapper, VWindow).getComponent()
      expect(vWindow.props('modelValue')).toBe('import')
    })

    it('renders close button', () => {
      const wrapper = createWrapper({ modelValue: true })

      component(wrapper, VBtn)
        .match((btn) => btn.props().icon === true)
        .assert()
    })
  })

  describe('Error Handling', () => {
    it('does not show error alert by default', () => {
      const wrapper = createWrapper({ modelValue: true })

      component(wrapper, VAlert).assert({ exists: false })
    })

    it('shows error alert when error event is emitted from ExportTab', async () => {
      const wrapper = createWrapper({ modelValue: true })

      const exportTab = component(wrapper, ExportTab).getComponent()
      await exportTab.vm.$emit('error', 'Export failed')
      await nextTick()

      component(wrapper, VAlert).assert()
    })

    it('shows error alert when error is triggered programmatically', async () => {
      const wrapper = createWrapper({ modelValue: true })

      // Call the handleError method directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (wrapper.vm as any).handleError('Import failed')
      await nextTick()

      component(wrapper, VAlert).assert()
    })

    it('clears error when alert close button is clicked', async () => {
      const wrapper = createWrapper({ modelValue: true })

      const exportTab = component(wrapper, ExportTab).getComponent()
      await exportTab.vm.$emit('error', 'Test error')
      await nextTick()

      component(wrapper, VAlert).assert()

      const alert = component(wrapper, VAlert).getComponent()
      await alert.vm.$emit('click:close')
      await nextTick()

      component(wrapper, VAlert).assert({ exists: false })
    })
  })

  describe('User Interactions', () => {
    it('emits update:modelValue with false when close button is clicked', async () => {
      const wrapper = createWrapper({ modelValue: true })

      await component(wrapper, VBtn)
        .match((btn) => btn.props().icon === true)
        .click()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })

    it('closes modal when handleImportSuccess is called', async () => {
      const wrapper = createWrapper({ modelValue: true })

      // Call the handleImportSuccess method directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (wrapper.vm as any).handleImportSuccess()
      await nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })
  })
})
