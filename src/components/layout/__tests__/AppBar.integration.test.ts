import { mount } from '@vue/test-utils'
import { describe, it, beforeEach, vi } from 'vitest'
import { VApp, VLayout, VMain, VChip } from 'vuetify/components'
import AppBar from '@/components/layout/AppBar.vue'
import ImportExportModal from '@/components/modals/ImportExportModal.vue'
import { component, element } from '@/__tests__/vue-test-helpers'
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

    component(wrapper, VChip).assert({ text: testFactoryName })
  })

  it('hides factory chip when no factory is selected', () => {
    mockSelectedFactory.value = ''
    component(createWrapper(), VChip).assert({ exists: false })
  })

  it('opens import/export modal when button is clicked', async () => {
    const wrapper = createWrapper()

    await element(wrapper, '.show-import-export').click()
    component(wrapper, ImportExportModal).assert({ props: { modelValue: true } })
  })

  it('modal is initially closed', () => {
    const wrapper = createWrapper()
    component(wrapper, ImportExportModal).assert({ props: { modelValue: false } })
  })
})
