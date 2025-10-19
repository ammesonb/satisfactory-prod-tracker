import { mockExportToClipboard, mockExportToFile } from '@/__tests__/fixtures/composables/dataShare'
import { mockExportFactories, mockFactories } from '@/__tests__/fixtures/composables/factoryStore'
import { component } from '@/__tests__/vue-test-helpers'
import type { Factory } from '@/types/factory'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import FactorySelector from '@/components/common/FactorySelector.vue'
import ExportTab from '@/components/modals/import-export/ExportTab.vue'
import { VBtn } from 'vuetify/components'

vi.mock('@/composables/useStores', async () => {
  const { mockUseStores } = await import('@/__tests__/fixtures/composables')
  return mockUseStores
})

vi.mock('@/composables/useDataShare', async () => {
  const { mockUseDataShare } = await import('@/__tests__/fixtures/composables')
  return { useDataShare: () => mockUseDataShare }
})

const TEST_FACTORIES = {
  IRON: 'Iron Factory',
  COPPER: 'Copper Factory',
}

describe('ExportTab Integration', () => {
  const testFactories: Factory[] = [
    {
      name: TEST_FACTORIES.IRON,
      icon: 'iron-icon',
      floors: [],
      recipeLinks: {},
    },
    {
      name: TEST_FACTORIES.COPPER,
      icon: 'copper-icon',
      floors: [],
      recipeLinks: {},
    },
  ]

  const createWrapper = () => {
    return mount(ExportTab)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFactories.value = {
      [TEST_FACTORIES.IRON]: testFactories[0],
      [TEST_FACTORIES.COPPER]: testFactories[1],
    }
    mockExportFactories.mockReturnValue({ [TEST_FACTORIES.IRON]: testFactories[0] })
  })

  it('renders with FactorySelector component', () => {
    component(createWrapper(), FactorySelector).assert()
  })

  it('passes correct props to FactorySelector', () => {
    component(createWrapper(), FactorySelector).assert({
      props: {
        factories: testFactories,
        title: 'Select Factories to Export',
      },
    })
  })

  it('displays export count correctly for single factory', async () => {
    const wrapper = createWrapper()
    const selector = await component(wrapper, FactorySelector).emit('update:modelValue', [
      TEST_FACTORIES.IRON,
    ])
    selector.assert({
      props: {
        modelValue: [TEST_FACTORIES.IRON],
      },
    })
    component(wrapper, ExportTab).assert({ text: 'Export 1 Factory' })
  })

  it('displays export count correctly for multiple factories', async () => {
    const wrapper = createWrapper()
    component(wrapper, FactorySelector).emit('update:modelValue', [
      TEST_FACTORIES.IRON,
      TEST_FACTORIES.COPPER,
    ])

    component(wrapper, ExportTab).assert({ text: 'Export 2 Factories' })
  })

  it('has both export buttons disabled when no factories selected', () => {
    const wrapper = createWrapper()
    component(wrapper, VBtn)
      .match((btn) => btn.text().includes('Clipboard'))
      .assert({ exists: true, attributes: { disabled: '' } })
    component(wrapper, VBtn)
      .match((btn) => btn.text().includes('File'))
      .assert({ exists: true, attributes: { disabled: '' } })
  })

  it('enables export buttons when factories are selected', async () => {
    const wrapper = createWrapper()
    await component(wrapper, FactorySelector).emit('update:modelValue', [TEST_FACTORIES.IRON])

    component(wrapper, VBtn)
      .match((btn) => btn.text().includes('Clipboard'))
      .assert({ exists: true, attributes: { disabled: undefined } })
    component(wrapper, VBtn)
      .match((btn) => btn.text().includes('File'))
      .assert({ exists: true, attributes: { disabled: undefined } })
  })

  it('emits error when trying to export without selecting factories', async () => {
    const wrapper = createWrapper()

    // Call the export method directly with empty selection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (wrapper.vm as any).exportFactories(mockExportToClipboard)

    expect(wrapper.emitted('error')).toEqual([['Please select at least one factory to export']])
  })

  it('calls exportToClipboard when clipboard button is clicked', async () => {
    const wrapper = createWrapper()
    await component(wrapper, FactorySelector).emit('update:modelValue', [TEST_FACTORIES.IRON])

    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('Clipboard'))
      .click()

    expect(mockExportFactories).toHaveBeenCalledWith([TEST_FACTORIES.IRON])
    expect(mockExportToClipboard).toHaveBeenCalledWith(
      JSON.stringify({ [TEST_FACTORIES.IRON]: testFactories[0] }),
    )
  })

  it('calls exportToFile when file button is clicked', async () => {
    const wrapper = createWrapper()
    await component(wrapper, FactorySelector).emit('update:modelValue', [TEST_FACTORIES.IRON])

    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('File'))
      .click()

    expect(mockExportFactories).toHaveBeenCalledWith([TEST_FACTORIES.IRON])
    expect(mockExportToFile).toHaveBeenCalledWith(
      JSON.stringify({ [TEST_FACTORIES.IRON]: testFactories[0] }),
    )
  })

  it('emits error when exportToClipboard fails', async () => {
    const wrapper = createWrapper()

    mockExportToClipboard.mockRejectedValue(new Error('Clipboard error'))

    await component(wrapper, FactorySelector).emit('update:modelValue', [TEST_FACTORIES.IRON])

    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('Clipboard'))
      .click()

    expect(wrapper.emitted('error')).toEqual([
      ['Failed to export factories: Error: Clipboard error'],
    ])
  })

  it('emits error when exportToFile fails', async () => {
    const wrapper = createWrapper()

    mockExportToFile.mockImplementation(() => {
      throw new Error('File error')
    })

    await component(wrapper, FactorySelector).emit('update:modelValue', [TEST_FACTORIES.IRON])

    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('File'))
      .click()

    expect(wrapper.emitted('error')).toEqual([['Failed to export factories: Error: File error']])
  })

  it('emits error when factoryStore.exportFactories fails', async () => {
    const wrapper = createWrapper()

    mockExportFactories.mockImplementation(() => {
      throw new Error('Export error')
    })

    await component(wrapper, FactorySelector).emit('update:modelValue', [TEST_FACTORIES.IRON])

    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('Clipboard'))
      .click()

    expect(wrapper.emitted('error')).toEqual([['Failed to export factories: Error: Export error']])
  })
})
