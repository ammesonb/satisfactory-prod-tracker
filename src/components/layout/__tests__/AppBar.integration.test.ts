import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VApp, VLayout, VMain } from 'vuetify/components'
import AppBar from '@/components/layout/AppBar.vue'
import { mockSelectedFactory } from '@/__tests__/fixtures/composables/factoryStore'

vi.mock('@/components/modals/ImportExportModal.vue', () => ({
  default: {
    name: 'ImportExportModal',
    props: ['modelValue'],
    template: '<div data-testid="import-export-modal">Mock Modal</div>',
  },
}))

vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return { getStores: mockGetStores }
})

describe('AppBar Integration', () => {
  const createWrapper = (props = {}) => {
    return mount(
      {
        template: `
        <v-app>
          <v-layout>
            <AppBar v-bind="$attrs" />
            <v-main></v-main>
          </v-layout>
        </v-app>
      `,
        components: { AppBar, VApp, VLayout, VMain },
        inheritAttrs: false,
      },
      {
        props: {
          ...props,
        },
      },
    )
  }

  beforeEach(() => {
    mockSelectedFactory.value = ''
  })

  it('shows factory chip when factory is selected', () => {
    const testFactoryName = 'Steel Production Plant'
    mockSelectedFactory.value = testFactoryName

    const wrapper = createWrapper()

    const chip = wrapper.findComponent({ name: 'VChip' })
    expect(chip.exists()).toBe(true)
    expect(chip.text()).toBe(testFactoryName)
  })

  it('hides factory chip when no factory is selected', () => {
    mockSelectedFactory.value = ''

    const wrapper = createWrapper()

    const chip = wrapper.findComponent({ name: 'VChip' })
    expect(chip.exists()).toBe(false)
  })

  it('opens import/export modal when button is clicked', async () => {
    const wrapper = createWrapper()

    const buttons = wrapper.findAllComponents({ name: 'VBtn' })
    const importBtn = buttons.find((btn) => btn.text().includes('Import/Export'))

    await importBtn!.trigger('click')

    const modal = wrapper.findComponent({ name: 'ImportExportModal' })
    expect(modal.props('modelValue')).toBe(true)
  })

  it('modal is initially closed', () => {
    const wrapper = createWrapper()

    const modal = wrapper.findComponent({ name: 'ImportExportModal' })
    expect(modal.props('modelValue')).toBe(false)
  })
})
