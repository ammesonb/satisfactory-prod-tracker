import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ExportTab from '@/components/modals/import-export/ExportTab.vue'
import FactorySelector from '@/components/common/FactorySelector.vue'
import {
  expectElementExists,
  expectElementText,
  expectProps,
  getComponentWithText,
} from '@/__tests__/vue-test-helpers'
import type { Factory } from '@/types/factory'
import { mockFactories, mockExportFactories } from '@/__tests__/fixtures/composables/factoryStore'
import { mockExportToClipboard, mockExportToFile } from '@/__tests__/fixtures/composables/dataShare'
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
    expectElementExists(createWrapper(), FactorySelector)
  })

  it('passes correct props to FactorySelector', () => {
    expectProps(createWrapper(), FactorySelector, {
      factories: testFactories,
      title: 'Select Factories to Export',
    })
  })

  it('displays export count correctly for single factory', async () => {
    const wrapper = createWrapper()
    const factorySelector = wrapper.findComponent(FactorySelector)

    await factorySelector.vm.$emit('update:modelValue', [TEST_FACTORIES.IRON])

    expectElementText(wrapper, ExportTab, 'Export 1 Factory')
  })

  it('displays export count correctly for multiple factories', async () => {
    const wrapper = createWrapper()
    const factorySelector = wrapper.findComponent(FactorySelector)

    await factorySelector.vm.$emit('update:modelValue', [
      TEST_FACTORIES.IRON,
      TEST_FACTORIES.COPPER,
    ])

    expectElementText(wrapper, ExportTab, 'Export 2 Factories')
  })

  it('has both export buttons disabled when no factories selected', () => {
    const wrapper = createWrapper()
    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'Clipboard')
    const fileBtn = getComponentWithText(wrapper, VBtn, 'File')

    expect(clipboardBtn?.attributes('disabled')).toBe('')
    expect(fileBtn?.attributes('disabled')).toBe('')
  })

  it('enables export buttons when factories are selected', async () => {
    const wrapper = createWrapper()
    const factorySelector = wrapper.findComponent(FactorySelector)

    await factorySelector.vm.$emit('update:modelValue', [TEST_FACTORIES.IRON])

    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'Clipboard')
    const fileBtn = getComponentWithText(wrapper, VBtn, 'File')

    expect(clipboardBtn?.attributes('disabled')).toBeUndefined()
    expect(fileBtn?.attributes('disabled')).toBeUndefined()
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
    const factorySelector = wrapper.findComponent(FactorySelector)

    await factorySelector.vm.$emit('update:modelValue', [TEST_FACTORIES.IRON])

    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'Clipboard')
    await clipboardBtn?.trigger('click')

    expect(mockExportFactories).toHaveBeenCalledWith([TEST_FACTORIES.IRON])
    expect(mockExportToClipboard).toHaveBeenCalledWith(
      JSON.stringify({ [TEST_FACTORIES.IRON]: testFactories[0] }),
    )
  })

  it('calls exportToFile when file button is clicked', async () => {
    const wrapper = createWrapper()
    const factorySelector = wrapper.findComponent(FactorySelector)

    await factorySelector.vm.$emit('update:modelValue', [TEST_FACTORIES.IRON])

    const fileBtn = getComponentWithText(wrapper, VBtn, 'File')
    await fileBtn?.trigger('click')

    expect(mockExportFactories).toHaveBeenCalledWith([TEST_FACTORIES.IRON])
    expect(mockExportToFile).toHaveBeenCalledWith(
      JSON.stringify({ [TEST_FACTORIES.IRON]: testFactories[0] }),
    )
  })

  it('emits error when exportToClipboard fails', async () => {
    const wrapper = createWrapper()
    const factorySelector = wrapper.findComponent(FactorySelector)

    mockExportToClipboard.mockRejectedValue(new Error('Clipboard error'))

    await factorySelector.vm.$emit('update:modelValue', [TEST_FACTORIES.IRON])

    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'Clipboard')
    await clipboardBtn?.trigger('click')

    expect(wrapper.emitted('error')).toEqual([
      ['Failed to export factories: Error: Clipboard error'],
    ])
  })

  it('emits error when exportToFile fails', async () => {
    const wrapper = createWrapper()
    const factorySelector = wrapper.findComponent(FactorySelector)

    mockExportToFile.mockImplementation(() => {
      throw new Error('File error')
    })

    await factorySelector.vm.$emit('update:modelValue', [TEST_FACTORIES.IRON])

    const fileBtn = getComponentWithText(wrapper, VBtn, 'File')
    await fileBtn?.trigger('click')

    expect(wrapper.emitted('error')).toEqual([['Failed to export factories: Error: File error']])
  })

  it('emits error when factoryStore.exportFactories fails', async () => {
    const wrapper = createWrapper()
    const factorySelector = wrapper.findComponent(FactorySelector)

    mockExportFactories.mockImplementation(() => {
      throw new Error('Export error')
    })

    await factorySelector.vm.$emit('update:modelValue', [TEST_FACTORIES.IRON])

    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'Clipboard')
    await clipboardBtn?.trigger('click')

    expect(wrapper.emitted('error')).toEqual([['Failed to export factories: Error: Export error']])
  })
})
